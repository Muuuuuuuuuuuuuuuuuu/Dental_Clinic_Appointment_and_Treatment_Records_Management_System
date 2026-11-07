import React from "react";
import { Timeframe } from "../hooks/useDashboardData";

interface TimeframeControlsProps {
  targetDateStr: string;
  onDateChange: (date: Date) => void;
  timeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
}

/**
 * 📅 [HEADER COMPONENT] ตัวเลือกวันที่ และปุ่มสลับช่วงเวลา วัน/สัปดาห์/เดือน
 */
export default function TimeframeControls({
  targetDateStr,
  onDateChange,
  timeframe,
  onTimeframeChange,
}: TimeframeControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={targetDateStr}
        onChange={(e) => {
          if (e.target.value) onDateChange(new Date(e.target.value));
        }}
        className="px-2 py-1 text-xs font-medium border border-slate-200 rounded-lg text-slate-600 outline-none focus:border-[#1A365D]"
      />
      <div className="flex items-center bg-white rounded-lg p-0.5 shadow-xs border border-slate-100">
        {[
          { id: "today", label: "วัน" },
          { id: "week", label: "สัปดาห์" },
          { id: "month", label: "เดือน" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTimeframeChange(t.id as Timeframe)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              timeframe === t.id
                ? "bg-[#1A365D] text-white"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

