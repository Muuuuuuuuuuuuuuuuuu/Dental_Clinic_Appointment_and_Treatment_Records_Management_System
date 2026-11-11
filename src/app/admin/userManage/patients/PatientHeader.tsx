import React from "react";
import { Plus, ArrowLeft, Search } from "lucide-react";

interface PatientHeaderProps {
  totalCount: number;
  search: string;
  onSearchChange: (val: string) => void;
  onOpenAdd: () => void;
  onBack?: () => void;
}

export default function PatientHeader({
  totalCount,
  search,
  onSearchChange,
  onOpenAdd,
  onBack,
}: PatientHeaderProps) {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>
            จัดการคนไข้
          </h1>
          <p className="text-sm text-[#4A6080] mt-1">
            คนไข้ทั้งหมด {totalCount} รายชื่อ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ค้นหาชื่อ หรือ HN..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white rounded-xl border border-gray-200 outline-none focus:border-[#1A365D]"
            />
          </div>
          <button
            onClick={onOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90 shadow-xs cursor-pointer whitespace-nowrap"
            style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}
          >
            <Plus size={15} /> เพิ่มคนไข้
          </button>
        </div>
      </div>
    </div>
  );
}

