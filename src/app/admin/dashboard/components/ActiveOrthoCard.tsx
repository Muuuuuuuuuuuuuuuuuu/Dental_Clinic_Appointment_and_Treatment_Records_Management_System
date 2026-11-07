import React from "react";
import { RefreshCw } from "lucide-react";

interface ActiveOrthoCardProps {
  activeOrtho: number;
}

/**
 * 🔄 [SUMMARY COMPONENT] กล่องสรุปเคสต่อเนื่อง (จัดฟัน, รากเทียม)
 */
export default function ActiveOrthoCard({ activeOrtho }: ActiveOrthoCardProps) {
  return (
    <div
      className="lg:col-span-3 rounded-xl px-4 py-3 flex items-center gap-3"
      style={{
        background: "linear-gradient(135deg, #1A365D 0%, #29538A 100%)",
        boxShadow: "0 2px 8px rgba(26,54,93,0.1)",
      }}
    >
      <div className="p-2 bg-white/10 rounded-lg flex-shrink-0">
        <RefreshCw size={16} className="text-[#FF8C9A]" />
      </div>
      <div>
        <div className="text-[10px] text-white/60">เคสต่อเนื่อง</div>
        <span
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "Sarabun, sans-serif" }}
        >
          {activeOrtho}
        </span>
        <span className="text-xs text-white/70 ml-1">เคส</span>
      </div>
    </div>
  );
}

