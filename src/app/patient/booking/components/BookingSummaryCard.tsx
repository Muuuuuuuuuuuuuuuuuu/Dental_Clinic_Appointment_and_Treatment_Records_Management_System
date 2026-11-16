
interface BookingSummaryCardProps {
  serviceTitle: string;
  doctorName: string;
  dateStr: string;
  timeStr: string;
  price?: string;
  notes: string;
  isSubmitting: boolean;
  onConfirm: () => void;
}

export default function BookingSummaryCard({
  serviceTitle,
  doctorName,
  dateStr,
  timeStr,
  price,
  notes,
  isSubmitting,
  onConfirm,
}: BookingSummaryCardProps) {
  const rows = [
    { label: "บริการ", val: serviceTitle || "ไม่ระบุ" },
    { label: "ทันตแพทย์", val: doctorName },
    { label: "วันที่", val: dateStr },
    { label: "เวลา", val: timeStr },
    { label: "ราคาเริ่มต้น", val: price || "-" },
  ];

  return (
    <div style={{ maxWidth: 520 }}>
      <div
        style={{
          borderRadius: 20,
          backgroundColor: "white",
          padding: 24,
          boxShadow: "0 2px 12px rgba(26,54,93,0.06)",
        }}
      >
        <h3
          style={{
            fontWeight: 700,
            fontSize: 16,
            color: "#1A365D",
            marginBottom: 20,
          }}
        >
          สรุปการจองนัดหมาย
        </h3>
        {rows.map((r) => (
          <div
            key={r.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              fontSize: 14,
              borderBottom: "1px solid rgba(26,54,93,0.06)",
            }}
          >
            <span style={{ color: "#4A6080" }}>{r.label}</span>
            <span style={{ fontWeight: 600, color: "#1A365D" }}>{r.val}</span>
          </div>
        ))}

        {notes && (
          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              borderRadius: 12,
              backgroundColor: "#F0F4F8",
            }}
          >
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#1A365D",
                marginBottom: 4,
              }}
            >
              อาการที่แจ้งไว้
            </p>
            <p style={{ fontSize: 12, color: "#4A6080" }}>{notes}</p>
          </div>
        )}

        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "14px 0",
            borderRadius: 14,
            border: "none",
            fontWeight: 700,
            fontSize: 14,
            color: "white",
            marginTop: 20,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            background: isSubmitting ? "#ccc" : "#FF8C9A",
            boxShadow: isSubmitting
              ? "none"
              : "0 4px 20px rgba(255,140,154,0.4)",
            transition: "all 0.2s",
          }}
        >
          {isSubmitting ? "กำลังดำเนินการ..." : "ยืนยันการจองนัดหมาย"}
        </button>
      </div>
    </div>
  );
}

