import React, { useState, useEffect } from "react";
import { Search, CheckCircle, FileText, Users, Calendar, Edit3, X } from "lucide-react";

import { Appointment, STATUS_COLORS, hasHealthAlert } from "../../shared/data";
import { useRealtimeAppointments } from "../../shared/useRealtimeAppointments";
import { getPatients, updatePatientInfoByPatientId } from "../../shared/supabaseApi";

export default function PatientVerification() {
  const { appointments, refetch: refetchAppointments } = useRealtimeAppointments();
  const [q, setQ] = useState("");
  const [allPatients, setAllPatients] = useState<any[]>([]);
  
  const [editingPatientId, setEditingPatientId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ email: "", phone: "", allergyHistory: "", underlyingDisease: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getPatients().then(setAllPatients).catch(console.error);
  }, []);

  const results = q
    ? allPatients.filter(p => 
        p.name.toLowerCase().includes(q.toLowerCase()) || 
        p.hn.toLowerCase().includes(q.toLowerCase()) || 
        (p.phone && p.phone.includes(q))
      )
    : [];

  const handleEditSubmit = async (patientId: number) => {
    if (editForm.phone && editForm.phone.replace(/\D/g, "").length !== 10) {
      alert("เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักเท่านั้น");
      return;
    }
    setIsSaving(true);
    try {
      await updatePatientInfoByPatientId(patientId, editForm);
      // อัปเดตข้อมูลที่มีอยู่ local state
      setAllPatients(prev => prev.map(p => p.id === patientId ? { ...p, ...editForm } : p));
      setEditingPatientId(null);
      refetchAppointments(); // รีเฟรชข้อมูลนัดหมายเพื่อให้ข้อมูลเป็นปัจจุบัน
      alert("อัปเดตข้อมูลสำเร็จ");
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการอัปเดต");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>ตรวจสอบข้อมูลคนไข้</h1>
        <p className="text-sm" style={{ color: "#4A6080" }}>ค้นหาและยืนยันตัวตนก่อนเข้ารับบริการ</p>
      </div>
      <div className="relative max-w-md mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#4A6080" }} />
        <input value={q} onChange={e => setQ(e.target.value)}
          placeholder="ชื่อ, HN, หรือเบอร์โทรศัพท์..."
          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
          style={{ backgroundColor: "white", border: "1.5px solid rgba(26,54,93,0.12)", color: "#1A365D", boxShadow: "0 2px 8px rgba(26,54,93,0.06)" }} />
      </div>

      {q && results.length === 0 && (
        <div className="text-center py-12" style={{ color: "#4A6080" }}>
          <Users size={32} className="mx-auto mb-2 opacity-20" />
          <p className="text-sm">ไม่พบข้อมูลคนไข้</p>
        </div>
      )}

      <div className="space-y-4">
        {results.map(p => {
          const apptHistory = appointments.filter(x => x.hn === p.hn);
          const todayStr = new Date().toISOString().split("T")[0];
          const todayAppt = apptHistory.find(x => x.date === todayStr);
          const isEditing = editingPatientId === p.id;

          return (
            <div key={p.hn} className="rounded-2xl bg-white p-5" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
                  {p.name[0] ?? "?"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold" style={{ color: "#1A365D" }}>{p.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#E8F4FF", color: "#1D6FA4" }}>{p.hn}</span>
                    {!isEditing && (
                      <button onClick={() => {
                        setEditForm({
                          email: p.email || "",
                          phone: p.phone || "",
                          allergyHistory: p.allergyHistory || "ไม่มี",
                          underlyingDisease: p.underlyingDisease || "ไม่มี"
                        });
                        setEditingPatientId(p.id);
                      }} className="ml-auto text-[#4A6080] hover:text-[#FF8C9A] p-1">
                        <Edit3 size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: "#4A6080" }}>{p.phone || "-"}</p>
                </div>
              </div>

              {!isEditing ? (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: hasHealthAlert(p.underlyingDisease) ? "#FFF3E0" : "#F8F9FA" }}>
                    <p className="text-xs font-medium mb-1" style={{ color: "#4A6080" }}>โรคประจำตัว</p>
                    <p className="text-sm" style={{ color: hasHealthAlert(p.underlyingDisease) ? "#E65100" : "#1A365D" }}>{p.underlyingDisease}</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ backgroundColor: hasHealthAlert(p.allergyHistory) ? "#FEF2F2" : "#F8F9FA" }}>
                    <p className="text-xs font-medium mb-1" style={{ color: "#4A6080" }}>ประวัติแพ้ยา</p>
                    <p className="text-sm" style={{ color: hasHealthAlert(p.allergyHistory) ? "#B91C1C" : "#1A365D" }}>{p.allergyHistory}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl mb-4 bg-[#F8F9FA] border border-gray-200">
                   <div className="flex justify-between items-center mb-3">
                     <h4 className="font-semibold text-sm text-[#1A365D]">แก้ไขข้อมูล</h4>
                     <button onClick={() => setEditingPatientId(null)} className="text-[#4A6080] hover:bg-gray-200 p-1 rounded-lg">
                       <X size={14} />
                     </button>
                   </div>
                   <div className="space-y-3">
                     <div>
                       <label className="text-xs text-[#4A6080] block mb-1">อีเมล</label>
                       <input value={editForm.email} onChange={e => setEditForm(f => ({...f, email: e.target.value}))} className="w-full px-3 py-2 rounded-lg text-sm border bg-white focus:outline-none focus:border-[#FF8C9A]" />
                     </div>
                     <div>
                       <label className="text-xs text-[#4A6080] block mb-1">เบอร์โทรศัพท์</label>
                       <input type="tel" maxLength={10} placeholder="กรอกตัวเลข 10 หลัก" value={editForm.phone} onChange={e => setEditForm(f => ({...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10)}))} className="w-full px-3 py-2 rounded-lg text-sm border bg-white focus:outline-none focus:border-[#FF8C9A]" />
                     </div>
                     <div>
                       <label className="text-xs text-[#4A6080] block mb-1">ประวัติแพ้ยา (คั่นด้วยลูกน้ำ)</label>
                       <input value={editForm.allergyHistory} onChange={e => setEditForm(f => ({...f, allergyHistory: e.target.value}))} className="w-full px-3 py-2 rounded-lg text-sm border bg-white focus:outline-none focus:border-[#FF8C9A]" />
                     </div>
                     <div>
                       <label className="text-xs text-[#4A6080] block mb-1">โรคประจำตัว (คั่นด้วยลูกน้ำ)</label>
                       <input value={editForm.underlyingDisease} onChange={e => setEditForm(f => ({...f, underlyingDisease: e.target.value}))} className="w-full px-3 py-2 rounded-lg text-sm border bg-white focus:outline-none focus:border-[#FF8C9A]" />
                     </div>
                     <button onClick={() => handleEditSubmit(p.id)} disabled={isSaving} className="w-full py-2.5 mt-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50" style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
                       {isSaving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                     </button>
                   </div>
                </div>
              )}

              {todayAppt && (
                <div className="p-3 rounded-xl flex items-center gap-3" style={{ backgroundColor: "#E8F4FF" }}>
                  <Calendar size={14} style={{ color: "#1D6FA4" }} />
                  <div>
                    <p className="text-xs font-medium" style={{ color: "#1D6FA4" }}>นัดวันนี้: {todayAppt.time} น.</p>
                    <p className="text-xs" style={{ color: "#4A6080" }}>{todayAppt.service} • {todayAppt.doctorName}</p>
                  </div>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[todayAppt.status]?.bg, color: STATUS_COLORS[todayAppt.status]?.text }}>
                    {todayAppt.status}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
