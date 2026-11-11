import React from "react";

interface TreatmentAdviceTabProps {
  selected: any;
  dateStr: string;
  doctorName: string;
  netTotal: number;
  onSwitchToReceipt: () => void;
}

/**
 * 🩺 [MODAL TAB] ผลการรักษาและคำแนะนำการดูแลจากทันตแพทย์
 */
export default function TreatmentAdviceTab({
  selected,
  dateStr,
  doctorName,
  netTotal,
  onSwitchToReceipt,
}: TreatmentAdviceTabProps) {
  return (
    <div className="overflow-y-auto px-4 pt-3 pb-4 sm:px-5 sm:pt-3.5 sm:pb-5 space-y-4">
      {/* ส่วนหัวการ์ดบริการ */}
      <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/70 border border-blue-100">
        <div>
          <h3 className="font-extrabold text-base text-[#1A365D] leading-tight">
            {String(selected.service || "").replace(/\s*\(ซี่\s*[^)]*\)/g, "")}
          </h3>
          <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
            <span>แพทย์ผู้รักษา:</span>
            <strong className="text-slate-800">{doctorName}</strong>
          </p>
        </div>
      </div>

      {/* 1. Doctor's Clinical Note */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span>บันทึกการรักษาของแพทย์ </span>
          </span>
        </div>
        {selected.notes ? (
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap pl-1 font-normal">
            {selected.notes}
          </p>
        ) : (
          <p className="text-xs text-slate-400 italic pl-1">
            ได้รับการตรวจและทำหัตถการตามมาตรฐานทางทันตกรรมเรียบร้อยแล้ว
          </p>
        )}
      </div>

      {/* 2. Doctor's Recommendations */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-2xs space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-amber-200/50">
          <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
            <span>คำแนะนำการดูแลหลังการรักษา </span>
          </span>
        </div>
        {selected.recommendations ? (
          <div className="text-xs text-amber-900 leading-relaxed whitespace-pre-wrap pl-1 font-normal">
            {selected.recommendations}
          </div>
        ) : (
          <div className="text-xs text-amber-900 leading-relaxed pl-1 space-y-1">
            <p>• ดูแลรักษาความสะอาดช่องปากและแปรงฟันอย่างถูกวิธี</p>
            <p>• หลีกเลี่ยงการเคี้ยวของแข็งหรือเหนียวจัดบริเวณที่ได้รับการรักษา</p>
            <p>• หากมีอาการปวด บวมหรือมีอาการผิดปกติ สามารถติดต่อคลินิกเพื่อพบแพทย์ได้ทันที</p>
          </div>
        )}
      </div>

      {/* 3. รายละเอียดหัตถการและตำแหน่งซี่ฟัน */}
      {selected.detailedServices && selected.detailedServices.length > 0 && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-slate-800 block pb-1 border-b border-slate-100">
            หัตถการและตำแหน่งซี่ฟันที่ทำการรักษา
          </span>
          <div className="divide-y divide-slate-100 text-xs">
            {selected.detailedServices.map((s: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center py-1.5">
                <span className="font-medium text-slate-700">
                  • {s.name} {s.qty > 1 ? `(x${s.qty})` : ""}
                </span>
                <span className="font-bold text-slate-800 text-[11px] px-2 py-0.5 rounded-md bg-slate-100">
                  {s.locationCode &&
                    s.locationCode !== "NONE" &&
                    s.locationCode !== "MOUTH"
                    ? `ซี่ ${s.locationCode}`
                    : "ทั้งช่องปาก"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. รายการยาและเวชภัณฑ์ที่ได้รับ */}
      {selected.extraProducts && selected.extraProducts.length > 0 && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-100">
            <span>ยาและเวชภัณฑ์ที่ได้รับ</span>
          </span>
          <div className="divide-y divide-slate-100 text-xs">
            {selected.extraProducts.map((p: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center py-1.5">
                <span className="font-semibold text-slate-700">• {p.name}</span>
                <span className="text-slate-500 text-[11px]">จำนวน {p.qty} ชิ้น</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

