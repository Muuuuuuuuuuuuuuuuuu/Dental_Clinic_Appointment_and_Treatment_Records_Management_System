import React, { useState, useEffect } from "react";
import { UserCheck, Clock, Users, CreditCard, AlertTriangle, ArrowRight } from "lucide-react";
import { Appointment, STATUS_COLORS } from "../../shared/data";
import { getAppointments, updateAppointmentStatus } from "../../shared/supabaseApi";

const fmtDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function CheckInView() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAppointments().then(setAppointments).catch(console.error).finally(() => setLoading(false));
  }, []);

  const onUpdate = async (id: number, s: Partial<Appointment>) => {
    try {
      if (s.status) {
        const updated = await updateAppointmentStatus(id, s.status);
        setAppointments(apps => apps.map(a => a.id === id ? { ...a, status: updated.status } : a));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const todayStr = fmtDate(new Date());

  // Real-time statuses for today
  const todayApps = appointments
    .filter(a => a.date === todayStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  const toCheckIn = todayApps.filter(a => a.status === "ยืนยันการจอง");
  const inQueue = todayApps.filter(a => a.status === "เช็คอินเรียบร้อย" || a.status === "กำลังรักษา");
  const toPay = todayApps.filter(a => a.status === "รอชำระเงิน");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>จัดการคิวงาน (เช็คอิน)</h1>
        <p className="text-sm" style={{ color: "#4A6080" }}>
          อัปเดตสถานะคนไข้ที่มาถึงคลินิก และติดตามคิวแบบ Real-time ประจำวันนี้
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: To Check-in */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
              <UserCheck size={16} />
            </div>
            <h2 className="font-bold text-lg" style={{ color: "#1A365D" }}>รอเช็คอิน ({toCheckIn.length})</h2>
          </div>

          {toCheckIn.length === 0 ? (
            <div className="text-center py-10 rounded-2xl bg-white border border-dashed border-gray-200">
              <p className="text-sm font-medium" style={{ color: "#94A3B8" }}>ไม่มีคนไข้รอเช็คอิน</p>
            </div>
          ) : (
            toCheckIn.map(a => (
              <div key={a.id} className="rounded-2xl bg-white p-4 shadow-sm border border-blue-50 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold" style={{ color: "#1D6FA4" }}>{a.time} น.</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#E8F4FF", color: "#1D6FA4" }}>ยืนยันแล้ว</span>
                </div>
                <p className="font-bold mb-1" style={{ color: "#1A365D" }}>{a.patientName}</p>
                <p className="text-xs mb-3" style={{ color: "#4A6080" }}>{a.service} • ทพ. {a.doctorName}</p>

                {(a.conditions !== "ไม่มี" || a.allergies !== "ไม่มี") && (
                  <div className="flex items-center gap-1 mb-3 bg-orange-50 p-1.5 rounded-lg">
                    <AlertTriangle size={11} style={{ color: "#E65100" }} />
                    <span className="text-[10px] font-medium" style={{ color: "#E65100" }}>
                      {a.conditions !== "ไม่มี" && a.conditions}
                      {a.conditions !== "ไม่มี" && a.allergies !== "ไม่มี" && " • "}
                      {a.allergies !== "ไม่มี" && `แพ้: ${a.allergies}`}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => onUpdate(a.id, { status: "เช็คอินเรียบร้อย" })}
                  className="w-full flex justify-center items-center gap-2 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:bg-blue-600"
                  style={{ backgroundColor: "#3B82F6" }}>
                  <UserCheck size={16} /> เช็คอินมาถึงแล้ว
                </button>
              </div>
            ))
          )}
        </div>

        {/* Column 2: In Queue / Treating */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-100 text-orange-600">
              <Clock size={16} />
            </div>
            <h2 className="font-bold text-lg" style={{ color: "#1A365D" }}>เช็คอินแล้ว / ระหว่างรักษา ({inQueue.length})</h2>
          </div>

          {inQueue.length === 0 ? (
            <div className="text-center py-10 rounded-2xl bg-white border border-dashed border-gray-200">
              <p className="text-sm font-medium" style={{ color: "#94A3B8" }}>ไม่มีคิวในห้องตรวจ</p>
            </div>
          ) : (
            inQueue.map(a => {
              const colorObj = STATUS_COLORS[a.status] || { bg: "#F3E8FF", text: "#6B21A8", dot: "#9333EA" };

              return (
                <div key={a.id} className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: colorObj.dot }}></div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold" style={{ color: "#1A365D" }}>{a.time} น.</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{ backgroundColor: colorObj.bg, color: colorObj.text }}>
                    {a.status}

                    </span>
                  </div>
                  <p className="font-bold mb-1" style={{ color: "#1A365D" }}>{a.patientName}</p>
                  <p className="text-xs mb-3" style={{ color: "#4A6080" }}>ห้องตรวจ: ทพ. {a.doctorName}</p>

                  {(a.conditions?.includes("Walk-in") || a.allergies?.includes("Walk-in")) && (
                    <div className="flex items-center gap-1 mb-2 bg-red-50 p-1.5 rounded-lg border border-red-100">
                      <AlertTriangle size={11} className="text-red-600" />
                      <span className="text-[10px] font-bold text-red-600">
                        ⚠️ ประวัติยังไม่สมบูรณ์ (Walk-in) กรุณาให้คนไข้กรอกประวัติเพิ่มเติม
                      </span>
                    </div>
                  )}
                  
                  {a.status === "เช็คอินเรียบร้อย" && (
                    <button
                      onClick={() => onUpdate(a.id, { status: "กำลังรักษา" })}
                      className="w-full mt-2 flex justify-center items-center gap-2 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                      style={{ backgroundColor: "#A21CAF" }}>
                      เรียกเข้าห้องตรวจ
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Column 3: To Pay */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100 text-green-600">
              <CreditCard size={16} />
            </div>
            <h2 className="font-bold text-lg" style={{ color: "#1A365D" }}>รอชำระเงิน ({toPay.length})</h2>
          </div>

          {toPay.length === 0 ? (
            <div className="text-center py-10 rounded-2xl bg-white border border-dashed border-gray-200">
              <p className="text-sm font-medium" style={{ color: "#94A3B8" }}>ไม่มีคิวรอชำระเงิน</p>
            </div>
          ) : (
            toPay.map(a => (
              <div key={a.id} className="rounded-2xl bg-white p-4 shadow-sm border border-green-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold" style={{ color: "#1A365D" }}>{a.time} น.</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FFFDE7", color: "#B45309" }}>{a.status}</span>
                </div>
                <p className="font-bold mb-1" style={{ color: "#1A365D" }}>{a.patientName}</p>

                {/* Normally we'd fetch cost from treatment_record, mock it here */}
                <div className="mt-3 bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                  <p className="text-xs text-gray-500 mb-0.5">ยอดประเมินเบื้องต้น</p>
                  <p className="text-lg font-bold text-green-600">฿{a.cost?.toLocaleString() || "1,200"}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
