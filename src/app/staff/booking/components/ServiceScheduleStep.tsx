import React from "react";
import ServiceSelector from "./ServiceSchedule/ServiceSelector";
import DoctorSelector from "./ServiceSchedule/DoctorSelector";
import CalendarPicker from "./ServiceSchedule/CalendarPicker";
import TimeSlotPicker from "./ServiceSchedule/TimeSlotPicker";
import { DentistInfo, ServiceInfo } from "@/app/shared/data";
import { BookingForm } from "../hooks/useWalkInBooking";

interface ServiceScheduleStepProps {
  form: BookingForm;
  setForm: React.Dispatch<React.SetStateAction<BookingForm>>;
  services: ServiceInfo[];
  filteredDentists: DentistInfo[];
  estMins: number;
  handleServiceChange: (serviceName: string) => void;
  targetDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  firstDow: number;
  daysInMonth: number;
  year: number;
  month: number;
  dayStatus: (d: number) => { status: "past" | "available"; reason?: string };
  timeSlots: { time: string; status: string; canBook: boolean }[];
  loadingSlots: boolean;
}

/**
 * 🦷 [BOOKING STEP 1] ขั้นตอนเลือกบริการ ทันตแพทย์ วันที่ และเวลา
 */
export default function ServiceScheduleStep({
  form,
  setForm,
  services,
  filteredDentists,
  estMins,
  handleServiceChange,
  targetDate,
  onPrevMonth,
  onNextMonth,
  firstDow,
  daysInMonth,
  year,
  month,
  dayStatus,
  timeSlots,
  loadingSlots,
}: ServiceScheduleStepProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1.1fr_1fr] gap-6 items-start">
      {/* คอลัมน์ที่ 1: เลือกบริการ */}
      <ServiceSelector
        services={services}
        selectedService={form.service}
        onSelectService={handleServiceChange}
        estMins={estMins}
      />

      {/* คอลัมน์ที่ 2: เลือกทันตแพทย์และวันที่ */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <DoctorSelector
          dentists={filteredDentists}
          selectedDoctorId={form.doctorId}
          onSelectDoctor={(id) =>
            setForm((f) => ({ ...f, doctorId: id, date: "", time: "" }))
          }
        />

        <CalendarPicker
          targetDate={targetDate}
          onPrevMonth={onPrevMonth}
          onNextMonth={onNextMonth}
          firstDow={firstDow}
          daysInMonth={daysInMonth}
          year={year}
          month={month}
          dayStatus={dayStatus}
          selectedDate={form.date}
          onSelectDate={(dStr) =>
            setForm((f) => ({ ...f, date: dStr, time: "" }))
          }
        />

        <div
          className="flex items-center gap-2 mt-2 p-3 rounded-xl"
          style={{
            backgroundColor: "#F8F9FA",
            border: "1px solid rgba(26,54,93,0.06)",
          }}
        >
          <input
            type="checkbox"
            id="openAppt"
            checked={form.openAppt}
            onChange={(e) =>
              setForm((f) => ({ ...f, openAppt: e.target.checked, time: "" }))
            }
            className="w-4 h-4 rounded text-pink-500"
          />
          <label
            htmlFor="openAppt"
            className="text-sm font-medium"
            style={{ color: "#1A365D" }}
          >
            นัดแบบเปิด (ให้คนไข้ไปเลือกวัน-เวลาทีหลัง)
          </label>
        </div>

        <div className="mt-4">
          <label
            className="text-xs font-medium block mb-1.5"
            style={{ color: "#4A6080" }}
          >
            หมายเหตุ / รายละเอียดนัดหมาย (ตัวเลือก)
          </label>
          <textarea
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            placeholder="เช่น อุดฟันซี่ 13, 14 ต่อ"
            className="w-full px-3 py-3 rounded-xl text-sm outline-none resize-none h-16"
            style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
          />
        </div>
      </div>

      {/* คอลัมน์ที่ 3: เลือกเวลา */}
      <div>
        {!form.openAppt && form.date && (
          <TimeSlotPicker
            timeSlots={timeSlots}
            loadingSlots={loadingSlots}
            selectedTime={form.time}
            onSelectTime={(t) => setForm((f) => ({ ...f, time: t }))}
          />
        )}
      </div>
    </div>
  );
}
