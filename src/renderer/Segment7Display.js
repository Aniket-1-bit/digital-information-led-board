// 6-Digit 7-Segment LED Display Renderer
// Simulates 74LS47 BCD-to-7-Segment Decoder output

import { BCD_7SEG_DECODER } from '../data/fontRom.js';

export class Segment7Display {
  constructor(containerElement) {
    this.container = containerElement;
    this.digits = [];
    this.colons = [];
    this.initDOM();
  }

  initDOM() {
    this.container.innerHTML = '';
    
    // Create 6 digit elements grouped as [D1, D2] : [D3, D4] : [D5, D6]
    for (let i = 0; i < 6; i++) {
      const digitWrapper = document.createElement('div');
      digitWrapper.className = 'seg7-digit';
      
      // Generate 7 segment SVG paths (a, b, c, d, e, f, g)
      digitWrapper.innerHTML = `
        <svg viewBox="0 0 50 80" class="seg7-svg">
          <!-- Segment A (Top) -->
          <polygon points="10,6 40,6 34,14 16,14" class="seg-a" />
          <!-- Segment B (Top Right) -->
          <polygon points="41,7 47,13 41,37 35,33" class="seg-b" />
          <!-- Segment C (Bottom Right) -->
          <polygon points="41,41 47,45 41,71 35,65" class="seg-c" />
          <!-- Segment D (Bottom) -->
          <polygon points="10,72 40,72 34,64 16,64" class="seg-d" />
          <!-- Segment E (Bottom Left) -->
          <polygon points="9,41 15,35 9,65 3,71" class="seg-e" />
          <!-- Segment F (Top Left) -->
          <polygon points="9,7 15,13 9,33 3,37" class="seg-f" />
          <!-- Segment G (Middle) -->
          <polygon points="10,39 16,34 34,34 40,39 34,44 16,44" class="seg-g" />
        </svg>
      `;
      this.container.appendChild(digitWrapper);
      this.digits.push(digitWrapper);

      // Add separator colons after digit 1 and digit 3
      if (i === 1 || i === 3) {
        const colon = document.createElement('div');
        colon.className = 'seg7-colon';
        colon.innerHTML = `<span></span><span></span>`;
        this.container.appendChild(colon);
        this.colons.push(colon);
      }
    }
  }

  update(digitsArray, mode) {
    const isClockMode = (mode === 4);
    const isCounterMode = (mode === 3);

    // Toggle colons visibility
    this.colons.forEach(colon => {
      colon.style.visibility = isClockMode ? 'visible' : 'hidden';
    });

    for (let i = 0; i < 6; i++) {
      const val = digitsArray[i];
      const digitEl = this.digits[i];
      const bitmask = BCD_7SEG_DECODER[val] !== undefined ? BCD_7SEG_DECODER[val] : 0x00;

      // Segment maps: a=0, b=1, c=2, d=3, e=4, f=5, g=6
      const segments = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
      segments.forEach((seg, idx) => {
        const segPoly = digitEl.querySelector(`.seg-${seg}`);
        if (segPoly) {
          const isOn = (bitmask & (1 << idx)) !== 0;
          if (isOn) {
            segPoly.classList.add('lit');
          } else {
            segPoly.classList.remove('lit');
          }
        }
      });

      // Handle dimming unused digits in 2-digit counter mode
      if (isCounterMode && (i < 2 || i > 3)) {
        digitEl.style.opacity = '0.2';
      } else {
        digitEl.style.opacity = '1.0';
      }
    }
  }
}
