import React, { useState, useEffect } from 'react';
import { supabase } from '../../shared/supabaseApi';
import { getTreatmentPackages } from '../../shared/api/treatmentApi';
import { TreatmentPackage } from '../../shared/data';
import { X, CheckCircle, Package } from 'lucide-react';

export default function FinancialPlanBuilder({ plan, onClose, onSuccess }: { plan: any, onClose: () => void, onSuccess: () => void }) {
  const [packages, setPackages] = useState<TreatmentPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<number | ''>('');
  
  // Customization state
  const [totalCost, setTotalCost] = useState<number>(0);
  const [downPayment, setDownPayment] = useState<number>(0);
  const [downPaymentMonths, setDownPaymentMonths] = useState<number>(0);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getTreatmentPackages().then(setPackages);
  }, []);

  const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pkgId = Number(e.target.value);
    setSelectedPackageId(pkgId);
    
    const pkg = packages.find(p => p.package_id === pkgId);
    if (pkg) {
      setTotalCost(pkg.total_cost);
      setDownPayment(pkg.down_payment);
      setDownPaymentMonths(pkg.down_payment_months);
      setMonthlyPayment(pkg.monthly_payment);
    }
  };

  const handleSave = async () => {
    if (!totalCost) {
      alert("กรุณาระบุราคารวมของแผนการรักษา");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // 1. Update treatment_plan
      const { error: updateErr } = await supabase.from('treatment_plan')
        .update({
          total_cost: totalCost,
          package_id: selectedPackageId || null
        })
        .eq('plan_id', plan.plan_id);
        
      if (updateErr) throw updateErr;

      // 2. Clear old installments if any (just in case)
      await supabase.from('installment').delete().eq('plan_id', plan.plan_id);

      // 3. Generate installments
      // To determine how many months, we need to know the duration from the plan_details
      const { data: planItems } = await supabase.from('treatment_plan_item')
        .select('month_number')
        .eq('plan_id', plan.plan_id)
        .order('month_number', { ascending: false })
        .limit(1);
        
      const durationMonths = planItems && planItems.length > 0 ? planItems[0].month_number : 24; // fallback

      const installmentsToInsert = [];
      let remainingBalance = totalCost;
      let dueDate = new Date();

      for (let i = 1; i <= durationMonths; i++) {
        let amount = 0;
        if (i <= downPaymentMonths && remainingBalance > 0) {
          amount = Math.min(downPayment, remainingBalance);
        } else if (remainingBalance > 0) {
          // Use fixed monthly payment or divide the rest if none specified
          amount = monthlyPayment > 0 ? monthlyPayment : Math.ceil(remainingBalance / (durationMonths - downPaymentMonths));
          amount = Math.min(amount, remainingBalance);
        }
        
        installmentsToInsert.push({
          plan_id: plan.plan_id,
          installment_number: i,
          amount: amount,
          due_date: dueDate.toISOString().split('T')[0],
          paid: false
        });
        
        remainingBalance -= amount;
        dueDate.setMonth(dueDate.getMonth() + 1);
        
        // Stop generating if balance is 0
        if (remainingBalance <= 0) break;
      }
      
      // If there's still balance left after duration, add one final balloon installment
      if (remainingBalance > 0) {
        installmentsToInsert.push({
          plan_id: plan.plan_id,
          installment_number: installmentsToInsert.length + 1,
          amount: remainingBalance,
          due_date: dueDate.toISOString().split('T')[0],
          paid: false
        });
      }

      if (installmentsToInsert.length > 0) {
        const { error: instErr } = await supabase.from('installment').insert(installmentsToInsert);
        if (instErr) throw instErr;
      }

      alert("บันทึกตารางค่าใช้จ่ายสำเร็จ");
      onSuccess();
    } catch (err: any) {
      console.error(err);
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b flex items-center justify-between bg-teal-50">
          <div>
            <h2 className="text-xl font-bold text-teal-800 flex items-center gap-2">
              <Package size={20} /> จัดการค่าใช้จ่ายและโปรโมชั่น
            </h2>
            <p className="text-sm text-teal-600">แผนการรักษา: {plan.plan_name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-teal-600 hover:bg-teal-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">เลือกโปรโมชั่น / แพ็กเกจจัดฟัน</label>
            <select 
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 font-medium"
              value={selectedPackageId}
              onChange={handlePackageChange}
            >
              <option value="">-- กำหนดราคาเอง (Manual) --</option>
              {packages.map(p => (
                <option key={p.package_id} value={p.package_id}>{p.package_name} (฿{p.total_cost.toLocaleString()})</option>
              ))}
            </select>
          </div>

          <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">ราคาแพ็กเกจเต็ม (บาท)</label>
              <input 
                type="number" 
                value={totalCost}
                onChange={e => setTotalCost(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-bold"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">จ่ายเดือนละ (งวดแรกเข้า)</label>
                <input 
                  type="number" 
                  value={downPayment}
                  onChange={e => setDownPayment(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">เป็นเวลากี่เดือน</label>
                <input 
                  type="number" 
                  value={downPaymentMonths}
                  onChange={e => setDownPaymentMonths(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">เดือนถัดๆ ไป จ่ายเดือนละ</label>
              <input 
                type="number" 
                value={monthlyPayment}
                onChange={e => setMonthlyPayment(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
              />
            </div>
          </div>

        </div>

        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-slate-600 font-medium hover:bg-slate-200 transition-colors"
          >
            ยกเลิก
          </button>
          <button 
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 transition-colors shadow-sm flex items-center gap-2"
          >
            {isSubmitting ? "กำลังบันทึก..." : <><CheckCircle size={18} /> ยืนยันค่าใช้จ่าย</>}
          </button>
        </div>
      </div>
    </div>
  );
}
