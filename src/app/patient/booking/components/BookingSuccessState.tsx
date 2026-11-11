import React from "react";
import { CheckCircle } from "lucide-react";
import { View } from "../../types";

interface BookingSuccessStateProps {
  serviceTitle: string;
  doctorName: string;
  selDay: number | null;
  selTime: string | null;
  endTimeStr: string;
  today: Date;
  isPending: boolean;
  isFollowUp?: boolean;
  setView: (v: View) => void;
  onReset: () => void;
}

export default function BookingSuccessState({
  serviceTitle,
  doctorName,
  selDay,
  selTime,
  endTimeStr,
  today,
  isPending,
  isFollowUp,
  setView,
  onReset,
}: BookingSuccessStateProps) {
  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{ backgroundColor: "#E8FFF0" }}
      >
        <CheckCircle size={36} style={{ color: "#22C55E" }} />
      </div>
      <h2 className="text-2xl font-bold mb-2 font-sans text-[#1A365D]">
        จองนัดหมายสำเร็จ
      </h2>
      <p className="text-sm mb-2 text-[#4A6080]">
        {serviceTitle} กับ {doctorName}
      </p>
      <p className="text-sm font-semibold mb-6 text-[#1A365D]">
        วันที่ {selDay}{" "}
        {today.toLocaleDateString("th-TH", {
          month: "long",
          year: "numeric",
        })}{" "}
        เวลา {selTime} - {endTimeStr} น.
      </p>

      {isPending && (
        <div className="max-w-md mx-auto mb-6 p-3 rounded-xl text-xs bg-amber-50 text-amber-800 border border-amber-200 text-left flex items-start gap-2">
          <span className="text-base leading-none">⚠️</span>
          <span>
            <strong>หมายเหตุความปลอดภัย:</strong>{" "}
            บันทึกประวัติสุขภาพของท่านเรียบร้อยแล้ว
            หากมีประวัติแพ้ยาหรือโรคประจำตัวที่ต้องเตรียมตัวเป็นพิเศษ
            เจ้าหน้าที่อาจโทรสอบถามเพิ่มเติมก่อนถึงวันนัดหมาย
          </span>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <button
          onClick={() => setView("appointments")}
          className="px-6 py-2.5 rounded-xl text-sm font-medium text-white shadow-md hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}
        >
          ดูรายการนัดหมาย
        </button>
        {!isFollowUp && (
          <button
            onClick={onReset}
            className="px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
            style={{
              border: "1.5px solid rgba(26,54,93,0.2)",
              color: "#1A365D",
            }}
          >
            จองอีกครั้ง
          </button>
        )}
      </div>
    </div>
  );
}

