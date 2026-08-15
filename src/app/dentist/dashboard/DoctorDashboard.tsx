import React, { useState, useEffect } from "react";
import { Users, FileText, Calendar, Clock, CheckCircle, AlertTriangle, ClipboardList, CreditCard } from "lucide-react";

import { Appointment, STATUS_COLORS, DocView, DentistInfo } from "../../shared/data";
import { getAppointments } from "../../shared/supabaseApi";

export default function DoctorDashboard({ 
  setView, 
  doctor,
  appointments: initialAppointments
}: { 
  setView: (v: DocView) => void; 
  doctor: DentistInfo | null;
  appointments?: Appointment[];
}) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments || []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialAppointments) {
      setAppointments(initialAppointments);
    }
  }, [initialAppointments]);

  useEffect(() => {
    if (!initialAppointments) {
      getAppointments().then(setAppointments).catch(console.error).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const today = new Date();
  // คำนวณวันที่ใน timezone ไทย (UTC+7) อย่างถูกต้อง
  const todayString = today.toLocaleDateString('sv-SE', { timeZone: 'Asia/Bangkok' }); // sv-SE ให้ YYYY-MM-DD format
  const formattedDate = today.toLocaleDateString("th-TH", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Bangkok' });

  const myAppts = appointments.filter(a => a.doctorId === doctor?.id && a.date === todayString);
  const waiting  = myAppts.filter(a => a.status === "เช็คอินเรียบร้อย" || a.status === "กำลังรักษา").length;
  const pending  = myAppts.filter(a => a.status === "รอชำระเงิน").length;
  const done     = myAppts.filter(a => a.status === "เสร็จสิ้น").length;


  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>
          สวัสดีตอนเช้า {doctor ? `คุณหมอ${doctor.name}` : ''} 👩‍⚕️
        </h1>
        <p className="text-sm" style={{ color: "#4A6080" }}>{formattedDate} • เวลาทำการ 09:00–17:00 น.</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "คนไข้วันนี้",     val: myAppts.length,  icon: Users,        bg: "#E8F4FF", ic: "#1D6FA4" },
          { label: "รอรับการรักษา",   val: waiting,          icon: Clock,        bg: "#FFF3E0", ic: "#E65100" },
          { label: "รอชำระเงิน",      val: pending,         icon: CreditCard,   bg: "#FFFDE7", ic: "#B45309" },
          { label: "เสร็จสิ้นแล้ว",  val: done,             icon: CheckCircle,  bg: "#E8FFF0", ic: "#1B7A3E" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-white p-4" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: s.bg }}>
              <s.icon size={18} style={{ color: s.ic }} />
            </div>
            <div className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>{s.val}</div>
            <div className="text-xs mt-0.5" style={{ color: "#4A6080" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's queue */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color: "#1A365D" }}>คิวของฉันวันนี้</h2>
            <button onClick={() => setView("queue")} className="text-xs hover:opacity-70" style={{ color: "#FF8C9A" }}>ดูทั้งหมด →</button>
          </div>
          <div className="space-y-3">
            {myAppts.slice(0, 5).map(a => {
              const sc = STATUS_COLORS[a.status] ?? { bg: "#F0F4F8", text: "#4A6080" };
              return (
                <div key={a.id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(26,54,93,0.05)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
                      {a.time}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#1A365D" }}>{a.patientName}</p>
                      <p className="text-xs" style={{ color: "#4A6080" }}>{a.service}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(a.allergies !== "ไม่มี" || a.conditions !== "ไม่มี") && (
                      <AlertTriangle size={13} style={{ color: "#E65100" }} />
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: sc.bg, color: sc.text }}>{a.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's shift + alerts */}
        <div className="space-y-4">
          <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg,#1A365D,#2A507A)", boxShadow: "0 4px 20px rgba(26,54,93,0.2)" }}>
            <p className="text-xs font-medium mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>เวลาออกตรวจวันนี้</p>
            <p className="text-3xl font-bold text-white" style={{ fontFamily: "Playfair Display, serif" }}>09:00</p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>ถึง 17:00 น.</p>
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <p className="text-xs" style={{ color: "#FFB3BC" }}>ห้องตรวจ 2A</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <h3 className="font-semibold text-sm mb-3" style={{ color: "#1A365D" }}>แจ้งเตือนสำคัญ</h3>
            <div className="space-y-2.5">
              {myAppts.filter(a => a.allergies !== "ไม่มี" || a.conditions !== "ไม่มี").map(a => (
                <div key={a.id} className="flex items-start gap-2 p-2.5 rounded-lg" style={{ backgroundColor: "#FFF3E0" }}>
                  <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" style={{ color: "#E65100" }} />
                  <div>
                    <p className="text-xs font-medium" style={{ color: "#1A365D" }}>{a.patientName} ({a.time})</p>
                    {a.conditions !== "ไม่มี" && <p className="text-xs" style={{ color: "#E65100" }}>โรคประจำตัว: {a.conditions}</p>}
                    {a.allergies  !== "ไม่มี" && <p className="text-xs" style={{ color: "#E65100" }}>แพ้ยา: {a.allergies}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
