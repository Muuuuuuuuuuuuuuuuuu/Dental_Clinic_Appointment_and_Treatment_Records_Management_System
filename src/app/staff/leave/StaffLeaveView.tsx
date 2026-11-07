import { StaffInfo } from "@/app/shared/data";
import { useStaffLeave } from "./hooks/useStaffLeave";
import {
  LeaveTitleBar,
  RegularScheduleCard,
  LeaveSummaryCard,
  ActualCalendarCard,
  LeaveRequestModal,
} from "./components";

interface StaffLeaveProps {
  staff?: StaffInfo | null;
}

/**
 * 📅 [STAFF LEAVE VIEW]
 * หน้าปฏิทินและการลางานของเจ้าหน้าที่ (Compact & Clean Architecture)
 */
export default function StaffLeaveView({ staff }: StaffLeaveProps) {
  const {
    loading,
    shifts,
    closures,
    leaves,
    weeklyOffDays,
    currentDate,
    setCurrentDate,
    prevMonth,
    nextMonth,
    resetToCurrentMonth,
    leaveModalOpen,
    setLeaveModalOpen,
    selectedDate,
    leaveType,
    setLeaveType,
    leaveReason,
    setLeaveReason,
    handleAddLeave,
    openLeaveModal,
  } = useStaffLeave(staff);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Sarabun, sans-serif" }}>
      {/* 1. ส่วนหัวหน้า */}
      <LeaveTitleBar />

      {/* 2. เนื้อหา: ตารางเวรประจำ + สรุปการลางาน ในบรรทัดเดียวกัน แล้วตามด้วยปฏิทินรายเดือน */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7">
            <RegularScheduleCard shifts={shifts} />
          </div>
          <div className="lg:col-span-5">
            <LeaveSummaryCard leaves={leaves} />
          </div>
        </div>

        <ActualCalendarCard
          currentDate={currentDate}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
          onResetMonth={resetToCurrentMonth}
          onChangeMonth={(m) =>
            setCurrentDate(new Date(currentDate.getFullYear(), m, 1))
          }
          onChangeYear={(y) =>
            setCurrentDate(new Date(y, currentDate.getMonth(), 1))
          }
          leaves={leaves}
          closures={closures}
          shifts={shifts}
          weeklyOffDays={weeklyOffDays}
          onSelectDate={openLeaveModal}
        />
      </div>

      {/* 3. ป๊อปอัปคำขอลางาน */}
      <LeaveRequestModal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        selectedDate={selectedDate}
        leaveType={leaveType}
        onLeaveTypeChange={setLeaveType}
        leaveReason={leaveReason}
        onLeaveReasonChange={setLeaveReason}
        onSubmit={handleAddLeave}
      />
    </div>
  );
}
