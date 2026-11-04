import React from "react";
import { ArrowLeft } from "lucide-react";

interface SubViewWrapperProps {
  onBack: () => void;
  title?: string;
  children: React.ReactNode;
}

/**
 * คอมโพเนนต์กลางสำหรับปุ่มย้อนกลับของเมนูแอดมิน (SubViewWrapper)
 * ใช้ร่วมกันใน: ScheduleHub, ClinicHub, UsersHub
 */
export default function SubViewWrapper({ onBack, title, children }: SubViewWrapperProps) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-white/80"
          style={{ color: "#4A6080" }}
        >
          <ArrowLeft size={16} />
          กลับไปเลือกหมวดหมู่
        </button>
        {title && (
          <span className="text-sm font-semibold" style={{ color: "#1A365D" }}>
            {title}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

