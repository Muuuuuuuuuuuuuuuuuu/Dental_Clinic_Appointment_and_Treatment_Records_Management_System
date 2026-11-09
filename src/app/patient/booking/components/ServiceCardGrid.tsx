import React from "react";
import { Clock } from "lucide-react";

interface ServiceCardGridProps {
  servicesData: any[];
  onSelectService: (index: number) => void;
}

export default function ServiceCardGrid({
  servicesData,
  onSelectService,
}: ServiceCardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {servicesData.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelectService(i)}
          className="p-5 rounded-2xl text-left bg-white transition-all duration-200"
          style={{
            border: "2px solid transparent",
            boxShadow: "0 2px 12px rgba(26,54,93,0.06)",
          }}
          onMouseEnter={(e) =>
          (e.currentTarget.style.boxShadow =
            "0 6px 20px rgba(255,140,154,0.2)")
          }
          onMouseLeave={(e) =>
          (e.currentTarget.style.boxShadow =
            "0 2px 12px rgba(26,54,93,0.06)")
          }
        >
          <p className="font-semibold text-sm mb-1 text-[#1A365D]">{s.title}</p>
          <div className="flex items-center gap-1.5 mb-2 text-xs text-[#4A6080]">

            <span>ใช้เวลาประมาณ {s.baseTimeMins} นาที</span>
          </div>
          <p className="text-xs font-semibold text-[#FF8C9A]">{s.price}</p>
        </button>
      ))}
    </div>
  );
}

