import React from "react";
import { List, ChevronRight } from "lucide-react";

interface AppointmentsViewButtonProps {
  totalAppointments: number;
  onOpenAppointments: () => void;
}

/**
 * 📋 [SUMMARY COMPONENT] ปุ่มการ์ดสำหรับกดเปิดดูรายการนัดหมายทั้งหมด
 */
export default function AppointmentsViewButton({
  totalAppointments,
  onOpenAppointments,
}: AppointmentsViewButtonProps) {
  return (
    <button
      type="button"
      onClick={onOpenAppointments}
      className="lg:col-span-4 rounded-xl px-4 py-3 flex items-center justify-between text-left group transition-all hover:shadow-lg cursor-pointer h-full"
      style={{
        background: "linear-gradient(135deg, #FF8C9A 0%, #FF6B7E 100%)",
        boxShadow: "0 2px 8px rgba(255,107,126,0.2)",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg flex-shrink-0">
          <List size={16} color="white" />
        </div>
        <div>
          <div className="text-[10px] text-white/80">รายการนัดหมาย</div>
          <div className="text-lg font-bold text-white">{totalAppointments} รายการ</div>
        </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-1">
        <ChevronRight size={16} color="white" />
      </div>
    </button>
  );
}
