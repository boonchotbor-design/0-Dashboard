const xlsx = require('xlsx');
const wb = xlsx.utils.book_new();

// ============================================================
// Part 1: Executive Summary & Project Overview (Slides 1-6)
// Dashboard reads:
//   - 'Metric / Data Point' col for keywords, 'Value' col for values
//   - 'HAE M1 Avg' → kpiHaeAging  (must be NUMBER only, no Thai text)
//   - 'TME M1 Avg' → kpiHaeAgingSub
//   - 'Report Week' → weekBadge
// ============================================================
const part1Data = [
  ['Slide No', 'Slide Title', 'Metric / Data Point', 'Value', 'Notes / Key Message'],
  ['Slide 1', 'Title Slide', 'Report Week', 26, 'สรุปผลการดำเนินงานโครงการติดตั้งโครงข่ายโทรคมนาคม HAE และ TME ประจำสัปดาห์ที่ 26'],
  ['Slide 2', 'Executive Bottom Line', 'HAE M1 Avg', 365.56, 'หน้างานยังคงเดินหน้าอย่างรวดเร็ว แต่ระบบเอกสารยังมีปัญหาคอขวด'],
  ['Slide 2', 'Executive Bottom Line', 'TME M1 Avg', -542.98, 'ข้อมูลดิบอาจมีความคลาดเคลื่อนในระบบ'],
  ['Slide 3', 'Portfolio Performance Snapshot', 'Overall Progress', '', 'สัดส่วนของ HAE และ TME ในพอร์ตโฟลิโอทั้งหมด'],
  ['Slide 4', 'Smart QC Overview', 'Pass Rate', '', 'อัตราการผ่านการตรวจสอบคุณภาพเปรียบเทียบสองโครงการ'],
  ['Slide 5', 'Operation Error & Defect Analysis', 'Defect Issue 1', '', 'การขาดอุปกรณ์ป้องกัน PPE / ส่งข้อมูลไม่ครบ'],
  ['Slide 6', 'Improvement Plan for On-Site Quality', 'Action Plan', '', 'บูรณาการ AIS SPE Standards อย่างเคร่งครัด']
];
xlsx.utils.book_append_sheet(wb, xlsx.utils.aoa_to_sheet(part1Data), "Part 1 - Overview");

// ============================================================
// Part 2: Aging & Milestone Efficiency (Slides 7-12)
// Dashboard reads:
//   - Column 'Category / Person' for person/type matching
//   - Column 'M1 Aging' for M1 values
//   - Looks for /HAE\s*M1/i → needs 'HAE M1' in Category/Person
//   - Looks for /TME\s*M1/i → needs 'TME M1' in Category/Person
//   - Looks for /adisak/i && /average/i
//   - Looks for /palagon/i && /average/i
//   - Looks for /HAE\s*M2/i, /TME\s*M2.*MBB/i
// ============================================================
const part2Data = [
  ['Slide No', 'Slide Title', 'Category / Person', 'M1 Aging', 'M2 Aging', 'Sites', 'Notes'],
  ['Slide 7', 'The Execution Paradox', 'Overall Bottleneck', '', '', '', 'หน้างานทำได้เร็ว แต่กระบวนการตรวจรับเอกสารล่าช้า'],
  ['Slide 8', '1st Milestone AGING Analysis', 'HAE M1', 365.56, '', 169, 'เปรียบเทียบระยะเวลาปิด M1 สำหรับ HAE'],
  ['Slide 8', '1st Milestone AGING Analysis', 'TME M1', -542.98, '', 87, 'เปรียบเทียบระยะเวลาปิด M1 สำหรับ TME'],
  ['Slide 9', '2nd Milestone AGING Analysis', 'HAE M2', '', 18.00, '', 'HAE M2 Avg Aging'],
  ['Slide 9', '2nd Milestone AGING Analysis', 'TME M2 MBB', '', 3.00, '', 'TME M2 MBB Avg Aging'],
  ['Slide 10', 'Performance by PE Owner: Adisak', 'Adisak Chanmao Average', 1.83, '', 87, 'ชื่นชมความรวดเร็วใน M1 แต่เน้นย้ำให้ช่วยผลักดัน M2'],
  ['Slide 11', 'Performance by PE Owner: Palagon', 'Palagon Prommueangma Average', 3.57, '', 169, 'เปรียบเทียบเทคนิคการทำงานเพื่อหา Best Practice'],
  ['Slide 11', 'Performance by PE Owner: Palagon', 'Palagon HAE', 3.57, '', '', 'Palagon HAE M1'],
  ['Slide 11', 'Performance by PE Owner: Palagon', 'Palagon TME', 2.50, '', '', 'Palagon TME M1'],
  ['Slide 12', 'PE Performance Comparison', 'Watch-list', '', '', '', 'สรุปภาพรวมและจัดทำ Watch-list ของไซต์ที่เกิน SLA']
];
xlsx.utils.book_append_sheet(wb, xlsx.utils.aoa_to_sheet(part2Data), "Part 2 - Aging");

// ============================================================
// Part 3: Document Management (Slides 13-19)
// Dashboard reads:
//   - Column 'Owner / Type' for matching
//   - 'AC#1' or 'AC1' → finAC1Aging (reads 'Avg Aging')
//   - 'AC#2' or 'AC2' → finAC2Aging (reads 'Avg Aging')
//   - 'hathairat' + 'AC1' / 'AC2' → docHathairatAC1/AC2 (reads 'Avg Aging')
//   - 'sermsiri' + 'AC1' / 'AC2' → docSermsiriAC1/AC2
//   - 'apichart' + 'AC1' / 'AC2' → docApichartAC1/AC2
//   - 'hathairat AC1' → docHathairatSites (reads 'Sites'), docHathairatAC1Amt (reads 'Amount (THB)')
//   - 'overall team install' → teamInstallBody (reads 'Sites', 'Amount (THB)', 'Avg Aging')
// NOTE: Avg Aging MUST be a NUMBER (not text)
// ============================================================
const part3Data = [
  ['Slide No', 'Slide Title', 'Owner / Type', 'Sites', 'Amount (THB)', 'AC2 Amount', 'Done (THB)', 'Avg Aging', 'Notes'],
  ['Slide 13', 'Acceptance Performance', 'AC#1 (JAN-DEC)', '', 1510000, '', 8290000, 15.5, 'AC#1 Total — Avg Aging ใส่ค่าตัวเลข เช่น 15.5'],
  ['Slide 13', 'Acceptance Performance', 'AC#2 (JAN-DEC)', '', 349000, '', 4700000, 33.0, 'AC#2 Total — Avg Aging ใส่ค่าตัวเลข'],
  ['Slide 14', 'DOC Owner: Hathairat Singkaew', 'Hathairat AC1', 41, 693559, '', '', 15.98, 'AC#1 Avg Aging สำหรับ น.ส.หทัยรัตน์ (ตัวเลขเท่านั้น)'],
  ['Slide 14', 'DOC Owner: Hathairat Singkaew', 'Hathairat AC2', '', '', 50000, '', 33.15, 'AC#2 Avg Aging + AC2 Amount สำหรับ น.ส.หทัยรัตน์'],
  ['Slide 15', 'DOC Owner: Sermsiri Bampentam', 'Sermsiri AC1', 50, 113164, '', '', 15.46, 'AC#1 Avg Aging สำหรับ Sermsiri (ตัวเลขเท่านั้น)'],
  ['Slide 15', 'DOC Owner: Sermsiri Bampentam', 'Sermsiri AC2', '', '', 30000, '', 49.0, 'AC#2 Avg Aging + AC2 Amount สำหรับ Sermsiri'],
  ['Slide 16', 'DOC Owner: Apichart Kampuang', 'Apichart AC1', 26, 138325, '', '', 14.88, 'AC#1 Avg Aging สำหรับ Apichart (ตัวเลขเท่านั้น)'],
  ['Slide 16', 'DOC Owner: Apichart Kampuang', 'Apichart AC2', '', '', 0, '', 0, 'AC#2 Avg Aging สำหรับ Apichart (0 ถ้าไม่มีข้อมูล)'],
  ['Slide 19', 'Overall Team Install', 'Overall Team Install WK27', 45, 113101, '', '', 6, 'WK27: Sites=จำนวนไซต์, Amount=ยอดเงิน, Avg Aging=ตัวเลข'],
  ['Slide 19', 'Overall Team Install', 'Overall Team Install WK28', 62, 201167, '', '', 11, 'WK28: Sites=จำนวนไซต์, Amount=ยอดเงิน, Avg Aging=ตัวเลข'],
  ['Slide 19', 'Work Type Analysis', 'MBB vs IRR/IPTAN', '', '', '', '', '', 'เปรียบเทียบความคล่องตัวในการปิดเอกสาร']
];
xlsx.utils.book_append_sheet(wb, xlsx.utils.aoa_to_sheet(part3Data), "Part 3 - Doc Management");

// ============================================================
// Part 4: Financial & Commercial Analysis (Slides 20-27)
// Dashboard reads column 'Metric' for keywords, 'Value (THB)' for values
//
// ACTUAL ACCEPTANCE WK:
//   Row Metric must match: /^actual acceptance wk\d+$/i
//   e.g. 'Actual Acceptance WK23', 'Actual Acceptance WK24' ...
//
// ACTUAL ACCEPTANCE TOTAL:
//   'Actual Acceptance Total (JAN-JULY) HUAWEI'
//   'Actual Acceptance Total (JAN-JULY) TRUE-TUC'
//   'Actual Acceptance July Total' (JULY Total row)
//
// AC#1 PLAN (per year): Metric='Action Plan AC#1' + Slide Title contains year
//   e.g. Slide Title = 'Acceptance AC#1 Plan (2023)'
//
// AC#2 PLAN (per year): Metric='Action Plan AC#2' + Slide Title contains year
//
// ON-PROCESS ITEMS: Metric matches /on-process/i
//   TME-MBB, TME-IPRAN, TME-BATTERY, HAE-MBB, TRE-DISMANTLE
// ============================================================
const part4Data = [
  ['Slide No', 'Slide Title', 'Metric', 'Value (THB)', 'Notes'],
  // Financial Health
  ['Slide 20', 'Financial Health Overview', 'Estimate Final Income', 3180000, 'ภาพรวมรายได้ประมาณการ'],
  ['Slide 21', 'AR vs AP (Economic Efficiency)', 'AR (Commerce)', 1730000, 'วิเคราะห์ส่วนต่าง (Margin)'],
  ['Slide 21', 'AR vs AP (Economic Efficiency)', 'AP (Payment)', 635000, 'สถานะการเบิกจ่าย Subcontractors'],
  ['Slide 22', 'Unfulfilled Revenue (Remain)', 'Remain to Claim', 1140000, 'เม็ดเงินที่หายไปชั่วคราว'],
  // Backlog — Metric must match /backlog week/i
  ['Slide 23', 'Backlog Development', 'Backlog Week 25', 1500000, 'WK25 Backlog ใส่เป็นตัวเลข'],
  ['Slide 23', 'Backlog Development', 'Backlog Week 26', 1350000, 'WK26 Backlog ใส่เป็นตัวเลข'],
  // Actual Acceptance WK — Metric must be exactly 'Actual Acceptance WK##'
  ['Slide 24', 'Actual Acceptance', 'Actual Acceptance WK23', 0, 'WK23 ยอด Actual Acceptance (ตัวเลข ฿)'],
  ['Slide 24', 'Actual Acceptance', 'Actual Acceptance WK24', 0, 'WK24 ยอด Actual Acceptance (ตัวเลข ฿)'],
  ['Slide 24', 'Actual Acceptance', 'Actual Acceptance WK25', 0, 'WK25 ยอด Actual Acceptance (ตัวเลข ฿)'],
  ['Slide 24', 'Actual Acceptance', 'Actual Acceptance WK26', 0, 'WK26 ยอด Actual Acceptance (ตัวเลข ฿)'],
  ['Slide 24', 'Actual Acceptance', 'Actual Acceptance WK27', 0, 'WK27 ยอด Actual Acceptance (ตัวเลข ฿)'],
  ['Slide 24', 'Actual Acceptance Total', 'Actual Acceptance July Total', 0, 'JULY Total รวม (ตัวเลข ฿)'],
  ['Slide 24', 'Actual Acceptance Total', 'Actual Acceptance Total (JAN-JULY) HUAWEI', 0, 'HUAWEI JAN-JULY (ตัวเลข ฿)'],
  ['Slide 24', 'Actual Acceptance Total', 'Actual Acceptance Total (JAN-JULY) TRUE-TUC', 0, 'TRUE-TUC JAN-JULY (ตัวเลข ฿)'],
  // AC#1 Plan — Slide Title must contain year in format '(2023)' etc.
  ['Slide 25', 'Acceptance AC#1 Plan (2023)', 'Action Plan AC#1', 0, 'AC#1 Plan ปี 2023 (ตัวเลข ฿)'],
  ['Slide 25', 'Acceptance AC#1 Plan (2024)', 'Action Plan AC#1', 0, 'AC#1 Plan ปี 2024 (ตัวเลข ฿)'],
  ['Slide 25', 'Acceptance AC#1 Plan (2025)', 'Action Plan AC#1', 0, 'AC#1 Plan ปี 2025 (ตัวเลข ฿)'],
  ['Slide 25', 'Acceptance AC#1 Plan (2026)', 'Action Plan AC#1', 0, 'AC#1 Plan ปี 2026 (ตัวเลข ฿)'],
  // AC#2 Plan — Slide Title must contain year
  ['Slide 25', 'Acceptance AC#2 Plan (2023)', 'Action Plan AC#2', 0, 'AC#2 Plan ปี 2023 (ตัวเลข ฿)'],
  ['Slide 25', 'Acceptance AC#2 Plan (2024)', 'Action Plan AC#2', 0, 'AC#2 Plan ปี 2024 (ตัวเลข ฿)'],
  ['Slide 25', 'Acceptance AC#2 Plan (2025)', 'Action Plan AC#2', 0, 'AC#2 Plan ปี 2025 (ตัวเลข ฿)'],
  ['Slide 25', 'Acceptance AC#2 Plan (2026)', 'Action Plan AC#2', 0, 'AC#2 Plan ปี 2026 (ตัวเลข ฿)'],
  // On-Process Items — Metric must match /on-process/i and contain project name
  ['Slide 26', 'Install On-Process', 'On-Process TME-MBB', 230347, 'TME-MBB On-Process Amount (ตัวเลข ฿)'],
  ['Slide 26', 'Install On-Process', 'On-Process TME-IPRAN', 225486, 'TME-IPRAN On-Process Amount'],
  ['Slide 26', 'Install On-Process', 'On-Process TME-BATTERY', 5107, 'TME-BATTERY On-Process Amount'],
  ['Slide 26', 'Install On-Process', 'On-Process HAE-MBB', 3348098, 'HAE-MBB On-Process Amount'],
  ['Slide 26', 'Install On-Process', 'On-Process TRE-DISMANTLE', 0, 'TRE-DISMANTLE On-Process Amount'],
  // Action Plan Total
  ['Slide 27', 'Action Plan Total', 'Action Plan Total WK26', 0, 'Action Plan Total WK## ล่าสุด (ตัวเลข ฿)'],
  ['Slide 27', 'Summary of REMAIN (3 Pillars)', 'AC1 DONE / UNFULFILL / Total', '', 'สรุปภาพรวมยอดค้าง 3 ส่วนหลัก']
];
xlsx.utils.book_append_sheet(wb, xlsx.utils.aoa_to_sheet(part4Data), "Part 4 - Financials");

// Part 5: Safety & Compliance (Slides 28-29)
const part5Data = [
  ['Slide No', 'Slide Title', 'Topic / Metric', 'Status / Detail'],
  ['Slide 28', 'EHS Compliance & Safety', 'Zero Accident Target', 'มาตรฐานความปลอดภัยไม่ประนีประนอม'],
  ['Slide 29', 'High-Risk Site Monitoring', 'Issues & Prevention', 'ประเด็นปัญหาที่เกิดขึ้นและมาตรการป้องกัน']
];
xlsx.utils.book_append_sheet(wb, xlsx.utils.aoa_to_sheet(part5Data), "Part 5 - Safety");

// Part 6: Conclusion (Slide 30)
const part6Data = [
  ['Slide No', 'Slide Title', 'Action Item', 'Assignee', 'Deadline / Notes'],
  ['Slide 30', 'Next Steps & Action Plan', 'Immediate Actions Week 27', 'PE, DOC Owner, Finance', 'แผนปฏิบัติการที่ต้องทำทันที พร้อมนัดหมายติดตามผล']
];
xlsx.utils.book_append_sheet(wb, xlsx.utils.aoa_to_sheet(part6Data), "Part 6 - Conclusion");

xlsx.writeFile(wb, 'Dashboard_Template_30_Slides_Final.xlsx');
console.log('✅ Created Dashboard_Template_30_Slides_Final.xlsx — all fields aligned with dashboard parsing logic');
