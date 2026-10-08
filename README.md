# Smart Digital Airport Flight Information Display System (Smart FIDS)

> **Digital Logic Design (DLD) Laboratory Project**  
> **Airport:** Jaipur International Airport (JAI)  
> **Platform:** Software-Based Interactive Digital Logic Simulator

![Smart FIDS Preview](./smart_fids_preview.png)

## 📌 Project Overview

The **Smart Digital Airport Flight Information Display System (Smart FIDS)** is an advanced academic Digital Logic Design (DLD) project simulating an electronic flight information board for **Jaipur International Airport (JAI)**. Operating without microcontrollers, the system relies on standard **74xx series Transistor-Transistor Logic (TTL) integrated circuits**, logic gates, flip-flops, decade counters, shift registers, decoders, multiplexers, 555 timer clock oscillators, and finite state machines.

---

## ⚡ Key Features

- **Authentic Electronic Airport FIDS Display:** Large dark electronic board featuring 12 active flight records with bright amber LED typography (`#ffb000`), scanline texture overlay, and color-coded status badges (`ON TIME`, `BOARDING`, `FINAL CALL`, `DELAYED`, `GATE OPEN`, `DEPARTED`).
- **100% Reliable Flight Row Selection:** Interactive rows with hover highlights (`cursor: pointer`). Clicking any flight row instantly populates the persistent **SELECTED FLIGHT** details panel.
- **Working Live Next Departure Countdown:** Real-time decrementing `MM:SS` countdown timer driving flight boarding alerts.
- **5 Operating Modes (74LS151 MUX):** Switchable modes: `ALL FLIGHTS`, `ARRIVALS`, `DEPARTURES`, `BOARDING`, `DELAYED`.
- **Live Search Engine:** Filters flight rows dynamically by Flight Code, Airline, City, Gate, or Status.
- **Scrolling Announcement Ticker (74HC595 Shift Register):** Marquee ticker at the bottom of the board displaying security and boarding announcements.
- **Real-Time DLD Logic Schematic:** Animated block diagram showing signal flow (`MASTER CLOCK ➔ COUNTER ➔ MODE DECODER ➔ MULTIPLEXER ➔ SHIFT REGISTER ➔ FIDS DISPLAY`) with glowing logic levels ($1=\text{HIGH}, 0=\text{LOW}$).
- **Real-Time Digital Signal Monitor:** Oscilloscope visualizer tracing 10 logic signal waveforms.
- **Professional DLD Control Panel:** Includes `START`, `STOP`, `RESET`, `NEXT ANNOUNCEMENT` controls and live internal register inspector.

---

## 🔬 Digital Logic Design (DLD) Component Mapping

| DLD Logic Concept | Hardware/Logic Model | Functional Control in Smart FIDS |
| :--- | :--- | :--- |
| **Logic Gates** | 74LS00, 74LS08, 74LS32 | Form switch debouncers, clock gating, feedback reset logic, and status match decoders. |
| **Multiplexer (MUX)** | 74LS151 (8-to-1 MUX) | Selects which flight data stream (`ALL`, `ARRIVALS`, `DEPARTURES`, `BOARDING`, `DELAYED`) is routed to the display bus. |
| **Decoder** | 74LS138 (3-to-8 Decoder) | Converts 3-bit binary mode selection into active-low display control signals ($Y_0 \dots Y_7$). |
| **Counter** | 74LS90 BCD Counter | Generates timing pulses and countdown sequences for the Next Departure countdown timer. |
| **Flip-Flops** | 74LS74 Dual D-FF | Stores system Run/Pause enable state ($Q=1$ for RUN, $Q=0$ for STOP) and FSM state registers. |
| **Shift Register** | 74HC595 / 74LS164 SIPO | Converts serial text characters into parallel 64-column LED dot patterns for the announcement ticker. |
| **Clock / Timing Circuit** | NE555 Timer IC | Generates master $100\text{ Hz}$ base oscillator pulses, divided down to $4\text{ Hz}$ (shift clock) and $1\text{ Hz}$ (timer tick). |
| **Finite State Machine (FSM)**| FSM State Register | Controls display state transitions: `IDLE` (0), `ALL_FLIGHTS` (1), `ARRIVALS` (2), `DEPARTURES` (3), `BOARDING` (4), `DELAYED` (5), `RESET` (6). |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm

### Installation & Run

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd "dld-smart-notice-board"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:5173/`.

---

## 📁 Project Structure

```
.
├── index.html                # Main HTML5 application structure
├── package.json              # Project dependencies & Vite scripts
├── README.md                 # Project documentation
├── src/
│   ├── main.js               # Main application coordinator
│   ├── style.css             # Airport FIDS electronic theme & CSS rules
│   ├── data/
│   │   ├── flightData.js     # Flight database & announcement strings
│   │   └── fontRom.js        # 5x7 ASCII Dot Matrix Font ROM
│   ├── engine/
│   │   └── FIDSLogicEngine.js # Core DLD logic simulation engine
│   └── renderer/
│       ├── FIDSDisplay.js    # FIDS board renderer & event delegation
│       ├── SchematicView.js  # Real-time animated logic schematic
│       └── WaveformScope.js  # Real-time digital signal monitor
```

---

## 📜 License

Academic Laboratory Project — Designed for Digital Logic Design (DLD) Coursework.
