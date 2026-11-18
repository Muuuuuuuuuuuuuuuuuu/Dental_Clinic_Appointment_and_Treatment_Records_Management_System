import { useState, useEffect, useMemo } from "react";
import { Appointment, AppointmentStatus, DentistInfo, Product } from "@/app/shared/data";
import {
  getClinicTimeSlots,
  TimeSlotStatus,
  getServices,
  addAppointment,
  getDentists,
  getClinicClosures,
  getWeeklyOffDays,
  getDoctorSchedules,
  getUpcomingLeaves,
  getMonthlyFullyBookedDates,
  supabase,
} from "@/app/shared/supabaseApi";
import { getProducts, processPaymentApi } from "@/app/shared/api/treatmentApi";
import { useRealtimeAppointments } from "@/app/shared/useRealtimeAppointments";

export interface ExtraProductItem {
  product: Product;
  qty: number;
}

export interface FollowUpTimeSlot extends TimeSlotStatus {
  canBook: boolean;
}

export function usePaymentData(
  initialAppointments?: Appointment[],
  onUpdateAppt?: (id: number, updates: Partial<Appointment>) => void,
  initialApptId?: number | null
) {
  const { appointments, refetch: fetchAppointments, setAppointments } = useRealtimeAppointments();
  const [loading] = useState(!initialAppointments);

  // คนไข้ที่เลือกเพื่อรับชำระเงิน
  const [selectedApptId, setSelectedApptId] = useState<number | null>(initialApptId ?? null);

  useEffect(() => {
    if (initialApptId !== undefined) {
      setSelectedApptId(initialApptId);
    }
  }, [initialApptId]);

  // สถานะหน้าจอรับชำระเงิน
  const [baseCost] = useState<string>("");
  const [discount, setDiscount] = useState<string>("0");
  const [paymentMethod, setPaymentMethod] = useState<string>("เงินสด");

  // สถานะการคำนวณราคาและส่วนลด
  const [servicesData, setServicesData] = useState<Record<number, any>>({});
  const [servicesList, setServicesList] = useState<{ id: number; name: string; estimatedTime?: number }[]>([
    { id: 1, name: "ตรวจสุขภาพช่องปาก", estimatedTime: 15 },
    { id: 2, name: "ขูดหินปูนและขัดฟัน", estimatedTime: 30 },
    { id: 3, name: "ถ่ายภาพรังสีฟัน (X-Ray)", estimatedTime: 15 },
    { id: 4, name: "อุดฟันสีเหมือนฟัน", estimatedTime: 30 },
    { id: 5, name: "เคลือบฟลูออไรด์", estimatedTime: 15 },
    { id: 6, name: "ถอนฟัน", estimatedTime: 30 },
    { id: 7, name: "ผ่าฟันคุด", estimatedTime: 60 },
    { id: 8, name: "ปรึกษาจัดฟันแบบโลหะ (Metal Braces)", estimatedTime: 45 },
    { id: 10, name: "รักษารากฟัน", estimatedTime: 60 },
    { id: 9999, name: "ตัดไหม", estimatedTime: 15 },
  ]);
  const [adjustedPrices, setAdjustedPrices] = useState<Record<string, string>>({});
  const [adjustedQuantities, setAdjustedQuantities] = useState<Record<string, number>>({});

  // ข้อมูลตารางเวรและวันหยุดสำหรับปฏิทินนัดครั้งถัดไป
  const [dentists, setDentists] = useState<DentistInfo[]>([]);
  const [closures, setClosures] = useState<any[]>([]);
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([0]);
  const [doctorSchedules, setDoctorSchedules] = useState<any[]>([]);
  const [upcomingLeaves, setUpcomingLeaves] = useState<any[]>([]);
  const [followUpMonthOffset, setFollowUpMonthOffset] = useState(0);
  const [fullyBookedDates, setFullyBookedDates] = useState<Set<string>>(new Set());
  const [refreshTick, setRefreshTick] = useState(0);

  // สถานะการเปิด-ปิดหน้าต่างป๊อปอัป
  const [receiptData, setReceiptData] = useState<any | null>(null);
  const [followUp, setFollowUp] = useState<Appointment | null>(null);
  const [isBound, setIsBound] = useState(true);

  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeSlots, setTimeSlots] = useState<FollowUpTimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [extraProducts, setExtraProducts] = useState<ExtraProductItem[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showProductSelect, setShowProductSelect] = useState(false);

  useEffect(() => {
    const loadMaster = () => {
      getProducts().then((prods) => {
        const cleanProds = (prods || []).map((p: Product) => ({
          ...p,
          name: p.name.replace(/\s*\([A-Za-z\s]+\)/g, "").trim(),
        }));
        setAllProducts(cleanProds);
      });
      getServices().then((data) => {
        const map: Record<number, any> = {};
        const list: { id: number; name: string; estimatedTime?: number }[] = [];
        data.forEach((s: any) => {
          const sId = Number(s.service_id || s.id);
          map[sId] = s;
          list.push({
            id: sId,
            name: s.name || s.service_name,
            estimatedTime: Number(s.estimatedTime || s.estimated_time) || 30,
          });
        });
        if (!list.some((s) => s.name === "ตัดไหม")) {
          list.push({ id: 9999, name: "ตัดไหม", estimatedTime: 15 });
        }
        setServicesData(map);
        if (list.length > 0) {
          setServicesList(list);
        }
      });
      Promise.all([
        getDentists(),
        getClinicClosures(),
        getWeeklyOffDays(),
        getDoctorSchedules(),
        getUpcomingLeaves(),
      ])
        .then(([d, cData, offData, dsData, leavesData]) => {
          setDentists(d.filter((x) => x.active));
          setClosures(cData);
          setWeeklyOffDays(offData);
          setDoctorSchedules(dsData);
          setUpcomingLeaves(leavesData);
        })
        .catch(console.error);
    };

    loadMaster();

    const triggerRefresh = () => setRefreshTick((t) => t + 1);
    window.addEventListener("appointments-updated", triggerRefresh);

    const channelName = `rt-followup-slots-${Math.random().toString(36).slice(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", table: "appointment" }, triggerRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "schedule" }, () => {
        loadMaster();
        triggerRefresh();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "leave_record" }, () => {
        loadMaster();
        triggerRefresh();
      })
      .subscribe();

    return () => {
      window.removeEventListener("appointments-updated", triggerRefresh);
      supabase.removeChannel(channel);
    };
  }, []);

  const followUpEstMins = useMemo(() => {
    if (!followUp) return 30;
    if (followUp.service === "ตัดไหม") return 15;
    const matched = servicesList.find(
      (s) => s.name === followUp.service || (followUp.serviceId && s.id === followUp.serviceId)
    );
    return matched?.estimatedTime || Number(servicesData[followUp.serviceId || 0]?.estimatedTime) || 30;
  }, [followUp, servicesList, servicesData]);

  const followUpReqSlots = Math.ceil(followUpEstMins / 30);

  const resolvedFollowUpDoctorId = useMemo(() => {
    if (!followUp) return 0;
    if (followUp.doctorId && Number(followUp.doctorId) > 0) return Number(followUp.doctorId);
    if (followUp.doctorName) {
      const cleanName = followUp.doctorName.replace(/^(ทพ\.|ทพญ\.|ทญ\.)\s*/, "").trim();
      const matched = dentists.find(
        (d) =>
          d.name === followUp.doctorName ||
          `${d.firstName} ${d.lastName}`.trim() === cleanName ||
          d.name.includes(cleanName)
      );
      if (matched) return Number(matched.id);
    }
    return 0;
  }, [followUp, dentists]);

  const today = new Date();
  const followUpTargetDate = new Date(
    today.getFullYear(),
    today.getMonth() + followUpMonthOffset,
    1
  );
  const followUpYear = followUpTargetDate.getFullYear();
  const followUpMonth = followUpTargetDate.getMonth();
  const followUpDaysInMonth = new Date(followUpYear, followUpMonth + 1, 0).getDate();
  const followUpFirstDow = new Date(followUpYear, followUpMonth, 1).getDay();
  const todayN = today.getDate();
  const isCurrentMonth = followUpMonthOffset === 0;

  const followUpDayStatus = (d: number) => {
    if (isCurrentMonth && d < todayN) return { status: "past" as const };
    if (followUpMonthOffset < 0) return { status: "past" as const };
    const dateObj = new Date(followUpYear, followUpMonth, d);
    const dayOfWk = dateObj.getDay();
    if (weeklyOffDays.includes(dayOfWk))
      return { status: "past" as const, reason: "วันหยุดประจำสัปดาห์" };
    const dateStr = `${followUpYear}-${String(followUpMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const closure = closures.find((c) => c.date === dateStr);
    if (closure) return { status: "past" as const, reason: closure.reason };

    const activeDocId = isBound ? resolvedFollowUpDoctorId : 0;
    if (activeDocId > 0) {
      const selDocData = dentists.find((fd) => Number(fd.id) === activeDocId);
      const shift = doctorSchedules.find(
        (s) => Number(s.dentistId) === activeDocId && Number(s.dayOfWeek) === dayOfWk
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
    } else if (followUp && dentists.length > 0) {
      const sId = followUp.serviceId && followUp.serviceId !== 9999 ? Number(followUp.serviceId) : 0;
      const matchedDocs = sId
        ? dentists.filter((fd) => fd.serviceIds?.includes(sId))
        : dentists;
      const docsToCheck = matchedDocs.length > 0 ? matchedDocs : dentists;
      const isAnyWorking = docsToCheck.some((fd) => {
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

  // ดึงวันที่คิวเต็มทั้งเดือนสำหรับหน้าต่างนัดครั้งถัดไป
  useEffect(() => {
    if (!followUp) return;
    const activeDocId = isBound && resolvedFollowUpDoctorId > 0 ? resolvedFollowUpDoctorId : undefined;
    getMonthlyFullyBookedDates(
      followUpYear,
      followUpMonth,
      followUp.serviceId || 1,
      activeDocId,
      followUpEstMins
    )
      .then((dates) => {
        setFullyBookedDates(new Set(dates));
      })
      .catch(console.error);
  }, [followUp, followUpYear, followUpMonth, isBound, resolvedFollowUpDoctorId, followUpEstMins, refreshTick]);

  // ดึงเวลาว่างรายวันสำหรับหน้าต่างนัดครั้งถัดไป
  useEffect(() => {
    if (!followUp || !followUpDate) {
      setTimeSlots([]);
      return;
    }
    setIsLoadingSlots(true);
    const activeDocId = isBound && resolvedFollowUpDoctorId > 0 ? resolvedFollowUpDoctorId : undefined;
    getClinicTimeSlots(
      followUpDate,
      followUp.serviceId || 1,
      activeDocId,
      followUp.patientId
    )
      .then((slots) => {
        let hasAnyCanBook = false;
        const processed: FollowUpTimeSlot[] = slots.map((slot, i) => {
          if (slot.status !== "available") return { ...slot, canBook: false };
          let canBook = true;
          for (let j = 0; j < followUpReqSlots; j++) {
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
          setFullyBookedDates((prev) => new Set(prev).add(followUpDate));
        } else {
          setFullyBookedDates((prev) => {
            const next = new Set(prev);
            next.delete(followUpDate);
            return next;
          });
        }

        // หากเวลาที่เลือกค้างไว้ไม่ว่างแล้ว ให้ล้างออกทันที
        setFollowUpTime((prevTime) => {
          if (!prevTime) return "";
          const found = processed.find((s) => s.time === prevTime);
          return found && found.canBook ? prevTime : "";
        });
      })
      .finally(() => {
        setIsLoadingSlots(false);
      });
  }, [followUpDate, followUp, isBound, resolvedFollowUpDoctorId, followUpReqSlots, refreshTick]);

  // หากวันนัดที่เลือกกลายเป็นวันหยุดหมอเมื่อสลับ isBound หรือเปลี่ยนบริการ ให้ล้างเวลา/วันที่
  useEffect(() => {
    if (!followUp || !followUpDate) return;
    const parts = followUpDate.split("-").map(Number);
    if (parts.length === 3 && parts[0] === followUpYear && parts[1] - 1 === followUpMonth) {
      if (followUpDayStatus(parts[2]).status !== "available" || fullyBookedDates.has(followUpDate)) {
        setFollowUpTime("");
      }
    }
  }, [isBound, followUp?.serviceId, fullyBookedDates]);

  useEffect(() => {
    if (initialAppointments) {
      setAppointments(initialAppointments);
    } else {
      fetchAppointments();
    }
  }, [initialAppointments, fetchAppointments, setAppointments]);

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  }, []);

  // Payable: Any appointment with status "รอชำระเงิน"
  const payable = appointments.filter((a) => a.status === "รอชำระเงิน");

  // Paid today: Appointments with status "เสร็จสิ้น" AND date is today
  const paid = appointments.filter((a) => a.status === "เสร็จสิ้น" && a.date === todayStr);

  const selectedAppt = appointments.find((a) => a.id === selectedApptId);

  // รีเซ็ตข้อมูลหน้าจอเมื่อเลือกคนไข้รายใหม่
  useEffect(() => {
    if (!selectedAppt) return;
    setDiscount("0");
    setPaymentMethod("เงินสด");
    const initialPrices: Record<string, string> = {};
    const initialQuantities: Record<string, number> = {};
    if (selectedAppt.detailedServices) {
      selectedAppt.detailedServices.forEach((s: any, idx: number) => {
        const key = `${s.serviceId}-${idx}`;
        initialPrices[key] = String(s.price);
        initialQuantities[key] = s.qty;
      });
    }
    setAdjustedPrices(initialPrices);
    setAdjustedQuantities(initialQuantities);
    setExtraProducts([]);
    setShowProductSelect(false);
  }, [selectedApptId, selectedAppt?.id]);

  const totalBaseCost = useMemo(() => {
    let srvTotal = parseInt(baseCost || "0", 10);
    if (selectedAppt && selectedAppt.detailedServices) {
      srvTotal = selectedAppt.detailedServices.reduce((sum: number, s: any, idx: number) => {
        const key = `${s.serviceId}-${idx}`;
        const priceStr = adjustedPrices[key];
        const price = priceStr !== undefined ? parseInt(priceStr, 10) || 0 : s.price;
        const qty = adjustedQuantities[key] !== undefined ? adjustedQuantities[key] : s.qty;
        return sum + price * qty;
      }, 0);
    }
    const extraTotal = extraProducts.reduce((sum, item) => sum + item.product.price * item.qty, 0);
    return srvTotal + extraTotal;
  }, [selectedAppt, adjustedPrices, adjustedQuantities, baseCost, extraProducts]);

  const netTotal = useMemo(() => {
    const disc = parseInt(discount || "0", 10);
    return Math.max(0, totalBaseCost - disc);
  }, [totalBaseCost, discount]);

  const handleQtyChange = (key: string, newQty: number) => {
    if (newQty < 1) return;
    setAdjustedQuantities((prev) => ({ ...prev, [key]: newQty }));
  };

  const handlePriceChange = (key: string, value: string) => {
    setAdjustedPrices((prev) => ({ ...prev, [key]: value }));
  };

  const prepareReceipt = () => {
    if (!selectedAppt) return;

    const finalDetailedServices =
      selectedAppt.detailedServices?.map((s: any, idx: number) => {
        const key = `${s.serviceId}-${idx}`;
        return {
          ...s,
          price: adjustedPrices[key] !== undefined ? parseInt(adjustedPrices[key], 10) || 0 : s.price,
          qty: adjustedQuantities[key] !== undefined ? adjustedQuantities[key] : s.qty,
        };
      }) || [];

    setReceiptData({
      ...selectedAppt,
      detailedServices: finalDetailedServices,
      baseCost: totalBaseCost,
      discount: parseInt(discount || "0", 10),
      netTotal,
      paymentMethod,
      extraProducts: extraProducts.map((ep) => ({
        id: ep.product.id,
        name: ep.product.name,
        price: ep.product.price,
        qty: ep.qty,
      })),
    });
  };

  const confirmAndCompletePayment = async () => {
    if (!receiptData) return;

    try {
      await processPaymentApi(
        receiptData.id,
        receiptData.netTotal,
        receiptData.paymentMethod,
        receiptData.extraProducts,
        receiptData.detailedServices
      );

      const newApptData = {
        status: "เสร็จสิ้น" as AppointmentStatus,
        cost: receiptData.netTotal,
        paid: true,
      };
      setAppointments((apps) =>
        apps.map((a) => (a.id === receiptData.id ? { ...a, ...newApptData } : a))
      );

      if (onUpdateAppt) {
        onUpdateAppt(receiptData.id, newApptData);
      }

      setReceiptData(null);
      setSelectedApptId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to process payment");
    }
  };

  const openFollowUpModal = (receipt: any) => {
    if (!receipt) return;
    const isSurgical =
      receipt.service?.includes("ผ่า") ||
      receipt.service?.includes("ถอน") ||
      receipt.service?.includes("ศัลยกรรม");
    const sutureMatch = servicesList.find((s) => s.name === "ตัดไหม");
    const targetServiceName = isSurgical ? "ตัดไหม" : receipt.service;
    const matchedSvc = servicesList.find((s) => s.name === targetServiceName);
    const resolvedServiceId = isSurgical && sutureMatch
      ? sutureMatch.id
      : matchedSvc?.id || Number(receipt.serviceId) || 1;

    // หาวันเริ่มต้น (ล่วงหน้า 7 วัน) ที่ไม่ใช่วันหยุดคลินิกหรือวันหยุดแพทย์
    const now = new Date();
    const candidate = new Date(now);
    candidate.setDate(candidate.getDate() + 7);
    for (let step = 0; step < 14; step++) {
      const dow = candidate.getDay();
      const candStr = `${candidate.getFullYear()}-${String(candidate.getMonth() + 1).padStart(2, "0")}-${String(candidate.getDate()).padStart(2, "0")}`;
      const isOffClinic = weeklyOffDays.includes(dow) || closures.some((c) => c.date === candStr);
      if (!isOffClinic) break;
      candidate.setDate(candidate.getDate() + 1);
    }

    const defaultDate = `${candidate.getFullYear()}-${String(candidate.getMonth() + 1).padStart(2, "0")}-${String(candidate.getDate()).padStart(2, "0")}`;
    const mOffset =
      (candidate.getFullYear() - now.getFullYear()) * 12 +
      (candidate.getMonth() - now.getMonth());

    setFollowUpMonthOffset(mOffset);
    setFollowUp({
      ...receipt,
      service: targetServiceName,
      serviceId: resolvedServiceId,
    });
    setFollowUpDate(defaultDate);
    setFollowUpTime("");
    setIsBound(true);
  };

  const handleFollowUpServiceChange = (serviceName: string, serviceId?: number) => {
    setFollowUp((prev) => {
      if (!prev) return null;
      let sId = serviceId;
      if (!sId) {
        const found = servicesList.find((s) => s.name === serviceName);
        sId = found?.id || 1;
      }
      return {
        ...prev,
        service: serviceName,
        serviceId: sId,
      };
    });
    setFollowUpTime("");
  };

  const handleCreateFollowUp = async () => {
    if (!followUp) return;
    if (!followUpDate || !followUpTime) {
      alert("กรุณาระบุวันและเวลาที่ต้องการนัดหมาย");
      return;
    }
    setIsSubmitting(true);
    try {
      let noteText = "";
      if (isBound && followUp.doctorName) {
        noteText = `แพทย์ประจำเคส: ${followUp.doctorName}`;
      }
      if (followUp.service === "ตัดไหม") {
        noteText = noteText ? `${noteText} (นัดตัดไหม)` : "นัดตัดไหม";
      }

      await addAppointment({
        patientId: followUp.patientId,
        hn: followUp.hn || "",
        patientName: followUp.patientName,
        patientPhone: followUp.patientPhone || "",
        service: followUp.service,
        serviceId: followUp.serviceId || 1,
        durationMins: followUpEstMins,
        doctorName: isBound ? followUp.doctorName : "",
        doctorId: isBound && resolvedFollowUpDoctorId > 0 ? resolvedFollowUpDoctorId : undefined,
        date: followUpDate,
        time: followUpTime,
        status: "ยืนยันการจอง",
        source: "doctor",
        note: noteText,
      } as any);

      setFollowUp(null);
      setFollowUpDate("");
      setFollowUpTime("");
      alert("สร้างนัดหมายครั้งถัดไปสำเร็จ");
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการสร้างนัดหมาย");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    appointments,
    loading,
    payable,
    paid,
    selectedApptId,
    setSelectedApptId,
    selectedAppt,
    discount,
    setDiscount,
    paymentMethod,
    setPaymentMethod,
    servicesData,
    adjustedPrices,
    adjustedQuantities,
    extraProducts,
    setExtraProducts,
    allProducts,
    showProductSelect,
    setShowProductSelect,
    totalBaseCost,
    netTotal,
    handleQtyChange,
    handlePriceChange,
    prepareReceipt,
    receiptData,
    setReceiptData,
    confirmAndCompletePayment,
    followUp,
    setFollowUp,
    openFollowUpModal,
    isBound,
    setIsBound,
    followUpDate,
    setFollowUpDate,
    followUpTime,
    setFollowUpTime,
    isSubmitting,
    timeSlots,
    isLoadingSlots,
    handleCreateFollowUp,
    servicesList,
    handleFollowUpServiceChange,
    followUpMonthOffset,
    setFollowUpMonthOffset,
    followUpTargetDate,
    followUpYear,
    followUpMonth,
    followUpDaysInMonth,
    followUpFirstDow,
    followUpDayStatus,
    fullyBookedDates,
  };
}

