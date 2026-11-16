import { CreditCard, ChevronRight, CheckCircle } from "lucide-react";
import { Appointment } from "@/app/shared/data";

interface PaymentQueueListProps {
  payable: Appointment[];
  paid: Appointment[];
  selectedApptId: number | null;
  onSelectAppt: (id: number) => void;
}

/**
 * 📋 [PAYMENT COMPONENT] รายการคิวรอชำระเงินและชำระแล้ววันนี้
 */
export default function PaymentQueueList({
  payable,
  paid,
  selectedApptId,
  onSelectAppt,
}: PaymentQueueListProps) {
  const totalRevenueToday = paid.reduce((s, a) => s + (a.cost ?? 0), 0);

  return (
    <div
      className="w-full flex flex-col h-full bg-white rounded-3xl p-5 border border-gray-100"
      style={{ boxShadow: "0 4px 20px rgba(26,54,93,0.03)" }}
    >
      <h2
        className="text-xl font-bold mb-4"
        style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
      >
        รายการชำระเงิน
      </h2>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
        {/* รายการที่รอชำระเงิน */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: "#4A6080" }}>
              รอชำระเงิน
            </h3>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#FFD6DC", color: "#FF6B7E" }}
            >
              {payable.length}
            </span>
          </div>

          {payable.length === 0 ? (
            <div className="text-center py-8 rounded-xl border border-dashed border-gray-200">
              <CreditCard size={24} className="mx-auto mb-2 opacity-20" style={{ color: "#1A365D" }} />
              <p className="text-xs" style={{ color: "#94A3B8" }}>
                ไม่มีรายการรอชำระเงิน
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {payable.map((a) => {
                const isSelected = selectedApptId === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => onSelectAppt(a.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all border ${
                      isSelected
                        ? "border-[#1D6FA4] bg-[#F0F7FC] shadow-sm ring-1 ring-[#1D6FA4]/30"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-sm" style={{ color: "#1A365D" }}>
                        {a.patientName}
                      </p>
                      <ChevronRight
                        size={16}
                        style={{ color: isSelected ? "#1D6FA4" : "#CBD5E1" }}
                      />
                    </div>
                    <p className="text-xs truncate" style={{ color: "#4A6080" }}>
                      {a.detailedServices && a.detailedServices.length > 0
                        ? a.detailedServices
                            .map(
                              (s: any) =>
                                `${s.name}${
                                  s.locationCode &&
                                  s.locationCode !== "MOUTH" &&
                                  s.locationCode !== "ทั้งปาก"
                                    ? ` (ซี่ ${s.locationCode})`
                                    : ""
                                }`
                            )
                            .join(", ")
                        : a.treatmentServices && a.treatmentServices.length > 0
                        ? a.treatmentServices.join(", ")
                        : a.service}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80">
                        รอชำระเงิน
                      </span>
                      <span className="text-[10px]" style={{ color: "#94A3B8" }}>
                        เวลา {a.time} น.
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* รายการที่ชำระเงินแล้ววันนี้ */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: "#4A6080" }}>
              ชำระแล้ววันนี้
            </h3>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#E8FFF0", color: "#1B7A3E" }}
            >
              {paid.length}
            </span>
          </div>

          {paid.length === 0 ? (
            <div className="text-center py-6 text-xs" style={{ color: "#94A3B8" }}>
              ยังไม่มีรายการชำระเงินวันนี้
            </div>
          ) : (
            <div className="space-y-2">
              {paid.map((a) => (
                <div key={a.id} className="w-full text-left p-3 rounded-xl border border-gray-100 bg-white">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-sm" style={{ color: "#1A365D" }}>
                      {a.patientName}
                    </p>
                    <span className="font-bold text-sm" style={{ color: "#1B7A3E" }}>
                      ฿{(a.cost ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs truncate mb-2" style={{ color: "#4A6080" }}>
                    {a.detailedServices && a.detailedServices.length > 0
                      ? a.detailedServices
                          .map(
                            (s: any) =>
                              `${s.name}${
                                s.locationCode &&
                                s.locationCode !== "MOUTH" &&
                                s.locationCode !== "ทั้งปาก"
                                  ? ` (ซี่ ${s.locationCode})`
                                  : ""
                              }`
                          )
                          .join(", ")
                      : a.treatmentServices && a.treatmentServices.length > 0
                      ? a.treatmentServices.join(", ")
                      : a.service}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-green-50 text-green-700 w-fit">
                    <CheckCircle size={10} /> ชำระแล้ว
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* สรุปยอดรับชำระประจำวัน */}
      <div className="pt-4 mt-4" style={{ borderTop: "1px solid rgba(26,54,93,0.06)" }}>
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
          <span className="font-semibold text-xs" style={{ color: "#4A6080" }}>
            รวมรายได้วันนี้
          </span>
          <span className="font-bold text-lg" style={{ color: "#1B7A3E" }}>
            ฿{totalRevenueToday.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

