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
  const [form, setForm] = useState({ name: "", citizenId: "", email: "", phone: "", password: "", salary: "" });

  const open = (a?: AdminInfo) => {
    setEditing(a ?? null);
    setForm(a ? { name: a.name, citizenId: "", email: a.email, phone: a.phone, password: "", salary: a.salary || "" } : { name: "", citizenId: "", email: "", phone: "", password: "", salary: "" });
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
    try {
      if (editing) {
        if (!editing.id) return;
        const updated = await updateAdmin(editing.id, form);
        setAdmins(aa => aa.map(a => a.id === updated.id ? { ...a, ...updated } : a));
      } else {
        const added = await addAdmin({ ...form, active: true });
        setAdmins(aa => [...aa, added]);
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
      const updated = await updateAdmin(a.id, { active: !a.active });
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
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>จัดการผู้ดูแลระบบ</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>ผู้ดูแลระบบทั้งหมด {admins.length} บัญชี</p>
        </div>
        <button onClick={() => open()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
          <Plus size={15} /> เพิ่มผู้ดูแลระบบ
        </button>
      </div>
      <div className="rounded-2xl bg-white overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: "#F8F9FA" }}>
            <tr>
              {["ชื่อ-นามสกุล", "อีเมล", "เบอร์โทร", "สถานะ", ""].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "#4A6080" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {admins.map(a => (
              <tr key={a.id} style={{ borderBottom: "1px solid rgba(26,54,93,0.05)" }}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: "#1A365D" }}>
                      {a.name[3] ?? "ก"}
                    </div>
                    <span className="font-medium" style={{ color: "#1A365D" }}>{a.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-xs" style={{ color: "#4A6080" }}>{a.email}</td>
                <td className="px-5 py-3.5 text-xs" style={{ color: "#4A6080" }}>{a.phone}</td>
                <td className="px-5 py-3.5"><StatusBadge label="" active={a.active} /></td>
                <td className="px-5 py-3.5">
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
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(26,54,93,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>
                {editing ? "แก้ไขผู้ดูแลระบบ" : "เพิ่มผู้ดูแลระบบใหม่"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} style={{ color: "#4A6080" }} /></button>
            </div>
            <div className="space-y-3">
              {[{ k: "citizenId", l: "เลขบัตรประชาชน (13 หลัก)" }, { k: "name", l: "ชื่อ-นามสกุล" }, { k: "email", l: "อีเมล" }, { k: "phone", l: "เบอร์โทร" }, { k: "salary", l: "เงินเดือน", type: "number" }].map(({ k, l, type }) => (
                <div key={k}>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>{l}</label>
                  <input type={type ?? "text"} value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                    maxLength={k === 'citizenId' ? 13 : undefined}
                    disabled={k === 'citizenId' && !!editing}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none ${k === 'citizenId' && editing ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                </div>
              ))}
              {!editing && (
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>รหัสผ่านเริ่มต้น</label>
                  <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} placeholder="ตั้งรหัสผ่านให้แอดมิน" />
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
