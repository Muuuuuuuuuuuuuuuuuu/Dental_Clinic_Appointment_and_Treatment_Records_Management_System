const fs = require('fs');
let builderFile = fs.readFileSync('src/app/dentist/treatment/TreatmentPlanBuilder.tsx', 'utf8');

// 1. Remove state variables
builderFile = builderFile.replace(/  const \[totalCost, setTotalCost\] = useState<number>\(40000\);\r?\n/, '');
builderFile = builderFile.replace(/  const \[downPayment, setDownPayment\] = useState<number>\(3000\);\r?\n/, '');
builderFile = builderFile.replace(/  const \[downPaymentMonths, setDownPaymentMonths\] = useState<number>\(3\);\r?\n/, '');

// 2. Remove totalCost from useEffect existingPlan
builderFile = builderFile.replace(/      if \(existingPlan.total_cost\) setTotalCost\(existingPlan.total_cost\);\r?\n/, '');

// 3. Update handleSave inserting treatment_plan
builderFile = builderFile.replace(
  /          dentist_id: dentistIdVal,\r?\n          total_cost: totalCost\r?\n        }\)\.select\(\);/,
  "          dentist_id: dentistIdVal,\n          total_cost: 0 // Financial plan will be set by staff\n        }).select();"
);

// 4. Remove installments generation logic
const installmentLogicStart = builderFile.indexOf('// --- 1. Create Installments ---');
const installmentLogicEnd = builderFile.indexOf('// Insert all months into treatment_plan_item');
if (installmentLogicStart !== -1 && installmentLogicEnd !== -1) {
  builderFile = builderFile.slice(0, installmentLogicStart) + builderFile.slice(installmentLogicEnd);
}

// 5. Remove the UI for pricing
const uiStartStr = `            <div>\r
              <label className="block text-sm font-medium text-slate-700 mb-1">ราคาแพ็กเกจเต็ม (บาท)</label>`;
const uiEndStr = `            <div className="w-full h-px bg-slate-200 my-2"></div>`;

const uiStartStrUnix = `            <div>\n              <label className="block text-sm font-medium text-slate-700 mb-1">ราคาแพ็กเกจเต็ม (บาท)</label>`;
const uiEndStrUnix = `            <div className="w-full h-px bg-slate-200 my-2"></div>`;

let startIdx = builderFile.indexOf(uiStartStr);
if (startIdx === -1) startIdx = builderFile.indexOf(uiStartStrUnix);

let endIdx = builderFile.indexOf(uiEndStr);
if (endIdx === -1) endIdx = builderFile.indexOf(uiEndStrUnix);

if (startIdx !== -1 && endIdx !== -1) {
  builderFile = builderFile.slice(0, startIdx) + builderFile.slice(endIdx + uiEndStr.length + 1);
}

fs.writeFileSync('src/app/dentist/treatment/TreatmentPlanBuilder.tsx', builderFile);
