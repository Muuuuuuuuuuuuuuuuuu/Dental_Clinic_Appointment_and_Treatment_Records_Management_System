
interface TodayDutyCardProps {
  startTime?: string;
  endTime?: string;
  isOff?: boolean;
}

/**
 * ⏰ [CONTENT COMPONENT] การ์ดเวลาออกตรวจวันนี้
 */
export default function TodayDutyCard({
  startTime = "09:00",
  endTime = "18:00",
  isOff = false,
}: TodayDutyCardProps) {
  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl p-5"
        style={{
          background: isOff
            ? "linear-gradient(135deg, #64748B, #475569)"
            : "linear-gradient(135deg, #1A365D, #2A507A)",
          boxShadow: "0 4px 20px rgba(26,54,93,0.2)",
        }}
      >
        <p
          className="text-xs font-medium mb-1"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          เวลาออกตรวจวันนี้
        </p>
        {isOff ? (
          <>
            <p
              className="text-2xl font-bold text-white mt-1"
              style={{ fontFamily: "Sarabun, sans-serif" }}
            >
              วันหยุด
            </p>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
              ไม่มีเวรออกตรวจในวันนี้
            </p>
          </>
        ) : (
          <>
            <p
              className="text-3xl font-bold text-white"
              style={{ fontFamily: "Sarabun, sans-serif" }}
            >
              {startTime}
            </p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              ถึง {endTime} น.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

