import React, { useState, useEffect, useRef } from "react";
import { Calendar, CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react";

import { View, PatientUser, patientStatusColor as statusColor } from "../types";
import { Appointment } from "../../shared/data";
import { getPatientAppointments, updateAppointmentStatus } from "../../shared/supabaseApi";

/** ดึงเวลา "ปัจจุบัน" โดยรองรับ Time Travel mock time */
function getNow(): Date {
  const mockDatetime = localStorage.getItem("supat_mock_date");
  if (mockDatetime) {
    const parsed = new Date(mockDatetime);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

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
  onBookFollowUp?: (serviceId: number, doctorId: number, openTicketId?: number) => void;
}) {
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [expiringIds, setExpiringIds] = useState<Set<number>>(new Set());
  const autoExpireRanRef = useRef(false);

  // ดึงข้อมูลนัดหมายล่าสุดจากฐานข้อมูลเสมอเมื่อเปิดหน้านี้หรือเมื่อรหัสคนไข้เปลี่ยน
  // (ไม่พึ่ง globalAppointments เพราะอาจ [] หรือ RLS block ได้)
  useEffect(() => {
    if (!user.patientId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    autoExpireRanRef.current = false; // reset ทุกครั้งที่ reload data
    getPatientAppointments(user.patientId)
      .then(data => setAppts(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.patientId]);

  /**
   * Auto-cancel นัดหมายที่ "เลยเวลานัดแล้ว" และยังไม่ได้เช็คอิน / รักษา / ยกเลิก
   * เงื่อนไข: สถานะเป็น "รอการยืนยัน" หรือ "ยืนยันการจอง" และเวลานัดผ่านไปแล้ว
   * จะอัปเดตสถานะเป็น "ไม่มาตามนัด" และบันทึกใน appointment_log อัตโนมัติ
   */
  useEffect(() => {
    if (loading || autoExpireRanRef.current || appts.length === 0) return;
    autoExpireRanRef.current = true;

    const now = getNow();
    const expirableStatuses = ["รอการยืนยัน", "ยืนยันการจอง"];

    const toExpire = appts.filter(a => {
      if (!expirableStatuses.includes(a.status)) return false;
      if (!a.date || !a.time) return false;
      const apptDateTime = new Date(`${a.date}T${a.time}:00`);
      return apptDateTime < now; // เลยเวลานัดแล้ว
    });

    if (toExpire.length === 0) return;

    // แสดง loading indicator
    setExpiringIds(new Set(toExpire.map(a => a.id)));

    // Optimistic update → ซ่อนจากหน้าจอก่อน
    setAppts(prev =>
      prev.map(a =>
        toExpire.find(e => e.id === a.id)
          ? { ...a, status: "ไม่มาตามนัด" }
          : a
      )
    );

    // บันทึกลง DB ทีละรายการ
    Promise.allSettled(
      toExpire.map(a =>
        updateAppointmentStatus(
          a.id,
          "ไม่มาตามนัด",
          "ระบบยกเลิกอัตโนมัติ: คนไข้ไม่มาตามนัดหมายที่กำหนด"
        ).catch(err => {
          console.error(`Auto-expire failed for appt ${a.id}:`, err);
          // roll back เฉพาะรายการที่ fail
          setAppts(prev =>
            prev.map(p => p.id === a.id ? { ...p, status: a.status } : p)
          );
        })
      )
    ).finally(() => {
      setExpiringIds(new Set());
    });
  }, [loading, appts.length]);

  // ซิงค์ข้อมูลที่อัปเดตจากหน้าหลัก (รวมถึงนัดหมายที่เพิ่งสร้างใหม่)
  useEffect(() => {
    if (!globalAppointments || !user.patientId) return;
    const parentAppts = globalAppointments.filter(a => a.patientId === user.patientId);
    setAppts(parentAppts);
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
    // ไม่กรองเวลาที่ผ่านไปแล้วออก หากยังไม่เสร็จสิ้นหรือยกเลิกให้ถือว่ายังเป็นนัดหมายที่ใช้งานอยู่
    // เนื่องจากคนไข้อาจกำลังรับการรักษาอยู่ หรือคิวอาจล่าช้ากว่าเวลาที่นัด
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
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>รายการนัดหมาย</h1>
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

          let isWithin12Hours = false;
          if (a.date && a.time) {
            const apptDate = new Date(`${a.date}T${a.time}:00`);
            const now = getNow(); // รองรับ mock time
            const diffMs = apptDate.getTime() - now.getTime();
            if (diffMs <= 12 * 60 * 60 * 1000) {
              isWithin12Hours = true;
            }
          }
          const isExpiring = expiringIds.has(a.id);
          return (
            /* isExpiring = กำลัง auto-cancel อยู่ */
            <div key={a.id} className={`rounded-2xl bg-white p-5 transition-all ${isExpiring ? "opacity-50 pointer-events-none" : ""}`} style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
              {isExpiring && (
                <div className="flex items-center gap-1.5 text-xs mb-2" style={{ color: "#E74C3C" }}>
                  <RefreshCw size={11} className="animate-spin" />
                  กำลังบันทึกว่า "ไม่มาตามนัด" อัตโนมัติ...
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
                    style={{ background: isPending ? "#FF8C9A" : "linear-gradient(135deg,#4ade80,#22c55e)" }}>
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
              <div className="mt-4 pt-3 flex items-center justify-between gap-2" style={{ borderTop: "1px solid rgba(26,54,93,0.06)" }}>
                <div className="flex items-center gap-2">
                  {canCancel && (
                    isWithin12Hours ? (
                      <p className="text-xs font-medium" style={{ color: "#94A3B8" }}>
                        ยกเลิกไม่ได้ (น้อยกว่า 12 ชม.)
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
                    )
                  )}
                </div>
                {!a.date && onBookFollowUp && (
                  <button onClick={() => {
                    onBookFollowUp(a.serviceId, a.doctorId, a.id);
                  }} 
                    className="text-xs px-4 py-1.5 rounded-lg font-bold text-white transition-all hover:opacity-90 shadow-sm"
                    style={{ background: "linear-gradient(135deg,#1D6FA4,#1A365D)" }}>
                    ระบุวันนัดหมาย
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
