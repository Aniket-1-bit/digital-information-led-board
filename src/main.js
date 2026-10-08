// Smart FIDS Main Application Controller
import { FIDSLogicEngine } from './engine/FIDSLogicEngine.js';
import { FIDSDisplay } from './renderer/FIDSDisplay.js';
import { WaveformScope } from './renderer/WaveformScope.js';
import { SchematicView } from './renderer/SchematicView.js';

document.addEventListener('DOMContentLoaded', () => {
  // Instantiate Logic Engine
  const engine = new FIDSLogicEngine();

  // Instantiate Renderers
  const marqueeCanvas = document.getElementById('marqueeCanvas');
  
  const fidsDisplay = new FIDSDisplay({
    boardContainer: document.getElementById('fidsTableContainer'),
    modalContainer: document.getElementById('flightDetailsContainer'),
    countdownContainer: document.getElementById('nextDepartureContainer'),
    statsContainer: document.getElementById('statsContainer'),
    marqueeCanvas: marqueeCanvas,
    onSelectFlight: (id) => {
      engine.selectedFlightId = id;
      updateFlightViews();
    }
  });

  const scopeCanvas = document.getElementById('scopeCanvas');
  const scopeRenderer = new WaveformScope(scopeCanvas);

  const schematicCanvas = document.getElementById('schematicCanvas');
  const schematicRenderer = new SchematicView(schematicCanvas);

  // Tab Switcher Logic
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.fids-tab-content');

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');
      navTabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(targetId)?.classList.add('active');
    });
  });

  // Mode Filter Buttons (Action Bar & Control Panel)
  const filterBtns = document.querySelectorAll('.filter-btn');
  const modeBtns = document.querySelectorAll('.mode-btn');

  const setAppMode = (mode) => {
    engine.setMode(mode);

    filterBtns.forEach(b => {
      const bMode = parseInt(b.getAttribute('data-mode'), 10);
      b.classList.toggle('active', bMode === mode);
    });

    modeBtns.forEach(b => {
      const bMode = parseInt(b.getAttribute('data-mode'), 10);
      b.classList.toggle('active', bMode === mode);
    });

    updateFlightViews();
  };

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = parseInt(btn.getAttribute('data-mode'), 10);
      setAppMode(mode);
    });
  });

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = parseInt(btn.getAttribute('data-mode'), 10);
      setAppMode(mode);
    });
  });

  // Search Input Binding
  const searchInput = document.getElementById('flightSearchInput');
  searchInput?.addEventListener('input', (e) => {
    engine.setSearchQuery(e.target.value);
    updateFlightViews();
  });

  // Master Operations Buttons
  document.getElementById('btnStart')?.addEventListener('click', () => engine.triggerStart());
  document.getElementById('btnStop')?.addEventListener('click', () => engine.triggerStop());
  document.getElementById('btnReset')?.addEventListener('click', () => engine.triggerReset());
  document.getElementById('btnNextAnnounce')?.addEventListener('click', () => engine.nextAnnouncement());

  // Speed Slider
  const speedSlider = document.getElementById('speedSlider');
  const speedValText = document.getElementById('speedValText');
  speedSlider?.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    engine.masterFreq = val;
    if (speedValText) speedValText.textContent = `${val} Hz`;
  });

  // Live Header Clock
  const liveDate = document.getElementById('liveDate');
  const liveTime = document.getElementById('liveTime');

  function updateHeaderClock() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'SHORT', year: 'numeric' }).toUpperCase();
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });

    if (liveDate) liveDate.textContent = dateStr;
    if (liveTime) liveTime.textContent = timeStr;
  }
  setInterval(updateHeaderClock, 1000);
  updateHeaderClock();

  // Update Flight Board & Sidebar Data
  function updateFlightViews() {
    const filteredFlights = engine.getFilteredFlights();

    // Re-verify selected flight exists in array
    let selectedFlight = engine.flights.find(f => f.id === engine.selectedFlightId);
    if (!selectedFlight && engine.flights.length > 0) {
      selectedFlight = engine.flights[0];
      engine.selectedFlightId = selectedFlight.id;
    }

    const nextDepFlight = engine.getNextDepartureFlight();

    fidsDisplay.renderFlightBoard(filteredFlights, engine.selectedFlightId);
    fidsDisplay.renderFlightDetails(selectedFlight);
    fidsDisplay.renderNextDeparture(nextDepFlight, engine.countdownSeconds);
    fidsDisplay.renderAirportStats(engine.flights);
  }

  // Update Internal DLD Control Panel Registers Inspector
  function updateRegisterInspector() {
    const r = engine.registers;
    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setTxt('regClockState', engine.runState ? `${engine.masterFreq} Hz ACTIVE` : 'GATED OFF (0Hz)');
    setTxt('regCounterVal', `${String(r.counterValue).padStart(4, '0')} s`);
    setTxt('regMuxSelect', `${r.muxSelect} (Mode ${engine.mode})`);
    setTxt('regDecoderOut', r.decoderOutput);
    setTxt('regShiftByte', `0x${r.shiftRegisterByte.toString(16).toUpperCase().padStart(2, '0')}`);
    setTxt('regFsmState', r.fsmStateName);
    setTxt('regDisplayEn', r.displayEnable === 1 ? '1 (HIGH)' : '0 (LOW)');
  }

  // Animation Loop (60 FPS)
  let lastTime = performance.now();

  function animate(now) {
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    // Tick DLD logic simulation engine
    engine.tick(dt);

    // Render announcement ticker marquee
    fidsDisplay.renderAnnouncementMarquee(engine.matrixColumns);

    // Update countdown timer rendering
    const nextDepFlight = engine.getNextDepartureFlight();
    fidsDisplay.renderNextDeparture(nextDepFlight, engine.countdownSeconds);

    // Render Active Tab Visualizers
    const activeTab = document.querySelector('.fids-tab-content.active');
    if (activeTab?.id === 'tab-scope') {
      scopeRenderer.render(engine.signalHistory);
    } else if (activeTab?.id === 'tab-schematic') {
      schematicRenderer.render(engine);
    } else if (activeTab?.id === 'tab-controls') {
      updateRegisterInspector();
    }

    requestAnimationFrame(animate);
  }

  updateFlightViews();
  requestAnimationFrame(animate);
});
