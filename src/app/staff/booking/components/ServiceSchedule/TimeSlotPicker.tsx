import React from "react";

interface TimeSlotPickerProps {
  timeSlots: { time: string; status: string; canBook: boolean }[];
  loadingSlots: boolean;
  selectedTime: string;
  onSelectTime: (t: string) => void;
}

/**
 * ⏰ [BOOKING STEP 1 - SUBCOMPONENT] เลือกช่วงเวลาที่ต้องการนัดหมาย
 */
export default function TimeSlotPicker({
  timeSlots,
  loadingSlots,
  selectedTime,
  onSelectTime,
}: TimeSlotPickerProps) {
  return (
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
        เวลาที่ต้องการนัดหมาย
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
        {loadingSlots ? (
          <div
            style={{
              gridColumn: "1/-1",
              textAlign: "center",
              padding: "10px 0",
              fontSize: 12,
              color: "#4A6080",
            }}
          >
            กำลังโหลดเวลาที่ว่าง...
          </div>
        ) : timeSlots.length === 0 ? (
          <div
            style={{
              gridColumn: "1/-1",
              textAlign: "center",
              padding: "10px 0",
              fontSize: 12,
              color: "#4A6080",
            }}
          >
            ไม่มีคิวว่าง / หมอไม่ได้เข้าเวร
          </div>
        ) : (
          timeSlots.map(({ time, status, canBook }) => {
            const isBooked = status === "booked";
            const isPast = status === "past";
            const isOutside = status === "outside_shift";
            const notAvailable = isBooked || isPast || isOutside || !canBook;

            return (
              <button
                key={time}
                disabled={notAvailable}
                onClick={() => onSelectTime(time)}
                className="py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor:
                    selectedTime === time
                      ? "#FF8C9A"
                      : notAvailable
                      ? "#F0F4F8"
                      : "white",
                  color:
                    selectedTime === time
                      ? "white"
                      : notAvailable
                      ? "#ccc"
                      : "#1A365D",
                  border:
                    selectedTime === time
                      ? "none"
                      : notAvailable
                      ? "1px solid transparent"
                      : "1.5px solid rgba(26,54,93,0.12)",
                  cursor: notAvailable ? "not-allowed" : "pointer",
                  opacity:
                    isBooked || isPast || isOutside ? 0.4 : !canBook ? 0.6 : 1,
                }}
              >
                {time}
                {isBooked && (
                  <div className="text-[10px] opacity-80 mt-1 line-clamp-1 overflow-hidden overflow-ellipsis">
                    จองแล้ว
                  </div>
                )}
                {isPast && (
                  <div className="text-[10px] opacity-80 mt-1 line-clamp-1 overflow-hidden overflow-ellipsis">
                    เลยเวลาแล้ว
                  </div>
                )}
                {isOutside && (
                  <div className="text-[10px] opacity-80 mt-1 line-clamp-1 overflow-hidden overflow-ellipsis">
                    -
                  </div>
                )}
                {!isBooked && !isPast && !isOutside && !canBook && (
                  <div className="text-[10px] opacity-80 mt-1 line-clamp-1 overflow-hidden overflow-ellipsis">
                    เวลาไม่พอ
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

