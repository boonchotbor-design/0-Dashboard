const fs = require('fs');
const filePath = 'c:/0_Dashboad/public/summary.html';
let content = fs.readFileSync(filePath, 'utf8');

// Find the bad block from after dtlAC2Total setUI to before "Update Charts dynamically"
const anchor = "setUI('dtlAC2Total', fmtB((Number(vAc223)||0)+(Number(vAc224)||0)+(Number(vAc225)||0)+(Number(vAc226)||0)));";
const endAnchor = '          /* \u2500\u2500\u2500 Update Charts dynamically \u2500\u2500\u2500 */';

const startIdx = content.indexOf(anchor);
const endIdx = content.indexOf(endAnchor);

if (startIdx > -1 && endIdx > -1) {
  const replacement = `setUI('dtlAC2Total', fmtB((Number(vAc223)||0)+(Number(vAc224)||0)+(Number(vAc225)||0)+(Number(vAc226)||0)));

          /* \u2500\u2500\u2500 Update Charts dynamically \u2500\u2500\u2500 */`;
  content = content.substring(0, startIdx) + replacement + content.substring(endIdx + endAnchor.length);
  fs.writeFileSync(filePath, content);
  console.log('Fixed block successfully');
} else {
  console.log('Anchors not found. startIdx:', startIdx, 'endIdx:', endIdx);
}
