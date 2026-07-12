const fs = require('fs');
let h = fs.readFileSync('public/summary.html', 'utf8');

const regex = /const VALUE_IDS = \[\s*([\s\S]*?)\s*\];/;
const replacement = `const VALUE_IDS = [
            'weekBadge',
            'kpiTotalSites', 'kpiTotalSitesSub', 'kpiTotalSitesTrend',
            'kpiIncome', 'kpiIncomeSub', 'kpiBacklog', 'kpiBacklogSub',
            'kpiHaeAging', 'kpiHaeAgingSub',
            'kpiQC', 'kpiQCSub',
            'kpiActionPlan', 'kpiActionPlanSub',
            'finIncome', 'finAR', 'finAP', 'finBacklog', 'finAC2Target', 'finActionPlan', 'finOnProcess',
            'finAC1Aging', 'finAC2Aging',
            'dtlActWK23', 'dtlActWK24', 'dtlActWK25', 'dtlActWK26', 'dtlActWK27', 'dtlActJUNE', 'dtlActHuawei', 'dtlActTrueTuc',
            'dtlAC12023', 'dtlAC12024', 'dtlAC12025', 'dtlAC12026', 'dtlAC1Total',
            'dtlAC1WK28_2023', 'dtlAC1WK28_2024', 'dtlAC1WK28_2025', 'dtlAC1WK28_2026', 'dtlAC1WK28Total',
            'dtlAC22023', 'dtlAC22024', 'dtlAC22025', 'dtlAC22026', 'dtlAC2Total',
            'dtlAC2WK28_2023', 'dtlAC2WK28_2024', 'dtlAC2WK28_2025', 'dtlAC2WK28_2026', 'dtlAC2WK28Total',
            'dtlOnProcMBB', 'dtlOnProcIPRAN', 'dtlOnProcBATT', 'dtlOnProcHAEMBB', 'dtlOnProcTRE',
            'remAC1done2023', 'remAC1done2024', 'remAC1done2025', 'remAC1done2026', 'remAC1doneTotal',
            'remUnfulfill2023', 'remUnfulfill2024', 'remUnfulfill2025', 'remUnfulfill2026', 'remUnfulfillTotal',
            'rem3pillarsAC1', 'rem3pillarsUnfulfill', 'rem3pillarsTotal',
            'peAdisakSites', 'peAdisakM1', 'peAdisakM2', 'peAdisakHae', 'peAdisakTme',
            'pePalagonSites', 'pePalagonM1', 'pePalagonM2', 'pePalagonHae', 'pePalagonTme',
            'docInstallAmtWK25', 'docInstallAgeWK25', 'docInstallAmtWK26', 'docInstallAgeWK26',
            'docHathairatAC1', 'docSermsiriAC2', 'docApichartAC1',
            'ehsZeroAccident', 'ehsHighRisk',
            'conclusionAction', 'conclusionAssignee', 'conclusionDeadline',
            'legendCompleted', 'legendOnProcess', 'legendRemaining',
            'totalSitesText', 'projectBreakdownText',
            'slaSmartQcBody', 'slaPatSubconBody', 'slaReworkBody', 'teamInstallBody',
            'soCompareBody', 'milestoneWorkTypeBody', 'soWk1Head', 'soWk2Head',
            'blWkLabel', 'blWk1Label', 'blWk2Label', 'blWk1Val', 'blWk2Val', 'blDiff',
            'rawAc1Amt', 'rawAc1Aging', 'rawAc2Amt', 'rawAc2Aging',
            'execHaeM1', 'execHaeM1Notes', 'execTmeM1', 'execTmeM1Notes',
            'qcInspected', 'qcPassRate', 'qcDefectNotes', 'qcImprovementNotes',
            'executionParadoxNotes', 'workTypeNotes',
            'sumQcDone', 'sumQcLate', 'sumQcPend', 'sumQcOver',
            'sumPatDone', 'sumPatLate', 'sumPatPend', 'sumPatOver'
          ];`;
h = h.replace(regex, replacement);
fs.writeFileSync('public/summary.html', h);
console.log('Done replacing IDs.');
