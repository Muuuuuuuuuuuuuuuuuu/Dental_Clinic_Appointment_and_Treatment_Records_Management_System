import { Badge } from "../../shared/components/ui/badge";
import React, { useState, useEffect } from "react";
import StatusBadge from "../../shared/components/StatusBadge";
import { UserPlus, Edit3, Trash2 , Plus, CheckCircle, X } from "lucide-react";

import { DentistInfo, ServiceInfo } from "../../shared/data";
import { getDentists, addDentist, updateDentist, getServices } from "../../shared/supabaseApi";

export default function DentistManagement() {
  const [dentists, setDentists] = useState<DentistInfo[]>([]);
  const [allServices, setAllServices] = useState<ServiceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DentistInfo | null>(null);
  const [form, setForm] = useState({ name: "", specialty: "", license: "", university: "", email: "", password: "", phone: "", address: "", serviceIds: [] as number[] });

  const open = (d?: DentistInfo) => {
    setEditing(d ?? null);
    setForm(d ? { name: d.name, specialty: d.specialty, license: d.license, university: d.university, email: d.email, password: "", phone: d.phone, address: (d as any).address || "", serviceIds: d.serviceIds || [] } : { name: "", specialty: "", license: "", university: "", email: "", password: "", phone: "", address: "", serviceIds: [] });
    setShowModal(true);
  };

  useEffect(() => {
    fetchDentists();
    getServices().then(setAllServices).catch(console.error);
  }, []);

  const fetchDentists = async () => {
    try {
      const data = await getDentists();
      setDentists(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    try {
      if (editing) {
        if (!editing.id) return;
        const updated = await updateDentist(editing.id, form);
        setDentists(ds => ds.map(d => d.id === updated.id ? updated : d));
      } else {
        const passwordToUse = form.password || "password123";
        const added = await addDentist({ ...form, active: true, password: passwordToUse });
        setDentists(ds => [...ds, added]);
        alert(`เพิ่มทันตแพทย์สำเร็จ!\nรหัสผ่านสำหรับเข้าสู่ระบบคือ: ${passwordToUse}`);
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save dentist");
    }
  };

  const toggleActive = async (d: DentistInfo) => {
    if (!d.id) return;
    try {
      const updated = await updateDentist(d.id, { active: !d.active });
      setDentists(ds => ds.map(x => x.id === d.id ? updated : x));
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>จัดการทันตแพทย์</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>ทันตแพทย์ทั้งหมด {dentists.length} ท่าน</p>
        </div>
        <button onClick={() => open()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
          <Plus size={15} /> เพิ่มทันตแพทย์
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dentists.map(d => (
          <div key={d.id} className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold"
                  style={{ background: "linear-gradient(135deg,#1A365D,#2D5482)" }}>
                  {d.name.replace('ทพ. ', '').replace('ทญ. ', '')[0] ?? "ด"}
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: "#1A365D" }}>{d.name}</h3>
                  <p className="text-sm font-medium" style={{ color: "#4A6080" }}>{d.specialty}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => open(d)} className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-blue-600 transition-colors">
                  <Edit3 size={16} />
                </button>
                <button onClick={() => toggleActive(d)} className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  style={{ color: d.active ? "#E65100" : "#1B7A3E" }}>
                  {d.active ? <Trash2 size={16} /> : <CheckCircle size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: "#4A6080" }}>เลขที่ใบอนุญาต</span>
                <span className="font-medium" style={{ color: "#1A365D" }}>{d.license}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: "#4A6080" }}>สถาบัน</span>
                <span className="font-medium" style={{ color: "#1A365D" }}>{d.university}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: "#4A6080" }}>อีเมล</span>
                <span className="font-medium truncate max-w-[150px]" style={{ color: "#1A365D" }}>{d.email}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: "#4A6080" }}>เบอร์โทร</span>
                <span className="font-medium" style={{ color: "#1A365D" }}>{d.phone}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <StatusBadge label="" active={d.active} />
              {d.serviceIds && d.serviceIds.length > 0 && (
                <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-md">
                  รับ {d.serviceIds.length} บริการ
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(26,54,93,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>
                {editing ? "แก้ไขข้อมูลทันตแพทย์" : "เพิ่มทันตแพทย์ใหม่"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} style={{ color: "#4A6080" }} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>ชื่อ-นามสกุล (ไม่ต้องใส่คำนำหน้า)</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
              </div>
              
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>ความเชี่ยวชาญ</label>
                <input value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>เลขที่ใบอนุญาต</label>
                <input value={form.license} onChange={e => setForm(f => ({ ...f, license: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>สถาบันการศึกษา</label>
                <input value={form.university} onChange={e => setForm(f => ({ ...f, university: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>อีเมลองค์กร</label>
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>เบอร์โทรศัพท์</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>ที่อยู่ปัจจุบัน (ไม่บังคับ)</label>
                <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  rows={2} placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                <p className="text-[10px] mt-1" style={{ color: "#94A3B8" }}>ใช้สำหรับเอกสาร HR / สัญญาจ้าง</p>
              </div>

              {!editing && (
                <div className="md:col-span-2">
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>ตั้งรหัสผ่าน (ปล่อยว่างไว้หากต้องการใช้ password123)</label>
                  <input type="text" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} placeholder="password123" />
                </div>
              )}
            </div>

            <div className="mt-6">
              <label className="text-xs font-bold block mb-3" style={{ color: "#1A365D" }}>บริการที่รับรักษา</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-100">
                {allServices.map(service => (
                  <label key={service.id} className="flex items-start gap-2 cursor-pointer group">
                    <div className="pt-0.5">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                        checked={form.serviceIds.includes(service.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm(f => ({ ...f, serviceIds: [...f.serviceIds, service.id] }));
                          } else {
                            setForm(f => ({ ...f, serviceIds: f.serviceIds.filter(id => id !== service.id) }));
                          }
                        }}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium group-hover:text-blue-600" style={{ color: "#1A365D" }}>{service.name}</span>
                      <span className="text-xs text-gray-500">{service.category}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ border: "1.5px solid rgba(26,54,93,0.2)", color: "#4A6080" }}>ยกเลิก</button>
              <button onClick={save} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
