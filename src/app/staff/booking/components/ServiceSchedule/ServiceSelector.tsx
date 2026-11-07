import React from "react";
import { Clock } from "lucide-react";
import { ServiceInfo } from "@/app/shared/data";

interface ServiceSelectorProps {
  services: ServiceInfo[];
  selectedService: string;
  onSelectService: (name: string) => void;
  estMins: number;
}

/**
 * 🦷 [BOOKING STEP 1 - SUBCOMPONENT] เลือกบริการทันตกรรม
 */
export default function ServiceSelector({
  services,
  selectedService,
  onSelectService,
  estMins,
}: ServiceSelectorProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: "#4A6080" }}>
          เลือกบริการ *
        </p>
        <div className="grid grid-cols-2 xl:grid-cols-1 gap-2">
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectService(s.name)}
              className="px-3 py-2.5 rounded-xl text-xs text-left transition-all"
              style={{
                backgroundColor: selectedService === s.name ? "#FFD6DC" : "#F0F4F8",
                border:
                  selectedService === s.name
                    ? "1.5px solid #FF8C9A"
                    : "1.5px solid transparent",
                color: "#1A365D",
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {selectedService && (
        <div
          className="p-4 rounded-xl"
          style={{
            background: "linear-gradient(135deg,#FFF0F2,#FFF8F9)",
            border: "1px solid rgba(255,140,154,0.25)",
          }}
        >
          <p
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: "#1A365D",
              marginBottom: 2,
            }}
          >
            {selectedService}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "#4A6080",
              marginBottom: 2,
            }}
          >
            <Clock size={12} style={{ color: "#FF8C9A" }} />
            <span>ใช้เวลาประมาณ {estMins} นาที</span>
          </div>
        </div>
      )}
    </div>
  );
}
