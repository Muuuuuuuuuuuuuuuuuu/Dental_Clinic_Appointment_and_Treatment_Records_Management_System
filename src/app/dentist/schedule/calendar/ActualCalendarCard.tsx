import CalendarHeader from "./CalendarHeader";
import CalendarCell from "./CalendarCell";
import { Shift, SpecialClosure, LeaveRequest, Appointment } from "@/app/shared/data";

interface ActualCalendarProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onResetMonth: () => void;
  onChangeMonth: (m: number) => void;
  onChangeYear: (y: number) => void;
  appointments: Appointment[];
  closures: SpecialClosure[];
  leaves: LeaveRequest[];
  shifts: Shift[];
  weeklyOffDays: number[];
  onSelectDate: (dateStr: string) => void;
}

/**
 * 📅 [CONTENT COMPONENT] ปฏิทินปฏิบัติงานรายเดือนจริงของทันตแพทย์
 */
export default function ActualCalendar({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onResetMonth,
  onChangeMonth,
  onChangeYear,
  appointments,
  closures,
  leaves,
  shifts,
  weeklyOffDays,
  onSelectDate,
}: ActualCalendarProps) {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 p-4"
      style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
    >
      {/* แถบหัวปฏิทิน และตัวเลือกเดือน */}
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
        onResetMonth={onResetMonth}
        onChangeMonth={onChangeMonth}
        onChangeYear={onChangeYear}
      />

      {/* ตารางปฏิทิน 7 วัน */}
      <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-xl overflow-hidden">
        {["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"].map((day) => (
          <div
            key={day}
            className="bg-gray-50 py-2.5 text-center text-xs font-semibold text-gray-500"
          >
            {day}
          </div>
        ))}

        {/* ช่องว่างก่อนวันแรกของเดือน */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-gray-50 min-h-[56px]" />
        ))}

        {/* ช่องวันที่ในเดือน */}
        {Array.from({ length: daysInMonth }).map((_, i) => (
          <CalendarCell
            key={i + 1}
            day={i + 1}
            currentDate={currentDate}
            appointments={appointments}
            closures={closures}
            leaves={leaves}
            shifts={shifts}
            weeklyOffDays={weeklyOffDays}
            onSelectDate={onSelectDate}
          />
        ))}

        {/* ช่องว่างหลังวันสุดท้ายของเดือน */}
        {Array.from({
          length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7,
        }).map((_, i) => (
          <div key={`empty-end-${i}`} className="bg-gray-50 min-h-[56px]" />
        ))}
      </div>
    </div>
  );
}
