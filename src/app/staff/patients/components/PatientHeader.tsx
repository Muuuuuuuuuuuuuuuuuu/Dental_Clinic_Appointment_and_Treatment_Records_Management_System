import PatientTitleBar from "./PatientTitleBar";
import PatientTabsNav from "./PatientTabsNav";

interface PatientHeaderProps {
  activeTab: "search" | "register";
  onTabChange: (tab: "search" | "register") => void;
}

export default function PatientHeader({ activeTab, onTabChange }: PatientHeaderProps) {
  return (
    <div className="space-y-2 mb-3">
      <PatientTitleBar />
      <PatientTabsNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}

