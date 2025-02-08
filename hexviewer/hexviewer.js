if (typeof marked === "undefined") {
  const script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/marked/4.3.0/marked.min.js";
  script.onload = () => this.render();
  document.head.appendChild(script);
}

class HexViewer extends HTMLElement {
  constructor() {
    super();
    this.hexData = (this.getAttribute("hex") || "").split(" ");
    this.indexInfo = JSON.parse(this.getAttribute("info") || "[]");
    this.lineWidth = parseInt(this.getAttribute("width") || 16, 10);
    this.attachShadow({ mode: "open" });

    if (typeof marked === "undefined") {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/marked/4.0.10/marked.min.js";
      script.onload = () => this.render();
      document.head.appendChild(script);
    }
  }

  connectedCallback() {
    this.render();
    this.addListeners();
  }

  addListeners() {
    this.shadowRoot.addEventListener("click", (event) => {
      const cell = event.target.closest("td");
      if (cell) {
        const index = parseInt(cell.dataset.index, 10);
        this.showInfo(index);
      }
    });
  }

  showInfo(index) {
    const infoFrame = this.shadowRoot.querySelector(".info-frame");
    const entry = this.indexInfo.find(([start, end]) => index >= start && index <= end);
    const content = entry ? entry[2] : "No additional info";

    if (typeof marked !== "undefined") {
      infoFrame.innerHTML = marked.parse(content); 
    } else {
      infoFrame.textContent = content;
    }
  }

  render() {
    let hexTable = '<table class="hex-table">';
    let asciiTable = '<table class="ascii-table">';
    let colors = {};

    this.indexInfo.forEach(([start, end]) => {
      const color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
      for (let i = start; i <= end; i++) {
        colors[i] = color;
      }
    });

    for (let i = 0; i < this.hexData.length; i += this.lineWidth) {
      hexTable += "<tr>";
      asciiTable += "<tr>";
      for (let j = i; j < i + this.lineWidth; j++) {
        if (!this.hexData[j]) continue;
        const bgColor = colors[j] || "#fff";
        const char = this.hexToAscii(this.hexData[j]);
        hexTable += `<td data-index="${j}" style="background:${bgColor};">${this.hexData[j]}</td>`;
        asciiTable += `<td data-index="${j}" style="background:${bgColor};">${char}</td>`;
      }
      hexTable += "</tr>";
      asciiTable += "</tr>";
    }
    hexTable += "</table>";
    asciiTable += "</table>";

    this.shadowRoot.innerHTML = `
      <style>
        .hex-table, .ascii-table { border-collapse: collapse; }
        td { padding: 2px 5px; text-align: center; cursor: pointer; }
        .info-frame { 
          margin-top: 10px; 
          padding: 10px; 
          border: 1px solid #ccc; 
          background: #f8f8f8; 
          font-family: Arial, sans-serif; 
          white-space: pre-wrap;
        }
      </style>
      <div>
        <div style="display: flex; gap: 10px;">${hexTable}${asciiTable}</div>
        <div class="info-frame">Click on a byte to see details</div>
      </div>
    `;
  }

  hexToAscii(hex) {
    const val = parseInt(hex, 16);
    return val > 31 && val < 127 ? String.fromCharCode(val) : ".";
  }
}

customElements.define("hex-viewer", HexViewer);
