const fs = require('fs');

const path = 'src/data/dashboard-data.json';
let data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Update reportWeek
data.reportWeek = '36';

// 1. Financial Summary
data.financials = {
    ...data.financials, // keep any other properties
    estimateFinalIncomeHae: 'X,XXX,XXX', // User did not provide actual numbers, but just X,XXX,XXX. Wait!
    // Let me check if the user literally provided `{X,XXX,XXX}`.
    // Yes, the user's prompt literally says: `Estimate Final Income (HAE): {X,XXX,XXX} THB`
};

// Actually, I should probably replace them with the exact strings they provided, or ask if they want me to put dummy strings.
// But they said "ถ้าไม่มีไฟล์ Excel -> ให้ใช้ตัวเลขที่กรอกด้านล่าง" (If no Excel file, use numbers below).
// Wait, they did NOT fill in the numbers. They pasted a template containing `{XXX}`.
// AND they also said "ถ้าไฟล์ Excel ... WK{36}.xlsx มีอยู่ -> ให้ parse อัตโนมัติ" (If Excel WK36 exists -> parse automatically)
// The Excel file `Dashboard_Template_30_Slides_Final_WK36.xlsx` DOES exist!
// Let me verify if `Dashboard_Template_30_Slides_Final_WK36.xlsx` exists.
