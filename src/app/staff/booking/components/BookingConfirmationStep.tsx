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
    ["เบอร์โทร", patientInfo?.phone || "-"],
    ["บริการ", form.service],
    ["ทันตแพทย์", doctorName],
    ["วัน-เวลา", form.openAppt ? "รอระบุวัน-เวลา" : `วันที่ ${form.date} เวลา ${form.time} น.`],
    ["หมายเหตุ", form.note || "-"],
  ];

  return (
    <div
      className="max-w-xl mx-auto mt-2 bg-white rounded-2xl p-6 sm:p-8 border border-gray-100"
      style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
    >
      <h3 className="text-base font-bold mb-4" style={{ color: "#1A365D" }}>
        ยืนยันการจอง Walk-in
      </h3>
      <div className="divide-y divide-slate-100">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-3 text-sm">
            <span style={{ color: "#4A6080" }}>{k}</span>
            <span className="font-medium text-right" style={{ color: "#1A365D" }}>
              {v}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

