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
  appointments: globalAppointments,
  onUpdateAppt,
  onBookFollowUp
}: { 
  user: PatientUser; 
  setView: (v: View) => void;
  appointments?: Appointment[];
  onUpdateAppt?: (id: number, updates: Partial<Appointment>) => void;
  onBookFollowUp?: (serviceId: number, doctorId: number) => void;
}) {
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<number | null>(null);

  // Always fetch fresh data from DB when mounted or patientId changes
  // (ไม่พึ่ง globalAppointments เพราะอาจ [] หรือ RLS block ได้)
  useEffect(() => {
    if (!user.patientId) {
      setLoading(false); // ไม่มี patientId → หยุด loading ทันที
      return;
    }
    setLoading(true);
    getPatientAppointments(user.patientId)
      .then(data => setAppts(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.patientId]);

  // Sync optimistic cancel updates from parent state
  useEffect(() => {
    if (!globalAppointments || !user.patientId) return;
    const parentAppts = globalAppointments.filter(a => a.patientId === user.patientId);
    setAppts(prev => prev.map(a => {
      const updated = parentAppts.find(p => p.id === a.id);
      return updated ? { ...a, status: updated.status } : a;
    }));
  }, [globalAppointments, user.patientId]);

  const doCancel = async (id: number) => {
    // 1. ซ่อนจากหน้าจอทันที (Optimistic Update) เพื่อให้หายไปเลยโดยไม่ต้องรอโหลด
    const previousAppts = [...appts];
    setAppts(apps => apps.map(a => a.id === id ? { ...a, status: "ยกเลิก" } : a));
    if (onUpdateAppt) {
      onUpdateAppt(id, { status: "ยกเลิก" });
    }
    setCancelId(null);

    try {
      // 2. อัปเดตฐานข้อมูลเบื้องหลัง
      await updateAppointmentStatus(id, "ยกเลิก");
    } catch (err) {
      console.error(err);
      // ถ้ายกเลิกไม่สำเร็จจริงๆ ค่อยดึงข้อมูลเดิมกลับมาแสดง
      setAppts(previousAppts);
      if (onUpdateAppt) {
        const prevAppt = previousAppts.find(a => a.id === id);
        if (prevAppt) onUpdateAppt(id, { status: prevAppt.status });
      }
      alert("ไม่สามารถยกเลิกนัดหมายได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const activeAppts = appts.filter(a => {
    if (a.status === "ยกเลิก") return false;
    if (a.status === "เสร็จสิ้น" || a.status === "ไม่มาตามนัด") return false;
    // Don't filter out past times; if it's not finished/cancelled, it's still active!
    // It could be that they are currently in treatment, or the queue is running late.
    return true;
  }).sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    const timeA = a.time || "00:00";
    const timeB = b.time || "00:00";
    const dateA = new Date(`${a.date}T${timeA}:00`).getTime();
    const dateB = new Date(`${b.date}T${timeB}:00`).getTime();
    return dateA - dateB;
  });

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
        {activeAppts.length === 0 && (
          <div className="text-center py-16 rounded-2xl bg-white" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <Calendar size={40} className="mx-auto mb-3 opacity-20" style={{ color: "#1A365D" }} />
            <p className="text-sm" style={{ color: "#4A6080" }}>ยังไม่มีนัดหมาย</p>
          </div>
        )}
        {activeAppts.map(a => {
          const sc = statusColor[a.status] ?? { bg: "#F0F4F8", text: "#4A6080" };
          const canCancel = a.status !== "ยกเลิก";
          const isDone = a.status === "เสร็จสิ้น" || a.status === "ยกเลิก" || a.status === "ไม่มาตามนัด";
          const isPending = !isDone;

          let isWithin24Hours = false;
          if (a.date && a.time) {
            const apptDate = new Date(`${a.date}T${a.time}:00`);
            const now = new Date();
            const diffMs = apptDate.getTime() - now.getTime();
            if (diffMs <= 24 * 60 * 60 * 1000) {
              isWithin24Hours = true;
            }
          }
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
                    {(a.note || (a as any).source === "doctor") && (
                      <div className="mt-2 p-2.5 rounded-lg text-xs" style={{ backgroundColor: "#F8F9FA" }}>
                        {a.note && <p style={{ color: "#DB2777" }}>หมายเหตุ: {a.note}</p>}
                        {(a as any).source === "doctor" && <p style={{ color: "#7C3AED" }}>นัดนี้ถูกสร้างโดยทันตแพทย์หลังการรักษา</p>}
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
                  {isWithin24Hours ? (
                    <p className="text-xs font-medium" style={{ color: "#94A3B8" }}>
                      ยกเลิกไม่ได้ (น้อยกว่า 24 ชม.)
                    </p>
                  ) : cancelId === a.id ? (
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
                      ยกเลิกนัดหมาย
                    </button>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}
