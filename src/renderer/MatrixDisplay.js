// 8x32 LED Dot Matrix Display Renderer
// Simulates column drivers (74HC595 Shift Registers) and row drivers (74LS138 Decoders)

export class MatrixDisplay {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    
    // Matrix dimensions
    this.rows = 8;
    this.cols = 32;

    // Theme color palettes
    this.themes = {
      amber: { on: '#ffaa00', glow: '#ff7700', off: '#241a05', bg: '#0d0a02' },
      emerald: { on: '#10b981', glow: '#059669', off: '#06291d', bg: '#020d09' },
      cyan: { on: '#06b6d4', glow: '#0284c7', off: '#06232d', bg: '#020b0e' },
      ruby: { on: '#ef4444', glow: '#dc2626', off: '#2b0909', bg: '#0d0202' }
    };
    this.currentTheme = 'amber';
  }

  setTheme(themeName) {
    if (this.themes[themeName]) {
      this.currentTheme = themeName;
    }
  }

  render(matrixColumns, scanRowIndex) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const ctx = this.ctx;
    const palette = this.themes[this.currentTheme];

    // Clear background
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, width, height);

    // Draw Grid & Bezel Frame
    const paddingX = 16;
    const paddingY = 16;
    const gridW = width - paddingX * 2;
    const gridH = height - paddingY * 2;
    const cellW = gridW / this.cols;
    const cellH = gridH / this.rows;
    const radius = Math.min(cellW, cellH) * 0.38;

    // Outer display border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.strokeRect(paddingX - 6, paddingY - 6, gridW + 12, gridH + 12);

    // Draw LED Matrix Diodes
    for (let c = 0; c < this.cols; c++) {
      const colByte = matrixColumns[c] || 0x00;

      for (let r = 0; r < this.rows; r++) {
        // Bit r of column byte determines ON/OFF state (Bit 0 = row 0, Bit 7 = row 7)
        const isOn = (colByte & (1 << r)) !== 0;
        const x = paddingX + c * cellW + cellW / 2;
        const y = paddingY + r * cellH + cellH / 2;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);

        if (isOn) {
          // Glow effect
          ctx.shadowColor = palette.glow;
          ctx.shadowBlur = 10;
          ctx.fillStyle = palette.on;
          ctx.fill();

          // Core highlight
          ctx.beginPath();
          ctx.arc(x - radius * 0.2, y - radius * 0.2, radius * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 0;
          ctx.fill();
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = palette.off;
          ctx.fill();
          
          // Subtle unlit diode ring
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Draw 74LS138 Active Scanline Bar (Hardware Row Scanner indicator)
    if (scanRowIndex !== undefined && scanRowIndex >= 0 && scanRowIndex < 8) {
      const scanY = paddingY + scanRowIndex * cellH + cellH / 2;
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.lineWidth = cellH * 0.8;
      ctx.beginPath();
      ctx.moveTo(paddingX, scanY);
      ctx.lineTo(width - paddingX, scanY);
      ctx.stroke();
    }
  }
}
