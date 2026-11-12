import React from "react";
import { History, RotateCcw } from "lucide-react";
import { ToothStatus } from "./Odontogram";
import { SupernumeraryTooth } from "./ToothGeometry";

interface PatientTimelineAccordionProps {
  isOpen: boolean;
  onClose: () => void;
  historyRecords: any[];
  onSelectHistoricalTeeth?: (
    teeth: Record<string, ToothStatus>,
    extras: SupernumeraryTooth[],
    date: string,
    rec?: string,
    recordId?: number
  ) => void;
  activeRecordId?: number | null;
  onResetToLatest?: () => void;
}

export default function PatientTimelineAccordion({
  isOpen,
  onClose,
  historyRecords,
  onSelectHistoricalTeeth,
  activeRecordId,
  onResetToLatest,
}: PatientTimelineAccordionProps) {
  if (!isOpen || !historyRecords || historyRecords.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in duration-200">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <History size={15} className="text-blue-600" />
          <span>ประวัติการรักษาทั้งหมด ({historyRecords.length} ครั้ง)</span>
        </h4>
        <div className="flex items-center gap-2">
          {activeRecordId !== null && onResetToLatest && (
            <button
              type="button"
              onClick={onResetToLatest}
              className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold border border-blue-200 transition-colors"
              title="กลับไปแสดงแผนผังฟันล่าสุด"
            >
              <RotateCcw size={12} />
              <span>แผนผังล่าสุด</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 font-semibold px-1"
          >
            ปิด
          </button>
        </div>
      </div>

      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {historyRecords.map((rec) => {
          const isActive = activeRecordId === rec.id;
          return (
            <div
              key={rec.id}
              className={`p-3 bg-white rounded-xl border transition-all space-y-1.5 ${
                isActive
                  ? "border-[#FF8C9A] ring-2 ring-[#FF8C9A]/20 bg-[#FFFDFE] shadow-sm"
                  : "border-slate-200/80 shadow-2xs hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#1A365D]">
                  {new Date(rec.date).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                  {rec.doctor}
                </span>
              </div>
              {rec.treatmentServices && rec.treatmentServices.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {rec.treatmentServices.map((s: string) => (
                    <span
                      key={s}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-700">{rec.service}</p>
              )}
              {rec.notes && (
                <p className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100 mt-1">
                  {rec.notes}
                </p>
              )}
              {(rec.cashier || rec.paymentMethod || rec.cost) && (
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100 mt-1">
                  <span>
                    {rec.paymentMethod ? `ชำระ: ${rec.paymentMethod}` : "ชำระแล้ว"}{" "}
                    {rec.cost && <b className="text-slate-700">฿{rec.cost}</b>}
                  </span>
                  {rec.cashier && (
                    <span>
                      ผู้รับเงิน: <b className="text-slate-700">{rec.cashier}</b>
                    </span>
                  )}
                </div>
              )}

              {/* ปุ่มดูแผนผังฟันของวันนี้ */}
              {onSelectHistoricalTeeth && (
                <button
                  type="button"
                  onClick={() => {
                    const raw = rec.odontogramData || {};
                    const { extraTeeth: histExtras = [], wholeMouth: _wm, ...histTeeth } = raw;
                    const teethResult: Record<string, ToothStatus> = { ...histTeeth };

                    if (rec.detailedServices) {
                      rec.detailedServices.forEach((ds: any) => {
                        const loc = ds.locationCode
                          ? String(ds.locationCode).replace("teeth-", "")
                          : null;
                        if (!loc || loc === "MOUTH") return;
                        if (ds.name?.includes("ถอนฟัน") || ds.name?.includes("ผ่าฟันคุด")) {
                          teethResult[loc] = "cross";
                        } else if (ds.name?.includes("อุดฟัน") || ds.name?.includes("รักษา")) {
                          if (!teethResult[loc]) teethResult[loc] = "blue";
                        }
                      });
                    }

                    onSelectHistoricalTeeth(
                      teethResult,
                      Array.isArray(histExtras) ? histExtras : [],
                      rec.date,
                      rec.recommendations || "ดูแลรักษาความสะอาดตามปกติ",
                      rec.id
                    );
                  }}
                  className={`w-full mt-2 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    isActive
                      ? "bg-[#1B7A3E] text-white ring-2 ring-[#1B7A3E]/30 shadow-xs"
                      : "bg-[#FFD6DC] text-[#E0314C] hover:bg-[#ff7a8a] hover:text-white"
                  }`}
                >
                  {isActive ? (
                    <>
                      <span>✓</span>
                      <span>กำลังแสดงแผนผังฟันของวันนี้</span>
                    </>
                  ) : (
                    <span>ดูแผนผังฟันของวันนี้</span>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

