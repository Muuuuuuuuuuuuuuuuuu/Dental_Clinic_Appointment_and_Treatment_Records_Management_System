import React from "react";
import { Search, UserPlus } from "lucide-react";

export type PatientTab = "search" | "register";

interface TabsNavProps {
  activeTab: PatientTab;
  onTabChange: (tab: PatientTab) => void;
}

/**
 * 🏷️ [HEADER COMPONENT] แถบสลับระหว่าง ค้นหาประวัติ / ลงทะเบียนคนไข้ใหม่
 */
export default function TabsNav({ activeTab, onTabChange }: TabsNavProps) {
  return (
    <div className="flex overflow-x-auto gap-2 mb-3 pb-1" style={{ scrollbarWidth: "none" }}>
      <button
        onClick={() => onTabChange("search")}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
          activeTab === "search" ? "shadow-md" : "hover:bg-white/50"
        }`}
        style={{
          backgroundColor: activeTab === "search" ? "white" : "transparent",
          color: activeTab === "search" ? "#1A365D" : "#4A6080",
        }}
      >
        <Search size={15} /> ค้นหาประวัติคนไข้
      </button>
      <button
        onClick={() => onTabChange("register")}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
          activeTab === "register" ? "shadow-md" : "hover:bg-white/50"
        }`}
        style={{
          backgroundColor: activeTab === "register" ? "white" : "transparent",
          color: activeTab === "register" ? "#1A365D" : "#4A6080",
        }}
      >
        <UserPlus size={15} /> ลงทะเบียนใหม่
      </button>
    </div>
  );
}

