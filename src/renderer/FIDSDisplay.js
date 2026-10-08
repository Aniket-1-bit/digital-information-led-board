// Airport Flight Information Display System (FIDS) Renderer
// Handles authentic electronic FIDS flight board, event delegation for reliable row selection, persistent details panel, and countdown timer

export class FIDSDisplay {
  constructor(options) {
    this.boardContainer = options.boardContainer;
    this.modalContainer = options.modalContainer;
    this.countdownContainer = options.countdownContainer;
    this.statsContainer = options.statsContainer;
    this.marqueeCanvas = options.marqueeCanvas;
    this.onSelectFlight = options.onSelectFlight || (() => {});

    this.initMarqueeCanvas();
    this.bindEvents();
  }

  initMarqueeCanvas() {
    if (this.marqueeCanvas) {
      this.marqueeCtx = this.marqueeCanvas.getContext('2d');
    }
  }

  // Reliable Event Delegation for Row Selection
  bindEvents() {
    if (this.boardContainer) {
      this.boardContainer.addEventListener('click', (e) => {
        const row = e.target.closest('.fids-row');
        if (row) {
          const flightId = row.getAttribute('data-flight-id');
          if (flightId) {
            this.onSelectFlight(flightId);
          }
        }
      });
    }
  }

  // Render Main Authentic Electronic Airport FIDS Flight Board (10–12 Rows)
  renderFlightBoard(flights, selectedId) {
    if (!this.boardContainer) return;

    if (flights.length === 0) {
      this.boardContainer.innerHTML = `
        <div class="fids-empty-state">
          <div class="empty-icon">✈️</div>
          <div class="empty-text">NO FLIGHTS MATCH CURRENT FILTER / SEARCH</div>
          <div class="empty-sub">Try selecting another mode or clearing search query</div>
        </div>
      `;
      return;
    }

    const rowsHtml = flights.map((f) => {
      const isSelected = f.id === selectedId;
      const statusClass = f.status.toLowerCase().replace(/\s+/g, '-');

      return `
        <div class="fids-row ${isSelected ? 'selected' : ''}" data-flight-id="${f.id}" role="button" tabindex="0">
          <div class="fids-cell cell-flight">
            <span class="flight-no">${f.flightNo}</span>
          </div>
          <div class="fids-cell cell-airline">
            <span class="airline-name">${f.airline}</span>
          </div>
          <div class="fids-cell cell-from">${f.from}</div>
          <div class="fids-cell cell-to">${f.to}</div>
          <div class="fids-cell cell-time">${f.arrival}</div>
          <div class="fids-cell cell-time">${f.departure}</div>
          <div class="fids-cell cell-gate">
            <span class="gate-badge">${f.gate}</span>
          </div>
          <div class="fids-cell cell-status">
            <span class="status-pill status-${statusClass}">${f.status}</span>
          </div>
        </div>
      `;
    }).join('');

    this.boardContainer.innerHTML = `
      <div class="fids-table-header">
        <div class="fids-th cell-flight">FLIGHT</div>
        <div class="fids-th cell-airline">AIRLINE</div>
        <div class="fids-th cell-from">FROM</div>
        <div class="fids-th cell-to">TO</div>
        <div class="fids-th cell-time">ARRIVAL</div>
        <div class="fids-th cell-time">DEPARTURE</div>
        <div class="fids-th cell-gate">GATE</div>
        <div class="fids-th cell-status">STATUS</div>
      </div>
      <div class="fids-table-body">
        ${rowsHtml}
      </div>
    `;
  }

  // Render Persistent Selected Flight Details Side Panel
  renderFlightDetails(flight) {
    if (!this.modalContainer) return;

    if (!flight) {
      this.modalContainer.innerHTML = `
        <div class="side-panel-box">
          <div class="panel-header-title">SELECTED FLIGHT</div>
          <div class="no-flight-selected">Click any flight row on the main board to inspect details.</div>
        </div>
      `;
      return;
    }

    const statusClass = flight.status.toLowerCase().replace(/\s+/g, '-');

    this.modalContainer.innerHTML = `
      <div class="side-panel-box">
        <div class="panel-header-title">SELECTED FLIGHT</div>

        <div class="selected-flight-main">
          <div class="flight-code-lg">${flight.flightNo}</div>
          <div class="airline-name-lg">${flight.airline}</div>
        </div>

        <div class="route-banner-airport">
          <div class="city-box">
            <div class="city-code">${flight.from}</div>
            <div class="city-name-sub">${flight.fromCity}</div>
          </div>
          <div class="route-flight-icon">✈ ➔</div>
          <div class="city-box">
            <div class="city-code">${flight.to}</div>
            <div class="city-name-sub">${flight.toCity}</div>
          </div>
        </div>

        <div class="flight-meta-grid">
          <div class="meta-cell">
            <span class="meta-label">ARRIVAL</span>
            <span class="meta-value">${flight.arrival}</span>
          </div>
          <div class="meta-cell">
            <span class="meta-label">DEPARTURE</span>
            <span class="meta-value">${flight.departure}</span>
          </div>
          <div class="meta-cell">
            <span class="meta-label">GATE</span>
            <span class="meta-value gate-highlight">${flight.gate}</span>
          </div>
          <div class="meta-cell">
            <span class="meta-label">TERMINAL</span>
            <span class="meta-value">${flight.terminal}</span>
          </div>
          <div class="meta-cell">
            <span class="meta-label">AIRCRAFT</span>
            <span class="meta-value">${flight.aircraft}</span>
          </div>
          <div class="meta-cell">
            <span class="meta-label">FLIGHT TYPE</span>
            <span class="meta-value">${flight.flightType}</span>
          </div>
        </div>

        <div class="status-banner-box">
          <span class="meta-label">CURRENT STATUS</span>
          <span class="status-pill status-${statusClass} status-lg">${flight.status}</span>
        </div>
      </div>
    `;
  }

  // Render Next Departure Live Countdown Panel
  renderNextDeparture(flight, totalSeconds) {
    if (!this.countdownContainer || !flight) return;

    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    this.countdownContainer.innerHTML = `
      <div class="next-dep-card">
        <div class="next-dep-header">
          <span class="pulse-icon">🔴</span> NEXT DEPARTURE
        </div>
        <div class="next-dep-flight">${flight.flightNo}</div>
        <div class="next-dep-airline">${flight.airline}</div>
        <div class="next-dep-route">${flight.from} ➔ ${flight.to}</div>
        
        <div class="next-dep-meta">
          <div><span class="meta-lbl">GATE:</span> <strong class="gate-text">${flight.gate}</strong></div>
          <div><span class="meta-lbl">DEP:</span> <strong>${flight.departure}</strong></div>
        </div>

        <div class="next-dep-timer">
          <div class="timer-lbl">BOARDING COUNTDOWN</div>
          <div class="timer-digits">${timeStr}</div>
        </div>
      </div>
    `;
  }

  // Render Airport Statistics
  renderAirportStats(flights) {
    if (!this.statsContainer) return;

    const total = flights.length;
    const activeGates = new Set(flights.map(f => f.gate)).size;
    const onTimeCount = flights.filter(f => f.status === 'ON TIME' || f.status === 'BOARDING').length;
    const delayedCount = flights.filter(f => f.status === 'DELAYED').length;
    const onTimePct = total > 0 ? Math.round((onTimeCount / total) * 100) : 100;

    this.statsContainer.innerHTML = `
      <div class="stat-card">
        <div class="stat-val">${total}</div>
        <div class="stat-lbl">TOTAL FLIGHTS</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">${activeGates}</div>
        <div class="stat-lbl">ACTIVE GATES</div>
      </div>
      <div class="stat-card accent-green">
        <div class="stat-val">${onTimePct}%</div>
        <div class="stat-lbl">ON-TIME PERFORMANCE</div>
      </div>
      <div class="stat-card accent-amber">
        <div class="stat-val">${delayedCount}</div>
        <div class="stat-lbl">DELAYED FLIGHTS</div>
      </div>
    `;
  }

  // Render Bottom Shift Register Announcement Ticker
  renderAnnouncementMarquee(matrixColumns) {
    if (!this.marqueeCtx || !this.marqueeCanvas) return;

    const ctx = this.marqueeCtx;
    const width = this.marqueeCanvas.width;
    const height = this.marqueeCanvas.height;

    // Clear background
    ctx.fillStyle = '#020408';
    ctx.fillRect(0, 0, width, height);

    const cols = 64;
    const rows = 8;
    const cellW = width / cols;
    const cellH = height / rows;
    const radius = Math.min(cellW, cellH) * 0.35;

    for (let c = 0; c < cols; c++) {
      const colByte = matrixColumns[c] || 0x00;

      for (let r = 0; r < rows; r++) {
        const isOn = (colByte & (1 << r)) !== 0;
        const x = c * cellW + cellW / 2;
        const y = r * cellH + cellH / 2;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);

        if (isOn) {
          ctx.fillStyle = '#ffb000';
          ctx.shadowColor = 'rgba(255, 176, 0, 0.8)';
          ctx.shadowBlur = 6;
          ctx.fill();
        } else {
          ctx.fillStyle = '#140f04';
          ctx.shadowBlur = 0;
          ctx.fill();
        }
      }
    }
  }
}
