import React, { useState, useEffect } from "react";
import { Calendar, FileText, CheckCircle, ChevronRight, X, Smile, Shield, Bell, Clock, CreditCard, UserCheck, ShieldCheck, Printer, CheckCheck, Download, QrCode, Stethoscope, Receipt, AlertCircle, Pill } from "lucide-react";

import { TreatmentRecord, PatientUser } from "../types";
import { getPatientTreatmentRecords } from "../../shared/supabaseApi";
import Odontogram from "../../dentist/treatment/Odontogram";

const thDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
};

const Section = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <div className="mb-4 sm:mb-5">
    <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
      {icon}
      <h3 className="font-bold text-sm" style={{ color: "#1A365D" }}>{title}</h3>
    </div>
    <div className="text-sm p-3.5 sm:p-4 rounded-2xl bg-slate-50 text-slate-700 leading-relaxed border border-slate-100/80 shadow-2xs">
      {children}
    </div>
  </div>
);

export default function HistoryView({ user }: { user: PatientUser }) {
  const [selected, setSelected] = useState<any | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"advice" | "receipt">("advice");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user.patientId) return;
    getPatientTreatmentRecords(user.patientId)
      .then(data => setHistory(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const getItemTotal = (h: any) => {
    if (h.cost !== null && h.cost !== undefined) {
      return parseInt(String(h.cost).replace(/,/g, "") || "0", 10);
    }
    const sCost = h.detailedServices?.reduce((s: number, svc: any) => s + (svc.price * (svc.qty || 1)), 0) || 0;
    const pCost = h.extraProducts?.reduce((s: number, prod: any) => s + (prod.price * (prod.qty || 1)), 0) || 0;
    return sCost + pCost;
  };
  
  const total = history.reduce((sum, h) => sum + getItemTotal(h), 0);

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
          <button key={h.id} onClick={() => { setSelected(h); setActiveModalTab("advice"); }} className="w-full text-left rounded-2xl bg-white p-5 transition-all hover:shadow-md active:scale-[0.99]"
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
                <div className="text-base font-bold" style={{ color: "#1A365D" }}>฿{getItemTotal(h).toLocaleString()}</div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#E8FFF0", color: "#1B7A3E" }}>เสร็จสิ้น</span>
                <span className="text-xs flex items-center gap-0.5" style={{ color: "#FF8C9A" }}>ดูรายละเอียด <ChevronRight size={10} /></span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Detail Modal: Tabbed View (Treatment & Advice vs Payment Slip) */}
      {selected && (() => {
        const netTotal = getItemTotal(selected);
        const refNo = "TR-" + String(selected.id).padStart(5, '0');
        const doctorName = selected.doctorName || selected.doctor || "ไม่ระบุแพทย์";
        const cashierName = selected.cashier || null;
        const payMethod = selected.paymentMethod || "เงินสด";
        const dateStr = selected.date ? thDate(selected.date) : "-";
        const timeStr = selected.time ? (selected.time + " น.") : "";

        // Function to download slip as high-res PNG image
        const handleDownloadSlipImage = () => {
          const canvas = document.createElement("canvas");
          const scale = 2; // Retina scale
          const width = 420;
          
          const itemsCount = (selected.detailedServices?.length || 1) + (selected.extraProducts?.length || 0);
          const estimatedHeight = 540 + (itemsCount * 28);

          canvas.width = width * scale;
          canvas.height = estimatedHeight * scale;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          ctx.scale(scale, scale);

          // 1. Background
          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.roundRect(0, 0, width, estimatedHeight, 24);
          ctx.fill();

          // Border
          ctx.strokeStyle = "#E2E8F0";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // 2. Header Top Bar
          ctx.fillStyle = "#1A365D";
          ctx.beginPath();
          ctx.roundRect(0, 0, width, 12, [24, 24, 0, 0]);
          ctx.fill();

          // Success Green Checkmark Circle
          ctx.fillStyle = "#10B981";
          ctx.beginPath();
          ctx.arc(width / 2, 54, 22, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 3.5;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(width / 2 - 9, 54);
          ctx.lineTo(width / 2 - 2, 61);
          ctx.lineTo(width / 2 + 9, 48);
          ctx.stroke();

          ctx.fillStyle = "#0F172A";
          ctx.font = "bold 17px system-ui, -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("ชำระเงินสำเร็จ", width / 2, 102);

          ctx.fillStyle = "#64748B";
          ctx.font = "12px system-ui, -apple-system, sans-serif";
          ctx.fillText(dateStr + " " + timeStr, width / 2, 122);

          // Amount Box
          ctx.fillStyle = "#F8FAFC";
          ctx.beginPath();
          ctx.roundRect(24, 138, width - 48, 72, 16);
          ctx.fill();
          ctx.strokeStyle = "#E2E8F0";
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = "#64748B";
          ctx.font = "11px system-ui, -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("จำนวนเงินที่ชำระ", width / 2, 160);

          ctx.fillStyle = "#1B7A3E";
          ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
          ctx.fillText("฿" + netTotal.toLocaleString() + ".00", width / 2, 194);

          // Info Rows
          let curY = 240;
          const drawRow = (label, val, valColor, isBold) => {
            ctx.fillStyle = "#64748B";
            ctx.font = "12px system-ui, -apple-system, sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(label, 32, curY);

            ctx.fillStyle = valColor || "#0F172A";
            ctx.font = (isBold ? "bold" : "normal") + " 12px system-ui, -apple-system, sans-serif";
            ctx.textAlign = "right";
            ctx.fillText(val, width - 32, curY);
            curY += 24;
          };

          drawRow("รหัสอ้างอิง", refNo, "#64748B", false);
          drawRow("สถานพยาบาล", "คลินิกทันตกรรมสุพัฒน์", "#1A365D", true);
          drawRow("แพทย์ผู้รักษา", doctorName, "#0F172A", true);
          if (cashierName) drawRow("ผู้รับชำระเงิน", cashierName, "#0F172A", true);
          drawRow("ช่องทางชำระ", "ชำระผ่าน " + payMethod, "#0F172A", true);

          curY += 4;
          ctx.strokeStyle = "#CBD5E1";
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(24, curY);
          ctx.lineTo(width - 24, curY);
          ctx.stroke();
          ctx.setLineDash([]);
          curY += 20;

          ctx.fillStyle = "#64748B";
          ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
          ctx.textAlign = "left";
          ctx.fillText("รายการบริการ / หัตถการ", 32, curY);
          ctx.textAlign = "right";
          ctx.fillText("ยอดเงิน", width - 32, curY);
          curY += 18;

          if (selected.detailedServices && selected.detailedServices.length > 0) {
            selected.detailedServices.forEach((s) => {
              const toothTxt = s.locationCode && s.locationCode !== 'NONE' && s.locationCode !== 'MOUTH' ? (" (ซี่ " + s.locationCode + ")") : "";
              const srvTxt = "• " + s.name + toothTxt;
              drawRow(srvTxt, "฿" + (s.price * (s.qty || 1)).toLocaleString(), "#0F172A", false);
            });
          } else {
            drawRow("• " + (selected.service || "ตรวจรักษาทันตกรรม"), "฿" + (selected.cost || 0).toLocaleString(), "#0F172A", false);
          }

          if (selected.extraProducts) {
            selected.extraProducts.forEach((p) => {
              drawRow("• " + p.name + " x" + p.qty, "฿" + (p.price * p.qty).toLocaleString(), "#0F172A", false);
            });
          }

          curY += 16;
          ctx.fillStyle = "#94A3B8";
          ctx.font = "9px system-ui, -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("e-Slip ออกโดยระบบคลินิกทันตกรรมสุพัฒน์ • ตรวจสอบย้อนหลังได้ 100%", width / 2, curY);

          const link = document.createElement("a");
          link.download = "dental-slip-" + refNo + ".png";
          link.href = canvas.toDataURL("image/png");
          link.click();
        };

        return (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 receipt-modal-overlay"
            onClick={() => setSelected(null)}
          >
            {/* Print Specific CSS: Hides background and formats ONLY the slip sheet */}
            <style>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #dental-receipt-slip, #dental-receipt-slip * {
                  visibility: visible !important;
                }
                #dental-receipt-slip {
                  position: absolute !important;
                  left: 50% !important;
                  top: 0 !important;
                  transform: translateX(-50%) !important;
                  width: 100% !important;
                  max-width: 420px !important;
                  margin: 0 !important;
                  padding: 24px !important;
                  box-shadow: none !important;
                  border: 1px solid #e2e8f0 !important;
                  background: #ffffff !important;
                  border-radius: 20px !important;
                  overflow: visible !important;
                }
                .receipt-no-print {
                  display: none !important;
                }
                .receipt-modal-overlay {
                  background: transparent !important;
                  backdrop-filter: none !important;
                  position: static !important;
                  padding: 0 !important;
                }
                @page {
                  margin: 10mm;
                  size: auto;
                }
              }
            `}</style>

            <div 
              className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 relative flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              {/* Header Bar with Tabs and Close Button (Hidden on Print) */}
              <div className="receipt-no-print bg-slate-50 border-b border-slate-200/80 px-4 pt-3 pb-2.5 flex items-center justify-between gap-2 shrink-0">
                {/* 2 Tabs: Treatment & Advice vs Payment Slip */}
                <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-xl border border-slate-300/60">
                  <button
                    type="button"
                    onClick={() => setActiveModalTab("advice")}
                    className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all " + (
                      activeModalTab === "advice"
                        ? "bg-white text-[#1A365D] shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <Stethoscope size={13} className="text-blue-600" />
                    <span>ผลการรักษา & คำแนะนำ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModalTab("receipt")}
                    className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all " + (
                      activeModalTab === "receipt"
                        ? "bg-white text-[#1A365D] shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <Receipt size={13} className="text-emerald-600" />
                    <span>สลิปใบเสร็จ</span>
                  </button>
                </div>

                <button 
                  onClick={() => setSelected(null)} 
                  className="w-7 h-7 rounded-full bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors shadow-2xs border border-slate-200"
                  title="ปิดหน้าต่าง"
                >
                  <X size={15} />
                </button>
              </div>

              {/* TAB 1: Clinical Notes & Doctor's Recommendations */}
              {activeModalTab === "advice" && (
                <div className="overflow-y-auto p-4 sm:p-5 space-y-4">
                  {/* Service Card Header */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/70 border border-blue-100 flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                        {dateStr}
                      </span>
                      <h3 className="font-extrabold text-base text-[#1A365D] mt-1.5 leading-tight">
                        {selected.service}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                        <span>แพทย์ผู้รักษา:</span>
                        <strong className="text-slate-800">{doctorName}</strong>
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                      เสร็จสิ้น
                    </span>
                  </div>

                  {/* 1. Doctor's Clinical Note (สิ่งที่แพทย์บันทึก) */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <FileText size={14} className="text-blue-600" />
                        <span>บันทึกการรักษาของแพทย์ (Clinical Note)</span>
                      </span>
                    </div>
                    {selected.notes ? (
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap pl-1 font-normal">
                        {selected.notes}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic pl-1">
                        ได้รับการตรวจและทำหัตถการตามมาตรฐานทางทันตกรรมเรียบร้อยแล้ว
                      </p>
                    )}
                  </div>

                  {/* 2. Doctor's Recommendations (คำแนะนำของแพทย์) */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-amber-200/50">
                      <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <AlertCircle size={14} className="text-amber-600" />
                        <span>คำแนะนำการดูแลหลังการรักษา (Post-Care Advice)</span>
                      </span>
                    </div>
                    {selected.recommendations ? (
                      <div className="text-xs text-amber-900 leading-relaxed whitespace-pre-wrap pl-1 font-normal">
                        {selected.recommendations}
                      </div>
                    ) : (
                      <div className="text-xs text-amber-900 leading-relaxed pl-1 space-y-1">
                        <p>• ดูแลรักษาความสะอาดช่องปากและแปรงฟันอย่างถูกวิธี</p>
                        <p>• หลีกเลี่ยงการเคี้ยวของแข็งหรือเหนียวจัดบริเวณที่ได้รับการรักษา</p>
                        <p>• หากมีอาการปวด บวม หรือมีอาการผิดปกติ สามารถติดต่อคลินิกเพื่อพบแพทย์ได้ทันที</p>
                      </div>
                    )}
                  </div>

                  {/* 3. Detailed Services & Teeth Location */}
                  {selected.detailedServices && selected.detailedServices.length > 0 && (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                      <span className="text-xs font-bold text-slate-800 block pb-1 border-b border-slate-100">
                        หัตถการและตำแหน่งซี่ฟันที่ทำการรักษา
                      </span>
                      <div className="divide-y divide-slate-100 text-xs">
                        {selected.detailedServices.map((s: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center py-1.5">
                            <span className="font-medium text-slate-700">
                              • {s.name} {s.qty > 1 ? ("(x" + s.qty + ")") : ""}
                            </span>
                            <span className="font-bold text-slate-800 text-[11px] px-2 py-0.5 rounded-md bg-slate-100">
                              {s.locationCode && s.locationCode !== 'NONE' && s.locationCode !== 'MOUTH' 
                                ? ("ซี่ " + s.locationCode) 
                                : "ทั้งช่องปาก"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Medicines / Products Prescribed */}
                  {selected.extraProducts && selected.extraProducts.length > 0 && (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                        <Pill size={14} className="text-emerald-600" />
                        <span>ยาและเวชภัณฑ์ที่ได้รับ</span>
                      </span>
                      <div className="divide-y divide-slate-100 text-xs">
                        {selected.extraProducts.map((p: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center py-1.5">
                            <span className="font-semibold text-slate-700">• {p.name}</span>
                            <span className="text-slate-500 text-[11px]">จำนวน {p.qty} ชิ้น</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button to switch to receipt */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveModalTab("receipt")}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
                    >
                      <Receipt size={14} className="text-emerald-600" />
                      <span>ดูสลิปใบเสร็จรับเงิน (฿{netTotal.toLocaleString()})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: Mobile Banking E-Slip (Payment Slip) */}
              {activeModalTab === "receipt" && (
                <div id="dental-receipt-slip" className="overflow-y-auto p-5 sm:p-6 space-y-3.5 bg-white">
                  
                  {/* Slip Header with Green Checkmark Icon */}
                  <div className="text-center pt-1 pb-1">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-2.5 shadow-md shadow-emerald-500/20">
                      <CheckCheck size={26} strokeWidth={2.5} />
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900 tracking-tight">ชำระเงินสำเร็จ</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {dateStr} {timeStr}
                    </p>
                  </div>

                  {/* Amount Highlight Box */}
                  <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/70 text-center">
                    <span className="text-[11px] font-medium text-slate-500 block mb-0.5">จำนวนเงินที่ชำระ</span>
                    <div className="text-2xl font-black tracking-tight" style={{ color: "#1B7A3E" }}>
                      ฿{netTotal.toLocaleString()}.00
                    </div>
                  </div>

                  {/* Perforation Dashed Line */}
                  <div className="border-t border-dashed border-slate-200 my-1"></div>

                  {/* Key Transaction Info (Left: Label, Right: Value) */}
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="flex items-center justify-between gap-3 py-1.5">
                      <span className="text-slate-400 font-medium shrink-0">รหัสอ้างอิง</span>
                      <span className="font-semibold text-slate-600 text-right font-mono text-[11px]">#{refNo}</span>
                    </div>

                    <div className="flex items-center justify-between gap-3 py-1.5">
                      <span className="text-slate-400 font-medium shrink-0">สถานพยาบาล</span>
                      <span className="font-bold text-[#1A365D] text-right">คลินิกทันตกรรมสุพัฒน์</span>
                    </div>

                    <div className="flex items-center justify-between gap-3 py-1.5">
                      <span className="text-slate-400 font-medium shrink-0">แพทย์ผู้รักษา</span>
                      <span className="font-bold text-slate-800 text-right truncate">{doctorName}</span>
                    </div>

                    {cashierName && (
                      <div className="flex items-center justify-between gap-3 py-1.5">
                        <span className="text-slate-400 font-medium shrink-0">ผู้รับชำระเงิน</span>
                        <span className="font-bold text-emerald-800 text-right truncate">{cashierName}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3 py-1.5">
                      <span className="text-slate-400 font-medium shrink-0">ช่องทางชำระ</span>
                      <span className="font-semibold text-slate-800 text-right">ชำระผ่าน {payMethod}</span>
                    </div>
                  </div>

                  {/* Perforation Dashed Line */}
                  <div className="border-t border-dashed border-slate-200 my-1"></div>

                  {/* Itemized Services Breakdown */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1">
                      <span>รายการหัตถการ / บริการ</span>
                      <span>ยอดเงิน</span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {selected.detailedServices && selected.detailedServices.length > 0 ? (
                        selected.detailedServices.map((s: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-start gap-2 text-slate-700">
                            <div className="pr-2 leading-tight">
                              <span className="font-semibold text-slate-800 block text-[11px]">• {s.name}</span>
                              {s.locationCode && s.locationCode !== 'NONE' && s.locationCode !== 'MOUTH' && (
                                <span className="text-[10px] text-slate-400 pl-2">ซี่ฟัน: {s.locationCode}</span>
                              )}
                            </div>
                            <span className="font-bold text-slate-800 shrink-0 text-xs">
                              ฿{(s.price * (s.qty || 1)).toLocaleString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="flex justify-between items-start gap-2 text-slate-700">
                          <span className="font-semibold text-slate-800 text-xs">• {selected.service || "ตรวจรักษาทันตกรรม"}</span>
                          <span className="font-bold text-slate-800 shrink-0 text-xs">฿{(selected.cost || 0).toLocaleString()}</span>
                        </div>
                      )}

                      {selected.extraProducts && selected.extraProducts.map((p: any, idx: number) => (
                        <div key={"prod-" + idx} className="flex justify-between items-start gap-2 text-slate-700 pt-1 border-t border-slate-50">
                          <span className="font-semibold text-slate-800 text-[11px]">• {p.name} x{p.qty}</span>
                          <span className="font-bold text-slate-800 shrink-0 text-xs">฿{(p.price * p.qty).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Notice */}
                  <div className="pt-2 text-center">
                    <p className="text-[9px] text-slate-400">
                      e-Slip ออกโดยระบบคลินิกทันตกรรมสุพัฒน์ • ตรวจสอบย้อนหลังได้ 100%
                    </p>
                  </div>

                </div>
              )}

              {/* Bottom Actions (Hidden on Print) */}
              <div className="receipt-no-print p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                <button 
                  onClick={() => setSelected(null)} 
                  className="flex-1 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200 transition-colors shadow-2xs"
                >
                  ปิด
                </button>
                {activeModalTab === "receipt" ? (
                  <>
                    <button 
                      onClick={handleDownloadSlipImage} 
                      className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs"
                      title="บันทึกสลิปเป็นรูปภาพ PNG สไตล์สลิปโอนเงิน"
                    >
                      <Download size={14} />
                      <span>บันทึกสลิป</span>
                    </button>
                    <button 
                      onClick={() => window.print()} 
                      className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-[#1A365D] hover:bg-[#2A507A] text-white font-semibold rounded-xl text-xs transition-colors shadow-xs"
                      title="พิมพ์สลิปการรักษา"
                    >
                      <Printer size={14} />
                      <span>พิมพ์</span>
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setActiveModalTab("receipt")} 
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#1A365D] hover:bg-[#2A507A] text-white font-semibold rounded-xl text-xs transition-colors shadow-xs"
                  >
                    <Receipt size={14} />
                    <span>ดูสลิปการเงิน</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
