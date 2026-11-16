import { DocView, DentistInfo, Appointment } from "@/app/shared/data";
import { useDoctorDashboard } from "./useDoctorDashboard";
import { DashboardHeader, DashboardMetricCards } from "./top";
import { TodayQueueCard, TodayDutyCard } from "./bottom";

interface DoctorDashboardProps {
  setView: (v: DocView) => void;
  doctor: DentistInfo | null;
  appointments?: Appointment[];
}

/**
 * 🏠 [DENTIST DASHBOARD VIEW]
 * หน้าภาพรวมสำหรับทันตแพทย์ (Flat & Clean Architecture)
 */
export default function DentistDashboardView({
  setView,
  doctor,
  appointments: initialAppointments,
}: DoctorDashboardProps) {
  const {
    formattedDate,
    todayText,
    myAppts,
    waiting,
    pending,
    done,
    dutyStartTime,
    dutyEndTime,
    isDoctorOff,
  } = useDoctorDashboard(doctor, initialAppointments);

  return (
    <div>
      {/* 1. ส่วนหัว: คำทักทายและวันที่ */}
      <DashboardHeader
        doctor={doctor}
        formattedDate={formattedDate}
        todayText={todayText}
      />

      {/* 2. สรุปตัวเลข 4 ช่อง */}
      <DashboardMetricCards
        totalPatients={myAppts.length}
        waitingCount={waiting}
        pendingPaymentCount={pending}
        doneCount={done}
      />

      {/* 3. คิวคนไข้วันนี้ (ซ้าย 2 ส่วน) + เวลาออกตรวจ (ขวา 1 ส่วน) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <TodayQueueCard
          appointments={myAppts}
          onViewAll={() => setView("queue")}
        />
        <TodayDutyCard
          startTime={dutyStartTime}
          endTime={dutyEndTime}
          isOff={isDoctorOff}
        />
      </div>
    </div>
  );
}
