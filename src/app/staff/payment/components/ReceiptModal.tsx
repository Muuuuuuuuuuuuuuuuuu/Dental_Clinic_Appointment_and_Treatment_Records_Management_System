import React from "react";
import { Smile, X, Banknote, Smartphone, CreditCard, CalendarPlus, Printer } from "lucide-react";

interface ReceiptModalProps {
  receiptData: any | null;
  onClose: () => void;
  onOpenFollowUp: () => void;
  onConfirmAndPrint: () => void;
}

/**
 * 🧾 [MODAL COMPONENT] หน้าต่างพิมพ์และยืนยันใบเสร็จรับเงิน
 */
export default function ReceiptModal({
  receiptData,
  onClose,
  onOpenFollowUp,
  onConfirmAndPrint,
}: ReceiptModalProps) {
  if (!receiptData) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(26,54,93,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden relative">
        <div
          className="h-2 w-full"
          style={{ background: "linear-gradient(90deg, #1A365D, #1D6FA4)" }}
        />
        <div className="p-8 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#E8F4FF" }}
              >
                <Smile size={20} style={{ color: "#1D6FA4" }} />
              </div>
              <div>
                <h2
                  className="text-lg font-bold leading-tight"
                  style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
                >
                  คลินิกสุภัทร
                </h2>
                <p className="text-[10px]" style={{ color: "#4A6080" }}>
                  ใบเสร็จรับเงิน #{receiptData.id}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100"
            >
              <X size={16} style={{ color: "#4A6080" }} />
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-xs text-center mb-1" style={{ color: "#4A6080" }}>
              ยอดชำระสุทธิ
            </p>
            <p className="text-3xl font-black text-center" style={{ color: "#1B7A3E" }}>
              ฿{receiptData.netTotal.toLocaleString()}
            </p>
            <div
              className="flex items-center justify-center gap-1 mt-2 text-xs font-bold px-2 py-1 bg-white rounded-full mx-auto w-fit border border-gray-200"
              style={{ color: "#1A365D" }}
            >
              {receiptData.paymentMethod === "เงินสด" && <Banknote size={12} />}
              {receiptData.paymentMethod === "โอนเงิน" && <Smartphone size={12} />}
              {receiptData.paymentMethod === "บัตรเครดิต" && <CreditCard size={12} />}
              ชำระผ่าน{receiptData.paymentMethod}
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {[
              ["คนไข้", receiptData.patientName],
              [
                "บริการ",
                receiptData.detailedServices && receiptData.detailedServices.length > 0
                  ? receiptData.detailedServices
                      .map(
                        (s: any) =>
                          `${s.name}${
                            s.locationCode && s.locationCode !== "MOUTH"
                              ? ` (ซี่ ${s.locationCode})`
                              : ""
                          }${s.qty > 1 ? ` x${s.qty}` : ""}`
                      )
                      .join(", ")
                  : receiptData.treatmentServices && receiptData.treatmentServices.length > 0
                  ? receiptData.treatmentServices.join(", ")
                  : receiptData.service,
              ],
              ["ทันตแพทย์", receiptData.doctorName],
              [
                "วันที่",
                new Date().toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
              ],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between text-xs border-b border-dashed border-gray-200 pb-2"
              >
                <span style={{ color: "#64748B" }}>{k}</span>
                <span
                  className="font-semibold text-right text-balance"
                  style={{ color: "#1A365D", maxWidth: "65%" }}
                >
                  {v}
                </span>
              </div>
            ))}
            {receiptData.treatmentNotes && (
              <div className="pt-1 pb-2 border-b border-dashed border-gray-200">
                <span className="block text-xs mb-1" style={{ color: "#64748B" }}>
                  บันทึกการรักษาจากแพทย์
                </span>
                <div
                  className="text-xs font-medium whitespace-pre-line bg-slate-50 rounded-lg p-2.5 border border-slate-100"
                  style={{ color: "#1A365D" }}
                >
                  {receiptData.treatmentNotes}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 mb-6 border-y border-dashed border-gray-200 py-3">
            <p className="text-xs font-bold" style={{ color: "#1A365D" }}>
              รายละเอียดค่าใช้จ่าย
            </p>

            {receiptData.detailedServices?.map((s: any, i: number) => (
              <div key={`svc-${i}`} className="flex justify-between text-xs">
                <span style={{ color: "#64748B" }}>
                  {s.name}
                  {s.locationCode && s.locationCode !== "MOUTH" ? ` (ซี่ ${s.locationCode})` : ""}{" "}
                  {s.qty > 1 ? `x${s.qty}` : ""}
                </span>
                <span style={{ color: "#1A365D" }}>
                  ฿{(s.price * s.qty).toLocaleString()}
                </span>
              </div>
            ))}

            {(!receiptData.detailedServices || receiptData.detailedServices.length === 0) && (
              <div className="flex justify-between text-xs">
                <span style={{ color: "#64748B" }}>
                  {receiptData.service || "รวมยอดชำระ"}
                </span>
                <span style={{ color: "#1A365D" }}>
                  ฿{receiptData.baseCost.toLocaleString()}
                </span>
              </div>
            )}

            {receiptData.extraProducts?.map((p: any, i: number) => (
              <div key={`prod-${i}`} className="flex justify-between text-xs">
                <span style={{ color: "#64748B" }}>
                  {p.name} {p.qty > 1 ? `x${p.qty}` : ""}
                </span>
                <span style={{ color: "#1A365D" }}>
                  ฿{(p.price * p.qty).toLocaleString()}
                </span>
              </div>
            ))}

            {receiptData.discount > 0 && (
              <div className="flex justify-between text-xs pt-2">
                <span className="text-red-500 font-medium">ส่วนลด (Discount)</span>
                <span className="text-red-500 font-medium">
                  - ฿{receiptData.discount.toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200 mt-2">
              <span style={{ color: "#1A365D" }}>ยอดรวมสุทธิ</span>
              <span style={{ color: "#1B7A3E" }}>
                ฿{receiptData.netTotal.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onOpenFollowUp}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs font-bold transition-all hover:opacity-90 whitespace-nowrap"
              style={{ backgroundColor: "#E8F4FF", color: "#1D6FA4" }}
            >
              <CalendarPlus size={14} className="shrink-0" />
              <span>นัดครั้งถัดไป</span>
            </button>
            <button
              onClick={onConfirmAndPrint}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 shadow-md whitespace-nowrap"
              style={{ backgroundColor: "#1B7A3E" }}
            >
              <Printer size={14} className="shrink-0" />
              <span>ยืนยันและพิมพ์ใบเสร็จ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

