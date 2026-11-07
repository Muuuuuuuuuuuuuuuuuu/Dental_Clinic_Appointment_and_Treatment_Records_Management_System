import React from "react";
import { AlertTriangle } from "lucide-react";

interface FollowUpAlertProps {
  isFollowUp?: boolean;
  planItemId?: number;
}

/**
 * ⚠️ [STEP 1 RIGHT COMPONENT] ป้ายเตือนแนะนำระยะเวลาสำหรับเคสรักษาต่อเนื่อง
 */
export default function FollowUpAlert({
  isFollowUp,
  planItemId,
}: FollowUpAlertProps) {
  if (!isFollowUp && !planItemId) return null;

  return (
    <div
      style={{
        borderRadius: 12,
        backgroundColor: "#FEF3C7",
        padding: "12px 16px",
        border: "1px solid #FDE68A",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      <AlertTriangle
        size={18}
        style={{ color: "#D97706", marginTop: 2, flexShrink: 0 }}
      />
      <div>
        <p
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: "#B45309",
            marginBottom: 2,
          }}
        >
          คำแนะนำสำหรับเคสต่อเนื่อง
        </p>
        <p style={{ fontSize: 12, color: "#92400E", lineHeight: 1.4 }}>
          กรุณาเลือกวันนัดหมาย{" "}
          <strong>ห่างจากรอบที่แล้วประมาณ 3-4 สัปดาห์</strong>{" "}
          หรือตามที่ทันตแพทย์ได้แจ้งไว้ เพื่อให้การรักษาเป็นไปตามแผนครับ
        </p>
      </div>
    </div>
  );
}

