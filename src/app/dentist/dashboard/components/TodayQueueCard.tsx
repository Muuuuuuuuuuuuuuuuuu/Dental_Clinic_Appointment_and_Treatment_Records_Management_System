import React from "react";
import { Appointment } from "@/app/shared/data";
import QueueItem from "./QueueItem";

interface TodayQueueCardProps {
  appointments: Appointment[];
  onViewAll: () => void;
}

/**
 * 📋 [CONTENT COMPONENT] การ์ดคิวของฉันวันนี้ (แสดง 5 คนแรก + ลิงก์ดูทั้งหมด)
 */
export default function TodayQueueCard({
  appointments,
  onViewAll,
}: TodayQueueCardProps) {
  return (
    <div
      className="lg:col-span-2 rounded-2xl bg-white p-6"
      style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-base" style={{ color: "#1A365D" }}>
          คิวของฉันวันนี้
        </h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs hover:opacity-70 font-semibold cursor-pointer"
          style={{ color: "#FF8C9A" }}
        >
          ดูทั้งหมด
        </button>
      </div>
      <div className="space-y-3">
        {appointments.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">ไม่มีคิวนัดหมายวันนี้</p>
        ) : (
          appointments.slice(0, 5).map((a) => <QueueItem key={a.id} appointment={a} />)
        )}
      </div>
    </div>
  );
}

