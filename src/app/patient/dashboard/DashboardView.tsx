import React, { useState, useEffect } from "react";
import { Calendar, CheckCircle, Clock } from "lucide-react";

import { FileText, Shield, ChevronRight, Bell, Phone, MapPin } from "lucide-react";
import { View, PatientUser, patientStatusColor as statusColor } from "../types";
import { ClinicStatusCard } from "../landing/ClinicStatus";
import { Appointment } from "../../shared/data";
import { getPatientAppointments, getPatientTreatmentRecords, getDailyHours, getWeeklyOffDays, DayHours } from "../../shared/supabaseApi";

export default function DashboardView({
  user,
  setView,
  appointments: globalAppointments
}: {
  user: PatientUser;
  setView: (v: View) => void;
  appointments?: Appointment[];
}) {
  const [appointments, setAppointments] = useState<Appointment[]>(globalAppointments?.filter(a => a.patientId === user.patientId) || []);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyHours, setDailyHours] = useState<Record<string, DayHours>>({});
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([]);

  useEffect(() => {
    if (globalAppointments) {
      setAppointments(globalAppointments.filter(a => a.patientId === user.patientId));
    }
  }, [globalAppointments, user.patientId]);

  useEffect(() => {
    if (!user.patientId) return;
    Promise.all([
      !globalAppointments ? getPatientAppointments(user.patientId).then(data => setAppointments(data)) : Promise.resolve(),
      getPatientTreatmentRecords(user.patientId).then(data => setHistory(data)),
      getDailyHours().then(data => setDailyHours(data)),
      getWeeklyOffDays().then(data => setWeeklyOffDays(data))
    ]).catch(console.error).finally(() => setLoading(false));
  }, [user, globalAppointments]);

  const upcoming = appointments.find(a => a.status !== "เสร็จสิ้น" && a.status !== "ยกเลิก" && a.status !== "ไม่มาตามนัด");
  return (
    <div>
      <ClinicStatusCard />
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>
          สวัสดี, คุณ{user.firstName}
        </h1>
        <p className="text-sm" style={{ color: "#4A6080" }}>ยินดีต้อนรับเข้าสู่ระบบจัดการนัดหมายของคุณ</p>
      </div>

      {/* แถวสรุปข้อมูลสถิติ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {([
          { label: "นัดหมายทั้งหมด", val: appointments.filter(a => a.status !== "เสร็จสิ้น" && a.status !== "ยกเลิก" && a.status !== "ไม่มาตามนัด").length, icon: Calendar, bg: "#FFD6DC", ic: "#FF8C9A", nav: "appointments" as View },
          { label: "รอรับบริการ", val: appointments.filter(a => a.status === "เช็คอินเรียบร้อย" || a.status === "กำลังรักษา" || a.status === "รอชำระเงิน").length, icon: Clock, bg: "#FFF3E0", ic: "#E65100", nav: "appointments" as View },
          { label: "ประวัติการรักษา", val: history.length, icon: FileText, bg: "#E8F4FF", ic: "#1D6FA4", nav: "history" as View },
          { label: "ค่าใช้จ่ายรวม", val: `฿${history.reduce((s, h) => s + parseInt((h.cost || "0").replace(/,/g, ""), 10), 0).toLocaleString()}`, icon: Shield, bg: "#E8FFF0", ic: "#1B7A3E", nav: "history" as View },
        ] as const).map(s => (
          <button key={s.label} onClick={() => setView(s.nav)}
            className="rounded-2xl p-4 bg-white text-left transition-all hover:shadow-md active:scale-[0.98]"
            style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.05)" }}>
            <div className="text-2xl font-bold" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>{s.val}</div>
            <div className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "#4A6080" }}>
              {s.label} <ChevronRight size={10} />
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* นัดหมายถัดไป */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold" style={{ color: "#1A365D" }}>นัดหมายถัดไป</h2>
            <button onClick={() => setView("appointments")} className="text-xs hover:opacity-70" style={{ color: "#FF8C9A" }}>ดูทั้งหมด</button>
          </div>
          {upcoming ? (
            <div className="flex items-start gap-4 p-4 rounded-xl" style={{ backgroundColor: "#F0F4F8" }}>
              <div className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
                <span className="text-xs font-bold text-white leading-none">{upcoming.date ? new Date(upcoming.date).getDate() : "-"}</span>
                <span className="text-xs text-white opacity-80">{upcoming.date ? new Date(upcoming.date).toLocaleDateString("th-TH", { month: "short" }) : "-"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: "#1A365D" }}>{upcoming.service}</p>
                <p className="text-xs mt-0.5" style={{ color: "#4A6080" }}>{upcoming.doctorName || (upcoming as any).doctor}</p>
                <p className="text-xs mt-0.5" style={{ color: "#4A6080" }}>{upcoming.time ? `เวลา ${upcoming.time} น.` : "รอระบุเวลา"}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                style={{ backgroundColor: statusColor[upcoming.status]?.bg, color: statusColor[upcoming.status]?.text }}>
                {upcoming.status}
              </span>
            </div>
          ) : (
            <div className="text-center py-8" style={{ color: "#4A6080" }}>
              <Calendar size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">ยังไม่มีนัดหมายที่กำลังจะมาถึง</p>
            </div>
          )}

          {/* ปุ่มทางลัด */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button onClick={() => setView("booking")}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
              จองนัดหมายใหม่
            </button>
            <button onClick={() => setView("appointments")}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
              style={{ border: "1.5px solid rgba(26,54,93,0.15)", color: "#1A365D" }}>
              รายการนัดหมาย
            </button>
          </div>
        </div>

        {/* ข้อมูลคลินิก */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-5" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <h2 className="text-base font-semibold mb-3" style={{ color: "#1A365D" }}>เวลาทำการ</h2>
            {[
              { day: "จันทร์", idx: 1 }, { day: "อังคาร", idx: 2 }, { day: "พุธ", idx: 3 },
              { day: "พฤหัสบดี", idx: 4 }, { day: "ศุกร์", idx: 5 }, { day: "เสาร์", idx: 6 }, { day: "อาทิตย์", idx: 0 }
            ].map(h => {
              const isOff = weeklyOffDays.includes(h.idx);
              const hrs = dailyHours[h.idx.toString()];
              const t = isOff || !hrs ? "ปิดทำการ" : `${hrs.open} – ${hrs.close} น.`;
              return (
                <div key={h.day} className="flex justify-between py-2 text-sm" style={{ borderBottom: "1px solid rgba(26,54,93,0.06)" }}>
                  <span style={{ color: "#4A6080" }}>{h.day}</span>
                  <span style={{ color: t === "ปิดทำการ" ? "#999" : "#FF8C9A", fontWeight: 500 }}>{t}</span>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl bg-white p-5" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <h2 className="text-base font-semibold mb-3" style={{ color: "#1A365D" }}>ติดต่อเรา</h2>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm" style={{ color: "#4A6080" }}>
                <Phone size={14} style={{ color: "#FF8C9A" }} /> 02-345-6987
              </div>
              <div className="flex items-start gap-2.5 text-sm" style={{ color: "#4A6080" }}>
                <MapPin size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#FF8C9A" }} />
                <span>หน้ามอเกษตรกำแพงแสน อำเภอกำแพงแสน จังหวัดนครปฐม</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
