import React, { useState } from "react";
import { X, ChevronRight } from "lucide-react";
import { ToothStatus } from "./Odontogram";

export default function ToothActionModal({ 
  tooth, 
  onClose, 
  onAction,
  services = []
}: { 
  tooth: number, 
  onClose: () => void, 
  onAction: (status: ToothStatus, service?: any, notes?: string) => void,
  services?: any[] 
}) {
  const [step, setStep] = useState<"main" | "select_service">("main");
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
    const isExtraction = service.name.includes("ถอน") || service.name.includes("ผ่าคุด") || service.category?.includes("ศัลยกรรม");
    const status = isExtraction ? "cross" : "blue";
    onAction(status, service, `ทำ ${service.name} ซี่ ${tooth}`);
  };

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
              <button onClick={() => onAction("red", undefined, `พบผุ/มีปัญหา ซี่ ${tooth}`)} className="w-full p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors text-center font-medium">
                ตรวจพบฟันผุ / มีปัญหา
              </button>
              
              <button onClick={() => setStep("select_service")} className="w-full flex items-center justify-between p-3 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors text-left font-medium">
                <span>บันทึกการทำหัตถการ</span>
                <ChevronRight size={18} className="text-blue-400" />
              </button>
              
              <button onClick={() => onAction("normal")} className="w-full p-3 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors text-center font-medium mt-6">
                ยกเลิกสถานะเป็นปกติ
              </button>
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
