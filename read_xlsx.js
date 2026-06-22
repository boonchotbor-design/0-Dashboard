const xlsx = require('xlsx');

const workbook = xlsx.readFile('Copy of Progress Report Record_2026_CPO_PIVOT.xlsx');
workbook.SheetNames.forEach(sheetName => {
  console.log("=== Sheet:", sheetName, "===");
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  for (let i = 0; i < Math.min(5, data.length); i++) {
    console.log(data[i]);
  }
});
