
import { Calendar } from "lucide-react";

interface AppointmentTitleBarProps {
  onNewBooking: () => void;
}

export default function AppointmentTitleBar({ onNewBooking }: AppointmentTitleBarProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
        >
          รายการนัดหมาย
        </h1>
        <p className="text-sm" style={{ color: "#4A6080" }}>
          ติดตามสถานะนัดหมายทั้งหมดของคุณ
        </p>
      </div>
      <button
        onClick={onNewBooking}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
        style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}
      >
        <Calendar size={14} /> จองใหม่
      </button>
    </div>
  );
}

