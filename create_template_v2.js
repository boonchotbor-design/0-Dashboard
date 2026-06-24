const xlsx = require('xlsx');
const wb = xlsx.utils.book_new();

// Sheet: Slide 1-2 Executive
const execData = [
  ['Slide', 'Category', 'W25', 'W26', 'Trend', 'TrendText'],
  ['Slide 2', 'Revenue', '45.10M', '45.98M', 'up', '▲'],
  ['Slide 2', 'AC1 Done', '151', '139', 'down', '▼'],
  ['Slide 2', 'Fulfilled', '17,631', '17,694', 'up', '▲'],
  ['Slide 2', 'Unfulfilled', '528', '783', 'up_risk', '▲ Risk'],
  ['Slide 2', 'Remain', '1.75M', '2.48M', 'up_risk', '▲ Risk']
];
xlsx.utils.book_append_sheet(wb, xlsx.utils.aoa_to_sheet(execData), "Slide 1-2 Executive");

// Sheet: Slide 3-6 Performance
const perfData = [
  ['Slide', 'Metric', 'Value'],
  ['Slide 3', 'HAE M1 Avg', 365.56],
  ['Slide 3', 'TME M1 Avg', -542.98],
  ['Slide 3', 'Overall M1 Avg', 1.35],
  ['Slide 3', 'Overall M2 Avg', 9.47],
  ['Slide 4', 'Smart QC Pass Rate', 95],
  ['Slide 4', 'Smart QC Total Inspected', 142]
];
xlsx.utils.book_append_sheet(wb, xlsx.utils.aoa_to_sheet(perfData), "Slide 3-6 Performance");

// Sheet: Slide 8-12 PE Aging
const peAgingData = [
  ['Slide', 'PE Name', 'M1 Aging', 'M2 Aging'],
  ['Slide 10', 'adisak', 1.83, -1346.09],
  ['Slide 11', 'palagon', -4617.60, -4614.80]
];
xlsx.utils.book_append_sheet(wb, xlsx.utils.aoa_to_sheet(peAgingData), "Slide 8-12 PE Aging");

// Sheet: Slide 13-19 Doc Status
const docStatusData = [
  ['Slide', 'Acceptance', 'Amount', 'Done', 'Avg Aging'],
  ['Slide 17', 'AC1', 1513763.02, 8297444.00, -2160.15],
  ['Slide 18', 'AC2', 349622.30, 4704479.00, -2871.84]
];
xlsx.utils.book_append_sheet(wb, xlsx.utils.aoa_to_sheet(docStatusData), "Slide 13-19 Doc Status");

// Sheet: Slide 20-27 Financials
const finData = [
  ['Slide', 'Category', 'Value'],
  ['Slide 20', 'Estimate Final Income', 3186618.40],
  ['Slide 20', 'AR Commerce', 1735926.12],
  ['Slide 20', 'AP Payment', 635296.62],
  ['Slide 20', 'Remain', 1142138.08],
  ['Slide 24', 'June Acceptance Target', 192566.00],
  ['Slide 25', 'June Action Plan AC2', 242060.30],
  ['Slide 26', 'Install On Process', 937070.00]
];
xlsx.utils.book_append_sheet(wb, xlsx.utils.aoa_to_sheet(finData), "Slide 20-27 Financials");

// Sheet: Slide 23 Backlog Trend
const backlogData = [
  ['Slide', 'Week', 'Value'],
  ['Slide 23', 'W08', 1680000],
  ['Slide 23', 'W12', 1030000],
  ['Slide 23', 'W16', 700000],
  ['Slide 23', 'W20', 500000],
  ['Slide 23', 'W23', 278511],
  ['Slide 23', 'W24', 1187938],
  ['Slide 23', 'W25', 1150000],
  ['Slide 23', 'W26', 1142138]
];
xlsx.utils.book_append_sheet(wb, xlsx.utils.aoa_to_sheet(backlogData), "Slide 23 Backlog Trend");

xlsx.writeFile(wb, 'Dashboard_Template_All_Slides.xlsx');
console.log('Successfully created Dashboard_Template_All_Slides.xlsx');
