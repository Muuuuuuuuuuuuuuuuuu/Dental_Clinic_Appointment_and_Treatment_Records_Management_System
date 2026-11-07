import React from "react";
import { CalendarDays, CalendarRange, Calendar as CalendarIcon } from "lucide-react";
import { ViewMode } from "../hooks/useQueueData";

interface ViewToggleProps {
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
}

/**
 * 🎛️ [HEADER COMPONENT] ปุ่มสลับมุมมอง (รายวัน / รายสัปดาห์ / รายเดือน)
 */
export default function ViewToggle({ mode, setMode }: ViewToggleProps) {
  const items: { key: ViewMode; label: string; icon: React.ElementType }[] = [
    { key: "daily", label: "รายวัน", icon: CalendarDays },
    { key: "weekly", label: "รายสัปดาห์", icon: CalendarRange },
    { key: "monthly", label: "รายเดือน", icon: CalendarIcon },
  ];

  return (
    <div className="inline-flex rounded-xl p-1" style={{ backgroundColor: "#F0F4F8" }}>
      {items.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => setMode(key)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          style={{
            backgroundColor: mode === key ? "white" : "transparent",
            color: mode === key ? "#1A365D" : "#94A3B8",
            boxShadow: mode === key ? "0 1px 4px rgba(26,54,93,0.1)" : "none",
          }}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
}

