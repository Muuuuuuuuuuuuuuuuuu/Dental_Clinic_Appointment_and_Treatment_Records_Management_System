import React, { useState, useEffect } from "react";
import StatusBadge from "../../shared/components/StatusBadge";
import { Plus, Edit3, Trash2, CheckCircle, X } from "lucide-react";

import { AdminInfo } from "../../shared/data";
import { getAdmins, addAdmin, updateAdmin } from "../../shared/supabaseApi";

export default function AdminManagement() {
  const [admins, setAdmins] = useState<AdminInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminInfo | null>(null);
  
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
    role: "ผู้ดูแลระบบ",
    startDate: "",
    employmentStatus: "ปฏิบัติงานปกติ"
  });

  const open = (a?: AdminInfo) => {
    setEditing(a ?? null);
    setForm(a ? { 
      firstName: a.firstName || "",
      lastName: a.lastName || "",
      citizenId: a.citizenId || "", 
      email: a.email, 
      phone: a.phone, 
      password: "", 
      salary: a.salary || "",
      gender: a.gender || "",
      birthDate: a.birthDate || "",
      address: a.address || "",
      role: a.role || "ผู้ดูแลระบบ",
      startDate: a.startDate || "",
      employmentStatus: a.employmentStatus || "ปฏิบัติงานปกติ"
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
      role: "ผู้ดูแลระบบ",
      startDate: new Date().toISOString().split('T')[0],
      employmentStatus: "ปฏิบัติงานปกติ"
    });
    setShowModal(true);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const data = await getAdmins();
      setAdmins(data);
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
        const updated = await updateAdmin(editing.id, form as Partial<AdminInfo>);
        // ดึงข้อมูลใหม่เพื่อให้ได้ชื่อ-นามสกุลที่อัปเดตถูกต้อง
        fetchAdmins();
      } else {
        await addAdmin({ ...form, active: true } as AdminInfo);
        fetchAdmins();
        alert("เพิ่มผู้ดูแลระบบสำเร็จ!\nรหัสผ่านเริ่มต้นคือรหัสที่คุณเพิ่งตั้งไว้");
      }
      setShowModal(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save admin");
    }
  };

  const toggleActive = async (a: AdminInfo) => {
    if (!a.id) return;
    try {
      await updateAdmin(a.id, { active: !a.active });
      setAdmins(aa => aa.map(x => x.id === a.id ? { ...x, active: !a.active } : x));
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>จัดการผู้ดูแลระบบ</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>ผู้ดูแลระบบทั้งหมด {admins.length} บัญชี</p>
        </div>
        <button onClick={() => open()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
          <Plus size={15} /> เพิ่มผู้ดูแลระบบ
        </button>
      </div>
      
      <div className="rounded-2xl bg-white overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: "#F8F9FA" }}>
              <tr>
                {["ชื่อ", "นามสกุล", "อีเมล", "เบอร์โทร", "สถานะ", ""].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: "#4A6080" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admins.map(a => (
                <tr key={a.id} style={{ borderBottom: "1px solid rgba(26,54,93,0.05)" }}>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: "#1A365D" }}>
                        {a.firstName?.[0] ?? "ก"}
                      </div>
                      <span className="font-medium" style={{ color: "#1A365D" }}>{a.firstName || '-'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-xs" style={{ color: "#4A6080" }}>{a.lastName || '-'}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-xs" style={{ color: "#4A6080" }}>{a.email}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-xs" style={{ color: "#4A6080" }}>{a.phone}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap"><StatusBadge label="" active={a.active} /></td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button onClick={() => open(a)} className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: "#4A6080" }}><Edit3 size={14} /></button>
                      <button onClick={() => toggleActive(a)}
                        className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: a.active ? "#E65100" : "#1B7A3E" }}>
                        {a.active ? <Trash2 size={14} /> : <CheckCircle size={14} />}
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
                {editing ? "แก้ไขผู้ดูแลระบบ" : "เพิ่มผู้ดูแลระบบใหม่"}
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
                <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>ที่อยู่ปัจจุบัน</label>
                <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} rows={2} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>อีเมล</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} disabled={!!editing} className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none ${editing ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                </div>
                {!editing && (
                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>รหัสผ่านเริ่มต้น</label>
                    <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
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
