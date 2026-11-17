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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_minmax(0,1fr)] xl:min-h-[410px] gap-4 items-start">
      {/* คอลัมน์ที่ 1: เลือกบริการ */}
      <ServiceSelector
        services={services}
        selectedService={form.service}
        onSelectService={handleServiceChange}
      />

      {/* คอลัมน์ที่ 2: เลือกทันตแพทย์และวันที่ */}
      <div className="space-y-3 min-w-0">
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
      </div>

      {/* คอลัมน์ที่ 3: เลือกเวลา นัดแบบเปิด และหมายเหตุ */}
      <div className="space-y-3 min-w-0">
        {!form.openAppt && form.date ? (
          <TimeSlotPicker
            timeSlots={timeSlots}
            loadingSlots={loadingSlots}
            selectedTime={form.time}
            onSelectTime={(t) => setForm((f) => ({ ...f, time: t }))}
          />
        ) : (
          <div
            className="bg-white rounded-2xl p-4 border border-gray-100 text-center"
            style={{ boxShadow: "0 1px 8px rgba(26,54,93,0.07)" }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: "#4A6080" }}>
              เวลาที่ต้องการนัดหมาย
            </p>
            <p className="text-xs py-4" style={{ color: "#94A3B8" }}>
              {form.openAppt
                ? "นัดแบบเปิด: คนไข้จะระบุวัน-เวลาเองภายหลัง"
                : "กรุณาเลือกวันที่ในปฏิทิน เพื่อดูเวลาว่าง"}
            </p>
          </div>
        )}

        

        <div
          className="bg-white rounded-2xl p-3.5 border border-gray-100"
          style={{ boxShadow: "0 1px 8px rgba(26,54,93,0.07)" }}
        >
          <label
            className="text-xs font-semibold block mb-1.5"
            style={{ color: "#4A6080" }}
          >
            หมายเหตุ / รายละเอียดนัดหมาย
          </label>
          <textarea
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 outline-none resize-none h-14 focus:border-[#E16076]"
            style={{ color: "#1A365D" }}
          />
        </div>
      </div>
    </div>
  );
}
