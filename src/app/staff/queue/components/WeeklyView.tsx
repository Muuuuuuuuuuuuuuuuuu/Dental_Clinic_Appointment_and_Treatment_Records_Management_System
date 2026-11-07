import React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Appointment, SpecialClosure, STATUS_COLORS } from "@/app/shared/data";
import {
  ViewMode,
  fmtDate,
  thaiDayShort,
  thaiMonth,
  addDays,
  getMonday,
  getNow,
} from "../hooks/useQueueData";

interface WeeklyViewProps {
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  appointments: Appointment[];
  closures: SpecialClosure[];
  weeklyOffs: number[];
  setMode: (m: ViewMode) => void;
}

/**
 * 🗓️ [QUEUE VIEW] มุมมองคิวงานรายสัปดาห์
 */
export default function WeeklyView({
  selectedDate,
  setSelectedDate,
  appointments,
  closures,
  weeklyOffs,
  setMode,
}: WeeklyViewProps) {
  const monday = getMonday(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const todayStr = fmtDate(getNow());

  const handleDayClick = (d: Date) => {
    setSelectedDate(d);
    setMode("daily");
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 9); // 09:00 - 20:00

  return (
    <div className="h-full flex flex-col">
      {/* แถบเลื่อนเลือกสัปดาห์ */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => setSelectedDate(addDays(selectedDate, -7))}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
          style={{ color: "#4A6080" }}
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p
            className="font-bold text-lg"
            style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
          >
            สัปดาห์ที่ {Math.ceil(monday.getDate() / 7)}
          </p>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <p className="text-sm" style={{ color: "#4A6080" }}>
              {weekDays[0].getDate()} - {weekDays[6].getDate()}{" "}
              {thaiMonth[weekDays[0].getMonth()]} {weekDays[0].getFullYear() + 543}
            </p>
            <div className="relative overflow-hidden w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center cursor-pointer">
              <CalendarIcon size={14} style={{ color: "#4A6080" }} />
              <input
                type="date"
                value={fmtDate(selectedDate)}
                onChange={(e) => e.target.value && setSelectedDate(new Date(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSelectedDate(addDays(selectedDate, 7))}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
          style={{ color: "#4A6080" }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* ตารางเวลาประจำสัปดาห์ */}
      <div
        className="flex bg-white rounded-2xl overflow-hidden border border-gray-100 flex-1"
        style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
      >
        {/* คอลัมน์แสดงเวลา */}
        <div className="w-16 flex-shrink-0 border-r border-gray-100 bg-gray-50/50">
          <div className="h-14 border-b border-gray-100" />
          {hours.map((h) => (
            <div key={h} className="h-24 border-b border-gray-100 p-2 text-right relative">
              <span className="text-xs font-medium text-gray-400 absolute -top-2.5 right-2 bg-gray-50 px-1">
                {String(h).padStart(2, "0")}:00
              </span>
            </div>
          ))}
        </div>

        {/* วันที่ในสัปดาห์ 7 วัน */}
        <div className="flex-1 grid grid-cols-7 overflow-x-auto">
          {weekDays.map((day) => {
            const ds = fmtDate(day);
            const isToday = ds === todayStr;
            const dayAppts = appointments.filter((a) => a.date === ds);
            const closure = closures.find((c) => c.date === ds);
            const isWeeklyOff = weeklyOffs.includes(day.getDay());
            const isClosed = Boolean(closure || isWeeklyOff);

            return (
              <div
                key={ds}
                className="border-r border-gray-100 last:border-r-0 relative min-w-[120px]"
              >
                {/* ส่วนหัวของแต่ละวัน */}
                <div
                  className="h-14 border-b border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleDayClick(day)}
                >
                  <span className="text-[11px] text-gray-500 font-medium">
                    {thaiDayShort[day.getDay()]}
                  </span>
                  <div
                    className={`mt-0.5 w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${
                      isToday ? "bg-pink-500 text-white" : "text-gray-700"
                    }`}
                  >
                    {day.getDate()}
                  </div>
                </div>

                {/* ช่องตารางเวลาของแต่ละวัน */}
                <div className="relative flex flex-col" style={{ height: `${12 * 6}rem` }}>
                  {isClosed ? (
                    <div
                      className="absolute inset-0 flex items-center justify-center p-2 text-center"
                      style={{ backgroundColor: "rgba(255, 243, 224, 0.4)", zIndex: 5 }}
                    >
                      <span className="text-[11px] font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-md">
                        {closure ? `ปิด: ${closure.reason}` : "วันหยุด"}
                      </span>
                    </div>
                  ) : (
                    hours.map((h) => {
                      const hAppts = dayAppts.filter(
                        (a) => parseInt((a.time || "09:00").split(":")[0]) === h
                      );
                      return (
                        <div
                          key={h}
                          className="h-24 border-b border-gray-50 box-border p-1 flex gap-1 flex-wrap overflow-y-auto content-start custom-scrollbar"
                        >
                          {hAppts.map((a) => {
                            const sc = STATUS_COLORS[a.status] || {
                              bg: "#F0F4F8",
                              text: "#4A6080",
                              dot: "#ccc",
                            };
                            return (
                              <div
                                key={a.id}
                                onClick={() => handleDayClick(day)}
                                className="flex-auto min-w-[45%] h-[40px] rounded-lg p-1.5 overflow-hidden border-l-4 shadow-xs cursor-pointer hover:shadow-md transition-shadow group flex flex-col justify-center"
                                style={{ backgroundColor: sc.bg, borderColor: sc.dot }}
                                title={`${a.time} - ${a.patientName} (${a.service})`}
                              >
                                <p
                                  className="text-[10px] font-bold leading-tight truncate mb-0.5"
                                  style={{ color: sc.text }}
                                >
                                  {a.time} {a.patientName.split(" ")[0]}
                                </p>
                                <p
                                  className="text-[9px] truncate leading-tight opacity-75"
                                  style={{ color: sc.text }}
                                >
                                  {a.service}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
