import React, { useState } from "react";
import { X, ChevronRight, AlertCircle, Sparkles, Ban, RotateCcw, Trash2 } from "lucide-react";
import { ToothStatus } from "./Odontogram";
import { SupernumeraryTooth } from "./ToothGeometry";

export default function ToothActionModal({ 
  tooth, 
  toothLabel,
  currentStatus,
  onClose, 
  onAction,
  services = [],
  onRemoveExtraTooth,
  onAddExtraTooth,
  hasExtraTooth,
  initialNotes
}: { 
  tooth: number | string, 
  toothLabel?: string,
  currentStatus?: ToothStatus,
  onClose: () => void, 
  onAction: (status: ToothStatus, service?: any, notes?: string) => void,
  services?: any[],
  onRemoveExtraTooth?: (id: string) => void,
  onAddExtraTooth?: (newTooth: SupernumeraryTooth) => void,
  hasExtraTooth?: boolean,
  initialNotes?: string
}) {
  const [step, setStep] = useState<"main" | "specify_problem" | "select_service">("main");
  const [problemDetail, setProblemDetail] = useState(initialNotes || "");
  const displayName = toothLabel || (typeof tooth === "string" ? tooth : `ซี่ ${tooth}`);
  // Filter out services that apply to the whole mouth (not specific to a tooth)
  const filteredServices = services.filter(s => {
    const applyType = s.applyTo?.toLowerCase();
    if (applyType === 'tooth' || applyType === 'รายซี่') return true;
    // ถ้าตั้งค่าเป็น ทั้งปาก ชัดเจน ให้บล็อคเสมอ
    if (applyType === 'mouth' || applyType === 'ทั้งปาก') return false;
    
    // ถ้าไม่ได้ตั้งค่า (ข้อมูลเก่า) ค่อยใช้คีย์เวิร์ด
    const isMouthKeyword = s.name.includes('ขูดหินปูน') || s.name.includes('จัดฟัน') || s.name.includes('ตรวจสุขภาพ') || s.name.includes('ฟลูออไรด์');
    return !isMouthKeyword;
  });
  
  // Group filtered services by category
  const categories = Array.from(new Set(filteredServices.map(s => s.category || "อื่นๆ")));
  
  const handleServiceClick = (service: any) => {
    const isExtraction = service.name.includes("ถอน") || service.name.includes("ผ่าคุด") || service.name.includes("ผ่าฟัน") || service.category?.includes("ศัลยกรรม");
    const status = isExtraction ? "cross" : "blue";
    onAction(status, service, `ทำ ${service.name} ${displayName}`);
  };

  const getStatusBadge = () => {
    if (currentStatus === "red") {
      return <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-200 border border-red-400/30">สถานะ: พบปัญหา</span>;
    }
    if (currentStatus === "blue") {
      return <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">สถานะ: รักษาแล้ว</span>;
    }
    if (currentStatus === "cross") {
      return <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-500/30 text-slate-200 border border-slate-400/30">สถานะ: ถอน/สูญเสียฟัน</span>;
    }
    return <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">สถานะ: ฟันปกติ</span>;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-800 text-white px-5 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{displayName}</span>
            {getStatusBadge()}
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        
        <div className="p-5">
          {step === "main" && (
            <div className="space-y-2.5">
              {/* Option 1: พบปัญหา / มีรอยผุ */}
              <button 
                type="button"
                onClick={() => setStep("specify_problem")} 
                className="w-full p-3 rounded-xl border border-red-200 bg-red-50/70 hover:bg-red-100/80 text-red-700 transition-all text-left flex items-start justify-between group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0 text-red-600 mt-0.5 group-hover:scale-105 transition-transform">
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">ตรวจพบฟันผุ / มีปัญหา</div>
                    <div className="text-xs text-red-600/80">พิมพ์ระบุปัญหาที่ต้องรักษา (สีแดง)</div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-red-400 mt-2 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </button>
              
              {/* Option 2: บันทึกหัตถการในคลินิกนี้ */}
              <button 
                onClick={() => setStep("select_service")} 
                className="w-full p-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-blue-800 transition-all text-left flex items-start justify-between group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 mt-0.5 group-hover:scale-105 transition-transform">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">บันทึกการทำหัตถการ (คลินิกนี้)</div>
                    <div className="text-xs text-blue-600/80">อุดฟัน, ครอบฟัน, หรือถอนฟันรอบนี้ (มีค่าบริการ)</div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-blue-400 mt-2 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </button>


              
              {/* Option 4: ยกเลิก / คืนค่าเป็นปกติ */}
              <button 
                onClick={() => onAction("normal")} 
                className="w-full p-2.5 rounded-xl border border-dashed border-gray-300 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors text-center text-xs font-medium flex items-center justify-center gap-1.5 mt-4"
              >
                <RotateCcw size={14} />
                <span>คืนค่าสถานะเป็นฟันปกติ (Clear Status)</span>
              </button>

              {/* Option 5: สำหรับฟันเกิน/ฟันซ้อน - ลบออกจากแผนผัง */}
              {onRemoveExtraTooth && (
                <button
                  type="button"
                  onClick={() => onRemoveExtraTooth(String(tooth))}
                  className="w-full p-2.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors text-center text-xs font-semibold flex items-center justify-center gap-1.5 mt-2"
                >
                  <Trash2 size={14} className="text-rose-600" />
                  <span>ลบฟันเกิน/ฟันซ้อนซี่นี้ออกจากแผนผัง</span>
                </button>
              )}
            </div>
          )}

          {step === "specify_problem" && (
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 text-slate-600 font-medium">
                <button 
                  type="button" 
                  onClick={() => setStep("main")} 
                  className="hover:text-slate-900 text-xs font-semibold flex items-center gap-1"
                >
                  ◀ ย้อนกลับ
                </button>
                <span>/</span>
                <span className="text-red-700 text-xs font-bold">ระบุปัญหาที่ตรวจพบ</span>
              </div>

              <div className="p-3.5 bg-red-50/80 border border-red-200 rounded-xl space-y-2.5">
                <div className="flex items-center gap-2 text-red-950 font-bold text-xs">
                  <AlertCircle size={16} className="text-red-600 shrink-0" />
                  <span>ระบุปัญหาสำหรับ {displayName}</span>
                </div>
                
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    กรอกรายละเอียดปัญหา / อาการที่ตรวจพบ:
                  </label>
                  <textarea
                    value={problemDetail}
                    onChange={e => setProblemDetail(e.target.value)}
                    placeholder="พิมพ์ระบุปัญหาได้อย่างอิสระ เช่น ฟันผุลึกด้าน Occlusal, วัสดุอุดเดิมแตกบิ่น, ฟันร้าวเสียวเวลาเคี้ยว, มีหนองปลายราก..."
                    rows={3}
                    className="w-full text-xs p-2.5 rounded-lg border border-red-300 focus:outline-none focus:ring-1 focus:ring-red-500 bg-white text-slate-800 resize-none shadow-2xs"
                    autoFocus
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    * ข้อความนี้จะถูกบันทึกลงในช่องบันทึกการรักษา/อาการให้อัตโนมัติ (ไม่พิมพ์ก็ได้)
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep("main")}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const detail = problemDetail.trim();
                    const note = detail
                      ? `พบปัญหา ${displayName}: ${detail}`
                      : `พบผุ/มีปัญหา ${displayName}`;
                    onAction("red", undefined, note);
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <span>✓ บันทึกปัญหา (ฟันสีแดง)</span>
                </button>
              </div>
            </div>
          )}

          {step === "select_service" && (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              <div className="flex items-center gap-2 mb-3 text-slate-600 font-medium sticky top-0 bg-white py-1">
                <button onClick={() => setStep("main")} className="hover:text-slate-900">ย้อนกลับ</button>
                <span>/</span>
                <span className="text-blue-700">เลือกหัตถการ</span>
              </div>
              
              {filteredServices.length === 0 ? (
                <div className="text-center py-4 text-slate-500 text-sm">ไม่พบข้อมูลหัตถการในระบบ</div>
              ) : (
                categories.map(category => {
                  const svcs = filteredServices.filter(s => (s.category || "อื่นๆ") === category);
                  if (svcs.length === 0) return null;
                  
                  return (
                    <div key={category} className="mb-4">
                      <div className="text-[11px] font-bold text-slate-400 mt-2 mb-2 uppercase">{category}</div>
                      <div className="space-y-1.5">
                        {svcs.map(svc => (
                          <button key={svc.id} onClick={() => handleServiceClick(svc)} className="w-full p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors text-sm text-left">
                            {svc.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
