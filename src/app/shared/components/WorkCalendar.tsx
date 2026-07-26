import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface WorkCalendarProps {
  onSelectDate: (date: string) => void;
  pendingDates?: string[];
  approvedDates?: string[];
  offDates?: string[];
  specialHolidays?: string[];
}

const DAYS_OF_WEEK = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

export default function WorkCalendar({ onSelectDate, pendingDates = [], approvedDates = [], offDates = [], specialHolidays = [] }: WorkCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const thaiYear = year + 543;

  const formatDate = (d: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const getDayColor = (d: number) => {
    const dateStr = formatDate(d);
    if (pendingDates.includes(dateStr)) return 'pending';
    if (approvedDates.includes(dateStr)) return 'approved';
    if (specialHolidays.includes(dateStr)) return 'holiday';
    
    const dayOfWeek = new Date(year, month, d).getDay();
    if (dayOfWeek === 0 || offDates.includes(dateStr)) {
      return 'off';
    }
    return 'work';
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col h-full" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
      {/* Header Banner */}
      <div className="px-6 py-5 flex items-center justify-between rounded-t-2xl" style={{ backgroundColor: "#A7C7F2", color: "#1A365D" }}>
        <h2 className="font-bold text-lg" style={{ fontFamily: "Prompt, sans-serif" }}>วันทำงาน</h2>
        <div className="relative">
          <Calendar size={32} color="#1A365D" strokeWidth={1.5} />
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full">
            <CheckCircle2 size={16} color="#00D100" fill="#00D100" className="text-white" />
          </div>
        </div>
      </div>

      <div className="p-6 flex-1" style={{ backgroundColor: "#EAF1FF" }}>
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-1 hover:bg-black/5 rounded-full transition-colors"><ChevronLeft size={20} color="#1A365D" /></button>
          <h3 className="font-medium" style={{ color: "#1A365D" }}>{THAI_MONTHS[month]} {thaiYear}</h3>
          <button onClick={nextMonth} className="p-1 hover:bg-black/5 rounded-full transition-colors"><ChevronRight size={20} color="#1A365D" /></button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-y-3 gap-x-2 text-center mb-6">
          {DAYS_OF_WEEK.map((d, i) => (
            <div key={i} className="text-sm font-medium mb-2" style={{ color: "#4A6080" }}>{d}</div>
          ))}
          
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="text-sm py-1 flex items-center justify-center w-8 h-8 mx-auto" style={{ color: "#B0C4DE" }}>
              {prevMonthDays - firstDayOfMonth + i + 1}
            </div>
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const status = getDayColor(d);
            const dateStr = formatDate(d);
            
            let bg = "transparent";
            let color = "#4A6080";
            
            if (status === 'work') { bg = "#00E600"; color = "#FFF"; }
            else if (status === 'off') { bg = "#9CA3AF"; color = "#FFF"; }
            else if (status === 'pending') { bg = "#F59E0B"; color = "#FFF"; }
            else if (status === 'approved') { bg = "#FF1A1A"; color = "#FFF"; }
            else if (status === 'holiday') { bg = "#000000"; color = "#FFF"; }

            return (
              <button 
                key={d} 
                onClick={() => {
                  if (status === 'work') {
                    onSelectDate(dateStr);
                  } else {
                    alert('คุณสามารถขอลางานได้เฉพาะในวันที่มีเวรทำงาน (สีเขียว) เท่านั้น วันหยุดหรือวันหยุดพิเศษไม่สามารถขอลางานได้');
                  }
                }}
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-medium transition-transform shadow-sm ${status === 'work' ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed'}`}
                style={{ backgroundColor: bg, color: color }}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend & Warning */}
      <div className="p-4 bg-white mt-auto">
        <div className="flex flex-wrap items-center justify-center gap-4 mb-4 py-2 px-4 rounded-xl" style={{ backgroundColor: "#E5E7EB" }}>
          <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-[#F59E0B]" /><span className="text-xs font-medium text-[#4A6080]">รออนุมัติ</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-[#FF1A1A]" /><span className="text-xs font-medium text-[#4A6080]">อนุมัติแล้ว</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-[#00E600]" /><span className="text-xs font-medium text-[#4A6080]">เข้างาน</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-[#9CA3AF]" /><span className="text-xs font-medium text-[#4A6080]">หยุด</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-[#000000]" /><span className="text-xs font-medium text-[#4A6080]">หยุดพิเศษ</span></div>
        </div>
        <p className="text-[10px] sm:text-xs text-center font-bold" style={{ color: "#E60000" }}>
          *ลาป่วยหรือลาพักร้อนล่วงหน้าอย่างน้อย 5 วัน และลาฉุกเฉินต้องมีใบรับรองแพทย์แนบหลักฐานการลา
        </p>
      </div>
    </div>
  );
}
