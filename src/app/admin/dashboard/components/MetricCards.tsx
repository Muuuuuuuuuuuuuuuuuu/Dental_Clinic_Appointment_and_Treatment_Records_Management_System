import React from "react";
import { Calendar, TrendingUp, UserCheck, AlertCircle, LucideIcon } from "lucide-react";

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
 * 📊 การ์ดตัวเลขสรุป 1 ใบ
 */
function MetricCardItem({
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

interface MetricCardsProps {
  appointmentCount: number;
  revenue: number;
  onDutyDentistsCount: number;
  pendingLeavesCount: number;
  onNavigateToSchedule: () => void;
}

/**
 * 📈 [CONTENT COMPONENT] การ์ดสรุปตัวเลขสำคัญ 4 ช่อง
 * (นัดหมาย, รายได้, แพทย์ออกตรวจ, รออนุมัติลา)
 */
export default function MetricCards({
  appointmentCount,
  revenue,
  onDutyDentistsCount,
  pendingLeavesCount,
  onNavigateToSchedule,
}: MetricCardsProps) {
  const cards = [
    { label: "นัดหมาย", val: appointmentCount, icon: Calendar, bg: "#E8F4FF", ic: "#1D6FA4", isAction: false },
    { label: "รายได้", val: `฿${revenue.toLocaleString()}`, icon: TrendingUp, bg: "#E8FFF0", ic: "#1B7A3E", isAction: false },
    { label: "แพทย์ออกตรวจ", val: onDutyDentistsCount, icon: UserCheck, bg: "#FFD6DC", ic: "#FF6B7E", isAction: false },
    { label: "รออนุมัติลา", val: pendingLeavesCount, icon: AlertCircle, bg: "#FFF3E0", ic: "#E65100", isAction: true, onClick: onNavigateToSchedule },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((c) => (
        <MetricCardItem
          key={c.label}
          label={c.label}
          val={c.val}
          icon={c.icon}
          bg={c.bg}
          ic={c.ic}
          isAction={c.isAction}
          onClick={c.onClick}
        />
      ))}
    </div>
  );
}
