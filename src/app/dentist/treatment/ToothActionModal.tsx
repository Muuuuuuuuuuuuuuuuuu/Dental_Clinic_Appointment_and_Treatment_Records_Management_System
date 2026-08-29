import React, { useState } from "react";
import { X, ChevronRight } from "lucide-react";
import { ToothStatus } from "./Odontogram";

export default function ToothActionModal({ 
  tooth, 
  onClose, 
  onAction 
}: { 
  tooth: number, 
  onClose: () => void, 
  onAction: (status: ToothStatus, serviceName?: string, notes?: string) => void 
}) {
  const [step, setStep] = useState<"main" | "filling_material" | "filling_surfaces" | "extraction" | "other_treatments">("main");
  const [fillingMaterial, setFillingMaterial] = useState<"สีเงิน" | "สีเหมือนฟัน">("สีเหมือนฟัน");

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-slate-800 text-white px-5 py-3.5 flex justify-between items-center">
          <span className="font-bold text-lg">จัดการซี่ฟัน: {tooth}</span>
          <button onClick={onClose} className="text-slate-300 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        
        <div className="p-5">
          {step === "main" && (
            <div className="space-y-3">
              <button onClick={() => onAction("red", undefined, `พบผุ/มีปัญหา ซี่ ${tooth}`)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors text-left font-medium">
                <span className="text-xl">🔴</span> ตรวจพบฟันผุ / มีปัญหา
              </button>
              <button onClick={() => setStep("filling_material")} className="w-full flex items-center justify-between p-3 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors text-left font-medium">
                <div className="flex items-center gap-3"><span className="text-xl">🔵</span> อุดฟัน</div>
                <ChevronRight size={18} className="text-blue-400" />
              </button>
              <button onClick={() => setStep("extraction")} className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors text-left font-medium">
                <div className="flex items-center gap-3"><span className="text-xl">❌</span> ถอนฟัน / ผ่าคุด</div>
                <ChevronRight size={18} className="text-slate-400" />
              </button>
              <button onClick={() => setStep("other_treatments")} className="w-full flex items-center justify-between p-3 rounded-xl border border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100 transition-colors text-left font-medium">
                <div className="flex items-center gap-3"><span className="text-xl">🦷</span> หัตถการอื่นๆ (ครอบฟัน, รักษาราก ฯลฯ)</div>
                <ChevronRight size={18} className="text-purple-400" />
              </button>
              <button onClick={() => onAction("normal")} className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors text-left font-medium mt-6">
                <span className="text-xl">⚪</span> ยกเลิกสถานะเป็นปกติ
              </button>
            </div>
          )}

          {step === "filling_material" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4 text-slate-600 font-medium">
                <button onClick={() => setStep("main")} className="hover:text-slate-900">ย้อนกลับ</button>
                <span>/</span>
                <span className="text-blue-700">ระบุวัสดุอุดฟัน</span>
              </div>
              <button onClick={() => { setFillingMaterial("สีเหมือนฟัน"); setStep("filling_surfaces"); }} className="w-full p-3 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-800 font-medium transition-colors">สีเหมือนฟัน (Composite)</button>
              <button onClick={() => { setFillingMaterial("สีเงิน"); setStep("filling_surfaces"); }} className="w-full p-3 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-800 font-medium transition-colors">สีเงิน (Amalgam)</button>
            </div>
          )}

          {step === "filling_surfaces" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4 text-slate-600 font-medium text-sm">
                <button onClick={() => setStep("main")} className="hover:text-slate-900">ย้อนกลับ</button>
                <span>/</span>
                <button onClick={() => setStep("filling_material")} className="hover:text-slate-900">อุด{fillingMaterial}</button>
                <span>/</span>
                <span className="text-blue-700 truncate">กี่ด้าน?</span>
              </div>
              <button onClick={() => onAction("blue", `อุดฟัน${fillingMaterial} (1 ด้าน)`, `อุดฟัน${fillingMaterial} 1 ด้าน ซี่ ${tooth}`)} className="w-full p-3 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-800 font-medium transition-colors">1 ด้าน</button>
              <button onClick={() => onAction("blue", `อุดฟัน${fillingMaterial} (2 ด้าน)`, `อุดฟัน${fillingMaterial} 2 ด้าน ซี่ ${tooth}`)} className="w-full p-3 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-800 font-medium transition-colors">2 ด้าน</button>
              <button onClick={() => onAction("blue", `อุดฟัน${fillingMaterial} (3 ด้าน)`, `อุดฟัน${fillingMaterial} 3 ด้านขึ้นไป ซี่ ${tooth}`)} className="w-full p-3 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-800 font-medium transition-colors">3 ด้านขึ้นไป</button>
            </div>
          )}

          {step === "extraction" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4 text-slate-600 font-medium">
                <button onClick={() => setStep("main")} className="hover:text-slate-900">ย้อนกลับ</button>
                <span>/</span>
                <span className="text-slate-700">ระบุประเภทการถอน</span>
              </div>
              <button onClick={() => onAction("cross", "ถอนฟันน้ำนม", `ถอนฟันน้ำนม ซี่ ${tooth}`)} className="w-full p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors">ถอนฟันน้ำนม</button>
              <button onClick={() => onAction("cross", "ถอนฟันแท้ (ปกติ)", `ถอนฟันแท้ (ปกติ) ซี่ ${tooth}`)} className="w-full p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors">ถอนฟันแท้ (ปกติ)</button>
              <button onClick={() => onAction("cross", "ถอนฟันแท้ (ยาก)", `ถอนฟันแท้ (ยาก) ซี่ ${tooth}`)} className="w-full p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors">ถอนฟันแท้ (ยาก)</button>
              <button onClick={() => onAction("cross", "ผ่าฟันคุด (ปกติ)", `ผ่าฟันคุด ซี่ ${tooth}`)} className="w-full p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors mt-2">ผ่าฟันคุด (ระดับทั่วไป)</button>
              <button onClick={() => onAction("cross", "ผ่าฟันคุด (ยาก/ลึก)", `ผ่าฟันคุด (ยาก/ลึก) ซี่ ${tooth}`)} className="w-full p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors">ผ่าฟันคุด (ระดับยาก/ลึก)</button>
            </div>
          )}

          {step === "other_treatments" && (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              <div className="flex items-center gap-2 mb-3 text-slate-600 font-medium sticky top-0 bg-white py-1">
                <button onClick={() => setStep("main")} className="hover:text-slate-900">ย้อนกลับ</button>
                <span>/</span>
                <span className="text-purple-700">หัตถการอื่นๆ</span>
              </div>
              
              <div className="text-[11px] font-bold text-slate-400 mt-2 mb-1">ครอบฟัน / วีเนียร์ / รากเทียม</div>
              <button onClick={() => onAction("blue", "ทำครอบฟัน (Crowns)", `ทำครอบฟัน ซี่ ${tooth}`)} className="w-full p-2.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-purple-800 font-medium transition-colors text-sm text-left">ทำครอบฟัน (Crowns)</button>
              <button onClick={() => onAction("blue", "วีเนียร์เคลือบผิวฟัน (Dental Veneers)", `ทำวีเนียร์ ซี่ ${tooth}`)} className="w-full p-2.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-purple-800 font-medium transition-colors text-sm text-left">วีเนียร์เคลือบผิวฟัน (Dental Veneers)</button>
              <button onClick={() => onAction("blue", "ฝังรากฟันเทียม (Implant Placement)", `ฝังรากฟันเทียม ซี่ ${tooth}`)} className="w-full p-2.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-purple-800 font-medium transition-colors text-sm text-left">ฝังรากฟันเทียม (Implant Placement)</button>
              
              <div className="text-[11px] font-bold text-slate-400 mt-3 mb-1">รักษารากฟัน</div>
              <button onClick={() => onAction("blue", "รักษารากฟันหน้า (Anterior Root Canal) ", `รักษารากฟันหน้า ซี่ ${tooth}`)} className="w-full p-2.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-purple-800 font-medium transition-colors text-sm text-left">รักษารากฟันหน้า</button>
              <button onClick={() => onAction("blue", "รักษารากฟันกรามน้อย (Premolar Root Canal) ", `รักษารากฟันกรามน้อย ซี่ ${tooth}`)} className="w-full p-2.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-purple-800 font-medium transition-colors text-sm text-left">รักษารากฟันกรามน้อย</button>
              <button onClick={() => onAction("blue", "รักษารากฟันกรามใหญ่ (Molar Root Canal)", `รักษารากฟันกรามใหญ่ ซี่ ${tooth}`)} className="w-full p-2.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-purple-800 font-medium transition-colors text-sm text-left">รักษารากฟันกรามใหญ่</button>
              <button onClick={() => onAction("blue", "รักษารากฟันน้ำนม (Pulpotomy)", `รักษารากฟันน้ำนม ซี่ ${tooth}`)} className="w-full p-2.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-purple-800 font-medium transition-colors text-sm text-left">รักษารากฟันน้ำนม</button>
              
              <div className="text-[11px] font-bold text-slate-400 mt-3 mb-1">ป้องกันฟันผุ</div>
              <button onClick={() => onAction("blue", "เคลือบหลุมร่องฟัน (Sealant) ", `เคลือบหลุมร่องฟัน ซี่ ${tooth}`)} className="w-full p-2.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-purple-800 font-medium transition-colors text-sm text-left">เคลือบหลุมร่องฟัน (Sealant)</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
