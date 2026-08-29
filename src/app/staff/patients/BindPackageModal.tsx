import React, { useState, useEffect } from "react";
import { supabase } from "../../shared/supabaseApi";
import { X, Save, Plus } from "lucide-react";

export default function BindPackageModal({ 
  planId, 
  planMonths, 
  onClose, 
  onSuccess 
}: { 
  planId: number; 
  planMonths: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('treatment_package').select('*').eq('is_active', true).then(({data}) => {
      if (data) setPackages(data);
    });
  }, []);

  const handleBind = async () => {
    if (!selectedPkg) return alert("กรุณาเลือกโปรโมชั่น/แพ็กเกจ");
    setLoading(true);
    try {
      const pkg = packages.find(p => p.package_id === Number(selectedPkg));
      
      // 1. Update treatment_plan with package_id and total_cost
      await supabase.from('treatment_plan').update({
        package_id: pkg.package_id,
        total_cost: pkg.total_cost
      }).eq('plan_id', planId);
      
      // 2. Generate Installments based on config
      const configs = pkg.installments_config || [];
      const instPayload = [];
      let currentMonth = 1;
      
      // Find default config
      const defaultCfg = configs.find((c: any) => c.month === "default");
      const specificCfgs = configs.filter((c: any) => c.month !== "default").sort((a:any, b:any) => a.month - b.month);
      
      let remainingCost = pkg.total_cost;
      
      while (remainingCost > 0 && currentMonth <= planMonths) { // limit to planMonths or until cost is 0
        const sp = specificCfgs.find((c: any) => c.month === currentMonth);
        let amount = 0;
        if (sp) {
          amount = sp.amount;
        } else if (defaultCfg) {
          amount = defaultCfg.amount;
        } else {
          amount = remainingCost; // fallback to clear remaining
        }
        
        amount = Math.min(amount, remainingCost); // Don't overcharge
        if (amount > 0) {
          instPayload.push({
            plan_id: planId,
            installment_number: currentMonth,
            amount: amount,
            due_date: new Date().toISOString().split('T')[0] // Temporary
          });
          remainingCost -= amount;
        }
        currentMonth++;
      }
      
      // If there's still cost remaining but we reached planMonths, add it to the last month or continue months
      while (remainingCost > 0) {
        let amount = defaultCfg ? defaultCfg.amount : remainingCost;
        amount = Math.min(amount, remainingCost);
        instPayload.push({
          plan_id: planId,
          installment_number: currentMonth,
          amount: amount,
          due_date: new Date().toISOString().split('T')[0]
        });
        remainingCost -= amount;
        currentMonth++;
      }

      if (instPayload.length > 0) {
        await supabase.from('installment').insert(instPayload);
      }
      
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Error binding package");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">ผูกโปรโมชั่น/จัดตารางผ่อนชำระ</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200"><X size={20}/></button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">
            เลือกแพ็กเกจที่ต้องการผูกกับแผนการรักษานี้ ระบบจะสร้างตารางการจ่ายเงินอัตโนมัติ
          </p>
          
          <select 
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 mb-4"
            value={selectedPkg}
            onChange={(e) => setSelectedPkg(e.target.value === "" ? "" : Number(e.target.value))}
          >
            <option value="">-- เลือกแพ็กเกจจัดฟัน --</option>
            {packages.map(p => (
              <option key={p.package_id} value={p.package_id}>
                {p.package_name} (฿{p.total_cost.toLocaleString()})
              </option>
            ))}
          </select>

          {selectedPkg && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="text-sm font-semibold mb-2">ตัวอย่างการผ่อนชำระเบื้องต้น</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                {packages.find(p => p.package_id === Number(selectedPkg))?.installments_config.map((cfg: any, i: number) => (
                   <li key={i}>
                     งวดที่ {cfg.month === "default" ? "ที่เหลือ" : cfg.month}: ฿{cfg.amount.toLocaleString()}
                   </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-slate-100">ยกเลิก</button>
          <button 
            onClick={handleBind} 
            disabled={loading || !selectedPkg}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? "กำลังบันทึก..." : "ยืนยันการผูกแพ็กเกจ"}
          </button>
        </div>
      </div>
    </div>
  );
}
