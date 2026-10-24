import React, { useState, useEffect } from "react";
import { ArrowLeft, ShieldCheck, Activity, X } from "lucide-react";
import Odontogram, { ToothStatus } from "../../dentist/treatment/Odontogram";
import { SupernumeraryTooth, getExtraToothLocation } from "../../dentist/treatment/ToothGeometry";
import { getPatientTreatmentRecords } from "../../shared/supabaseApi";

const getToothNameTh = (numStr: string, isChild: boolean) => {
  const n = parseInt(numStr, 10);
  if (isNaN(n)) return "";
  const q = Math.floor(n / 10);
  const t = n % 10;
  
  let pos = "";
  if (q === 1 || q === 5) pos = "ขวาบน";
  else if (q === 2 || q === 6) pos = "ซ้ายบน";
  else if (q === 3 || q === 7) pos = "ซ้ายล่าง";
  else if (q === 4 || q === 8) pos = "ขวาล่าง";

  let type = "";
  if (isChild) {
    if (t === 1 || t === 2) type = "ฟันหน้า";
    else if (t === 3) type = "ฟันเขี้ยว";
    else if (t === 4 || t === 5) type = "ฟันกราม";
  } else {
    if (t === 1 || t === 2) type = "ฟันหน้า";
    else if (t === 3) type = "ฟันเขี้ยว";
    else if (t === 4 || t === 5) type = "ฟันกรามน้อย";
    else if (t === 6 || t === 7 || t === 8) type = "ฟันกราม";
  }

  return `${type}${pos} (ซี่ ${n})`;
};

interface DentalRecordViewProps {
  onBack: () => void;
  onBookAppointment?: () => void;
  toothData?: Record<number | string, any>;
  lastUpdated?: string;
  advice?: string;
  user?: any;
}

export default function DentalRecordView({ 
  onBack, 
  onBookAppointment,
  toothData = {},
  lastUpdated = "-",
  advice = "ยังไม่มีคำแนะนำ",
  user
}: DentalRecordViewProps) {
  const [isChild, setIsChild] = useState(false);
  
  // Extract clean initial tooth data & extraTeeth if passed via props
  const { extraTeeth: initialExtras = [], wholeMouth: _, ...cleanInitialTeeth } = (toothData as any) || {};
  const [localToothData, setLocalToothData] = useState<Record<number | string, ToothStatus>>(cleanInitialTeeth || {});
  const [extraTeeth, setExtraTeeth] = useState<SupernumeraryTooth[]>(Array.isArray(initialExtras) ? initialExtras : []);
  
  const [localLastUpdated, setLocalLastUpdated] = useState<string>(lastUpdated || "-");
  const [localAdvice, setLocalAdvice] = useState<string>(advice || "ยังไม่มีคำแนะนำ");
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [clickedTooth, setClickedTooth] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.patientId) return;
    getPatientTreatmentRecords(user.patientId).then(records => {
      setHistoryRecords(records);
      const withTeeth = records.filter((r: any) => r.odontogramData && Object.keys(r.odontogramData).length > 0);
      if (withTeeth.length > 0) {
        // Sort descending by date
        const sorted = withTeeth.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const latest = sorted[0];
        const raw = latest.odontogramData || {};
        const { extraTeeth: savedExtras = [], wholeMouth: _wm, ...cleanTeeth } = raw;
        setLocalToothData(cleanTeeth);
        setExtraTeeth(Array.isArray(savedExtras) ? savedExtras : []);
        setLocalAdvice(latest.recommendations || "ดูแลรักษาความสะอาดตามปกติ");
        setLocalLastUpdated(new Date(latest.date).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }));
      }
    }).catch(console.error);
  }, [user]);

  // Counting caries and filled teeth
  const cariesCount = Object.entries(localToothData).filter(([k, s]) => s === 'red' && k !== 'extraTeeth' && k !== 'wholeMouth').length;
  const filledCount = Object.entries(localToothData).filter(([k, s]) => s === 'blue' && k !== 'extraTeeth' && k !== 'wholeMouth').length;
  
  // Auto-infer missing teeth from extraction history
  const inferredMissingTeeth = new Set<string>();
  historyRecords.forEach(record => {
    if (record.treatmentServices) {
      record.treatmentServices.forEach((s: string) => {
        const match = s.match(/ถอนฟัน.*?ซี่ที่:\s*(\d+)/);
        if (match) inferredMissingTeeth.add(match[1]);
      });
    }
  });
  
  const explicitMissing = Object.entries(localToothData)
    .filter(([k, s]) => s === 'cross' && k !== 'extraTeeth' && k !== 'wholeMouth')
    .map(([n]) => String(n).replace('teeth-', ''));
  const missingTeeth = Array.from(new Set([...explicitMissing, ...inferredMissingTeeth]));

  // Merged tooth data so that inferred missing teeth also display as hollow/cross in odontogram
  const mergedToothData: Record<number | string, ToothStatus> = { ...localToothData };
  missingTeeth.forEach(t => {
    if (!mergedToothData[t]) {
      mergedToothData[t] = 'cross';
    }
  });

  // Mobile-friendly tooth & extra tooth popup modal
  const renderToothPopup = () => {
    if (!clickedTooth) return null;
    const cleanKey = clickedTooth.replace('teeth-', '');
    const isExtra = cleanKey === 'mesiodens' || cleanKey.endsWith('S') || cleanKey.includes('S-') || extraTeeth.some(t => t.id === cleanKey);
    
    let toothDisplayNum = cleanKey;
    let toothName = "";
    let extraLocationDesc = "";
    
    if (isExtra) {
      toothDisplayNum = cleanKey === "mesiodens" ? "+11S" : `+${cleanKey}`;
      toothName = cleanKey === "mesiodens" 
        ? "ฟันเกินกึ่งกลางฟันหน้าบน (Mesiodens)" 
        : `ฟันเกิน / ฟันซ้อน (+${cleanKey})`;
      extraLocationDesc = getExtraToothLocation(cleanKey);
    } else {
      toothName = getToothNameTh(cleanKey, isChild);
    }
    
    const status = mergedToothData[cleanKey] || "normal";
    let statusStr = isExtra ? "ตรวจพบฟันเกิน (ปกติ/ติดตามอาการ)" : "ปกติ (Normal)";
    let colorStr = isExtra ? "#D97706" : "#10B981"; // Amber for extra, Green for normal
    
    if (status === "red") {
      statusStr = "พบปัญหา / ต้องรักษา";
      colorStr = "#EF4444"; // Red
    } else if (status === "blue") {
      statusStr = "รักษาแล้ว";
      colorStr = "#3B82F6"; // Blue
    } else if (status === "cross") {
      statusStr = "ถอน / ผ่าออกแล้ว";
      colorStr = "#64748B"; // Slate
    }

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1A365D]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setClickedTooth(null)}>
        <div className="bg-white rounded-3xl w-full max-w-[340px] p-6 shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <button onClick={() => setClickedTooth(null)} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 bg-gray-50 rounded-full transition-colors">
            <X size={18} />
          </button>
          
          <div className="text-center mb-6 mt-2">
            <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center font-bold" style={{ backgroundColor: colorStr + "20", color: colorStr }}>
              <span className="text-xl font-display">{toothDisplayNum}</span>
            </div>
            <h3 className="text-base font-bold text-[#1A365D] mb-1">{toothName}</h3>
            {extraLocationDesc && (
              <p className="text-xs text-amber-800 bg-amber-50 rounded-lg p-2 mb-2 border border-amber-200 leading-relaxed text-left">
                {extraLocationDesc}
              </p>
            )}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mt-1" style={{ color: colorStr, backgroundColor: colorStr + "10", borderColor: colorStr + "30" }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorStr }}></div>
              {statusStr}
            </div>
          </div>
          
          <button onClick={() => setClickedTooth(null)} className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm">
            ปิด
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC]">
      {renderToothPopup()}
      
      {/* Header Navigation */}
      <div className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100/50 backdrop-blur-md bg-white/80">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="font-semibold text-gray-900 text-lg">สุขภาพฟันของฉัน</h1>
            <p className="text-sm font-medium" style={{ color: "#4A6080" }}>อัปเดตล่าสุด: {localLastUpdated}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6">
        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Column: Visual Chart (Matches Doctor's Odontogram View) */}
          <div className="flex-grow">
            <Odontogram
              toothData={mergedToothData}
              extraTeeth={extraTeeth}
              readonly={true}
              isChild={isChild}
              setIsChild={setIsChild}
              onToothClick={(tooth) => setClickedTooth(String(tooth))}
            />
          </div>

          {/* Right Column: Summary */}
          <div className="lg:w-80 space-y-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Activity size={18} className="text-blue-500"/> สรุปการรักษา
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-sm font-medium text-red-900">พบปัญหา / ต้องรักษา</span>
                  </div>
                  <span className="font-bold text-red-600">{cariesCount} ซี่</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-blue-900">รักษาแล้ว</span>
                  </div>
                  <span className="font-bold text-blue-600">{filledCount} ซี่</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 mt-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                    <span className="text-sm font-medium text-slate-800">ถอน / สูญเสีย</span>
                  </div>
                  <span className="font-bold text-slate-600">{missingTeeth.length} ซี่</span>
                </div>

                {extraTeeth.length > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 mt-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <span className="text-sm font-medium text-amber-900">ฟันเกิน / ฟันซ้อน</span>
                    </div>
                    <span className="font-bold text-amber-700">{extraTeeth.length} ซี่</span>
                  </div>
                )}
              </div>
              {cariesCount > 0 && (
                <div className="mt-5 pt-5 border-t border-slate-100">
                  <button 
                    onClick={onBookAppointment}
                    className="w-full py-2.5 bg-[#FF8C9A] hover:bg-[#ff7a8a] text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                  >
                    จองคิวรักษาต่อเนื่อง
                  </button>
                </div>
              )}
            </div>

            <div className="bg-[#1A365D] p-5 rounded-2xl shadow-sm text-white">
              <div className="flex items-start gap-3">
                <ShieldCheck size={24} className="text-blue-300 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm mb-1 text-blue-50">คำแนะนำล่าสุด</h4>
                  <p className="text-sm leading-relaxed text-blue-200">{localAdvice}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Treatment History Timeline */}
        {historyRecords.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              ประวัติการรักษา (Treatment History)
            </h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {historyRecords.map((record) => (
                <div key={record.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Timeline Dot */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-[#FF8C9A] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  </div>
                  
                  {/* Card */}
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-slate-50 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-[#1A365D]">{new Date(record.date).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">ทพ. {record.doctor}</span>
                    </div>
                    
                    <div className="mb-3">
                      {(record.treatmentServices && record.treatmentServices.length > 0) ? (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {record.treatmentServices.map((s: string) => (
                            <span key={s} className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-white text-[#1D6FA4] border border-[#E8F4FF]">
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-slate-700">{record.service}</p>
                      )}
                    </div>
                    
                    {record.notes && (
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-slate-500 block mb-0.5">บันทึกหัตถการ:</span>
                        <p className="text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-100">{record.notes}</p>
                      </div>
                    )}
                    
                    {record.recommendations && (
                      <div className="mb-3">
                        <span className="text-xs font-semibold text-orange-500 block mb-0.5">คำแนะนำ:</span>
                        <p className="text-xs text-orange-700 bg-orange-50 p-2 rounded-lg border border-orange-100">{record.recommendations}</p>
                      </div>
                    )}

                    {record.odontogramData && Object.keys(record.odontogramData).length > 0 && (
                      <button 
                        onClick={() => {
                          const raw = record.odontogramData || {};
                          const { extraTeeth: histExtras = [], wholeMouth: _wm, ...histTeeth } = raw;
                          setLocalToothData(histTeeth);
                          setExtraTeeth(Array.isArray(histExtras) ? histExtras : []);
                          setLocalLastUpdated(new Date(record.date).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }));
                          setLocalAdvice(record.recommendations || "ยังไม่มีคำแนะนำ");
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full mt-2 py-1.5 text-xs font-semibold text-[#FF8C9A] bg-[#FFE8EC] rounded-lg hover:bg-[#ff7a8a] hover:text-white transition-colors"
                      >
                        ดูแผนผังฟันของวันนี้
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
