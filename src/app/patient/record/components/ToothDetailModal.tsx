import React from "react";
import { X } from "lucide-react";
import { ToothStatus, getToothHistory } from "@/app/dentist/queue/odontogram/Odontogram";
import { SupernumeraryTooth, getExtraToothLocation } from "@/app/dentist/queue/odontogram/ToothGeometry";
import { getToothNameTh } from "../hooks/useDentalRecord";

interface ToothDetailModalProps {
  clickedTooth: string | null;
  onClose: () => void;
  mergedToothData: Record<number | string, ToothStatus>;
  extraTeeth: SupernumeraryTooth[];
  isChild: boolean;
  historyRecords: any[];
}

/**
 *  [MODAL COMPONENT] หน้าต่างแสดงรายละเอียดซี่ฟันเดี่ยว พร้อมประวัติการรักษาในซี่นั้น
 */
export default function ToothDetailModal({
  clickedTooth,
  onClose,
  mergedToothData,
  extraTeeth,
  isChild,
  historyRecords,
}: ToothDetailModalProps) {
  if (!clickedTooth) return null;

  const cleanKey = clickedTooth.replace("teeth-", "");
  const isExtra =
    cleanKey === "mesiodens" ||
    cleanKey.endsWith("S") ||
    cleanKey.includes("S-") ||
    extraTeeth.some((t) => t.id === cleanKey);

  let toothDisplayNum = cleanKey;
  let toothName = "";
  let extraLocationDesc = "";

  if (isExtra) {
    toothDisplayNum = cleanKey === "mesiodens" ? "+11S" : `+${cleanKey}`;
    toothName =
      cleanKey === "mesiodens"
        ? "ฟันเกินกึ่งกลางฟันหน้าบน (Mesiodens)"
        : `ฟันเกิน / ฟันซ้อน (+${cleanKey})`;
    extraLocationDesc = getExtraToothLocation(cleanKey);
  } else {
    toothName = getToothNameTh(cleanKey, isChild);
  }

  const status = mergedToothData[cleanKey] || "normal";
  let statusStr = isExtra ? "ตรวจพบฟันเกิน (ปกติ/ติดตามอาการ)" : "ปกติ (Normal)";
  let colorStr = isExtra ? "#D97706" : "#10B981";

  if (status === "red") {
    statusStr = "พบปัญหา / ต้องรักษา";
    colorStr = "#EF4444";
  } else if (status === "blue") {
    statusStr = "รักษาแล้ว";
    colorStr = "#3B82F6";
  } else if (status === "cross") {
    statusStr = "ถอน / ผ่าออกแล้ว";
    colorStr = "#64748B";
  }

  const toothHist = getToothHistory(cleanKey, historyRecords);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1A365D]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-[340px] p-6 shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 bg-gray-50 rounded-full transition-colors"
          title="ปิด"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6 mt-2">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center font-bold"
            style={{ backgroundColor: colorStr + "20", color: colorStr }}
          >
            <span className="text-xl font-display">{toothDisplayNum}</span>
          </div>
          <h3 className="text-base font-bold text-[#1A365D] mb-1">{toothName}</h3>
          {extraLocationDesc && (
            <p className="text-xs text-amber-800 bg-amber-50 rounded-lg p-2 mb-2 border border-amber-200 leading-relaxed text-left">
              {extraLocationDesc}
            </p>
          )}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mt-1"
            style={{
              color: colorStr,
              backgroundColor: colorStr + "10",
              borderColor: colorStr + "30",
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorStr }} />
            {statusStr}
          </div>
        </div>

        {/* ประวัติการรักษาเฉพาะซี่ฟันนี้ */}
        <div className="mb-4 text-left">
          <p className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
            <span>ประวัติการรักษาซี่นี้:</span>
            <span className="text-[10px] text-slate-400 font-normal">
              {toothHist.length > 0 ? `${toothHist.length} รายการ` : "ไม่มีบันทึก"}
            </span>
          </p>
          {toothHist.length > 0 ? (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {toothHist.map((h, i) => (
                <div
                  key={h.id || i}
                  className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1"
                >
                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">
                      {new Date(h.date).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span>{h.doctor}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {h.services.map((srv: string, sIdx: number) => (
                      <span
                        key={sIdx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100"
                      >
                        {srv}
                      </span>
                    ))}
                  </div>
                  {h.notes && (
                    <p className="text-[10px] text-slate-600 bg-white p-1.5 rounded-lg border border-slate-100">
                      {h.notes}
                    </p>
                  )}
                  {(h.cashier || h.paymentMethod || h.cost) && (
                    <div className="flex justify-between items-center text-[10px] text-emerald-800 bg-emerald-50/60 p-1.5 rounded-lg border border-emerald-100/80">
                      <span>
                        {h.paymentMethod
                          ? `ชำระผ่าน ${h.paymentMethod}`
                          : "ชำระแล้ว"}{" "}
                        {h.cost && (
                          <strong className="text-emerald-950 ml-1">฿{h.cost}</strong>
                        )}
                      </span>
                      {h.cashier && (
                        <span>
                          รับเงินโดย:{" "}
                          <strong className="text-emerald-950">${h.cashier}</strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
              ยังไม่มีประวัติการทำหัตถการในซี่นี้
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm"
        >
          ปิด
        </button>
      </div>
    </div>
  );
}

