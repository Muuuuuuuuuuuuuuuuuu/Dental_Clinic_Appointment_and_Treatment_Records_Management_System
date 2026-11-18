import { useState, useEffect } from "react";
import { Appointment, DentistInfo, ServiceInfo } from "@/app/shared/data";
import {
  getDentists,
  getServices,
  addAppointment,
  getClinicTimeSlots,
  getClinicClosures,
  getWeeklyOffDays,
  getDoctorSchedules,
  getUpcomingLeaves,
  getPatients,
  getMonthlyFullyBookedDates,
  supabase,
} from "@/app/shared/supabaseApi";

export interface BookingForm {
  service: string;
  doctorId: number;
  date: string;
  time: string;
  note: string;
  openAppt: boolean;
}

export function useWalkInBooking(onAddAppt?: (appt: Appointment) => void) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<BookingForm>({
    service: "",
    doctorId: 0,
    date: "",
    time: "",
    note: "",
    openAppt: false,
  });
  const [patientResults, setPatientResults] = useState<any[]>([]);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchError, setSearchError] = useState("");
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dentists, setDentists] = useState<DentistInfo[]>([]);
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [closures, setClosures] = useState<any[]>([]);
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([0]);
  const [doctorSchedules, setDoctorSchedules] = useState<any[]>([]);
  const [upcomingLeaves, setUpcomingLeaves] = useState<any[]>([]);
  const [allPatients, setAllPatients] = useState<any[]>([]);

  const [monthOffset, setMonthOffset] = useState(0);
  const [timeSlots, setTimeSlots] = useState<
    { time: string; status: string; canBook: boolean }[]
  >([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [fullyBookedDates, setFullyBookedDates] = useState<Set<string>>(new Set());
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const loadMasterData = () => {
      Promise.all([
        getDentists(),
        getServices(),
        getClinicClosures(),
        getWeeklyOffDays(),
        getDoctorSchedules(),
        getUpcomingLeaves(),
        getPatients(),
      ])
        .then(([d, s, cData, offData, dsData, leavesData, patData]) => {
          setDentists(d.filter((x) => x.active));
          setServices(s.filter((x) => x.active));
          setClosures(cData);
          setWeeklyOffDays(offData);
          setDoctorSchedules(dsData);
          setUpcomingLeaves(leavesData);
          setAllPatients(patData);
        })
        .catch(console.error);
    };

    loadMasterData();

    const triggerRefresh = () => setRefreshTick((t) => t + 1);
    window.addEventListener("appointments-updated", triggerRefresh);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "icemu-sync-update") triggerRefresh();
    };
    window.addEventListener("storage", handleStorage);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        bc = new BroadcastChannel("icemu-updates");
        bc.onmessage = () => triggerRefresh();
      } catch (e) {}
    }

    const channelName = `rt-walkin-slots-${Math.random().toString(36).slice(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", table: "appointment" }, triggerRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "schedule" }, () => {
        loadMasterData();
        triggerRefresh();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "leave_record" }, () => {
        loadMasterData();
        triggerRefresh();
      })
      .subscribe();

    return () => {
      window.removeEventListener("appointments-updated", triggerRefresh);
      window.removeEventListener("storage", handleStorage);
      if (bc) {
        try {
          bc.close();
        } catch (e) {}
      }
      supabase.removeChannel(channel);
    };
  }, []);

  const selectedServiceObj = services.find((s) => s.name === form.service);
  const selectedServiceId = selectedServiceObj?.id;
  const estMins = selectedServiceObj?.estimatedTime || 30;
  const reqSlots = Math.ceil(estMins / 30);

  const matchedDentists = selectedServiceId
    ? dentists.filter((d) => d.serviceIds?.includes(selectedServiceId))
    : dentists;
  // ถ้าบริการนี้ยังไม่ได้ผูกกับหมอคนใด ให้แสดงหมอทั้งหมด
  const filteredDentists = matchedDentists.length > 0 ? matchedDentists : dentists;

  const today = new Date();
  const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const todayN = today.getDate();
  const isCurrentMonth = monthOffset === 0;

  // ดึงวันที่คิวเต็มทั้งเดือนเพื่อให้ปฏิทินแสดงตรงกับหน้าคนไข้
  useEffect(() => {
    if (step !== 1 || form.openAppt) return;
    getMonthlyFullyBookedDates(
      year,
      month,
      selectedServiceId,
      form.doctorId > 0 ? form.doctorId : undefined,
      estMins
    )
      .then((dates) => {
        setFullyBookedDates(new Set(dates));
      })
      .catch(console.error);
  }, [step, year, month, selectedServiceId, form.doctorId, form.openAppt, estMins, refreshTick]);

  // ดึงช่วงเวลาว่างรายวัน และตรวจสอบความต่อเนื่องของ Slot
  useEffect(() => {
    if (step === 1 && form.date && !form.openAppt) {
      setLoadingSlots(true);
      getClinicTimeSlots(
        form.date,
        selectedServiceId,
        form.doctorId > 0 ? form.doctorId : undefined,
        patientInfo?.id
      )
        .then((slots) => {
          let hasAnyCanBook = false;
          const processed = slots.map((slot, i) => {
            if (slot.status !== "available") return { ...slot, canBook: false };
            let canBook = true;
            for (let j = 0; j < reqSlots; j++) {
              if (i + j >= slots.length || slots[i + j].status !== "available") {
                canBook = false;
                break;
              }
              if (j > 0) {
                const [prevH, prevM] = slots[i + j - 1].time.split(":").map(Number);
                const [curH, curM] = slots[i + j].time.split(":").map(Number);
                if (curH * 60 + curM - (prevH * 60 + prevM) !== 30) {
                  canBook = false;
                  break;
                }
              }
            }
            if (canBook) hasAnyCanBook = true;
            return { ...slot, canBook };
          });

          setTimeSlots(processed);

          if (!hasAnyCanBook && slots.length > 0) {
            setFullyBookedDates((prev) => new Set(prev).add(form.date));
          } else {
            setFullyBookedDates((prev) => {
              const next = new Set(prev);
              next.delete(form.date);
              return next;
            });
          }

          // หากเวลาที่เลือกค้างไว้ไม่ว่างแล้ว ให้ล้างค่าเวลาออกทันที
          setForm((prev) => {
            if (!prev.time) return prev;
            const found = processed.find((s) => s.time === prev.time);
            if (!found || !found.canBook) {
              return { ...prev, time: "" };
            }
            return prev;
          });
        })
        .catch(console.error)
        .finally(() => setLoadingSlots(false));
    } else {
      setTimeSlots([]);
    }
  }, [step, form.date, form.doctorId, form.openAppt, selectedServiceId, reqSlots, patientInfo?.id, refreshTick]);

  const handleServiceChange = (serviceName: string) => {
    setForm((f) => {
      const newForm = { ...f, service: serviceName, time: "" };
      const sId = services.find((s) => s.name === serviceName)?.id;
      if (sId && f.doctorId) {
        const hasMappedDoctor = dentists.some((d) => d.serviceIds?.includes(sId));
        const doc = dentists.find((d) => d.id === f.doctorId);
        if (hasMappedDoctor && doc && !doc.serviceIds?.includes(sId)) {
          newForm.doctorId = 0;
        }
      }
      return newForm;
    });
  };

  const dayStatus = (d: number) => {
    if (isCurrentMonth && d < todayN) return { status: "past" as const };
    if (monthOffset < 0) return { status: "past" as const };
    const dateObj = new Date(year, month, d);
    const dayOfWk = dateObj.getDay();
    if (weeklyOffDays.includes(dayOfWk))
      return { status: "past" as const, reason: "วันหยุดประจำสัปดาห์" };
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const closure = closures.find((c) => c.date === dateStr);
    if (closure) return { status: "past" as const, reason: closure.reason };

    if (form.doctorId > 0) {
      const selDocData = dentists.find((fd) => fd.id === form.doctorId);
      const shift = doctorSchedules.find(
        (s) => Number(s.dentistId) === Number(form.doctorId) && Number(s.dayOfWeek) === dayOfWk
      );
      const isFullLeave = selDocData
        ? upcomingLeaves.some((l) => {
            if (l.leave_date !== dateStr || l.leave_period !== "เต็มวัน") return false;
            const matchUser = Boolean(l.user_id && selDocData.userId && l.user_id === selDocData.userId);
            const matchStaff = Boolean(l.staff_id && selDocData.staffId && Number(l.staff_id) === Number(selDocData.staffId));
            return matchUser || matchStaff;
          })
        : false;

      if (shift && shift.isOff) {
        return { status: "past" as const, reason: "แพทย์ไม่เข้าตรวจ/ลา" };
      } else if (isFullLeave) {
        return { status: "past" as const, reason: "แพทย์ไม่เข้าตรวจ/ลา" };
      }
    } else if (form.service && filteredDentists.length > 0) {
      const isAnyWorking = filteredDentists.some((fd) => {
        const shift = doctorSchedules.find(
          (s) => Number(s.dentistId) === Number(fd.id) && Number(s.dayOfWeek) === dayOfWk
        );
        if (shift && shift.isOff) return false;
        const isFullLeave = upcomingLeaves.some((l) => {
          if (l.leave_date !== dateStr || l.leave_period !== "เต็มวัน") return false;
          const matchUser = Boolean(l.user_id && fd.userId && l.user_id === fd.userId);
          const matchStaff = Boolean(l.staff_id && fd.staffId && Number(l.staff_id) === Number(fd.staffId));
          return matchUser || matchStaff;
        });
        if (isFullLeave) return false;
        return true;
      });
      if (!isAnyWorking) {
        return { status: "past" as const, reason: "แพทย์ไม่เข้าตรวจ/ลา" };
      }
    }
    return { status: "available" as const };
  };

  // หากเปลี่ยนหมอหรือบริการแล้ววันที่เลือกไว้กลายเป็นวันหยุดหมอ ให้ล้างวันที่ออก
  useEffect(() => {
    if (step !== 1 || !form.date) return;
    const parts = form.date.split("-").map(Number);
    if (parts.length === 3 && parts[0] === year && parts[1] - 1 === month) {
      if (dayStatus(parts[2]).status !== "available" || fullyBookedDates.has(form.date)) {
        setForm((prev) => ({ ...prev, date: "", time: "" }));
      }
    }
  }, [form.doctorId, form.service, step, fullyBookedDates]);

  useEffect(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      setPatientResults([]);
      setSearchError("");
      if (patientInfo) setPatientInfo(null);
      return;
    }

    const filtered = allPatients.filter(
      (p) =>
        p.name.toLowerCase().includes(keyword) ||
        p.hn.toLowerCase().includes(keyword) ||
        (p.phone && p.phone.includes(keyword)) ||
        (p.email && p.email.toLowerCase().includes(keyword)) ||
        (p.citizenId && p.citizenId.includes(keyword))
    );

    setPatientResults(filtered);
    if (filtered.length === 0 && !patientInfo) {
      setSearchError(
        "ไม่พบข้อมูลคนไข้ในระบบ กรุณาตรวจสอบอีกครั้ง หรือไปที่เมนูลงทะเบียนคนไข้ใหม่"
      );
    } else {
      setSearchError("");
    }
  }, [searchKeyword, allPatients]);

  const confirm = async () => {
    if (isSubmitting) return;
    const doctorName =
      dentists.find((d) => d.id === form.doctorId)?.name ?? "ท่านใดก็ได้";
    const newAppt: Omit<Appointment, "id"> = {
      hn: patientInfo?.hn || `HN${Date.now().toString().slice(-3)}`,
      patientId: patientInfo?.id,
      patientName: patientInfo?.name || "Unknown",
      patientPhone: patientInfo?.phone || "",
      service: form.service,
      serviceId: selectedServiceId,
      durationMins: estMins,
      doctorName,
      doctorId: form.doctorId > 0 ? form.doctorId : undefined,
      date: form.openAppt ? "" : form.date,
      time: form.openAppt ? "" : form.time,
      status: form.openAppt ? "ยืนยันการจอง" : "เช็คอินเรียบร้อย",
      channel: "Walk-in",
      source: "staff",
      conditions: patientInfo?.underlyingDisease || "ไม่มี",
      allergies: patientInfo?.allergyHistory || "ไม่มี",
      source: "doctor",
      note: form.note,
    };
    setIsSubmitting(true);
    try {
      const added = await addAppointment(newAppt);
      const assignedDocId = Number(added.assignedDoctorId || form.doctorId) || 0;
      const assignedDocName =
        dentists.find((d) => Number(d.id) === assignedDocId)?.name || doctorName;

      if (assignedDocId > 0) {
        setForm((prev) => ({ ...prev, doctorId: assignedDocId }));
      }

      if (onAddAppt) {
        onAddAppt({
          ...newAppt,
          id: Number(added.appointment_id),
          doctorId: assignedDocId,
          doctorName: assignedDocName,
        });
      }
      setDone(true);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "ไม่สามารถบันทึกนัดหมายได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAll = () => {
    setStep(0);
    setForm({
      service: "",
      doctorId: 0,
      date: "",
      time: "",
      note: "",
      openAppt: false,
    });
    setPatientInfo(null);
    setPatientResults([]);
    setSearchKeyword("");
    setDone(false);
  };

  return {
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
    estMins,
    monthOffset,
    setMonthOffset,
    targetDate,
    year,
    month,
    daysInMonth,
    firstDow,
    dayStatus,
    fullyBookedDates,
    timeSlots,
    loadingSlots,
    confirm,
    isSubmitting,
    done,
    resetAll,
  };
}

