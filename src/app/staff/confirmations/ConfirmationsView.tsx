import React, { useState, useEffect } from "react";
import { CheckCircle, Clock, AlertTriangle, PhoneCall, XCircle } from "lucide-react";
import { Appointment, STATUS_COLORS, hasHealthAlert } from "../../shared/data";
import {  updateAppointmentStatus } from "../../shared/supabaseApi";
import { useRealtimeAppointments } from "../../shared/useRealtimeAppointments";

export default function ConfirmationsView() {
  const { appointments, refetch: fetchAppointments, setAppointments } = useRealtimeAppointments();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments().catch(console.error).finally(() => setLoading(false));
  }, []);

  const onUpdateAppt = async (id: number, updates: Partial<Appointment>) => {
    try {
      if (updates.status) {
        const updated = await updateAppointmentStatus(id, updates.status);
        setAppointments(apps => apps.map(a => a.id === id ? { ...a, status: updated.status } : a));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update appointment");
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  // แสดงนัดหมายที่ยืนยันแล้วสำหรับวันนี้ (ไม่มีสถานะ รอการยืนยัน อีกต่อไป)
  const pendingAppointments = appointments.filter(a => a.date === todayStr && a.status === "ยืนยันการจอง");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>นัดหมายวันนี้</h1>
        <p className="text-sm" style={{ color: "#4A6080" }}>รายการนัดหมายที่ยืนยันแล้วและรอเช็คอินสำหรับวันนี้</p>
      </div>


      {pendingAppointments.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 flex flex-col items-center justify-center text-center" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "#F0F4F8" }}>
            <CheckCircle size={32} style={{ color: "#94A3B8" }} />
          </div>
          <p className="font-semibold text-lg" style={{ color: "#1A365D" }}>ไม่มีนัดหมายที่รอการยืนยัน</p>
          <p className="text-sm mt-1" style={{ color: "#4A6080" }}>นัดหมายทั้งหมดได้รับการจัดการเรียบร้อยแล้ว</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingAppointments.map(a => (
            <div key={a.id} className="rounded-2xl bg-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)", borderLeft: "4px solid #F57F17" }}>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FFF8E1", color: "#F57F17" }}>รอการยืนยัน</span>
                  <span className="font-bold" style={{ color: "#1A365D" }}>{a.date} | {a.time} น.</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                    {(hasHealthAlert(a.conditions) || hasHealthAlert(a.allergies)) ? "ผู้ป่วยมีความเสี่ยงสุขภาพ" : "บริการต้องให้แพทย์ประเมิน"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold" style={{ color: "#1A365D" }}>{a.patientName}</p>
                  <span className="text-xs text-gray-500">HN: {a.hn}</span>
                </div>
                <p className="text-sm mt-1" style={{ color: "#4A6080" }}>
                  <strong>บริการ:</strong> {a.service} <br/>
                  <strong>ทันตแพทย์:</strong> {a.doctorName}
                </p>
                {hasHealthAlert(a.conditions) && (
                  <div className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg flex gap-1.5 items-start bg-red-50 text-red-700 border border-red-100">
                    <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                    <span>เสี่ยงสุขภาพ: {a.conditions}</span>
                  </div>
                )}
                {hasHealthAlert(a.allergies) && (
                  <div className="mt-1 text-xs font-semibold px-3 py-1.5 rounded-lg flex gap-1.5 items-start bg-orange-50 text-orange-700 border border-orange-100">
                    <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                    <span>แพ้ยา: {a.allergies}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <PhoneCall size={14} style={{ color: "#4A6080" }} />
                  <span className="text-sm font-medium" style={{ color: "#1D6FA4" }}>{a.patientPhone}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 min-w-[140px]">
                <button onClick={() => onUpdateAppt(a.id, { status: "ยืนยันการจอง" })}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
                  style={{ backgroundColor: "#22C55E", boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)" }}>
                  <CheckCircle size={16} /> ยืนยันคิว
                </button>
                <button onClick={() => onUpdateAppt(a.id, { status: "ยกเลิก" })}
                  className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all"
                  style={{ backgroundColor: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA" }}>
                  <XCircle size={16} /> ปฏิเสธ/ยกเลิก
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

