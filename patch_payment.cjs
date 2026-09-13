const fs = require('fs');
let file = fs.readFileSync('src/app/staff/payment/PaymentView.tsx', 'utf8');

// Add import for FinancialPlanBuilder
if (!file.includes('FinancialPlanBuilder')) {
  file = file.replace(
    /import { Appointment, STATUS_COLORS, AppointmentStatus, ServiceInfo } from "\.\.\/\.\.\/shared\/data";/,
    `import { Appointment, STATUS_COLORS, AppointmentStatus, ServiceInfo } from "../../shared/data";\nimport FinancialPlanBuilder from "./FinancialPlanBuilder";`
  );
}

// Add Package icon if missing
if (!file.includes('Package') && file.includes('lucide-react')) {
  file = file.replace(/from "lucide-react";/, `, Package } from "lucide-react";`);
}

// Add state for FinancialPlanBuilder
if (!file.includes('showFinancialBuilder')) {
  file = file.replace(
    /const \[activePlan, setActivePlan\] = useState<any \| null>\(null\);/,
    `const [activePlan, setActivePlan] = useState<any | null>(null);\n  const [showFinancialBuilder, setShowFinancialBuilder] = useState(false);`
  );
}

// Replace the total_cost display with the button logic
const oldCostDisplay = `<span className="text-xs font-medium px-2 py-1 bg-white rounded-md text-blue-700 border border-blue-200">
                      ยอดรวม ฿{(activePlan.total_cost || 0).toLocaleString()}
                    </span>`;
const oldCostDisplayUnix = `<span className="text-xs font-medium px-2 py-1 bg-white rounded-md text-blue-700 border border-blue-200">\n                      ยอดรวม ฿{(activePlan.total_cost || 0).toLocaleString()}\n                    </span>`;

const newCostDisplay = `{(!activePlan.total_cost || activePlan.total_cost === 0) ? (
                      <button onClick={() => setShowFinancialBuilder(true)} className="text-xs font-bold px-3 py-1 bg-orange-500 rounded-md text-white hover:bg-orange-600 shadow-sm flex items-center gap-1">
                        <Package size={14} /> ตั้งค่าโปรโมชั่น / ค่างวด
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-2 py-1 bg-white rounded-md text-blue-700 border border-blue-200">
                          ยอดรวม ฿{(activePlan.total_cost || 0).toLocaleString()}
                        </span>
                        <button onClick={() => setShowFinancialBuilder(true)} className="text-[10px] text-blue-500 hover:underline">แก้ไข</button>
                      </div>
                    )}`;

if (file.includes(oldCostDisplay)) {
  file = file.replace(oldCostDisplay, newCostDisplay);
} else if (file.includes(oldCostDisplayUnix)) {
  file = file.replace(oldCostDisplayUnix, newCostDisplay);
} else {
  console.log("Could not find the target string for cost display.");
}

// Add the FinancialPlanBuilder modal at the end of the return
if (!file.includes('<FinancialPlanBuilder')) {
  const endDiv = `    </div>\n  );\n}`;
  const newEndDiv = `      {showFinancialBuilder && activePlan && (
        <FinancialPlanBuilder 
          plan={activePlan} 
          onClose={() => setShowFinancialBuilder(false)} 
          onSuccess={() => {
            setShowFinancialBuilder(false);
            import('../../shared/supabaseApi').then(({ getPatientActiveTreatmentPlan }) => {
              getPatientActiveTreatmentPlan(activePlan.patient_id).then(plan => {
                setActivePlan(plan);
              });
            });
          }} 
        />
      )}
    </div>
  );
}`;
  file = file.replace(endDiv, newEndDiv);
}

fs.writeFileSync('src/app/staff/payment/PaymentView.tsx', file);
