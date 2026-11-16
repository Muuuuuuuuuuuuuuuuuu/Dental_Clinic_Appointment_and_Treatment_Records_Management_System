import { Plus, ArrowLeft } from "lucide-react";

interface ServiceHeaderProps {
  isAdding: boolean;
  onOpenAdd: () => void;
  onBack?: () => void;
}

export default function ServiceHeader({ onOpenAdd, onBack }: ServiceHeaderProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold mb-2 px-2.5 py-1 rounded-lg transition-colors hover:bg-white/80"
            style={{ color: "#4A6080" }}
          >
            <ArrowLeft size={14} />
            กลับไปเลือกหมวดหมู่
          </button>
        )}
        <h1
          className="text-2xl font-bold text-[#1A365D]"
          style={{ fontFamily: "Sarabun, sans-serif" }}
        >
          ตั้งค่าบริการ
        </h1>
        <p className="text-sm text-[#4A6080] mt-1">จัดการบริการทันตกรรม หมวดหมู่ และราคาค่ารักษา</p>
      </div>

      <button
        onClick={onOpenAdd}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF8C9A] text-white rounded-xl text-xs font-semibold hover:bg-[#FF7A8A] transition-colors shadow-xs"
      >
        <Plus size={15} /> เพิ่มบริการใหม่
      </button>
    </div>
  );
}
