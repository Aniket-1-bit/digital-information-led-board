// Real-Time Airport FIDS DLD Logic Schematic Diagram Renderer
// Visualizes signal flow: MASTER CLOCK -> COUNTER -> MODE DECODER -> MULTIPLEXER -> SHIFT REGISTER -> LED MATRIX / FIDS DISPLAY

export class SchematicView {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
  }

  render(engine) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const ctx = this.ctx;

    // Dark Schematic background
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, width, height);

    // Background schematic grid lines
    ctx.strokeStyle = '#151d30';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Define 74xx IC Block Nodes for Airport FIDS Architecture
    const blocks = [
      { id: 'ic555', label: 'MASTER CLOCK', chip: 'NE555 Oscillator', x: 50, y: 70, w: 150, h: 80, active: engine.clk100Hz === 1 },
      { id: 'ic_sr', label: 'DEBOUNCE LATCH', chip: '74LS00 (SR Latch)', x: 50, y: 220, w: 150, h: 80, active: true },
      { id: 'ic_dff', label: 'RUN / PAUSE LATCH', chip: '74LS74 D Flip-Flop', x: 260, y: 145, w: 150, h: 90, active: engine.runState },
      { id: 'ic_fsm', label: 'FSM CONTROLLER', chip: 'Mode State Machine', x: 470, y: 70, w: 160, h: 90, active: true },
      { id: 'ic_dec', label: 'MODE DECODER', chip: '74LS138 (3-to-8)', x: 470, y: 220, w: 160, h: 90, active: true },
      { id: 'ic_mux', label: 'MULTIPLEXER', chip: '74LS151 (8-to-1 MUX)', x: 680, y: 70, w: 160, h: 90, active: engine.runState },
      { id: 'ic_cnt', label: 'TIMING COUNTER', chip: '74LS90 BCD Counter', x: 680, y: 220, w: 160, h: 90, active: engine.clk1Hz === 1 },
      { id: 'ic_shift', label: 'SHIFT REGISTER', chip: '74HC595 (SIPO Ticker)', x: 890, y: 70, w: 160, h: 90, active: engine.clk4Hz === 1 },
      { id: 'ic_fids', label: 'FIDS DISPLAY', chip: 'Airport LED Matrix', x: 890, y: 220, w: 160, h: 90, active: engine.runState }
    ];

    // Helper: Draw Interconnecting Wires with Glow when active (HIGH=Logic 1, LOW=Logic 0)
    const drawWire = (x1, y1, x2, y2, isActive, color = '#06b6d4', label = '') => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      
      const midX = (x1 + x2) / 2;
      ctx.lineTo(midX, y1);
      ctx.lineTo(midX, y2);
      ctx.lineTo(x2, y2);

      if (isActive) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
      } else {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (label) {
        ctx.fillStyle = isActive ? color : '#64748b';
        ctx.font = '600 10px Inter, sans-serif';
        ctx.fillText(label, midX - 20, (y1 + y2) / 2 - 4);
      }
    };

    // Draw Signal Flow Pathways
    drawWire(200, 110, 260, 170, engine.clk100Hz === 1, '#38bdf8', 'CLK_100Hz');
    drawWire(200, 260, 260, 210, engine.runState, '#eab308', 'ENABLE_Q');
    drawWire(410, 190, 470, 115, engine.runState, '#10b981', 'FSM_EN');
    drawWire(410, 190, 470, 265, engine.runState, '#f43f5e', 'MODE_EN');
    drawWire(630, 115, 680, 115, engine.runState, '#06b6d4', 'MUX_SEL');
    drawWire(630, 265, 680, 265, engine.clk1Hz === 1, '#eab308', 'COUNT_TICK');
    drawWire(840, 115, 890, 115, engine.clk4Hz === 1, '#a855f7', 'SERIAL_DATA');
    drawWire(840, 265, 890, 265, engine.runState, '#10b981', 'DISPLAY_BUS');

    // Draw IC Chips
    blocks.forEach(b => {
      ctx.fillStyle = b.active ? '#1e293b' : '#0f172a';
      ctx.strokeStyle = b.active ? '#06b6d4' : '#334155';
      ctx.lineWidth = 2;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeRect(b.x, b.y, b.w, b.h);

      // Logic state indicator LED dot
      ctx.beginPath();
      ctx.arc(b.x + 16, b.y + 20, 5, 0, Math.PI * 2);
      ctx.fillStyle = b.active ? '#10b981' : '#475569';
      ctx.fill();

      // Chip Title & Subtitle
      ctx.fillStyle = '#f8fafc';
      ctx.font = '700 12px Orbitron, sans-serif';
      ctx.fillText(b.label, b.x + 28, b.y + 24);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '400 11px Inter, sans-serif';
      ctx.fillText(b.chip, b.x + 16, b.y + 48);

      // Signal Logic State (HIGH / LOW)
      ctx.fillStyle = b.active ? '#10b981' : '#64748b';
      ctx.font = '600 10px Inter, sans-serif';
      ctx.fillText(b.active ? 'LOGIC 1 (HIGH)' : 'LOGIC 0 (LOW)', b.x + 16, b.y + 68);
    });
  }
}
