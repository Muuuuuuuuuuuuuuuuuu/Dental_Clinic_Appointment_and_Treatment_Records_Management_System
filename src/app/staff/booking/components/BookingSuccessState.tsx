import { CheckCircle } from "lucide-react";
import { BookingForm } from "../hooks/useWalkInBooking";

interface BookingSuccessStateProps {
  patientInfo: any;
  form: BookingForm;
  onReset: () => void;
}

/**
 * 🎉 [BOOKING SUCCESS] หน้าจอแสดงผลเมื่อจองคิวสำเร็จ
 */
export default function BookingSuccessState({
  patientInfo,
  form,
  onReset,
}: BookingSuccessStateProps) {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: "#E8FFF0" }}
      >
        <CheckCircle size={28} style={{ color: "#22C55E" }} />
      </div>
      <h2
        className="text-xl font-bold mb-2"
        style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
      >
        จอง Walk-in สำเร็จ!
      </h2>
      <p className="text-sm mb-1" style={{ color: "#4A6080" }}>
        {patientInfo?.name}
      </p>
      <p className="text-sm mb-6" style={{ color: "#4A6080" }}>
        {form.service} •{" "}
        {form.openAppt ? "รอคนไข้ระบุวัน-เวลา" : `เวลา ${form.time} น.`}
      </p>
      <button
        onClick={onReset}
        className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
        style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}
      >
        จองรายต่อไป
      </button>
    </div>
  );
}

