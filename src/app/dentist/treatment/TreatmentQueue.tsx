import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Filter, Play, CheckCircle, Clock, FileText, Plus, X, AlertTriangle, ChevronRight, Check, Send, ClipboardList, Pill } from "lucide-react";

import { Appointment, STATUS_COLORS, ServiceInfo, AppointmentStatus, DentistInfo, hasHealthAlert } from "../../shared/data";
import { getAppointments, getServices, updateAppointmentStatus, supabase } from "../../shared/supabaseApi";
import { saveTreatment, getPatientLatestOdontogram, getProducts } from "../../shared/api/treatmentApi";
import Odontogram, { ToothStatus } from "./Odontogram";

import ToothActionModal from "./ToothActionModal";

/** ดึงวันที่ "ปัจจุบัน" โดยรองรับ Time Travel mock datetime จาก localStorage */
function getNow(): Date {
  const mockDatetime = localStorage.getItem("supat_mock_date");
  if (mockDatetime) {
    const parsed = new Date(mockDatetime);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}


export default function TreatmentQueue({
  doctor,
  appointments: initialAppointments
}: {
  doctor: DentistInfo | null;
  appointments?: Appointment[];
}) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments || []);
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      }).catch(console.error).finally(() => setLoading(false));
    };

    fetchData();
  }, []);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [recording, setRecording] = useState<number | null>(null);
  const [form, setForm] = useState<{
    notes: string;
    recommendations: string;
    services: { id: number; name: string; qty: number; price: number; locationCode?: string }[];
    medicines: { id: number; name: string; qty: number; price: number; unit?: string; note?: string; instruction?: string }[];
    actualCost: number | ""
  }>({ notes: "", recommendations: "", services: [], medicines: [], actualCost: "" });
  const [toothData, setToothData] = useState<Record<number, ToothStatus>>({});
  const [isChild, setIsChild] = useState(false);
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month" | "all">("today");
  const [selectedToothForAction, setSelectedToothForAction] = useState<number | null>(null);
  const [showMedModal, setShowMedModal] = useState<number | null>(null); // appointment id
  const [medList, setMedList] = useState<{ name: string; dose: string; freq: string; days: string }[]>([]);

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
      return true; // all
    })
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });

  const incrementService = (svc: any, tooth?: number) => {
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

  const decrementService = (svcId: number, location: string | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    setForm(f => {
      const existing = f.services.find(x => x.id === svcId && x.locationCode === location);
      if (existing && existing.qty > 1) {
        return { ...f, services: f.services.map(x => x === existing ? { ...x, qty: x.qty - 1 } : x) };
      }
      return { ...f, services: f.services.filter(x => x !== existing) };
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

  const generateToothSummary = (data: Record<number, ToothStatus>) => {
    const red = Object.entries(data).filter(([_, s]) => s === 'red').map(([t]) => t);
    const blue = Object.entries(data).filter(([_, s]) => s === 'blue').map(([t]) => t);
    const cross = Object.entries(data).filter(([_, s]) => s === 'cross').map(([t]) => t);

    const parts = [];
    if (red.length) parts.push(`พบปัญหา: ซี่ ${red.join(', ')}`);
    if (blue.length) parts.push(`รักษาแล้ว: ซี่ ${blue.join(', ')}`);
    if (cross.length) parts.push(`ถอน/สูญเสีย: ซี่ ${cross.join(', ')}`);

    return parts.join(' | ');
  };

  useEffect(() => {
    const cost = form.services.reduce((sum, sItem) => {
      return sum + ((sItem.price ?? 0) * sItem.qty);
    }, 0) + form.medicines.reduce((sum, mItem) => {
      return sum + ((mItem.price ?? 0) * mItem.qty);
    }, 0);

    const treatedTeeth = Object.values(toothData).filter(s => s !== "normal").length;
    const suggestedCost = cost === 0 && treatedTeeth > 0 ? treatedTeeth * 800 : cost;

    setForm(f => ({ ...f, actualCost: suggestedCost > 0 ? suggestedCost : "" }));
  }, [form.services, form.medicines, toothData, services]);

  const onUpdateAppt = async (id: number, updates: Partial<Appointment>, detailedServices?: any[], medicines?: any[]) => {
    try {
      if (updates.status) {
        if (updates.status === "รอชำระเงิน" && updates.treatmentNotes !== undefined) {
          // บันทึก Supabase ก่อน แล้วค่อยอัปเดต UI
          await saveTreatment(id, updates.treatmentNotes, updates.recommendations || "", updates.treatmentServices || [], updates.cost || 0, updates.odontogramData, doctor?.id, detailedServices, medicines);
        } else {
          await updateAppointmentStatus(id, updates.status);
        }

        // อัปเดต local state หลัง Supabase บันทึกสำเร็จ
        setAppointments(apps => apps.map(a => a.id === id ? {
          ...a,
          status: updates.status!,
          treatmentNotes: updates.treatmentNotes || a.treatmentNotes,
          treatmentServices: updates.treatmentServices || a.treatmentServices,
          recommendations: updates.recommendations || a.recommendations,
          cost: updates.cost || a.cost
        } : a));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update appointment");
    }
  };

  const handleStartRecording = async (a: Appointment) => {
    setRecording(a.id);
    if (a.patientId) {
      const historyOdontogram = await getPatientLatestOdontogram(a.patientId);
      const { wholeMouth, ...rest } = historyOdontogram;
      setToothData(rest as any);
    } else {
      setToothData({});
    }
  };

  const submitTreatment = async (appt: Appointment) => {
    if (!form.notes.trim()) {
      alert("กรุณาบันทึกหัตถการ / สิ่งที่ทำ ก่อนส่งข้อมูล");
      return;
    }


    const formattedServices = form.services.map(s => `${s.name}${s.locationCode ? ` (ซี่ ${s.locationCode})` : ''}${s.qty > 1 ? ` x${s.qty}` : ''}`);
    const formattedMedicines = form.medicines.map(m => `💊 ${m.name} x${m.qty} ${m.unit || ''}`);
    formattedServices.push(...formattedMedicines);

    const detailedServices = [...form.services];



    await onUpdateAppt(appt.id, {
      status: "รอชำระเงิน",
      treatmentNotes: form.notes,
      treatmentServices: formattedServices,
      recommendations: form.recommendations,
      cost: Number(form.actualCost) || 0,
      odontogramData: { ...toothData, wholeMouth: false } as any
    }, detailedServices, form.medicines);

    setRecording(null);
    setForm({ notes: "", recommendations: "", services: [], medicines: [], actualCost: "" });
    setToothData({});
  };

  const handleToothClick = (tooth: number, status?: ToothStatus) => {
    if (status) {
      setToothData(prev => {
        const current = prev[tooth] || "normal";
        const next = current === status ? "normal" : status;
        return { ...prev, [tooth]: next };
      });
    } else {
      setSelectedToothForAction(tooth);
    }
  };

  const statusActions: Record<string, { label: string; next: AppointmentStatus; color: string }> = {
    "เช็คอินเรียบร้อย": { label: "เรียกเข้าพบ", next: "กำลังรักษา", color: "#A21CAF" },
    "กำลังรักษา": { label: "บันทึกการรักษา", next: "รอชำระเงิน", color: "#7C3AED" },
  };

  // ─── Medicine Modal ───────────────────────────────────────────────────────────
  const COMMON_MEDS = [
    { name: "ยาแก้ปวด (Ibuprofen 400mg)", dose: "400mg", freq: "ทุก 6 ชั่วโมงเมื่อปวด", days: "3" },
    { name: "ยาแก้ปวด (Paracetamol 500mg)", dose: "500mg", freq: "ทุก 4-6 ชั่วโมงเมื่อปวด", days: "3" },
    { name: "ยาปฏิชีวนะ (Amoxicillin 500mg)", dose: "500mg", freq: "วันละ 3 ครั้ง หลังอาหาร", days: "5" },
    { name: "ยาลดบวม (Dexamethasone 0.5mg)", dose: "0.5mg", freq: "วันละ 1 ครั้ง หลังอาหาร", days: "3" },
    { name: "ยาบ้วยปาก (Chlorhexidine 0.2%)", dose: "บ้วนปาก", freq: "วันละ 2-3 ครั้ง หลังอาหาร", days: "7" },
    { name: "ยาฟลูอไรด์ทา", dose: "ทาบางๆ", freq: "หลังแปรงฟันและก่อนนอน", days: "30" },
  ];

  const addMed = (med: typeof COMMON_MEDS[0]) => {
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

  return (
    <div>
      {/* Medicine Modal */}
      {showMedModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base flex items-center gap-2" style={{ color: "#1A365D" }}>
                <Pill size={16} className="text-purple-600" /> สั่งยาสำหรับคนไข้
              </h3>
              <button onClick={() => { setShowMedModal(null); setMedList([]); }} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100"><X size={14} /></button>
            </div>

            <p className="text-xs font-medium mb-2" style={{ color: "#4A6080" }}>เลือกยาที่ต้องการสั่ง (click เพื่อเพิ่ม)</p>
            <div className="grid grid-cols-1 gap-2 mb-4">
              {COMMON_MEDS.map((med, i) => {
                const selected = !!medList.find(m => m.name === med.name);
                return (
                  <button key={i} onClick={() => selected ? removeMed(medList.findIndex(m => m.name === med.name)) : addMed(med)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm transition-all border"
                    style={{
                      backgroundColor: selected ? "#F3E8FF" : "#F8FAFC",
                      borderColor: selected ? "#A855F7" : "#E2E8F0",
                      color: selected ? "#6B21A8" : "#1A365D",
                    }}>
                    <div>
                      <p className="font-semibold text-xs">{med.name}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: selected ? "#7E22CE" : "#4A6080" }}>{med.freq} • {med.days} วัน</p>
                    </div>
                    {selected ? <Check size={14} className="text-purple-600 shrink-0" /> : <Plus size={14} className="text-gray-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {medList.length > 0 && (
              <div className="bg-purple-50 rounded-xl p-3 mb-4 border border-purple-100">
                <p className="text-xs font-bold text-purple-800 mb-2">ยาที่เลือกแล้ว ({medList.length} รายการ)</p>
                {medList.map((m, i) => (
                  <div key={i} className="flex justify-between items-center text-xs text-purple-700 py-1">
                    <span>• {m.name}</span>
                    <button onClick={() => removeMed(i)} className="text-red-400 hover:text-red-600 ml-2"><X size={11} /></button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={applyMedsToNotes}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#9333EA,#7C3AED)" }}>
                ✅ ใส่ลงในบันทึกการรักษา
              </button>
              <button onClick={() => { setShowMedModal(null); setMedList([]); }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200" style={{ color: "#4A6080" }}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
      {selectedToothForAction && (
        <ToothActionModal
          tooth={selectedToothForAction}
          services={services}
          onClose={() => setSelectedToothForAction(null)}
          onAction={(status, service, notes) => {
            setToothData(prev => ({ ...prev, [selectedToothForAction]: status }));
            if (service) {
              incrementService(service, selectedToothForAction);
            }
            if (notes) {
              setForm(f => ({ ...f, notes: f.notes ? `${f.notes}\n- ${notes}` : `- ${notes}` }));
            }
            setSelectedToothForAction(null);
          }}
        />
      )}


      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>คิวการรักษา</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>
            {timeFilter === "today" ? `วันที่ ${formattedDate}` : timeFilter === "week" ? "สัปดาห์นี้" : timeFilter === "month" ? "เดือนนี้" : "คิวทั้งหมด"} • {filteredAppts.length} ราย
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
          {[
            { id: "today", label: "วันนี้" },
            { id: "week", label: "สัปดาห์นี้" },
            { id: "month", label: "เดือนนี้" },
            { id: "all", label: "ทั้งหมด" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setTimeFilter(f.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${timeFilter === f.id ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredAppts.map(a => {
          const sc = STATUS_COLORS[a.status] ?? { bg: "#F0F4F8", text: "#4A6080", dot: "#ccc" };
          const act = statusActions[a.status];
          const isExp = expanded === a.id;
          const isRec = recording === a.id;
          const hasAlert = hasHealthAlert(a.allergies, a.conditions);

          return (
            <div key={a.id} className="rounded-2xl bg-white overflow-hidden transition-all" style={{ boxShadow: "0 2px 16px rgba(26,54,93,0.08)" }}>
              {/* Main row */}
              <div className="p-5 flex items-start gap-4">
                <div className="flex flex-col items-center justify-center flex-shrink-0">
                  <div className="text-[10px] font-medium text-gray-400 mb-1">
                    {a.date === todayString ? "วันนี้" : new Date(a.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center text-white text-xs font-bold"
                    style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
                    {a.time}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm" style={{ color: "#1A365D" }}>{a.patientName}</p>
                    <span className="text-xs" style={{ color: "#4A6080" }}>HN: {a.hn}</span>
                    {hasAlert && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FFF3E0", color: "#E65100" }}>
                        <AlertTriangle size={10} /> แจ้งเตือนสุขภาพ
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "#4A6080" }}>{a.service}</p>
                  {hasHealthAlert(undefined, a.conditions) && <p className="text-xs mt-1" style={{ color: "#E65100" }}>⚠ {a.conditions}</p>}
                  {hasHealthAlert(a.allergies) && <p className="text-xs" style={{ color: "#E65100" }}>💊 แพ้: {a.allergies}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: sc.bg, color: sc.text }}>{a.status}</span>
                  <button onClick={async () => {
                    if (isExp) setExpanded(null);
                    else {
                      setExpanded(a.id);
                    }
                  }} style={{ color: "#4A6080" }}>
                    <ChevronRight size={16} className="transition-transform" style={{ transform: isExp ? "rotate(90deg)" : "none" }} />
                  </button>
                </div>
              </div>

              {/* Expanded: health info + actions */}
              {isExp && !isRec && (
                <div className="px-5 pb-5 border-t" style={{ borderColor: "rgba(26,54,93,0.06)" }}>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "#4A6080" }}>โรคประจำตัว</p>
                      <p className="text-sm" style={{ color: hasHealthAlert(a.conditions) ? "#E65100" : "#1A365D" }}>{a.conditions}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "#4A6080" }}>ประวัติแพ้ยา</p>
                      <p className="text-sm" style={{ color: hasHealthAlert(a.allergies) ? "#E65100" : "#1A365D" }}>{a.allergies}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "#4A6080" }}>บริการที่นัด</p>
                      <p className="text-sm" style={{ color: "#1A365D" }}>{a.service}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "#4A6080" }}>เบอร์โทร</p>
                      <p className="text-sm" style={{ color: "#1A365D" }}>{a.patientPhone}</p>
                    </div>
                  </div>

                  {(() => {
                    const history = appointments
                      .filter(x => x.patientId === a.patientId && x.id !== a.id && ["เสร็จสิ้น", "รอชำระเงิน", "ชำระเงินแล้ว"].includes(x.status))
                      .sort((a, b) => b.date.localeCompare(a.date));

                    if (history.length === 0) return null;
                    return (
                      <div className="mb-4 bg-slate-50/70 rounded-xl p-3 border border-slate-100">
                        <p className="text-xs font-semibold mb-2" style={{ color: "#1A365D" }}>ประวัติการรักษาล่าสุด</p>
                        <div className="space-y-2">
                          {history.slice(0, 3).map(h => (
                            <div key={h.id} className="text-xs p-2.5 bg-white rounded-lg border border-slate-100/50 flex justify-between items-start shadow-sm">
                              <div>
                                <p className="font-medium mb-0.5" style={{ color: "#1A365D" }}>{h.date} • โดย {h.doctorName}</p>
                                <p style={{ color: "#4A6080" }}>บริการ: {h.service}</p>
                                {h.treatmentNotes && (
                                  <div className="mt-1.5 pt-1.5 border-t border-slate-50">
                                    <p className="text-[11px] font-medium text-slate-500 mb-0.5">บันทึกจากแพทย์:</p>
                                    <p className="text-[11px]" style={{ color: "#64748B", whiteSpace: "pre-line" }}>
                                      {h.treatmentNotes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}



                  <div className="flex gap-2 mt-4">
                    {act && (
                      <button
                        onClick={() => act.next === "รอชำระเงิน"
                          ? handleStartRecording(a)
                          : onUpdateAppt(a.id, { status: act.next })}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
                        style={{ backgroundColor: act.color }}>
                        {act.next === "รอชำระเงิน" ? <><ClipboardList size={14} /> {act.label}</> : <><Clock size={14} /> {act.label}</>}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Treatment recording form */}
              {isRec && (
                <div className="px-5 pb-3 border-t" style={{ borderColor: "rgba(26,54,93,0.06)" }}>
                  <div className="flex items-center justify-between py-2">
                    <p className="text-sm font-semibold" style={{ color: "#1A365D" }}>บันทึกการรักษา — {a.patientName}</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div>
                      <Odontogram
                        key={`odontogram-${recording}`}
                        toothData={toothData}
                        onToothClick={handleToothClick}
                        isChild={isChild}
                        setIsChild={setIsChild}
                      />
                    </div>

                    <div className="space-y-3">
                      <details className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden group">
                        <summary className="text-[12px] font-bold p-3 cursor-pointer hover:bg-slate-100 flex items-center justify-between text-slate-700">
                          <span>➕ หัตถการอื่นๆ (ไม่ได้ระบุตำแหน่งซี่ฟัน)</span>
                          <ChevronRight size={16} className="text-slate-400 group-open:rotate-90 transition-transform" />
                        </summary>
                        <div className="p-3 pt-0 border-t border-slate-100">
                          <p className="text-[10px] mb-2 text-slate-500">ตัวเลือกด้านล่างนี้ใช้สำหรับหัตถการที่ไม่ได้ผูกกับซี่ฟันใดซี่ฟันหนึ่งโดยเฉพาะ เช่น ขูดหินปูน จัดฟัน ฟอกสีฟัน ฯลฯ</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                            {services.filter(s => s.active && s.applyTo !== 'TOOTH').map(s => {
                              const existing = form.services.find(x => x.id === s.id);
                              const isSelected = !!existing;
                              return (
                                <button key={s.id} onClick={() => incrementService(s)}
                                  className="flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-lg text-[11px] text-left transition-all leading-tight relative"
                                  style={{
                                    backgroundColor: isSelected ? "#FFE8EC" : "#F0F4F8",
                                    color: isSelected ? "#1A365D" : "#4A6080",
                                    border: isSelected ? "1.5px solid #FF8C9A" : "1.5px solid transparent",
                                  }}>
                                  <div className="flex items-center gap-1.5 flex-1">
                                    {isSelected ? (
                                      <div className="flex-shrink-0 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center">
                                        <CheckCircle size={10} />
                                      </div>
                                    ) : (
                                      <div className="flex-shrink-0 w-4 h-4 rounded-full border border-gray-300"></div>
                                    )}
                                    <span className="leading-[1.2]">{s.name}</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </details>

                      <details className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden group">
                        <summary className="text-[12px] font-bold p-3 cursor-pointer hover:bg-slate-100 flex items-center justify-between text-slate-700">
                          <span>💊 สั่งจ่ายยา</span>
                          <ChevronRight size={16} className="text-slate-400 group-open:rotate-90 transition-transform" />
                        </summary>
                        <div className="p-3 pt-0 border-t border-slate-100">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                            {products.map(p => {
                              const existing = form.medicines.find(x => x.id === p.id);
                              const isSelected = !!existing;
                              return (
                                <button key={p.id} onClick={() => incrementMedicine(p)}
                                  className="flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-lg text-[11px] text-left transition-all leading-tight relative"
                                  style={{
                                    backgroundColor: isSelected ? "#E0F2FE" : "#F0F4F8",
                                    color: isSelected ? "#0369A1" : "#4A6080",
                                    border: isSelected ? "1.5px solid #7DD3FC" : "1.5px solid transparent",
                                  }}>
                                  <div className="flex items-center gap-1.5 flex-1">
                                    {isSelected ? (
                                      <div className="flex-shrink-0 w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center">
                                        <CheckCircle size={10} />
                                      </div>
                                    ) : (
                                      <div className="flex-shrink-0 w-4 h-4 rounded-full border border-gray-300"></div>
                                    )}
                                    <div className="leading-[1.2] flex flex-col">
                                      <span>{p.name}</span>
                                      {isSelected && existing.qty > 0 && (
                                        <span className="text-[9px] text-sky-600 font-bold">{existing.qty} {p.unit}</span>
                                      )}
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <div
                                      onClick={(e) => decrementMedicine(p.id, e)}
                                      className="w-4 h-4 rounded-full bg-white border border-sky-300 flex items-center justify-center text-sky-500 hover:bg-sky-400 hover:border-sky-400 hover:text-white transition-colors"
                                    >
                                      <span className="text-[10px] leading-none font-bold mb-[1px]">-</span>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          {products.length === 0 && (
                            <div className="text-center py-2 text-xs text-gray-500">ไม่มีรายการยาในระบบ (แจ้งแอดมินเพิ่มได้ที่จัดการคลินิก)</div>
                          )}
                        </div>

                        {/* Selected Medicines Instructions */}
                        {form.medicines.length > 0 && (
                          <div className="mt-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 space-y-2">
                            <label className="text-[10px] font-bold text-blue-800 uppercase tracking-wide flex items-center gap-1.5">
                              <span>📝 วิธีใช้ยา / คำสั่งแพทย์ (Dosage Instructions)</span>
                            </label>
                            {form.medicines.map(m => (
                              <div key={m.id} className="flex flex-col gap-1 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                <span className="text-xs font-semibold text-slate-700">💊 {m.name}</span>
                                <input
                                  type="text"
                                  value={m.instruction}
                                  onChange={(e) => {
                                    setForm(f => ({
                                      ...f,
                                      medicines: f.medicines.map(x => x.id === m.id ? { ...x, instruction: e.target.value } : x)
                                    }))
                                  }}
                                  placeholder="เช่น รับประทานครั้งละ 1 เม็ด ทุก 4-6 ชม."
                                  className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 outline-none text-slate-600"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </details>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-medium block" style={{ color: "#4A6080" }}>บันทึกหัตถการ / สิ่งที่ทำ</label>

                        </div>
                        <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                          rows={2} placeholder="อธิบายขั้นตอนการรักษาที่ดำเนินการ..."
                          className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                          style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                      </div>
                      <div>
                        <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>คำแนะนำสำหรับคนไข้</label>
                        <textarea value={form.recommendations} onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                          rows={1} placeholder="คำแนะนำการดูแลหลังรักษา..."
                          className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                          style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                      </div>

                      {/* Bill Preview / Safety Net */}
                      {(() => {
                        const servicesCost = form.services.reduce((sum, s) => sum + ((s.price ?? 0) * s.qty), 0);
                        const treatedTeeth = Object.values(toothData).filter(s => s !== "normal").length;
                        const suggestedExtraCost = servicesCost === 0 && treatedTeeth > 0 ? treatedTeeth * 800 : servicesCost;
                        const totalBill = suggestedExtraCost;

                        if (totalBill > 0) {
                          return (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-2 flex items-center justify-between shadow-sm">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-red-800 uppercase tracking-wide">บิลที่จะส่งให้พนักงานเก็บเงิน</span>
                                <div className="flex items-center gap-1.5 text-xs text-red-600 mt-1">
                                  {suggestedExtraCost > 0 && <span>ค่าหัตถการ ({suggestedExtraCost.toLocaleString()})</span>}
                                </div>
                              </div>
                              <div className="text-lg font-black text-red-700">
                                ฿{totalBill.toLocaleString()}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      <div className="flex justify-end gap-2 pt-1">
                        <button onClick={() => submitTreatment(a)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shadow-sm hover:shadow"
                          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
                          <Send size={14} /> ส่งข้อมูลให้พนักงาน
                        </button>
                        <button onClick={() => setRecording(null)}
                          className="px-5 py-2.5 rounded-xl text-sm font-medium"
                          style={{ border: "1.5px solid rgba(26,54,93,0.2)", color: "#4A6080" }}>
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
