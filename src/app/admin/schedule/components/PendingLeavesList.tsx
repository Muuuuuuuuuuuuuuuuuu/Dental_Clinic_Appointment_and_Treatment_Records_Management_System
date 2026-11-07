import React from "react";
import { Check, X } from "lucide-react";
import { LeaveRequest } from "@/app/shared/data";

interface PendingLeavesListProps {
  leaves: LeaveRequest[];
  onAction: (id: number, status: string) => Promise<void>;
  updatingId: number | null;
}

export default function PendingLeavesList({
  leaves,
  onAction,
  updatingId,
}: PendingLeavesListProps) {
  if (leaves.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 text-xs">
        ไม่มีคำขอลางานที่รออนุมัติในขณะนี้
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {leaves.map((l) => (
        <div
          key={l.id}
          className="rounded-xl bg-white p-2.5 border border-l-4 border-l-amber-500 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between gap-2"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                style={{ backgroundColor: "#FF8C9A" }}
              >
                {l.doctorName.replace(/ทพญ\.|ทพ\./g, "").trim()[0] || "บ"}
              </div>
              <div>
                <p className="font-bold text-xs text-[#1A365D]">{l.doctorName}</p>
                <p className="text-[10px] text-gray-500">
                  ช่วงวันที่ลา:{" "}
                  <span className="font-semibold text-gray-700">
                    {l.startDate === l.endDate ? l.startDate : `${l.startDate} ถึง ${l.endDate}`}
                  </span>
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-medium">
                    ลา{l.leaveType}
                  </span>
                  {l.reason && (
                    <span className="text-[10px] text-gray-600 truncate max-w-[180px]" title={l.reason}>
                      {l.reason}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
              {l.status}
            </span>
          </div>

          {/* ปุ่มดำเนินการอนุมัติ / ไม่อนุมัติ */}
          <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-gray-100">
            <button
              disabled={updatingId === l.id}
              onClick={() => onAction(l.id, "อนุมัติแล้ว")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Check size={11} /> อนุมัติ
            </button>
            <button
              disabled={updatingId === l.id}
              onClick={() => onAction(l.id, "ไม่อนุมัติ")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <X size={11} /> ไม่อนุมัติ
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

