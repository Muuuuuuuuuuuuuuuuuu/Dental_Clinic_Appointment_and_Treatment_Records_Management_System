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
  onUpdateAppt?: (id: number, updates: Partial<Appointment>) => void
) {
  const { appointments, refetch: fetchAppointments, setAppointments } = useRealtimeAppointments();
  const [loading] = useState(!initialAppointments);

  // คนไข้ที่เลือกเพื่อรับชำระเงิน
  const [selectedApptId, setSelectedApptId] = useState<number | null>(null);

  // สถานะหน้าจอรับชำระเงิน
  const [baseCost] = useState<string>("");
  const [discount, setDiscount] = useState<string>("0");
  const [paymentMethod, setPaymentMethod] = useState<string>("เงินสด");

  // สถานะการคำนวณราคาและส่วนลด
  const [servicesData, setServicesData] = useState<Record<number, any>>({});
  const [adjustedPrices, setAdjustedPrices] = useState<Record<string, string>>({});
  const [adjustedQuantities, setAdjustedQuantities] = useState<Record<string, number>>({});



  // สถานะการเปิด-ปิดหน้าต่างป๊อปอัป
  const [receiptData, setReceiptData] = useState<any | null>(null);
  const [followUp, setFollowUp] = useState<Appointment | null>(null);
  const [isOpenTicket, setIsOpenTicket] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [openTicketId, setOpenTicketId] = useState<number | null>(null);
  const [isBound, setIsBound] = useState(false);

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
      data.forEach((s: any) => {
        map[s.service_id || s.id] = s;
      });
      setServicesData(map);
    });
  }, []);

  useEffect(() => {
    if (!followUp || isOpenTicket || !followUpDate) {
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
  }, [followUpDate, isOpenTicket, followUp, isBound]);

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
  }, [selectedApptId]);

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

  const handleCreateFollowUp = async () => {
    if (!followUp) return;
    if (!isOpenTicket && (!followUpDate || !followUpTime)) {
      alert("กรุณาระบุวันและเวลา หรือเลือกใบนัดแบบเปิด");
      return;
    }
    setIsSubmitting(true);
    try {
      const newAppt: any = await addAppointment({
        patientId: followUp.patientId,
        hn: followUp.hn || "",
        patientName: followUp.patientName,
        patientPhone: followUp.patientPhone || "",
        service: followUp.service,
        serviceId: followUp.serviceId || 1,
        doctorName: isBound ? followUp.doctorName : "",
        doctorId: isBound ? followUp.doctorId : undefined,
        date: isOpenTicket ? "" : followUpDate,
        time: isOpenTicket ? "" : followUpTime,
        status: "ยืนยันการจอง",
        source: "doctor",
        note: isBound ? `แพทย์ประจำเคส: ${followUp.doctorName}` : "",
      } as any);

      if (newAppt && (newAppt.appointment_id || newAppt.id)) {
        setOpenTicketId(newAppt.appointment_id || newAppt.id);
      }

      if (isOpenTicket) {
        setShowLink(true);
      } else {
        setFollowUp(null);
        alert("สร้างนัดหมายครั้งถัดไปสำเร็จ");
      }
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
    isOpenTicket,
    setIsOpenTicket,
    showLink,
    setShowLink,
    openTicketId,
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
  };
}

