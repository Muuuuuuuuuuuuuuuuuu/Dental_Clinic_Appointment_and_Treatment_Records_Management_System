import React, { useState, useEffect } from "react";
import { Calendar, FileText, CheckCircle, ChevronRight, X, Smile, Shield, Bell, Clock } from "lucide-react";

import { TreatmentRecord, PatientUser } from "../types";
import { getPatientTreatmentRecords } from "../../shared/supabaseApi";
import Odontogram from "../../dentist/treatment/Odontogram";

const thDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
};

const Section = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h3 className="font-semibold text-sm" style={{ color: "#1A365D" }}>{title}</h3>
    </div>
    <div className="text-sm p-4 rounded-xl bg-gray-50 text-gray-700 leading-relaxed">
      {children}
    </div>
  </div>
);

export default function HistoryView({ user }: { user: PatientUser }) {
  const [selected, setSelected] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user.patientId) return;
    getPatientTreatmentRecords(user.patientId)
      .then(data => setHistory(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const total = history.reduce((sum, h) => sum + parseInt(String(h.cost).replace(/,/g, "") || "0", 10), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>ประวัติการรักษา</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>บันทึกการเข้ารับบริการทั้งหมดของคุณ</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#FF8C9A" }}>
            ฿{total.toLocaleString()}
          </div>
          <div className="text-xs" style={{ color: "#4A6080" }}>ค่าใช้จ่ายรวม</div>
        </div>
      </div>

      <div className="space-y-3">
        {history.map(h => (
          <button key={h.id} onClick={() => setSelected(h)} className="w-full text-left rounded-2xl bg-white p-5 transition-all hover:shadow-md active:scale-[0.99]"
            style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#E8FFF0" }}>
                  <CheckCircle size={18} style={{ color: "#22C55E" }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#1A365D" }}>{h.service}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#4A6080" }}>{h.doctorName || (h as any).doctor}</p>
                  <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "#4A6080" }}>
                    <Clock size={10} /> {h.date && thDate(h.date)} เวลา {h.time} น.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <div className="text-base font-bold" style={{ color: "#1A365D" }}>฿{h.cost}</div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#E8FFF0", color: "#1B7A3E" }}>เสร็จสิ้น</span>
                <span className="text-xs flex items-center gap-0.5" style={{ color: "#FF8C9A" }}>ดูรายละเอียด <ChevronRight size={10} /></span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ backgroundColor: "rgba(26,54,93,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-3xl bg-white overflow-hidden"
            style={{ boxShadow: "0 24px 80px rgba(26,54,93,0.2)", maxHeight: "90vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 pb-4" style={{ background: "linear-gradient(135deg,#1A365D,#2A507A)" }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>บันทึกการรักษา</p>
                  <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Playfair Display, serif" }}>{selected.service}</h2>
                  <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>{selected.doctorName || (selected as any).doctor}</p>
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                    <Clock size={11} /> {selected.date ? thDate(selected.date) : "ยังไม่ระบุวันที่"} {selected.time && `เวลา ${selected.time} น.`}
                  </p>
                </div>
                <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                  <X size={16} color="white" />
                </button>
              </div>
              <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "#E8FFF0", color: "#1B7A3E" }}>เสร็จสิ้น</span>
                <span className="text-xl font-bold text-white" style={{ fontFamily: "Playfair Display, serif" }}>฿{selected.cost}</span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Detailed Services */}
              {selected.detailedServices && selected.detailedServices.length > 0 && (
                <Section icon={<Smile size={16} style={{ color: "#FF8C9A" }} />} title="บริการที่ได้รับ">
                  <ul className="list-disc list-inside text-sm leading-relaxed" style={{ color: "#1A365D" }}>
                    {selected.detailedServices.map((ds: any, idx: number) => (
                      <li key={idx}>
                        {ds.name} {ds.locationCode && ds.locationCode !== 'NONE' && ds.locationCode !== 'MOUTH' ? `(ซี่ที่: ${ds.locationCode})` : ''}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Doctor notes */}
              {selected.notes && (
                <Section icon={<FileText size={16} style={{ color: "#FF8C9A" }} />} title="บันทึกของทันตแพทย์">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#1A365D" }}>{selected.notes}</p>
                </Section>
              )}

              {/* Recommendations */}
              {selected.recommendations && (
                <Section icon={<Bell size={16} style={{ color: "#FF8C9A" }} />} title="คำแนะนำหลังการรักษา">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#1A365D" }}>{selected.recommendations}</p>
                </Section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
