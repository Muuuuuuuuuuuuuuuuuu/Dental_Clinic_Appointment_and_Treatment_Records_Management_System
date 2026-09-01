import React, { useState } from "react";
import { Search, CheckCircle, FileText, Users, Calendar } from "lucide-react";

import { Appointment, STATUS_COLORS, TreatmentPlan, hasHealthAlert } from "../../shared/data";
import { useRealtimeAppointments } from "../../shared/useRealtimeAppointments";

export default function PatientVerification() {
  const { appointments } = useRealtimeAppointments();
  const [q, setQ] = useState("");

  const results = q
    ? Array.from(new Map(
        appointments
          .filter(a => a.patientName.includes(q) || a.hn.includes(q) || a.patientPhone.includes(q))
          .map(a => [a.hn, a])
      ).values())
    : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>ตรวจสอบข้อมูลคนไข้</h1>
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
        {results.map(a => {
          const apptHistory = appointments.filter(x => x.hn === a.hn);
          const todayStr = new Date().toISOString().split("T")[0];
          const todayAppt = apptHistory.find(x => x.date === todayStr);
          return (
            <div key={a.hn} className="rounded-2xl bg-white p-5" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
                  {a.patientName[2] ?? "?"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold" style={{ color: "#1A365D" }}>{a.patientName}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#E8F4FF", color: "#1D6FA4" }}>{a.hn}</span>
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: "#4A6080" }}>{a.patientPhone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl" style={{ backgroundColor: hasHealthAlert(a.conditions) ? "#FFF3E0" : "#F8F9FA" }}>
                  <p className="text-xs font-medium mb-1" style={{ color: "#4A6080" }}>โรคประจำตัว</p>
                  <p className="text-sm" style={{ color: hasHealthAlert(a.conditions) ? "#E65100" : "#1A365D" }}>{a.conditions}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: hasHealthAlert(a.allergies) ? "#FEF2F2" : "#F8F9FA" }}>
                  <p className="text-xs font-medium mb-1" style={{ color: "#4A6080" }}>ประวัติแพ้ยา</p>
                  <p className="text-sm" style={{ color: hasHealthAlert(a.allergies) ? "#B91C1C" : "#1A365D" }}>{a.allergies}</p>
                </div>
              </div>

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
