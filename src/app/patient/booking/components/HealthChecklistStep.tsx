import React from "react";
import { ArrowRight } from "lucide-react";
import HealthChecklistForm, {
  HealthChecklistData,
} from "../HealthChecklistForm";
import { PatientUser } from "../../types";

interface HealthChecklistStepProps {
  user: PatientUser | null;
  healthData: HealthChecklistData;
  setHealthData: (data: HealthChecklistData) => void;
  setHealthValid: (valid: boolean) => void;
  canNext: boolean;
  onNext: () => void;
}

export default function HealthChecklistStep({
  user,
  healthData,
  setHealthData,
  setHealthValid,
  canNext,
  onNext,
}: HealthChecklistStepProps) {
  return (
    <div className="animate-fade-in space-y-6">
      <HealthChecklistForm
        user={user}
        data={healthData}
        onChange={(data, valid) => {
          setHealthData(data);
          setHealthValid(valid);
        }}
      />
      <button
        onClick={onNext}
        disabled={!canNext}
        style={{
          width: "100%",
          padding: "14px 0",
          borderRadius: 14,
          border: "none",
          fontWeight: 700,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          cursor: canNext ? "pointer" : "not-allowed",
          background: canNext ? "#FF8C9A" : "rgba(26,54,93,0.08)",
          color: canNext ? "white" : "#94A3B8",
          boxShadow: canNext ? "0 4px 20px rgba(255,140,154,0.35)" : "none",
          transition: "all 0.2s",
        }}
      >
        {canNext ? (
          <>
            <span>ไปหน้ายืนยันการจอง</span>
            <ArrowRight size={16} />
          </>
        ) : (
          "กรุณากรอกข้อมูลและกดยินยอมให้ครบถ้วน"
        )}
      </button>
    </div>
  );
}

