const fs = require('fs');
const filePath = 'c:/0_Dashboad/public/summary.html';
let content = fs.readFileSync(filePath, 'utf8');

// Helper to escape regex
const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Normalize whitespace for easier replacement
const replaceFlexible = (oldStr, newStr) => {
    // Create a regex that allows variable whitespace where there was whitespace
    let pattern = escapeRegExp(oldStr).replace(/\\s+/g, '\\s+');
    const regex = new RegExp(pattern);
    if(regex.test(content)) {
        content = content.replace(regex, newStr);
        console.log("Replaced successfully:", oldStr.substring(0, 30) + "...");
    } else {
        console.log("FAILED to find:", oldStr.substring(0, 30) + "...");
    }
};

// 1. Add reportWeek variable
replaceFlexible(
  'let importedSheets = [];\n\n          /* ─── Part 1 - Overview ─── */',
  'let importedSheets = [];\n          let reportWeek = 28;\n\n          /* ─── Part 1 - Overview ─── */'
);

// 2. Set reportWeek from Part 1
replaceFlexible(
  "const week = findMetric(p1, 'report week', 'Value');\n            if (week) document.getElementById('weekBadge').textContent = `WEEK ${week} · 2026`;",
  "const week = findMetric(p1, 'report week', 'Value');\n            if (week) {\n              reportWeek = parseInt(week) || 28;\n              document.getElementById('weekBadge').textContent = `WEEK ${week} · 2026`;\n            }"
);

// 3. Dynamic Actual Acceptance
const actualAcceptanceOld = `            // Actual Acceptance by week
            const vAct23 = getVal('actual acceptance wk23');
            const vAct24 = getVal('actual acceptance wk24');
            const vAct25 = getVal('actual acceptance wk25');
            const vAct26 = getVal('actual acceptance wk26');
            const vActJune = getVal('actual acceptance june');`;
const actualAcceptanceNew = `            // Actual Acceptance by week (Dynamic)
            const vAct23 = getVal(\`actual acceptance wk\${reportWeek - 4}\`);
            const vAct24 = getVal(\`actual acceptance wk\${reportWeek - 3}\`);
            const vAct25 = getVal(\`actual acceptance wk\${reportWeek - 2}\`);
            const vAct26 = getVal(\`actual acceptance wk\${reportWeek - 1}\`);
            const vActJune = getVal('actual acceptance june');
            
            // Update UI labels
            const setLbl = (id, text) => { const el = document.getElementById(id); if(el) el.textContent = text; };
            setLbl('lblActWk1', \`WK\${reportWeek - 4}\`);
            setLbl('lblActWk2', \`WK\${reportWeek - 3}\`);
            setLbl('lblActWk3', \`WK\${reportWeek - 2}\`);
            setLbl('lblActWk4', \`WK\${reportWeek - 1}\`);
            setLbl('lblActWk5', \`WK\${reportWeek}\`);`;
replaceFlexible(actualAcceptanceOld, actualAcceptanceNew);

// 4. Dynamic AC#1 and AC#2 for wk27 (Target - 1)
const ac12Old = `            // AC#1 plan by year — Metric = 'Action Plan AC#1 WK27', year in Slide Title
            let vAc123 = getValByTitleRegex(/action plan ac#?1 wk27/i, '2023');
            let vAc124 = getValByTitleRegex(/action plan ac#?1 wk27/i, '2024');
            let vAc125 = getValByTitleRegex(/action plan ac#?1 wk27/i, '2025');
            let vAc126 = getValByTitleRegex(/action plan ac#?1 wk27/i, '2026');

            // AC#2 plan by year — Metric = 'Action Plan AC#2 WK27', year in Slide Title
            let vAc223 = getValByTitleRegex(/action plan ac#?2 wk27/i, '2023');
            let vAc224 = getValByTitleRegex(/action plan ac#?2 wk27/i, '2024');
            let vAc225 = getValByTitleRegex(/action plan ac#?2 wk27/i, '2025');
            let vAc226 = getValByTitleRegex(/action plan ac#?2 wk27/i, '2026');`;
const ac12New = `            // AC#1 plan by year — Dynamic for reportWeek - 1
            let reAc1Prev = new RegExp(\`action plan ac#?1 wk\${reportWeek - 1}\`, 'i');
            let vAc123 = getValByTitleRegex(reAc1Prev, '2023');
            let vAc124 = getValByTitleRegex(reAc1Prev, '2024');
            let vAc125 = getValByTitleRegex(reAc1Prev, '2025');
            let vAc126 = getValByTitleRegex(reAc1Prev, '2026');

            // AC#2 plan by year — Dynamic for reportWeek - 1
            let reAc2Prev = new RegExp(\`action plan ac#?2 wk\${reportWeek - 1}\`, 'i');
            let vAc223 = getValByTitleRegex(reAc2Prev, '2023');
            let vAc224 = getValByTitleRegex(reAc2Prev, '2024');
            let vAc225 = getValByTitleRegex(reAc2Prev, '2025');
            let vAc226 = getValByTitleRegex(reAc2Prev, '2026');`;
replaceFlexible(ac12Old, ac12New);


// 5. Dynamic setting of setEl WK27 -> WK
const setElWk27Old = `            const vActWK27 = getVal('actual acceptance wk27');
            setEl('dtlActWK23', vAct23); setEl('dtlActWK24', vAct24); setEl('dtlActWK25', vAct25);
            setEl('dtlActWK26', vAct26); setEl('dtlActWK27', vActWK27); setEl('dtlActJUNE', vActJune);

            const vActHuawei = getValByTitleRegex(/actual acceptance total/i, 'huawei');
            const vActTrue = getValByTitleRegex(/actual acceptance total/i, 'true-tuc');
            setEl('dtlActHuawei', vActHuawei); setEl('dtlActTrueTuc', vActTrue);

            // WK27 cards now show only total (single row in Excel)
            const vAc1WK27Total = getVal('action plan ac#1 wk27');
            const vAc2WK27Total = getVal('action plan ac#2 wk27');`;
const setElWk27New = `            const vActWK27 = getVal(\`actual acceptance wk\${reportWeek}\`);
            setEl('dtlActWK23', vAct23); setEl('dtlActWK24', vAct24); setEl('dtlActWK25', vAct25);
            setEl('dtlActWK26', vAct26); setEl('dtlActWK27', vActWK27); setEl('dtlActJUNE', vActJune);

            const vActHuawei = getValByTitleRegex(/actual acceptance total/i, 'huawei');
            const vActTrue = getValByTitleRegex(/actual acceptance total/i, 'true-tuc');
            setEl('dtlActHuawei', vActHuawei); setEl('dtlActTrueTuc', vActTrue);

            // WK-1 cards now show only total (single row in Excel)
            const vAc1WK27Total = getVal(\`action plan ac#1 wk\${reportWeek - 1}\`);
            const vAc2WK27Total = getVal(\`action plan ac#2 wk\${reportWeek - 1}\`);
            
            // Update labels dynamically for AC tables
            setLbl('lblAc1PrevWk', \`WK\${reportWeek - 1}\`);
            setLbl('lblAc2PrevWk', \`WK\${reportWeek - 1}\`);
            setLbl('lblAc1LatestWk', \`WK\${reportWeek}\`);
            setLbl('lblAc2LatestWk', \`WK\${reportWeek}\`);`;
replaceFlexible(setElWk27Old, setElWk27New);


// 6. Dynamic Wk28 (Current Week)
const wk28Old = `            const vAc1Wk28_23 = getValByTitleRegex(/action plan ac#?1 wk28/i, '2023');
            const vAc1Wk28_24 = getValByTitleRegex(/action plan ac#?1 wk28/i, '2024');
            const vAc1Wk28_25 = getValByTitleRegex(/action plan ac#?1 wk28/i, '2025');
            const vAc1Wk28_26 = getValByTitleRegex(/action plan ac#?1 wk28/i, '2026');
            const vAc1Wk28Tot = getValByTitleRegex(/action plan ac#?1 total/i, 'total') || getValByTitleRegex(/action plan ac#?1 wk28/i, 'total');

            const vAc2Wk28_23 = getValByTitleRegex(/action plan ac#?2 wk28/i, '2023');
            const vAc2Wk28_24 = getValByTitleRegex(/action plan ac#?2 wk28/i, '2024');
            const vAc2Wk28_25 = getValByTitleRegex(/action plan ac#?2 wk28/i, '2025');
            const vAc2Wk28_26 = getValByTitleRegex(/action plan ac#?2 wk28/i, '2026');
            const vAc2Wk28Tot = getValByTitleRegex(/action plan ac#?2 total/i, 'total') || getValByTitleRegex(/action plan ac#?2 wk28/i, 'total');`;

const wk28New = `            let reAc1Latest = new RegExp(\`action plan ac#?1 wk\${reportWeek}\`, 'i');
            const vAc1Wk28_23 = getValByTitleRegex(reAc1Latest, '2023');
            const vAc1Wk28_24 = getValByTitleRegex(reAc1Latest, '2024');
            const vAc1Wk28_25 = getValByTitleRegex(reAc1Latest, '2025');
            const vAc1Wk28_26 = getValByTitleRegex(reAc1Latest, '2026');
            const vAc1Wk28Tot = getValByTitleRegex(/action plan ac#?1 total/i, 'total') || getValByTitleRegex(reAc1Latest, 'total');

            let reAc2Latest = new RegExp(\`action plan ac#?2 wk\${reportWeek}\`, 'i');
            const vAc2Wk28_23 = getValByTitleRegex(reAc2Latest, '2023');
            const vAc2Wk28_24 = getValByTitleRegex(reAc2Latest, '2024');
            const vAc2Wk28_25 = getValByTitleRegex(reAc2Latest, '2025');
            const vAc2Wk28_26 = getValByTitleRegex(reAc2Latest, '2026');
            const vAc2Wk28Tot = getValByTitleRegex(/action plan ac#?2 total/i, 'total') || getValByTitleRegex(reAc2Latest, 'total');`;
replaceFlexible(wk28Old, wk28New);

fs.writeFileSync(filePath, content);
console.log('Successfully updated summary.html');
