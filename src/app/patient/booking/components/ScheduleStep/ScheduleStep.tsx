import React from "react";
import { ArrowRight } from "lucide-react";
import ServiceDetailLeftCard from "./ServiceDetailLeftCard";
import DoctorSelector from "./DoctorSelector";
import FollowUpAlert from "./FollowUpAlert";
import BookingCalendar from "./BookingCalendar";
import TimeSlotPicker from "./TimeSlotPicker";
import { ServiceDetail } from "../../data/serviceDetailsData";

interface ScheduleStepProps {
  serviceTitle: string;
  estTime: number;
  servicePrice?: string;
  iconName?: string;
  detail: ServiceDetail;
  wantSelectDoctor: boolean;
  setWantSelectDoctor: (want: boolean) => void;
  selDoctor: number | "any" | null;
  setSelDoctor: (doc: number | "any") => void;
  isBoundDoctor: boolean;
  loadingDoctors: boolean;
  landingDoctors: any[];
  filteredDoctors: any[];
  isFollowUp?: boolean;
  planItemId?: number;
  targetDate: Date;
  setMonthOffset: React.Dispatch<React.SetStateAction<number>>;
  firstDow: number;
  daysInMonth: number;
  selDay: number | null;
  setSelDay: (d: number | null) => void;
  setSelTime: (t: string | null) => void;
  dayStatus: (d: number) => { status: "past" | "available"; reason?: string };
  fullyBookedDates: Set<string>;
  year: number;
  month: number;
  loadingSlots: boolean;
  availableTimes: any[];
  selTime: string | null;
  reqSlots: number;
  endTimeStr: string;
  notes: string;
  setNotes: (n: string) => void;
  canNext: boolean;
  onNext: () => void;
}

/**
 * 🗓️ [STEP 1 CONTAINER] จัดการคอลัมน์ซ้าย (รายละเอียดบริการ) และคอลัมน์ขวา (เลือกแพทย์ ปฏิทิน เวลา)
 */
export default function ScheduleStep({
  serviceTitle,
  estTime,
  servicePrice,
  iconName,
  detail,
  wantSelectDoctor,
  setWantSelectDoctor,
  selDoctor,
  setSelDoctor,
  isBoundDoctor,
  loadingDoctors,
  landingDoctors,
  filteredDoctors,
  isFollowUp,
  planItemId,
  targetDate,
  setMonthOffset,
  firstDow,
  daysInMonth,
  selDay,
  setSelDay,
  setSelTime,
  dayStatus,
  fullyBookedDates,
  year,
  month,
  loadingSlots,
  availableTimes,
  selTime,
  reqSlots,
  endTimeStr,
  notes,
  setNotes,
  canNext,
  onNext,
}: ScheduleStepProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.25fr] gap-5 items-start">
      {/* ด้านซ้าย: การ์ดแสดงรายละเอียดบริการ */}
      <ServiceDetailLeftCard
        serviceTitle={serviceTitle}
        estTime={estTime}
        price={servicePrice}
        iconName={iconName}
        detail={detail}
      />

      {/* ด้านขวา: เลือกแพทย์ ปฏิทิน และเวลา */}
      <div className="flex flex-col gap-3">
        <DoctorSelector
          wantSelectDoctor={wantSelectDoctor}
          setWantSelectDoctor={setWantSelectDoctor}
          selDoctor={selDoctor}
          setSelDoctor={setSelDoctor}
          isBoundDoctor={isBoundDoctor}
          loadingDoctors={loadingDoctors}
          landingDoctors={landingDoctors}
          filteredDoctors={filteredDoctors}
        />

        <FollowUpAlert isFollowUp={isFollowUp} planItemId={planItemId} />

        <BookingCalendar
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
        />

        <TimeSlotPicker
          selDay={selDay}
          loadingSlots={loadingSlots}
          availableTimes={availableTimes}
          selTime={selTime}
          setSelTime={setSelTime}
          reqSlots={reqSlots}
          endTimeStr={endTimeStr}
          estTime={estTime}
          notes={notes}
          setNotes={setNotes}
        />

        {/* ปุ่มดำเนินการต่อ */}
        <button
          onClick={onNext}
          disabled={!canNext}
          style={{
            width: "100%",
            padding: "14px 0",
            borderRadius: 14,
            border: "none",
            fontWeight: 700,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: canNext ? "pointer" : "not-allowed",
            background: canNext ? "#FF8C9A" : "rgba(26,54,93,0.08)",
            color: canNext ? "white" : "#94A3B8",
            boxShadow: canNext ? "0 4px 20px rgba(255,140,154,0.35)" : "none",
            transition: "all 0.2s",
          }}
        >
          {canNext ? (
            <>
              <span>ดำเนินการต่อ</span>
              <ArrowRight size={16} />
            </>
          ) : (
            "เลือกวันและเวลาก่อน"
          )}
        </button>
      </div>
    </div>
  );
}
