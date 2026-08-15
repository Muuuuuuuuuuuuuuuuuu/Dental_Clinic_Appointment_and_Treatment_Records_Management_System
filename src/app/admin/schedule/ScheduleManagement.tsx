import React, { useState, useEffect } from "react";
import { Plus, Search, Calendar as CalendarIcon, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X, AlertCircle, Trash2, Pencil, Check, Settings, History } from "lucide-react";
import { DentistInfo, StaffInfo, Shift, SpecialClosure, LeaveRequest } from "../../shared/data";
import { 
  getDentists, getStaff, getShifts, updateShift, 
  getClinicClosures, addClinicClosure, deleteClinicClosure, 
  getLeaveRequests, getWeeklyOffDays, deleteAnnouncement 
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

export default function ScheduleManagement({ onNavigateToSettings }: { onNavigateToSettings?: () => void }) {
  const [dentists, setDentists] = useState<DentistInfo[]>([]);
  const [staffList, setStaffList] = useState<StaffInfo[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [closures, setClosures] = useState<SpecialClosure[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingChanges, setPendingChanges] = useState<Record<number, Partial<Shift>>>({});
  const [closureDay, setClosureDay] = useState("");
  const [closureMonth, setClosureMonth] = useState("");
  const [closureYear, setClosureYear] = useState("");
  const [endDay, setEndDay] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [endYear, setEndYear] = useState("");
  const [closureError, setClosureError] = useState("");
  const [closureSuccess, setClosureSuccess] = useState("");
  const [autoAnnounce, setAutoAnnounce] = useState(true);
  const [editingClosure, setEditingClosure] = useState<{ id: number; reason: string } | null>(null);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarFilter, setCalendarFilter] = useState<'all' | 'dentist' | 'staff'>('all');

  // Weekly Template State
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateFilter, setTemplateFilter] = useState<'all' | 'dentist' | 'staff'>('all');
  const [isTemplateCollapsed, setIsTemplateCollapsed] = useState(false);

  // Modals
  const [newClosure, setNewClosure] = useState({ date: "", reason: "" });
  const [selectedDayInfo, setSelectedDayInfo] = useState<{ dateObj: Date; dateStr: string } | null>(null);
  
  // Shift Edit Modal
  const [editingShift, setEditingShift] = useState<{ shift: Shift | undefined, personId: number, personType: string, personName: string, dayNum: number } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ds, ss, sh, cl, lv, offDays] = await Promise.all([
        getDentists(),
        getStaff(),
        getShifts(),
        getClinicClosures(),
        getLeaveRequests(),
        getWeeklyOffDays()
      ]);
      setDentists(ds);
      setStaffList(ss);
      setShifts(sh);
      setClosures(cl.sort((a, b) => a.date.localeCompare(b.date)));
      setLeaves(lv.filter(l => l.status === 'อนุมัติแล้ว'));
      setWeeklyOffDays(offDays);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShiftChange = (shiftId: number | undefined, field: 'start_time' | 'end_time' | 'is_off', value: any) => {
    if (!shiftId) return;
    const dbValue = (value === "") ? null : value;
    
    // Update local state for UI
    setShifts(shifts.map(s => {
      if (s.id === shiftId) {
        return { ...s, [field]: dbValue };
      }
      return s;
    }));

    // Add to pending changes
    setPendingChanges(prev => ({
      ...prev,
      [shiftId]: {
         ...prev[shiftId],
         [field]: dbValue
      }
    }));
      
    // Update editing shift state so UI reflects changes immediately
    if (editingShift && editingShift.shift && editingShift.shift.id === shiftId) {
      setEditingShift({ ...editingShift, shift: { ...editingShift.shift, [field]: dbValue } });
    }
  };

  const handleSave = async () => {
    const shiftIds = Object.keys(pendingChanges);
    if (shiftIds.length === 0) return;

    if (!confirm("คุณต้องการบันทึกการเปลี่ยนแปลงตารางเวรใช่หรือไม่?")) return;

    try {
      const { updateShift } = await import('../../shared/supabaseApi');
      for (const idStr of shiftIds) {
        const id = parseInt(idStr);
        await updateShift(id, pendingChanges[id]);
      }
      setPendingChanges({});
      fetchData();
    } catch (err) {
      console.error("Error saving shifts", err);
      alert("เกิดข้อผิดพลาดในการบันทึกตารางเวร");
    }
  };

  const handleUpdateClosure = async (id: number, newReason: string) => {
    if (!newReason.trim()) return;
    try {
      const { error } = await (await import('../../shared/supabaseApi')).supabase
        .from('clinic_holiday')
        .update({ holiday_name: newReason.trim() })
        .eq('holiday_id', id);
      if (error) throw error;
      setClosures(prev => prev.map(c => c.id === id ? { ...c, reason: newReason.trim() } : c));
      setEditingClosure(null);
    } catch (err: any) {
      alert('เกิดข้อผิดพลาด: ' + (err?.message || err));
    }
  };

  const handleCreateMissingAnnouncement = async (c: SpecialClosure) => {
    if (!confirm(`คุณต้องการสร้างประกาศหน้าเว็บสำหรับ "${c.reason}" ใช่หรือไม่?`)) return;
    try {
      const { addAnnouncement, linkAnnouncementToHoliday } = await import('../../shared/supabaseApi');
      const dateObj = new Date(c.date + 'T00:00:00');
      const dStr = dateObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
      const newAnn = await addAnnouncement({
        title: `แจ้งวันหยุดคลินิก: ${c.reason}`,
        content: `ทางคลินิกขอแจ้งให้ทราบว่า คลินิกจะหยุดทำการในวันที่ ${dStr} เนื่องในโอกาส ${c.reason} และจะเปิดให้บริการตามปกติต่อไป ขออภัยในความไม่สะดวกครับ`,
        target: 'public',
        isActive: true,
        expiresAt: c.date
      });
      await linkAnnouncementToHoliday(c.id!, newAnn.id);
      setClosures(prev => prev.map(cl => cl.id === c.id ? { ...cl, linkedAnnouncementId: newAnn.id } : cl));
      alert("สร้างประกาศและเชื่อมต่อเรียบร้อยแล้ว!");
    } catch (err: any) {
      alert("เกิดข้อผิดพลาด: " + err?.message);
    }
  };

  const handleAddClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    setClosureError("");
    setClosureSuccess("");

    if (!closureDay || !closureMonth || !closureYear || !newClosure.reason) {
      setClosureError("กรุณากรอกข้อมูลวันที่เริ่มต้น และสาเหตุให้ครบถ้วน");
      return;
    }

    const startD = parseInt(closureDay);
    const startM = parseInt(closureMonth);
    const startY = parseInt(closureYear);
    
    // Check if end date is provided, else default to start date
    const isRange = !!(endDay || endMonth || endYear);
    const endD = isRange && endDay ? parseInt(endDay) : startD;
    const endM = isRange && endMonth ? parseInt(endMonth) : startM;
    const endY = isRange && endYear ? parseInt(endYear) : startY;

    if (isNaN(startD) || isNaN(startM) || isNaN(startY) || isNaN(endD) || isNaN(endM) || isNaN(endY)) {
      setClosureError("กรุณาระบุวันที่เป็นตัวเลขที่ถูกต้อง");
      return;
    }
    
    const startDate = new Date(startY, startM - 1, startD);
    const endDate = new Date(endY, endM - 1, endD);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startY < 2024 || endY < 2024) {
      setClosureError("วันที่ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
      return;
    }

    if (endDate < startDate) {
      setClosureError("วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น");
      return;
    }

    // Generate list of dates
    const datesToClose: string[] = [];
    const currentDateIter = new Date(startDate);
    while (currentDateIter <= endDate) {
      const y = currentDateIter.getFullYear();
      const m = currentDateIter.getMonth() + 1;
      const d = currentDateIter.getDate();
      const isoDate = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (closures.find(c => c.date === isoDate)) {
        setClosureError(`วันที่ ${d}/${m}/${y} มีในระบบแล้ว กรุณาเลี่ยงวันที่ซ้ำ`);
        return;
      }
      datesToClose.push(isoDate);
      currentDateIter.setDate(currentDateIter.getDate() + 1);
    }

    try {
      let linkedAnnouncementId: number | undefined;

      // 1. Auto Create Announcement if checked
      if (autoAnnounce) {
        const { addAnnouncement } = await import('../../shared/supabaseApi');
        const thMonths = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
        const startStr = `${startD} ${thMonths[startM-1]} ${startY+543}`;
        const endStr = `${endD} ${thMonths[endM-1]} ${endY+543}`;
        const dateDesc = datesToClose.length > 1 ? `ตั้งแต่วันที่ ${startStr} ถึงวันที่ ${endStr}` : `ในวันที่ ${startStr}`;
        const lastDate = datesToClose[datesToClose.length - 1];
        const newAnn = await addAnnouncement({
          title: `แจ้งวันหยุดคลินิก: ${newClosure.reason}`,
          content: `ทางคลินิกขอแจ้งให้ทราบว่า คลินิกจะหยุดทำการ${dateDesc} เนื่องในโอกาส ${newClosure.reason} และจะเปิดให้บริการตามปกติต่อไป ขออภัยในความไม่สะดวกครับ`,
          target: 'public',
          isActive: true,
          expiresAt: lastDate
        });
        linkedAnnouncementId = newAnn.id;
      }

      // 2. Create Clinic Closures
      const newClosures: SpecialClosure[] = [];
      for (const iso of datesToClose) {
        const added = await addClinicClosure({ 
          date: iso, 
          reason: newClosure.reason,
          linkedAnnouncementId 
        });
        newClosures.push(added);
      }

      setClosures(prev => [...prev, ...newClosures].sort((a, b) => a.date.localeCompare(b.date)));
      setNewClosure({ date: "", reason: "" });
      setClosureDay(""); setClosureMonth(""); setClosureYear("");
      setEndDay(""); setEndMonth(""); setEndYear("");
      setClosureSuccess(`เพิ่มวันหยุด ${datesToClose.length} วัน เรียบร้อยแล้ว`);
      setTimeout(() => setClosureSuccess(""), 10000);
    } catch (err: any) {
      console.error("Error adding closure", err);
      setClosureError("เกิดข้อผิดพลาด: " + (err?.message || JSON.stringify(err)));
    }
  };

  const handleDeleteClosure = async (id?: number) => {
    if (!id) return;
    const closureToDelete = closures.find(c => c.id === id);
    if (!closureToDelete) return;
    
    if (!confirm("คุณต้องการลบวันหยุดพิเศษนี้?")) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const isFuture = closureToDelete.date >= today;
      
      // If it's a future holiday and has a linked announcement, offer to delete it
      if (isFuture && closureToDelete.linkedAnnouncementId) {
        if (confirm("วันหยุดนี้มีประกาศแจ้งคนไข้บนหน้าเว็บ คุณต้องการลบประกาศที่เกี่ยวข้องทิ้งด้วยเลยหรือไม่?")) {
          await deleteAnnouncement(closureToDelete.linkedAnnouncementId).catch(err => {
            console.error("Failed to delete announcement", err);
            alert("ลบประกาศไม่สำเร็จ แต่ระบบจะดำเนินการลบวันหยุดต่อไป");
          });
        }
      }

      await deleteClinicClosure(id);
      setClosures(closures.filter(c => c.id !== id));
    } catch (err) {
      console.error("Error deleting closure", err);
    }
  };

  const handleAdminToggleLeave = async (personId: number, personUserId: string, dateStr: string) => {
    if (!personUserId) {
      alert("ไม่สามารถกำหนดวันหยุดเฉพาะวันได้ เนื่องจากบุคลากรไม่มีข้อมูล User ID");
      return;
    }
    
    if (!confirm(`คุณต้องการกำหนดให้บุคลากรท่านนี้หยุดงานในวันที่ ${dateStr} ใช่หรือไม่?`)) return;
    
    try {
      // Create leave request directly
      const { addLeaveRequest, updateLeaveStatus } = await import('../../shared/supabaseApi');
      const req = await addLeaveRequest({
        doctorId: personUserId,
        startDate: dateStr,
        endDate: dateStr,
        leavePeriod: 'เต็มวัน',
        reason: 'แอดมินกำหนดวันหยุดเฉพาะกิจ',
        status: 'รอการอนุมัติ'
      });
      // Auto approve
      await updateLeaveStatus(req.leave_id, 'อนุมัติแล้ว');
      fetchData(); // reload
    } catch (err: any) {
      console.error(err);
      alert(err.message || "เกิดข้อผิดพลาดในการกำหนดวันหยุด");
    }
  };

  const handleAdminCancelLeave = async (leaveId: number) => {
    if (!confirm("คุณต้องการยกเลิกการลานี้ และให้กลับมาทำงานตามปกติใช่หรือไม่?")) return;
    try {
      const { updateLeaveStatus } = await import('../../shared/supabaseApi');
      await updateLeaveStatus(leaveId, 'ปฏิเสธ');
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "เกิดข้อผิดพลาด");
    }
  };

  const allPersons = [
    ...dentists.map(d => ({ id: d.id, name: d.name, type: 'dentist' as const, userId: d.userId, color: '#FF8C9A' })),
    ...staffList.map(s => ({ id: s.id, name: s.name, type: 'staff' as const, userId: (s as any).userId, color: '#1A365D' })),
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">กำลังโหลดตารางเวร...</div>;
  }

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
            {onNavigateToSettings && (
              <button
                onClick={onNavigateToSettings}
                className="text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1 hover:bg-gray-50 transition-colors bg-white shadow-sm"
                style={{ color: "#1A365D", borderColor: "#E2E8F0" }}
              >
                <Settings size={12} /> ตั้งค่าคลินิก
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={Object.keys(pendingChanges).length === 0}
              className={`text-xs px-4 py-1.5 rounded-lg font-medium transition-colors shadow-sm ${Object.keys(pendingChanges).length > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              บันทึกการเปลี่ยนแปลง
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
                  {DAY_TH.map((d, i) => !weeklyOffDays.includes(i) && (
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
                    if (weeklyOffDays.includes(dayIndex)) return null;
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

            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-full"><ChevronLeft size={20} /></button>
              <span className="font-bold text-sm min-w-[120px] text-center">
                {currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-full"><ChevronRight size={20} /></button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden">
          {DAY_TH.map((d, i) => (
            <div key={i} className="bg-gray-50 p-2 text-center text-xs font-bold text-gray-500">{d}</div>
          ))}
          
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-white p-2 min-h-[100px]" />
          ))}

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

      {/* ─── SECTION 3: Special Closures ─── */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-bold text-[#1A365D] mb-6 flex items-center gap-2">
          <CalendarIcon size={18} /> จัดการวันหยุดพิเศษ (Special Closures)
        </h2>
        
        {closureError && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{'❌ ' + closureError}</div>}
        
        <form onSubmit={handleAddClosure} className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-sm mb-3 text-gray-700">เพิ่มวันหยุดพิเศษ</h3>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">วันที่เริ่มต้น (DD/MM/YYYY)</label>
              <div className="flex gap-2">
                <input type="text" placeholder="DD" value={closureDay} onChange={e => setClosureDay(e.target.value)} maxLength={2} className="w-16 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ring-blue-100 text-center" />
                <span className="text-gray-400 py-2">/</span>
                <input type="text" placeholder="MM" value={closureMonth} onChange={e => setClosureMonth(e.target.value)} maxLength={2} className="w-16 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ring-blue-100 text-center" />
                <span className="text-gray-400 py-2">/</span>
                <input type="text" placeholder="YYYY" value={closureYear} onChange={e => setClosureYear(e.target.value)} maxLength={4} className="w-24 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ring-blue-100 text-center" />
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">วันที่สิ้นสุด (ไม่บังคับ)</label>
              <div className="flex gap-2">
                <input type="text" placeholder="DD" value={endDay} onChange={e => setEndDay(e.target.value)} maxLength={2} className="w-16 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ring-blue-100 text-center" />
                <span className="text-gray-400 py-2">/</span>
                <input type="text" placeholder="MM" value={endMonth} onChange={e => setEndMonth(e.target.value)} maxLength={2} className="w-16 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ring-blue-100 text-center" />
                <span className="text-gray-400 py-2">/</span>
                <input type="text" placeholder="YYYY" value={endYear} onChange={e => setEndYear(e.target.value)} maxLength={4} className="w-24 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ring-blue-100 text-center" />
              </div>
            </div>

            <div className="flex-[2]">
              <label className="block text-xs text-gray-500 mb-1">สาเหตุการหยุด</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newClosure.reason}
                  onChange={e => setNewClosure({ ...newClosure, reason: e.target.value })}
                  placeholder="เช่น วันปีใหม่"
                  className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ring-blue-100"
                />
                <button type="submit" className="px-5 py-2 bg-[#1A365D] text-white text-sm font-bold rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap">
                  + เพิ่ม
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-3 flex items-center gap-2">
            <input 
              type="checkbox" 
              id="autoAnnounce" 
              checked={autoAnnounce}
              onChange={(e) => setAutoAnnounce(e.target.checked)}
              className="rounded text-[#1A365D] focus:ring-[#1A365D]"
            />
            <label htmlFor="autoAnnounce" className="text-sm text-gray-700 cursor-pointer font-medium">สร้างประกาศแจ้งคนไข้หน้าเว็บอัตโนมัติ (แนะนำ)</label>
          </div>
          
          {closureSuccess && (
            <div className="mt-4 animate-fade-in">
              <div className="flex items-center justify-between text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                <span>✓ {closureSuccess}</span>
                {autoAnnounce && (
                  <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('navigate-admin', { detail: 'clinic-hub' }))} className="text-xs font-bold underline text-green-800 hover:text-green-900 flex-shrink-0">
                    ไปจัดการประกาศต่อ ➔
                  </button>
                )}
              </div>
            </div>
          )}
        </form>

        <div className="space-y-2">
          {closures.length === 0 ? <p className="text-sm text-gray-500">ไม่มีวันหยุดพิเศษที่ตั้งไว้</p> : closures.map(c => (
            <div key={c.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-orange-50">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  {editingClosure?.id === c.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={editingClosure.reason}
                        onChange={e => setEditingClosure({ ...editingClosure, reason: e.target.value })}
                        onKeyDown={e => { if (e.key === 'Enter') handleUpdateClosure(c.id!, editingClosure.reason); if (e.key === 'Escape') setEditingClosure(null); }}
                        className="flex-1 px-2 py-1 text-sm border border-orange-300 rounded-lg focus:outline-none focus:ring-2 ring-orange-200 bg-white"
                      />
                      <button onClick={() => handleUpdateClosure(c.id!, editingClosure.reason)} className="text-green-600 hover:text-green-800 p-1">
                        <Check size={15} />
                      </button>
                      <button onClick={() => setEditingClosure(null)} className="text-gray-400 hover:text-gray-600 p-1">
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-orange-900 truncate">{c.reason}</p>
                  )}
                  <p className="text-xs mt-0.5 text-orange-700">
                    {new Date(c.date + 'T00:00:00').toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  {!c.linkedAnnouncementId && (
                    <div className="mt-2 flex items-center gap-2 bg-yellow-100/50 p-2 rounded-lg border border-yellow-200 inline-flex">
                      <span className="text-[10px] text-yellow-800 font-medium">⚠️ ยังไม่ได้ประกาศแจ้งคนไข้</span>
                      <button 
                        onClick={() => handleCreateMissingAnnouncement(c)}
                        className="text-[10px] bg-white text-yellow-700 px-2 py-0.5 rounded shadow-sm hover:bg-yellow-50 border border-yellow-300"
                      >
                        สร้างประกาศเดี๋ยวนี้
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                <button onClick={() => setEditingClosure({ id: c.id!, reason: c.reason })} className="text-orange-400 hover:text-orange-600 p-2" title="แก้ไขชื่อ">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDeleteClosure(c.id)} className="text-red-400 hover:text-red-600 p-2" title="ลบ">
                  <Trash2 size={16} />
                </button>
              </div>
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
                              <div className="flex items-center gap-3">
                                <div className="text-right mr-2">
                                  <p className="text-xs font-bold text-gray-700">{w.shift.start_time?.substring(0,5)} - {w.shift.end_time?.substring(0,5)} น.</p>
                                </div>
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

    </div>
  );
}
