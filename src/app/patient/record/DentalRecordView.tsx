import React, { useState, useEffect } from "react";
import { ArrowLeft, ShieldCheck, Activity } from "lucide-react";
import { Odontogram } from "react-odontogram";
import "react-odontogram/style.css";
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
  toothData?: Record<number, string>;
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
  const [localToothData, setLocalToothData] = useState<Record<number, string>>(toothData || {});
  const [localLastUpdated, setLocalLastUpdated] = useState<string>(lastUpdated || "-");
  const [localAdvice, setLocalAdvice] = useState<string>(advice || "ยังไม่มีคำแนะนำ");

  useEffect(() => {
    if (!user?.patientId) return;
    getPatientTreatmentRecords(user.patientId).then(records => {
      // Find the most recent record with odontogramData
      const withTeeth = records.filter(r => r.odontogramData && Object.keys(r.odontogramData).length > 0);
      if (withTeeth.length > 0) {
        // Assume sorted by date desc or sort them manually just in case
        const sorted = withTeeth.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const latest = sorted[0];
        setLocalToothData(latest.odontogramData);
        setLocalAdvice(latest.recommendations || "ดูแลรักษาความสะอาดตามปกติ");
        setLocalLastUpdated(new Date(latest.date).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }));
      }
    }).catch(console.error);
  }, [user]);

  // Map data for react-odontogram
  const cariesTeeth = Object.entries(localToothData).filter(([_, s]) => s === 'red').map(([n]) => `teeth-${n}`);
  const filledTeeth = Object.entries(localToothData).filter(([_, s]) => s === 'blue').map(([n]) => `teeth-${n}`);
  const missingTeeth = Object.entries(localToothData).filter(([_, s]) => s === 'cross').map(([n]) => `teeth-${n}`);

  const conditions = [
    {
      label: "ต้องรักษา (ผุ)",
      teeth: cariesTeeth,
      fillColor: "#FFE8EC",
      outlineColor: "#FF6B7E",
    },
    {
      label: "รักษาแล้ว",
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

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC]">
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
            <h1 className="font-semibold text-gray-900 text-lg">สุขภาพฟันของคุณ</h1>
            <p className="text-sm font-medium" style={{ color: "#4A6080" }}>อัปเดตล่าสุด: {localLastUpdated}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6">
        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Column: Visual Chart */}
          <div className="flex-grow bg-white rounded-3xl p-6 lg:p-8 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-rose-50/50 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />
            
            <div className="relative z-10 text-center mb-8 flex flex-col sm:flex-row justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1 font-display">แผนผังฟัน (Odontogram)</h2>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center bg-gray-100 rounded-xl p-1">
                <button onClick={() => setIsChild(false)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${!isChild ? 'bg-white shadow text-[#1A365D]' : 'text-gray-500'}`}>
                  ฟันแท้ (Adult)
                </button>
                <button onClick={() => setIsChild(true)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${isChild ? 'bg-white shadow text-[#1A365D]' : 'text-gray-500'}`}>
                  ฟันน้ำนม (Child)
                </button>
              </div>
            </div>

            <div className="relative z-10 w-full flex justify-center mt-4">
              {/* Using transform scale to reliably shrink the SVG and adjust height to remove whitespace without cutting off text */}
              <div className="origin-top relative pb-10" style={{ transform: "scale(0.55)", marginBottom: "-35%" }}>
                
                {/* Separator Line & Labels */}
                <div className="absolute w-[140%] left-[-20%] top-[49%] border-t-2 border-dashed border-blue-200/70 z-0 pointer-events-none">
                   <div className="absolute -top-8 w-full text-center text-blue-400/80 font-bold text-xl tracking-wider">ฟันบน (Upper)</div>
                   <div className="absolute top-3 w-full text-center text-blue-400/80 font-bold text-xl tracking-wider">ฟันล่าง (Lower)</div>
                </div>

                <div className="relative z-10">
                  <Odontogram 
                    teethConditions={conditions} 
                    showLabels={true} 
                    readOnly={true} 
                    maxTeeth={isChild ? 5 : 8}
                  />
                </div>
              </div>
            </div>
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
                    <span className="text-sm font-medium text-red-900">ต้องรักษา (ผุ)</span>
                  </div>
                  <span className="font-bold text-red-600">{cariesTeeth.length} ซี่</span>
                </div>
                {cariesTeeth.length > 0 && (
                  <div className="pl-8 pb-1 space-y-1.5">
                    {cariesTeeth.map(t => {
                      const num = t.replace('teeth-', '');
                      return <div key={t} className="text-xs text-red-800/80 font-medium">👉 {getToothNameTh(num, isChild)}</div>;
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-blue-900">รักษาแล้ว</span>
                  </div>
                  <span className="font-bold text-blue-600">{filledTeeth.length} ซี่</span>
                </div>
                {filledTeeth.length > 0 && (
                  <div className="pl-8 pb-1 space-y-1.5">
                    {filledTeeth.map(t => {
                      const num = t.replace('teeth-', '');
                      return <div key={t} className="text-xs text-blue-800/80 font-medium">✨ {getToothNameTh(num, isChild)}</div>;
                    })}
                  </div>
                )}
              </div>
              <div className="mt-5 pt-5 border-t border-slate-100">
                <button 
                  onClick={onBookAppointment}
                  className="w-full py-2.5 bg-[#FF8C9A] hover:bg-[#ff7a8a] text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                >
                  จองคิวรักษาฟันผุ
                </button>
              </div>
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
      </div>
    </div>
  );
}
