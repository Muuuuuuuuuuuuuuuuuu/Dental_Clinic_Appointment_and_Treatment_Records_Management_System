import React from "react";

interface StepIndicatorProps {
  step: number;
}

/**
 * 🏷️ [HEADER COMPONENT] แถบแสดงสถานะขั้นตอน 1, 2, 3
 */
export default function StepIndicator({ step }: StepIndicatorProps) {
  const steps = ["ข้อมูลคนไข้", "รายละเอียดและเวลา", "ยืนยัน"];

  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-2 flex-shrink-0">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor:
                i < step ? "#E8FFF0" : i === step ? "#FF8C9A" : "rgba(26,54,93,0.06)",
              color: i < step ? "#1B7A3E" : i === step ? "white" : "#4A6080",
            }}
          >
            <span>
              {i + 1}. {label}
            </span>
          </div>
          {i < 2 && (
            <div
              className="w-3 sm:w-10 h-0.5"
              style={{
                backgroundColor: i < step ? "#22C55E" : "rgba(26,54,93,0.1)",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

