import { useState, useEffect } from "react";
import { View, PatientUser } from "../../types";
import {
  addAppointment,
  getClinicClosures,
  getLandingServices,
  getLandingDoctors,
  getDentistsByService,
  getWeeklyOffDays,
  getClinicTimeSlots,
  getDoctorSchedules,
  TimeSlotStatus,
  getUpcomingLeaves,
  getMonthlyFullyBookedDates,
  supabase,
} from "@/app/shared/supabaseApi";
import { SpecialClosure, hasHealthAlert } from "@/app/shared/data";
import { HealthChecklistData } from "../HealthChecklistForm";
import {
  SERVICE_DETAILS,
  DEFAULT_SERVICE_DETAIL,
  ServiceDetail,
} from "../data/serviceDetailsData";

interface UsePatientBookingProps {
  setView: (v: View) => void;
  initialService?: number | null;
  initialDoctor?: number | null;
  isFollowUp?: boolean;
  planItemId?: number;
  openTicketId?: number;
  user: PatientUser | null;
  onAddAppt?: (appt: any) => void;
}

export function usePatientBooking({
  setView,
  initialService = null,
  initialDoctor = null,
  isFollowUp = false,
  planItemId,
  openTicketId,
  user,
  onAddAppt,
}: UsePatientBookingProps) {
  const [step, setStep] = useState(isFollowUp ? 1 : 0);
  const [selService, setSelService] = useState<number | null>(initialService);
  const [selDoctor, setSelDoctor] = useState<number | "any" | null>(
    initialDoctor ?? "any"
  );
  const [wantSelectDoctor, setWantSelectDoctor] = useState(false);
  const [matchedDoctor, setMatchedDoctor] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [selDay, setSelDay] = useState<number | null>(null);
  const [selTime, setSelTime] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBoundDoctor, setIsBoundDoctor] = useState(false);

  const [healthData, setHealthData] = useState<HealthChecklistData>({
    emergencyName: user?.emergencyName || "",
    emergencyPhone: user?.emergencyPhone || "",
    emergencyRelationship: user?.emergencyRelationship || "",
    hasAllergy:
      user?.allergies && user.allergies !== "ไม่มี" && user.allergies !== "ไม่มีประวัติ"
        ? true
        : user?.allergies === "ไม่มี"
        ? false
        : null,
    allergiesText:
      user?.allergies && user.allergies !== "ไม่มี" && user.allergies !== "ไม่มีประวัติ"
        ? user.allergies
        : "",
    allergies: [],
    allergyOther: "",
    hasCondition:
      user?.conditions && user.conditions !== "ไม่มี" && user.conditions !== "ไม่มีประวัติ"
        ? true
        : user?.conditions === "ไม่มี"
        ? false
        : null,
    conditionsText:
      user?.conditions && user.conditions !== "ไม่มี" && user.conditions !== "ไม่มีประวัติ"
        ? user.conditions
        : "",
    conditions: [],
    conditionOther: "",
    hasMedications: null,
    medicationNote: "",
    consent: false,
    hasChanges: null,
  });
  const [healthValid, setHealthValid] = useState(false);

  const [closures, setClosures] = useState<SpecialClosure[]>([]);
  const [servicesData, setServicesData] = useState<any[]>([]);
  const [landingDoctors, setLandingDoctors] = useState<any[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([0]);
  const [backendSlots, setBackendSlots] = useState<TimeSlotStatus[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [doctorSchedules, setDoctorSchedules] = useState<any[]>([]);
  const [upcomingLeaves, setUpcomingLeaves] = useState<any[]>([]);
  const [fullyBookedDates, setFullyBookedDates] = useState<Set<string>>(
    new Set()
  );

  // ดึงข้อมูลหลักเริ่มต้น
  useEffect(() => {
    Promise.all([
      getClinicClosures(),
      getLandingServices(),
      getLandingDoctors(),
      getWeeklyOffDays(),
      getDoctorSchedules(),
      getUpcomingLeaves(),
    ]).then(([cData, sData, ldData, offData, dsData, leavesData]) => {
      setClosures(cData);
      setServicesData(sData);
      setLandingDoctors(ldData);
      setWeeklyOffDays(offData);
      setDoctorSchedules(dsData);
      setUpcomingLeaves(leavesData);
    });
  }, []);

  // ผูกบริการและแพทย์เมื่อมี openTicketId หรือ initialService
  useEffect(() => {
    if (servicesData.length === 0) return;

    if (openTicketId) {
      supabase
        .from("appointment")
        .select("dentist_id, appointment_detail(service_id)")
        .eq("appointment_id", openTicketId)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            const actualServiceId = data.appointment_detail?.[0]?.service_id;
            if (actualServiceId) {
              const idx = servicesData.findIndex(
                (s) => Number(s.serviceId) === Number(actualServiceId)
              );
              if (idx !== -1) setSelService(idx);
            }
            if (data.dentist_id) {
              setSelDoctor(data.dentist_id);
              setWantSelectDoctor(true);
              setIsBoundDoctor(true);
            }
          }
        });
    } else if (initialService !== null && selService === null) {
      const idx = servicesData.findIndex(
        (s) => Number(s.serviceId) === Number(initialService)
      );
      if (idx !== -1) setSelService(idx);
    }
  }, [openTicketId, servicesData, initialService, selService]);

  // ดึงแพทย์ที่ให้บริการที่เลือกได้
  useEffect(() => {
    if (step === 1 && selService !== null && servicesData[selService]) {
      const sid = servicesData[selService].serviceId;
      setLoadingDoctors(true);
      (sid ? getDentistsByService(sid) : Promise.resolve(landingDoctors))
        .then((docs) => {
          setFilteredDoctors(docs);
          setLoadingDoctors(false);
        })
        .catch(() => {
          setFilteredDoctors(landingDoctors);
          setLoadingDoctors(false);
        });
    }
  }, [step, selService, servicesData]);

  // วันและเดือนที่กำลังแสดงผล
  const today = new Date();
  const targetDate = new Date(
    today.getFullYear(),
    today.getMonth() + monthOffset,
    1
  );
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const todayN = today.getDate();
  const isCurrentMonth = monthOffset === 0;

  // ตรวจสอบสถานะของแต่ละวันในปฏิทิน
  const dayStatus = (d: number) => {
    if (isCurrentMonth && d < todayN) return { status: "past" as const };
    if (monthOffset < 0) return { status: "past" as const };
    const dateObj = new Date(year, month, d);
    const dayOfWk = dateObj.getDay();
    if (weeklyOffDays.includes(dayOfWk))
      return { status: "past" as const, reason: "วันหยุดประจำสัปดาห์" };
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      d
    ).padStart(2, "0")}`;
    const closure = closures.find((c) => c.date === dateStr);
    if (closure) return { status: "past" as const, reason: closure.reason };

    // ตรวจสอบตารางเวรของทันตแพทย์
    if (step >= 1 && filteredDoctors.length > 0) {
      let isWorking = false;
      if (selDoctor === "any") {
        isWorking = filteredDoctors.some((fd) => {
          const shift = doctorSchedules.find(
            (s) => s.dentistId === fd.id && s.dayOfWeek === dayOfWk
          );
          if (shift && shift.isOff) return false;
          const isFullLeave = upcomingLeaves.some(
            (l) =>
              l.user_id === fd.userId &&
              l.leave_date === dateStr &&
              l.leave_period === "เต็มวัน"
          );
          if (isFullLeave) return false;
          return true;
        });
      } else {
        const shift = doctorSchedules.find(
          (s) => s.dentistId === selDoctor && s.dayOfWeek === dayOfWk
        );
        const selDocData =
          filteredDoctors.find((fd) => fd.id === selDoctor) ||
          landingDoctors.find((d) => d.id === selDoctor);
        const isFullLeave = selDocData
          ? upcomingLeaves.some(
              (l) =>
                l.user_id === selDocData.userId &&
                l.leave_date === dateStr &&
                l.leave_period === "เต็มวัน"
            )
          : false;

        if (shift && shift.isOff) {
          isWorking = false;
        } else if (isFullLeave) {
          isWorking = false;
        } else {
          isWorking = true;
        }
      }
      if (!isWorking)
        return { status: "past" as const, reason: "แพทย์ไม่เข้าตรวจ/ลา" };
    }

    return { status: "available" as const };
  };

  const estTime =
    selService !== null && servicesData[selService]
      ? servicesData[selService].baseTimeMins
      : 30;
  const totalDuration = estTime;
  const reqSlots = Math.ceil(totalDuration / 30);

  const patientEndTimeStr = selTime
    ? (() => {
        const [h, m] = selTime.split(":").map(Number);
        const tot = h * 60 + m + estTime;
        return `${Math.floor(tot / 60)
          .toString()
          .padStart(2, "0")}:${(tot % 60).toString().padStart(2, "0")}`;
      })()
    : "";

  const endTimeStr = selTime
    ? (() => {
        const [h, m] = selTime.split(":").map(Number);
        const tot = h * 60 + m + totalDuration;
        return `${Math.floor(tot / 60)
          .toString()
          .padStart(2, "0")}:${(tot % 60).toString().padStart(2, "0")}`;
      })()
    : "";

  // ดึงเวลาว่างรายวัน
  useEffect(() => {
    if (!selDay || selService === null || !servicesData[selService]) {
      setBackendSlots([]);
      return;
    }
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      selDay
    ).padStart(2, "0")}`;
    const serviceId = servicesData[selService]?.serviceId;
    const doctorIdParam =
      selDoctor !== "any" && selDoctor !== null
        ? (selDoctor as number)
        : undefined;

    setLoadingSlots(true);
    getClinicTimeSlots(dateStr, serviceId, doctorIdParam, user?.patientId)
      .then((slots) => {
        setBackendSlots(slots);
        const currentReqSlots = Math.ceil(
          (servicesData[selService]?.baseTimeMins || 30) / 30
        );
        let hasAnyCanBook = false;
        for (let i = 0; i < slots.length; i++) {
          let ok = slots[i].status === "available";
          for (let j = 0; j < currentReqSlots; j++) {
            if (i + j >= slots.length) {
              ok = false;
              break;
            }
            if (slots[i + j].status !== "available") {
              ok = false;
              break;
            }
            if (j > 0) {
              const [prevH, prevM] = slots[i + j - 1].time.split(":").map(Number);
              const [curH, curM] = slots[i + j].time.split(":").map(Number);
              if (curH * 60 + curM - (prevH * 60 + prevM) !== 30) {
                ok = false;
                break;
              }
            }
          }
          if (ok) {
            hasAnyCanBook = true;
            break;
          }
        }

        if (!hasAnyCanBook && slots.length > 0) {
          setFullyBookedDates((prev) => new Set(prev).add(dateStr));
        } else {
          setFullyBookedDates((prev) => {
            const next = new Set(prev);
            next.delete(dateStr);
            return next;
          });
        }

        setSelTime((prevTime) => {
          if (!prevTime) return null;
          const timeIndex = slots.findIndex((s) => s.time === prevTime);
          if (timeIndex === -1) return null;
          let ok = true;
          for (let j = 0; j < currentReqSlots; j++) {
            if (timeIndex + j >= slots.length) {
              ok = false;
              break;
            }
            if (slots[timeIndex + j].status !== "available") {
              ok = false;
              break;
            }
            if (j > 0) {
              const [prevH, prevM] = slots[timeIndex + j - 1].time
                .split(":")
                .map(Number);
              const [curH, curM] = slots[timeIndex + j].time
                .split(":")
                .map(Number);
              if (curH * 60 + curM - (prevH * 60 + prevM) !== 30) {
                ok = false;
                break;
              }
            }
          }
          return ok ? prevTime : null;
        });
      })
      .catch(() => setBackendSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selDay, selDoctor, selService, monthOffset, year, month, servicesData]);

  // รีเซ็ตเมื่อเปลี่ยนแพทย์หรือบริการ
  useEffect(() => {
    setFullyBookedDates(new Set());
    if (selDay !== null) {
      if (dayStatus(selDay).status !== "available") {
        setSelDay(null);
        setSelTime(null);
      }
    }
  }, [selDoctor, selService]);

  // ดึงวันที่คิวเต็มทั้งเดือน
  useEffect(() => {
    if (step === 1 && servicesData.length > 0) {
      const serviceId =
        selService !== null ? servicesData[selService]?.serviceId : undefined;
      const doctorId =
        selDoctor !== "any" && selDoctor !== null
          ? (selDoctor as number)
          : undefined;
      const estMins =
        selService !== null && servicesData[selService]
          ? servicesData[selService]?.baseTimeMins || 30
          : 30;

      setFullyBookedDates(new Set());
      getMonthlyFullyBookedDates(year, month, serviceId, doctorId, estMins)
        .then((dates) => {
          setFullyBookedDates(new Set(dates));
        })
        .catch(console.error);
    }
  }, [year, month, selService, selDoctor, step, servicesData]);

  // รีเซ็ตเมื่อเปลี่ยนเดือน
  useEffect(() => {
    setSelDay(null);
    setSelTime(null);
  }, [monthOffset]);

  // คำนวณช่วงเวลาที่สามารถจองได้
  const availableTimes = backendSlots.map((slot, i) => {
    let ok = slot.status === "available";
    for (let j = 0; j < reqSlots; j++) {
      if (i + j >= backendSlots.length) {
        ok = false;
        break;
      }
      if (backendSlots[i + j].status !== "available") {
        ok = false;
        break;
      }
      if (j > 0) {
        const [prevH, prevM] = backendSlots[i + j - 1].time
          .split(":")
          .map(Number);
        const [curH, curM] = backendSlots[i + j].time.split(":").map(Number);
        if (curH * 60 + curM - (prevH * 60 + prevM) !== 30) {
          ok = false;
          break;
        }
      }
    }
    return { t: slot.time, status: slot.status, canBook: ok };
  });

  const canNext = () => {
    if (step === 0) return selService !== null;
    if (step === 1) return selDay !== null && selTime !== null;
    if (step === 2) return healthValid;
    return false;
  };

  const handleNext = () => {
    if (!canNext()) return;
    if (step === 0) setStep(1);
    else if (step === 1) setStep(2);
    else if (step === 2) setStep(4);
  };

  const handleBack = () => {
    if (step === 4) setStep(2);
    else if (step === 2) setStep(1);
    else if (step === 1) setStep(0);
  };

  const resetBooking = () => {
    setStep(0);
    setSelService(null);
    setSelDoctor("any");
    setWantSelectDoctor(false);
    setSelDay(null);
    setSelTime(null);
    setDone(false);
    setNotes("");
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;

    if (isFollowUp || planItemId) {
      const confirmMsg = `ยืนยันการจองคิวนัดหมายต่อเนื่อง\nวันที่ ${selDay} เวลา ${selTime} น.?\n\n(กรุณาตรวจสอบว่าวันนัดหมายห่างจากรอบที่แล้วตามที่คุณหมอแนะนำ เพื่อให้การรักษาเป็นไปตามแผนครับ)`;
      if (!window.confirm(confirmMsg)) {
        return;
      }
    }

    if (!selDay || !selTime) {
      alert("กรุณาเลือกวันและเวลานัดหมาย");
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    const serviceTitle = servicesData[selService!]?.title || "";
    let finalDoctorId: number | undefined;
    let finalDoctorName = "ไม่ระบุแพทย์";

    if (selDoctor !== "any" && selDoctor !== null) {
      const doc = landingDoctors.find((d) => d.id === selDoctor);
      if (doc) {
        finalDoctorId = doc.id;
        finalDoctorName = doc.name;
      }
      setMatchedDoctor(selDoctor as number);
    } else {
      finalDoctorId = undefined;
    }

    const isReturning = Boolean(
      user &&
        (hasHealthAlert(user.allergies, user.conditions) ||
          (user.emergencyName && user.emergencyName.trim() !== ""))
    );
    const hasExistingCondition =
      user && hasHealthAlert(user.allergies, user.conditions);
    const newRiskSelected =
      (healthData.hasCondition === true && (Boolean(healthData.conditionsText?.trim()) || (healthData.conditions && healthData.conditions.length > 0))) ||
      (healthData.hasAllergy === true && (Boolean(healthData.allergiesText?.trim()) || (healthData.allergies && healthData.allergies.length > 0)));

    const finalHealthRisk =
      isReturning && healthData.hasChanges === false
        ? hasExistingCondition
        : newRiskSelected;

    const initialStatus = "ยืนยันการจอง";
    setIsPending(Boolean(finalHealthRisk));

    try {
      const finalServiceTitle = serviceTitle;

      const res = await addAppointment({
        patientId: user?.patientId,
        patientName: user
          ? `${user.firstName} ${user.lastName}`
          : "ผู้ป่วยทั่วไป",
        hn: user?.idCard?.slice(-6) || "W-000",
        patientPhone: user?.phone || "080-000-0000",
        service: finalServiceTitle,
        serviceId: servicesData[selService!]?.serviceId,
        doctorName: finalDoctorName,
        doctorId: finalDoctorId,
        date: `${year}-${String(month + 1).padStart(2, "0")}-${selDay
          ?.toString()
          .padStart(2, "0")}`,
        time: selTime || "",
        durationMins: totalDuration,
        status: initialStatus,
        source: "patient",
        cost: 0,
        paid: false,
        treatmentNotes: "",
        treatmentServices: [],
        recommendations: "",
        note: notes,
        emergencyName:
          healthData.hasChanges === false
            ? user?.emergencyName || ""
            : healthData.emergencyName,
        emergencyPhone:
          healthData.hasChanges === false
            ? user?.emergencyPhone || ""
            : healthData.emergencyPhone,
        emergencyRelationship:
          healthData.hasChanges === false
            ? user?.emergencyRelationship || ""
            : healthData.emergencyRelationship,
        allergies:
          healthData.hasChanges === false
            ? user?.allergies || "ไม่มี"
            : healthData.hasAllergy === false
            ? "ไม่มี"
            : healthData.allergiesText?.trim() ||
              [
                ...(healthData.allergies || []).filter((a) => a !== "แพ้อื่นๆ"),
                ...(healthData.allergies?.includes("แพ้อื่นๆ") &&
                healthData.allergyOther
                  ? [`อื่นๆ: ${healthData.allergyOther}`]
                  : []),
              ].join(", ") ||
              "ไม่มี",
        conditions:
          healthData.hasChanges === false
            ? user?.conditions || "ไม่มี"
            : healthData.hasCondition === false
            ? "ไม่มี"
            : healthData.conditionsText?.trim() ||
              [
                ...(healthData.conditions || []).filter((c) => c !== "โรคอื่นๆ"),
                ...(healthData.conditions?.includes("โรคอื่นๆ") &&
                healthData.conditionOther
                  ? [`อื่นๆ: ${healthData.conditionOther}`]
                  : []),
              ].join(", ") ||
              "ไม่มี",
        planItemId: planItemId || undefined,
        id: openTicketId || undefined,
      });

      let finalAssignedDoctorName = finalDoctorName;
      let finalAssignedDoctorId =
        finalDoctorId || (res as any).assignedDoctorId || 0;

      if (finalDoctorName === "ไม่ระบุแพทย์" && (res as any).assignedDoctorId) {
        setMatchedDoctor((res as any).assignedDoctorId);
        const assignedDoc = landingDoctors.find(
          (d) =>
            d.doctorId === (res as any).assignedDoctorId ||
            d.id === (res as any).assignedDoctorId
        );
        if (assignedDoc) {
          finalAssignedDoctorName = assignedDoc.name;
        }
      }

      if (onAddAppt && res) {
        onAddAppt({
          id: (res as any).appointment_id || Date.now(),
          patientId: user?.patientId,
          hn: user?.idCard?.slice(-6) || "W-000",
          patientName: user
            ? `${user.firstName} ${user.lastName}`
            : "ผู้ป่วยทั่วไป",
          patientPhone: user?.phone || "080-000-0000",
          service: finalServiceTitle,
          serviceId: servicesData[selService!]?.serviceId,
          doctorName:
            finalAssignedDoctorName !== "ไม่ระบุแพทย์"
              ? finalAssignedDoctorName
              : "รอระบุแพทย์",
          doctorId: finalAssignedDoctorId,
          date: `${year}-${String(month + 1).padStart(2, "0")}-${selDay
            ?.toString()
            .padStart(2, "0")}`,
          time: selTime || "",
          status: initialStatus,
          endTime: "00:00",
        });
      }

      setDone(true);
    } catch (err: any) {
      alert("Failed to book: " + (err.message || JSON.stringify(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceTitle =
    selService !== null ? servicesData[selService]?.title || "" : "";
  const detail: ServiceDetail =
    SERVICE_DETAILS[serviceTitle] || DEFAULT_SERVICE_DETAIL;

  return {
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
    setDone,
    isPending,
    monthOffset,
    setMonthOffset,
    isSubmitting,
    isBoundDoctor,
    healthData,
    setHealthData,
    healthValid,
    setHealthValid,
    servicesData,
    landingDoctors,
    filteredDoctors,
    loadingDoctors,
    backendSlots,
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
    totalDuration,
    reqSlots,
    patientEndTimeStr,
    endTimeStr,
    availableTimes,
    serviceTitle,
    detail,
    canNext,
    handleNext,
    handleBack,
    handleConfirm,
    resetBooking,
  };
}

