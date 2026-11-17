import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarPickerProps {
  targetDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  firstDow: number;
  daysInMonth: number;
  year: number;
  month: number;
  dayStatus: (d: number) => { status: "past" | "available"; reason?: string };
  fullyBookedDates?: Set<string>;
  selectedDate: string;
  onSelectDate: (dStr: string) => void;
}

/**
 * 📅 [BOOKING STEP 1 - SUBCOMPONENT] ปฏิทินเลือกวันนัดหมาย
 */
export default function CalendarPicker({
  targetDate,
  onPrevMonth,
  onNextMonth,
  firstDow,
  daysInMonth,
  year,
  month,
  dayStatus,
  fullyBookedDates,
  selectedDate,
  onSelectDate,
}: CalendarPickerProps) {
  const dayColors = [
    "#EF4444",
    "#FBBF24",
    "#F472B6",
    "#34D399",
    "#F97316",
    "#3B82F6",
    "#A855F7",
  ];

  return (
    <div
      style={{
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(26,54,93,0.10)",
      }}
    >
      {/* ส่วนหัวปฏิทิน */}
      <div
        style={{
          backgroundColor: "#E16076",
          padding: "7px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={onPrevMonth}
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            border: "none",
            backgroundColor: "rgba(255,255,255,0.2)",
            cursor: "pointer",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronLeft size={12} />
        </button>
        <p
          style={{
            fontWeight: 700,
            fontSize: 12,
            color: "white",
            letterSpacing: "0.02em",
          }}
        >
          {targetDate.toLocaleDateString("th-TH", { month: "long", year: "numeric" })}
        </p>
        <button
          onClick={onNextMonth}
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            border: "none",
            backgroundColor: "rgba(255,255,255,0.2)",
            cursor: "pointer",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronRight size={12} />
        </button>
      </div>

      {/* ตารางวันที่ */}
      <div style={{ backgroundColor: "white", padding: "6px 10px 8px" }}>
        {/* ชื่อวันในสัปดาห์ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            marginBottom: 2,
          }}
        >
          {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((d, i) => (
            <div
              key={d}
              style={{
                textAlign: "center",
                fontSize: 9,
                fontWeight: 600,
                color: dayColors[i],
                paddingBottom: 2,
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* ช่องวันที่ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
          {[...Array(firstDow)].map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {[...Array(daysInMonth)].map((_, i) => {
            const d = i + 1;
            const ds = dayStatus(d);
            const st = ds.status;
            const reason = ds.reason;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(
              2,
              "0"
            )}`;
            const sel = selectedDate === dateStr;
            const isAvailable = st === "available";
            const isFullyBooked = Boolean(isAvailable && fullyBookedDates?.has(dateStr));
            const canClick = isAvailable && !isFullyBooked;

            return (
              <button
                key={d}
                type="button"
                disabled={!canClick}
                onClick={() => canClick && onSelectDate(dateStr)}
                title={isFullyBooked ? "คิวเต็มทุกช่วงเวลา" : reason}
                style={{
                  height: 26,
                  borderRadius: 6,
                  border: "none",
                  width: "100%",
                  fontSize: 11,
                  fontWeight: sel || isFullyBooked ? 700 : 500,
                  cursor: canClick ? "pointer" : "not-allowed",
                  backgroundColor: sel
                    ? "#E16076"
                    : isFullyBooked
                    ? "rgba(239,68,68,0.12)"
                    : isAvailable
                    ? "rgba(26,54,93,0.03)"
                    : "transparent",
                  color: sel
                    ? "white"
                    : isFullyBooked
                    ? "#DC2626"
                    : isAvailable
                    ? "#1A365D"
                    : "#CBD5E1",
                  outline: isFullyBooked ? "1px solid rgba(239,68,68,0.30)" : "none",
                }}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

