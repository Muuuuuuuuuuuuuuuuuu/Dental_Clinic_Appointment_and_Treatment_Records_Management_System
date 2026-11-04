import React, { useState, useEffect } from "react";
import StatusBadge from "../../shared/components/StatusBadge";
import { Plus, Edit3, Trash2, CheckCircle, X } from "lucide-react";

import { StaffInfo } from "../../shared/data";
import { getStaff, addStaff, updateStaff } from "../../shared/supabaseApi";

export default function StaffManagement() {
  const [staff, setStaff] = useState<StaffInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<StaffInfo | null>(null);
  
  const [form, setForm] = useState({ 
    firstName: "", 
    lastName: "", 
    citizenId: "", 
    email: "", 
    phone: "", 
    password: "", 
    salary: "",
    gender: "",
    birthDate: "",
    address: "",
    role: "ผู้ช่วยทันตแพทย์",
    startDate: "",
    employmentStatus: "ปฏิบัติงานปกติ"
  });

  const open = (s?: StaffInfo) => {
    setEditing(s ?? null);
    setForm(s ? { 
      firstName: s.firstName || "",
      lastName: s.lastName || "",
      citizenId: s.citizenId || "", 
      email: s.email, 
      phone: s.phone, 
      password: "", 
      salary: s.salary || "",
      gender: s.gender || "",
      birthDate: s.birthDate || "",
      address: s.address || "",
      role: s.role || "ผู้ช่วยทันตแพทย์",
      startDate: s.startDate || "",
      employmentStatus: s.employmentStatus || "ปฏิบัติงานปกติ"
    } : { 
      firstName: "", 
      lastName: "", 
      citizenId: "", 
      email: "", 
      phone: "", 
      password: "", 
      salary: "",
      gender: "",
      birthDate: "",
      address: "",
      role: "ผู้ช่วยทันตแพทย์",
      startDate: new Date().toISOString().split('T')[0],
      employmentStatus: "ปฏิบัติงานปกติ"
    });
    setShowModal(true);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const data = await getStaff();
      setStaff(data);
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
        await updateStaff(editing.id, form as Partial<StaffInfo>);
        fetchStaff();
      } else {
        const passwordToUse = form.password || "password123";
        await addStaff({ ...form, active: true, password: passwordToUse } as StaffInfo);
        fetchStaff();
        alert(`เพิ่มพนักงานสำเร็จ!\nรหัสผ่านสำหรับเข้าสู่ระบบคือ: ${passwordToUse}`);
      }
      setShowModal(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save staff");
    }
  };

  const toggleActive = async (s: StaffInfo) => {
    if (!s.id) return;
    try {
      await updateStaff(s.id, { active: !s.active });
      setStaff(ss => ss.map(x => x.id === s.id ? { ...x, active: !s.active } : x));
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>จัดการพนักงาน</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>พนักงานทั้งหมด {staff.length} คน</p>
        </div>
        <button onClick={() => open()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
          <Plus size={15} /> เพิ่มพนักงาน
        </button>
      </div>
      
      <div className="rounded-2xl bg-white overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: "#F8F9FA" }}>
              <tr>
                {["ชื่อ", "นามสกุล", "ตำแหน่ง", "อีเมล", "เบอร์โทร", "วันเริ่มงาน", "สถานะ", ""].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: "#4A6080" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s.id} style={{ borderBottom: "1px solid rgba(26,54,93,0.05)" }}>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: "#1A365D" }}>
                        {s.firstName?.[0] ?? "ก"}
                      </div>
                      <span className="font-medium" style={{ color: "#1A365D" }}>{s.firstName || '-'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-xs" style={{ color: "#4A6080" }}>{s.lastName || '-'}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-xs" style={{ color: "#4A6080" }}>{s.role}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-xs" style={{ color: "#4A6080" }}>{s.email}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-xs" style={{ color: "#4A6080" }}>{s.phone}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-xs" style={{ color: "#4A6080" }}>{s.startDate}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap"><StatusBadge label="" active={s.active} /></td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button onClick={() => open(s)} className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: "#4A6080" }}><Edit3 size={14} /></button>
                      <button onClick={() => toggleActive(s)}
                        className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: s.active ? "#E65100" : "#1B7A3E" }}>
                        {s.active ? <Trash2 size={14} /> : <CheckCircle size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(26,54,93,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>
                {editing ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มพนักงานใหม่"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} style={{ color: "#4A6080" }} /></button>
            </div>
            
            <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>ชื่อ</label>
                  <input type="text" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>นามสกุล</label>
                  <input type="text" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>เลขบัตรประชาชน (13 หลัก)</label>
                  <input type="text" value={form.citizenId} onChange={e => setForm(f => ({ ...f, citizenId: e.target.value.replace(/\D/g, "").slice(0, 13) }))} maxLength={13} placeholder="กรอกตัวเลข 13 หลัก" disabled={!!editing} className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none ${editing ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>วันเกิด</label>
                  <input type="date" value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>เบอร์โทรศัพท์</label>
                  <input type="tel" maxLength={10} placeholder="กรอกตัวเลข 10 หลัก" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>ที่อยู่ปัจจุบัน (ไม่บังคับ)</label>
                <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} rows={2} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>อีเมล</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} disabled={!!editing} className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none ${editing ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                </div>
                {!editing && (
                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>ตั้งรหัสผ่าน (ปล่อยว่าง = password123)</label>
                    <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} placeholder="password123" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>ตำแหน่ง</label>
                <input type="text" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>วันที่เริ่มงาน</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>สถานะการทำงาน</label>
                  <select value={form.employmentStatus} onChange={e => setForm(f => ({ ...f, employmentStatus: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}>
                    <option value="ปฏิบัติงานปกติ">ปฏิบัติงานปกติ</option>
                    <option value="พักงาน">พักงาน</option>
                    <option value="ลาออก">ลาออก</option>
                  </select>
                </div>
              </div>

            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ border: "1.5px solid rgba(26,54,93,0.2)", color: "#4A6080" }}>ยกเลิก</button>
              <button onClick={save} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
