import React from "react";
import { AlertTriangle, ArrowRightLeft, Clock, CalendarDays } from "lucide-react";
import { TabView } from "../hooks/useStaffAppointments";

interface TabsNavProps {
  activeTab: TabView;
  onTabChange: (tab: TabView) => void;
}

/**
 * 🏷️ [HEADER COMPONENT] แถบหมวดหมู่ของนัดหมาย (เคสเสี่ยง / ย้ายเคส / เลื่อนนัด / ทั้งหมด)
 */
export default function TabsNav({ activeTab, onTabChange }: TabsNavProps) {
  const tabs = [
    { key: "risk" as TabView, label: "เคสเฝ้าระวัง / เสี่ยง", icon: AlertTriangle },
    { key: "transfer" as TabView, label: "ย้ายเคส", icon: ArrowRightLeft },
    { key: "reschedule" as TabView, label: "เลื่อน/ยกเลิกนัด", icon: Clock },
    { key: "all" as TabView, label: "นัดหมายทั้งหมด", icon: CalendarDays },
  ];

  return (
    <div className="flex overflow-x-auto gap-2 mb-6 pb-2" style={{ scrollbarWidth: "none" }}>
      {tabs.map((tab) => {
        const isCurrent = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              isCurrent ? "shadow-md" : "hover:bg-white/50"
            }`}
            style={{
              backgroundColor: isCurrent ? "white" : "transparent",
              color: isCurrent ? "#1A365D" : "#4A6080",
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

