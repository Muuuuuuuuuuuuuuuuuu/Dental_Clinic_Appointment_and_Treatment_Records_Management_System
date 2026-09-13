import React, { useState, useEffect } from 'react';
import { supabase } from '../../shared/supabaseApi';
import { TreatmentPackage } from '../../shared/data';
import { Package, Plus, Pencil, Trash2, CheckCircle, X } from 'lucide-react';

export default function PackageManagement() {
  const [packages, setPackages] = useState<TreatmentPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPkg, setCurrentPkg] = useState<Partial<TreatmentPackage>>({});

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('treatment_package').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setPackages(data);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPkg.package_name || !currentPkg.total_cost) return;

    if (currentPkg.package_id) {
      await supabase.from('treatment_package').update(currentPkg).eq('package_id', currentPkg.package_id);
    } else {
      await supabase.from('treatment_package').insert([currentPkg]);
    }
    setIsEditing(false);
    fetchPackages();
  };

  const toggleActive = async (pkgId: number, currentStatus: boolean) => {
    await supabase.from('treatment_package').update({ is_active: !currentStatus }).eq('package_id', pkgId);
    fetchPackages();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-2">
          <Package className="text-teal-600" size={24} />
          <h2 className="text-lg font-bold text-slate-800">จัดการโปรโมชั่นจัดฟัน (Treatment Packages)</h2>
        </div>
        <button 
          onClick={() => { setCurrentPkg({ is_active: true, down_payment: 0, down_payment_months: 0, monthly_payment: 0 }); setIsEditing(true); }}
          className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> เพิ่มโปรโมชั่น
        </button>
      </div>

      <div className="p-6">
        {isEditing && (
          <form onSubmit={handleSave} className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6 space-y-4 relative">
            <button type="button" onClick={() => setIsEditing(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h3 className="font-bold text-slate-800">{currentPkg.package_id ? "แก้ไขโปรโมชั่น" : "สร้างโปรโมชั่นใหม่"}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อโปรโมชั่น</label>
                <input required type="text" className="w-full border rounded-lg px-3 py-2" value={currentPkg.package_name || ''} onChange={e => setCurrentPkg({...currentPkg, package_name: e.target.value})} placeholder="เช่น จัดฟันเหล็ก โปร 3000x3" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ราคาเต็ม (บาท)</label>
                <input required type="number" className="w-full border rounded-lg px-3 py-2" value={currentPkg.total_cost || ''} onChange={e => setCurrentPkg({...currentPkg, total_cost: Number(e.target.value)})} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">เดือนถัดไปจ่าย (รายเดือน)</label>
                <input required type="number" className="w-full border rounded-lg px-3 py-2" value={currentPkg.monthly_payment || ''} onChange={e => setCurrentPkg({...currentPkg, monthly_payment: Number(e.target.value)})} />
              </div>
              
              <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg md:col-span-2 flex items-center gap-4">
                <div>
                  <label className="block text-xs font-semibold text-orange-800 mb-1">งวดแรกเข้า (บาท/เดือน)</label>
                  <input type="number" className="w-32 border border-orange-200 rounded px-3 py-1" value={currentPkg.down_payment || ''} onChange={e => setCurrentPkg({...currentPkg, down_payment: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-orange-800 mb-1">จำนวนเดือน</label>
                  <input type="number" className="w-24 border border-orange-200 rounded px-3 py-1" value={currentPkg.down_payment_months || ''} onChange={e => setCurrentPkg({...currentPkg, down_payment_months: Number(e.target.value)})} />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2">
                <CheckCircle size={18} /> บันทึกโปรโมชั่น
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b">
                <th className="py-3 px-4 font-semibold">ชื่อโปรโมชั่น</th>
                <th className="py-3 px-4 font-semibold">ราคาเต็ม</th>
                <th className="py-3 px-4 font-semibold">แรกเข้า</th>
                <th className="py-3 px-4 font-semibold">รายเดือน</th>
                <th className="py-3 px-4 font-semibold">สถานะ</th>
                <th className="py-3 px-4 font-semibold text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {packages.map(pkg => (
                <tr key={pkg.package_id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-medium text-slate-800">{pkg.package_name}</td>
                  <td className="py-3 px-4">฿{pkg.total_cost.toLocaleString()}</td>
                  <td className="py-3 px-4">{pkg.down_payment_months > 0 ? `฿${pkg.down_payment.toLocaleString()} x ${pkg.down_payment_months}` : '-'}</td>
                  <td className="py-3 px-4">฿{pkg.monthly_payment.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={() => toggleActive(pkg.package_id!, pkg.is_active!)}
                      className={`text-xs px-2 py-1 rounded-full font-medium ${pkg.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {pkg.is_active ? 'เปิดใช้งาน' : 'ปิดการใช้งาน'}
                    </button>
                  </td>
                  <td className="py-3 px-4 flex justify-end gap-2">
                    <button onClick={() => { setCurrentPkg(pkg); setIsEditing(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {packages.length === 0 && !loading && (
                <tr><td colSpan={6} className="text-center py-8 text-slate-500">ไม่มีข้อมูลโปรโมชั่น</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
