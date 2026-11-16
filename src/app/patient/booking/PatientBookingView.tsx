import { usePatientBooking } from "./hooks/usePatientBooking";
import { View, PatientUser } from "../types";
import {
  BookingTitleBar,
  BookingStepIndicator,
  ServiceCardGrid,
  ScheduleStep,
  HealthChecklistStep,
  BookingSummaryCard,
  BookingSuccessState,
} from "./components";

export interface BookingViewProps {
  setView: (v: View) => void;
  initialService?: number | null;
  initialDoctor?: number | null;
  isFollowUp?: boolean;
  planItemId?: number;
  openTicketId?: number;
  user: PatientUser | null;
  onAddAppt?: (appt: any) => void;
}

/**
 * 📅 Patient Booking View - Flat & Clean Architecture
 */
export default function PatientBookingView({
  setView,
  initialService = null,
  initialDoctor = null,
  isFollowUp = false,
  planItemId,
  openTicketId,
  user,
  onAddAppt,
}: BookingViewProps) {
  const {
    step,
    setStep,
    selService,
    setSelService,
    selDoctor,
    setSelDoctor,
    wantSelectDoctor,
    setWantSelectDoctor,
    matchedDoctor,
    notes,
    setNotes,
    selDay,
    setSelDay,
    selTime,
    setSelTime,
    done,
    isPending,
    setMonthOffset,
    isSubmitting,
    isBoundDoctor,
    healthData,
    setHealthData,
    setHealthValid,
    servicesData,
    landingDoctors,
    filteredDoctors,
    loadingDoctors,
    loadingSlots,
    fullyBookedDates,
    today,
    targetDate,
    year,
    month,
    daysInMonth,
    firstDow,
    dayStatus,
    estTime,
    reqSlots,
    endTimeStr,
    availableTimes,
    serviceTitle,
    detail,
    canNext,
    handleNext,
    handleBack,
    handleConfirm,
    resetBooking,
  } = usePatientBooking({
    setView,
    initialService,
    initialDoctor,
    isFollowUp,
    planItemId,
    openTicketId,
    user,
    onAddAppt,
  });

  return (
    <div className="w-full">
      {/* 1. ส่วนหัว (TitleBar & StepIndicator) */}
      {!done && (
        <header className="mb-2">
          <BookingTitleBar step={step} isFollowUp={isFollowUp} onBack={handleBack} />
          <BookingStepIndicator step={step} />
        </header>
      )}

      {/* 2. ส่วนเนื้อหา */}
      {done ? (
        <BookingSuccessState
          serviceTitle={servicesData[selService!]?.title || ""}
          doctorName={
            selDoctor === "any" || selDoctor === null
              ? landingDoctors.find((d) => d.id === matchedDoctor)?.name ||
              "ไม่ระบุแพทย์"
              : landingDoctors.find((d) => d.id === selDoctor)?.name ||
              "ไม่ระบุแพทย์"
          }
          selDay={selDay}
          selTime={selTime}
          endTimeStr={endTimeStr}
          today={today}
          isPending={isPending}
          isFollowUp={isFollowUp}
          setView={setView}
          onReset={resetBooking}
        />
      ) : (
        <main>
          {/* ขั้นตอนที่ 0: เลือกบริการ */}
          {step === 0 && (
            <ServiceCardGrid
              servicesData={servicesData}
              onSelectService={(i) => {
                setSelService(i);
                setStep(1);
              }}
            />
          )}

          {/* ขั้นตอนที่ 1: รายละเอียดบริการ และเลือกเวลา */}
          {step === 1 && (
            <ScheduleStep
              serviceTitle={serviceTitle}
              estTime={estTime}
              servicePrice={servicesData[selService!]?.price}
              iconName={servicesData[selService!]?.iconName}
              detail={detail}
              wantSelectDoctor={wantSelectDoctor}
              setWantSelectDoctor={setWantSelectDoctor}
              selDoctor={selDoctor}
              setSelDoctor={setSelDoctor}
              isBoundDoctor={isBoundDoctor}
              loadingDoctors={loadingDoctors}
              landingDoctors={landingDoctors}
              filteredDoctors={filteredDoctors}
              isFollowUp={isFollowUp}
              planItemId={planItemId}
              targetDate={targetDate}
              setMonthOffset={setMonthOffset}
              firstDow={firstDow}
              daysInMonth={daysInMonth}
              selDay={selDay}
              setSelDay={setSelDay}
              setSelTime={setSelTime}
              dayStatus={dayStatus}
              fullyBookedDates={fullyBookedDates}
              year={year}
              month={month}
              loadingSlots={loadingSlots}
              availableTimes={availableTimes}
              selTime={selTime}
              reqSlots={reqSlots}
              endTimeStr={endTimeStr}
              notes={notes}
              setNotes={setNotes}
              canNext={canNext()}
              onNext={handleNext}
            />
          )}

          {/* ขั้นตอนที่ 2: ตรวจสอบข้อมูลสุขภาพ */}
          {step === 2 && (
            <HealthChecklistStep
              user={user}
              healthData={healthData}
              setHealthData={setHealthData}
              setHealthValid={setHealthValid}
              canNext={canNext()}
              onNext={handleNext}
            />
          )}

          {/* ขั้นตอนที่ 4: สรุปข้อมูลและยืนยันการจอง */}
          {step === 4 && (
            <BookingSummaryCard
              serviceTitle={servicesData[selService!]?.title || "ไม่ระบุ"}
              doctorName={
                selDoctor === "any" || selDoctor === null
                  ? "จัดแพทย์ให้อัตโนมัติ"
                  : landingDoctors.find((d) => d.id === selDoctor)?.name ||
                  "ไม่ระบุ"
              }
              dateStr={
                selDay
                  ? `${selDay} ${targetDate.toLocaleDateString("th-TH", {
                      month: "long",
                      year: "numeric",
                    })}`
                  : "ยังไม่ได้ระบุวัน"
              }
              timeStr={
                selTime
                  ? `${selTime} – ${endTimeStr} น.`
                  : "ยังไม่ได้ระบุเวลา"
              }
              price={servicesData[selService!]?.price}
              notes={notes}
              isSubmitting={isSubmitting}
              onConfirm={handleConfirm}
            />
          )}
        </main>
      )}
    </div>
  );
}
