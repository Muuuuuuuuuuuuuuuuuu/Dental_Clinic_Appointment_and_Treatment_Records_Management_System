import React from "react";
import { LeaveRequest } from "@/app/shared/data";

interface HistoryLeavesListProps {
  leaves: LeaveRequest[];
}

export default function HistoryLeavesList({ leaves }: HistoryLeavesListProps) {
  if (leaves.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 text-xs">
        ยังไม่มีประวัติการอนุมัติการลา
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
      {leaves.map((l) => {
        const isApproved = l.status === "อนุมัติแล้ว";
        return (
          <div
            key={l.id}
            className={`rounded-xl bg-white p-3 border border-l-4 ${
              isApproved ? "border-l-green-500" : "border-l-red-500"
            } shadow-xs flex items-start justify-between gap-3`}
          >
            <div className="flex items-start gap-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                style={{ backgroundColor: isApproved ? "#10B981" : "#EF4444" }}
              >
                {l.doctorName.replace(/ทพญ\.|ทพ\./g, "").trim()[0] || "บ"}
              </div>
              <div>
                <p className="font-bold text-xs text-[#1A365D]">{l.doctorName}</p>
                <p className="text-[10px] text-gray-500">
                  {l.startDate === l.endDate ? l.startDate : `${l.startDate} ถึง ${l.endDate}`} • ลา
                  {l.leaveType}
                </p>
                {l.reason && <p className="text-[10px] text-gray-400 mt-0.5">เหตุผล: {l.reason}</p>}
              </div>
            </div>

            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                isApproved
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {l.status}
            </span>
          </div>
        );
      })}
    </div>
  );
}

