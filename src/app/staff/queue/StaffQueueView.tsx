import { StaffView, Appointment } from "@/app/shared/data";
import { useQueueData } from "./hooks/useQueueData";
import { QueueHeader, DailyView, WeeklyView, MonthlyView } from "./components";

interface QueueProps {
  setView: (v: StaffView, apptId?: number) => void;
  appointments?: Appointment[];
}

/**
 * 🏢 [STAFF QUEUE VIEW]
 * หน้าจัดการคิวงานพนักงาน (Flat & Clean Architecture)
 */
export default function StaffQueueView({ setView, appointments: initialAppointments }: QueueProps) {
  const {
    appointments: realtimeAppointments,
    closures,
    weeklyOffs,
    dentists,
    leaves,
    shifts,
    viewMode,
    setViewMode,
    selectedDate,
    setSelectedDate,
    handleUpdateAppt,
  } = useQueueData();

  const currentAppointments =
    initialAppointments && initialAppointments.length > 0
      ? initialAppointments
      : realtimeAppointments;

  return (
    <div className="space-y-6">
      {/* 1. ส่วนหัวและปุ่มสลับมุมมอง */}
      <QueueHeader viewMode={viewMode} onViewModeChange={setViewMode} />

      {/* 2. เนื้อหาตามมุมมองที่เลือก */}
      <main>
        {viewMode === "daily" && (
          <DailyView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            appointments={currentAppointments}
            closures={closures}
            weeklyOffs={weeklyOffs}
            dentists={dentists}
            leaves={leaves}
            shifts={shifts}
            setView={setView}
            onUpdateAppt={handleUpdateAppt}
          />
        )}
        {viewMode === "weekly" && (
          <WeeklyView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            appointments={currentAppointments}
            closures={closures}
            weeklyOffs={weeklyOffs}
            setMode={setViewMode}
          />
        )}
        {viewMode === "monthly" && (
          <MonthlyView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            appointments={currentAppointments}
            closures={closures}
            weeklyOffs={weeklyOffs}
            setMode={setViewMode}
          />
        )}
      </main>
    </div>
  );
}
