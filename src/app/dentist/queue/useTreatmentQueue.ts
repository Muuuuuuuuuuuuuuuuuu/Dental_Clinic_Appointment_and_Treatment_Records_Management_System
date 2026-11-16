import React, { useState, useEffect } from "react";
import { Appointment, ServiceInfo, DentistInfo } from "@/app/shared/data";
import { getAppointments, getServices, updateAppointmentStatus, updateAppointmentDetails } from "@/app/shared/supabaseApi";
import { saveTreatment, getPatientLatestOdontogram, getProducts, getPatientTreatmentRecords } from "@/app/shared/api/treatmentApi";
import { ToothStatus } from "./odontogram/Odontogram";
import { isValidToothId } from "./odontogram/toothHistory";
import { SupernumeraryTooth } from "./odontogram/ToothGeometry";
import { TreatmentFormState, PrescribedMed, TimeFilter } from "./types";

export const COMMON_MEDS: PrescribedMed[] = [
  { name: "ยาแก้ปวด (Ibuprofen 400mg)", dose: "400mg", freq: "ทุก 6 ชั่วโมงเมื่อปวด", days: "3" },
  { name: "ยาแก้ปวด (Paracetamol 500mg)", dose: "500mg", freq: "ทุก 4-6 ชั่วโมงเมื่อปวด", days: "3" },
  { name: "ยาปฏิชีวนะ (Amoxicillin 500mg)", dose: "500mg", freq: "วันละ 3 ครั้ง หลังอาหาร", days: "5" },
  { name: "ยาลดบวม (Dexamethasone 0.5mg)", dose: "0.5mg", freq: "วันละ 1 ครั้ง หลังอาหาร", days: "3" },
  { name: "ยาบ้วยปาก (Chlorhexidine 0.2%)", dose: "บ้วนปาก", freq: "วันละ 2-3 ครั้ง หลังอาหาร", days: "7" },
  { name: "ยาฟลูอไรด์ทา", dose: "ทาบางๆ", freq: "หลังแปรงฟันและก่อนนอน", days: "30" },
];

/** ดึงวันที่ "ปัจจุบัน" โดยรองรับ Time Travel mock datetime จาก localStorage */
export function getNow(): Date {
  const mockDatetime = localStorage.getItem("supat_mock_date");
  if (mockDatetime) {
    const parsed = new Date(mockDatetime);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

export function useTreatmentQueue(doctor: DentistInfo | null, initialAppointments?: Appointment[]) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments || []);
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [recording, setRecording] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<TreatmentFormState>({
    notes: "",
    recommendations: "",
    services: [],
    medicines: [],
    actualCost: ""
  });
  const [toothData, setToothData] = useState<Record<number | string, ToothStatus>>({});
  const [extraTeeth, setExtraTeeth] = useState<SupernumeraryTooth[]>([]);
  const [isChild, setIsChild] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("today");
  const [selectedToothForAction, setSelectedToothForAction] = useState<number | string | null>(null);
  const [showMedModal, setShowMedModal] = useState<number | null>(null);
  const [patientHistoryRecords, setPatientHistoryRecords] = useState<any[]>([]);
  const [medList, setMedList] = useState<PrescribedMed[]>([]);

  useEffect(() => {
    if (initialAppointments) {
      setAppointments(initialAppointments);
    }
  }, [initialAppointments]);

  useEffect(() => {
    const fetchData = () => {
      if (!initialAppointments) {
        getAppointments().then(apps => setAppointments(apps)).catch(console.error);
      }
      Promise.all([
        getServices(),
        getProducts('ยา')
      ]).then(([svcs, prods]) => {
        setServices(svcs);
        setProducts(prods);
      }).catch(console.error);
    };

    fetchData();
  }, [initialAppointments]);

  const today = getNow();
  const todayString = today.toLocaleDateString('en-CA');
  const formattedDate = today.toLocaleDateString("th-TH", { year: 'numeric', month: 'long', day: 'numeric' });

  const getWeekRange = () => {
    const d = getNow();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d.setDate(diff));
    const end = new Date(d.setDate(start.getDate() + 6));
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
  };

  const getMonthRange = () => {
    const d = getNow();
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
  };

  const filteredAppts = appointments
    .filter(a => {
      if (a.doctorId !== doctor?.id) return false;
      if (timeFilter === "today") return a.date === todayString;
      if (timeFilter === "week") {
        const { start, end } = getWeekRange();
        return a.date >= start && a.date <= end;
      }
      if (timeFilter === "month") {
        const { start, end } = getMonthRange();
        return a.date >= start && a.date <= end;
      }
      return true;
    })
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });

  const unassignedAppts = appointments
    .filter(a => {
      if (a.doctorId) return false;
      const isToday = a.date === todayString;
      const isCheckedIn = a.status === "เช็คอินเรียบร้อย";
      return isToday && isCheckedIn;
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  const handleClaimAppointment = async (apptId: number) => {
    if (!doctor?.id) return;
    try {
      await updateAppointmentDetails(apptId, {
        doctorId: doctor.id,
      });

      setAppointments(apps => apps.map(a => a.id === apptId ? {
        ...a,
        doctorId: doctor.id,
        doctorName: doctor.name || ""
      } : a));

      window.dispatchEvent(new CustomEvent('appointments-updated'));
    } catch (err: any) {
      console.error("Claim appointment error:", err);
      alert("เกิดข้อผิดพลาดในการรับเคส: " + (err?.message || ""));
    }
  };

  const incrementService = (svc: any, tooth?: number | string) => {
    setForm(f => {
      const location = tooth ? String(tooth) : (svc.applyTo === 'MOUTH' || svc.applyTo === 'ทั้งปาก' ? 'MOUTH' : undefined);
      const existing = f.services.find(x => x.id === svc.id && x.locationCode === location);
      if (existing) {
        return { ...f, services: f.services.filter(x => x !== existing) };
      }

      let newNotes = f.notes;
      if (!tooth) {
        const noteText = `ทำ ${svc.name}`;
        newNotes = newNotes ? `${newNotes}\n- ${noteText}` : `- ${noteText}`;
      }

      return {
        ...f,
        services: [...f.services, { id: svc.id, name: svc.name, qty: 1, price: svc.basePrice || 0, locationCode: location }],
        notes: newNotes
      };
    });
  };

  const incrementMedicine = (prod: any) => {
    setForm(f => {
      const existing = f.medicines.find(x => x.id === prod.id);
      if (existing) {
        return { ...f, medicines: f.medicines.map(x => x === existing ? { ...x, qty: x.qty + 1 } : x) };
      }
      return { ...f, medicines: [...f.medicines, { id: prod.id, name: prod.name, qty: 1, price: prod.price || 0, unit: prod.unit, instruction: prod.instruction || '' }] };
    });
  };

  const decrementMedicine = (prodId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setForm(f => {
      const existing = f.medicines.find(x => x.id === prodId);
      if (existing && existing.qty > 1) {
        return { ...f, medicines: f.medicines.map(x => x === existing ? { ...x, qty: x.qty - 1 } : x) };
      }
      return { ...f, medicines: f.medicines.filter(x => x !== existing) };
    });
  };

  useEffect(() => {
    const servicesCost = form.services.reduce((sum, sItem) => {
      return sum + ((sItem.price ?? 0) * sItem.qty);
    }, 0);
    const medicinesCost = form.medicines.reduce((sum, mItem) => {
      return sum + ((mItem.price ?? 0) * mItem.qty);
    }, 0);
    const totalCost = servicesCost + medicinesCost;

    setForm(f => ({ ...f, actualCost: totalCost > 0 ? totalCost : "" }));
  }, [form.services, form.medicines]);

  const onUpdateAppt = async (id: number, updates: Partial<Appointment>, detailedServices?: any[], medicines?: any[]) => {
    try {
      if (updates.status) {
        if (updates.status === "รอชำระเงิน" && updates.treatmentNotes !== undefined) {
          await saveTreatment(id, updates.treatmentNotes, updates.recommendations || "", updates.treatmentServices || [], updates.cost || 0, updates.odontogramData, doctor?.id, detailedServices, medicines);
        } else {
          await updateAppointmentStatus(id, updates.status);
        }

        setAppointments(apps => apps.map(a => a.id === id ? {
          ...a,
          status: updates.status!,
          treatmentNotes: updates.treatmentNotes !== undefined ? updates.treatmentNotes : a.treatmentNotes,
          treatmentServices: updates.treatmentServices || a.treatmentServices,
          recommendations: updates.recommendations !== undefined ? updates.recommendations : a.recommendations,
          cost: updates.cost !== undefined ? updates.cost : a.cost,
          odontogramData: updates.odontogramData || a.odontogramData
        } : a));
      }
    } catch (err: any) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + (err?.message || "Failed to update appointment"));
    }
  };

  const handleStartRecording = async (a: Appointment) => {
    setRecording(a.id);
    
    setForm({
      notes: a.treatmentNotes || "",
      recommendations: a.recommendations || "",
      services: a.detailedServices ? a.detailedServices.map(s => ({
        id: s.serviceId,
        name: s.name,
        qty: s.qty,
        price: s.price,
        locationCode: s.locationCode
      })) : [],
      medicines: [],
      actualCost: a.cost ? (Number(a.cost) || "") : ""
    });

    let records: any[] = [];
    if (a.patientId) {
      try {
        records = await getPatientTreatmentRecords(a.patientId);
        setPatientHistoryRecords(records);
      } catch (err) {
        console.error("Fetch patient history error:", err);
        setPatientHistoryRecords([]);
      }
    } else {
      setPatientHistoryRecords([]);
    }

    let initialTeeth: Record<string, any> = {};
    let initialExtras: any[] = [];

    if (a.odontogramData && Object.keys(a.odontogramData).length > 0) {
      const { wholeMouth, extraTeeth: savedExtra, ...rest } = a.odontogramData as any;
      initialTeeth = { ...rest };
      initialExtras = Array.isArray(savedExtra) ? savedExtra : [];
    } else if (a.patientId && records.length > 0) {
      const historyOdontogram = await getPatientLatestOdontogram(a.patientId);
      const { wholeMouth, extraTeeth: savedExtra, ...rest } = (historyOdontogram || {}) as any;
      initialTeeth = { ...rest };
      initialExtras = Array.isArray(savedExtra) ? savedExtra : [];
    }

    // ตรวจสอบประวัติการรักษาที่ผ่านมา เพื่อระบุฟันที่เคยถูกถอน หรือผ่าฟันคุดออกไปแล้ว (เช่น ซี่ 48)
    const inferredMissingTeeth = new Set<string>();
    const addIfValidTooth = (val: any) => {
      if (!val) return;
      const clean = String(val).replace(/^teeth-/, "").trim();
      if (isValidToothId(clean)) {
        inferredMissingTeeth.add(clean);
      }
    };

    records.forEach((record: any) => {
      if (record.treatmentServices) {
        record.treatmentServices.forEach((s: string) => {
          if (!s) return;
          const isExtraction = s.includes("ถอน") || s.includes("ผ่าฟันคุด") || s.includes("ผ่าคุด");
          if (isExtraction) {
            const m1 = s.matchAll(/(?:ซี่ที่:?|ซี่)\s*(\d{2})\b/g);
            for (const m of m1) addIfValidTooth(m[1]);

            const m2 = s.matchAll(/\(\s*(?:ซี่)?\s*(\d{2})\s*\)/g);
            for (const m of m2) addIfValidTooth(m[1]);
          }
        });
      }

      if (record.detailedServices) {
        record.detailedServices.forEach((ds: any) => {
          const isExtraction =
            ds.name?.includes("ถอน") ||
            ds.name?.includes("ผ่าฟันคุด") ||
            ds.name?.includes("ผ่าคุด") ||
            ds.serviceName?.includes("ถอน") ||
            ds.serviceName?.includes("ผ่าฟันคุด") ||
            ds.serviceName?.includes("ผ่าคุด");
          if (isExtraction && ds.locationCode) {
            addIfValidTooth(ds.locationCode);
          }
        });
      }

      const noteText = record.notes || record.treatmentNotes || "";
      if (noteText) {
        noteText.split(/\r?\n/).forEach((line: string) => {
          if (line.includes("ถอน") || line.includes("ผ่าฟันคุด") || line.includes("ผ่าคุด")) {
            const m1 = line.matchAll(/(?:ซี่ที่:?|ซี่)\s*(\d{2})\b/g);
            for (const m of m1) addIfValidTooth(m[1]);

            const m2 = line.matchAll(/\(\s*(?:ซี่)?\s*(\d{2})\s*\)/g);
            for (const m of m2) addIfValidTooth(m[1]);
          }
        });
      }
    });

    inferredMissingTeeth.forEach((tooth) => {
      if (!initialTeeth[tooth] || initialTeeth[tooth] === "normal") {
        initialTeeth[tooth] = "cross";
      }
    });

    setToothData(initialTeeth);
    setExtraTeeth(initialExtras);
  };

  const saveDraftTreatment = async (appt: Appointment) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const formattedServices = form.services.map(s => `${s.name}${s.locationCode ? ` (ซี่ ${s.locationCode})` : ''}${s.qty > 1 ? ` x${s.qty}` : ''}`);
      const formattedMedicines = form.medicines.map(m => `${m.name} x${m.qty} ${m.unit || ''}`);
      formattedServices.push(...formattedMedicines);

      const detailedServices = [...form.services];
      const cleanToothData = Object.fromEntries(
        Object.entries(toothData).filter(([k, v]) => v && v !== "normal" && k !== "wholeMouth" && k !== "extraTeeth")
      );
      const fullOdontogram = {
        ...cleanToothData,
        ...(extraTeeth && extraTeeth.length > 0 ? { extraTeeth } : {})
      };

      await saveTreatment(
        appt.id,
        form.notes,
        form.recommendations,
        formattedServices,
        Number(form.actualCost) || 0,
        fullOdontogram as any,
        doctor?.id,
        detailedServices,
        form.medicines,
        false
      );

      setAppointments(apps => apps.map(a => a.id === appt.id ? {
        ...a,
        treatmentNotes: form.notes,
        treatmentServices: formattedServices,
        recommendations: form.recommendations,
        cost: Number(form.actualCost) || 0,
        odontogramData: fullOdontogram as any
      } : a));

      alert("บันทึกร่างข้อมูลการรักษาและผังฟันลงฐานข้อมูลเรียบร้อยแล้ว");
    } catch (err: any) {
      console.error("Save draft error:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกร่าง: " + (err?.message || "ไม่สามารถบันทึกได้"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitTreatment = async (appt: Appointment) => {
    if (isSubmitting) return;
    if (!form.notes.trim()) {
      alert("กรุณาบันทึกหัตถการ / สิ่งที่ทำ ก่อนส่งข้อมูล");
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedServices = form.services.map(s => `${s.name}${s.locationCode ? ` (ซี่ ${s.locationCode})` : ''}${s.qty > 1 ? ` x${s.qty}` : ''}`);
      const formattedMedicines = form.medicines.map(m => `${m.name} x${m.qty} ${m.unit || ''}`);
      formattedServices.push(...formattedMedicines);

      const detailedServices = [...form.services];
      const cleanToothData = Object.fromEntries(
        Object.entries(toothData).filter(([k, v]) => v && v !== "normal" && k !== "wholeMouth" && k !== "extraTeeth")
      );
      const fullOdontogram = {
        ...cleanToothData,
        ...(extraTeeth && extraTeeth.length > 0 ? { extraTeeth } : {})
      };

      await onUpdateAppt(appt.id, {
        status: "รอชำระเงิน",
        treatmentNotes: form.notes,
        treatmentServices: formattedServices,
        recommendations: form.recommendations,
        cost: Number(form.actualCost) || 0,
        odontogramData: fullOdontogram as any
      }, detailedServices, form.medicines);

      setRecording(null);
      setForm({ notes: "", recommendations: "", services: [], medicines: [], actualCost: "" });
      setToothData({});
      setExtraTeeth([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToothClick = (tooth: number | string, status?: ToothStatus) => {
    if (status) {
      setToothData(prev => {
        const current = prev[tooth] || "normal";
        const next = current === status ? "normal" : status;
        const updated = { ...prev };
        if (next === "normal") {
          delete updated[tooth];
        } else {
          updated[tooth] = next;
        }

        const remainingMissing = Object.entries(updated)
          .filter(([_, s]) => s === "cross")
          .map(([id]) => id)
          .sort((a, b) => Number(a) - Number(b));

        setForm(f => {
          if (!f.notes?.includes("เคยถอน/ผ่าคุด")) return f;
          const lines = f.notes.split("\n");
          const preservedLines = lines.filter(line => !line.startsWith("- ประวัติเดิม: เคยถอน/ผ่าคุด"));
          if (remainingMissing.length > 0) {
            preservedLines.push(`- ประวัติเดิม: เคยถอน/ผ่าคุด ซี่ ${remainingMissing.join(", ")}`);
          }
          return { ...f, notes: preservedLines.join("\n") };
        });

        return updated;
      });
    } else {
      setSelectedToothForAction(tooth);
    }
  };

  const addMed = (med: PrescribedMed) => {
    if (!medList.find(m => m.name === med.name)) {
      setMedList(prev => [...prev, { ...med }]);
    }
  };

  const removeMed = (idx: number) => setMedList(prev => prev.filter((_, i) => i !== idx));

  const applyMedsToNotes = () => {
    if (medList.length === 0) { setShowMedModal(null); return; }
    const medText = "\n\n[สั่งยา]\n" + medList.map(m =>
      `• ${m.name} | ขนาด: ${m.dose} | ${m.freq} | ${m.days} วัน`
    ).join("\n");
    setForm(f => ({ ...f, notes: (f.notes || "") + medText }));
    setMedList([]);
    setShowMedModal(null);
  };

  return {
    appointments,
    setAppointments,
    services,
    products,
    expanded,
    setExpanded,
    recording,
    setRecording,
    isSubmitting,
    form,
    setForm,
    toothData,
    setToothData,
    extraTeeth,
    setExtraTeeth,
    isChild,
    setIsChild,
    timeFilter,
    setTimeFilter,
    selectedToothForAction,
    setSelectedToothForAction,
    showMedModal,
    setShowMedModal,
    patientHistoryRecords,
    medList,
    setMedList,
    todayString,
    formattedDate,
    filteredAppts,
    unassignedAppts,
    handleClaimAppointment,
    incrementService,
    incrementMedicine,
    decrementMedicine,
    onUpdateAppt,
    handleStartRecording,
    saveDraftTreatment,
    submitTreatment,
    handleToothClick,
    addMed,
    removeMed,
    applyMedsToNotes,
  };
}

