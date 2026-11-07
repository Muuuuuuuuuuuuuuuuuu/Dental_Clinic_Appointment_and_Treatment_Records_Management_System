import React, { useState, useEffect, useMemo } from "react";
import { DentistInfo, StaffInfo, Shift, SpecialClosure, LeaveRequest } from "@/app/shared/data";
import { 
  getDentists, getStaff, getShifts, upsertShift, 
  getClinicClosures, getLeaveRequests, getWeeklyOffDays,
  updateLeaveStatus
} from "@/app/shared/supabaseApi";

// 📄 Page Components (Flat & Clean)
import {
  ScheduleHeader,
  WeeklyTemplateCard,
  ActualCalendarCard,
  LeaveApprovalsCard,
  DayDetailModal,
  EditShiftModal,
} from "./components";

// Subview ทางเลือกสำหรับทางลัดไปหน้าตั้งค่าคลินิก
import { ClinicSettingsManagement } from "@/app/admin/clinic";

/**
 * 📅 [SCHEDULE MANAGEMENT MODULE] ตารางเวรและการลา
 * รวมศูนย์การจัดการตารางเวร 7 วัน, ปฏิทินปฏิบัติงานจริง, และคำขออนุมัติการลา
 * แบ่งย่อยเป็น 4 Positional Sections:
 *   1. HeaderSection: แถบควบคุมบน ค้นหา กรองบทบาท และปุ่มบันทึก
 *   2. ContentSection: ซ้าย (Weekly Template) + ขวา (Actual Calendar)
 *   3. FooterSection: คำขออนุมัติการลา (Leave Approvals)
 *   4. ModalsSection: ป๊อปอัปแก้ไขกะ และดูรายละเอียดรายวัน
 */
export default function ScheduleManagement() {
  // ทางลัดสลับไปดูหน้าตั้งค่าคลินิก (เมื่อกดปุ่มฟันเฟืองใน Header)
  const [subView, setSubView] = useState<"clinic_settings" | null>(null);

  // ข้อมูลหลักจากฐานข้อมูล
  const [dentists, setDentists] = useState<DentistInfo[]>([]);
  const [staffList, setStaffList] = useState<StaffInfo[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [closures, setClosures] = useState<SpecialClosure[]>([]);
  const [allLeaves, setAllLeaves] = useState<LeaveRequest[]>([]);
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // รายการที่รอบันทึก (Pending changes)
  const [pendingChanges, setPendingChanges] = useState<Record<string, Partial<Shift> & { userId: string, dayNum: number }>>({});

  // 🌟 รวมปุ่มกรองเป็นชุดเดียว ควบคุมทั้งสองตารางพร้อมกัน
  const [roleFilter, setRoleFilter] = useState<"all" | "dentist" | "staff">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // สถานะปฏิทิน
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isTemplateCollapsed, setIsTemplateCollapsed] = useState(false);
  const [selectedDayInfo, setSelectedDayInfo] = useState<{ dateObj: Date; dateStr: string } | null>(null);
  const [editingShift, setEditingShift] = useState<{
    shift: Shift | undefined;
    personId: number;
    personType: string;
    personName: string;
    dayNum: number;
    userId: string;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ds, ss, sh, lv, offDays, cl] = await Promise.all([
        getDentists(),
        getStaff(),
        getShifts(),
        getLeaveRequests(),
        getWeeklyOffDays(),
        getClinicClosures()
      ]);
      setDentists(ds);
      setStaffList(ss);
      setShifts(sh);
      setClosures(cl);
      setAllLeaves(lv);
      setWeeklyOffDays(offDays);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ใบลาที่อนุมัติแล้ว สำหรับนำไปตัดยอดในปฏิทินปฏิบัติงานจริง
  const approvedLeaves = useMemo(() => {
    return allLeaves.filter(l => l.status === "อนุมัติแล้ว");
  }, [allLeaves]);

  // จำนวนใบลาที่รออนุมัติ
  const pendingLeaveCount = useMemo(() => {
    return allLeaves.filter(l => l.status === "รออนุมัติ").length;
  }, [allLeaves]);

  // ฟังก์ชันอนุมัติหรือปฏิเสธการลา
  const handleUpdateLeaveStatus = async (id: number, status: string) => {
    try {
      const updated = await updateLeaveStatus(id, status);
      setAllLeaves(prev => prev.map(l => l.id === id ? { ...l, status: updated.status } : l));
    } catch (err: any) {
      console.error("Failed to update leave status:", err);
      alert(err.message || "เกิดข้อผิดพลาดในการอัปเดตสถานะการลา");
    }
  };

  // รวมรายชื่อบุคลากรทั้งหมด
  const allPersons = useMemo(() => [
    ...dentists.map(d => ({ id: d.id, name: d.name, type: "dentist" as const, userId: d.userId, staffId: d.staffId, color: "#FF8C9A" })),
    ...staffList.map(s => ({ id: s.id, name: s.name, type: "staff" as const, userId: (s as any).userId, staffId: s.id, color: "#1A365D" })),
  ], [dentists, staffList]);

  // กรองรายชื่อบุคลากรตามบทบาทและคำค้นหา
  const filteredPersons = useMemo(() => {
    return allPersons
      .filter(p => roleFilter === "all" || p.type === roleFilter)
      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allPersons, roleFilter, searchQuery]);

  // คำนวณข้อมูลผู้ปฏิบัติงานรายวันสำหรับปฏิทิน
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
      const shift = shifts.find(s => 
        (s.staffId && person.staffId ? s.staffId === person.staffId : (s.userId && person.userId ? s.userId === person.userId : s.person_id === person.id && s.person_type === person.type)) && 
        s.day_of_week === dayOfWeek
      );
      if (!shift || shift.is_off) {
        offDuty.push(person);
      } else {
        const leave = approvedLeaves.find(l => 
          (l.staffId && person.staffId ? l.staffId === person.staffId : (l.doctorId && (l.doctorId === person.staffId || l.doctorId === person.userId))) && 
          l.startDate === dateStr
        );
        if (leave) {
          onLeave.push({ ...person, leave, shift });
        } else {
          working.push({ ...person, shift });
        }
      }
    });

    return { isClosed, working, onLeave, offDuty, dateStr };
  };

  // จัดการการเปลี่ยนข้อมูลในหน้าต่างแก้ไขกะ
  const handleShiftFieldChange = (field: "start_time" | "end_time" | "is_off", value: any) => {
    if (!editingShift) return;
    const dbValue = (value === "") ? null : value;
    const { personId, personType, userId, dayNum } = editingShift;
    const pendingKey = `${userId}_${dayNum}`;

    let found = false;
    const updatedShifts = shifts.map(s => {
      if ((s.userId && userId ? s.userId === userId : s.person_id === personId && s.person_type === personType) && s.day_of_week === dayNum) {
        found = true;
        return { ...s, [field]: dbValue };
      }
      return s;
    });

    if (!found) {
      updatedShifts.push({
        id: -1,
        userId,
        person_id: personId,
        person_type: personType as "dentist" | "staff",
        day_of_week: dayNum,
        start_time: field === "start_time" ? dbValue : "09:00",
        end_time: field === "end_time" ? dbValue : "20:00",
        is_off: field === "is_off" ? dbValue : false
      });
    }

    setShifts(updatedShifts);

    setPendingChanges(prev => ({
      ...prev,
      [pendingKey]: {
        ...(prev[pendingKey] || {}),
        userId,
        dayNum,
        [field]: dbValue
      }
    }));

    setEditingShift(prev => prev ? {
      ...prev,
      shift: prev.shift 
        ? { ...prev.shift, [field]: dbValue } 
        : { id: -1, userId, person_id: personId, person_type: personType as "dentist" | "staff", day_of_week: dayNum, start_time: "09:00", end_time: "20:00", is_off: false, [field]: dbValue }
    } : null);
  };

  // บันทึกกะเดียวจากหน้าต่างแก้ไขทันที (Auto-save)
  const handleSaveSingleShift = async () => {
    if (editingShift && editingShift.userId) {
      const pendingKey = `${editingShift.userId}_${editingShift.dayNum}`;
      const changes = pendingChanges[pendingKey];
      if (changes) {
        try {
          await upsertShift(editingShift.userId, editingShift.dayNum, changes);
          setPendingChanges(prev => {
            const copy = { ...prev };
            delete copy[pendingKey];
            return copy;
          });
          await fetchData();
        } catch (e) {
          console.error("Save shift error:", e);
        }
      }
    }
    setEditingShift(null);
  };

  // บันทึกการเปลี่ยนแปลงกะทั้งหมด
  const handleSaveAll = async () => {
    const keys = Object.keys(pendingChanges);
    if (keys.length === 0) return;
    if (!confirm("คุณต้องการบันทึกการเปลี่ยนแปลงตารางเวรใช่หรือไม่?")) return;
    try {
      for (const key of keys) {
        const changes = pendingChanges[key];
        await upsertShift(changes.userId, changes.dayNum, changes);
      }
      setPendingChanges({});
      await fetchData();
      alert("บันทึกตารางเวรเรียบร้อยแล้ว");
    } catch (err) {
      console.error("Error saving shifts", err);
      alert("เกิดข้อผิดพลาดในการบันทึกตารางเวร");
    }
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // แสดงหน้าตั้งค่าคลินิกหากกดจากปุ่มฟันเฟือง
  if (subView === "clinic_settings") {
    return <ClinicSettingsManagement onBack={() => setSubView(null)} />;
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">กำลังโหลดตารางเวร...</div>;
  }

  const pendingCount = Object.keys(pendingChanges).length;

  return (
    <div>
      {/* 🌟 1. [HEADER] ส่วนหัว: แถบควบคุมรวมศูนย์ด้านบน */}
      <ScheduleHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        pendingLeaveCount={pendingLeaveCount}
        onNavigateToSettings={() => setSubView("clinic_settings")}
        pendingChangesCount={pendingCount}
        onSaveAll={handleSaveAll}
      />

      {/* 🌟 2. [CONTENT] ส่วนเนื้อหาตรงกลาง (ซ้าย: ตารางเวร 7 วัน, ขวา: ปฏิทินปฏิบัติงานจริง) ขนาดเท่ากัน */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5 items-stretch mb-2.5">
        <WeeklyTemplateCard
          persons={filteredPersons}
          shifts={shifts}
          weeklyOffDays={weeklyOffDays}
          isCollapsed={isTemplateCollapsed}
          onToggleCollapse={() => setIsTemplateCollapsed(!isTemplateCollapsed)}
          onEditShift={(person, dayIndex, shift) => {
            setEditingShift({
              shift,
              personId: person.id,
              personType: person.type,
              personName: person.name,
              dayNum: dayIndex,
              userId: person.userId,
            });
          }}
        />

        <ActualCalendarCard
          currentDate={currentDate}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
          getDailyData={getDailyData}
          onSelectDay={(info) => setSelectedDayInfo(info)}
          filterRole={roleFilter}
        />
      </div>

      {/* 🌟 3. [FOOTER] ส่วนล่าง: คำขออนุมัติการลา */}
      <LeaveApprovalsCard
        leaves={allLeaves}
        onUpdateStatus={handleUpdateLeaveStatus}
      />

      {/* 🌟 4. [MODALS] หน้าต่างป๊อปอัป */}
      {selectedDayInfo && (
        <DayDetailModal
          selectedDayInfo={selectedDayInfo}
          onClose={() => setSelectedDayInfo(null)}
          getDailyData={getDailyData}
          filterRole={roleFilter}
        />
      )}

      {editingShift && (
        <EditShiftModal
          editingShift={editingShift}
          onClose={() => setEditingShift(null)}
          onShiftFieldChange={handleShiftFieldChange}
          onSave={handleSaveSingleShift}
        />
      )}
    </div>
  );
}

