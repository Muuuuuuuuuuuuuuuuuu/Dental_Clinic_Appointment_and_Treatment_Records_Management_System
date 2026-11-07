import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardItemProps {
  label: string;
  val: number | string;
  icon: LucideIcon;
  bg: string;
  ic: string;
}

/**
 * 📊 [METRIC CARD COMPONENT] การ์ดสรุปตัวเลข 1 ช่อง
 */
export default function MetricCardItem({
  label,
  val,
  icon: Icon,
  bg,
  ic,
}: MetricCardItemProps) {
  return (
    <div
      className="rounded-2xl bg-white p-4"
      style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ backgroundColor: bg }}
      >
        <Icon size={18} style={{ color: ic }} />
      </div>
      <div
        className="text-2xl font-bold"
        style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
      >
        {val}
      </div>
      <div className="text-xs mt-0.5" style={{ color: "#4A6080" }}>
        {label}
      </div>
    </div>
  );
}

