import React from "react";
import { LeaveRequest } from "@/app/shared/data";

interface LeaveSummaryCardProps {
  leaves: LeaveRequest[];
}

/**
 * 📊 [CONTENT COMPONENT] สรุปการลางานในปีนี้ (ขนาดกะทัดรัด แนวนอน 3 สถานะ)
 */
export default function LeaveSummaryCard({ leaves }: LeaveSummaryCardProps) {
  const pending = leaves.filter((l) => l.status === "รออนุมัติ").length;
  const approved = leaves.filter((l) => l.status === "อนุมัติแล้ว").length;
  const rejected = leaves.filter((l) => l.status === "ไม่อนุมัติ").length;

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 p-3.5 h-full flex flex-col justify-between"
      style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        
        <div>
          <h2 className="text-sm font-semibold text-gray-800 leading-tight">สรุปการลางาน (ปีนี้)</h2>
          <p className="text-[11px] text-gray-400">สถานะคำขอลางานของคุณ</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-1.5 text-center">
          <div className="text-[11px] font-medium text-amber-800">รออนุมัติ</div>
          <div className="text-base font-bold text-amber-700 mt-0.5">{pending}</div>
        </div>
        <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-1.5 text-center">
          <div className="text-[11px] font-medium text-emerald-800">อนุมัติแล้ว</div>
          <div className="text-base font-bold text-emerald-700 mt-0.5">{approved}</div>
        </div>
        <div className="bg-rose-50/70 border border-rose-200/60 rounded-xl p-1.5 text-center">
          <div className="text-[11px] font-medium text-rose-800">ไม่อนุมัติ</div>
          <div className="text-base font-bold text-rose-700 mt-0.5">{rejected}</div>
        </div>
      </div>
    </div>
  );
}
