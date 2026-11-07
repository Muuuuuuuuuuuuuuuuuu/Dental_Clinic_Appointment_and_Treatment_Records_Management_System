import React from "react";
import { UserPlus } from "lucide-react";
import { DentistInfo } from "@/app/shared/data";

interface DoctorSelectorProps {
  dentists: DentistInfo[];
  selectedDoctorId: number;
  onSelectDoctor: (id: number) => void;
}

/**
 * 👨‍⚕️ [BOOKING STEP 1 - SUBCOMPONENT] เลือกทันตแพทย์
 */
export default function DoctorSelector({
  dentists,
  selectedDoctorId,
  onSelectDoctor,
}: DoctorSelectorProps) {
  return (
    <div
      style={{
        borderRadius: 16,
        backgroundColor: "white",
        overflow: "hidden",
        boxShadow: "0 1px 8px rgba(26,54,93,0.07)",
      }}
    >
      <div style={{ padding: "10px 14px" }}>
        <p className="text-xs font-medium mb-2" style={{ color: "#4A6080" }}>
          เลือกทันตแพทย์ (ตัวเลือกเสริม)
        </p>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          <button
            onClick={() => onSelectDoctor(0)}
            style={{
              flexShrink: 0,
              width: 86,
              borderRadius: 12,
              overflow: "hidden",
              textAlign: "left",
              cursor: "pointer",
              backgroundColor: "white",
              border:
                selectedDoctorId === 0
                  ? "2px solid #FF8C9A"
                  : "2px solid rgba(26,54,93,0.1)",
              boxShadow:
                selectedDoctorId === 0 ? "0 3px 12px rgba(255,140,154,0.3)" : "none",
            }}
          >
            <div
              style={{
                height: 64,
                backgroundColor: "#F8FAFC",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserPlus size={24} style={{ color: "#1A365D", opacity: 0.2 }} />
            </div>
            <div style={{ padding: "5px 7px" }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#1A365D" }}>ท่านใดก็ได้</p>
              <p style={{ fontSize: 9, color: "#FF8C9A", marginTop: 1 }}>คิวเร็วสุด</p>
            </div>
          </button>
          {dentists.map((d) => {
            const imgUrl =
              d.imageUrl ||
              "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&auto=format";
            const isSelected = selectedDoctorId === d.id;
            return (
              <button
                key={d.id}
                onClick={() => onSelectDoctor(d.id)}
                style={{
                  flexShrink: 0,
                  width: 86,
                  borderRadius: 12,
                  overflow: "hidden",
                  textAlign: "left",
                  cursor: "pointer",
                  backgroundColor: "white",
                  border: isSelected ? "2px solid #FF8C9A" : "2px solid rgba(26,54,93,0.1)",
                  boxShadow: isSelected ? "0 3px 12px rgba(255,140,154,0.3)" : "none",
                }}
              >
                <img
                  src={imgUrl}
                  alt={d.name}
                  style={{ width: "100%", height: 64, objectFit: "cover", display: "block" }}
                />
                <div style={{ padding: "5px 7px" }}>
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#1A365D",
                      lineHeight: 1.3,
                    }}
                  >
                    {d.name}
                  </p>
                  <p style={{ fontSize: 9, color: "#FF8C9A", marginTop: 1 }}>{d.specialty}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
