import { Appointment } from "@/app/shared/data";
import { useWalkInBooking } from "./hooks/useWalkInBooking";
import {
  BookingHeader,
  PatientSearchStep,
  ServiceScheduleStep,
  BookingConfirmationStep,
  BookingSuccessState,
} from "./components";

interface WalkInBookingProps {
  onAddAppt?: (appt: Appointment) => void;
}

/**
 * [STAFF WALK-IN BOOKING VIEW]
 * ระบบจองคิว Walk-in สำหรับเจ้าหน้าที่เคาน์เตอร์ (Flat & Clean Architecture)
 */
export default function StaffWalkInBookingView({ onAddAppt }: WalkInBookingProps) {
  const {
    step,
    setStep,
    form,
    setForm,
    handleServiceChange,
    patientResults,
    patientInfo,
    setPatientInfo,
    searchKeyword,
    setSearchKeyword,
    searchError,
    dentists,
    filteredDentists,
    services,
    setMonthOffset,
    targetDate,
    year,
    month,
    daysInMonth,
    firstDow,
    dayStatus,
    timeSlots,
    loadingSlots,
    confirm,
    isSubmitting,
    done,
    resetAll,
  } = useWalkInBooking(onAddAppt);

  const nextStepConfig =
    step === 0
      ? {
        disabled: !patientInfo,
        onClick: () => setStep(1),
        label: "ถัดไป: เลือกบริการและเวลา",
      }
      : step === 1
        ? {
          disabled: !form.service || !form.date || !form.time,
          onClick: () => setStep(2),
          label: "ถัดไป: ตรวจสอบและยืนยัน",
        }
        : null;

  return (
    <div>
      {/* 1. ส่วนหัวและ Indicator แสดงขั้นตอน */}
      <BookingHeader step={step} />

      {/* 2. เนื้อหาตามขั้นตอนการจอง */}
      <main>
        {done && (
          <BookingSuccessState
            patientInfo={patientInfo}
            form={form}
            onReset={resetAll}
          />
        )}

        {!done && step === 0 && (
          <PatientSearchStep
            searchKeyword={searchKeyword}
            onSearchChange={setSearchKeyword}
            patientResults={patientResults}
            patientInfo={patientInfo}
            setPatientInfo={setPatientInfo}
            searchError={searchError}
          />
        )}

        {!done && step === 1 && (
          <ServiceScheduleStep
            form={form}
            setForm={setForm}
            services={services}
            filteredDentists={filteredDentists}
            handleServiceChange={handleServiceChange}
            targetDate={targetDate}
            onPrevMonth={() => setMonthOffset((m) => m - 1)}
            onNextMonth={() => setMonthOffset((m) => m + 1)}
            firstDow={firstDow}
            daysInMonth={daysInMonth}
            year={year}
            month={month}
            dayStatus={dayStatus}
            timeSlots={timeSlots}
            loadingSlots={loadingSlots}
          />
        )}

        {!done && step === 2 && (
          <BookingConfirmationStep
            patientInfo={patientInfo}
            form={form}
            dentists={dentists}
          />
        )}

        {/* ปุ่มควบคุมย้อนกลับและถัดไป */}
        {!done && (
          <div
            className={`flex items-center justify-between ${step === 0 || step === 2
                ? "max-w-xl mx-auto mt-4"
                : "mt-3 pt-2.5 border-t border-slate-200/70"
              }`}
          >
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                ย้อนกลับ
              </button>
            ) : (
              <div />
            )}

            {nextStepConfig && (
              <button
                type="button"
                disabled={nextStepConfig.disabled}
                onClick={nextStepConfig.onClick}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#E16076] hover:bg-[#D14D64] transition-colors disabled:bg-slate-200 disabled:text-slate-500 disabled:hover:bg-slate-200 disabled:cursor-not-allowed cursor-pointer"
              >
                {nextStepConfig.label}
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={confirm}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "กำลังบันทึก..." : "ยืนยันการจองนัดหมาย"}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
