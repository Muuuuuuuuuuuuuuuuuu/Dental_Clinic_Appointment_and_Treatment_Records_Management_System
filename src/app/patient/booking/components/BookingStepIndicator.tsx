import React from "react";
import { Check, ChevronRight } from "lucide-react";

interface BookingStepIndicatorProps {
  step: number;
}

const steps = [
  { id: 0, label: "บริการ" },
  { id: 1, label: "รายละเอียดและนัดหมาย" },
  { id: 2, label: "ข้อมูลสุขภาพ" },
  { id: 4, label: "ยืนยัน" },
];

export default function BookingStepIndicator({ step }: BookingStepIndicatorProps) {
  const currentStepIndex =
    step === 4 ? 3 : step === 2 ? 2 : step === 1 ? 1 : 0;

  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor:
                i < currentStepIndex
                  ? "#E8FFF0"
                  : i === currentStepIndex
                  ? "#FF8C9A"
                  : "rgba(26,54,93,0.06)",
              color:
                i < currentStepIndex
                  ? "#1B7A3E"
                  : i === currentStepIndex
                  ? "white"
                  : "#4A6080",
            }}
          >
            {i < currentStepIndex ? <Check size={11} /> : <span>{i + 1}</span>}
            <span>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight size={12} style={{ color: "#ccc" }} />
          )}
        </div>
      ))}
    </div>
  );
}

