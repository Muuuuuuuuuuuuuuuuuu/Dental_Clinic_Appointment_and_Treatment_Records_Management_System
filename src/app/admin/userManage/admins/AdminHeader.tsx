import { Plus, ArrowLeft } from "lucide-react";

interface AdminHeaderProps {
  totalCount: number;
  onOpenAdd: () => void;
  onBack?: () => void;
}

export default function AdminHeader({ totalCount, onOpenAdd, onBack }: AdminHeaderProps) {
  return (
    <div className="mb-6">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold mb-2 px-2.5 py-1 rounded-lg transition-colors hover:bg-white/80 w-fit cursor-pointer"
          style={{ color: "#4A6080" }}
        >
          <ArrowLeft size={14} />
          กลับไปเลือกประเภทผู้ใช้
        </button>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>
            จัดการผู้ดูแลระบบ
          </h1>
          <p className="text-sm text-[#4A6080] mt-1">
            ผู้ดูแลระบบทั้งหมด {totalCount} บัญชี
          </p>
        </div>
        <button
          onClick={onOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90 shadow-xs cursor-pointer"
          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}
        >
          <Plus size={15} /> เพิ่มผู้ดูแลระบบ
        </button>
      </div>
    </div>
  );
}

