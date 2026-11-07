import React from "react";
import { CheckCircle, Clock, ChevronRight } from "lucide-react";
import { thDate } from "../hooks/usePatientHistory";

interface HistoryCardProps {
  record: any;
  itemTotal: number;
  onSelect: () => void;
}

/**
 * 📋 [HISTORY COMPONENT] การ์ดแสดงรายการประวัติการรักษาแต่ละครั้ง
 */
export default function HistoryCard({
  record: h,
  itemTotal,
  onSelect,
}: HistoryCardProps) {
  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-2xl bg-white p-5 transition-all hover:shadow-md active:scale-[0.99]"
      style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#E8FFF0" }}
          >
            <CheckCircle size={18} style={{ color: "#22C55E" }} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "#1A365D" }}>
              {h.service}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#4A6080" }}>
              {h.doctorName || (h as any).doctor}
            </p>
            <p
              className="text-xs mt-0.5 flex items-center gap-1"
              style={{ color: "#4A6080" }}
            >
              <Clock size={10} /> {h.date && thDate(h.date)} เวลา {h.time} น.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div
            className="text-base font-bold"
            style={{ color: "#1A365D" }}
          >
            ฿{itemTotal.toLocaleString()}
          </div>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "#E8FFF0", color: "#1B7A3E" }}
          >
            เสร็จสิ้น
          </span>
          <span
            className="text-xs flex items-center gap-0.5"
            style={{ color: "#FF8C9A" }}
          >
            ดูรายละเอียด <ChevronRight size={10} />
          </span>
        </div>
      </div>
    </button>
  );
}

