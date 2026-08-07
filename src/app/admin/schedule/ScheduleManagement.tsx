import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, AlertCircle, Plus, Trash2, Clock, MapPin, ChevronLeft, ChevronRight, X, Search, ChevronUp, ChevronDown } from "lucide-react";
import { DentistInfo, StaffInfo, Shift, SpecialClosure, LeaveRequest } from "../../shared/data";
import { 
  getDentists, getStaff, getShifts, updateShift, 
  getClinicClosures, addClinicClosure, deleteClinicClosure, 
  getClinicRooms, updateClinicRooms, updateDentistRoom, 
  getLeaveRequests 
} from "../../shared/supabaseApi";

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const DAY_TH = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

const DAY_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  0: { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B" },
  1: { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B" },
  2: { bg: "#D1FAE5", text: "#065F46", border: "#34D399" },
  3: { bg: "#DBEAFE", text: "#1E40AF", border: "#60A5FA" },
  4: { bg: "#EDE9FE", text: "#5B21B6", border: "#8B5CF6" },
  5: { bg: "#E0E7FF", text: "#3730A3", border: "#818CF8" },
  6: { bg: "#FFE4E6", text: "#9F1239", border: "#FB7185" },
};

function getStaffRoom(): string {
  return 'เคาน์เตอร์ต้อนรับ';
}

export default function ScheduleManagement() {
  const [dentists, setDentists] = useState<DentistInfo[]>([]);
  const [staffList, setStaffList] = useState<StaffInfo[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [closures, setClosures] = useState<SpecialClosure[]>([]);
  const [clinicRooms, setClinicRooms] = useState<string[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarFilter, setCalendarFilter] = useState<'all' | 'dentist' | 'staff'>('all');

  // Weekly Template State
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateFilter, setTemplateFilter] = useState<'all' | 'dentist' | 'staff'>('all');
  const [isTemplateCollapsed, setIsTemplateCollapsed] = useState(false);

  // Modals
  const [newClosure, setNewClosure] = useState({ date: "", reason: "" });
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [selectedDayInfo, setSelectedDayInfo] = useState<{ dateObj: Date; dateStr: string } | null>(null);
  
  // Shift Edit Modal
  const [editingShift, setEditingShift] = useState<{ shift: Shift | undefined, personId: number, personType: string, personName: string, dayNum: number } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dData, sData, shData, cData, rData, lData] = await Promise.all([
        getDentists(),
        getStaff(),
        getShifts(),
        getClinicClosures(),
        getClinicRooms(),
        getLeaveRequests()
      ]);
      setDentists(dData);
      setStaffList(sData);
      setShifts(shData);
      setClosures(cData);
      setClinicRooms(rData);
      setLeaves(lData.filter(l => l.status === "อนุมัติแล้ว"));
    } catch (err) {
      console.error("Error fetching schedule data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShiftChange = async (shiftId: number | undefined, field: 'start_time' | 'end_time' | 'is_off', value: any) => {
    if (!shiftId) return;
    const dbValue = (value === "") ? null : value;
    try {
      const updated = await updateShift(shiftId, { [field]: dbValue });
      setShifts(shifts.map(s => s.id === updated.id ? updated : s));
      
      // Update editing shift state so UI reflects changes immediately
      if (editingShift && editingShift.shift && editingShift.shift.id === updated.id) {
        setEditingShift({ ...editingShift, shift: updated });
      }
    } catch (err) {
      console.error("Error updating shift", err);
      alert("ไม่สามารถอัปเดตตารางเวรได้");
    }
  };

  const handleAddClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClosure.date || !newClosure.reason) return;
    try {
      const added = await addClinicClosure(newClosure);
      setClosures([...closures, added].sort((a, b) => a.date.localeCompare(b.date)));
      setNewClosure({ date: "", reason: "" });
    } catch (err) {
      console.error("Error adding closure", err);
    }
  };

  const handleDeleteClosure = async (id?: number) => {
    if (!id) return;
    if (!confirm("คุณต้องการลบวันหยุดพิเศษนี้?")) return;
    try {
      await deleteClinicClosure(id);
      setClosures(closures.filter(c => c.id !== id));
    } catch (err) {
      console.error("Error deleting closure", err);
    }
  };

  const handleAddRoom = async () => {
    if (!newRoomName.trim()) return;
    try {
      const updatedRooms = [...clinicRooms, newRoomName.trim()];
      await updateClinicRooms(updatedRooms);
      setClinicRooms(updatedRooms);
      setNewRoomName("");
    } catch (err) {
      console.error("Error adding room", err);
      alert("ไม่สามารถเพิ่มห้องตรวจได้");
    }
  };

  const handleDeleteRoom = async (roomToDelete: string) => {
    if (!confirm(`คุณต้องการลบ ${roomToDelete} ออกจากระบบ?`)) return;
    try {
      const updatedRooms = clinicRooms.filter(r => r !== roomToDelete);
      await updateClinicRooms(updatedRooms);
      setClinicRooms(updatedRooms);
    } catch (err) {
      console.error("Error deleting room", err);
    }
  };

  const allPersons = [
    ...dentists.map(d => ({ id: d.id, name: d.name, type: 'dentist' as const, userId: d.userId, color: '#FF8C9A' })),
    ...staffList.map(s => ({ id: s.id, name: s.name, type: 'staff' as const, userId: (s as any).userId, color: '#1A365D' })),
  ];

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">กำลังโหลดตารางเวร...</div>;
  }

  // Helper to get daily data
  const getDailyData = (dateObj: Date) => {
    const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
    const dayOfWeek = dateObj.getDay();
    const isClosed = closures.find(c => c.date === dateStr);

    let working: any[] = [];
    let onLeave: any[] = [];
    let offDuty: any[] = [];

    if (isClosed) {
      return { isClosed, working, onLeave, offDuty, dateStr };
    }

    allPersons.forEach(person => {
      const shift = shifts.find(s => s.person_id === person.id && s.person_type === person.type && s.day_of_week === dayOfWeek);
      if (!shift || shift.is_off) {
        offDuty.push(person);
      } else {
        const leave = person.userId ? leaves.find(l => l.doctorId === person.userId && l.startDate === dateStr) : null;
        if (leave) {
          onLeave.push({ ...person, leave, shift });
        } else {
          working.push({ ...person, shift });
        }
      }
    });

    return { isClosed, working, onLeave, offDuty, dateStr };
  };

  return (
    <div style={{ fontFamily: "Prompt, sans-serif" }} className="pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>จัดการตารางเวร (ศูนย์บัญชาการ)</h1>
            <button
              onClick={() => setShowRoomModal(true)}
              className="text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1 hover:bg-gray-50 transition-colors bg-white"
              style={{ color: "#4A6080", borderColor: "#E2E8F0" }}
            >
              <MapPin size={12} /> จัดการห้องตรวจ
            </button>
          </div>
          <p className="text-sm mt-1" style={{ color: "#4A6080" }}>กำหนดเวรประจำ และตรวจสอบการเข้างานจริงรายวัน</p>
        </div>
      </div>

      {/* ─── SECTION 1: Weekly Template (Matrix) ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#1A365D] flex items-center gap-2">
              <CalendarIcon size={18} /> ตารางเวรประจำสัปดาห์ (Weekly Template)
            </h2>
            <p className="text-xs text-gray-500 mt-1">คลิกที่ช่วงเวลาเพื่อแก้ไขเวลาหรือตั้งเป็นวันหยุด</p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="ค้นหาชื่อ..." 
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all w-40 md:w-48"
              />
            </div>
            
            <div className="flex bg-gray-200/50 p-1 rounded-lg">
              <button 
                onClick={() => setTemplateFilter('all')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${templateFilter === 'all' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                ทั้งหมด
              </button>
              <button 
                onClick={() => setTemplateFilter('dentist')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${templateFilter === 'dentist' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                ทันตแพทย์
              </button>
              <button 
                onClick={() => setTemplateFilter('staff')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${templateFilter === 'staff' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                พนักงาน
              </button>
            </div>
            
            <button 
              onClick={() => setIsTemplateCollapsed(!isTemplateCollapsed)}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors bg-white"
              title={isTemplateCollapsed ? "ขยาย" : "ย่อ"}
            >
              {isTemplateCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>
        </div>
        
        {!isTemplateCollapsed && (
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 z-10 shadow-sm">
                <tr className="border-b bg-white">
                  <th className="p-3 font-semibold text-gray-600 border-r min-w-[200px]">บุคลากร</th>
                  {DAY_TH.map((d, i) => (
                    <th key={i} className="p-3 font-semibold text-center min-w-[100px]" style={{ color: DAY_COLORS[i].text, backgroundColor: DAY_COLORS[i].bg }}>
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allPersons
                  .filter(p => templateFilter === 'all' || p.type === templateFilter)
                  .filter(p => p.name.toLowerCase().includes(templateSearch.toLowerCase()))
                  .map(person => (
                <tr key={`${person.type}-${person.id}`} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="p-3 border-r">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: person.color }}>
                        {person.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{person.name}</p>
                        <p className="text-[10px] text-gray-400">{person.type === 'dentist' ? 'ทันตแพทย์' : 'พนักงาน'}</p>
                      </div>
                    </div>
                  </td>
                  {DAY_LABELS.map((_, dayIndex) => {
                    const shift = shifts.find(s => s.person_id === person.id && s.person_type === person.type && s.day_of_week === dayIndex);
                    const isWorking = shift && !shift.is_off;
                    return (
                      <td key={dayIndex} className="p-2 text-center border-r last:border-0">
                        <button 
                          onClick={() => setEditingShift({ shift, personId: person.id, personType: person.type, personName: person.name, dayNum: dayIndex })}
                          className={`w-full py-2 rounded-lg text-xs font-medium transition-colors hover:ring-2 ring-gray-200 ${isWorking ? 'bg-blue-50 text-blue-700' : 'bg-gray-100/50 text-gray-400'}`}
                        >
                          {isWorking ? `${shift.start_time?.substring(0,5) || '--:--'} - ${shift.end_time?.substring(0,5) || '--:--'}` : 'หยุด'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── SECTION 2: Actual Calendar ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#1A365D] flex items-center gap-2">
              <CalendarIcon size={18} /> ปฏิทินปฏิบัติงานจริง (Actual Calendar)
            </h2>
            <p className="text-xs text-gray-500 mt-1">แสดงผู้ที่มาทำงานจริงในแต่ละวัน (หักผู้ที่ลางานออกแล้ว)</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {/* Filter Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setCalendarFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${calendarFilter === 'all' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                ทั้งหมด
              </button>
              <button 
                onClick={() => setCalendarFilter('dentist')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${calendarFilter === 'dentist' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                ทันตแพทย์
              </button>
              <button 
                onClick={() => setCalendarFilter('staff')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${calendarFilter === 'staff' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                พนักงาน
              </button>
            </div>

            {/* Month Nav */}
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-full"><ChevronLeft size={20} /></button>
              <span className="font-bold text-sm min-w-[120px] text-center">
                {currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-full"><ChevronRight size={20} /></button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden">
          {DAY_TH.map((d, i) => (
            <div key={i} className="bg-gray-50 p-2 text-center text-xs font-bold text-gray-500">{d}</div>
          ))}
          
          {/* Empty cells for start of month */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-white p-2 min-h-[100px]" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const date = i + 1;
            const dateObj = new Date(year, month, date);
            const dailyData = getDailyData(dateObj);
            const isClosed = dailyData.isClosed;
            const working = calendarFilter === 'all' ? dailyData.working : dailyData.working.filter(w => w.type === calendarFilter);
            const onLeave = calendarFilter === 'all' ? dailyData.onLeave : dailyData.onLeave.filter(l => l.type === calendarFilter);
            const isToday = dateObj.toDateString() === new Date().toDateString();

            return (
              <div 
                key={date} 
                onClick={() => setSelectedDayInfo({ dateObj, dateStr: getDailyData(dateObj).dateStr })}
                className={`bg-white p-2 min-h-[120px] cursor-pointer hover:bg-blue-50/30 transition-colors relative group flex flex-col ${isToday ? 'ring-2 ring-inset ring-blue-400' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-500 text-white' : 'text-gray-700'}`}>
                    {date}
                  </span>
                  {isClosed && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-medium truncate max-w-[80px]" title={isClosed.reason}>
                      หยุด
                    </span>
                  )}
                </div>

                {!isClosed && (
                  <div className="flex flex-col gap-2 flex-1 justify-center items-center">
                    {/* Working Avatars (Stack) */}
                    {working.length > 0 && (
                      <div className="flex -space-x-2 overflow-hidden px-1 py-1">
                        {working.slice(0, 4).map((w, idx) => (
                          <div key={idx} className="inline-block w-8 h-8 rounded-full ring-2 ring-white flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{ backgroundColor: w.color }} title={w.name}>
                            {w.name[0]}
                          </div>
                        ))}
                        {working.length > 4 && (
                          <div className="inline-block w-8 h-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-gray-600 text-[10px] font-bold shadow-sm">
                            +{working.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Leave Indicators */}
                    {onLeave.length > 0 && (
                      <div className="text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 truncate w-fit mx-auto mt-1">
                        ลา {onLeave.length} คน
                      </div>
                    )}

                    {working.length === 0 && onLeave.length === 0 && (
                       <div className="text-[10px] text-gray-400">ไม่มีเวร</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── SECTION 3: Special Closures (Existing) ─── */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold mb-4" style={{ color: "#1A365D" }}>วันหยุดพิเศษ (Clinic Closures)</h2>
        <form onSubmit={handleAddClosure} className="flex gap-3 mb-6 items-end bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div>
            <label className="block text-xs text-gray-500 mb-1">วันที่หยุด</label>
            <input type="date" required value={newClosure.date} onChange={e => setNewClosure({...newClosure, date: e.target.value})} className="px-3 py-2 text-sm border rounded-lg" />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">สาเหตุการหยุด / ชื่อเทศกาล</label>
            <input type="text" required value={newClosure.reason} onChange={e => setNewClosure({...newClosure, reason: e.target.value})} placeholder="เช่น วันปีใหม่" className="w-full px-3 py-2 text-sm border rounded-lg" />
          </div>
          <button type="submit" className="px-4 py-2 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 bg-[#1A365D]">
            <Plus size={16} /> เพิ่ม
          </button>
        </form>

        <div className="space-y-2">
          {closures.length === 0 ? <p className="text-sm text-gray-500">ไม่มีวันหยุดพิเศษที่ตั้งไว้</p> : closures.map(c => (
            <div key={c.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-orange-50">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-900">{c.reason}</p>
                  <p className="text-xs mt-0.5 text-orange-700">
                    {new Date(c.date).toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
              <button onClick={() => handleDeleteClosure(c.id)} className="text-red-400 hover:text-red-600 p-2">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ─── MODALS ─── */}

      {/* 1. Daily Detail Modal */}
      {selectedDayInfo && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-[#1A365D]">
                รายชื่อบุคลากรประจำวันที่ {selectedDayInfo.dateObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
              <button onClick={() => setSelectedDayInfo(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {(() => {
                const data = getDailyData(selectedDayInfo.dateObj);
                const working = calendarFilter === 'all' ? data.working : data.working.filter(w => w.type === calendarFilter);
                const onLeave = calendarFilter === 'all' ? data.onLeave : data.onLeave.filter(l => l.type === calendarFilter);

                if (data.isClosed) {
                  return (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-500 mb-3"><AlertCircle size={24} /></div>
                      <p className="font-bold text-red-700 text-lg">คลินิกหยุดทำการ</p>
                      <p className="text-gray-600 mt-1">{data.isClosed.reason}</p>
                    </div>
                  );
                }

                return (
                  <>
                    {/* Working */}
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        ปฏิบัติงานวันนี้ ({working.length} คน)
                      </h4>
                      {working.length === 0 ? (
                        <p className="text-sm text-gray-500 italic ml-4">ไม่มีผู้ปฏิบัติงาน</p>
                      ) : (
                        <div className="space-y-2">
                          {working.map((w, i) => (
                            <div key={i} className="flex items-center justify-between bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: w.color }}>
                                  {w.name[0]}
                                </div>
                                <div>
                                  <p className="font-medium text-sm text-gray-800">{w.name}</p>
                                  <p className="text-[10px] text-gray-500">{w.type === 'dentist' ? 'ทันตแพทย์' : 'พนักงาน'}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-gray-700">{w.shift.start_time?.substring(0,5)} - {w.shift.end_time?.substring(0,5)} น.</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* On Leave */}
                    {onLeave.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                          ลางาน ({onLeave.length} คน)
                        </h4>
                        <div className="space-y-2">
                          {onLeave.map((w, i) => (
                            <div key={i} className="flex items-center justify-between bg-orange-50 border border-orange-100 p-3 rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-70" style={{ backgroundColor: w.color }}>
                                  {w.name[0]}
                                </div>
                                <div>
                                  <p className="font-medium text-sm text-gray-800 line-through decoration-gray-400">{w.name}</p>
                                  <p className="text-[10px] text-orange-600 font-medium">ลา: {w.leave.leaveType} ({w.leave.leavePeriod})</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit Shift Modal */}
      {editingShift && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#1A365D]">แก้ไขเวลาทำงาน</h3>
              <button onClick={() => setEditingShift(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <div className="mb-6">
              <p className="font-medium text-gray-800">{editingShift.personName}</p>
              <p className="text-sm text-gray-500">วัน{DAY_TH[editingShift.dayNum]}</p>
            </div>

            {!editingShift.shift ? (
               <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-4">ไม่พบข้อมูลเวรในระบบฐานข้อมูล</p>
               </div>
            ) : editingShift.shift.is_off ? (
              <div className="text-center py-4">
                <p className="text-gray-600 font-medium mb-4">ปัจจุบันตั้งเป็นวันหยุด</p>
                <button 
                  onClick={() => handleShiftChange(editingShift.shift!.id, 'is_off', false)}
                  className="w-full py-2.5 bg-blue-100 text-blue-700 font-bold rounded-xl hover:bg-blue-200 transition-colors"
                >
                  เปลี่ยนเป็นทำงาน
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={editingShift.shift.start_time?.substring(0,5) || ''}
                    onChange={e => handleShiftChange(editingShift.shift!.id, 'start_time', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-xl text-center focus:outline-none focus:ring-2 ring-blue-100"
                  />
                  <span className="text-gray-400">ถึง</span>
                  <input
                    type="time"
                    value={editingShift.shift.end_time?.substring(0,5) || ''}
                    onChange={e => handleShiftChange(editingShift.shift!.id, 'end_time', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-xl text-center focus:outline-none focus:ring-2 ring-blue-100"
                  />
                </div>
                <div className="pt-4 border-t">
                  <button 
                    onClick={() => handleShiftChange(editingShift.shift!.id, 'is_off', true)}
                    className="w-full py-2.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors"
                  >
                    ตั้งเป็นหยุด
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Room Management Modal (Existing) */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold" style={{ color: "#1A365D" }}>จัดการห้องตรวจ</h3>
              <button onClick={() => setShowRoomModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {clinicRooms.map(r => (
                <div key={r} className="flex justify-between items-center p-3 rounded-lg border bg-gray-50">
                  <span className="font-medium text-sm" style={{ color: "#1A365D" }}>{r}</span>
                  <button onClick={() => handleDeleteRoom(r)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t flex gap-2">
              <input type="text" placeholder="ชื่อห้องใหม่" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border text-sm" />
              <button onClick={handleAddRoom} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">เพิ่ม</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
