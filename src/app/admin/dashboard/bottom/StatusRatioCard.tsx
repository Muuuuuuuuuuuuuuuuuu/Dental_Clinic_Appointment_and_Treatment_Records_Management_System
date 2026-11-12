import React from "react";

interface StatusRatioCardProps {
  completedCnt: number;
  scheduledCnt: number;
  cancelledCnt: number;
  noShowCnt: number;
  totalCnt: number;
}

/**
 * 📊 [SUMMARY COMPONENT] แถบสัดส่วนสถานะนัดหมาย (สำเร็จ, รอคิว, ยกเลิก, ไม่มาตามนัด)
 */
export default function StatusRatioCard({
  completedCnt,
  scheduledCnt,
  cancelledCnt,
  noShowCnt,
  totalCnt,
}: StatusRatioCardProps) {
  const safeTotal = totalCnt || 1;

  return (
    <div
      className="lg:col-span-8 rounded-xl bg-white px-4 py-3 flex flex-col justify-center h-full"
      style={{ boxShadow: "0 2px 8px rgba(26,54,93,0.05)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-xs" style={{ color: "#1A365D" }}>
          สัดส่วนสถานะ
        </h3>
      </div>
      <div className="flex h-2.5 rounded-full overflow-hidden mb-2.5 bg-slate-100">
        <div style={{ width: `${(completedCnt / safeTotal) * 100}%`, backgroundColor: "#22C55E" }} />
        <div style={{ width: `${(scheduledCnt / safeTotal) * 100}%`, backgroundColor: "#3B82F6" }} />
        <div style={{ width: `${(cancelledCnt / safeTotal) * 100}%`, backgroundColor: "#EF4444" }} />
        <div style={{ width: `${(noShowCnt / safeTotal) * 100}%`, backgroundColor: "#D946EF" }} />
      </div>
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium" style={{ color: "#4A6080" }}>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> สำเร็จ{" "}
          <b className="text-slate-800">{completedCnt}</b>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> รอคิว{" "}
          <b className="text-slate-800">{scheduledCnt}</b>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> ยกเลิก{" "}
          <b className="text-red-600">{cancelledCnt}</b>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500 inline-block" /> ไม่มาตามนัด{" "}
          <b className="text-fuchsia-600">{noShowCnt}</b>
        </span>
      </div>
    </div>
  );
}
