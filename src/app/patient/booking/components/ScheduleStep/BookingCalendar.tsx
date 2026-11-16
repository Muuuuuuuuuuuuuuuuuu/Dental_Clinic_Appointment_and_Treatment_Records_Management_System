import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BookingCalendarProps {
  targetDate: Date;
  setMonthOffset: React.Dispatch<React.SetStateAction<number>>;
  firstDow: number;
  daysInMonth: number;
  selDay: number | null;
  setSelDay: (d: number | null) => void;
  setSelTime: (t: string | null) => void;
  dayStatus: (d: number) => { status: "past" | "available"; reason?: string };
  fullyBookedDates: Set<string>;
  year: number;
  month: number;
}

/**
 * 📅 [STEP 1 RIGHT COMPONENT] ปฏิทินเลือกวันนัดหมาย
 */
export default function BookingCalendar({
  targetDate,
  setMonthOffset,
  firstDow,
  daysInMonth,
  selDay,
  setSelDay,
  setSelTime,
  dayStatus,
  fullyBookedDates,
  year,
  month,
}: BookingCalendarProps) {
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
          background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)",
          padding: "9px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={() => setMonthOffset((m) => m - 1)}
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
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.35)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)")
          }
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
          {targetDate.toLocaleDateString("th-TH", {
            month: "long",
            year: "numeric",
          })}
        </p>
        <button
          onClick={() => setMonthOffset((m) => m + 1)}
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
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.35)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)")
          }
        >
          <ChevronRight size={12} />
        </button>
      </div>

      {/* ตารางวันที่ */}
      <div style={{ backgroundColor: "white", padding: "8px 10px 10px" }}>
        {/* ชื่อวันในสัปดาห์ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            marginBottom: 4,
          }}
        >
          {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((d, i) => {
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
            );
          })}
        </div>

        {/* ช่องวันที่ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 2,
          }}
        >
          {[...Array(firstDow)].map((_, i) => (
            <div key={`e${i}`} />
          ))}
          {[...Array(daysInMonth)].map((_, i) => {
            const d = i + 1;
            const ds = dayStatus(d);
            const st = ds.status;
            const reason = ds.reason;
            const sel = selDay === d;
            const isPast = st === "past";
            const isAvailable = st === "available";
            const dateStr = `${year}-${String(month + 1).padStart(
              2,
              "0"
            )}-${String(d).padStart(2, "0")}`;
            const isFullyBooked = isAvailable && fullyBookedDates.has(dateStr);

            return (
              <button
                key={d}
                disabled={isPast}
                onClick={() => {
                  if (isAvailable && !isFullyBooked) {
                    setSelDay(d);
                    setSelTime(null);
                  }
                }}
                title={isFullyBooked ? "คิวเต็มทุกช่วงเวลา" : reason}
                style={{
                  height: 30,
                  borderRadius: 6,
                  border: "none",
                  width: "100%",
                  fontSize: 10,
                  fontWeight: sel || isFullyBooked ? 700 : 500,
                  cursor: isPast || isFullyBooked ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                  background: sel
                    ? "#FF8C9A"
                    : isFullyBooked
                      ? "rgba(239,68,68,0.12)"
                      : "transparent",
                  color: sel
                    ? "white"
                    : isPast
                      ? "#D1D5DB"
                      : isFullyBooked
                        ? "#DC2626"
                        : "#1A365D",
                  boxShadow: sel ? "0 2px 6px rgba(255,140,154,0.5)" : "none",
                  opacity: isPast ? 0.4 : 1,
                  outline: isFullyBooked
                    ? "1px solid rgba(239,68,68,0.30)"
                    : "none",
                }}
                onMouseEnter={(e) => {
                  if (isAvailable && !sel && !isFullyBooked)
                    e.currentTarget.style.backgroundColor = "#FFF0F2";
                }}
                onMouseLeave={(e) => {
                  if (isAvailable && !sel && !isFullyBooked)
                    e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {d}
              </button>
            );
          })}
        </div>

        {/* คำอธิบายสัญลักษณ์สี */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 8,
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 8,
              color: "#94A3B8", //สีtxet
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "#f443bfff", //สีจุด
              }}
            />
            เลือก
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 8,
              color: "#94A3B8", //สี text
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "#EF4444", //สีจุด
              }}
            />
            คิวเต็ม
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 8,
              color: "#94A3B8", //สีtext
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "#D1D5DB", //สีจุด
              }}
            />
            ไม่ว่าง
          </div>
        </div>
      </div>
    </div>
  );
}

