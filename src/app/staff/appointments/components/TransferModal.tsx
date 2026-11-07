import React from "react";
import { X, AlertTriangle, ArrowRightLeft } from "lucide-react";
import { Appointment, DentistInfo } from "@/app/shared/data";

interface TransferModalProps {
  transferAppt: Appointment | null;
  onClose: () => void;
  dentists: DentistInfo[];
  newDoctorId: string;
  setNewDoctorId: (id: string) => void;
  updateReason: string;
  setUpdateReason: (reason: string) => void;
  onSubmit: () => void;
}

/**
 * 🔀 [MODAL COMPONENT] หน้าต่างโอนย้ายเคสไปยังทันตแพทย์ท่านอื่น
 */
export default function TransferModal({
  transferAppt,
  onClose,
  dentists,
  newDoctorId,
  setNewDoctorId,
  updateReason,
  setUpdateReason,
  onSubmit,
}: TransferModalProps) {
  if (!transferAppt) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(26,54,93,0.4)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
          >
            ย้ายเคส (Transfer)
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200">
            <X size={16} style={{ color: "#4A6080" }} />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-5 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <p className="text-sm font-bold text-blue-900 mb-1">{transferAppt.patientName}</p>
            <p className="text-xs text-blue-700">บริการ: {transferAppt.service}</p>
            <p className="text-xs text-blue-700 mt-1">
              คิวปัจจุบัน: {transferAppt.date} | {transferAppt.time} น.
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-md w-fit">
              <AlertTriangle size={12} /> หมอเดิม: ทพ. {transferAppt.doctorName}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold mb-2" style={{ color: "#4A6080" }}>
              เลือกทันตแพทย์ท่านใหม่
            </label>
            <select
              value={newDoctorId}
              onChange={(e) => setNewDoctorId(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 text-sm font-medium"
            >
              <option value="" disabled>
                -- เลือกทันตแพทย์ --
              </option>
              {dentists
                .filter((d) => d.name !== transferAppt.doctorName)
                .map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    ทพ. {doc.name} ({doc.specialty})
                  </option>
                ))}
            </select>
            <label className="block text-sm font-bold mt-4 mb-2" style={{ color: "#4A6080" }}>
              เหตุผลที่ย้ายเคส
            </label>
            <input
              type="text"
              value={updateReason}
              onChange={(e) => setUpdateReason(e.target.value)}
              placeholder="เช่น แพทย์ลาป่วย, คนไข้ขอเปลี่ยน ฯลฯ"
              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <button
            onClick={onSubmit}
            disabled={!newDoctorId}
            className="w-full py-3.5 rounded-xl font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#1D6FA4,#1A365D)" }}
          >
            <ArrowRightLeft size={18} /> ยืนยันการย้ายเคส
          </button>
        </div>
      </div>
    </div>
  );
}

