import { Appointment } from "@/app/shared/data";
import { useStaffAppointments } from "./hooks/useStaffAppointments";
import {
  AppointmentHeader,
  AppointmentCard,
  EmptyAppointmentState,
  TransferModal,
  RescheduleModal,
} from "./components";

interface AppointmentManagementProps {
  appointments?: Appointment[];
}

/**
 * 📅 [STAFF APPOINTMENTS VIEW]
 * หน้าระบบจัดการนัดหมาย (Flat & Clean Architecture)
 */
export default function StaffAppointmentsView({
  appointments: initialAppointments,
}: AppointmentManagementProps) {
  const {
    dentists,
    loading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    displayAppointments,
    transferAppt,
    setTransferAppt,
    rescheduleAppt,
    setRescheduleAppt,
    newDoctorId,
    setNewDoctorId,
    newDate,
    setNewDate,
    newTime,
    setNewTime,
    updateReason,
    setUpdateReason,
    onUpdateAppt,
    handleTransferSubmit,
    handleRescheduleSubmit,
    handleCancelAppt,
    handleNoShowAppt,
  } = useStaffAppointments(initialAppointments);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="animate-spin w-8 h-8 border-3 rounded-full"
          style={{ borderColor: "#F0F4F8", borderTopColor: "#FF8C9A" }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* 1. ส่วนหัว: หัวข้อ, ค้นหา และแท็บหมวดหมู่ */}
      <AppointmentHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 2. รายการการ์ดนัดหมาย */}
      {displayAppointments.length === 0 ? (
        <EmptyAppointmentState searchQuery={searchQuery} />
      ) : (
        <div className="space-y-3">
          {displayAppointments.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appt={appt}
              activeTab={activeTab}
              onConfirmAppt={(id) => onUpdateAppt(id, { status: "ยืนยันการจอง" })}
              onCancelAppt={handleCancelAppt}
              onOpenTransfer={(a) => setTransferAppt(a)}
              onOpenReschedule={(a) => {
                setRescheduleAppt(a);
                setNewDate(a.date);
                setNewTime(a.time);
              }}
            />
          ))}
        </div>
      )}

      {/* 3. ป๊อปอัปย้ายเคส */}
      {transferAppt && (
        <TransferModal
          transferAppt={transferAppt}
          dentists={dentists}
          newDoctorId={newDoctorId}
          setNewDoctorId={setNewDoctorId}
          updateReason={updateReason}
          setUpdateReason={setUpdateReason}
          onClose={() => {
            setTransferAppt(null);
            setNewDoctorId("");
            setUpdateReason("");
          }}
          onSubmit={handleTransferSubmit}
        />
      )}

      {/* 4. ป๊อปอัปเลื่อนนัดหมาย */}
      {rescheduleAppt && (
        <RescheduleModal
          rescheduleAppt={rescheduleAppt}
          newDate={newDate}
          setNewDate={setNewDate}
          newTime={newTime}
          setNewTime={setNewTime}
          updateReason={updateReason}
          setUpdateReason={setUpdateReason}
          onClose={() => {
            setRescheduleAppt(null);
            setNewDate("");
            setNewTime("");
            setUpdateReason("");
          }}
          onCancelAppt={handleCancelAppt}
          onNoShowAppt={handleNoShowAppt}
          onSubmitReschedule={handleRescheduleSubmit}
        />
      )}
    </div>
  );
}
