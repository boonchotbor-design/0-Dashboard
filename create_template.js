const xlsx = require('xlsx');

// Create a new workbook
const wb = xlsx.utils.book_new();

// Sheet 1: Executive Summary
const execData = [
  ['Category', 'W25', 'W26', 'Trend', 'TrendText'],
  ['Revenue', '45.10M', '45.98M', 'up', '▲'],
  ['AC1 Done', '151', '139', 'down', '▼'],
  ['Fulfilled', '17,631', '17,694', 'up', '▲'],
  ['Unfulfilled', '528', '783', 'up_risk', '▲ Risk'],
  ['Remain', '1.75M', '2.48M', 'up_risk', '▲ Risk']
];
const execSheet = xlsx.utils.aoa_to_sheet(execData);
xlsx.utils.book_append_sheet(wb, execSheet, "Executive Summary");

// Sheet 2: Performance
const perfData = [
  ['Metric', 'Value'],
  ['HAE M1 Avg', 365.56],
  ['TME M1 Avg', -542.98],
  ['Overall M1 Avg', 1.35],
  ['Overall M2 Avg', 9.47],
  ['Smart QC Pass Rate', 95],
  ['Smart QC Total Inspected', 142]
];
const perfSheet = xlsx.utils.aoa_to_sheet(perfData);
xlsx.utils.book_append_sheet(wb, perfSheet, "Performance");

// Sheet 3: PE Aging
const peAgingData = [
  ['PE Name', 'M1 Aging', 'M2 Aging'],
  ['adisak', 1.83, -1346.09],
  ['palagon', -4617.60, -4614.80]
];
const peAgingSheet = xlsx.utils.aoa_to_sheet(peAgingData);
xlsx.utils.book_append_sheet(wb, peAgingSheet, "PE Aging");

// Sheet 4: Document Status
const docStatusData = [
  ['Acceptance', 'Amount', 'Done', 'Avg Aging'],
  ['AC1', 1513763.02, 8297444.00, -2160.15],
  ['AC2', 349622.30, 4704479.00, -2871.84]
];
const docStatusSheet = xlsx.utils.aoa_to_sheet(docStatusData);
xlsx.utils.book_append_sheet(wb, docStatusSheet, "Document Status");

// Sheet 5: Financials
const finData = [
  ['Category', 'Value'],
  ['Estimate Final Income', 3186618.40],
  ['AR Commerce', 1735926.12],
  ['AP Payment', 635296.62],
  ['Remain', 1142138.08],
  ['June Acceptance Target', 192566.00],
  ['June Action Plan AC2', 242060.30],
  ['Install On Process', 937070.00]
];
const finSheet = xlsx.utils.aoa_to_sheet(finData);
xlsx.utils.book_append_sheet(wb, finSheet, "Financials & Recovery");

// Sheet 6: Backlog Trend
const backlogData = [
  ['Week', 'Value'],
  ['W08', 1680000],
  ['W12', 1030000],
  ['W16', 700000],
  ['W20', 500000],
  ['W23', 278511],
  ['W24', 1187938],
  ['W25', 1150000],
  ['W26', 1142138]
];
const backlogSheet = xlsx.utils.aoa_to_sheet(backlogData);
xlsx.utils.book_append_sheet(wb, backlogSheet, "Backlog Trend");

// Write to file
xlsx.writeFile(wb, 'Dashboard_Data_Template.xlsx');
console.log('Successfully created Dashboard_Data_Template.xlsx');
