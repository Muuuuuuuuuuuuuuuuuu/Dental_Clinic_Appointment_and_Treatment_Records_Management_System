import { Users, Clock, CreditCard, CheckCircle, LucideIcon } from "lucide-react";

interface MetricCardItemProps {
  label: string;
  val: number | string;
  icon?: LucideIcon;
  bg: string;
  ic: string;
}

/**
 * 📊 การ์ดสรุปตัวเลข 1 ช่อง
 */
function MetricCardItem({
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
      {Icon && (
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
          style={{ backgroundColor: bg }}
        >
          <Icon size={16} style={{ color: ic }} />
        </div>
      )}
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

interface MetricCardsProps {
  totalPatients: number;
  waitingCount: number;
  pendingPaymentCount: number;
  doneCount: number;
}

/**
 * 📈 [CONTENT COMPONENT] การ์ดสรุปสถิติด่วน 4 ช่องของทันตแพทย์
 */
export default function DashboardMetricCards({
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
