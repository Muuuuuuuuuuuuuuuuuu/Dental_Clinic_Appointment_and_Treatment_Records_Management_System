import { UserCheck, Clock, CreditCard, CheckCircle } from "lucide-react";
import { Appointment, StaffView } from "@/app/shared/data";

interface StatCardsProps {
  appts: Appointment[];
  setView: (v: StaffView) => void;
}

/**
 * 📊 [QUEUE COMPONENT] การ์ดสรุปสถิติคิวงาน 4 ช่อง (รอเช็คอิน, เช็คอินแล้ว, รอชำระเงิน, เสร็จสิ้น)
 */
export default function StatCards({ appts, setView }: StatCardsProps) {
  const waitCheckin = appts.filter(
    (a) => a.status === "ยืนยันการจอง" || a.status === "รอการยืนยัน"
  ).length;
  const checkedIn = appts.filter((a) => a.status === "เช็คอินเรียบร้อย").length;
  const pending = appts.filter((a) => a.status === "รอชำระเงิน").length;
  const done = appts.filter((a) => a.status === "เสร็จสิ้น").length;

  const stats = [
    { label: "รอเช็คอิน", val: waitCheckin, icon: UserCheck, bg: "#E8F4FF", ic: "#1D6FA4", action: null },
    { label: "เช็คอินเรียบร้อย", val: checkedIn, icon: Clock, bg: "#FDF4FF", ic: "#A21CAF", action: null },
    { label: "รอชำระเงิน", val: pending, icon: CreditCard, bg: "#FFFDE7", ic: "#B45309", action: "payment" as StaffView },
    { label: "เสร็จสิ้น", val: done, icon: CheckCircle, bg: "#E8FFF0", ic: "#1B7A3E", action: null },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`rounded-2xl bg-white p-4 ${s.action ? "cursor-pointer hover:shadow-md transition-shadow" : ""
            }`}
          style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
          onClick={() => s.action && setView(s.action)}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
            style={{ backgroundColor: s.bg }}
          >
            <s.icon size={18} style={{ color: s.ic }} />
          </div>
          <div
            className="text-2xl font-bold"
            style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
          >
            {s.val}
          </div>
          <div className="text-xs mt-0.5" style={{ color: "#4A6080" }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
