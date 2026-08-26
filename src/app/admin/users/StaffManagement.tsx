import { Badge } from "../../shared/components/ui/badge";
import React, { useState, useEffect } from "react";
import StatusBadge from "../../shared/components/StatusBadge";
import { UserPlus, Edit3, Trash2, Plus, CheckCircle, X } from "lucide-react";

import { StaffInfo } from "../../shared/data";
import { getStaff, addStaff, updateStaff } from "../../shared/supabaseApi";

export default function StaffManagement() {
  const [staff, setStaff] = useState<StaffInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<StaffInfo | null>(null);
  const [form, setForm] = useState({ name: "", role: "", email: "", phone: "", startDate: "", salary: "", password: "", address: "" });

  const open = (s?: StaffInfo) => {
    setEditing(s ?? null);
    setForm(s ? { name: s.name, role: s.role, email: s.email, phone: s.phone, startDate: s.startDate, salary: s.salary || "", password: "", address: (s as any).address || "" } : { name: "", role: "", email: "", phone: "", startDate: "", salary: "", password: "", address: "" });
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
    try {
      if (editing) {
        if (!editing.id) return;
        const updated = await updateStaff(editing.id, form);
        setStaff(ss => ss.map(s => s.id === updated.id ? updated : s));
      } else {
        const passwordToUse = form.password || "password123";
        const added = await addStaff({ ...form, active: true, password: passwordToUse });
        setStaff(ss => [...ss, added]);
        alert(`เพิ่มพนักงานสำเร็จ!\nรหัสผ่านสำหรับเข้าสู่ระบบคือ: ${passwordToUse}`);
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save staff");
    }
  };

  const toggleActive = async (s: StaffInfo) => {
    if (!s.id) return;
    try {
      const updated = await updateStaff(s.id, { active: !s.active });
      setStaff(ss => ss.map(x => x.id === s.id ? updated : x));
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>จัดการพนักงาน</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>พนักงานทั้งหมด {staff.length} คน</p>
        </div>
        <button onClick={() => open()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
          <Plus size={15} /> เพิ่มพนักงาน
        </button>
      </div>
      <div className="rounded-2xl bg-white overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: "#F8F9FA" }}>
            <tr>
              {["ชื่อ-นามสกุล", "ตำแหน่ง", "อีเมล", "เบอร์โทร", "วันเริ่มงาน", "สถานะ", ""].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "#4A6080" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.map(s => (
              <tr key={s.id} style={{ borderBottom: "1px solid rgba(26,54,93,0.05)" }}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: "#1A365D" }}>
                      {s.name[3] ?? "ก"}
                    </div>
                    <span className="font-medium" style={{ color: "#1A365D" }}>{s.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-xs" style={{ color: "#4A6080" }}>{s.role}</td>
                <td className="px-5 py-3.5 text-xs" style={{ color: "#4A6080" }}>{s.email}</td>
                <td className="px-5 py-3.5 text-xs" style={{ color: "#4A6080" }}>{s.phone}</td>
                <td className="px-5 py-3.5 text-xs" style={{ color: "#4A6080" }}>{s.startDate}</td>
                <td className="px-5 py-3.5"><StatusBadge label="" active={s.active} /></td>
                <td className="px-5 py-3.5">
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
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(26,54,93,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>
                {editing ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มพนักงานใหม่"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} style={{ color: "#4A6080" }} /></button>
            </div>
            <div className="space-y-3">
              {[{ k: "name", l: "ชื่อ-นามสกุล" }, { k: "role", l: "ตำแหน่ง" }, { k: "email", l: "อีเมล" }, { k: "phone", l: "เบอร์โทร" }, { k: "startDate", l: "วันที่เริ่มงาน", type: "date" }, { k: "salary", l: "เงินเดือน", type: "number" }].map(({ k, l, type }) => (
                <div key={k}>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>{l}</label>
                  <input type={type ?? "text"} value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>ที่อยู่ปัจจุบัน (ไม่บังคับ)</label>
                <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  rows={2} placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                <p className="text-[10px] mt-1" style={{ color: "#94A3B8" }}>ใช้สำหรับเอกสาร HR / สัญญาจ้าง</p>
              </div>
              {!editing && (
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>ตั้งรหัสผ่าน (ปล่อยว่างไว้หากต้องการใช้ password123)</label>
                  <input type="text" value={(form as any).password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} placeholder="password123" />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ border: "1.5px solid rgba(26,54,93,0.2)", color: "#4A6080" }}>ยกเลิก</button>
              <button onClick={save} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
