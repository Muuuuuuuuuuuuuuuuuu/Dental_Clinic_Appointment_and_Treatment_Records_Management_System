import { CheckCheck } from "lucide-react";

interface ReceiptSlipTabProps {
  selected: any;
  refNo: string;
  doctorName: string;
  cashierName: string | null;
  payMethod: string;
  dateStr: string;
  timeStr: string;
  netTotal: number;
}

/**
 * [MODAL TAB] สลิปใบเสร็จรับเงินอิเล็กทรอนิกส์
 */
export default function ReceiptSlipTab({
  selected,
  refNo: _refNo,
  doctorName,
  cashierName: _cashierName,
  payMethod,
  dateStr,
  timeStr,
  netTotal,
}: ReceiptSlipTabProps) {
  return (
    <div
      id="dental-receipt-slip"
      className="overflow-y-auto p-5 sm:p-6 space-y-3.5 bg-white"
    >
      {/* ส่วนหัวใบเสร็จพร้อมไอคอนยืนยันการชำระเงิน */}
      <div className="text-center pt-1 pb-1">
        <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-2.5 shadow-md shadow-emerald-500/20">
          <CheckCheck size={26} strokeWidth={2.5} />
        </div>
        <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
          ชำระเงินสำเร็จ
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {dateStr} {timeStr}
        </p>
      </div>

      {/* กล่องแสดงยอดเงินรวม */}
      <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/70 text-center">
        <span className="text-[11px] font-medium text-slate-500 block mb-0.5">
          จำนวนเงินที่ชำระ
        </span>
        <div
          className="text-2xl font-black tracking-tight"
          style={{ color: "#1B7A3E" }}
        >
          ฿{netTotal.toLocaleString()}.00
        </div>
      </div>

      <div className="border-t border-dashed border-slate-200 my-1" />

      {/* ข้อมูลรายการชำระเงิน */}
      <div className="divide-y divide-slate-100 text-xs">

        <div className="flex items-center justify-between gap-3 py-1.5">
          <span className="text-slate-400 font-medium shrink-0">สถานพยาบาล</span>
          <span className="font-bold text-[#1A365D] text-right">คลินิกทันตกรรมสุภัทร</span>
        </div>

        <div className="flex items-center justify-between gap-3 py-1.5">
          <span className="text-slate-400 font-medium shrink-0">แพทย์ผู้รักษา</span>
          <span className="font-bold text-slate-800 text-right truncate">
            {doctorName}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 py-1.5">
          <span className="text-slate-400 font-medium shrink-0">ช่องทางชำระ</span>
          <span className="font-semibold text-slate-800 text-right">
            {payMethod}
          </span>
        </div>
      </div>

      <div className="border-t border-dashed border-slate-200 my-1" />

      {/* รายการค่าบริการและเวชภัณฑ์แยกตามรายการ */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1">
          <span>รายการหัตถการ / บริการ</span>
          <span>ยอดเงิน</span>
        </div>

        <div className="space-y-1.5 text-xs">
          {selected.detailedServices && selected.detailedServices.length > 0 ? (
            selected.detailedServices.map((s: any, idx: number) => (
              <div
                key={idx}
                className="flex justify-between items-start gap-2 text-slate-700"
              >
                <div className="pr-2 leading-tight">
                  <span className="font-semibold text-slate-800 block text-[11px]">
                    • {s.name}
                  </span>
                  {s.locationCode &&
                    s.locationCode !== "NONE" &&
                    s.locationCode !== "MOUTH" && (
                      <span className="text-[10px] text-slate-400 pl-2">
                        ซี่ฟัน: {s.locationCode}
                      </span>
                    )}
                </div>
                <span className="font-bold text-slate-800 shrink-0 text-xs">
                  ฿{(s.price * (s.qty || 1)).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <div className="flex justify-between items-start gap-2 text-slate-700">
              <span className="font-semibold text-slate-800 text-xs">
                • {selected.service || "ตรวจรักษาทันตกรรม"}
              </span>
              <span className="font-bold text-slate-800 shrink-0 text-xs">
                ฿{(selected.cost || 0).toLocaleString()}
              </span>
            </div>
          )}

          {selected.extraProducts &&
            selected.extraProducts.map((p: any, idx: number) => (
              <div
                key={`prod-${idx}`}
                className="flex justify-between items-start gap-2 text-slate-700 pt-1 border-t border-slate-50"
              >
                <span className="font-semibold text-slate-800 text-[11px]">
                  • {p.name} x{p.qty}
                </span>
                <span className="font-bold text-slate-800 shrink-0 text-xs">
                  ฿{(p.price * p.qty).toLocaleString()}
                </span>
              </div>
            ))}
        </div>
      </div>

      <div className="pt-2 text-center">
        <p className="text-[9px] text-slate-400">
          ขอบคุณที่ใช้บริการ คลินิกทันตกรรมสุภัทร
        </p>
      </div>
    </div>
  );
}

