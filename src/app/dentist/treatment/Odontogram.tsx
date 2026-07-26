import React, { useState } from "react";

export type ToothStatus = "normal" | "red" | "blue" | "cross";

export interface OdontogramProps {
  toothData: Record<number, ToothStatus>;
  onToothClick: (tooth: number) => void;
  isChild: boolean;
  setIsChild: (val: boolean) => void;
}

export default function Odontogram({ toothData, onToothClick, isChild, setIsChild }: OdontogramProps) {
  // Adult teeth
  const adultUpperRight = [18, 17, 16, 15, 14, 13, 12, 11];
  const adultUpperLeft  = [21, 22, 23, 24, 25, 26, 27, 28];
  const adultLowerRight = [48, 47, 46, 45, 44, 43, 42, 41];
  const adultLowerLeft  = [31, 32, 33, 34, 35, 36, 37, 38];

  // Child teeth
  const childUpperRight = [55, 54, 53, 52, 51];
  const childUpperLeft  = [61, 62, 63, 64, 65];
  const childLowerRight = [85, 84, 83, 82, 81];
  const childLowerLeft  = [71, 72, 73, 74, 75];

  const renderTooth = (num: number, isUpper: boolean) => {
    const status = toothData[num] || "normal";
    let fillColor = "white";
    let strokeColor = "#4A6080";

    if (status === "red") { fillColor = "#FFE8EC"; strokeColor = "#FF6B7E"; }
    else if (status === "blue") { fillColor = "#E8F4FF"; strokeColor = "#1D6FA4"; }

    return (
      <div key={num} className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => onToothClick(num)}>
        <span className="text-xs font-medium" style={{ color: "#4A6080" }}>{num}</span>
        <svg width="32" height="40" viewBox="0 0 32 40" className="transition-transform hover:scale-110">
          {/* Simple tooth shape */}
          <path
            d={isUpper ? "M 4 36 Q 4 10 16 4 Q 28 10 28 36 Z" : "M 4 4 Q 4 30 16 36 Q 28 30 28 4 Z"}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2"
          />
          {/* Occlusal inner shape */}
          <ellipse cx="16" cy="20" rx="6" ry="10" fill={status === "blue" ? "#1D6FA4" : status === "red" ? "#FF6B7E" : "transparent"} stroke={strokeColor} strokeWidth="1" />
          {/* Cross / Missing */}
          {status === "cross" && (
            <g stroke="#1A365D" strokeWidth="3">
              <line x1="4" y1="4" x2="28" y2="36" />
              <line x1="28" y1="4" x2="4" y2="36" />
            </g>
          )}
        </svg>
      </div>
    );
  };

  const renderRow = (right: number[], left: number[], isUpper: boolean) => (
    <div className="flex justify-center gap-6 mb-4">
      <div className="flex gap-1 border-r-2 pr-6" style={{ borderColor: "rgba(26,54,93,0.1)" }}>
        {right.map(n => renderTooth(n, isUpper))}
      </div>
      <div className="flex gap-1 pl-6">
        {left.map(n => renderTooth(n, isUpper))}
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-2xl" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-sm" style={{ color: "#1A365D" }}>บันทึกกราฟิกฟัน (Odontogram)</h3>
        <div className="flex items-center bg-gray-100 rounded-xl p-1">
          <button onClick={() => setIsChild(false)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${!isChild ? 'bg-white shadow' : ''}`}
            style={{ color: !isChild ? "#1A365D" : "#4A6080" }}>
            ฟันแท้ (Adult)
          </button>
          <button onClick={() => setIsChild(true)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${isChild ? 'bg-white shadow' : ''}`}
            style={{ color: isChild ? "#1A365D" : "#4A6080" }}>
            ฟันน้ำนม (Child)
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="min-w-[600px] flex flex-col items-center">
          {/* Upper Jaw */}
          {isChild ? renderRow(childUpperRight, childUpperLeft, true) : renderRow(adultUpperRight, adultUpperLeft, true)}
          
          <div className="w-full h-px my-2" style={{ backgroundColor: "rgba(26,54,93,0.06)" }} />
          
          {/* Lower Jaw */}
          {isChild ? renderRow(childLowerRight, childLowerLeft, false) : renderRow(adultLowerRight, adultLowerLeft, false)}
        </div>
      </div>

      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ border: "1px solid #4A6080", backgroundColor: "white" }} />
          <span className="text-xs text-gray-500">ปกติ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ border: "1px solid #FF6B7E", backgroundColor: "#FFE8EC" }} />
          <span className="text-xs text-gray-500">ต้องรักษา (แดง)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ border: "1px solid #1D6FA4", backgroundColor: "#E8F4FF" }} />
          <span className="text-xs text-gray-500">รักษาแล้ว (น้ำเงิน)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded flex items-center justify-center border" style={{ borderColor: "#1A365D" }}>
            <span style={{ fontSize: "10px", fontWeight: "bold" }}>X</span>
          </div>
          <span className="text-xs text-gray-500">ถอน/สูญเสีย</span>
        </div>
      </div>
    </div>
  );
}
