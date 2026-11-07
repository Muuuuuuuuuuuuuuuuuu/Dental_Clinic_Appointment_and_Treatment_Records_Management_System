import React from "react";
import { X, History, Calendar, User, CreditCard, Stethoscope, Clock } from "lucide-react";
import { ToothStatus, ToothHistoryItem, getToothHistory } from "../utils/toothHistory";
import { SupernumeraryTooth, getExtraToothLocation } from "../ToothGeometry";
import { TOOTH_NAMES_TH } from "../constants/toothNames";

interface ToothInspectionModalProps {
  selectedTooth: string | null;
  onClose: () => void;
  toothData: Record<number | string, ToothStatus>;
  activeExtraTeeth: SupernumeraryTooth[];
  historyRecords: any[];
  readonly?: boolean;
  onStartTreatment?: (tooth: string) => void;
}

export default function ToothInspectionModal({
  selectedTooth,
  onClose,
  toothData,
  activeExtraTeeth,
  historyRecords,
  readonly = false,
  onStartTreatment,
}: ToothInspectionModalProps) {
  if (!selectedTooth) return null;

  const cleanKey = selectedTooth.replace('teeth-', '').trim();
  const isExtra = cleanKey === 'mesiodens' || cleanKey.endsWith('S') || cleanKey.includes('S-') || activeExtraTeeth.some(t => t.id === cleanKey);

  let toothDisplayNum = cleanKey;
  let toothName = "";
  let extraLocationDesc = "";

  if (isExtra) {
    toothDisplayNum = cleanKey === "mesiodens" ? "+11S" : (cleanKey.startsWith('+') ? cleanKey : `+${cleanKey}`);
    toothName = cleanKey === "mesiodens" 
      ? "ฟันเกินกึ่งกลางฟันหน้าบน (Mesiodens)" 
      : `ฟันเกิน / ฟันซ้อน (${toothDisplayNum})`;
    extraLocationDesc = getExtraToothLocation(cleanKey);
  } else {
    const num = parseInt(cleanKey, 10);
    toothName = TOOTH_NAMES_TH[num] || `ซี่ ${cleanKey}`;
  }

  const status = toothData[cleanKey] || "normal";
  let statusStr = isExtra ? "ตรวจพบฟันเกิน (ปกติ/ติดตาม)" : "ปกติ (Normal)";
  let colorStr = isExtra ? "#D97706" : "#10B981";
  let statusBg = isExtra ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-emerald-50 text-emerald-800 border-emerald-200";

  if (status === "red") {
    statusStr = "พบปัญหา / ต้องรักษา";
    colorStr = "#EF4444";
    statusBg = "bg-rose-50 text-rose-800 border-rose-200";
  } else if (status === "blue") {
    statusStr = "รักษาแล้ว (Treated)";
    colorStr = "#2563EB";
    statusBg = "bg-blue-50 text-blue-800 border-blue-200";
  } else if (status === "cross") {
    statusStr = "ถอน / ผ่าออกแล้ว (Extracted)";
    colorStr = "#64748B";
    statusBg = "bg-slate-100 text-slate-800 border-slate-300";
  }

  const toothHistory: ToothHistoryItem[] = getToothHistory(cleanKey, historyRecords);

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative border border-slate-200 flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* ส่วนหัว */}
        <div className="bg-gradient-to-r from-slate-900 to-[#1A365D] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base shadow-sm shrink-0 border"
              style={{ backgroundColor: colorStr + "25", color: "#FFFFFF", borderColor: colorStr }}
            >
              {toothDisplayNum}
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">{toothName}</h3>
              <p className="text-[11px] text-blue-200">มุมมองสถานะคนไข้ & ประวัติการรักษา</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ส่วนเนื้อหา */}
        <div className="p-4 space-y-3.5 overflow-y-auto flex-1">
          {/* ป้ายแสดงสถานะปัจจุบัน */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-semibold text-slate-600">สถานะปัจจุบัน:</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBg}`}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorStr }}></span>
              {statusStr}
            </span>
          </div>

          {extraLocationDesc && (
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <span className="font-bold block mb-0.5">ตำแหน่งฟันเกิน:</span>
              {extraLocationDesc}
            </div>
          )}

          {/* ประวัติการรักษา */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <History size={14} className="text-blue-600" />
                <span>ประวัติการรักษาของซี่นี้</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">
                {toothHistory.length > 0 ? `พบ ${toothHistory.length} รายการ` : "ไม่มีบันทึก"}
              </span>
            </div>

            {toothHistory.length > 0 ? (
              <div className="space-y-2">
                {toothHistory.map((h, idx) => (
                  <div 
                    key={h.id || idx}
                    className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1A365D] flex items-center gap-1.5">
                        <Calendar size={13} className="text-blue-500" />
                        {new Date(h.date).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-100 flex items-center gap-1">
                        <User size={10} />
                        {h.doctor}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1">
                      {h.services.map((srv, sIdx) => (
                        <span 
                          key={sIdx}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-100"
                        >
                          {srv}
                        </span>
                      ))}
                    </div>

                    {h.notes && (
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="font-semibold text-slate-500">บันทึก: </span>
                        {h.notes}
                      </div>
                    )}

                    {h.recommendations && (
                      <div className="text-[11px] text-amber-800 bg-amber-50/80 p-2 rounded-xl border border-amber-100">
                        <span className="font-semibold text-amber-700">คำแนะนำ: </span>
                        {h.recommendations}
                      </div>
                    )}

                    {(h.cashier || h.paymentMethod || h.cost) && (
                      <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-100 text-slate-600 mt-1">
                        <span className="flex items-center gap-1 font-medium">
                          <CreditCard size={12} className="text-emerald-600" />
                          <span>{h.paymentMethod ? `ชำระผ่าน ${h.paymentMethod}` : "ชำระเงินเรียบร้อย"}</span>
                          {h.cost && <strong className="text-slate-800 ml-1">฿{h.cost}</strong>}
                        </span>
                        {h.cashier && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            รับชำระโดย: <span className="text-slate-700 font-semibold">{h.cashier}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-4 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
                <Clock size={24} className="mx-auto text-slate-300 mb-1.5" />
                <p className="text-xs font-semibold text-slate-600">ยังไม่เคยมีบันทึกการทำหัตถการในซี่นี้</p>
                <p className="text-[11px] text-slate-400 mt-0.5">หากคนไข้เคยรับบริการ ระบบจะแสดงรายการหัตถการและบันทึกของแพทย์ที่นี่</p>
              </div>
            )}
          </div>
        </div>

        {/* ปุ่มดำเนินการส่วนท้าย */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium rounded-xl text-xs transition-colors shadow-2xs"
          >
            ปิด
          </button>

          {!readonly && onStartTreatment && (
            <button
              type="button"
              onClick={() => {
                onStartTreatment(cleanKey);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-[#FF8C9A] hover:bg-[#ff7a8a] text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
            >
              <Stethoscope size={14} />
              <span>ไปที่โหมดรักษาซี่นี้ ({toothDisplayNum})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

