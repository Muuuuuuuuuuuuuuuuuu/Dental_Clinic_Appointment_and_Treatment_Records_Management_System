import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, CheckCircle, Search, X } from "lucide-react";
import { PatientInfo } from "../../shared/data";
import { getPatients, addPatient } from "../../shared/supabaseApi";

export default function PatientManagement() {
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    citizenId: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    address: "",
    allergyHistory: "ไม่มี",
    underlyingDisease: "ไม่มี",
    emergencyContactName: "",
    emergencyContactPhone: ""
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.hn.toLowerCase().includes(search.toLowerCase())
  );

  const save = async () => {
    if (!form.firstName || !form.lastName || !form.citizenId || !form.email) {
      alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อ, นามสกุล, เลขบัตรประชาชน, อีเมล)");
      return;
    }
    
    setSaving(true);
    try {
      await addPatient({
        ...form
      });
      setShowModal(false);
      setForm({
        firstName: "", lastName: "", citizenId: "", email: "", phone: "", gender: "", dob: "", address: "", allergyHistory: "ไม่มี", underlyingDisease: "ไม่มี", emergencyContactName: "", emergencyContactPhone: ""
      });
      // แจ้งรหัสผ่านเริ่มต้นให้ทราบ
      alert("เพิ่มคนไข้สำเร็จ!\nรหัสผ่านเริ่มต้นสำหรับเข้าสู่ระบบคือ: patient123");
      fetchPatients();
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto" style={{ fontFamily: "Prompt, sans-serif" }}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>จัดการคนไข้</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>คนไข้ทั้งหมด {patients.length} คน</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ หรือ HN..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 w-64"
              style={{ borderColor: "rgba(26,54,93,0.1)" }}
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 shadow-sm shadow-pink-200"
            style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}
          >
            <Plus size={15} /> เพิ่มคนไข้
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead style={{ backgroundColor: "#F8F9FA" }}>
              <tr>
                {["HN", "ชื่อ-นามสกุล", "อีเมล", "เบอร์โทร", "โรคประจำตัว", "ประวัติแพ้ยา", ""].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "#4A6080" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid rgba(26,54,93,0.05)" }}>
                  <td className="px-5 py-3.5 font-medium" style={{ color: "#1A365D" }}>{p.hn}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: "#4A90E2" }}>
                        {p.name[0] ?? "ค"}
                      </div>
                      <span className="font-medium" style={{ color: "#1A365D" }}>{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "#4A6080" }}>{p.email || '-'}</td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "#4A6080" }}>{p.phone || '-'}</td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: p.underlyingDisease !== 'ไม่มี' ? "#E65100" : "#4A6080" }}>
                    {p.underlyingDisease}
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: p.allergyHistory !== 'ไม่มีประวัติ' && p.allergyHistory !== 'ไม่มี' ? "#D32F2F" : "#4A6080" }}>
                    {p.allergyHistory}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: "#4A6080" }} title="แก้ไขข้อมูล"><Edit3 size={14} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: "#E65100" }} title="ลบข้อมูล"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">ไม่พบข้อมูลคนไข้</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(26,54,93,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 p-8 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>
                เพิ่มคนไข้ใหม่
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: "#4A6080" }}><X size={18} /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>ชื่อ</label>
                <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border" style={{ backgroundColor: "#F0F4F8", borderColor: "transparent", color: "#1A365D" }} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>นามสกุล</label>
                <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border" style={{ backgroundColor: "#F0F4F8", borderColor: "transparent", color: "#1A365D" }} />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>เลขบัตรประชาชน</label>
                <input value={form.citizenId} onChange={e => setForm(f => ({ ...f, citizenId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border" style={{ backgroundColor: "#F0F4F8", borderColor: "transparent", color: "#1A365D" }} />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>วันเกิด</label>
                <input type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border" style={{ backgroundColor: "#F0F4F8", borderColor: "transparent", color: "#1A365D" }} />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>อีเมล</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border" style={{ backgroundColor: "#F0F4F8", borderColor: "transparent", color: "#1A365D" }} />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>เบอร์โทรศัพท์</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border" style={{ backgroundColor: "#F0F4F8", borderColor: "transparent", color: "#1A365D" }} />
              </div>
              
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>โรคประจำตัว</label>
                <input value={form.underlyingDisease} onChange={e => setForm(f => ({ ...f, underlyingDisease: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border" style={{ backgroundColor: "#F0F4F8", borderColor: "transparent", color: "#1A365D" }} />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>ประวัติแพ้ยา</label>
                <input value={form.allergyHistory} onChange={e => setForm(f => ({ ...f, allergyHistory: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border" style={{ backgroundColor: "#F0F4F8", borderColor: "transparent", color: "#1A365D" }} />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ border: "1.5px solid rgba(26,54,93,0.2)", color: "#4A6080" }}>ยกเลิก</button>
              <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
                {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

