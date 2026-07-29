import React from "react";
import { Odontogram as ReactOdontogram } from "react-odontogram";
import "react-odontogram/style.css";

export type ToothStatus = "normal" | "red" | "blue" | "cross";

export interface OdontogramProps {
  toothData: Record<number, ToothStatus>;
  onToothClick?: (tooth: number) => void;
  isChild: boolean;
  setIsChild?: (val: boolean) => void;
  readonly?: boolean;
}

export default function Odontogram({ toothData, onToothClick, isChild, setIsChild, readonly }: OdontogramProps) {
  
  const cariesTeeth = Object.entries(toothData).filter(([_, s]) => s === 'red').map(([n]) => `teeth-${n}`);
  const filledTeeth = Object.entries(toothData).filter(([_, s]) => s === 'blue').map(([n]) => `teeth-${n}`);
  const missingTeeth = Object.entries(toothData).filter(([_, s]) => s === 'cross').map(([n]) => `teeth-${n}`);

  const conditions = [
    {
      label: "ต้องรักษา (แดง)",
      teeth: cariesTeeth,
      fillColor: "#FFE8EC",
      outlineColor: "#FF6B7E",
    },
    {
      label: "รักษาแล้ว (น้ำเงิน)",
      teeth: filledTeeth,
      fillColor: "#E8F4FF",
      outlineColor: "#1D6FA4",
    },
    {
      label: "ถอน/สูญเสีย",
      teeth: missingTeeth,
      fillColor: "#F1F5F9",
      outlineColor: "#94A3B8",
    }
  ];

  const handleChange = (selectedTeeth: any[]) => {
    if (selectedTeeth.length > 0 && !readonly && onToothClick) {
      const toothNum = parseInt(selectedTeeth[0].notations.fdi, 10);
      onToothClick(toothNum);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg" style={{ color: "#1A365D" }}>Odontogram (บันทึกสถานะฟัน)</h3>
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

      <div className="pb-4 flex justify-center relative">
        <div className="w-full max-w-lg origin-top pb-10 relative" style={{ transform: "scale(0.55)", marginBottom: "-25%" }}>
          
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
