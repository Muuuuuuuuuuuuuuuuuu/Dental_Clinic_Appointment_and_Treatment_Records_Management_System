import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Shift, SpecialClosure, LeaveRequest, StaffInfo } from "../../shared/data";
import { getShifts, getClinicClosures, getLeaveRequests, getWeeklyOffDays } from "../../shared/supabaseApi";

interface StaffCalendarProps {
  staff: StaffInfo | null;
}

export default function StaffCalendar({ staff }: StaffCalendarProps) {
  const staffUserId = staff?.userId;

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [closures, setClosures] = useState<SpecialClosure[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([0]);
  const [loading, setLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSchedule, setShowSchedule] = useState(true);

  useEffect(() => {
    if (staff?.id) fetchData();
  }, [staff?.id, staffUserId]);

  const fetchData = async () => {
    if (!staff?.id) return;
    try {
      const [sData, cData, lData, offDays] = await Promise.all([
        getShifts(),
        getClinicClosures(),
        getLeaveRequests(),
        getWeeklyOffDays()
      ]);
      setShifts(sData.filter(s => s.person_id === staff.id && s.person_type === "staff"));
      setClosures(cData);
      setLeaves(staffUserId ? lData.filter(l => l.doctorId === staffUserId) : []);
      setWeeklyOffDays(offDays);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderRegularSchedule = () => {
    const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"];
    const dayMap = [1, 2, 3, 4, 5, 6, 0];

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full overflow-hidden transition-all flex flex-col">
        <div
          className="px-5 py-4 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => setShowSchedule(!showSchedule)}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Clock size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">ตารางเวรประจำของฉัน</h2>
              <p className="text-xs text-gray-500">รูปแบบการทำงานปกติรายสัปดาห์</p>
            </div>
          </div>
          <div className="text-sm text-gray-400 font-medium">
            {showSchedule ? "ย่อเก็บ" : "แสดงรายละเอียด"}
          </div>
        </div>

        {showSchedule && (
          <div className="p-5 overflow-x-auto">
            <div className="flex gap-3 min-w-[600px]">
              {days.map((dayName, idx) => {
                const shiftDay = dayMap[idx];
                const shift = shifts.find(s => s.day_of_week === shiftDay);
                const isWorking = shift && !shift.is_off;

                return (
                  <div key={dayName} className="flex-1 border border-gray-100 rounded-xl overflow-hidden">
                    <div className={`text-center py-2 text-xs font-semibold ${isWorking ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-500"}`}>
                      {dayName}
                    </div>
                    <div className="py-4 text-center px-2">
                      {isWorking ? (
                        <>
                          <div className="text-sm font-bold text-gray-800">{shift.start_time?.substring(0, 5)}</div>
                          <div className="text-xs text-gray-400 my-0.5">ถึง</div>
                          <div className="text-sm font-bold text-gray-800">{shift.end_time?.substring(0, 5)}</div>
                        </>
                      ) : (
                        <div className="text-sm font-medium text-gray-400 py-2">หยุด</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const renderCalendarCell = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay();

    const closure = closures.find(c => c.date === dateStr);
    const leave = leaves.find(l => l.startDate === dateStr);
    const baseShift = shifts.find(s => s.day_of_week === dayOfWeek);
    const isClinicOff = weeklyOffDays.includes(dayOfWeek);

    let cellBg = "bg-white";
    let textColor = "text-gray-700";
    const indicators: React.ReactNode[] = [];
    let tooltip = "";
    let isWorking = false;

    if (closure) {
      cellBg = "bg-orange-50";
      textColor = "text-orange-600";
      indicators.push(<div key={`closure-${day}`} className="w-2 h-2 rounded-full bg-orange-500" />);
      tooltip = `ปิดคลินิก: ${closure.reason}`;
    } else if (isClinicOff) {
      cellBg = "bg-orange-50";
      textColor = "text-orange-600";
      indicators.push(<div key={`off-${day}`} className="w-2 h-2 rounded-full bg-orange-500" />);
      tooltip = "คลินิกปิดทำการ (วันหยุดประจำสัปดาห์)";
    } else if (leave && leave.status !== "ไม่อนุมัติ" && leave.status !== "ปฏิเสธ") {
      if (leave.status === "รออนุมัติ") {
        cellBg = "bg-yellow-50";
        textColor = "text-yellow-700";
        indicators.push(<div key="pending" className="w-1.5 h-1.5 rounded-full bg-yellow-400 border border-yellow-500" />);
        tooltip = `รออนุมัติลา: ${leave.reason}`;
      } else {
        cellBg = "bg-red-50";
        textColor = "text-red-700";
        indicators.push(<div key="full" className="w-2 h-2 rounded-full bg-red-500" />);
        tooltip = `${leave.leaveType || "ลา"}: ${leave.reason}`;
      }
    } else if (!baseShift || baseShift.is_off) {
      cellBg = "bg-gray-50";
      textColor = "text-gray-400";
      tooltip = "วันหยุดประจำ";
    } else {
      isWorking = true;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const isToday = dateStr === todayStr;

    return (
      <div
        key={day}
        className={`relative min-h-[60px] p-2 border border-gray-100 ${cellBg} transition-all group cursor-default`}
      >
        <div className={`text-sm font-medium ${textColor} ${isToday ? "bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center" : ""}`}>
          {day}
        </div>
        <div className="absolute top-2 right-2 flex gap-1">{indicators}</div>
        {isWorking && (
          <div className="mt-1 flex flex-col items-center justify-center">
            <span className="text-[10px] text-gray-400 leading-none">{baseShift?.start_time?.substring(0, 5)} - {baseShift?.end_time?.substring(0, 5)}</span>
          </div>
        )}
        {tooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
            {tooltip}
          </div>
        )}
      </div>
    );
  };

  const renderLeaveSummary = () => {
    const pending = leaves.filter(l => l.status === "รออนุมัติ").length;
    const approved = leaves.filter(l => l.status === "อนุมัติแล้ว").length;
    const rejected = leaves.filter(l => l.status === "ไม่อนุมัติ" || l.status === "ปฏิเสธ").length;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <CalendarIcon size={18} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">สรุปการลางาน</h2>
            <p className="text-xs text-gray-500">สถานะวันลาที่แอดมินกำหนด</p>
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col justify-center space-y-4">
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100">
            <span className="text-sm font-medium text-yellow-800">รออนุมัติ</span>
            <span className="text-lg font-bold text-yellow-700">{pending}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
            <span className="text-sm font-medium text-green-800">อนุมัติแล้ว</span>
            <span className="text-lg font-bold text-green-700">{approved}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
            <span className="text-sm font-medium text-red-800">ไม่อนุมัติ</span>
            <span className="text-lg font-bold text-red-700">{rejected}</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">กำลังโหลดข้อมูลปฏิทิน...</div>;
  }

  if (!staff) {
    return <div className="flex items-center justify-center h-64 text-gray-400">ไม่พบข้อมูลพนักงาน</div>;
  }

  return (
    <div style={{ fontFamily: "Prompt, sans-serif" }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>ปฏิทินและการลางาน</h1>
        <p className="text-sm" style={{ color: "#4A6080" }}>ตรวจสอบตารางทำงานและวันลา (แอดมินเป็นผู้กำหนดวันลาจากตารางเวร)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">{renderRegularSchedule()}</div>
        <div className="lg:col-span-1">{renderLeaveSummary()}</div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2">
            <select
              value={currentDate.getMonth()}
              onChange={(e) => setCurrentDate(new Date(currentDate.getFullYear(), Number(e.target.value), 1))}
              className="text-lg font-bold text-gray-800 bg-transparent border-none cursor-pointer focus:ring-0 p-0 pr-6 appearance-none"
            >
              {monthNames.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <select
              value={currentDate.getFullYear()}
              onChange={(e) => setCurrentDate(new Date(Number(e.target.value), currentDate.getMonth(), 1))}
              className="text-lg font-bold text-gray-800 bg-transparent border-none cursor-pointer focus:ring-0 p-0 pr-6 appearance-none"
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() + i - 1;
                return <option key={year} value={year}>{year + 543}</option>;
              })}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft size={20} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors">เดือนปัจจุบัน</button>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4 text-xs">
          <div className="flex items-center gap-1.5 text-gray-600"><div className="w-2 h-2 rounded-full bg-red-500" /> ลา</div>
          <div className="flex items-center gap-1.5 text-gray-600"><div className="w-2 h-2 rounded-full bg-yellow-400" /> รออนุมัติ</div>
          <div className="flex items-center gap-1.5 text-gray-600"><div className="w-2 h-2 rounded-full bg-orange-500" /> คลินิกปิด</div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-xl overflow-hidden">
          {["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"].map(day => (
            <div key={day} className="bg-gray-50 py-3 text-center text-xs font-semibold text-gray-500">{day}</div>
          ))}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-gray-50 min-h-[60px]" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => renderCalendarCell(i + 1))}
          {Array.from({ length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7 }).map((_, i) => (
            <div key={`empty-end-${i}`} className="bg-gray-50 min-h-[60px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
