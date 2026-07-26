import React, { useState, useEffect } from "react";
import { Search, Filter, History, FileText , Users } from "lucide-react";

import { Appointment, STATUS_COLORS } from "../../shared/data";
import { getAppointments } from "../../shared/supabaseApi";

export default function PatientRecords() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    getAppointments().then(setAppointments).catch(console.error).finally(() => setLoading(false));
  }, []);

  const results = appointments.filter(a =>
    a.patientName.includes(q) || a.hn.includes(q)
  );
  const unique = Array.from(new Map(results.map(a => [a.hn, a])).values());

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>เวชระเบียนคนไข้</h1>
        <p className="text-sm" style={{ color: "#4A6080" }}>ค้นหาข้อมูลและประวัติสุขภาพคนไข้</p>
      </div>
      <div className="max-w-md mb-6">
        <input value={q} onChange={e => setQ(e.target.value)}
          placeholder="ค้นหาด้วยชื่อหรือหมายเลข HN..."
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={{ backgroundColor: "white", border: "1.5px solid rgba(26,54,93,0.12)", color: "#1A365D", boxShadow: "0 2px 8px rgba(26,54,93,0.06)" }} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {unique.map(a => {
          const history = appointments.filter(x => x.hn === a.hn && ["เสร็จสิ้น","รอชำระเงิน","ชำระเงินแล้ว"].includes(x.status));
          return (
            <div key={a.hn} className="rounded-2xl bg-white p-5" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
                  {a.patientName[2] ?? "?"}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#1A365D" }}>{a.patientName}</p>
                  <p className="text-xs" style={{ color: "#4A6080" }}>{a.hn} • {a.patientPhone}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2 flex-wrap">
                  {a.conditions !== "ไม่มี" && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FFF3E0", color: "#E65100" }}>
                      โรคประจำตัว: {a.conditions}
                    </span>
                  )}
                  {a.allergies !== "ไม่มี" && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FEF2F2", color: "#B91C1C" }}>
                      แพ้: {a.allergies}
                    </span>
                  )}
                  {a.conditions === "ไม่มี" && a.allergies === "ไม่มี" && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#E8FFF0", color: "#1B7A3E" }}>ปกติ</span>
                  )}
                </div>
                {history.length > 0 && (
                  <div className="pt-2 mt-2" style={{ borderTop: "1px solid rgba(26,54,93,0.06)" }}>
                    <p className="text-xs font-medium mb-1.5" style={{ color: "#4A6080" }}>ประวัติการรักษา ({history.length} ครั้ง)</p>
                    {history.slice(0,2).map(h => (
                      <div key={h.id} className="flex justify-between text-xs py-1">
                        <span style={{ color: "#1A365D" }}>{h.service}</span>
                        <span style={{ color: "#4A6080" }}>{h.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {q && unique.length === 0 && (
          <div className="col-span-2 text-center py-12" style={{ color: "#4A6080" }}>
            <Users size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">ไม่พบข้อมูลคนไข้</p>
          </div>
        )}
      </div>
    </div>
  );
}
