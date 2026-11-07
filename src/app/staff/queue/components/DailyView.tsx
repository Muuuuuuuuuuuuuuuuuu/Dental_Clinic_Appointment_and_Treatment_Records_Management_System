import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Appointment, SpecialClosure, StaffView, LeaveRequest, Shift } from "@/app/shared/data";
import { fmtDate, getNow, thaiDay } from "../hooks/useQueueData";
import DaySelector from "./DaySelector";
import OnDutyDentistsBar from "./OnDutyDentistsBar";
import TodayKanbanBoard from "./TodayKanbanBoard";
import StatCards from "./StatCards";
import AppointmentList from "./AppointmentList";

interface DailyViewProps {
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  appointments: Appointment[];
  closures: SpecialClosure[];
  weeklyOffs: number[];
  dentists: any[];
  leaves: LeaveRequest[];
  shifts: Shift[];
  setView: (v: StaffView) => void;
  onUpdateAppt: (id: number, s: Partial<Appointment>) => void;
}

/**
 * 📅 [QUEUE VIEW] มุมมองคิวงานรายวัน
 */
export default function DailyView({
  selectedDate,
  setSelectedDate,
  appointments,
  closures,
  weeklyOffs,
  dentists,
  leaves,
  shifts,
  setView,
  onUpdateAppt,
}: DailyViewProps) {
  const dateStr = fmtDate(selectedDate);
  const todayStr = fmtDate(getNow());
  const isToday = dateStr === todayStr;
  const closure = closures.find((c) => c.date === dateStr);
  const isWeeklyOff = weeklyOffs.includes(selectedDate.getDay());
  const isClosed = Boolean(closure || isWeeklyOff);

  const dayAppts = appointments
    .filter((a) => a.date === dateStr)
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  return (
    <div>
      {/* 1. แถบเลื่อนเลือกวันที่ */}
      <DaySelector
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        isToday={isToday}
      />

      {/* 2. แถบแจ้งเตือนวันปิดทำการ */}
      {isClosed && (
        <div
          className="rounded-xl px-4 py-3 mb-5 flex items-center gap-3"
          style={{ backgroundColor: "#FFF3E0", border: "1px solid #FED7AA" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#FFCC80" }}
          >
            <CalendarIcon size={16} style={{ color: "#E65100" }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#E65100" }}>
              คลินิกปิดทำการ
            </p>
            <p className="text-xs" style={{ color: "#BF360C" }}>
              {closure
                ? closure.reason
                : `วันหยุดประจำสัปดาห์ (${thaiDay[selectedDate.getDay()]})`}
            </p>
          </div>
        </div>
      )}

      {/* 3. รายชื่อทันตแพทย์ที่เข้าเวรวันนี้ */}
      {!isClosed && (
        <OnDutyDentistsBar
          dentists={dentists}
          leaves={leaves}
          shifts={shifts}
          dayAppts={dayAppts}
          dateStr={dateStr}
          dayOfWeek={selectedDate.getDay()}
        />
      )}

      {/* 4. แสดงกระดานคิวหากเป็นวันนี้ หรือแสดงตารางนัดหมายหากเป็นวันอื่น */}
      {isToday && !closure ? (
        <>
          <TodayKanbanBoard
            appts={dayAppts}
            onUpdate={onUpdateAppt}
            setView={setView}
          />

          <div className="mt-8 mb-3">
            <h3 className="font-bold text-sm" style={{ color: "#1A365D" }}>
              รายการนัดหมายทั้งหมดของวันนี้ • {dayAppts.length} ราย
            </h3>
            <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
              (รวมคิวที่เสร็จสิ้นและชำระเงินแล้ว)
            </p>
          </div>
          <AppointmentList appts={dayAppts} />
        </>
      ) : (
        <>
          <StatCards appts={dayAppts} setView={setView} />
          <div className="mb-3">
            <p className="text-xs font-medium mb-3" style={{ color: "#94A3B8" }}>
              รายการนัดหมาย • {dayAppts.length} ราย
            </p>
          </div>
          <AppointmentList appts={dayAppts} />
        </>
      )}
    </div>
  );
}
