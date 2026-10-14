import React, { useState } from "react";
import { Odontogram as ReactOdontogram } from "react-odontogram";
import { Trash2, X } from "lucide-react";
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
  const [showDeleteTeethModal, setShowDeleteTeethModal] = useState(false);

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
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <div className="flex items-center gap-2.5">
          <h3 className="font-semibold text-lg" style={{ color: "#1A365D" }}>Odontogram (แผนผังฟัน)</h3>
          {!readonly && onToothClick && (
            <button
              type="button"
              onClick={() => setShowDeleteTeethModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border-2 border-rose-300 hover:bg-rose-100 hover:border-rose-400 transition-all shadow-sm"
              title="กดเพื่อเลือกลบฟันที่คนไข้เคยถอนหรือผ่ามาจากที่อื่น"
            >
              <Trash2 size={14} className="text-rose-600" />
              <span>ลบฟันที่เคยทำจากที่อื่น</span>
            </button>
          )}
        </div>
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
        <div className="mb-3 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50 text-center">
          <p className="text-xs text-blue-800 font-medium flex items-center justify-center gap-1.5">
            <span>👆</span> กรุณาคลิกเลือกซี่ฟันบนแผนผัง หรือกดปุ่ม <strong>"ลบฟันที่เคยทำจากที่อื่น"</strong> ด้านบน
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3.5 text-xs text-slate-600 mb-3 px-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFB3C1] border border-[#E63946] inline-block"></span>
          <span>พบปัญหา</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#BDE0FE] border border-[#023E8A] inline-block"></span>
          <span>รักษาแล้ว</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E2E8F0] border border-[#64748B] inline-block"></span>
          <span>ถอน/สูญเสีย (Missing)</span>
        </div>
      </div>

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

      {/* Summary of Deleted/Missing Teeth Below Chart */}
      {missingTeeth.length > 0 && (
        <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-700">ฟันที่ถูกลบ/เคยถอนแล้ว ({missingTeeth.length} ซี่):</span>
            <div className="flex flex-wrap gap-1">
              {missingTeeth.map(t => {
                const num = parseInt(t.replace('teeth-', ''), 10);
                return (
                  <span key={num} className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 border border-rose-200 font-bold flex items-center gap-1">
                    <span>ซี่ {num}</span>
                    {!readonly && onToothClick && (
                      <button 
                        type="button" 
                        onClick={() => onToothClick(num, "cross")}
                        className="text-rose-400 hover:text-rose-700 font-bold ml-1 text-sm leading-none"
                        title="คลิกเพื่อยกเลิกการลบฟันซี่นี้"
                      >
                        ×
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
          {!readonly && onToothClick && (
            <button
              type="button"
              onClick={() => setShowDeleteTeethModal(true)}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline"
            >
              แก้ไขการลบฟัน
            </button>
          )}
        </div>
      )}

      {/* Modal: ลบฟันที่เคยทำจากที่อื่น */}
      {showDeleteTeethModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[110] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
            {/* Header */}
            <div className="bg-slate-800 text-white px-5 py-3.5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Trash2 size={18} className="text-rose-400" />
                <span className="font-bold text-base">ลบฟันที่คนไข้เคยทำมาจากที่อื่น</span>
              </div>
              <button 
                type="button"
                onClick={() => setShowDeleteTeethModal(false)}
                className="text-slate-300 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                💡 <strong>วิธีใช้:</strong> กดเลือกซี่ฟันที่คนไข้เคยถอน หรือเคยผ่าฟันคุดมาจากที่อื่น ระบบจะทำเครื่องหมาย <strong>ลบออก (สีเทา)</strong> ให้ทันที โดยไม่คิดค่าบริการและไม่คิดเงินในบิล
              </div>

              {/* Quick Wisdom Teeth Shortcuts */}
              <div>
                <div className="text-xs font-bold text-slate-700 mb-2">
                  ⚡ ฟันคุดที่พบบ่อย (กดเพื่อลบ / ยกเลิก):
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { num: 18, label: "ซี่ 18 (คุดบนขวา)" },
                    { num: 28, label: "ซี่ 28 (คุดบนซ้าย)" },
                    { num: 48, label: "ซี่ 48 (คุดล่างขวา)" },
                    { num: 38, label: "ซี่ 38 (คุดล่างซ้าย)" },
                  ].map(w => {
                    const isRemoved = toothData[w.num] === "cross";
                    return (
                      <button
                        key={w.num}
                        type="button"
                        onClick={() => onToothClick && onToothClick(w.num, "cross")}
                        className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all flex flex-col items-center gap-1 ${
                          isRemoved 
                            ? "bg-rose-100 border-rose-300 text-rose-800 font-bold shadow-inner" 
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span className="font-semibold">{w.label}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isRemoved ? "bg-rose-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                          {isRemoved ? "✓ ลบแล้ว" : "+ เลือกลบ"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Full Teeth Selector Grid */}
              <div>
                <div className="text-xs font-bold text-slate-700 mb-2">
                  🦷 ผังซี่ฟันทั้งหมด (คลิกเลขซี่เพื่อสลับ ลบ / คืนค่า):
                </div>

                {/* Upper Teeth */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-2.5">
                  <div className="text-[11px] font-bold text-blue-700 mb-2 text-center uppercase tracking-wider">ฟันบน (Upper)</div>
                  <div className="flex justify-center gap-1.5 flex-wrap">
                    {[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28].map(num => {
                      const isRemoved = toothData[num] === "cross";
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => onToothClick && onToothClick(num, "cross")}
                          className={`w-7 h-8 rounded-lg text-xs font-bold transition-all border flex items-center justify-center ${
                            isRemoved
                              ? "bg-rose-600 text-white border-rose-700 shadow-sm scale-105"
                              : "bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50"
                          }`}
                          title={`ซี่ ${num} ${isRemoved ? '(ลบแล้ว)' : ''}`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Lower Teeth */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[11px] font-bold text-blue-700 mb-2 text-center uppercase tracking-wider">ฟันล่าง (Lower)</div>
                  <div className="flex justify-center gap-1.5 flex-wrap">
                    {[48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38].map(num => {
                      const isRemoved = toothData[num] === "cross";
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => onToothClick && onToothClick(num, "cross")}
                          className={`w-7 h-8 rounded-lg text-xs font-bold transition-all border flex items-center justify-center ${
                            isRemoved
                              ? "bg-rose-600 text-white border-rose-700 shadow-sm scale-105"
                              : "bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50"
                          }`}
                          title={`ซี่ ${num} ${isRemoved ? '(ลบแล้ว)' : ''}`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Summary of currently deleted teeth */}
              <div className="p-3 bg-slate-100 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-700">รายการฟันที่ถูกลบออก: </span>
                  <span className="text-rose-700 font-bold">
                    {missingTeeth.length > 0 
                      ? missingTeeth.map(t => t.replace('teeth-', '')).join(', ') + ' (' + missingTeeth.length + ' ซี่)'
                      : 'ยังไม่มีฟันที่ถูกลบ'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteTeethModal(false)}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold transition-colors shadow-sm"
                >
                  ✓ เสร็จสิ้น / ปิดหน้าต่างนี้
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
