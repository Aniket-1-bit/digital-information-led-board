// Digital Logic Design (DLD) Engine
// Models 555 Timer, SR Latches, D-FFs, 74LS90 Counters, NAND Reset, 74LS151 MUX, 74HC595 Shift Registers

import { DEFAULT_ROM_MESSAGES, stringToColumnMatrix, BCD_7SEG_DECODER } from '../data/fontRom.js';

export class DLDLogicEngine {
  constructor() {
    // Control Switch States
    this.mode = 0; // Mode 0..4 (M2, M1, M0)
    this.runState = true; // Q output of D Flip-Flop (RUN=1, PAUSE=0)
    this.resetActive = false; // CLR line

    // Clock Engine Parameters
    this.masterFreq = 60; // Hz
    this.scrollSpeedDivider = 6; // 60Hz / 6 = 10Hz scroll rate
    this.clockSpeedDivider = 60; // 60Hz / 60 = 1Hz clock rate

    // Sub-system Timers & Counters
    this.masterPulseCounter = 0;
    this.clk100Hz = 0;
    this.clk4Hz = 0;
    this.clk1Hz = 0;

    // Shift Register Column Buffer for Text Modes
    this.customMessages = { ...DEFAULT_ROM_MESSAGES };
    this.activeColumnMatrix = [];
    this.scrollOffset = 0;

    // Digital Counter (Mode 3) - 74LS90 BCD Cascaded (00 - 99)
    this.counterVal = 0;

    // Digital Clock (Mode 4) - Cascaded Mod-60 Counters
    this.clockHours = 10;
    this.clockMinutes = 45;
    this.clockSeconds = 0;
    this.mod60ResetPulse = false; // Visual indicator for NAND Gate trigger

    // Active Display Data Bus
    this.matrixColumns = new Array(32).fill(0x00); // 8x32 LED Matrix (32 column bytes)
    this.sevenSegDigits = [0, 0, 0, 0, 0, 0]; // 6 Digits for 7-Segment display (HHMMSS or 000099)
    this.scanRow = 0; // 74LS138 row scan index (0..7)

    // Signals for Waveform Scope
    this.signalHistory = {
      clkMaster: [],
      clkScroll: [],
      clkSeconds: [],
      runLatch: [],
      nandReset: []
    };

    this.rebuildColumnMatrix();
  }

  setMode(newMode) {
    this.mode = Math.max(0, Math.min(4, newMode));
    this.scrollOffset = 0;
    this.rebuildColumnMatrix();
  }

  setCustomMessage(modeIndex, messageText) {
    if (modeIndex >= 0 && modeIndex <= 2 && messageText.trim().length > 0) {
      this.customMessages[modeIndex] = messageText.toUpperCase();
      if (this.mode === modeIndex) {
        this.scrollOffset = 0;
        this.rebuildColumnMatrix();
      }
    }
  }

  rebuildColumnMatrix() {
    const text = this.customMessages[this.mode] || DEFAULT_ROM_MESSAGES[0];
    this.activeColumnMatrix = stringToColumnMatrix(text);
  }

  triggerStart() {
    // D Flip-Flop SET action: Q = 1
    this.runState = true;
  }

  triggerStop() {
    // D Flip-Flop RESET action: Q = 0 (Clock Gated off)
    this.runState = false;
  }

  triggerReset() {
    // Master CLR pulse
    this.resetActive = true;
    this.counterVal = 0;
    this.scrollOffset = 0;
    this.clockSeconds = 0;
    setTimeout(() => {
      this.resetActive = false;
    }, 100);
  }

  manualCounterPulse() {
    if (this.resetActive) return;
    // Manual clock pulse to 74LS90 counter
    this.counterVal = (this.counterVal + 1) % 100;
  }

  // Simulation Tick (called on requestAnimationFrame or 60Hz loop)
  tick(dt) {
    this.masterPulseCounter++;

    // Toggle 100Hz Master Clock signal (555 Astable)
    this.clk100Hz = (this.masterPulseCounter % 2 === 0) ? 1 : 0;

    // Mod-60 Reset signal default LOW
    this.mod60ResetPulse = false;

    if (this.runState && !this.resetActive) {
      // 1. Scroll Clock (4Hz / 10Hz)
      if (this.masterPulseCounter % this.scrollSpeedDivider === 0) {
        this.clk4Hz = 1;
        this.stepShiftRegister();
      } else {
        this.clk4Hz = 0;
      }

      // 2. Real-Time Clock & Counter Clock (1Hz)
      if (this.masterPulseCounter % this.clockSpeedDivider === 0) {
        this.clk1Hz = 1;
        this.stepDigitalClock();
        if (this.mode === 3) {
          // Auto increment in Counter mode if running
          this.counterVal = (this.counterVal + 1) % 100;
        }
      } else {
        this.clk1Hz = 0;
      }
    }

    // 3. 74LS138 Row Decoder Scanning (Scans row 0..7 constantly for display refresh)
    this.scanRow = (this.masterPulseCounter) % 8;

    // 4. Multiplexer Routing (74LS151) based on active Mode
    this.updateMultiplexerOutputs();

    // 5. Log signals for waveform visualization
    this.logWaveforms();
  }

  stepShiftRegister() {
    if (this.activeColumnMatrix.length === 0) return;
    this.scrollOffset = (this.scrollOffset + 1) % this.activeColumnMatrix.length;
  }

  stepDigitalClock() {
    this.clockSeconds++;
    
    // Check 74LS90 Modulo-60 NAND Gate Reset logic (Reset seconds at 60)
    // 60 in BCD = Tens digit 6 (0110 in binary). NAND gate checks Q2 & Q1 = 1.
    if (this.clockSeconds >= 60) {
      this.clockSeconds = 0;
      this.mod60ResetPulse = true;
      this.clockMinutes++;

      if (this.clockMinutes >= 60) {
        this.clockMinutes = 0;
        this.clockHours = (this.clockHours + 1) % 24;
      }
    }
  }

  updateMultiplexerOutputs() {
    // 74LS151 MUX Data Routing
    if (this.mode <= 2) {
      // Modes 0, 1, 2: Text Marquee Modes on 8x32 LED Matrix
      for (let c = 0; c < 32; c++) {
        const matrixIdx = (this.scrollOffset + c) % this.activeColumnMatrix.length;
        this.matrixColumns[c] = this.activeColumnMatrix[matrixIdx] || 0x00;
      }

      // 7-Segment displays show Mode Label or Blank
      const modeLabel = `  0${this.mode}  `;
      this.sevenSegDigits = [0, this.mode + 1, 11, 11, 0, 0];
    } else if (this.mode === 3) {
      // Mode 3: Digital Counter (00 - 99)
      const tens = Math.floor(this.counterVal / 10);
      const units = this.counterVal % 10;
      
      this.sevenSegDigits = [11, 11, tens, units, 11, 11];

      // Convert BCD Counter digits to matrix graphics for dot matrix as well!
      this.renderCounterToMatrix(this.counterVal);
    } else if (this.mode === 4) {
      // Mode 4: Digital Clock (HH:MM:SS)
      const hTens = Math.floor(this.clockHours / 10);
      const hUnits = this.clockHours % 10;
      const mTens = Math.floor(this.clockMinutes / 10);
      const mUnits = this.clockMinutes % 10;
      const sTens = Math.floor(this.clockSeconds / 10);
      const sUnits = this.clockSeconds % 10;

      this.sevenSegDigits = [hTens, hUnits, mTens, mUnits, sTens, sUnits];

      // Render Clock time to LED Matrix as well
      const timeStr = `${String(this.clockHours).padStart(2, '0')}:${String(this.clockMinutes).padStart(2, '0')}:${String(this.clockSeconds).padStart(2, '0')}`;
      const cols = stringToColumnMatrix(timeStr);
      for (let c = 0; c < 32; c++) {
        this.matrixColumns[c] = cols[c + 8] || 0x00;
      }
    }
  }

  renderCounterToMatrix(val) {
    const str = `COUNT: ${String(val).padStart(2, '0')}`;
    const cols = stringToColumnMatrix(str);
    for (let c = 0; c < 32; c++) {
      this.matrixColumns[c] = cols[c + 8] || 0x00;
    }
  }

  logWaveforms() {
    const maxLen = 60;
    this.signalHistory.clkMaster.push(this.clk100Hz);
    this.signalHistory.clkScroll.push(this.clk4Hz);
    this.signalHistory.clkSeconds.push(this.clk1Hz);
    this.signalHistory.runLatch.push(this.runState ? 1 : 0);
    this.signalHistory.nandReset.push(this.mod60ResetPulse ? 1 : 0);

    for (const key in this.signalHistory) {
      if (this.signalHistory[key].length > maxLen) {
        this.signalHistory[key].shift();
      }
    }
  }
}
