const xlsx = require('xlsx');
const wb = xlsx.readFile('Dashboard_Template_30_Slides_Final.xlsx');
function getPart(sheetName){
  const sheet = wb.Sheets[sheetName];
  if(!sheet) return [];
  return xlsx.utils.sheet_to_json(sheet, {header:1, defval:''});
}
const part1 = getPart('Part 1');
const findRow = (keyword)=> part1.find(r=> (r[0]||'').toString().includes(keyword));
const haeRow = findRow('HAE M1');
const tmeRow = findRow('TME M1');
const passRow = findRow('Pass Rate');
const inspectedRow = findRow('Total Inspected');
console.log('HAE M1 Row:', haeRow);
console.log('TME M1 Row:', tmeRow);
console.log('Pass Rate Row:', passRow);
console.log('Inspected Row:', inspectedRow);
