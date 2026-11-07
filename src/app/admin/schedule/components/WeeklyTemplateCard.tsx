import { useState } from "react";
import { Shift } from "@/app/shared/data";
import { Calendar as CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";

const DAY_TH = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

const DAY_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  0: { bg: "#FEE2E2", text: "#991B1B", border: "#F87171" }, // อาทิตย์ - แดง
  1: { bg: "#FEF9C3", text: "#854D0E", border: "#FACC15" }, // จันทร์ - เหลือง
  2: { bg: "#FCE7F3", text: "#9D174D", border: "#F472B6" }, // อังคาร - ชมพู
  3: { bg: "#DCFCE7", text: "#166534", border: "#4ADE80" }, // พุธ - เขียว
  4: { bg: "#FFEDD5", text: "#9A3412", border: "#FB923C" }, // พฤหัสบดี - ส้ม
  5: { bg: "#E0F2FE", text: "#0369A1", border: "#38BDF8" }, // ศุกร์ - ฟ้า
  6: { bg: "#F3E8FF", text: "#6B21A8", border: "#C084FC" }, // เสาร์ - ม่วงอ่อน
};

interface WeeklyTemplateCardProps {
  persons: {
    id: number;
    name: string;
    type: "dentist" | "staff";
    userId: string;
    color: string;
  }[];
  shifts: Shift[];
  weeklyOffDays: number[];
  onEditShift: (person: any, dayIndex: number, shift?: Shift) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

/**
 * 👈 [WEEKLY TEMPLATE CARD]
 * ตารางกะเวรประจำสัปดาห์ (Weekly Template) 7 วัน
 */
export default function WeeklyTemplateCard({
  persons,
  shifts,
  weeklyOffDays,
  onEditShift,
  isCollapsed,
  onToggleCollapse,
}: WeeklyTemplateCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden h-full flex flex-col">
      {/* ส่วนหัวการ์ด */}
      <div className="p-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1A365D]">
            ตารางเวรประจำสัปดาห์ (Weekly Template)
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">คลิกที่ช่องเพื่อแก้ไขเวลาหรือตั้งเป็นวันหยุด</p>
        </div>

      </div>

      {/* ส่วนตาราง */}
      {!isCollapsed && (
        <div className="overflow-x-auto max-h-[265px] overflow-y-auto flex-1">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 z-10 shadow-xs">
              <tr className="border-b bg-white">
                <th className="py-2 px-2.5 font-semibold text-gray-600 border-r min-w-[140px]">บุคลากร</th>
                {DAY_TH.map((d, i) =>
                  !weeklyOffDays.includes(i) ? (
                    <th
                      key={i}
                      className="py-1.5 px-2 font-semibold text-center min-w-[80px]"
                      style={{ color: DAY_COLORS[i].text, backgroundColor: DAY_COLORS[i].bg }}
                    >
                      {d}
                    </th>
                  ) : null
                )}
              </tr>
            </thead>
            <tbody>
              {persons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    ไม่พบบุคลากรตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                persons.map((person) => (
                  <tr key={`${person.type}-${person.id}`} className="border-b hover:bg-gray-50/50 transition-colors">
                    <td className="py-1.5 px-2.5 font-medium border-r bg-white">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: person.color }}
                        />
                        <span className="truncate max-w-[125px] font-semibold text-gray-800 text-[11px]">
                          {person.name}
                        </span>
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded-md ${
                            person.type === "dentist" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          {person.type === "dentist" ? "หมอ" : "จนท."}
                        </span>
                      </div>
                    </td>

                    {DAY_TH.map((_, dayIndex) => {
                      if (weeklyOffDays.includes(dayIndex)) return null;

                      const shift = shifts.find(
                        (s) => s.userId === person.userId && s.day_of_week === dayIndex
                      );

                      const isOff = shift ? shift.is_off : false;
                      const hasShift = !!shift && !shift.is_off;

                      return (
                        <td
                          key={dayIndex}
                          onClick={() => onEditShift(person, dayIndex, shift)}
                          className="p-1 text-center border-r last:border-r-0 cursor-pointer hover:bg-blue-50/50 transition-colors"
                        >
                          {isOff ? (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-400">
                              หยุด
                            </span>
                          ) : hasShift ? (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              {shift.start_time?.slice(0, 5)} - {shift.end_time?.slice(0, 5)}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-[10px]">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
