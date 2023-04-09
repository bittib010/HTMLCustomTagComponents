class AsciiHexElement extends HTMLElement {
  constructor() {
    super();
    this.hexNums = this.getAttribute('hex');
    this.indexInfo = JSON.parse(this.getAttribute('info'));
    this.lineshift = 16;
    this.ASCIIHex = this.hexNums;
    this.current_html = '';
    this.prev_min_indx = 0;
    this.prev_max_indx = 1;
    this.rrbga = "#fff";
  }

  connectedCallback() {
    this.innerHTML = this.render();
    this.attachListeners();
  }

  attachListeners() {
    this.addEventListener('click', (event) => {
      const cell = event.target.closest('td');
      if (cell) {
        const index = parseInt(cell.id);
        this.showInfo(index, this.indexInfo);
      }
    });
  }

  render() {
    this.hexNums = this.hexNums.split(" ");
    this.ASCIIHex = this.ASCIIHex.split(" ");
    console.log(this.hexNums);

    let table1 = '';
    let table2 = '';
    for (let i = 0; i < this.hexNums.length; i += this.lineshift) {
      table1 += '<tr>';
      table2 += '<tr>';
      for (let j = i; j < i + this.lineshift; j++) {
        if (this.hexNums[j] == null || this.hexNums[j] == "") {
          this.hexNums[j] = " ";
        }

        let foundSeq = false;
        for (let t = 0; t < this.indexInfo.length; t++) {
          if (this.indexInfo[t][0] === j) {
            this.rrbga = this.random_rgba();
            foundSeq = true;
            console.log(this.indexInfo[t][0]);
            break;
          } else if (j >= this.indexInfo[t][0] && j <= this.indexInfo[t][1]) {
            foundSeq = true;
            break;
          }
        }
        
        if (!foundSeq) {
          this.rrbga = "#fff"; // default color
        }
        
        const td_col_1 = document.createElement("td");
        td_col_1.id = j;
        td_col_1.textContent = this.hex2a(this.hexNums[j]);
        td_col_1.style.backgroundColor = this.rrbga;

        const td_col_2 = document.createElement("td");
        td_col_2.id = j;
        td_col_2.textContent = this.hexNums[j];
        td_col_2.style.backgroundColor = this.rrbga;

        table1 += td_col_1.outerHTML;
        table2 += td_col_2.outerHTML;
      }
      table1 += "</tr>";
      table2 += "</tr>";
    }
    table1 = `<table ">${table1}</table>`;
    table2 = `<table ">${table2}</table>`;
    
    const div_col1 = `<div class="col-1">${table1}</div>`;
    const div_col2 = `<div class="col-2">${table2}</div>`;
    this.current_html = `${div_col1}${div_col2}<div class="info-frame col"></div>`;
    return this.current_html;
  }

  hex2a(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) {
      var v = parseInt(hex.substr(i, 2), 16);
      if (v > 32) { // could add other chars here
        str += String.fromCharCode(v);
      }else{
        str += ".";
      }
    }
    return str;
  }


  showInfo(index, indexInfo) {
    for (let i = 0; i < indexInfo.length; i++) {
      if (index >= indexInfo[i][0] && index <= indexInfo[i][1]) {
        // Update the content of the `.info-frame` element
        const infoFrame = this.querySelector('.info-frame');
        if (infoFrame) {
          infoFrame.innerHTML = indexInfo[i][2];
        }
        break;
      }
    }
  }
  random_rgba() {
    var o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + (0.2 + (r() * 0.3)).toFixed(1) + ')';
  }

}

customElements.define('hex-viewer', AsciiHexElement);
