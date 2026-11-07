import React from "react";
import { Users, Clock, CreditCard, CheckCircle } from "lucide-react";
import MetricCardItem from "./MetricCardItem";

interface MetricCardsProps {
  totalPatients: number;
  waitingCount: number;
  pendingPaymentCount: number;
  doneCount: number;
}

/**
 * 📈 [CONTENT COMPONENT] การ์ดสรุปสถิติด่วน 4 ช่องของทันตแพทย์
 */
export default function MetricCards({
  totalPatients,
  waitingCount,
  pendingPaymentCount,
  doneCount,
}: MetricCardsProps) {
  const cards = [
    { label: "คนไข้วันนี้", val: totalPatients, icon: Users, bg: "#E8F4FF", ic: "#1D6FA4" },
    { label: "รอรับการรักษา", val: waitingCount, icon: Clock, bg: "#FFF3E0", ic: "#E65100" },
    { label: "รอชำระเงิน", val: pendingPaymentCount, icon: CreditCard, bg: "#FFFDE7", ic: "#B45309" },
    { label: "เสร็จสิ้นแล้ว", val: doneCount, icon: CheckCircle, bg: "#E8FFF0", ic: "#1B7A3E" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c) => (
        <MetricCardItem
          key={c.label}
          label={c.label}
          val={c.val}
          icon={c.icon}
          bg={c.bg}
          ic={c.ic}
        />
      ))}
    </div>
  );
}

