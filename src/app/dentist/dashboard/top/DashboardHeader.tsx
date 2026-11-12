import React from "react";
import { DentistInfo } from "@/app/shared/data";

interface TitleBarProps {
  doctor: DentistInfo | null;
  formattedDate?: string;
  todayText?: string;
}

/**
 * 🏷️ [HEADER COMPONENT] หัวข้อทักทายคุณหมอ พร้อมวันที่และเวลาทำการ
 */
export default function TitleBar({ doctor }: TitleBarProps) {
  return (
    <div className="mb-6">
      <h1
        className="text-2xl font-bold"
        style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
      >
        สวัสดี {doctor ? `คุณหมอ${doctor.name}` : ""}
      </h1>
    </div>
  );
}

