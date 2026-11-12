import { AdminView } from "@/app/shared/data";
import { useDashboardData } from "./useDashboardData";
import { DashboardHeader, MetricCards } from "./top";
import { AppointmentBarChart, RevenueLineChart } from "./charts";
import { StatusRatioCard, AppointmentsViewButton, AppointmentsDrawer } from "./bottom";

interface AdminDashboardProps {
  setView: (v: AdminView) => void;
}

/**
 * 🏠 [ADMIN DASHBOARD VIEW]
 * หน้าภาพรวมระบบของผู้ดูแลระบบ (Flat & Clean Architecture)
 */
export default function AdminDashboardView({ setView }: AdminDashboardProps) {
  const {
    selectedDate,
    setSelectedDate,
    targetDateStr,
    timeframe,
    setTimeframe,
    filteredAppts,
    revenue,
    onDutyDentistsCnt,
    pendingLeavesCount,
    chartData,
    handleChartClick,
    breakdown,
    showApptModal,
    setShowApptModal,
  } = useDashboardData();

  return (
    <div className="animate-fade-in space-y-3 pb-4">
      {/* 1. ส่วนหัวและปุ่มเลือกช่วงเวลา */}
      <DashboardHeader
        selectedDate={selectedDate}
        targetDateStr={targetDateStr}
        onDateChange={setSelectedDate}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
      />

      {/* 2. การ์ดตัวเลขสรุป 4 ช่อง */}
      <MetricCards
        appointmentCount={filteredAppts.length}
        revenue={revenue}
        onDutyDentistsCount={onDutyDentistsCnt}
        pendingLeavesCount={pendingLeavesCount}
        onNavigateToSchedule={() => setView("schedule-hub")}
      />

      {/* 3. กราฟนัดหมาย และกราฟรายได้ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <AppointmentBarChart
          chartData={chartData}
          timeframe={timeframe}
          onChartClick={handleChartClick}
        />
        <RevenueLineChart
          chartData={chartData}
          timeframe={timeframe}
          onChartClick={handleChartClick}
        />
      </div>

      {/* 4. สัดส่วนสถานะ + ปุ่มเปิดดูนัดหมาย */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        <StatusRatioCard
          completedCnt={breakdown.completed}
          scheduledCnt={breakdown.scheduled}
          cancelledCnt={breakdown.cancelled}
          noShowCnt={breakdown.noShow}
          totalCnt={breakdown.total}
        />
        <AppointmentsViewButton
          totalAppointments={filteredAppts.length}
          onOpenAppointments={() => setShowApptModal(true)}
        />
      </div>

      {/* 5. ป๊อปอัปสไลด์แสดงนัดหมาย */}
      <AppointmentsDrawer
        isOpen={showApptModal}
        onClose={() => setShowApptModal(false)}
        selectedDate={selectedDate}
        appointments={filteredAppts}
      />
    </div>
  );
}
