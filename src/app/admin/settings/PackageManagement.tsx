import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Save, X, Banknote, Calendar } from "lucide-react";
import { supabase, getServices } from "../../shared/supabaseApi";
import { ServiceInfo } from "../../shared/data";
interface InstallmentConfig {
  month: number | "default";
  amount: number;
}

export interface TreatmentPackage {
  package_id: number;
  package_name: string;
  total_cost: number;
  description: string;
  installments_config: InstallmentConfig[];
  is_active: boolean;
  service_id?: number | null;
}

export default function PackageManagement() {
  const [packages, setPackages] = useState<TreatmentPackage[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<TreatmentPackage>>({});
  const [configs, setConfigs] = useState<InstallmentConfig[]>([]);
  const [services, setServices] = useState<ServiceInfo[]>([]);

  useEffect(() => {
    fetchPackages();
    getServices().then(setServices);
  }, []);

  const fetchPackages = async () => {
    const { data, error } = await supabase.from('treatment_package').select('*').order('created_at', { ascending: false });
    if (data) setPackages(data);
  };

  const handleEdit = (pkg: TreatmentPackage | null) => {
    if (pkg) {
      setEditForm(pkg);
      setConfigs(pkg.installments_config || []);
    } else {
      setEditForm({ is_active: true });
      setConfigs([{ month: "default", amount: 1500 }]);
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...editForm,
        installments_config: configs
      };
      
      if (payload.package_id) {
        await supabase.from('treatment_package').update(payload).eq('package_id', payload.package_id);
      } else {
        await supabase.from('treatment_package').insert(payload);
      }
      
      setIsEditing(false);
      fetchPackages();
    } catch (error) {
      console.error(error);
      alert("Error saving package");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ลบแพ็กเกจนี้? (แพ็กเกจที่ถูกผูกกับคนไข้แล้วจะยังคงใช้งานได้)")) return;
    await supabase.from('treatment_package').delete().eq('package_id', id);
    fetchPackages();
  };

  if (isEditing) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold mb-6 text-slate-800">{editForm.package_id ? "แก้ไขแพ็กเกจ" : "สร้างแพ็กเกจใหม่"}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อแพ็กเกจ/โปรโมชั่น</label>
            <input 
              type="text" 
              className="w-full border rounded-lg px-3 py-2"
              value={editForm.package_name || ""}
              onChange={e => setEditForm({...editForm, package_name: e.target.value})}
              placeholder="เช่น จัดฟันโปร 45,000 (ผ่อน 1,500)"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ยอดรวมทั้งหมด (Total Cost)</label>
            <input 
              type="number" 
              className="w-full border rounded-lg px-3 py-2"
              value={editForm.total_cost || ""}
              onChange={e => setEditForm({...editForm, total_cost: Number(e.target.value)})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">บริการที่รองรับโปรโมชันนี้</label>
            <select 
              className="w-full border rounded-lg px-3 py-2"
              value={editForm.service_id || ""}
              onChange={e => setEditForm({...editForm, service_id: e.target.value ? Number(e.target.value) : null})}
            >
              <option value="">-- ไม่ผูกกับบริการ (ใช้ได้กับทุกบริการ) --</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
              ))}
            </select>
          </div>
          
          <div className="pt-4 border-t border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">ตั้งค่างวดผ่อนชำระ (Installment Rules)</label>
            <p className="text-xs text-slate-500 mb-4">ใช้ month = "default" สำหรับงวดที่เหลือทั้งหมด</p>
            
            <div className="space-y-2">
              {configs.map((cfg, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-sm">เดือนที่</span>
                  <input 
                    type="text"
                    className="w-24 border rounded px-2 py-1 text-sm"
                    value={cfg.month}
                    onChange={(e) => {
                      const val = e.target.value;
                      const next = [...configs];
                      next[idx].month = val === "default" ? "default" : Number(val) || 1;
                      setConfigs(next);
                    }}
                  />
                  <span className="text-sm">ยอดเงิน ฿</span>
                  <input 
                    type="number"
                    className="w-32 border rounded px-2 py-1 text-sm"
                    value={cfg.amount}
                    onChange={(e) => {
                      const next = [...configs];
                      next[idx].amount = Number(e.target.value);
                      setConfigs(next);
                    }}
                  />
                  <button onClick={() => setConfigs(configs.filter((_, i) => i !== idx))} className="text-red-500 hover:bg-red-50 p-1 rounded">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => setConfigs([...configs, { month: configs.length + 1, amount: 0 }])}
                className="mt-2 text-sm text-teal-600 hover:text-teal-800 flex items-center gap-1 font-medium"
              >
                <Plus size={16} /> เพิ่มเงื่อนไข
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end gap-3">
          <button onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">ยกเลิก</button>
          <button onClick={handleSave} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2">
            <Save size={18} /> บันทึก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">จัดการแพ็กเกจผ่อนชำระ</h2>
        <button onClick={() => handleEdit(null)} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 font-medium">
          <Plus size={18} /> เพิ่มแพ็กเกจ
        </button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {packages.map(pkg => (
          <div key={pkg.package_id} className="border border-slate-200 bg-white rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-slate-800 text-lg">{pkg.package_name}</h3>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(pkg)} className="text-blue-500 p-1 bg-blue-50 hover:bg-blue-100 rounded-lg"><Edit size={16}/></button>
                <button onClick={() => handleDelete(pkg.package_id)} className="text-red-500 p-1 bg-red-50 hover:bg-red-100 rounded-lg"><Trash2 size={16}/></button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-slate-600 mb-2 bg-slate-50 p-2 rounded-lg inline-flex">
              <Banknote size={16} className="text-teal-600" />
              <span className="font-medium">ยอดรวม: ฿{pkg.total_cost.toLocaleString()}</span>
            </div>
            
            {pkg.service_id && (
              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md inline-block mb-4 border border-blue-100">
                เฉพาะ: {services.find(s => s.id === pkg.service_id)?.name || `Service ID ${pkg.service_id}`}
              </div>
            )}
            
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">เงื่อนไขค่างวด (Installments)</p>
              {pkg.installments_config?.map((cfg, idx) => (
                <div key={idx} className="flex justify-between text-sm py-1 border-b border-dashed border-slate-100 last:border-0">
                  <span className="text-slate-600">{cfg.month === "default" ? "งวดที่เหลือทั้งหมด" : `งวดที่ ${cfg.month}`}</span>
                  <span className="font-medium text-slate-800">฿{cfg.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {packages.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            ยังไม่มีแพ็กเกจ กรุณาเพิ่มแพ็กเกจใหม่
          </div>
        )}
      </div>
    </div>
  );
}
