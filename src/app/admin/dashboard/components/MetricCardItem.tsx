import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardItemProps {
  label: string;
  val: string | number;
  icon: LucideIcon;
  bg: string;
  ic: string;
  isAction?: boolean;
  onClick?: () => void;
}

/**
 * 📊 [METRIC CARD COMPONENT] การ์ดตัวเลขสรุป 1 ใบ
 */
export default function MetricCardItem({
  label,
  val,
  icon: Icon,
  bg,
  ic,
  isAction,
  onClick,
}: MetricCardItemProps) {
  return (
    <div
      className={`rounded-xl bg-white px-4 py-3 flex items-center gap-3 transition-shadow ${
        isAction ? "cursor-pointer hover:shadow-md" : ""
      }`}
      style={{ boxShadow: "0 2px 8px rgba(26,54,93,0.05)" }}
      onClick={isAction ? onClick : undefined}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: bg }}
      >
        <Icon size={18} style={{ color: ic }} />
      </div>
      <div>
        <div
          className="text-2xl font-bold leading-tight"
          style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
        >
          {val}
        </div>
        <div className="text-xs font-medium" style={{ color: "#4A6080" }}>
          {label}
        </div>
      </div>
    </div>
  );
}

