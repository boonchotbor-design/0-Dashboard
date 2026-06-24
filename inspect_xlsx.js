const xlsx = require('xlsx');
const wb = xlsx.readFile('Dashboard_Template_30_Slides_Final.xlsx');

wb.SheetNames.forEach(name => {
  console.log('\n' + '='.repeat(60));
  console.log('SHEET:', name);
  console.log('='.repeat(60));
  const sheet = wb.Sheets[name];
  // Use header:1 to see raw rows
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  // Show first 12 rows only
  rows.slice(0, 12).forEach((row, i) => {
    console.log(`Row ${i}:`, JSON.stringify(row));
  });
});
