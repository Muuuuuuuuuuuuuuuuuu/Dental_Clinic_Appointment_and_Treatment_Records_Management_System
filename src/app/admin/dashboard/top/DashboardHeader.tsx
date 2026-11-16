import React from "react";
import { Timeframe } from "../useDashboardData";

interface DashboardHeaderProps {
  targetDateStr: string;
  onDateChange: (date: Date) => void;
  timeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
}

/**
 * 🔲 [DASHBOARD HEADER] แถบควบคุมส่วนบนของแดชบอร์ด
 * รวมหัวข้อ "ภาพรวมระบบ" และตัวเลือกวันที่ + ปุ่มสลับช่วงเวลา วัน/สัปดาห์/เดือน
 */
export default function DashboardHeader({
  targetDateStr,
  onDateChange,
  timeframe,
  onTimeframeChange,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row  justify-between gap-2 ">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
        >
          ภาพรวมระบบ
        </h1>
      </div>

      {/* ตัวเลือกวันที่ และปุ่มสลับช่วงเวลา วัน/สัปดาห์/เดือน */}
      <div className="flex  gap-2">
        <input
          type="date"
          value={targetDateStr}
          onChange={(e) => {
            if (e.target.value) onDateChange(new Date(e.target.value));
          }}
          className="px-2 py-1  text-xs font-medium border border-slate-200 rounded-lg outline-none focus:bg-white"
        />
        <div className="flex  items-center bg-white rounded-lg p-0.5 shadow-xs border border-slate-100">
          {[
            { id: "today", label: "วัน" },
            { id: "week", label: "สัปดาห์" },
            { id: "month", label: "เดือน" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTimeframeChange(t.id as Timeframe)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${timeframe === t.id
                  ? "bg-[#1A365D] text-white"
                  : "text-slate-500 hover:text-slate-800"
                }`}
            >
              {t.label} 
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
