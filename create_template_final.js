const xlsx = require('xlsx');
const wb = xlsx.utils.book_new();

// Part 1: Executive Summary & Project Overview (Slides 1-6)
const part1Data = [
  ['Slide No', 'Slide Title', 'Metric / Data Point', 'Value', 'Notes / Key Message'],
  ['Slide 1', 'Title Slide', 'Report Week', '26', 'สรุปผลการดำเนินงานโครงการติดตั้งโครงข่ายโทรคมนาคม HAE และ TME ประจำสัปดาห์ที่ 26'],
  ['Slide 2', 'Executive Bottom Line', 'HAE M1 Avg', '365.56 วัน', 'หน้างานยังคงเดินหน้าอย่างรวดเร็ว แต่ระบบเอกสารยังมีปัญหาคอขวด'],
  ['Slide 2', 'Executive Bottom Line', 'TME M1 Avg', '-542.98 วัน', 'ข้อมูลดิบอาจมีความคลาดเคลื่อนในระบบ'],
  ['Slide 3', 'Portfolio Performance Snapshot', 'Overall Progress', '', 'สัดส่วนของ HAE และ TME ในพอร์ตโฟลิโอทั้งหมด'],
  ['Slide 4', 'Smart QC Overview', 'Pass Rate', '', 'อัตราการผ่านการตรวจสอบคุณภาพเปรียบเทียบสองโครงการ'],
  ['Slide 5', 'Operation Error & Defect Analysis', 'Defect Issue 1', '', 'การขาดอุปกรณ์ป้องกัน PPE / ส่งข้อมูลไม่ครบ'],
  ['Slide 6', 'Improvement Plan for On-Site Quality', 'Action Plan', '', 'บูรณาการ AIS SPE Standards อย่างเคร่งครัด']
];
xlsx.utils.book_append_sheet(wb, xlsx.utils.aoa_to_sheet(part1Data), "Part 1 - Overview");

// Part 2: Aging & Milestone Efficiency (Slides 7-12)
const part2Data = [
  ['Slide No', 'Slide Title', 'Category / Person', 'M1 Aging', 'M2 Aging', 'Notes'],
  ['Slide 7', 'The Execution Paradox', 'Overall Bottleneck', '', '', 'หน้างานทำได้เร็ว แต่กระบวนการตรวจรับเอกสารล่าช้า'],
  ['Slide 8', '1st Milestone AGING Analysis', 'HAE', '365.56', '', 'เปรียบเทียบระยะเวลาปิด M1'],
  ['Slide 8', '1st Milestone AGING Analysis', 'TME', '', '', 'เปรียบเทียบระยะเวลาปิด M1'],
  ['Slide 9', '2nd Milestone AGING Analysis', 'Overall M2', '', '', 'ความท้าทายในการปิดเอกสาร M2 ที่กินระยะเวลานาน'],
  ['Slide 10', 'Performance by PE Owner: Adisak', 'Adisak Chanmao', '1.83', '', 'ชื่นชมความรวดเร็วใน M1 แต่เน้นย้ำให้ช่วยผลักดัน M2'],
  ['Slide 11', 'Performance by PE Owner: Palagon', 'Palagon Prommueangma', '', '', 'เปรียบเทียบเทคนิคการทำงานเพื่อหา Best Practice'],
  ['Slide 12', 'PE Performance Comparison', 'Watch-list', '', '', 'สรุปภาพรวมและจัดทำ Watch-list ของไซต์ที่เกิน SLA']
];
xlsx.utils.book_append_sheet(wb, xlsx.utils.aoa_to_sheet(part2Data), "Part 2 - Aging");

// Part 3: Document Management (Slides 13-19)
const part3Data = [
  ['Slide No', 'Slide Title', 'Owner / Type', 'Sites', 'Amount (THB)', 'AC2 Amount', 'Done (THB)', 'Avg Aging', 'Notes'],
  ['Slide 13', 'Document Owner Performance', 'AC#1 (JAN-DEC)', '', '1510000', '', '8290000', '', 'AC#1 Total Amount / Done'],
  ['Slide 13', 'Document Owner Performance', 'AC#2 (JAN-DEC)', '', '349000', '', '4700000', '', 'AC#2 Total Amount / Done'],
  ['Slide 14', 'DOC Owner: Hathairat Singkaew', 'Hathairat AC1', '41', '693559', '', '', '', 'AC#1 Aging สำหรับ น.ส.หทัยรัตน์'],
  ['Slide 14', 'DOC Owner: Hathairat Singkaew', 'Hathairat AC2', '', '', '0', '', '', 'AC#2 Aging / Amount สำหรับ น.ส.หทัยรัตน์'],
  ['Slide 15', 'DOC Owner: Sermsiri Bampentam', 'Sermsiri AC1', '50', '113164', '', '', '', 'AC#1 Aging สำหรับ Sermsiri (IPRAN/TME)'],
  ['Slide 15', 'DOC Owner: Sermsiri Bampentam', 'Sermsiri AC2', '', '', '0', '', '', 'AC#2 Aging / Amount สำหรับ Sermsiri'],
  ['Slide 16', 'DOC Owner: Apichart Kampuang', 'Apichart AC1', '26', '138325', '', '', '', 'AC#1 Aging สำหรับ Apichart (MBB/HAE)'],
  ['Slide 16', 'DOC Owner: Apichart Kampuang', 'Apichart AC2', '', '', '0', '', '', 'AC#2 Aging / Amount สำหรับ Apichart'],
  ['Slide 19', 'Overall Team Install WK27', 'Overall Team Install WK27', '45', '113101', '', '', '6', 'WK27: จำนวน site / Amount / Avg Aging'],
  ['Slide 19', 'Overall Team Install WK28', 'Overall Team Install WK28', '62', '201167', '', '', '11', 'WK28: จำนวน site / Amount / Avg Aging'],
  ['Slide 19', 'Work Type Analysis', 'MBB vs IRR/IPTAN', '', '', '', '', '', 'เปรียบเทียบความคล่องตัวในการปิดเอกสาร']
];
xlsx.utils.book_append_sheet(wb, xlsx.utils.aoa_to_sheet(part3Data), "Part 3 - Doc Management");

// Part 4: Financial & Commercial Analysis (Slides 20-27)
const part4Data = [
  ['Slide No', 'Slide Title', 'Metric', 'Value (THB)', 'Notes'],
  ['Slide 20', 'Financial Health Overview', 'Estimate Final Income', '3180000', 'ภาพรวมรายได้ประมาณการ'],
  ['Slide 21', 'AR vs AP (Economic Efficiency)', 'AR (Commerce)', '1730000', 'วิเคราะห์ส่วนต่าง (Margin)'],
  ['Slide 21', 'AR vs AP (Economic Efficiency)', 'AP (Payment)', '635000', 'สถานะการเบิกจ่าย Subcontractors'],
  ['Slide 22', 'Unfulfilled Revenue (Remain)', 'Remain to Claim', '1140000', 'เม็ดเงินที่หายไปชั่วคราว'],
  ['Slide 23', 'Backlog Development', 'Backlog Week 25', '', 'เปรียบเทียบเป้าหมายการเก็บเงินระหว่างสัปดาห์'],
  ['Slide 23', 'Backlog Development', 'Backlog Week 26', '', 'กราฟเส้นแนวโน้มยอดคงค้าง'],
  ['Slide 24', 'Recovery Plan: Acceptance Plan', 'Target JUNE', '', 'ยอด Remain ที่ตั้งเป้าจะเคลียร์ (2023-2026)'],
  ['Slide 25', 'Recovery Plan: Action Plan AC#2', 'Action Plan AC#2', '', 'แผนผลักดัน AC#2 สู่การรับรู้รายได้'],
  ['Slide 26', 'Recovery Plan: Install On-Process', 'On-Process (2026)', '', 'มูลค่างาน In-house ที่อยู่ระหว่างดำเนินการ'],
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
console.log('Successfully created Dashboard_Template_30_Slides_Final.xlsx');
