import React from "react";
import { FileText } from "lucide-react";

/**
 * 📭 [HISTORY COMPONENT] กล่องแสดงผลเมื่อยังไม่มีประวัติการรักษา
 */
export default function EmptyHistoryState() {
  return (
    <div
      className="text-center py-16 rounded-2xl bg-white"
      style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
    >
      <FileText
        size={40}
        className="mx-auto mb-3 opacity-20"
        style={{ color: "#1A365D" }}
      />
      <p className="text-sm" style={{ color: "#4A6080" }}>
        ยังไม่มีประวัติการรักษา
      </p>
    </div>
  );
}

