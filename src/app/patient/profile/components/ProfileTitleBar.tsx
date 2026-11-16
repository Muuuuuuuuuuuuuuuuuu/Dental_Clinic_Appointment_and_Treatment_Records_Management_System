import { CheckCircle } from "lucide-react";

interface ProfileTitleBarProps {
  saved: boolean;
}

export default function ProfileTitleBar({ saved }: ProfileTitleBarProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold font-sans text-[#1A365D]">
          ข้อมูลส่วนตัว
        </h1>
        <p className="text-xs text-[#4A6080] mt-0.5">
          จัดการและตรวจสอบข้อมูลส่วนตัวของคุณ
        </p>
      </div>
      {saved && (
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
          style={{ backgroundColor: "#E8FFF0", color: "#1B7A3E" }}
        >
          <CheckCircle size={14} /> บันทึกสำเร็จ
        </div>
      )}
    </div>
  );
}

