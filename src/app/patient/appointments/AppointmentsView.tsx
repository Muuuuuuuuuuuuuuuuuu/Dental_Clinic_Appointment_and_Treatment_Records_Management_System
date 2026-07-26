import React, { useState, useEffect } from "react";
import { Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";

import { View, PatientUser, patientStatusColor as statusColor } from "../types";
import { Appointment } from "../../shared/data";
import { getPatientAppointments, updateAppointmentStatus } from "../../shared/supabaseApi";

const thDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
};

export default function AppointmentsView({
  user,
  setView,
  onBookFollowUp
}: {
  user: PatientUser;
  setView: (v: View) => void;
  onBookFollowUp?: (serviceId: number, doctorId: number) => void;
}) {
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<number | null>(null);

  useEffect(() => {
    getPatientAppointments()
      .then(data => setAppts(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const doCancel = async (id: number) => {
    try {

      const updated = await updateAppointmentStatus(id, "ยกเลิก");
      setAppts(apps => apps.map(a => a.id === id ? { ...a, status: updated.status } : a));
      setCancelId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to cancel appointment");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>รายการนัดหมาย</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>ติดตามสถานะนัดหมายทั้งหมดของคุณ</p>
        </div>
        <button onClick={() => setView("booking")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
          <Calendar size={14} /> จองใหม่
        </button>
      </div>

      <div className="space-y-4">
        {appts.length === 0 && (
          <div className="text-center py-16 rounded-2xl bg-white" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <Calendar size={40} className="mx-auto mb-3 opacity-20" style={{ color: "#1A365D" }} />
            <p className="text-sm" style={{ color: "#4A6080" }}>ยังไม่มีนัดหมาย</p>
          </div>
        )}
        {appts.map(a => {
          const sc = statusColor[a.status] ?? { bg: "#F0F4F8", text: "#4A6080" };
          const canCancel = a.status === "ยืนยันการจอง" && (a as any).source !== "doctor";
          const isPending = a.status !== "เสร็จสิ้น" && (a.status as any) !== "เสร็จเรียบร้อย";
          return (
            <div key={a.id} className="rounded-2xl bg-white p-5" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
                    style={{ background: isPending ? "linear-gradient(135deg,#FF8C9A,#FF6B7E)" : "linear-gradient(135deg,#4ade80,#22c55e)" }}>
                    <span className="text-xs font-bold text-white leading-none">{a.date ? new Date(a.date).getDate() : "-"}</span>
                    <span className="text-xs text-white opacity-80">{a.date ? new Date(a.date).toLocaleDateString("th-TH", { month: "short" }) : "-"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm" style={{ color: "#1A365D" }}>{a.service}</p>
                      {(a as any).source === "doctor" && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#F3E8FF", color: "#7C3AED" }}>
                          นัดโดยทันตแพทย์
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "#4A6080" }}>{a.doctorName || (a as any).doctor}</p>
                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#4A6080" }}>
                      <Clock size={10} /> {a.date ? `${a.time} น. • ${thDate(a.date)}` : "รอการระบุวัน-เวลา"}
                    </p>
                    {isPending && a.date !== "" && (
                      <div className="mt-2 p-2.5 rounded-lg text-xs" style={{ backgroundColor: "#F8F9FA" }}>
                        <p className="font-medium mb-0.5" style={{ color: "#1A365D" }}>รายละเอียดนัดหมาย</p>
                        <p style={{ color: "#4A6080" }}>บริการ: {a.service}</p>
                        {a.date && <p style={{ color: "#4A6080" }}>วันที่: {thDate(a.date)} เวลา {a.time} น.</p>}
                        {(a as any).source === "doctor" && <p style={{ color: "#7C3AED" }}>นัดนี้ถูกสร้างโดยทันตแพทย์หลังการรักษา</p>}
                      </div>
                    )}
                    {(a.status as any) === "รอระบุวัน-เวลา" && onBookFollowUp && (
                      <div className="mt-3">
                        <button onClick={() => {
                          // Mocking matching ID from name for demo
                          const serviceId = (a as any).serviceId || 1; 
                          const doctorId = (a as any).doctorId || 0;
                          onBookFollowUp(serviceId, doctorId);
                        }}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
                          style={{ background: "linear-gradient(135deg,#DB2777,#BE185D)" }}>
                          <Calendar size={12} /> คลิกเพื่อเลือกวัน-เวลา (สำหรับนัดต่อเนื่อง)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                  style={{ backgroundColor: sc.bg, color: sc.text }}>
                  {a.status}
                </span>
              </div>
              {canCancel && (
                <div className="mt-4 pt-3 flex items-center gap-2" style={{ borderTop: "1px solid rgba(26,54,93,0.06)" }}>
                  {cancelId === a.id ? (
                    <>
                      <p className="text-xs flex-1" style={{ color: "#E65100" }}>ยืนยันการยกเลิกนัดหมาย?</p>
                      <button onClick={() => doCancel(a.id)} className="text-xs px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: "#E74C3C" }}>
                        ยืนยันยกเลิก
                      </button>
                      <button onClick={() => setCancelId(null)} className="text-xs px-3 py-1.5 rounded-lg" style={{ border: "1px solid rgba(26,54,93,0.15)", color: "#4A6080" }}>
                        ไม่ยกเลิก
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setCancelId(a.id)} className="text-xs font-medium hover:opacity-70" style={{ color: "#E74C3C" }}>
                      ยกเลิกนัดหมาย (ก่อน 24 ชม.)
                    </button>
                  )}
                </div>
              )}
              {(a as any).source === "doctor" && a.status === "ยืนยันการจอง" && (
                <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: "1px solid rgba(26,54,93,0.06)" }}>
                  <AlertCircle size={12} style={{ color: "#7C3AED" }} />
                  <p className="text-xs" style={{ color: "#7C3AED" }}>นัดหมายนี้สร้างโดยทันตแพทย์ ไม่สามารถยกเลิกผ่านระบบออนไลน์ได้ กรุณาติดต่อคลินิกโดยตรง</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
