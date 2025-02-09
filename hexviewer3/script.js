class HexViewer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Initialize properties
    this.hexData = '';
    this.sequences = [];
    this.lineWidth = 16;
    this.currentTheme = 'black-white';
    this.themes = {
      'black-white': { background: '#000000', text: '#ffffff' },
      'black-green': { background: '#000000', text: '#00ff00' },
      'black-red': { background: '#000000', text: '#ff0000' },
      'white-green': { background: '#ffffff', text: '#00aa00' },
      'white-black': { background: '#ffffff', text: '#000000' }
    };
    this.usedColors = [];
    this.sequenceColors = new Map();
    this.currentInfoText = '';
    this.currentOffset = 0;

    // Bind methods
    this.handleClick = this.handleClick.bind(this);
    this.handleWidthChange = this.handleWidthChange.bind(this);
    this.handleThemeChange = this.handleThemeChange.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleCellHover = this.handleCellHover.bind(this);
  }

  static get observedAttributes() {
    return ['hex', 'sequences', 'width', 'theme'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'hex') {
      this.hexData = newValue;
    } else if (name === 'sequences') {
      this.sequences = JSON.parse(newValue);
      this.generateSequenceColors();
    } else if (name === 'width') {
      this.lineWidth = parseInt(newValue) || 16;
    } else if (name === 'theme') {
      this.currentTheme = newValue;
    }
    this.render();
    this.setupEventListeners();
  }

  generateSequenceColors() {
    this.usedColors = [];
    this.sequenceColors.clear();
    const theme = this.themes[this.currentTheme];

    this.sequences.forEach(sequence => {
      if (sequence[3]) {
        this.sequenceColors.set(sequence[0], sequence[3]);
      } else {
        const color = this.generateRandomColor(theme.text);
        this.sequenceColors.set(sequence[0], color);
      }
    });
  }

  getContrastRatio(color1, color2) {
    const getLuminance = (r, g, b) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    if (!rgb1 || !rgb2) return 1;

    const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  generateRandomColor(textColor) {
    const getRandomHex = () => {
      const val = Math.floor(Math.random() * 256);
      return val.toString(16).padStart(2, '0');
    };

    let attempts = 0;
    let color = '';
    do {
      color = `#${getRandomHex()}${getRandomHex()}${getRandomHex()}`;
      attempts++;
    } while (
      (this.getContrastRatio(color, textColor) < 4.5 ||
        this.usedColors.some(used => this.getColorSimilarity(color, used) < 0.3)) &&
      attempts < 50
    );

    this.usedColors.push(color);
    return color;
  }

  getColorSimilarity(color1, color2) {
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ] : [0, 0, 0];
    };

    const [r1, g1, b1] = hexToRgb(color1);
    const [r2, g2, b2] = hexToRgb(color2);

    const distance = Math.sqrt(
      Math.pow(r2 - r1, 2) +
      Math.pow(g2 - g1, 2) +
      Math.pow(b2 - b1, 2)
    );

    return distance / 441.67;
  }

  getSequenceColor(index) {
    const sequence = this.sequences.find(
      ([start, end]) => index >= start && index <= end
    );

    if (!sequence) return 'transparent';
    return this.sequenceColors.get(sequence[0]) || 'transparent';
  }

  handleClick(e) {
    const cell = e.target.closest('td');
    if (cell) {
      const index = parseInt(cell.getAttribute('data-index') || '0');
      this.showSequenceInfo(index);
    }
  }

  handleWidthChange(e) {
    const width = parseInt(e.target.value);
    if (!isNaN(width)) {
      this.lineWidth = width;
      this.render();
      this.setupEventListeners();
    }
  }

  handleThemeChange(e) {
    const theme = e.target.value;
    this.currentTheme = theme;
    this.generateSequenceColors();
    this.render();
    this.setupEventListeners();
  }
  handleCellHover(e) {
    const cell = e.target.closest('td');
    if (cell) {
      const offset = parseInt(cell.getAttribute('data-index') || '0');
      this.currentOffset = offset;
      const offsetDisplay = this.shadowRoot?.querySelector('#offset-display');
      if (offsetDisplay) {
        offsetDisplay.textContent = `Offset: ${offset.toString(16).toUpperCase().padStart(2, '0')}`;
      }
    }
  }
  removeEventListeners() {
    if (!this.shadowRoot) return;

    const widthSelect = this.shadowRoot.querySelector('#width-select');
    const themeSelect = this.shadowRoot.querySelector('#theme-select');

    this.shadowRoot.removeEventListener('click', this.handleClick);
    this.shadowRoot.removeEventListener('mousemove', this.handleCellHover);
    widthSelect?.removeEventListener('change', this.handleWidthChange);
    themeSelect?.removeEventListener('change', this.handleThemeChange);
  }

  setupEventListeners() {
    if (!this.shadowRoot) return;

    this.removeEventListeners();

    this.shadowRoot.addEventListener('click', this.handleClick);
    this.shadowRoot.addEventListener('mousemove', this.handleCellHover);

    const widthSelect = this.shadowRoot.querySelector('#width-select');
    const themeSelect = this.shadowRoot.querySelector('#theme-select');

    widthSelect?.addEventListener('change', this.handleWidthChange);
    themeSelect?.addEventListener('change', this.handleThemeChange);
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  showSequenceInfo(index) {
    const sequence = this.sequences.find(
      ([start, end]) => index >= start && index <= end
    );

    if (sequence) {
      this.currentInfoText = sequence[2];
      const infoPanel = this.shadowRoot?.querySelector('.info-panel');
      if (infoPanel) {
        infoPanel.innerHTML = `
          ${sequence[2]}
          <button class="expand-btn">View Full Details</button>
        `;

        const expandBtn = infoPanel.querySelector('.expand-btn');
        expandBtn?.addEventListener('click', () => this.showModal(sequence[2]));
      }
    }
  }

  showModal(content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <button class="close-btn">&times;</button>
        <div class="modal-body">${content}</div>
      </div>
    `;

    modal.querySelector('.close-btn')?.addEventListener('click', this.handleModalClose);
    this.shadowRoot?.appendChild(modal);
  }

  handleModalClose(e) {
    const modal = e.target.closest('.modal');
    modal?.remove();
  }

  hex2ascii(hex) {
    const byte = parseInt(hex, 16);
    if (isNaN(byte) || byte === 0 || byte < 32 || byte > 126) {
      return ".";
    }
    return String.fromCharCode(byte);
  }

  render() {
    if (!this.shadowRoot) return;

    const hexBytes = this.hexData.match(/[0-9A-Fa-f]{2}/g) || [];
    const rows = [];

    for (let i = 0; i < hexBytes.length; i += this.lineWidth) {
      rows.push(hexBytes.slice(i, i + this.lineWidth));
    }

    const renderCell = (byte, index, isAscii) => {
      const backgroundColor = this.getSequenceColor(index);
      const style = backgroundColor !== 'transparent'
        ? `background-color: ${backgroundColor};`
        : '';

      const content = isAscii ? this.hex2ascii(byte) : byte.toUpperCase();

      return `
        <td data-index="${index}"
            style="${style}"
            title="Offset: ${index}">
          ${content}
        </td>
      `;
    };

    const styles = document.createElement('style');
    styles.textContent = `
      :host {
        --bg-color: ${this.themes[this.currentTheme].background};
        --text-color: ${this.themes[this.currentTheme].text};
        --text-color-rgb: ${this.themes[this.currentTheme].text.match(/\w\w/g)?.map(c => parseInt(c, 16)).join(', ') || '255, 255, 255'};
        display: block;
        font-family: 'JetBrains Mono', monospace;
        padding: 0.25rem;
        width: 100%;
        height: 100%;
      }

      /* Scrollbar styling */
      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      ::-webkit-scrollbar-track {
        background: transparent;
      }

      ::-webkit-scrollbar-thumb {
        background: rgba(var(--text-color-rgb), 0.2);
        border-radius: 3px;
        transition: background-color 0.2s ease;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: rgba(var(--text-color-rgb), 0.3);
      }

      ::-webkit-scrollbar-corner {
        background: transparent;
      }

      /* Apply scrollbar styles to specific scrollable elements */
      .tables-wrapper, .info-panel, .modal-content {
        scrollbar-width: thin;
        scrollbar-color: rgba(var(--text-color-rgb), 0.2) transparent;
      }

      .tables-wrapper:hover::-webkit-scrollbar-thumb,
      .info-panel:hover::-webkit-scrollbar-thumb,
      .modal-content:hover::-webkit-scrollbar-thumb {
        background: rgba(var(--text-color-rgb), 0.3);
      }

      .outer-wrapper {
        max-width: 100%;
        height: calc(100vh - 6rem);
        display: flex;
        flex-direction: column;
        border: 1px solid var(--text-color);
        border-radius: 4px;
      }

      .tables-wrapper {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
        padding: 0.25rem;
        position: relative;
      }

      .controls {
        margin-bottom: 0.25rem;
        display: flex;
        gap: 0.25rem;
        align-items: center;
        padding: 0.25rem;
        border-bottom: 1px solid var(--text-color);
        position: sticky;
        top: 0;
        background: var(--bg-color);
        z-index: 1;
      }

      .controls select {
        background-color: var(--bg-color);
        color: var(--text-color);
        border: 1px solid var(--text-color);
        padding: 0.15rem;
        border-radius: 4px;
        font-family: inherit;
        font-size: 0.8rem;
      }

      #offset-display {
        margin-left: auto;
        padding: 0.15rem 0.5rem;
        background: var(--bg-color);
        color: var(--text-color);
        border: 1px solid var(--text-color);
        border-radius: 4px;
        font-family: inherit;
        font-size: 0.8rem;
      }

      .tables {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0;
        margin-bottom: 0.25rem;
        min-width: max-content;
      }

      table {
        border-collapse: separate;
        border-spacing: 0;
        background: var(--bg-color);
        color: var(--text-color);
        font-size: 0.75rem;
        width: 100%;
      }

      table.hex {
        border-right: 3px solid var(--text-color);
      }

      table.ascii {
        border-left: none;
      }

      td {
        padding: 0.1rem 0.3rem;
        border: 1px solid rgba(var(--text-color-rgb), 0.1);
        text-align: center;
        cursor: pointer;
        transition: opacity 0.2s ease;
        min-width: 1rem;
        letter-spacing: 0.05rem;
      }

      table.hex td {
        letter-spacing: 0.1rem;
      }

      td:hover {
        opacity: 0.7;
      }

      .info-panel {
        padding: 0.2rem 0.5rem;
        background: var(--bg-color);
        color: var(--text-color);
        border-top: 1px solid rgba(var(--text-color-rgb), 0.2);
        min-height: 60px;
        max-height: 100px;
        overflow-y: auto;
        font-size: 0.8rem;
        position: sticky;
        bottom: 0;
      }

      .info-panel :is(h1, h2, h3) {
        margin: 0 0 0.1rem 0;
        font-size: 0.9em;
      }

      .info-panel b {
        color: rgba(var(--text-color-rgb), 0.8);
      }

      .expand-btn {
        position: sticky;
        float: right;
        right: 0.2rem;
        bottom: 0.2rem;
        background: var(--bg-color);
        color: var(--text-color);
        border: 1px solid var(--text-color);
        padding: 0.1rem 0.3rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.7rem;
        transition: background-color 0.2s ease;
        margin-left: 1rem;
      }

      .expand-btn:hover {
        background: rgba(var(--text-color-rgb), 0.2);
      }

      .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }

      .modal-content {
        background: var(--bg-color);
        color: var(--text-color);
        padding: 1rem;
        border-radius: 4px;
        position: relative;
        width: 80%;
        max-width: 800px;
        max-height: 80vh;
        overflow-y: auto;
      }

      .close-btn {
        position: sticky;
        top: -0.5rem;
        float: right;
        background: var(--bg-color);
        border: 1px solid var(--text-color);
        color: var(--text-color);
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 1.5rem;
        height: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        margin-bottom: 0.5rem;
        margin-left: 0.5rem;
      }

      .close-btn:hover {
        background: rgba(var(--text-color-rgb), 0.2);
      }

      .modal-body {
        margin-top: 1rem;
        clear: both;
      }

      @media (max-width: 768px) {
        td {
          padding: 0.05rem 0.1rem;
          font-size: 0.7rem;
        }

        .modal-content {
          width: 95%;
          margin: 1rem;
        }
      }
    `;

    const tables = `
      <div class="outer-wrapper">
        <div class="controls">
          <select id="width-select">
            ${[8, 16, 24, 32].map(w =>
              `<option value="${w}" ${w === this.lineWidth ? 'selected' : ''}>
                Width: ${w}
              </option>`
            ).join('')}
          </select>
          <select id="theme-select">
            ${Object.keys(this.themes).map(theme =>
              `<option value="${theme}" ${theme === this.currentTheme ? 'selected' : ''}>
                ${theme.replace('-', ' / ')}
              </option>`
            ).join('')}
          </select>
          <div id="offset-display">Offset: 00</div>
        </div>
        <div class="tables-wrapper">
          <div class="tables">
            <table class="hex">
              <tbody>
                ${rows.map((row, rowIndex) => `
                  <tr>
                    ${row.map((byte, colIndex) => {
                      const index = rowIndex * this.lineWidth + colIndex;
                      return renderCell(byte, index, false);
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <table class="ascii">
              <tbody>
                ${rows.map((row, rowIndex) => `
                  <tr>
                    ${row.map((byte, colIndex) => {
                      const index = rowIndex * this.lineWidth + colIndex;
                      return renderCell(byte, index, true);
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        <div class="info-panel"></div>
      </div>
    `;

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(styles);
    this.shadowRoot.innerHTML += tables;
  }
}

customElements.define('hex-viewer', HexViewer);