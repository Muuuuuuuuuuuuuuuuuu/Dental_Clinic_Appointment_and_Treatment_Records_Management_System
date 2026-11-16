import React from "react";
import { Appointment, LeaveRequest, Shift } from "@/app/shared/data";

interface OnDutyDentistsBarProps {
  dentists: any[];
  leaves: LeaveRequest[];
  shifts: Shift[];
  dayAppts: Appointment[];
  dateStr: string;
  dayOfWeek: number;
}

/**
 * [QUEUE COMPONENT] แถบแสดงรายชื่อทันตแพทย์ที่ออกตรวจวันนี้
 */
export default function OnDutyDentistsBar({
  dentists,
  leaves,
  shifts,
  dayAppts,
  dateStr,
  dayOfWeek,
}: OnDutyDentistsBarProps) {
  return (
    <div
      className="mb-5 flex flex-col gap-3 bg-white p-4 rounded-2xl border border-gray-100"
      style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.04)" }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm" style={{ color: "#1A365D" }}>
          แพทย์ออกตรวจวันนี้
        </h3>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2">
        {dentists.map((doc, idx) => {
          const docNameStr = doc.name.split(" ")[1] || doc.name;
          const isOnLeave = leaves.some(
            (l) => l.doctorId === doc.userId && l.startDate === dateStr && l.status === "อนุมัติแล้ว"
          );
          const docAppts = dayAppts.filter((a) => (a.doctorName || "").includes(docNameStr));

          const shift = shifts.find(
            (s) =>
              s.person_type === "dentist" &&
              s.person_id === doc.id &&
              s.day_of_week === dayOfWeek
          );

          const isWorking = (shift && !shift.is_off && !isOnLeave) || docAppts.length > 0;

          let bg = "#F8F9FA",
            text = "#94A3B8",
            border = "#E2E8F0";
          if (isWorking) {
            bg = "#E8F4FF";
            text = "#1D6FA4";
            border = "#BAE6FD";
          } else if (isOnLeave) {
            bg = "#FFF1F2";
            text = "#E11D48";
            border = "#FECDD3";
          }

          return (
            <div
              key={idx}
              className="flex flex-col items-center min-w-[100px] p-2 rounded-xl border flex-shrink-0"
              style={{ backgroundColor: bg, borderColor: border }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2 shadow-xs bg-white"
                style={{ color: text }}
              >
                {docNameStr.charAt(0)}
              </div>
              <span className="text-xs font-bold whitespace-nowrap mb-0.5" style={{ color: text }}>
                {docNameStr}
              </span>
              <span className="text-[10px] font-medium" style={{ color: text, opacity: 0.8 }}>
                {isWorking ? `มี ${docAppts.length} คิว` : isOnLeave ? "ลาพัก" : "ไม่มีเวร"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
