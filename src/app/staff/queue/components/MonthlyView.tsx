import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Appointment, SpecialClosure } from "@/app/shared/data";
import {
  ViewMode,
  fmtDate,
  thaiDayShort,
  thaiMonth,
  getNow,
} from "../hooks/useQueueData";

interface MonthlyViewProps {
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  appointments: Appointment[];
  closures: SpecialClosure[];
  weeklyOffs: number[];
  setMode: (m: ViewMode) => void;
}

/**
 * 📆 [QUEUE VIEW] มุมมองคิวงานรายเดือน
 */
export default function MonthlyView({
  selectedDate,
  setSelectedDate,
  appointments,
  closures,
  weeklyOffs,
  setMode,
}: MonthlyViewProps) {
  const [monthDate, setMonthDate] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const todayStr = fmtDate(getNow());

  const handleDayClick = (d: number) => {
    setSelectedDate(new Date(year, month, d));
    setMode("daily");
  };

  return (
    <div>
      {/* แถบเลื่อนเลือกเดือน */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => setMonthDate(new Date(year, month - 1, 1))}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
          style={{ color: "#4A6080" }}
        >
          <ChevronLeft size={20} />
        </button>
        <p
          className="font-bold text-lg"
          style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
        >
          {thaiMonth[month]} {year + 543}
        </p>
        <button
          type="button"
          onClick={() => setMonthDate(new Date(year, month + 1, 1))}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
          style={{ color: "#4A6080" }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* ปฏิทิน */}
      <div
        className="rounded-2xl bg-white p-5"
        style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
      >
        {/* แถวชื่อวันในสัปดาห์ */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {thaiDayShort.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-semibold py-2"
              style={{ color: "#94A3B8" }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* ตารางวันที่ในเดือน */}
        <div className="grid grid-cols-7 gap-1">
          {/* ช่องว่างก่อนวันแรกของเดือน */}
          {[...Array(firstDow)].map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* ช่องวันที่ */}
          {[...Array(daysInMonth)].map((_, i) => {
            const d = i + 1;
            const ds = fmtDate(new Date(year, month, d));
            const isToday = ds === todayStr;
            const closure = closures.find((c) => c.date === ds);
            const dayAppts = appointments.filter((a) => a.date === ds);
            const isWeeklyOff = weeklyOffs.includes(new Date(year, month, d).getDay());
            const isClosed = Boolean(closure || isWeeklyOff);

            return (
              <button
                key={d}
                type="button"
                onClick={() => handleDayClick(d)}
                className="relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all hover:shadow-md hover:ring-2 hover:ring-pink-200 group cursor-pointer"
                title={
                  isClosed
                    ? closure
                      ? `ปิดทำการ: ${closure.reason}`
                      : "วันหยุดประจำสัปดาห์"
                    : `${dayAppts.length} นัดหมาย`
                }
                style={{
                  backgroundColor: isClosed ? "#FFF8F0" : isToday ? "#FFD6DC" : "#FAFBFC",
                  border: isToday ? "2px solid #FF8C9A" : "1px solid #F0F2F5",
                }}
              >
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: isClosed ? "#E65100" : isToday ? "#FF6B7E" : "#1A365D",
                  }}
                >
                  {d}
                </span>

                {/* ป้ายแสดงจำนวนนัดหมายในแต่ละวัน */}
                {dayAppts.length > 0 && !isClosed && (
                  <span
                    className="absolute bottom-1 text-xs font-bold px-1.5 py-0 rounded-full"
                    style={{
                      backgroundColor: "#FF8C9A",
                      color: "white",
                      fontSize: "9px",
                    }}
                  >
                    {dayAppts.length}
                  </span>
                )}

                {/* ป้ายแสดงวันหยุดคลินิก */}
                {isClosed && (
                  <span
                    className="absolute bottom-1 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "#E65100" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* คำอธิบายสัญลักษณ์สี */}
      <div className="flex items-center gap-5 mt-4 px-2">
        {[
          { color: "#FF8C9A", label: "วันนี้" },
          { color: "#FF8C9A", label: "มีนัดหมาย", isBadge: true },
          { color: "#E65100", label: "ปิดทำการ" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            {l.isBadge ? (
              <span
                className="text-xs font-bold px-1.5 rounded-full"
                style={{
                  backgroundColor: l.color,
                  color: "white",
                  fontSize: "9px",
                }}
              >
                3
              </span>
            ) : (
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: l.color }}
              />
            )}
            <span className="text-xs" style={{ color: "#94A3B8" }}>
              {l.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
