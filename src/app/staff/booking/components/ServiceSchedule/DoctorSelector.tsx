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
  const cardStyle = (isSelected: boolean): React.CSSProperties => ({
    flexShrink: 0,
    width: 102,
    borderRadius: 12,
    overflow: "hidden",
    textAlign: "left",
    cursor: "pointer",
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
    border: isSelected ? "2px solid #E16076" : "1.5px solid rgba(26,54,93,0.12)",
    boxShadow: isSelected ? "0 2px 10px rgba(225,96,118,0.2)" : "none",
  });

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: "0 1px 8px rgba(26,54,93,0.07)" }}
    >
      <div className="p-3">
        <p className="text-xs font-semibold mb-2" style={{ color: "#4A6080" }}>
          เลือกทันตแพทย์
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 items-stretch">
          <button
            type="button"
            onClick={() => onSelectDoctor(0)}
            style={cardStyle(selectedDoctorId === 0)}
          >
            <div
              className="h-14 w-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#F8FAFC" }}
            >
              <UserPlus size={20} style={{ color: "#1A365D", opacity: 0.25 }} />
            </div>
            <div className="p-1.5 flex-1 flex flex-col justify-between">
              <p className="text-[11px] font-bold leading-tight" style={{ color: "#1A365D" }}>
                ท่านใดก็ได้
              </p>
              <p className="text-[9px] mt-1 truncate" style={{ color: "#E16076" }}>
                คิวเร็วสุด
              </p>
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
                type="button"
                onClick={() => onSelectDoctor(d.id)}
                style={cardStyle(isSelected)}
              >
                <img
                  src={imgUrl}
                  alt={d.name}
                  className="w-full h-14 object-cover block flex-shrink-0"
                />
                <div className="p-1.5 flex-1 flex flex-col justify-between">
                  <p
                    className="text-[11px] font-bold leading-tight line-clamp-2"
                    style={{ color: "#1A365D" }}
                  >
                    {d.name}
                  </p>
                  <p className="text-[9px] mt-1 truncate" style={{ color: "#E16076" }}>
                    {d.specialty}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
