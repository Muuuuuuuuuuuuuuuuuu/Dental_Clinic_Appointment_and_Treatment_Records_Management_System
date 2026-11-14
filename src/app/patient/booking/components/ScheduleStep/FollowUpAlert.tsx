import React from "react";

interface FollowUpAlertProps {
  isFollowUp?: boolean;
  planItemId?: number;
}

/**
 * ป้ายเตือนแนะนำระยะเวลาสำหรับเคสรักษาต่อเนื่อง
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
      }}
    >
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
        <strong>ห่างจากรอบที่แล้วประมาณ 1 สัปดาห์</strong>{" "}
        หรือตามที่ทันตแพทย์ได้แจ้งไว้ เพื่อให้การรักษาเป็นไปตามแผน
      </p>
    </div>
  );
}
