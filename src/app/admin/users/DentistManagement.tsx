import { Badge } from "../../shared/components/ui/badge";
import React, { useState, useEffect } from "react";
import StatusBadge from "../../shared/components/StatusBadge";
import { UserPlus, Edit3, Trash2 , Plus, CheckCircle, X } from "lucide-react";

import { DentistInfo } from "../../shared/data";
import { getDentists, addDentist, updateDentist } from "../../shared/supabaseApi";

export default function DentistManagement() {
  const [dentists, setDentists] = useState<DentistInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DentistInfo | null>(null);
  const [form, setForm] = useState({ name: "", specialty: "", license: "", university: "", email: "", phone: "" });

  const open = (d?: DentistInfo) => {
    setEditing(d ?? null);
    setForm(d ? { name: d.name, specialty: d.specialty, license: d.license, university: d.university, email: d.email, phone: d.phone } : { name: "", specialty: "", license: "", university: "", email: "", phone: "" });
    setShowModal(true);
  };

  useEffect(() => {
    fetchDentists();
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
        const added = await addDentist({ ...form, active: true });
        setDentists(ds => [...ds, added]);
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
          <p className="text-sm" style={{ color: "#4A6080" }}>บัญชีทันตแพทย์ทั้งหมด {dentists.length} คน</p>
        </div>
        <button onClick={() => open()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
          <Plus size={15} /> เพิ่มทันตแพทย์
        </button>
      </div>

      <div className="rounded-2xl bg-white overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: "#F8F9FA" }}>
            <tr>
              {["ชื่อ-นามสกุล", "ความเชี่ยวชาญ", "ใบอนุญาต", "อีเมล", "สถานะ", ""].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "#4A6080" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dentists.map(d => (
              <tr key={d.id} style={{ borderBottom: "1px solid rgba(26,54,93,0.05)" }}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: "#FF8C9A" }}>
                      {d.name[4] ?? "ท"}
                    </div>
                    <span className="font-medium" style={{ color: "#1A365D" }}>{d.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-xs" style={{ color: "#4A6080" }}>{d.specialty}</td>
                <td className="px-5 py-3.5 text-xs" style={{ color: "#4A6080" }}>{d.license}</td>
                <td className="px-5 py-3.5 text-xs" style={{ color: "#4A6080" }}>{d.email}</td>
                <td className="px-5 py-3.5"><StatusBadge label="" active={d.active} /></td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <button onClick={() => open(d)} className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: "#4A6080" }}><Edit3 size={14} /></button>
                    <button onClick={() => toggleActive(d)}
                      className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: d.active ? "#E65100" : "#1B7A3E" }}>
                      {d.active ? <Trash2 size={14} /> : <CheckCircle size={14} />}
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
                {editing ? "แก้ไขข้อมูลทันตแพทย์" : "เพิ่มทันตแพทย์ใหม่"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: "#4A6080" }}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              {[
                { k: "name", l: "ชื่อ-นามสกุล (พร้อมคำนำหน้า)" },
                { k: "specialty", l: "ความเชี่ยวชาญ" },
                { k: "license", l: "เลขที่ใบอนุญาต" },
                { k: "university", l: "สถาบันการศึกษา" },
                { k: "email", l: "อีเมลองค์กร" },
                { k: "phone", l: "เบอร์โทรศัพท์" },
              ].map(({ k, l }) => (
                <div key={k}>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>{l}</label>
                  <input value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                </div>
              ))}
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
