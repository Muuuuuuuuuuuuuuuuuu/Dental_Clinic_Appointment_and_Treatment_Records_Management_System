import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertCircle, Plus, Clock, Info, Check, CalendarX } from "lucide-react";
import { Shift, SpecialClosure, LeaveRequest, StaffInfo } from "../../shared/data";
import { getShifts, getClinicClosures, getLeaveRequests, addLeaveRequest, getWeeklyOffDays } from "../../shared/supabaseApi";

interface StaffLeaveViewProps {
  staff?: StaffInfo | null;
}

export default function StaffLeaveView({ staff }: StaffLeaveViewProps) {
  // Use staff id for leaves
  const staffUserId = (staff as any)?.userId || staff?.id?.toString(); 
  
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [closures, setClosures] = useState<SpecialClosure[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([0]);
  const [loading, setLoading] = useState(true);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSchedule, setShowSchedule] = useState(true);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [leavePeriod, setLeavePeriod] = useState<"เต็มวัน" | "ครึ่งวันเช้า" | "ครึ่งวันบ่าย">("เต็มวัน");
  const [leaveType, setLeaveType] = useState<"ลาพักร้อน" | "ลาป่วย">("ลาพักร้อน");

  useEffect(() => {
    if (staffUserId) fetchData();
    else setLoading(false);
  }, [staffUserId]);

  const fetchData = async () => {
    if (!staffUserId) return;
    try {
      const [sData, cData, lData, offDays] = await Promise.all([
        getShifts(),
        getClinicClosures(),
        getLeaveRequests(),
        getWeeklyOffDays()
      ]);
      setShifts(sData.filter(s => s.person_id === staff?.id && s.person_type === 'staff'));
      setClosures(cData);
      setLeaves(lData.filter(l => l.doctorId === staffUserId)); // Reuse doctorId field for staff in this context
      setWeeklyOffDays(offDays);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffUserId || !selectedDate) return;
    
    try {
      const added = await addLeaveRequest({
        doctorId: staffUserId,
        startDate: selectedDate,
        endDate: selectedDate,
        leavePeriod: leavePeriod,
        reason: leaveType,
        status: "รอการอนุมัติ"
      });
      setLeaves([...leaves, {
        id: added?.leave_id || Date.now(),
        doctorId: staffUserId,
        doctorName: staff?.name || "",
        startDate: selectedDate,
        endDate: selectedDate,
        leavePeriod: leavePeriod,
        reason: leaveType,
        status: "รอการอนุมัติ",
        createdAt: selectedDate
      }]);
      setLeaveModalOpen(false);
      alert("ส่งคำขอลางานสำเร็จ รอแอดมินอนุมัติ");
    } catch (err: any) {
      console.error("Error adding leave", err);
      alert("ไม่สามารถขอลางานได้: " + (err.message || JSON.stringify(err)));
    }
  };

  // --- Regular Schedule View Logic ---
  const renderRegularSchedule = () => {
    const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"];
    const dayMap = [1, 2, 3, 4, 5, 6, 0]; // Monday = 1, Sunday = 0

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
                    <div className={`text-center py-2 text-xs font-semibold ${isWorking ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-500'}`}>
                      {dayName}
                    </div>
                    <div className="py-4 text-center px-2">
                      {isWorking ? (
                        <>
                          <div className="text-sm font-bold text-gray-800">{shift.start_time?.substring(0,5)}</div>
                          <div className="text-xs text-gray-400 my-0.5">ถึง</div>
                          <div className="text-sm font-bold text-gray-800">{shift.end_time?.substring(0,5)}</div>
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

  // --- Calendar View Logic ---
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const renderCalendarCell = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay();
    
    // Check Status
    const closure = closures.find(c => c.date === dateStr);
    const leave = leaves.find(l => l.startDate === dateStr);
    const baseShift = shifts.find(s => s.day_of_week === dayOfWeek);
    const isClinicOff = weeklyOffDays.includes(dayOfWeek);

    let cellBg = "bg-white";
    let textColor = "text-gray-700";
    let indicators = [];
    let tooltip = "";
    let isWorking = false;

    if (closure) {
      cellBg = "bg-orange-50";
      textColor = "text-orange-700";
      indicators.push(<div key="closure" className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>);
      tooltip = `ปิดคลินิก: ${closure.reason}`;
    } else if (isClinicOff) {
      cellBg = "bg-red-50/60";
      textColor = "text-red-400";
      indicators.push(<div key="clinic-off" className="w-1.5 h-1.5 rounded-full bg-red-400"></div>);
      tooltip = "คลินิกปิดทำการ (วันหยุดประจำสัปดาห์)";
    } else if (leave) {
      if (leave.status === "รอการอนุมัติ") {
        cellBg = "bg-yellow-50";
        textColor = "text-yellow-700";
        indicators.push(<div key="pending" className="w-1.5 h-1.5 rounded-full bg-yellow-400 border border-yellow-500"></div>);
        tooltip = `รออนุมัติลา: ${leave.reason} (${leave.leavePeriod})`;
      } else if (leave.status === "อนุมัติแล้ว") {
        if (leave.leavePeriod === "เต็มวัน") {
          cellBg = "bg-red-50";
          textColor = "text-red-700";
          indicators.push(<div key="full" className="w-2 h-2 rounded-full bg-red-500"></div>);
          tooltip = `ลาเต็มวัน: ${leave.reason}`;
        } else if (leave.leavePeriod === "ครึ่งวันเช้า") {
          indicators.push(
            <div key="am" className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
          );
          tooltip = `ลาครึ่งวันเช้า (${leave.reason}) • ทำงานบ่าย`;
          isWorking = true;
        } else if (leave.leavePeriod === "ครึ่งวันบ่าย") {
          indicators.push(
            <div key="pm" className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
            </div>
          );
          tooltip = `ลาครึ่งวันบ่าย (${leave.reason}) • ทำงานเช้า`;
          isWorking = true;
        }
      } else {
         indicators.push(
           <div key="rejected" title="ไม่อนุมัติ" className="w-2 h-2 flex items-center justify-center rounded-full bg-red-100 border border-red-400">
             <div className="w-1 h-1 rounded-full bg-red-500"></div>
           </div>
         );
         tooltip = `ไม่อนุมัติลา: ${leave.reason}`;
         if (baseShift && !baseShift.is_off) isWorking = true;
      }
    } else if (!baseShift || baseShift.is_off) {
      cellBg = "bg-gray-50";
      textColor = "text-gray-400";
      tooltip = "วันหยุดประจำ";
    } else {
      isWorking = true;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const isPast = dateStr < todayStr;
    const isToday = dateStr === todayStr;

    // Is it clickable?
    const isClickable = !isPast && !closure && !isClinicOff && !leave && baseShift && !baseShift.is_off;

    return (
      <div 
        key={day} 
        onClick={() => {
          if (isClickable) {
            setSelectedDate(dateStr);
            setLeaveModalOpen(true);
          }
        }}
        className={`relative min-h-[60px] p-2 border border-gray-100 ${cellBg} transition-all group ${
          isClickable ? 'hover:border-blue-300 hover:shadow-sm cursor-pointer' : 'cursor-default opacity-80'
        }`}
      >
        <div className={`text-sm font-medium ${textColor} ${isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
          {day}
        </div>
        
        <div className="absolute top-2 right-2 flex gap-1">
          {indicators}
        </div>

        {isWorking && !leave && (
          <div className="mt-1 flex flex-col items-center justify-center">
            <span className="text-[10px] text-gray-400 leading-none">{baseShift?.start_time?.substring(0,5)} - {baseShift?.end_time?.substring(0,5)}</span>
          </div>
        )}

        {/* Tooltip on Hover */}
        {tooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
            {tooltip}
          </div>
        )}
      </div>
    );
  };

  const renderLeaveSummary = () => {
    const pending = leaves.filter(l => l.status === "รอการอนุมัติ").length;
    const approved = leaves.filter(l => l.status === "อนุมัติแล้ว").length;
    const rejected = leaves.filter(l => l.status === "ปฏิเสธ").length;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <CalendarIcon size={18} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">สรุปการลางาน (ปีนี้)</h2>
            <p className="text-xs text-gray-500">สถานะคำขอลางานของคุณ</p>
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
    return <div className="flex items-center justify-center h-64 text-gray-400">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div style={{ fontFamily: "Prompt, sans-serif" }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>ปฏิทินและการลางาน</h1>
        <p className="text-sm" style={{ color: "#4A6080" }}>ตรวจสอบตารางทำงานและส่งคำขอลางานได้ที่นี่</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          {renderRegularSchedule()}
        </div>
        <div className="lg:col-span-1">
          {renderLeaveSummary()}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        {/* Calendar Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2">
            <select
              value={currentDate.getMonth()}
              onChange={(e) => setCurrentDate(new Date(currentDate.getFullYear(), Number(e.target.value), 1))}
              className="text-lg font-bold text-gray-800 bg-transparent border-none cursor-pointer focus:ring-0 p-0 pr-6 appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231A365D%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '10px' }}
            >
              {monthNames.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <select
              value={currentDate.getFullYear()}
              onChange={(e) => setCurrentDate(new Date(Number(e.target.value), currentDate.getMonth(), 1))}
              className="text-lg font-bold text-gray-800 bg-transparent border-none cursor-pointer focus:ring-0 p-0 pr-6 appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231A365D%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '10px' }}
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() + i - 1; // From last year to 3 years ahead
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

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-xs">
          <div className="flex items-center gap-1.5 text-gray-600"><div className="w-2 h-2 rounded-full bg-red-500" /> ลาเต็มวัน</div>
          <div className="flex items-center gap-1.5 text-gray-600"><div className="w-2 h-2 rounded-full bg-red-500" /><div className="w-2 h-2 rounded-full bg-green-500" /> ลาครึ่งเช้า</div>
          <div className="flex items-center gap-1.5 text-gray-600"><div className="w-2 h-2 rounded-full bg-green-500" /><div className="w-2 h-2 rounded-full bg-red-500" /> ลาครึ่งบ่าย</div>
          <div className="flex items-center gap-1.5 text-gray-600"><div className="w-2 h-2 rounded-full bg-yellow-400" /> รออนุมัติ</div>
          <div className="flex items-center gap-1.5 text-gray-600"><div className="w-2 h-2 rounded-full bg-orange-500" /> คลินิกปิด</div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-xl overflow-hidden">
          {["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"].map(day => (
            <div key={day} className="bg-gray-50 py-3 text-center text-xs font-semibold text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Empty cells before start of month */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-gray-50 min-h-[60px]" />
          ))}
          
          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => renderCalendarCell(i + 1))}
          
          {/* Empty cells after end of month */}
          {Array.from({ length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7 }).map((_, i) => (
            <div key={`empty-end-${i}`} className="bg-gray-50 min-h-[60px]" />
          ))}
        </div>
      </div>

      {/* Leave Request Modal */}
      {leaveModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-1">ขอลางาน</h3>
            <p className="text-sm text-gray-500 mb-6">วันที่: {new Date(selectedDate).toLocaleDateString('th-TH', { dateStyle: 'long' })}</p>
            
            <form onSubmit={handleAddLeave}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทการลา</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={leaveType === "ลาพักร้อน"} onChange={() => setLeaveType("ลาพักร้อน")} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm">ลาพักร้อน</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={leaveType === "ลาป่วย"} onChange={() => setLeaveType("ลาป่วย")} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm">ลาป่วย</span>
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">ช่วงเวลา</label>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ borderColor: leavePeriod === "เต็มวัน" ? "#3B82F6" : "#E5E7EB", backgroundColor: leavePeriod === "เต็มวัน" ? "#EFF6FF" : "" }}>
                    <div className="flex items-center gap-3">
                      <input type="radio" checked={leavePeriod === "เต็มวัน"} onChange={() => setLeavePeriod("เต็มวัน")} className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">เต็มวัน</p>
                        <p className="text-xs text-gray-500">หยุดตลอดทั้งวัน</p>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ borderColor: leavePeriod === "ครึ่งวันเช้า" ? "#3B82F6" : "#E5E7EB", backgroundColor: leavePeriod === "ครึ่งวันเช้า" ? "#EFF6FF" : "" }}>
                    <div className="flex items-center gap-3">
                      <input type="radio" checked={leavePeriod === "ครึ่งวันเช้า"} onChange={() => setLeavePeriod("ครึ่งวันเช้า")} className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">ครึ่งวันเช้า</p>
                        <p className="text-xs text-gray-500">ทำงานช่วงบ่าย (13:00 - 17:00)</p>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ borderColor: leavePeriod === "ครึ่งวันบ่าย" ? "#3B82F6" : "#E5E7EB", backgroundColor: leavePeriod === "ครึ่งวันบ่าย" ? "#EFF6FF" : "" }}>
                    <div className="flex items-center gap-3">
                      <input type="radio" checked={leavePeriod === "ครึ่งวันบ่าย"} onChange={() => setLeavePeriod("ครึ่งวันบ่าย")} className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">ครึ่งวันบ่าย</p>
                        <p className="text-xs text-gray-500">ทำงานช่วงเช้า (09:00 - 12:00)</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setLeaveModalOpen(false)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                  ยกเลิก
                </button>
                <button type="submit" className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
                  ส่งคำขอ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
