const fs = require('fs');
const xlsx = require('xlsx');

let js = fs.readFileSync('C:/0_Dashboad/extract_script.js', 'utf8');

const match = js.match(/reader\.onload = async \(e\) => \{(.*?)\};\s*reader\.readAsBinaryString/s);
if (match) {
  let logic = match[1];
  
  const mockDOM = `
    const window = { 
      backlogChart: { data: { datasets: [{data:[]}] }, update: ()=>{} }, 
      siteDonut: { data: { datasets: [{data:[]}] }, update: ()=>{} }, 
      docChart: { data: { datasets: [{data:[]}, {data:[]}] }, update: ()=>{} },
      jspdf: {}
    };
    const globalState = { mockElements: {} };
    const document = {
      getElementById: (id) => {
        if (!globalState.mockElements[id]) {
          globalState.mockElements[id] = {
            id,
            textContent: '',
            innerHTML: '',
            style: {},
            classList: { add: ()=>{} },
            tagName: 'DIV',
            previousElementSibling: { textContent: '' }
          };
        }
        return globalState.mockElements[id];
      },
      querySelector: (sel) => {
        return { previousElementSibling: { textContent: '' } };
      }
    };
    const alert = console.log;
    const localStorage = { setItem: (key, val) => { globalState.savedState = val; } };
    const e = { target: { result: require('fs').readFileSync('C:/0_Dashboad/Dashboard_Template_30_Slides_Final_FIXED.xlsx', 'binary') } };
    const importedSheets = [];
  `;
  
  // Replace window chart data references that fail on undefined datasets
  logic = logic.replace(/window\.backlogChart\.data\.datasets\[0\]\.data/g, '[]');
  logic = logic.replace(/window\.siteDonut\.data\.datasets\[0\]\.data/g, '[]');
  logic = logic.replace(/window\.docChart\.data\.datasets\[0\]\.data/g, '[]');
  logic = logic.replace(/window\.docChart\.data\.datasets\[1\]\.data/g, '[]');
  
  const testScript = mockDOM + '\n' + logic + '\nconsole.log(JSON.stringify(globalState.mockElements, null, 2));';
  fs.writeFileSync('C:/0_Dashboad/run_test.js', testScript, 'utf8');
}
