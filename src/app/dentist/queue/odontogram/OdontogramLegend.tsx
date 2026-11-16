import React from "react";

interface OdontogramLegendProps {
  currentMode: "treatment" | "patient";
  patientName?: string;
  readonly?: boolean;
  isChild?: boolean;
  setIsChild?: (val: boolean) => void;
  cariesCount: number;
  filledCount: number;
  missingCount: number;
  extraCount: number;
}

export default function OdontogramLegend({
  currentMode,
  patientName,
  readonly,
  isChild,
  setIsChild,
  cariesCount,
  filledCount,
  missingCount,
  extraCount,
}: OdontogramLegendProps) {
  return (
    <>
      {/* แถวส่วนหัว: ชื่อผังฟัน และปุ่มสลับฟันแท้/ฟันเด็ก */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="font-bold text-base whitespace-nowrap" style={{ color: "#1A365D" }}>
            {readonly ? "แผนผังสุขภาพฟัน" : "Odontogram(แผนผังฟัน)"}
          </h3>
          {patientName && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100">
              {patientName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {setIsChild && (
            <div className="inline-flex items-center bg-slate-100/90 rounded-lg p-0.5 border border-slate-200/80 shadow-xs shrink-0">
              <button
                type="button"
                onClick={() => setIsChild(false)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold leading-tight whitespace-nowrap transition-all ${!isChild
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
                title="ชุดฟันแท้ (Adult)"
              >
                ฟันแท้
              </button>
              <button
                type="button"
                onClick={() => setIsChild(true)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold leading-tight whitespace-nowrap transition-all ${isChild
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
                title="ชุดฟันน้ำนม (Child)"
              >
                ฟันน้ำนม
              </button>
            </div>
          )}
        </div>
      </div>



      {/* คำอธิบายสัญลักษณ์สี */}
      <div className="flex flex-wrap items-center justify-center gap-3.5 text-xs text-slate-600 mb-3 px-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFE4E6] border border-[#F43F5E] inline-block"></span>
          <span>พบปัญหา {currentMode === "patient" && <span className="font-bold text-rose-600">({cariesCount})</span>}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#BDE0FE] border border-[#023E8A] inline-block"></span>
          <span>รักษาแล้ว {currentMode === "patient" && <span className="font-bold text-blue-600">({filledCount})</span>}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1] border border-dashed border-[#475569] inline-block"></span>
          <span>ถอน/สูญเสีย {currentMode === "patient" && <span className="font-bold text-slate-600">({missingCount})</span>}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FEF9C3] border-2 border-amber-500 inline-block"></span>
          <span>ฟันเกิน/ซ้อน {currentMode === "patient" && <span className="font-bold text-amber-700">({extraCount})</span>}</span>
        </div>
      </div>
    </>
  );
}

