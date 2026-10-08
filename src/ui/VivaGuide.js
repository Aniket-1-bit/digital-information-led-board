// Academic Viva Voce Study & IC Pinout Inspector Module

export const VIVA_QUESTIONS = [
  {
    question: "1. Why are Shift Registers (74HC595) used instead of driving LED columns directly?",
    answer: "An 8x32 LED dot matrix has 256 individual LEDs (32 columns x 8 rows). Driving columns directly requires 32 GPIO lines or massive parallel wiring. Shift registers perform Serial-in Parallel-out (SIPO) conversion, allowing us to drive 32 columns using just 3 control lines: Serial Data (DS), Shift Clock (SH_CP), and Latch Clock (ST_CP)."
  },
  {
    question: "2. How does the Modulo-60 Counter reset at count 60 in Digital Clock mode?",
    answer: "The tens digit counter (74LS90 BCD counter) counts 0 to 5. Binary count 6 is represented as '0110' (Q3 Q2 Q1 Q0). A 2-input NAND gate (74LS00) monitors Q2 and Q1. The moment count 6 is reached, Q2=1 and Q1=1, causing the NAND gate output to go LOW (Logic 0). This LOW pulse triggers the active-LOW Master Reset (CLR) pins of both units, resetting the count to 00 in nanoseconds."
  },
  {
    question: "3. What is the role of the 74LS151 Multiplexer in this notice board project?",
    answer: "The 74LS151 is an 8-to-1 Multiplexer controlled by a 3-bit binary mode select input (M2, M1, M0). Depending on the select code (000 to 100), it steers the appropriate data stream (Welcome text, Notice text, Student Info, Counter BCD, or Clock BCD) to the display bus while isolating unselected inputs."
  },
  {
    question: "4. Why is hardware debouncing needed on the pushbuttons?",
    answer: "Mechanical switch contacts bounce for 5 to 10 milliseconds upon being pressed or released. Without debouncing, a single press of the MANUAL PULSE button would trigger dozens of false clock edges. We use cross-coupled NAND gates (SR Latch) or D Flip-Flops to latch the logic state on the first electrical contact transition, filtering out mechanical bounce."
  },
  {
    question: "5. How does the 74LS138 Row Decoder perform display multiplexing?",
    answer: "The 74LS138 is a 3-to-8 Line Decoder. Rather than illuminating all 8 matrix rows simultaneously (which consumes excessive power), it scans row 0 through row 7 sequentially at high speed (>60Hz). Due to Persistence of Vision (POV), the human eye perceives a continuous flicker-free display."
  },
  {
    question: "6. Explain the difference between Start, Stop, and Reset controls in terms of DLD logic.",
    answer: "Start sets the D Flip-Flop Q output to Logic 1, opening the clock gate (AND gate) to feed pulses to counters and shift registers. Stop resets Q to Logic 0, gating OFF the clock without altering register contents (PAUSE). Reset sends an asynchronous active-LOW CLEAR pulse to all counters and shift registers, restoring state to 0."
  }
];

export const IC_PINOUTS = {
  '74HC595': {
    title: '74HC595 - 8-Bit SIPO Shift Register',
    pins: [
      { num: 1, name: 'QB', desc: 'Parallel Data Output Bit 1' },
      { num: 2, name: 'QC', desc: 'Parallel Data Output Bit 2' },
      { num: 3, name: 'QD', desc: 'Parallel Data Output Bit 3' },
      { num: 4, name: 'QE', desc: 'Parallel Data Output Bit 4' },
      { num: 5, name: 'QF', desc: 'Parallel Data Output Bit 5' },
      { num: 6, name: 'QG', desc: 'Parallel Data Output Bit 6' },
      { num: 7, name: 'QH', desc: 'Parallel Data Output Bit 7' },
      { num: 8, name: 'GND', desc: 'Ground (0V)' },
      { num: 9, name: 'QH\'', desc: 'Serial Data Output (Cascading)' },
      { num: 10, name: 'SRCLR', desc: 'Shift Register Clear (Active Low)' },
      { num: 11, name: 'SRCLK', desc: 'Shift Register Clock Input' },
      { num: 12, name: 'RCLK', desc: 'Register Latch Clock Input' },
      { num: 13, name: 'OE', desc: 'Output Enable (Active Low)' },
      { num: 14, name: 'SER', desc: 'Serial Data Input (DS)' },
      { num: 15, name: 'QA', desc: 'Parallel Data Output Bit 0' },
      { num: 16, name: 'VCC', desc: 'Power Supply (+5V)' }
    ]
  },
  '74LS151': {
    title: '74LS151 - 8-to-1 Line Data Multiplexer',
    pins: [
      { num: 1, name: 'D3', desc: 'Data Input 3' },
      { num: 2, name: 'D2', desc: 'Data Input 2' },
      { num: 3, name: 'D1', desc: 'Data Input 1' },
      { num: 4, name: 'D0', desc: 'Data Input 0' },
      { num: 5, name: 'Y', desc: 'Multiplexed Output' },
      { num: 6, name: 'W', desc: 'Inverted Output (Active Low)' },
      { num: 7, name: 'G', desc: 'Strobe / Enable (Active Low)' },
      { num: 8, name: 'GND', desc: 'Ground' },
      { num: 9, name: 'C', desc: 'Select Input MSB (S2 / M2)' },
      { num: 10, name: 'B', desc: 'Select Input Bit 1 (S1 / M1)' },
      { num: 11, name: 'A', desc: 'Select Input LSB (S0 / M0)' },
      { num: 12, name: 'D7', desc: 'Data Input 7' },
      { num: 13, name: 'D6', desc: 'Data Input 6' },
      { num: 14, name: 'D5', desc: 'Data Input 5' },
      { num: 15, name: 'D4', desc: 'Data Input 4' },
      { num: 16, name: 'VCC', desc: 'Power Supply (+5V)' }
    ]
  },
  '74LS90': {
    title: '74LS90 - Decade BCD Counter',
    pins: [
      { num: 1, name: 'CLKB', desc: 'Clock Input B (Mod-5 section)' },
      { num: 2, name: 'R0(1)', desc: 'Reset to 0 (Active High)' },
      { num: 3, name: 'R0(2)', desc: 'Reset to 0 (Active High)' },
      { num: 4, name: 'NC', desc: 'No Connection' },
      { num: 5, name: 'VCC', desc: 'Power Supply (+5V)' },
      { num: 6, name: 'R9(1)', desc: 'Reset to 9 (Active High)' },
      { num: 7, name: 'R9(2)', desc: 'Reset to 9 (Active High)' },
      { num: 8, name: 'QC', desc: 'BCD Output Bit 2' },
      { num: 9, name: 'QB', desc: 'BCD Output Bit 1' },
      { num: 10, name: 'GND', desc: 'Ground' },
      { num: 11, name: 'QD', desc: 'BCD Output Bit 3 (MSB)' },
      { num: 12, name: 'QA', desc: 'BCD Output Bit 0 (LSB)' },
      { num: 13, name: 'NC', desc: 'No Connection' },
      { num: 14, name: 'CLKA', desc: 'Clock Input A (Mod-2 section)' }
    ]
  }
};
