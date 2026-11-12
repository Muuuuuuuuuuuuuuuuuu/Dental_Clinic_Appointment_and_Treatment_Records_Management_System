import { DentistInfo } from "@/app/shared/data";
import { useDoctorCalendar } from "./useDoctorCalendar";
import { RegularScheduleCard, LeaveSummaryCard } from "./top";
import { ActualCalendarCard, LeaveRequestModal } from "./calendar";

interface DoctorCalendarProps {
  doctor: DentistInfo | null;
}

/**
 * 📅 [DENTIST SCHEDULE VIEW]
 * หน้าปฏิทินและการลางานของทันตแพทย์ (Compact & Clean Architecture)
 */
export default function DentistScheduleView({ doctor }: DoctorCalendarProps) {
  const {
    loading,
    shifts,
    closures,
    leaves,
    appointments,
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
  } = useDoctorCalendar(doctor);

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
      <div className="mb-4">
        <h1
          className="text-xl font-bold"
          style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
        >
          ปฏิทินและการลางาน
        </h1>
        <p className="text-xs" style={{ color: "#4A6080" }}>
          ตรวจสอบตารางทำงานและส่งคำขอลางานได้ที่นี่
        </p>
      </div>

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
          appointments={appointments}
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
