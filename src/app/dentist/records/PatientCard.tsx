import { PatientInfo, Appointment, hasHealthAlert } from "@/app/shared/data";

interface PatientCardProps {
  patient: PatientInfo;
  appointments: Appointment[];
}

/**
 * 📇 [PATIENT COMPONENT] การ์ดข้อมูลคนไข้ 1 คน (HN, เบอร์โทร, โรคประจำตัว, ประวัติการรักษา)
 */
export default function PatientCard({ patient: p, appointments }: PatientCardProps) {
  const history = appointments.filter(
    (x) =>
      x.hn === p.hn &&
      ["เสร็จสิ้น", "รอชำระเงิน", "ชำระเงินแล้ว"].includes(x.status)
  );

  return (
    <div
      className="rounded-2xl bg-white p-5"
      style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #FF8C9A, #FF6B7E)" }}
        >
          {p.name[2] ?? "?"}
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: "#1A365D" }}>
            {p.name}
          </p>
          <p className="text-xs" style={{ color: "#4A6080" }}>
            {p.hn} • {p.phone}
          </p>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex gap-2 flex-wrap">
          {hasHealthAlert(undefined, p.underlyingDisease) && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#FFF3E0", color: "#E65100" }}
            >
              โรคประจำตัว: {p.underlyingDisease}
            </span>
          )}
          {hasHealthAlert(p.allergyHistory) && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#FEF2F2", color: "#B91C1C" }}
            >
              แพ้: {p.allergyHistory}
            </span>
          )}
          {!hasHealthAlert(p.allergyHistory, p.underlyingDisease) && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#E8FFF0", color: "#1B7A3E" }}
            >
              ปกติ
            </span>
          )}
        </div>
        {history.length > 0 && (
          <div
            className="pt-2 mt-2"
            style={{ borderTop: "1px solid rgba(26,54,93,0.06)" }}
          >
            <p
              className="text-xs font-medium mb-1.5"
              style={{ color: "#4A6080" }}
            >
              ประวัติการรักษา ({history.length} ครั้ง)
            </p>
            {history.slice(0, 2).map((h) => (
              <div key={h.id} className="flex justify-between text-xs py-1">
                <span style={{ color: "#1A365D" }}>{h.service}</span>
                <span style={{ color: "#4A6080" }}>{h.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

