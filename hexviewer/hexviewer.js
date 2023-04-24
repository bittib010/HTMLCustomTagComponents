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
    this.attachListenerssss();
    this.innerHTML = this.render();
    this.attachListeners();
    this.row_col_listener_ascii();
    this.row_col_listener_hex();
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
  attachListenerssss() {
    document.addEventListener("keyup", function (e) {
      var selectedHTML,
        key = e.key;
      if (key == "Shift") {
        // if "shift" key was released 
        selectedHTML = getSelectionHtml();
        if (selectedHTML) {
          // get the selected elements
          var selectedElements = window
            .getSelection()
            .getRangeAt(0)
            .cloneContents()
            .querySelectorAll("td");
          var values = [];
          // print the tag ID of each selected element
          for (var i = 0; i < selectedElements.length; i++) {
            values.push(parseInt(selectedElements[i].id))
          }

          var highIndex = highLow(values)[0];
          var lowIndex = highLow(values)[1];

          if (highIndex < lowIndex) {
            temp = highIndex;
            highIndex = lowIndex;
            lowIndex = temp;
          }
          //alert("High Index: " + highIndex + "\nLow Index: " + lowIndex);
          console.log("High Index: " + highIndex + "\nLow Index: " + lowIndex);


        }
      }
    })
  }


row_col_listener_hex() {
  let table = document.getElementsByTagName('table')[1];
  let cells = table.getElementsByTagName('td');
  for (let i = 0; i < cells.length; i++) {
    cells[i].addEventListener('mouseover', function () {
      let currentRow = this.parentNode.rowIndex;
      let currentCol = this.cellIndex;

      for (let j = 0; j < table.rows.length; j++) {
        table.rows[j].cells[currentCol].style.opacity = '0.7';
      }
      for (let k = 0; k < this.parentNode.cells.length; k++) {
        this.parentNode.cells[k].style.opacity = '0.7';
      }
    });

    cells[i].addEventListener('mouseout', function () {
      for (let j = 0; j < cells.length; j++) {
        cells[j].style.opacity = '1';
      }
    });
  }
}

row_col_listener_ascii() {
  let table = document.getElementsByTagName('table')[0];
  let cells = table.getElementsByTagName('td');
  for (let i = 0; i < cells.length; i++) {
    cells[i].addEventListener('mouseover', function () {
      let currentRow = this.parentNode.rowIndex;
      let currentCol = this.cellIndex;

      for (let j = 0; j < table.rows.length; j++) {
        table.rows[j].cells[currentCol].style.opacity = '0.7';
      }
      for (let k = 0; k < this.parentNode.cells.length; k++) {
        this.parentNode.cells[k].style.opacity = '0.7';
      }
    });

    cells[i].addEventListener('mouseout', function () {
      for (let j = 0; j < cells.length; j++) {
        cells[j].style.opacity = '1';
      }
    });
  }
}

render() {
  this.hexNums = this.hexNums.split(" ");
  this.ASCIIHex = this.ASCIIHex.split(" ");

  let table1 = '';
  let table2 = '';
  for (let i = 0; i < this.hexNums.length; i += this.lineshift) {
    table1 += '<tr>';
    table2 += '<tr>';
    for (let j = i; j < i + this.lineshift; j++) {
      if (this.hexNums[j] == null || this.hexNums[j] == "") {
        this.hexNums[j] = "";
      }

      let foundSeq = false;
      for (let t = 0; t < this.indexInfo.length; t++) {
        if (this.indexInfo[t][0] === j) {
          this.rrbga = this.random_rgba();
          foundSeq = true;
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
    } else {
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

function getSelectionHtml() {
  var html = "";
  if (typeof window.getSelection != "undefined") {
    var sel = window.getSelection();
    if (sel.rangeCount) {
      var container = document.createElement("div");
      for (var i = 0, len = sel.rangeCount; i < len; ++i) {
        container.appendChild(sel.getRangeAt(i).cloneContents());
      }
      html = container.innerHTML;
    }
  } else if (typeof document.selection != "undefined") {
    if (document.selection.type == "Text") {
      html = document.selection.createRange().htmlText;
    }
  }
  return html;
}

function highLow(arr) {
  // Return the highest and lowest number in an array
  return [Math.max(...arr), Math.min(...arr)];
}