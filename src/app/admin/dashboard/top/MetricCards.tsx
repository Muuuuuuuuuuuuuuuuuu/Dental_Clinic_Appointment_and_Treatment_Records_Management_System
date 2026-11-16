

interface MetricCardItemProps {
  label: string;

  val: string | number;
  
  
  isAction?: boolean;
  onClick?: () => void;
}


function MetricCardItem({
  label,

  val,

  isAction,
  onClick,

}: MetricCardItemProps) {
  return (
    <div
      className={`rounded-xl bg-white px-5 py-3  transition-shadow ${isAction ? "cursor-pointer hover:shadow-md" : ""
        }`}
      style={{ boxShadow: "2px 8px rgba(26,54,93,0.05)" }}
      onClick={isAction ? onClick : undefined}
    >
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


export default function MetricCards({
  appointmentCount,
  revenue,
  onDutyDentistsCount,
  pendingLeavesCount,
  onNavigateToSchedule,
}: MetricCardsProps) {
  const cards = [
    { label: "นัดหมาย", val: appointmentCount, isAction: false },
    { label: "รายได้", val: `฿${revenue.toLocaleString()}`, isAction: false },
    { label: "แพทย์ออกตรวจ", val: onDutyDentistsCount, isAction: false },
    { label: "รออนุมัติลา", val: pendingLeavesCount, isAction: true, onClick: onNavigateToSchedule },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((c) => (
        <MetricCardItem
          key={c.label}
          label={c.label}
          val={c.val}
          isAction={c.isAction}
          onClick={c.onClick}
        />
      ))}
    </div>
  );
}

