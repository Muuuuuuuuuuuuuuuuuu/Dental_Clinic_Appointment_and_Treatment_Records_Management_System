import { useState, useEffect, useMemo } from "react";
import { Appointment, AppointmentStatus, Product } from "@/app/shared/data";
import {
  getClinicTimeSlots,
  TimeSlotStatus,
  getServices,
  addAppointment,
} from "@/app/shared/supabaseApi";
import { getProducts, processPaymentApi } from "@/app/shared/api/treatmentApi";
import { useRealtimeAppointments } from "@/app/shared/useRealtimeAppointments";

export interface ExtraProductItem {
  product: Product;
  qty: number;
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
  const [servicesList, setServicesList] = useState<{ id: number; name: string }[]>([
    { id: 1, name: "ปรึกษาจัดฟันแบบโลหะ (Metal Braces)" },
    { id: 2, name: "ตรวจสุขภาพช่องปาก" },
    { id: 3, name: "เคลือบฟลูออไรด์" },
    { id: 4, name: "ถ่ายภาพรังสีฟัน (X-Ray)" },
    { id: 5, name: "ผ่าฟันคุด" },
    { id: 6, name: "รักษารากฟัน" },
    { id: 7, name: "ขูดหินปูนและขัดฟัน" },
    { id: 8, name: "อุดฟันสีเหมือนฟัน" },
    { id: 9, name: "ถอนฟัน" },
    { id: 9999, name: "ตัดไหม" },
  ]);
  const [adjustedPrices, setAdjustedPrices] = useState<Record<string, string>>({});
  const [adjustedQuantities, setAdjustedQuantities] = useState<Record<string, number>>({});



  // สถานะการเปิด-ปิดหน้าต่างป๊อปอัป
  const [receiptData, setReceiptData] = useState<any | null>(null);
  const [followUp, setFollowUp] = useState<Appointment | null>(null);
  const [isBound, setIsBound] = useState(true);

  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlotStatus[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [extraProducts, setExtraProducts] = useState<ExtraProductItem[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showProductSelect, setShowProductSelect] = useState(false);

  useEffect(() => {
    getProducts().then((prods) => {
      const cleanProds = (prods || []).map((p: Product) => ({
        ...p,
        name: p.name.replace(/\s*\([A-Za-z\s]+\)/g, "").trim(),
      }));
      setAllProducts(cleanProds);
    });
    getServices().then((data) => {
      const map: Record<number, any> = {};
      const list: { id: number; name: string }[] = [];
      data.forEach((s: any) => {
        const sId = s.service_id || s.id;
        map[sId] = s;
        list.push({ id: sId, name: s.name || s.service_name });
      });
      if (!list.some((s) => s.name === "ตัดไหม")) {
        list.push({ id: 9999, name: "ตัดไหม" });
      }
      setServicesData(map);
      if (list.length > 0) {
        setServicesList(list);
      }
    });
  }, []);

  useEffect(() => {
    if (!followUp || !followUpDate) {
      setTimeSlots([]);
      return;
    }
    setIsLoadingSlots(true);
    getClinicTimeSlots(
      followUpDate,
      followUp.serviceId || 1,
      isBound ? followUp.doctorId : undefined,
      followUp.patientId
    )
      .then((slots) => {
        setTimeSlots(slots);
      })
      .finally(() => {
        setIsLoadingSlots(false);
      });
  }, [followUpDate, followUp, isBound]);

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

    // คำนวณวันล่วงหน้า 7 วันเป็นค่าเริ่มต้นสำหรับนัดตัดไหม/นัดติดตามผล
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const defaultDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    setFollowUp({
      ...receipt,
      service: isSurgical ? "ตัดไหม" : receipt.service,
      serviceId: isSurgical && sutureMatch ? sutureMatch.id : receipt.serviceId,
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
        doctorName: isBound ? followUp.doctorName : "",
        doctorId: isBound ? followUp.doctorId : undefined,
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
  };
}

