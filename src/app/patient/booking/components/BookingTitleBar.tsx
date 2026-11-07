import React from "react";
import { ChevronLeft } from "lucide-react";

interface BookingTitleBarProps {
  step: number;
  isFollowUp?: boolean;
  onBack: () => void;
}

export default function BookingTitleBar({ step, isFollowUp, onBack }: BookingTitleBarProps) {
  const showBack = step > (isFollowUp ? 1 : 0);

  return (
    <div className="flex items-center gap-3 mb-5">
      {showBack && (
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white text-[#1A365D] transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
      )}
      <div>
        <h1 className="text-2xl font-bold font-sans text-[#1A365D]">
          จองนัดหมาย
        </h1>
        <p className="text-sm text-[#4A6080]">
          {step === 0 && "เลือกบริการ"}
          {step === 1 && "รายละเอียดและเลือกเวลา"}
          {step === 2 && "ตรวจสอบประวัติสุขภาพ"}
          {step === 4 && "ยืนยันการจอง"}
        </p>
      </div>
    </div>
  );
}

