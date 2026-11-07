import React from "react";
import { ChevronRight, CheckCircle } from "lucide-react";

interface PatientSearchStepProps {
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  patientResults: any[];
  patientInfo: any;
  setPatientInfo: (p: any) => void;
  searchError: string;
}

/**
 * 🔍 [BOOKING STEP 0] หน้าค้นหาและเลือกประวัติคนไข้
 */
export default function PatientSearchStep({
  searchKeyword,
  onSearchChange,
  patientResults,
  patientInfo,
  setPatientInfo,
  searchError,
}: PatientSearchStepProps) {
  return (
    <div className="space-y-4 max-w-xl mx-auto py-8">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-[#1A365D] mb-2">ค้นหาประวัติคนไข้</h3>
        <p className="text-sm text-[#4A6080]">
          กรุณากรอกชื่อ-สกุล, เลขบัตรประชาชน, เบอร์โทรศัพท์ หรืออีเมลเพื่อดึงข้อมูล
        </p>
      </div>

      {!patientInfo && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="พิมพ์ชื่อ-สกุล / เลขบัตรฯ / เบอร์โทร / อีเมล"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#FF8C9A]/30"
              style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
            />
          </div>
        </div>
      )}

      {searchError && (
        <div
          className="p-4 rounded-xl mt-4 text-sm flex items-center justify-between"
          style={{ backgroundColor: "#FFF0F2", color: "#E63946" }}
        >
          <span>{searchError}</span>
        </div>
      )}

      {patientResults.length > 0 && !patientInfo && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-[#1A365D]">
            พบข้อมูลคนไข้ {patientResults.length} รายการ กรุณาเลือก:
          </p>
          {patientResults.map((p: any) => (
            <button
              key={p.id}
              onClick={() => setPatientInfo(p)}
              className="w-full text-left p-4 rounded-xl border flex items-center justify-between transition-colors hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
              style={{ borderColor: "rgba(26,54,93,0.1)" }}
            >
              <div>
                <p className="font-bold text-[#1A365D] text-sm">{p.name}</p>
                <p className="text-xs text-[#4A6080]">
                  {p.hn} • {p.phone}
                </p>
              </div>
              <ChevronRight size={16} className="text-[#4A6080]" />
            </button>
          ))}
        </div>
      )}

      {patientInfo && (
        <div
          className="p-4 rounded-xl mt-4 border flex items-center justify-between"
          style={{
            borderColor: "rgba(26,54,93,0.1)",
            backgroundColor: "#FAFCFF",
          }}
        >
          <div>
            <p className="font-bold text-[#1A365D] text-lg">{patientInfo.name}</p>
            <p className="text-sm text-[#4A6080]">
              {patientInfo.hn} • {patientInfo.phone}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#E8FFF0] text-[#1B7A3E]">
            <CheckCircle size={20} />
          </div>
        </div>
      )}

      {patientInfo && patientResults.length > 1 && (
        <button
          onClick={() => setPatientInfo(null)}
          className="text-xs text-[#4A6080] underline mt-3 block w-full text-center"
        >
          เลือกคนไข้รายอื่น
        </button>
      )}
    </div>
  );
}

