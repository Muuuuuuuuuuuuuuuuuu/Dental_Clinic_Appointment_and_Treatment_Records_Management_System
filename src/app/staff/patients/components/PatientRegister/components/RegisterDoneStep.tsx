import React from "react";
import { CheckCircle } from "lucide-react";
import { SuccessInfo } from "../hooks/usePatientRegister";

interface RegisterDoneStepProps {
  successInfo: SuccessInfo;
  showPass?: boolean;
  setShowPass?: React.Dispatch<React.SetStateAction<boolean>>;
  copied?: "email" | "pass" | null;
  copyText?: (text: string, type: "email" | "pass") => void;
  resetForm: () => void;
}

export function RegisterDoneStep({
  successInfo,
  resetForm,
}: RegisterDoneStepProps) {
  return (
    <div className="max-w-md mx-auto py-12 text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
      <div
        className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6"
        style={{ background: "linear-gradient(135deg,#4ade80,#22c55e)" }}
      >
        <CheckCircle size={40} color="white" />
      </div>
      <h2
        className="text-2xl font-bold mb-2"
        style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
      >
        ลงทะเบียนเสร็จสิ้น
      </h2>
      <p className="text-gray-500 mb-8 text-sm">
        <strong className="text-gray-700">{successInfo.name}</strong>{" "}
        ถูกเพิ่มเข้าระบบเรียบร้อยแล้ว
      </p>

      <button
        type="button"
        onClick={resetForm}
        className="w-full px-6 py-3 rounded-xl font-medium text-white transition-opacity hover:opacity-90 cursor-pointer"
        style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}
      >
        เพิ่มคนไข้รายอื่น
      </button>
    </div>
  );
}

export default RegisterDoneStep;
