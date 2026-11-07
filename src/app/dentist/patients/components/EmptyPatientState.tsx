import React from "react";
import { Users } from "lucide-react";

/**
 * 📭 [PATIENT COMPONENT] สถานะเมื่อไม่พบข้อมูลคนไข้ที่ค้นหา
 */
export default function EmptyPatientState() {
  return (
    <div className="col-span-1 md:col-span-2 text-center py-12" style={{ color: "#4A6080" }}>
      <Users size={32} className="mx-auto mb-2 opacity-20" />
      <p className="text-sm">ไม่พบข้อมูลคนไข้</p>
    </div>
  );
}

