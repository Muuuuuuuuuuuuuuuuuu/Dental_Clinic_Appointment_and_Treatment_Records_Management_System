import React from "react";
import { X, Stethoscope, Receipt } from "lucide-react";
import TreatmentAdviceTab from "./TreatmentAdviceTab";
import ReceiptSlipTab from "./ReceiptSlipTab";
import { thDate } from "../hooks/usePatientHistory";

interface TreatmentDetailModalProps {
  selected: any | null;
  onClose: () => void;
  activeModalTab: "advice" | "receipt";
  setActiveModalTab: (tab: "advice" | "receipt") => void;
  netTotal: number;
}

/**
 * 🧾 [MODAL COMPONENT] หน้าต่างรายละเอียดการรักษา และสลิปใบเสร็จรับเงิน
 */
export default function TreatmentDetailModal({
  selected,
  onClose,
  activeModalTab,
  setActiveModalTab,
  netTotal,
}: TreatmentDetailModalProps) {
  if (!selected) return null;

  const refNo = "TR-" + String(selected.id).padStart(5, "0");
  const doctorName = selected.doctorName || selected.doctor || "ไม่ระบุแพทย์";
  const cashierName = selected.cashier || null;
  const payMethod = selected.paymentMethod || "เงินสด";
  const dateStr = selected.date ? thDate(selected.date) : "-";
  const timeStr = selected.time ? selected.time + " น." : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 receipt-modal-overlay"
      onClick={onClose}
    >
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
        onClick={(e) => e.stopPropagation()}
      >
        {/* แถบส่วนหัวสลับแท็บและปุ่มปิด */}
        <div className="receipt-no-print bg-slate-50 border-b border-slate-200/80 px-4 pt-3 pb-2.5 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-xl border border-slate-300/60">
            <button
              type="button"
              onClick={() => setActiveModalTab("advice")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeModalTab === "advice"
                ? "bg-white text-[#1A365D] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <span>ผลการรักษา & คำแนะนำ</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveModalTab("receipt")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeModalTab === "receipt"
                ? "bg-white text-[#1A365D] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <span>สลิปใบเสร็จ</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors shadow-2xs border border-slate-200"
            title="ปิดหน้าต่าง"
          >
            <X size={15} />
          </button>
        </div>

        {activeModalTab === "advice" && (
          <TreatmentAdviceTab
            selected={selected}
            dateStr={dateStr}
            doctorName={doctorName}
            netTotal={netTotal}
            onSwitchToReceipt={() => setActiveModalTab("receipt")}
          />
        )}

        {activeModalTab === "receipt" && (
          <ReceiptSlipTab
            selected={selected}
            refNo={refNo}
            doctorName={doctorName}
            cashierName={cashierName}
            payMethod={payMethod}
            dateStr={dateStr}
            timeStr={timeStr}
            netTotal={netTotal}
          />
        )}
      </div>
    </div>
  );
}

