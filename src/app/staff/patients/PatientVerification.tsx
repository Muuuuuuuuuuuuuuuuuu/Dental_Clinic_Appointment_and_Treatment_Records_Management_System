import React, { useState, useEffect } from "react";
import { Search, CheckCircle, FileText , Users, Calendar } from "lucide-react";

import { Appointment, STATUS_COLORS, TreatmentPlan } from "../../shared/data";
import { getAppointments, getTreatmentPlans } from "../../shared/supabaseApi";

export default function PatientVerification() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    Promise.all([
      getAppointments(),
      getTreatmentPlans()
    ])
    .then(([appts, plans]) => {
      setAppointments(appts);
      setTreatmentPlans(plans);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

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
          const todayAppt = apptHistory.find(x => x.date === "2025-07-10");
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
                <div className="p-3 rounded-xl" style={{ backgroundColor: a.conditions !== "ไม่มี" ? "#FFF3E0" : "#F8F9FA" }}>
                  <p className="text-xs font-medium mb-1" style={{ color: "#4A6080" }}>โรคประจำตัว</p>
                  <p className="text-sm" style={{ color: a.conditions !== "ไม่มี" ? "#E65100" : "#1A365D" }}>{a.conditions}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: a.allergies !== "ไม่มี" ? "#FEF2F2" : "#F8F9FA" }}>
                  <p className="text-xs font-medium mb-1" style={{ color: "#4A6080" }}>ประวัติแพ้ยา</p>
                  <p className="text-sm" style={{ color: a.allergies !== "ไม่มี" ? "#B91C1C" : "#1A365D" }}>{a.allergies}</p>
                </div>
              </div>

              {todayAppt && (
                <div className="p-3 rounded-xl flex items-center gap-3 mb-4" style={{ backgroundColor: "#E8F4FF" }}>
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

              {/* Treatment Plans Display */}
              {(() => {
                const plans = treatmentPlans.filter(p => p.hn === a.hn);
                if (plans.length === 0) return null;
                return (
                  <div className="border-t pt-4 mt-2" style={{ borderColor: "rgba(26,54,93,0.06)" }}>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "#1A365D" }}>
                      <FileText size={16} style={{ color: "#4A6080" }} />
                      แผนการรักษาระยะยาว (Treatment Plans)
                    </h4>
                    <div className="space-y-3">
                      {plans.map(plan => {
                        const progress = plan.totalCost > 0 ? (plan.paidAmount / plan.totalCost) * 100 : 0;
                        const nextInstallment = plan.installments?.find(inst => !inst.paid);
                        return (
                          <div key={plan.id} className="p-3 rounded-xl border" style={{ borderColor: "rgba(26,54,93,0.08)", backgroundColor: "#FAFAFA" }}>
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-sm font-medium" style={{ color: "#1A365D" }}>{plan.name}</p>
                              <p className="text-xs font-semibold" style={{ color: "#1B7A3E" }}>ชำระแล้ว {progress.toFixed(0)}%</p>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <p style={{ color: "#4A6080" }}>ยอดทั้งหมด</p>
                                <p className="font-medium" style={{ color: "#1A365D" }}>฿{Number(plan.totalCost).toLocaleString()}</p>
                              </div>
                              <div>
                                <p style={{ color: "#4A6080" }}>ยอดคงเหลือ</p>
                                <p className="font-medium" style={{ color: "#1A365D" }}>฿{Math.max(0, Number(plan.totalCost) - Number(plan.paidAmount)).toLocaleString()}</p>
                              </div>
                            </div>
                            {nextInstallment && (
                              <div className="mt-3 pt-3 border-t flex justify-between items-center" style={{ borderColor: "rgba(26,54,93,0.06)" }}>
                                <span className="text-xs text-orange-600 font-medium">งวดถัดไป: {nextInstallment.dueDate}</span>
                                <span className="text-xs font-semibold" style={{ color: "#1A365D" }}>฿{Number(nextInstallment.amount).toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
