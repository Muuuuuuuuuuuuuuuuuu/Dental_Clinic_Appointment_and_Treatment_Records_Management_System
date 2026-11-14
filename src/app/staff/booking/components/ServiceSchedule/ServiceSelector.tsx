import React from "react";
import { ServiceInfo } from "@/app/shared/data";

interface ServiceSelectorProps {
  services: ServiceInfo[];
  selectedService: string;
  onSelectService: (name: string) => void;
}

/**
 * 🦷 [BOOKING STEP 1 - SUBCOMPONENT] เลือกบริการทันตกรรม
 */
export default function ServiceSelector({
  services,
  selectedService,
  onSelectService,
}: ServiceSelectorProps) {
  return (
    <div
      className="bg-white rounded-2xl p-3.5 border border-gray-100 min-w-0"
      style={{ boxShadow: "0 1px 8px rgba(26,54,93,0.07)" }}
    >
      <p className="text-xs font-semibold mb-2" style={{ color: "#4A6080" }}>
        เลือกบริการ
      </p>

      <div className="grid grid-cols-2 xl:grid-cols-1 gap-1.5">
        {services.map((s) => {
          const isSelected = selectedService === s.name;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectService(s.name)}
              className="px-3 py-1.5 rounded-xl text-xs text-left transition-all cursor-pointer truncate"
              style={{
                backgroundColor: isSelected ? "#FFF0F2" : "#F8FAFC",
                border: isSelected ? "1.5px solid #E16076" : "1.5px solid #E2E8F0",
                color: "#1A365D",
                fontWeight: isSelected ? 600 : 500,
              }}
            >
              {s.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
