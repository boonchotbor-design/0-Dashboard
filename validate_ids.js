const fs = require('fs');
const html = fs.readFileSync('C:/0_Dashboad/public/summary.html', 'utf8');

const ids = [
  'docHathairatSites','docHathairatAC1','docHathairatAC1MinMax','docHathairatAC2','docHathairatAC2MinMax',
  'docSermsiriSites','docSermsiriAC1','docSermsiriAC1MinMax','docSermsiriAC2','docSermsiriAC2MinMax',
  'docApichartSites','docApichartAC1','docApichartAC1MinMax','docApichartAC2','docApichartAC2MinMax',
  'docAdisakSites','docAdisakAC1','docAdisakAC1MinMax','docAdisakAC2','docAdisakAC2MinMax',
  'peAdisakSites','peAdisakMS1Avg','peAdisakMS1MinMax','peAdisakMS2Avg','peAdisakMS2MinMax',
  'pePalagonSites','pePalagonMS1Avg','pePalagonMS1MinMax','pePalagonMS2Avg','pePalagonMS2MinMax'
];
let allOk = true;
ids.forEach(id => {
  const pattern = 'id="' + id + '"';
  if (!html.includes(pattern)) { console.log('MISSING ID:', id); allOk = false; }
});
if (allOk) console.log('All IDs present OK');

const jsRefs = ['s26HeaderRow','s26DocOwnerIdx','s26PEOwnerIdx','s26MS1AgingIdx','s26MS2AgingIdx','agingBadgeClass'];
jsRefs.forEach(ref => {
  const count = (html.match(new RegExp(ref, 'g')) || []).length;
  console.log(ref + ':', count, 'occurrence(s)');
});
