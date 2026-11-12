import React from "react";
import { ClinicSettingsManagement } from "@/app/admin/clinicManage";
import { useScheduleData } from "./useScheduleData";

// 📦 ชิ้นส่วนทั้ง 3 โซนบนหน้าจอ (Header, Calendar, Leave)
import ScheduleHeader from "./header/ScheduleHeader";
import {
  WeeklyTemplateCard,
  WeeklyEditShiftModal,
  ActualCalendarCard,
  ActualDayDetailModal,
} from "./calendar";
import LeaveApprovalsCard from "./leave/LeaveApprovalsCard";

/**
 * 📅 [SCHEDULE MANAGEMENT VIEW]
 * กล่องใหญ่คุมหน้า "ตารางเวรและการลา" แบ่งตามสายตาเป็น 3 ส่วน (บน - กลาง - ล่าง)
 * ส่วนโค้ดคำนวณและเชื่อมต่อฐานข้อมูลถูกแยกไปไว้ที่ useScheduleData.ts แล้ว
 */
export default function ScheduleManagementView() {
  const s = useScheduleData();

  // แสดงหน้าตั้งค่าคลินิกหากกดจากปุ่มฟันเฟือง
  if (s.subView === "clinic_settings") {
    return <ClinicSettingsManagement onBack={() => s.setSubView(null)} />;
  }

  if (s.loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        กำลังโหลดตารางเวร...
      </div>
    );
  }

  return (
    <div>
      {/* 🔝 1. [HEADER] ส่วนหัวด้านบน: หัวข้อ ค้นหา ปุ่มกรอง และปุ่มบันทึก */}
      <ScheduleHeader
        searchQuery={s.searchQuery}
        onSearchChange={s.setSearchQuery}
        roleFilter={s.roleFilter}
        onRoleFilterChange={s.setRoleFilter}
        pendingLeaveCount={s.pendingLeaveCount}
        onNavigateToSettings={() => s.setSubView("clinic_settings")}
        pendingChangesCount={s.pendingCount}
        onSaveAll={s.handleSaveAll}
      />

      {/* 🗓️ 2. [CALENDAR] ส่วนกลาง: ตารางเวร 7 วัน (ซ้าย) + ปฏิทินปฏิบัติงานจริง (ขวา) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5 items-stretch mb-2.5">
        <WeeklyTemplateCard
          persons={s.filteredPersons}
          shifts={s.shifts}
          weeklyOffDays={s.weeklyOffDays}
          isCollapsed={s.isTemplateCollapsed}
          onToggleCollapse={() => s.setIsTemplateCollapsed(!s.isTemplateCollapsed)}
          onEditShift={(person, dayIndex, shift) => {
            s.setEditingShift({
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
          currentDate={s.currentDate}
          onPrevMonth={s.prevMonth}
          onNextMonth={s.nextMonth}
          getDailyData={s.getDailyData}
          onSelectDay={(info) => s.setSelectedDayInfo(info)}
          filterRole={s.roleFilter}
        />
      </div>

      {/* 📋 3. [LEAVE] ส่วนล่าง: กล่องคำขออนุมัติการลา */}
      <LeaveApprovalsCard
        leaves={s.allLeaves}
        onUpdateStatus={s.handleUpdateLeaveStatus}
      />

      {/* 🪟 ป๊อปอัปประจำโซน Calendar (รอเปิดเมื่อคลิกตารางหรือปฏิทิน) */}
      {s.selectedDayInfo && (
        <ActualDayDetailModal
          selectedDayInfo={s.selectedDayInfo}
          onClose={() => s.setSelectedDayInfo(null)}
          getDailyData={s.getDailyData}
          filterRole={s.roleFilter}
        />
      )}

      {s.editingShift && (
        <WeeklyEditShiftModal
          editingShift={s.editingShift}
          onClose={() => s.setEditingShift(null)}
          onShiftFieldChange={s.handleShiftFieldChange}
          onSave={s.handleSaveSingleShift}
        />
      )}
    </div>
  );
}
