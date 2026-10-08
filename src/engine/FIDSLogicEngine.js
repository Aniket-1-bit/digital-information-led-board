// Smart FIDS Digital Logic Design Engine
// Simulates 555 Timer, D Flip-Flops, 74LS151 MUX, 74LS138 Decoder, 74LS90 Counters, 74HC595 Shift Register, and FSM State Machine

import { INITIAL_FLIGHTS, AIRPORT_ANNOUNCEMENTS } from '../data/flightData.js';
import { stringToColumnMatrix } from '../data/fontRom.js';

export const FSM_STATES = {
  0: 'IDLE',
  1: 'ALL_FLIGHTS',
  2: 'ARRIVALS',
  3: 'DEPARTURES',
  4: 'BOARDING',
  5: 'DELAYED',
  6: 'RESET'
};

export class FIDSLogicEngine {
  constructor() {
    // Master Hardware Controls
    this.runState = true; // Q output of D Flip-Flop (1=RUN, 0=PAUSE)
    this.resetActive = false; // CLR active pulse

    // Mode Selector (M2, M1, M0)
    this.mode = 0; // Mode 0..4

    // Finite State Machine (FSM)
    this.fsmState = 1; // Default state: ALL_FLIGHTS

    // Clock Signals
    this.masterFreq = 60; // Hz base animation clock
    this.masterPulseCounter = 0;

    // Derived Logic Clocks
    this.clk100Hz = 0; // 555 Timer output
    this.clk4Hz = 0;   // Shift Register marquee clock
    this.clk1Hz = 0;   // Counter / Countdown tick clock

    // Countdown Timer (Next Departure Countdown: e.g. 8 mins 32 secs = 512 seconds)
    this.countdownSeconds = 512; 
    this.mod60ResetPulse = false;

    // Shift Register Announcement Marquee (74HC595)
    this.announcementIdx = 0;
    this.announcements = [...AIRPORT_ANNOUNCEMENTS];
    this.marqueeMatrix = [];
    this.marqueeOffset = 0;
    this.matrixColumns = new Array(64).fill(0x00); // 64 columns for announcement bar

    // Search & Filter state
    this.searchQuery = '';
    this.selectedFlightId = 'F1'; // Default selected flight row

    // Simulated Flight Database
    this.flights = JSON.parse(JSON.stringify(INITIAL_FLIGHTS));

    // Internal DLD Logic Register Signals (for Live DLD Control Panel Inspector)
    this.registers = {
      muxSelect: '000',
      decoderOutput: '11111110', // Active-low Y0 active
      counterValue: 0,
      shiftRegisterByte: 0x00,
      displayEnable: 1,
      fsmStateName: 'ALL_FLIGHTS'
    };

    // Signal History for Real-Time Oscilloscope / Signal Monitor
    this.signalHistory = {
      clkMaster: [],
      clkDisplay: [],
      clkShift: [],
      clkCounter: [],
      muxSelectBit: [],
      decoderActiveBit: [],
      shiftDataBit: [],
      displayEnableBit: [],
      resetPulse: [],
      fsmStateVal: []
    };

    this.rebuildMarqueeMatrix();
  }

  setMode(newMode) {
    this.mode = Math.max(0, Math.min(4, newMode));
    
    // FSM State transition
    switch (this.mode) {
      case 0: this.fsmState = 1; break; // ALL_FLIGHTS
      case 1: this.fsmState = 2; break; // ARRIVALS
      case 2: this.fsmState = 3; break; // DEPARTURES
      case 3: this.fsmState = 4; break; // BOARDING
      case 4: this.fsmState = 5; break; // DELAYED
      default: this.fsmState = 1; break;
    }

    this.updateLogicRegisters();
  }

  setSearchQuery(query) {
    this.searchQuery = query.trim().toLowerCase();
  }

  rebuildMarqueeMatrix() {
    const text = this.announcements[this.announcementIdx] || AIRPORT_ANNOUNCEMENTS[0];
    this.marqueeMatrix = stringToColumnMatrix(text);
    this.marqueeOffset = 0;
  }

  nextAnnouncement() {
    this.announcementIdx = (this.announcementIdx + 1) % this.announcements.length;
    this.rebuildMarqueeMatrix();
  }

  triggerStart() {
    this.runState = true;
    if (this.fsmState === 0) this.fsmState = this.mode + 1;
    this.updateLogicRegisters();
  }

  triggerStop() {
    this.runState = false;
    this.updateLogicRegisters();
  }

  triggerReset() {
    this.resetActive = true;
    this.countdownSeconds = 512;
    this.marqueeOffset = 0;
    this.fsmState = 6; // RESET state
    this.updateLogicRegisters();

    setTimeout(() => {
      this.resetActive = false;
      this.fsmState = this.mode + 1;
      this.updateLogicRegisters();
    }, 200);
  }

  // Logic Simulation Step (called 60 times per second)
  tick(dt) {
    this.masterPulseCounter++;

    // 1. 555 Oscillator Master Clock Pulse (100Hz simulation)
    this.clk100Hz = (this.masterPulseCounter % 2 === 0) ? 1 : 0;
    this.mod60ResetPulse = false;

    if (this.runState && !this.resetActive) {
      // 2. 74HC595 Shift Register Clock Pulse (4Hz marquee scroll)
      if (this.masterPulseCounter % 6 === 0) {
        this.clk4Hz = 1;
        this.stepShiftRegister();
      } else {
        this.clk4Hz = 0;
      }

      // 3. 74LS90 Counter & Countdown Clock Pulse (1Hz tick)
      if (this.masterPulseCounter % 60 === 0) {
        this.clk1Hz = 1;
        this.stepCountdownTimer();
      } else {
        this.clk1Hz = 0;
      }
    } else {
      this.clk4Hz = 0;
      this.clk1Hz = 0;
    }

    // 4. Update MUX & Decoder Data Registers
    this.updateLogicRegisters();

    // 5. Log Signal Waveforms for Digital Oscilloscope
    this.logWaveforms();
  }

  stepShiftRegister() {
    if (this.marqueeMatrix.length === 0) return;
    this.marqueeOffset = (this.marqueeOffset + 1) % this.marqueeMatrix.length;

    // Shift 64 column bytes into matrix buffer
    for (let c = 0; c < 64; c++) {
      const idx = (this.marqueeOffset + c) % this.marqueeMatrix.length;
      this.matrixColumns[c] = this.marqueeMatrix[idx] || 0x00;
    }

    this.registers.shiftRegisterByte = this.matrixColumns[0] || 0x00;
  }

  stepCountdownTimer() {
    if (this.countdownSeconds > 0) {
      this.countdownSeconds--;
    } else {
      this.countdownSeconds = 600; // Reset to 10 mins
      this.mod60ResetPulse = true;
    }

    // Dynamic flight status progression simulation
    if (this.masterPulseCounter % 1800 === 0) { // Every 30s
      this.randomlyUpdateFlightStatus();
    }
  }

  randomlyUpdateFlightStatus() {
    const mutableFlights = this.flights.filter(f => f.status !== 'DEPARTED');
    if (mutableFlights.length > 0) {
      const target = mutableFlights[Math.floor(Math.random() * mutableFlights.length)];
      if (target.status === 'ON TIME') target.status = 'BOARDING';
      else if (target.status === 'BOARDING') target.status = 'FINAL CALL';
      else if (target.status === 'FINAL CALL') target.status = 'GATE OPEN';
    }
  }

  updateLogicRegisters() {
    // MUX 74LS151 3-bit binary representation
    const modeBinary = this.mode.toString(2).padStart(3, '0');
    this.registers.muxSelect = modeBinary;

    // Decoder 74LS138 3-to-8 active-low output
    const decActive = ~(1 << this.mode) & 0xFF;
    this.registers.decoderOutput = decActive.toString(2).padStart(8, '0');

    this.registers.counterValue = this.countdownSeconds;
    this.registers.displayEnable = (this.runState && !this.resetActive) ? 1 : 0;
    this.registers.fsmStateName = FSM_STATES[this.fsmState] || 'IDLE';
  }

  // Filter flights based on active MUX mode and Search Query
  getFilteredFlights() {
    return this.flights.filter(flight => {
      // 1. MUX Mode Filter
      let passMode = true;
      if (this.mode === 1) passMode = (flight.type === 'ARRIVAL');
      else if (this.mode === 2) passMode = (flight.type === 'DEPARTURE');
      else if (this.mode === 3) passMode = (flight.status === 'BOARDING' || flight.status === 'FINAL CALL');
      else if (this.mode === 4) passMode = (flight.status === 'DELAYED');

      // 2. Search Filter
      let passSearch = true;
      if (this.searchQuery) {
        const q = this.searchQuery;
        passSearch = flight.flightNo.toLowerCase().includes(q) ||
                     flight.airline.toLowerCase().includes(q) ||
                     flight.from.toLowerCase().includes(q) ||
                     flight.to.toLowerCase().includes(q) ||
                     flight.gate.toLowerCase().includes(q) ||
                     flight.status.toLowerCase().includes(q);
      }

      return passMode && passSearch;
    });
  }

  // Next departure flight for live countdown widget
  getNextDepartureFlight() {
    const departures = this.flights.filter(f => f.type === 'DEPARTURE' || f.status === 'BOARDING');
    return departures[0] || this.flights[0];
  }

  logWaveforms() {
    const maxLen = 60;
    this.signalHistory.clkMaster.push(this.clk100Hz);
    this.signalHistory.clkDisplay.push(this.runState ? 1 : 0);
    this.signalHistory.clkShift.push(this.clk4Hz);
    this.signalHistory.clkCounter.push(this.clk1Hz);
    this.signalHistory.muxSelectBit.push((this.mode & 1) ? 1 : 0);
    this.signalHistory.decoderActiveBit.push((this.mode === 0) ? 1 : 0);
    this.signalHistory.shiftDataBit.push(this.registers.shiftRegisterByte > 0 ? 1 : 0);
    this.signalHistory.displayEnableBit.push(this.runState ? 1 : 0);
    this.signalHistory.resetPulse.push(this.resetActive || this.mod60ResetPulse ? 1 : 0);
    this.signalHistory.fsmStateVal.push(this.fsmState / 6);

    for (const key in this.signalHistory) {
      if (this.signalHistory[key].length > maxLen) {
        this.signalHistory[key].shift();
      }
    }
  }
}
