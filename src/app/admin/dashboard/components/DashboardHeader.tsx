import DashboardTitleBar from "./DashboardTitleBar";
import TimeframeControls from "./TimeframeControls";
import { Timeframe } from "../hooks/useDashboardData";

interface DashboardHeaderProps {
  selectedDate: Date;
  targetDateStr: string;
  onDateChange: (date: Date) => void;
  timeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
}

/**
 * 🔲 [DASHBOARD HEADER] แถบควบคุมส่วนบนของแดชบอร์ด
 */
export default function DashboardHeader({
  selectedDate,
  targetDateStr,
  onDateChange,
  timeframe,
  onTimeframeChange,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-2">
      <DashboardTitleBar selectedDate={selectedDate} />
      <TimeframeControls
        targetDateStr={targetDateStr}
        onDateChange={onDateChange}
        timeframe={timeframe}
        onTimeframeChange={onTimeframeChange}
      />
    </header>
  );
}

