import React from "react";
import { Calendar, TrendingUp, UserCheck, AlertCircle } from "lucide-react";
import MetricCardItem from "./MetricCardItem";

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

