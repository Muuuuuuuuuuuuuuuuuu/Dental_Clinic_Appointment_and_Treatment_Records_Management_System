import { View, PatientUser } from "../types";
import { Appointment } from "@/app/shared/data";
import { usePatientDashboard } from "./hooks/usePatientDashboard";
import {
  DashboardTitleBar,
  MetricCards,
  UpcomingAppointmentCard,
  ClinicInfoCard,
} from "./components";

interface DashboardProps {
  user: PatientUser;
  setView: (v: View) => void;
  appointments?: Appointment[];
}

/**
 * 📊 [PATIENT DASHBOARD VIEW]
 * หน้าภาพรวมระบบผู้ป่วย (Flat & Clean Architecture)
 */
export default function PatientDashboardView({
  user,
  setView,
  appointments: globalAppointments,
}: DashboardProps) {
  const {
    appointments,
    history,
    dailyHours,
    weeklyOffDays,
    upcoming,
  } = usePatientDashboard(user, globalAppointments);

  return (
    <div>
      {/* 1. ส่วนหัวทักทายคนไข้ */}
      <DashboardTitleBar firstName={user.firstName} />

      {/* 2. การ์ดตัวเลขสรุป 4 ช่อง */}
      <div className="space-y-6">
        <MetricCards
          appointments={appointments}
          history={history}
          onNavigate={setView}
        />

        {/* 3. นัดหมายถัดไป (ซ้าย) + ข้อมูลคลินิกและเวลาเปิดปิด (ขวา) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <UpcomingAppointmentCard
              upcoming={upcoming}
              onNavigate={setView}
            />
          </div>
          <div className="lg:col-span-1">
            <ClinicInfoCard
              dailyHours={dailyHours}
              weeklyOffDays={weeklyOffDays}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
