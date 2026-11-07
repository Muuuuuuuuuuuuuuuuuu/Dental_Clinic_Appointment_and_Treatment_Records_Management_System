import React from "react";
import { Receipt, CheckCircle, Banknote, Smartphone, CreditCard } from "lucide-react";
import { Appointment, Product } from "@/app/shared/data";
import { ExtraProductItem } from "../hooks/usePaymentData";

interface PaymentBillingPanelProps {
  selectedAppt: Appointment | undefined;
  onCancel: () => void;
  servicesData: Record<number, any>;
  adjustedPrices: Record<string, string>;
  adjustedQuantities: Record<string, number>;
  onPriceChange: (key: string, val: string) => void;
  onQtyChange: (key: string, qty: number) => void;
  extraProducts: ExtraProductItem[];
  setExtraProducts: React.Dispatch<React.SetStateAction<ExtraProductItem[]>>;
  allProducts: Product[];
  showProductSelect: boolean;
  setShowProductSelect: (show: boolean) => void;
  totalBaseCost: number;
  discount: string;
  setDiscount: (val: string) => void;
  netTotal: number;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  onPrepareReceipt: () => void;
}

/**
 * 🧾 [PAYMENT COMPONENT] แผงบันทึกค่ารักษา หัตถการ สินค้า และรับชำระเงิน
 */
export default function PaymentBillingPanel({
  selectedAppt,
  onCancel,
  servicesData,
  adjustedPrices,
  adjustedQuantities,
  onPriceChange,
  onQtyChange,
  extraProducts,
  setExtraProducts,
  allProducts,
  showProductSelect,
  setShowProductSelect,
  totalBaseCost,
  discount,
  setDiscount,
  netTotal,
  paymentMethod,
  setPaymentMethod,
  onPrepareReceipt,
}: PaymentBillingPanelProps) {
  if (!selectedAppt) {
    return (
      <div
        className="flex-1 bg-white rounded-3xl p-8 border border-gray-100 flex flex-col relative overflow-y-auto"
        style={{ boxShadow: "0 4px 20px rgba(26,54,93,0.03)" }}
      >
        <div className="m-auto text-center">
          <Receipt size={64} className="mx-auto mb-4 opacity-10" style={{ color: "#1A365D" }} />
          <h2
            className="text-xl font-bold mb-2"
            style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
          >
            เลือกลูกค้าเพื่อรับชำระเงิน
          </h2>
          <p className="text-sm" style={{ color: "#4A6080" }}>
            คลิกที่รายชื่อลูกค้าจากเมนูด้านซ้ายเพื่อเริ่มต้นการออกบิล
          </p>
        </div>
      </div>
    );
  }

  const paymentMethods = [
    { id: "เงินสด", icon: Banknote, label: "เงินสด", bg: "#F0FDF4", border: "#BBF7D0", color: "#166534" },
    { id: "โอนเงิน", icon: Smartphone, label: "โอนเงิน / PromptPay", bg: "#EFF6FF", border: "#BFDBFE", color: "#1E3A8A" },
    { id: "บัตรเครดิต", icon: CreditCard, label: "บัตรเครดิต", bg: "#FDF4FF", border: "#FBCFE8", color: "#831843" },
  ];

  return (
    <div
      className="flex-1 bg-white rounded-3xl p-8 border border-gray-100 flex flex-col relative overflow-y-auto"
      style={{ boxShadow: "0 4px 20px rgba(26,54,93,0.03)" }}
    >
      <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
        {/* ส่วนหัวคนไข้ */}
        <div
          className="flex justify-between items-start mb-4 pb-3"
          style={{ borderBottom: "1px dashed rgba(26,54,93,0.1)" }}
        >
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: "#1A365D" }}>
              {selectedAppt.patientName}
            </h2>
            <p className="text-xs" style={{ color: "#4A6080" }}>
              HN: {selectedAppt.hn || "HN-XXXX"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 inline-block mb-1">
              สถานะ: รอชำระเงิน
            </p>
            <p className="text-xs font-medium" style={{ color: "#1A365D" }}>
              ทันตแพทย์: ทพ. {selectedAppt.doctorName}
            </p>
          </div>
        </div>

        {/* สรุปรายละเอียดการรักษา */}
        <div className="mb-4">
          <h3 className="text-xs font-bold mb-2" style={{ color: "#4A6080" }}>
            ใบสรุปการรักษาจากแพทย์
          </h3>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
            <div>
              <p className="font-semibold text-sm mb-2" style={{ color: "#1A365D" }}>
                หัตถการ / บริการที่ทำ
              </p>
              {selectedAppt.detailedServices && selectedAppt.detailedServices.length > 0 ? (
                <div className="space-y-1.5">
                  {selectedAppt.detailedServices.map((s: any, idx: number) => {
                    const key = `${s.serviceId}-${idx}`;
                    const isProduct = String(s.serviceId).startsWith("prod-");
                    const srvData = isProduct ? null : servicesData[s.serviceId];
                    const currentPriceStr =
                      adjustedPrices[key] !== undefined ? adjustedPrices[key] : String(s.price);

                    let priceRangeStr = "";
                    if (srvData && !srvData.is_fixed_price) {
                      const base = srvData.basePrice ? srvData.basePrice.toLocaleString() : "0";
                      const max = srvData.maxPrice ? srvData.maxPrice.toLocaleString() : "ไม่จำกัด";
                      priceRangeStr = ` (฿${base} - ${max})`;
                    }

                    return (
                      <div
                        key={key}
                        className="flex justify-between items-center text-sm py-1.5 px-3 rounded-lg bg-white border border-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium" style={{ color: "#1D6FA4" }}>
                            {s.name}
                            <span className="text-[10px] font-normal text-gray-400 ml-1">
                              {priceRangeStr}
                            </span>
                          </span>
                          {s.locationCode && (
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                              ซี่ {s.locationCode}
                            </span>
                          )}
                          {isProduct ? (
                            <div className="flex items-center gap-2 ml-2">
                              <button
                                onClick={() =>
                                  onQtyChange(key, (adjustedQuantities[key] || s.qty) - 1)
                                }
                                className="w-5 h-5 rounded border flex items-center justify-center hover:bg-gray-50 transition-colors text-xs"
                              >
                                -
                              </button>
                              <span className="font-semibold text-gray-700 w-3 text-center text-xs">
                                {adjustedQuantities[key] || s.qty}
                              </span>
                              <button
                                onClick={() =>
                                  onQtyChange(key, (adjustedQuantities[key] || s.qty) + 1)
                                }
                                className="w-5 h-5 rounded border flex items-center justify-center hover:bg-gray-50 transition-colors text-xs"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            (adjustedQuantities[key] || s.qty) > 1 && (
                              <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                x{adjustedQuantities[key] || s.qty}
                              </span>
                            )
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold" style={{ color: "#1A365D" }}>
                            ฿
                          </span>
                          <input
                            type="number"
                            value={currentPriceStr}
                            onChange={(e) => onPriceChange(key, e.target.value)}
                            disabled={isProduct || (srvData && srvData.is_fixed_price)}
                            className={`w-24 px-2 py-1 rounded-lg text-right text-sm font-bold outline-none border transition-colors ${
                              isProduct || (srvData && srvData.is_fixed_price)
                                ? "bg-transparent border-transparent text-[#1A365D]"
                                : "border-gray-200 focus:border-blue-500 bg-white shadow-sm"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : selectedAppt.treatmentServices && selectedAppt.treatmentServices.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedAppt.treatmentServices.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                      style={{
                        backgroundColor: "white",
                        color: "#1D6FA4",
                        border: "1px solid #E8F4FF",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs" style={{ color: "#4A6080" }}>
                  {selectedAppt.service}
                </p>
              )}
            </div>

            {selectedAppt.treatmentNotes && (
              <div>
                <p className="font-semibold text-xs mb-1" style={{ color: "#1A365D" }}>
                  บันทึกหัตถการ:
                </p>
                <div
                  className="text-xs p-2.5 bg-white rounded-lg border border-gray-100 whitespace-pre-line"
                  style={{ color: "#4A6080" }}
                >
                  {selectedAppt.treatmentNotes}
                </div>
              </div>
            )}

            {selectedAppt.recommendations && (
              <div>
                <p className="font-semibold text-xs mb-1 text-orange-600">
                  คำแนะนำสำหรับคนไข้:
                </p>
                <div className="text-xs p-2.5 bg-orange-50 rounded-lg border border-orange-100 text-orange-800 whitespace-pre-line">
                  {selectedAppt.recommendations}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ส่วนเพิ่มเวชภัณฑ์และยารายการพิเศษ */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold text-xs" style={{ color: "#1A365D" }}>
              สินค้าเพิ่มเติมจากหน้าร้าน:
            </p>
            <button
              onClick={() => setShowProductSelect(!showProductSelect)}
              className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors"
            >
              + เพิ่มสินค้า
            </button>
          </div>

          {showProductSelect && (
            <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
              <select
                className="w-full text-xs p-1.5 rounded border border-gray-300 outline-none focus:border-blue-500 mb-2"
                onChange={(e) => {
                  if (!e.target.value) return;
                  const p = allProducts.find((x) => String(x.id) === e.target.value);
                  if (p) {
                    const exists = extraProducts.find((ep) => ep.product.id === p.id);
                    if (exists) {
                      setExtraProducts(
                        extraProducts.map((ep) =>
                          ep.product.id === p.id ? { ...ep, qty: ep.qty + 1 } : ep
                        )
                      );
                    } else {
                      setExtraProducts([...extraProducts, { product: p, qty: 1 }]);
                    }
                  }
                  e.target.value = "";
                }}
              >
                <option value="">-- เลือกสินค้า --</option>
                {allProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (฿{p.price})
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowProductSelect(false)}
                className="text-[10px] text-gray-500 w-full text-center hover:text-gray-700"
              >
                ปิด
              </button>
            </div>
          )}

          {extraProducts.length > 0 && (
            <div className="space-y-1.5 mt-2">
              {extraProducts.map((ep, idx) => (
                <div
                  key={`ep-${idx}`}
                  className="flex justify-between items-center text-sm py-1.5 px-3 rounded-lg bg-orange-50 border border-orange-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-orange-800">{ep.product.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white rounded border border-orange-200 px-1">
                      <button
                        onClick={() => {
                          if (ep.qty > 1) {
                            setExtraProducts(
                              extraProducts.map((x) =>
                                x.product.id === ep.product.id ? { ...x, qty: x.qty - 1 } : x
                              )
                            );
                          } else {
                            setExtraProducts(
                              extraProducts.filter((x) => x.product.id !== ep.product.id)
                            );
                          }
                        }}
                        className="text-orange-600 px-1 font-bold"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{ep.qty}</span>
                      <button
                        onClick={() => {
                          setExtraProducts(
                            extraProducts.map((x) =>
                              x.product.id === ep.product.id ? { ...x, qty: x.qty + 1 } : x
                            )
                          );
                        }}
                        className="text-orange-600 px-1 font-bold"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-semibold text-orange-900 w-12 text-right">
                      ฿{ep.product.price * ep.qty}
                    </span>
                    <button
                      onClick={() =>
                        setExtraProducts(
                          extraProducts.filter((x) => x.product.id !== ep.product.id)
                        )
                      }
                      className="text-red-500 hover:text-red-700 ml-1 text-xs"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ส่วนคำนวณยอดชำระเงินสุทธิ */}
        <div className="mb-4 space-y-2 mt-4">
          <h3 className="text-xs font-bold mb-1" style={{ color: "#4A6080" }}>
            สรุปยอดค่าใช้จ่าย
          </h3>

          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium" style={{ color: "#1A365D" }}>
              รวมยอดบริการและสินค้า
            </span>
            <span className="text-sm font-semibold" style={{ color: "#4A6080" }}>
              ฿{totalBaseCost.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-red-500">ส่วนลด (Discount)</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-red-500">- ฿</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0"
                className="w-24 px-2 py-1.5 rounded-lg text-right text-xs font-bold text-red-500 outline-none border border-red-100 bg-red-50 focus:border-red-400 transition-colors"
              />
            </div>
          </div>

          <div
            className="pt-2 mt-2 flex items-center justify-between px-1"
            style={{ borderTop: "1px dashed rgba(26,54,93,0.1)" }}
          >
            <span className="text-sm font-bold" style={{ color: "#1A365D" }}>
              ยอดชำระสุทธิ (Net Total)
            </span>
            <span className="text-2xl font-black" style={{ color: "#1B7A3E" }}>
              ฿{netTotal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* ช่องทางการชำระเงิน */}
        <div className="mb-auto">
          <h3 className="text-xs font-bold mb-2" style={{ color: "#4A6080" }}>
            ช่องทางการชำระเงิน
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {paymentMethods.map((method) => {
              const isSelected = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${
                    isSelected ? "shadow-sm scale-105" : "hover:bg-gray-50"
                  }`}
                  style={{
                    borderColor: isSelected ? method.color : "transparent",
                    backgroundColor: isSelected ? method.bg : "#F8FAFC",
                  }}
                >
                  <method.icon
                    size={20}
                    className="mb-1"
                    style={{ color: isSelected ? method.color : "#94A3B8" }}
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: isSelected ? method.color : "#64748B" }}
                  >
                    {method.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ปุ่มดำเนินการ */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:bg-gray-100"
            style={{ color: "#4A6080" }}
          >
            ยกเลิก
          </button>
          <button
            onClick={onPrepareReceipt}
            disabled={netTotal < 0}
            className="flex-[2] py-3 rounded-xl font-bold text-white text-base transition-all hover:opacity-90 flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg,#22C55E,#16A34A)" }}
          >
            <CheckCircle size={18} /> รับชำระเงิน ฿{netTotal.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}

