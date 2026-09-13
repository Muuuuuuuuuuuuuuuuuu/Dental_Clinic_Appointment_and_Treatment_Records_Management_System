const fs = require('fs');
const lines = fs.readFileSync('src/app/staff/payment/PaymentView.tsx', 'utf8').split('\n');

const out = [];
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  
  if (line.includes('activePlan.total_cost || 0') && lines[i-1].includes('activePlan.plan_name')) {
    out.push(`                    {(!activePlan.total_cost || activePlan.total_cost === 0) ? (
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
                    )}`);
    // Skip the next line as well (the closing </span>)
    i++; 
  } else {
    out.push(line);
  }
}

fs.writeFileSync('src/app/staff/payment/PaymentView.tsx', out.join('\n'));
