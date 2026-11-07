import AppointmentTitleBar from "./AppointmentTitleBar";
import AppointmentTabsNav from "./AppointmentTabsNav";
import { TabView } from "../hooks/useStaffAppointments";

interface AppointmentHeaderProps {
  activeTab: TabView;
  onTabChange: (tab: TabView) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function AppointmentHeader({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
}: AppointmentHeaderProps) {
  return (
    <div>
      <AppointmentTitleBar
        activeTab={activeTab}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
      <AppointmentTabsNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
