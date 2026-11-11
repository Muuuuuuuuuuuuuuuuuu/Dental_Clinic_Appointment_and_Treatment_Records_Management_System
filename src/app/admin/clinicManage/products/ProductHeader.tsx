import React from "react";
import { Plus, ArrowLeft } from "lucide-react";

interface ProductHeaderProps {
  isAdding: boolean;
  onToggleAdd: () => void;
  onBack?: () => void;
}

export default function ProductHeader({ isAdding, onToggleAdd, onBack }: ProductHeaderProps) {
  return (
    <div className="flex justify-between items-end mb-3">
      <div>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 px-2 py-0.5 rounded-lg transition-colors hover:bg-gray-200/60 cursor-pointer text-[#4A6080]"
          >
            <ArrowLeft size={14} />
            กลับไปเลือกหมวดหมู่
          </button>
        )}
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>
          จัดการสินค้าและยา
        </h1>
        <p className="text-sm text-[#4A6080] mt-0.5">
          เพิ่ม/แก้ไข รายชื่อยาและสินค้าทั่วไปสำหรับขายหน้าเคาน์เตอร์
        </p>
      </div>
      <button
        onClick={onToggleAdd}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium text-xs text-white transition-all shadow-xs cursor-pointer hover:opacity-90"
        style={{ backgroundColor: "#1A365D" }}
      >
        {isAdding ? "ยกเลิก" : <><Plus size={15} /> เพิ่มรายการ</>}
      </button>
    </div>
  );
}
