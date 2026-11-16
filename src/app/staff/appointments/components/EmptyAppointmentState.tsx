import { Filter } from "lucide-react";

interface EmptyAppointmentStateProps {
  searchQuery: string;
}

/**
 * 📭 [APPOINTMENT COMPONENT] หน้าจอว่างเปล่าเมื่อไม่มีรายการนัดหมาย
 */
export default function EmptyAppointmentState({ searchQuery }: EmptyAppointmentStateProps) {
  return (
    <div
      className="rounded-2xl bg-white p-12 flex flex-col items-center justify-center text-center"
      style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: "#F0F4F8" }}
      >
        <Filter size={32} style={{ color: "#94A3B8" }} />
      </div>
      <p className="font-semibold text-lg" style={{ color: "#1A365D" }}>
        ไม่พบรายการนัดหมาย
      </p>
      <p className="text-sm mt-1" style={{ color: "#4A6080" }}>
        {searchQuery ? "ลองค้นหาด้วยคำอื่น" : "ไม่มีรายการในหมวดหมู่นี้"}
      </p>
    </div>
  );
}

