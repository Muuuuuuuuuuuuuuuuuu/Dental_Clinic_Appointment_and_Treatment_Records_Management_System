import React from "react";
import { Clock } from "lucide-react";

interface AvailableTimeSlot {
  t: string;
  status: string;
  canBook: boolean;
}

interface TimeSlotPickerProps {
  selDay: number | null;
  loadingSlots: boolean;
  availableTimes: AvailableTimeSlot[];
  selTime: string | null;
  setSelTime: (t: string) => void;
  reqSlots: number;
  endTimeStr: string;
  estTime: number;
  notes: string;
  setNotes: (n: string) => void;
}

/**
 * ⏰ [STEP 1 RIGHT COMPONENT] เลือกช่วงเวลาที่ต้องการนัดหมาย และระบุหมายเหตุ
 */
export default function TimeSlotPicker({
  selDay,
  loadingSlots,
  availableTimes,
  selTime,
  setSelTime,
  reqSlots,
  endTimeStr,
  estTime,
  notes,
  setNotes,
}: TimeSlotPickerProps) {
  return (
    <>
      <div
        style={{
          borderRadius: 16,
          backgroundColor: "white",
          padding: "14px 16px",
          boxShadow: "0 1px 8px rgba(26,54,93,0.07)",
        }}
      >
        <p
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: "#1A365D",
            marginBottom: 10,
          }}
        >
          {selDay ? `เวลาว่าง — วันที่ ${selDay}` : "เลือกวันในปฏิทินก่อน"}
        </p>

        {selDay ? (
          <>
            {loadingSlots ? (
              <div
                style={{
                  height: 80,
                  borderRadius: 12,
                  backgroundColor: "#F8FAFC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <p style={{ fontSize: 12, color: "#94A3B8" }}>
                  กำลังโหลดเวลาว่าง...
                </p>
              </div>
            ) : availableTimes.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableTimes.map(({ t, status, canBook }, idx) => {
                  const isSelected = t === selTime;
                  const selIndex = selTime
                    ? availableTimes.findIndex((a) => a.t === selTime)
                    : -1;
                  const isActive =
                    selIndex !== -1 && idx >= selIndex && idx < selIndex + reqSlots;

                  const isBooked = status === "booked";
                  const isOutside = status === "outside_shift";
                  const isPast = status === "past";
                  const isDisabled =
                    (!canBook && !isActive) || isBooked || isOutside || isPast;

                  const slotEndTime = (() => {
                    const [h, m] = t.split(":").map(Number);
                    const tot = h * 60 + m + 30;
                    return `${Math.floor(tot / 60)
                      .toString()
                      .padStart(2, "0")}:${(tot % 60)
                        .toString()
                        .padStart(2, "0")}`;
                  })();

                  return (
                    <button
                      key={t}
                      disabled={isDisabled}
                      onClick={() => {
                        if (canBook) setSelTime(t);
                      }}
                      style={{
                        padding: "8px 2px",
                        borderRadius: 10,
                        fontSize: 11,
                        fontWeight: 600,
                        border:
                          !isDisabled && !isActive
                            ? "1.5px solid rgba(255,140,154,0.3)"
                            : isDisabled && !isActive
                              ? "1px solid #E5E7EB"
                              : "none",
                        cursor: canBook && !isSelected ? "pointer" : "default",
                        transition: "all 0.15s",
                        backgroundColor: isActive
                          ? "#FF8C9A"
                          : isDisabled
                            ? "#F3F4F6"
                            : "white",
                        color: isActive
                          ? "white"
                          : isDisabled
                            ? "#9CA3AF"
                            : "#1A365D",
                        boxShadow:
                          !isDisabled && !isActive
                            ? "0 1px 4px rgba(26,54,93,0.1)"
                            : "none",
                      }}
                    >
                      {isActive ? `${t} – ${slotEndTime}` : t}
                      {isPast && !isActive && (
                        <span
                          style={{
                            display: "block",
                            fontSize: 9,
                            color: "#9CA3AF",
                            marginTop: 2,
                          }}
                        >
                          หมดเวลา
                        </span>
                      )}
                      {isOutside && !isActive && (
                        <span
                          style={{
                            display: "block",
                            fontSize: 9,
                            color: "#9CA3AF",
                            marginTop: 2,
                          }}
                        >
                          ไม่ออกตรวจ
                        </span>
                      )}
                      {isBooked && !isActive && (
                        <span
                          style={{
                            display: "block",
                            fontSize: 9,
                            color: "#F87171",
                            marginTop: 2,
                          }}
                        >
                          คิวไม่ว่าง
                        </span>
                      )}
                      {!isBooked &&
                        !isOutside &&
                        !isPast &&
                        !canBook &&
                        !isActive && (
                          <span
                            style={{
                              display: "block",
                              fontSize: 9,
                              color: "#FBBF24",
                              marginTop: 2,
                            }}
                          >
                            เวลาไม่พอ
                          </span>
                        )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  height: 80,
                  borderRadius: 12,
                  backgroundColor: "#FFF0F2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <p style={{ fontSize: 12, color: "#E0314C" }}>
                  ไม่มีเวลาว่างในวันนี้
                </p>
              </div>
            )}

            {selTime && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 12px",
                  borderRadius: 12,
                  backgroundColor: "#FFD6DC",
                  display: "flex",
                  gap: 8,
                }}
              >
                <Clock
                  size={14}
                  style={{ color: "#E0314C", flexShrink: 0, marginTop: 2 }}
                />
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#E0314C",
                    }}
                  >
                    {selTime} – {endTimeStr} น.
                  </p>
                  <p
                    style={{
                      fontSize: 10,
                      color: "#E0314C",
                      opacity: 0.8,
                      marginTop: 2,
                    }}
                  >
                    ใช้เวลาทำฟันประมาณ {estTime} นาที
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              height: 80,
              borderRadius: 12,
              backgroundColor: "#F8FAFC",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p style={{ fontSize: 12, color: "#94A3B8" }}>เลือกวันก่อน</p>
          </div>
        )}
      </div>

      {/* ช่องระบุหมายเหตุหรืออาการเบื้องต้น */}
      <div style={{ marginTop: 16 }}>
        <label
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#1A365D",
            marginBottom: 8,
            display: "block",
          }}
        >
          หมายเหตุ
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="เช่น ปวดฟันซี่ในสุด, ต้องการปรึกษาเรื่องจัดฟัน..."
          style={{
            width: "100%",
            height: 80,
            padding: "12px",
            borderRadius: 12,
            border: "1px solid rgba(26,54,93,0.1)",
            backgroundColor: "#F8FAFC",
            fontSize: 13,
            color: "#1A365D",
            resize: "none",
            outline: "none",
          }}
        />
      </div>
    </>
  );
}

