import React, { useState } from "react";
import { Odontogram as ReactOdontogram } from "react-odontogram";
import "react-odontogram/style.css";

export type ToothStatus = "normal" | "red" | "blue" | "cross";

export interface OdontogramProps {
  toothData: Record<number, ToothStatus>;
  onToothClick?: (tooth: number, status?: ToothStatus) => void;
  isChild: boolean;
  setIsChild?: (val: boolean) => void;
  readonly?: boolean;
}

export default function Odontogram({ toothData, isChild, setIsChild, readonly = false, onToothClick }: OdontogramProps) {
  const [activeBrush, setActiveBrush] = useState<ToothStatus | "cycle">("cycle");
  const cariesTeeth = Object.entries(toothData).filter(([_, s]) => s === 'red').map(([n]) => `teeth-${n}`);
  const filledTeeth = Object.entries(toothData).filter(([_, s]) => s === 'blue').map(([n]) => `teeth-${n}`);
  const missingTeeth = Object.entries(toothData).filter(([_, s]) => s === 'cross').map(([n]) => `teeth-${n}`);

  const conditions = [
    {
      label: "พบปัญหา / ต้องรักษา (แดง)",
      teeth: cariesTeeth,
      fillColor: "#FFB3C1",
      outlineColor: "#E63946",
    },
    {
      label: "รักษาแล้ว (น้ำเงิน)",
      teeth: filledTeeth,
      fillColor: "#BDE0FE",
      outlineColor: "#023E8A",
    },
    {
      label: "ถอน/สูญเสีย",
      teeth: missingTeeth,
      fillColor: "#E2E8F0",
      outlineColor: "#64748B",
    }
  ];

  const handleChange = (selectedTeeth: any[]) => {
    if (selectedTeeth.length > 0 && !readonly && onToothClick) {
      const toothNum = parseInt(selectedTeeth[0].notations.fdi, 10);
      onToothClick(toothNum, undefined);
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg" style={{ color: "#1A365D" }}>Odontogram (แผนผังฟัน)</h3>
        {!readonly && setIsChild && (
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
        )}
      </div>

      {!readonly && (
        <div className="mb-4 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50 text-center">
          <p className="text-xs text-blue-800 font-medium flex items-center justify-center gap-1.5">
            <span>👆</span> กรุณาคลิกเลือกซี่ฟันบนแผนผัง เพื่อระบุหัตถการ
          </p>
        </div>
      )}

      <div className="pb-4 flex justify-center relative">
        <div className={`w-full max-w-lg origin-top pb-10 relative transition-opacity duration-300`} style={{ transform: "scale(0.45)", marginBottom: "-45%" }}>
          
          {/* Separator Line & Labels */}
          <div className="absolute w-[140%] left-[-20%] top-[49%] border-t-2 border-dashed border-blue-200/70 z-0 pointer-events-none">
             <div className="absolute -top-8 w-full text-center text-blue-400/80 font-bold text-xl tracking-wider">ฟันบน (Upper)</div>
             <div className="absolute top-3 w-full text-center text-blue-400/80 font-bold text-xl tracking-wider">ฟันล่าง (Lower)</div>
          </div>

          <div className="relative z-10">
            <ReactOdontogram
              teethConditions={conditions}
              showLabels={true}
              readOnly={readonly}
              maxTeeth={isChild ? 5 : 8}
              singleSelect={true}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
