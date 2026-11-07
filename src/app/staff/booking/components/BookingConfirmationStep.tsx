import React from "react";
import { DentistInfo } from "@/app/shared/data";
import { BookingForm } from "../hooks/useWalkInBooking";

interface BookingConfirmationStepProps {
  patientInfo: any;
  form: BookingForm;
  dentists: DentistInfo[];
}

/**
 * 📝 [BOOKING STEP 2] ตรวจสอบและยืนยันข้อมูลนัดหมาย
 */
export default function BookingConfirmationStep({
  patientInfo,
  form,
  dentists,
}: BookingConfirmationStepProps) {
  const doctorName = form.doctorId
    ? dentists.find((d) => d.id === form.doctorId)?.name ?? "-"
    : "ท่านใดก็ได้";

  const rows = [
    ["คนไข้", patientInfo?.name || "-"],
    ["รหัสคนไข้", patientInfo?.hn || "-"],
    ["เบอร์โทร", patientInfo?.phone || "-"],
    ["บริการ", form.service],
    ["ทันตแพทย์", doctorName],
    ["วัน-เวลา", form.openAppt ? "รอระบุวัน-เวลา" : `วันที่ ${form.date} เวลา ${form.time} น.`],
    ["หมายเหตุ", form.note || "-"],
  ];

  return (
    <div>
      <h3 className="font-semibold mb-4" style={{ color: "#1A365D" }}>
        ยืนยันการจอง Walk-in
      </h3>
      {rows.map(([k, v]) => (
        <div
          key={k}
          className="flex justify-between py-2.5 text-sm"
          style={{ borderBottom: "1px solid rgba(26,54,93,0.06)" }}
        >
          <span style={{ color: "#4A6080" }}>{k}</span>
          <span className="font-medium" style={{ color: "#1A365D" }}>
            {v}
          </span>
        </div>
      ))}
    </div>
  );
}

