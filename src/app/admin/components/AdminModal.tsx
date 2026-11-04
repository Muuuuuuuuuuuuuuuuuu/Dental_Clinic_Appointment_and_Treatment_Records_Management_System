import React from "react";
import { X } from "lucide-react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  maxWidth?: string;
  children: React.ReactNode;
}

/**
 * คอมโพเนนต์หน้าต่างป๊อปอัปกลางสำหรับระบบแอดมิน (AdminModal)
 * มี Backdrop Blur พื้นหลังสีเข้ม และปุ่ม X ปิดหน้าต่างเป็นมาตรฐานเดียวกัน
 */
export default function AdminModal({
  isOpen,
  onClose,
  title,
  maxWidth = "max-w-2xl",
  children,
}: AdminModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: "rgba(26,54,93,0.4)", backdropFilter: "blur(4px)" }}
    >
      <div className={`bg-white rounded-3xl shadow-2xl w-full ${maxWidth} p-6 sm:p-8 max-h-[90vh] flex flex-col`}>
        {/* ส่วนหัวหน้าต่างป๊อปอัป */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <h2 className="text-xl font-bold" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} style={{ color: "#4A6080" }} />
          </button>
        </div>

        {/* ส่วนเนื้อหาภายในป๊อปอัป */}
        <div className="flex-1 overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
}

