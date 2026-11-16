import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DAY_TH } from "@/app/shared/constants";

interface ActualCalendarCardProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  getDailyData: (dateObj: Date) => {
    isClosed: any;
    working: any[];
    onLeave: any[];
    offDuty: any[];
    dateStr: string;
  };
  onSelectDay: (info: { dateObj: Date; dateStr: string }) => void;
  filterRole: "all" | "dentist" | "staff";
}

/**
 * 👉 [ACTUAL CALENDAR CARD]
 * ปฏิทินปฏิบัติงานจริงรายเดือน (คำนวณหักวันลาและวันปิดพิเศษแล้ว)
 */
export default function ActualCalendarCard({
  currentDate,
  onPrevMonth,
  onNextMonth,
  getDailyData,
  onSelectDay,
  filterRole,
}: ActualCalendarCardProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-3.5 h-full flex flex-col justify-between">
      {/* 1. ส่วนหัวของปฏิทิน */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-[#1A365D]">
            ปฏิทินปฏิบัติงานจริง (Actual Calendar)
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">แสดงผู้ปฏิบัติงานจริงในแต่ละวัน (หักผู้ที่ลาหยุดออกแล้ว)</p>
        </div>

        {/* ปุ่มเลื่อนเดือน */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-0.5 shadow-xs">
            <button
              onClick={onPrevMonth}
              className="p-1 hover:bg-white rounded-lg text-gray-500 transition-colors cursor-pointer"
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-[#1A365D] px-2 min-w-[110px] text-center">
              {currentDate.toLocaleDateString("th-TH", { month: "long", year: "numeric" })}
            </span>
            <button
              onClick={onNextMonth}
              className="p-1 hover:bg-white rounded-lg text-gray-500 transition-colors cursor-pointer"
              title="เดือนถัดไป"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. ตารางปฏิทิน */}
      <div className="border border-gray-100 rounded-xl overflow-hidden flex-1 flex flex-col justify-between">
        {/* แถบหัววัน อาทิตย์ - เสาร์ */}
        <div className="grid grid-cols-7 bg-gray-50/80 border-b border-gray-100 text-center py-2 text-[11px] font-bold text-gray-500">
          {DAY_TH.map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>

        {/* ตารางช่องแต่ละวัน */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-gray-100 text-xs flex-1">
          {/* ช่องว่างก่อนวันที่ 1 */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[42px] bg-gray-50/30" />
          ))}

          {/* ช่องของแต่ละวันในเดือน */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const thisDate = new Date(year, month, dayNum);
            const { isClosed, working, onLeave, dateStr } = getDailyData(thisDate);

            // กรองตามบทบาท
            const filteredWorking = working.filter((p) =>
              filterRole === "all" ? true : p.type === filterRole
            );
            const filteredOnLeave = onLeave.filter((p) =>
              filterRole === "all" ? true : p.type === filterRole
            );

            const isToday = new Date().toDateString() === thisDate.toDateString();

            return (
              <div
                key={dayNum}
                onClick={() => onSelectDay({ dateObj: thisDate, dateStr })}
                className={`min-h-[42px] p-1 transition-colors cursor-pointer hover:bg-blue-50/30 relative flex flex-col justify-between ${
                  isClosed
                    ? "bg-rose-50/30"
                    : isToday
                    ? "bg-amber-50/40"
                    : "bg-white"
                }`}
              >
                {/* หัววันที่ */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                      isToday
                        ? "bg-[#1A365D] text-white shadow-xs"
                        : "text-gray-700"
                    }`}
                  >
                    {dayNum}
                  </span>
                  {isClosed && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-rose-100 text-rose-700 font-medium truncate max-w-[55px]">
                      {isClosed.reason || "ปิด"}
                    </span>
                  )}
                </div>

                {/* สรุปจำนวนคนทำงานและลา */}
                <div className="space-y-0.5 mt-1">
                  {filteredWorking.length > 0 && (
                    <div className="text-[10px] px-1 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium truncate flex items-center justify-between">
                      <span>ทำงาน</span>
                      <span className="font-bold">{filteredWorking.length}</span>
                    </div>
                  )}

                  {filteredOnLeave.length > 0 && (
                    <div className="text-[10px] px-1 py-0.5 rounded bg-amber-50 text-amber-700 font-medium truncate flex items-center justify-between">
                      <span>ลา</span>
                      <span className="font-bold">{filteredOnLeave.length}</span>
                    </div>
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

