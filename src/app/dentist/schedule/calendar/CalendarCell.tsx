import React from "react";
import { Shift, SpecialClosure, LeaveRequest, Appointment } from "@/app/shared/data";

interface CalendarCellProps {
  day: number;
  currentDate: Date;
  appointments: Appointment[];
  closures: SpecialClosure[];
  leaves: LeaveRequest[];
  shifts: Shift[];
  weeklyOffDays: number[];
  onSelectDate: (dateStr: string) => void;
}

/**
 * 📅 [CALENDAR COMPONENT] ช่องวันที่ 1 ช่องในปฏิทินปฏิบัติงานจริง
 */
export default function CalendarCell({
  day,
  currentDate,
  appointments,
  closures,
  leaves,
  shifts,
  weeklyOffDays,
  onSelectDate,
}: CalendarCellProps) {
  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay();
  const dayAppts = appointments.filter((a) => a.date === dateStr);

  const closure = closures.find((c) => c.date === dateStr);
  const leave = leaves.find((l) => l.startDate === dateStr);
  const baseShift = shifts.find((s) => s.day_of_week === dayOfWeek);
  const isClinicOff = weeklyOffDays.includes(dayOfWeek);

  let cellBg = "bg-white";
  let textColor = "text-gray-700";
  const indicators: React.ReactNode[] = [];
  let tooltip = "";
  let isWorking = false;

  if (closure) {
    cellBg = "bg-orange-50";
    textColor = "text-orange-600";
    indicators.push(<div key={`closure-${day}`} className="w-2 h-2 rounded-full bg-orange-500" />);
    tooltip = `ปิดคลินิก: ${closure.reason}`;
  } else if (isClinicOff) {
    cellBg = "bg-orange-50";
    textColor = "text-orange-600";
    indicators.push(<div key={`off-${day}`} className="w-2 h-2 rounded-full bg-orange-500" />);
    tooltip = "คลินิกปิดทำการ (วันหยุดประจำสัปดาห์)";
  } else if (leave) {
    if (leave.status === "รออนุมัติ") {
      cellBg = "bg-yellow-50";
      textColor = "text-yellow-700";
      indicators.push(
        <div key="pending" className="w-1.5 h-1.5 rounded-full bg-yellow-400 border border-yellow-500" />
      );
      tooltip = `รออนุมัติลา: ${leave.reason}`;
    } else if (leave.status === "อนุมัติแล้ว") {
      cellBg = "bg-red-50";
      textColor = "text-red-700";
      indicators.push(<div key="full" className="w-2 h-2 rounded-full bg-red-500" />);
      tooltip = `${leave.leaveType}: ${leave.reason}`;
    } else {
      indicators.push(
        <div
          key="rejected"
          title="ไม่อนุมัติ"
          className="w-2 h-2 flex items-center justify-center rounded-full bg-red-100 border border-red-400"
        >
          <div className="w-1 h-1 rounded-full bg-red-500" />
        </div>
      );
      tooltip = `ไม่อนุมัติลา: ${leave.reason}`;
      if (baseShift && !baseShift.is_off) isWorking = true;
    }
  } else if (!baseShift || baseShift.is_off) {
    cellBg = "bg-gray-50";
    textColor = "text-gray-400";
    tooltip = "วันหยุดประจำ";
  } else {
    isWorking = true;
  }

  if (isWorking && dayAppts.length > 0) {
    tooltip = tooltip ? `${tooltip} • มีจอง ${dayAppts.length} คิว` : `มีจอง ${dayAppts.length} คิว`;
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const isPast = dateStr < todayStr;
  const isToday = dateStr === todayStr;

  const isClickable = !isPast && !closure && !isClinicOff && !leave && baseShift && !baseShift.is_off;

  return (
    <div
      onClick={() => {
        if (isClickable) onSelectDate(dateStr);
      }}
      className={`relative min-h-[60px] p-2 border border-gray-100 ${cellBg} transition-all group ${
        isClickable
          ? "hover:border-blue-300 hover:shadow-xs cursor-pointer"
          : "cursor-default opacity-80"
      }`}
    >
      <div
        className={`text-sm font-medium ${textColor} ${
          isToday
            ? "bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
            : ""
        }`}
      >
        {day}
      </div>

      <div className="absolute top-2 right-2 flex gap-1">{indicators}</div>

      {isWorking && !leave && (
        <div className="mt-1 flex flex-col items-center justify-center">
          <span className="text-[10px] text-gray-400 leading-none">
            {baseShift?.start_time?.substring(0, 5)} - {baseShift?.end_time?.substring(0, 5)}
          </span>
          {dayAppts.length > 0 && (
            <div className="mt-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-bold">
              {dayAppts.length} คิว
            </div>
          )}
        </div>
      )}

      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
          {tooltip}
        </div>
      )}
    </div>
  );
}

