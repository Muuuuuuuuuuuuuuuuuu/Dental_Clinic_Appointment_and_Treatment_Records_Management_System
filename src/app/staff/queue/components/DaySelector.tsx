import React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { fmtDate, thaiDay, thaiMonth, addDays, getNow } from "../hooks/useQueueData";

interface DaySelectorProps {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  isToday: boolean;
}

/**
 * 📆 [QUEUE COMPONENT] แถบเลื่อนวัน, ตัวเลือกปฏิทิน และปุ่มกลับวันนี้
 */
export default function DaySelector({
  selectedDate,
  onSelectDate,
  isToday,
}: DaySelectorProps) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onSelectDate(addDays(selectedDate, -1))}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
          style={{ color: "#4A6080" }}
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center min-w-[200px]">
          <p
            className="font-bold text-lg flex items-center justify-center gap-2"
            style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
          >
            {isToday && (
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "#FF8C9A", color: "white" }}
              >
                วันนี้
              </span>
            )}
            {thaiDay[selectedDate.getDay()]}
          </p>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <p className="text-sm" style={{ color: "#4A6080" }}>
              {selectedDate.getDate()} {thaiMonth[selectedDate.getMonth()]}{" "}
              {selectedDate.getFullYear() + 543}
            </p>
            <div className="relative overflow-hidden w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center cursor-pointer">
              <CalendarIcon size={14} style={{ color: "#4A6080" }} />
              <input
                type="date"
                value={fmtDate(selectedDate)}
                onChange={(e) => e.target.value && onSelectDate(new Date(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSelectDate(addDays(selectedDate, 1))}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
          style={{ color: "#4A6080" }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        {!isToday && (
          <button
            type="button"
            onClick={() => onSelectDate(getNow())}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80 cursor-pointer"
            style={{ backgroundColor: "#E8F4FF", color: "#1D6FA4" }}
          >
            กลับวันนี้
          </button>
        )}
      </div>
    </div>
  );
}
