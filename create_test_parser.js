const fs = require('fs');
const xlsx = require('xlsx');
const html = fs.readFileSync('public/summary.html', 'utf8');
const parserCodeMatch = html.match(/reader\.onload\s*=\s*function\s*\(evt\)\s*\{\s*try\s*\{([\s\S]*?)\}\s*catch\s*\(error\)/);
if (!parserCodeMatch) {
  console.error("Could not find parser code in summary.html");
  process.exit(1);
}
let parserCode = parserCodeMatch[1];
// Remove chart updates
parserCode = parserCode.replace(/window\.\w+Chart.*?update\(\);/g, '');
parserCode = parserCode.replace(/window\.\w+Donut.*?update\(\);/g, '');
// Provide a mock document and getElementById
let elements = {};
const mockDOM = `
const document = {
  getElementById: function(id) {
    if (!elements[id]) {
      elements[id] = { textContent: '', innerHTML: '', style: {}, classList: { add: ()=>{}, remove: ()=>{} }, tagName: 'DIV' };
    }
    return elements[id];
  }
};
const window = { backlogChart: { data: { datasets: [{data:[]}], labels: [] } }, docChart: { data: { datasets: [{data:[]}, {data:[]}], labels: [] } }, siteDonut: { data: { datasets: [{data:[]}] } } };
const e = { target: { result: require('fs').readFileSync('Dashboard_Template_30_Slides_Final_FIXED.xlsx', 'binary') } };
const evt = e;
const XLSX = require('xlsx');
`;
const testScript = mockDOM + "\n" + parserCode + "\nconsole.log('Successfully parsed. reportWeek:', reportWeek);\nconsole.log(JSON.stringify(elements, null, 2));\n";
fs.writeFileSync('run_test_parse.js', testScript);
console.log("Wrote run_test_parse.js");
