import React, { useState, useEffect } from "react";
import StatusBadge from "../../shared/components/StatusBadge";
import { UserPlus, Edit3, Trash2 , Plus, CheckCircle, X } from "lucide-react";

import { DentistInfo, ServiceInfo } from "../../shared/data";
import { getDentists, addDentist, updateDentist, getServices, uploadAvatar } from "../../shared/supabaseApi";

export default function DentistManagement() {
  const [dentists, setDentists] = useState<DentistInfo[]>([]);
  const [allServices, setAllServices] = useState<ServiceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DentistInfo | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [form, setForm] = useState({ 
    titleName: "ทพ.",
    firstName: "", 
    lastName: "", 
    citizenId: "", 
    specialty: "", 
    license: "", 
    university: "", 
    email: "", 
    password: "", 
    phone: "", 
    address: "", 
    gender: "",
    birthDate: "",
    experienceYears: 0,
    graduationYear: new Date().getFullYear(),
    imageUrl: "",
    startDate: "",
    serviceIds: [] as number[] 
  });

  const open = (d?: DentistInfo) => {
    setEditing(d ?? null);
    setForm(d ? { 
      titleName: d.titleName || "ทพ.",
      firstName: d.firstName || "",
      lastName: d.lastName || "",
      citizenId: d.citizenId || "", 
      specialty: d.specialty, 
      license: d.license, 
      university: d.university || "", 
      email: d.email, 
      password: "", 
      phone: d.phone, 
      address: d.address || "", 
      gender: d.gender || "",
      birthDate: d.birthDate || "",
      experienceYears: d.experienceYears || 0,
      graduationYear: d.graduationYear || new Date().getFullYear(),
      imageUrl: d.imageUrl || "",
      startDate: d.startDate || "",
      serviceIds: d.serviceIds || [] 
    } : { 
      titleName: "ทพ.",
      firstName: "", 
      lastName: "", 
      citizenId: "", 
      specialty: "ทันตกรรมทั่วไป", 
      license: "", 
      university: "", 
      email: "", 
      password: "", 
      phone: "", 
      address: "", 
      gender: "",
      birthDate: "",
      experienceYears: 0,
      graduationYear: new Date().getFullYear(),
      imageUrl: "",
      startDate: new Date().toISOString().split('T')[0],
      serviceIds: [] 
    });
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
    if (!editing && form.citizenId.replace(/\D/g, "").length !== 13) {
      alert("เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลักเท่านั้น");
      return;
    }
    if (form.phone && form.phone.replace(/\D/g, "").length !== 10) {
      alert("เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักเท่านั้น");
      return;
    }
    try {
      if (editing) {
        if (!editing.id) return;
        await updateDentist(editing.id, form as Partial<DentistInfo>);
        fetchDentists();
      } else {
        const passwordToUse = form.password || "password123";
        await addDentist({ ...form, active: true, password: passwordToUse } as Omit<DentistInfo, 'id'>);
        fetchDentists();
        alert(`เพิ่มทันตแพทย์สำเร็จ!\nรหัสผ่านสำหรับเข้าสู่ระบบคือ: ${passwordToUse}`);
      }
      setShowModal(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save dentist");
    }
  };

  const toggleActive = async (d: DentistInfo) => {
    if (!d.id) return;
    try {
      await updateDentist(d.id, { active: !d.active });
      setDentists(ds => ds.map(x => x.id === d.id ? { ...x, active: !d.active } : x));
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const toggleService = (sid: number) => {
    setForm(f => ({
      ...f,
      serviceIds: f.serviceIds.includes(sid) ? f.serviceIds.filter(id => id !== sid) : [...f.serviceIds, sid]
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>จัดการทันตแพทย์</h1>
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
                {d.imageUrl ? (
                  <img src={d.imageUrl} alt={d.firstName} className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold"
                    style={{ background: "linear-gradient(135deg,#1A365D,#2D5482)" }}>
                    {d.firstName?.[0] ?? "ด"}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg" style={{ color: "#1A365D" }}>{d.titleName} {d.firstName} {d.lastName}</h3>
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
                <span className="font-medium" style={{ color: "#1A365D" }}>{d.university || '-'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: "#4A6080" }}>ประสบการณ์</span>
                <span className="font-medium" style={{ color: "#1A365D" }}>{d.experienceYears ? `${d.experienceYears} ปี` : '-'}</span>
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 p-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <h2 className="text-xl font-bold" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>
                {editing ? "แก้ไขข้อมูลทันตแพทย์" : "เพิ่มทันตแพทย์ใหม่"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} style={{ color: "#4A6080" }} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>คำนำหน้า</label>
                  <select value={form.titleName} onChange={e => setForm(f => ({ ...f, titleName: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}>
                    <option value="ทพ.">ทพ.</option>
                    <option value="ทญ.">ทญ.</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>ชื่อ</label>
                  <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>นามสกุล</label>
                  <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>เลขบัตรประชาชน (13 หลัก)</label>
                  <input value={form.citizenId} onChange={e => setForm(f => ({ ...f, citizenId: e.target.value.replace(/\D/g, "").slice(0, 13) }))} maxLength={13} placeholder="กรอกตัวเลข 13 หลัก" disabled={!!editing} className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none ${editing ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>เพศ</label>
                  <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}>
                    <option value="">- เลือกเพศ -</option>
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>ความเชี่ยวชาญ</label>
                  <input value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} placeholder="เช่น ทันตกรรมทั่วไป, จัดฟัน" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>เลขที่ใบอนุญาต</label>
                  <input value={form.license} onChange={e => setForm(f => ({ ...f, license: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>จบจากสถาบัน</label>
                  <input value={form.university} onChange={e => setForm(f => ({ ...f, university: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>ปีที่เรียนจบ (ค.ศ.)</label>
                  <input type="number" value={form.graduationYear} onChange={e => setForm(f => ({ ...f, graduationYear: parseInt(e.target.value) || new Date().getFullYear() }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>วันเกิด</label>
                  <input type="date" value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>เบอร์โทรศัพท์</label>
                  <input type="tel" maxLength={10} placeholder="กรอกตัวเลข 10 หลัก" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>วันที่เริ่มงาน</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>รูปโปรไฟล์ (อัปโหลด)</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setUploadingImage(true);
                          const url = await uploadAvatar(file);
                          setForm(f => ({ ...f, imageUrl: url }));
                        } catch (err) {
                          alert("อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่");
                        } finally {
                          setUploadingImage(false);
                        }
                      }}
                      disabled={uploadingImage}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#1A365D] file:text-white hover:file:bg-[#122847]"
                    />
                    {uploadingImage && <span className="text-xs text-slate-500 animate-pulse">กำลังอัปโหลด...</span>}
                  </div>
                  {form.imageUrl && (
                    <div className="mt-2 text-xs text-green-600 truncate">
                      อัปโหลดแล้ว: {form.imageUrl.substring(0, 30)}...
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>ที่อยู่ปัจจุบัน</label>
                <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} rows={2} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>อีเมล</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} disabled={!!editing} className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none ${editing ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                </div>
                {!editing && (
                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>ตั้งรหัสผ่าน (ปล่อยว่าง = password123)</label>
                    <input type="text" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} placeholder="password123" />
                  </div>
                )}
              </div>


              <div>
                <label className="text-xs font-medium block mb-2" style={{ color: "#4A6080" }}>บริการที่รับผิดชอบ</label>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 max-h-[150px] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {allServices.map(s => (
                      <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.serviceIds.includes(s.id)} onChange={() => toggleService(s.id)} className="w-4 h-4 text-blue-600 rounded" />
                        <span className="text-sm" style={{ color: "#1A365D" }}>{s.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ border: "1.5px solid rgba(26,54,93,0.2)", color: "#4A6080" }}>ยกเลิก</button>
              <button onClick={save} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
