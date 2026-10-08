// Real-Time Digital Signal Monitor (Digital Oscilloscope)
// Visualizes DLD logic waveforms for FIDS operation

export class WaveformScope {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
  }

  render(signalHistory) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const ctx = this.ctx;

    // Dark oscilloscope grid background
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, width, height);

    // Oscilloscope grid lines
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
    ctx.lineWidth = 1;
    const gridCols = 10;

    for (let c = 1; c < gridCols; c++) {
      const x = (width / gridCols) * c;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    const channelNames = [
      { key: 'clkMaster', label: 'MASTER CLOCK (555 Oscillator)', color: '#38bdf8' },
      { key: 'clkDisplay', label: 'DISPLAY CLOCK (Run Enable)', color: '#10b981' },
      { key: 'clkShift', label: 'SHIFT CLOCK (Marquee SIPO)', color: '#a855f7' },
      { key: 'clkCounter', label: 'COUNTER OUTPUT (1Hz Tick)', color: '#eab308' },
      { key: 'muxSelectBit', label: 'MUX SELECT (M0 Bit)', color: '#06b6d4' },
      { key: 'decoderActiveBit', label: 'DECODER OUTPUT (Y0 Active)', color: '#f43f5e' },
      { key: 'shiftDataBit', label: 'SHIFT REGISTER (Serial In)', color: '#ec4899' },
      { key: 'displayEnableBit', label: 'DISPLAY ENABLE (Flip-Flop Q)', color: '#84cc16' },
      { key: 'resetPulse', label: 'RESET / NAND RESET (Clear)', color: '#ef4444' },
      { key: 'fsmStateVal', label: 'FSM STATE (Current State)', color: '#6366f1' }
    ];

    const channelHeight = height / channelNames.length;

    channelNames.forEach((ch, idx) => {
      const history = signalHistory[ch.key] || [];
      const baseY = (idx + 1) * channelHeight - 6;
      const waveAmp = channelHeight * 0.55;

      // Channel divider line
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.moveTo(0, idx * channelHeight);
      ctx.lineTo(width, idx * channelHeight);
      ctx.stroke();

      // Channel label
      ctx.fillStyle = ch.color;
      ctx.font = '600 10px Inter, sans-serif';
      ctx.fillText(ch.label, 10, idx * channelHeight + 12);

      // Render digital step square waveform
      if (history.length > 1) {
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = ch.color;
        ctx.shadowBlur = 4;

        ctx.beginPath();
        const stepX = width / 60;

        for (let i = 0; i < history.length; i++) {
          const val = history[i];
          const x = i * stepX;
          const y = val > 0 ? baseY - waveAmp : baseY;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            const prevVal = history[i - 1];
            const prevY = prevVal > 0 ? baseY - waveAmp : baseY;
            ctx.lineTo(x, prevY);
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    });
  }
}
