import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Filter, Play, CheckCircle, Clock, FileText, Plus, X, AlertTriangle, ChevronRight, Check, Send, ClipboardList } from "lucide-react";

import { Appointment, STATUS_COLORS, ServiceInfo, AppointmentStatus, DentistInfo, hasHealthAlert } from "../../shared/data";
import { getAppointments, getServices, updateAppointmentStatus, supabase } from "../../shared/supabaseApi";
import { saveTreatment, getPatientLatestOdontogram, getPatientActiveTreatmentPlan, getProducts } from "../../shared/api/treatmentApi";
import Odontogram, { ToothStatus } from "./Odontogram";
import TreatmentPlanBuilder from "./TreatmentPlanBuilder";

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
  const [selectedPatientIdForPlan, setSelectedPatientIdForPlan] = useState<number | null>(null);
  const [activePlan, setActivePlan] = useState<any | null>(null);
  const [selectedPlanMonth, setSelectedPlanMonth] = useState<number | null>(null);
  const [activeInstallments, setActiveInstallments] = useState<any[]>([]);

  useEffect(() => {
    if (activePlan?.plan_id) {
      supabase.from('installment').select('*').eq('plan_id', activePlan.plan_id).then(({ data }) => {
        if (data) setActiveInstallments(data);
      });
    } else {
      setActiveInstallments([]);
    }
  }, [activePlan]);

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
    medicines: { id: number; name: string; qty: number; price: number; unit?: string; note?: string }[];
    actualCost: number | ""
  }>({ notes: "", recommendations: "", services: [], medicines: [], actualCost: "" });
  const [toothData, setToothData] = useState<Record<number, ToothStatus>>({});
  const [isChild, setIsChild] = useState(false);
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month" | "all">("today");
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [selectedToothForAction, setSelectedToothForAction] = useState<number | null>(null);

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
      return { ...f, medicines: [...f.medicines, { id: prod.id, name: prod.name, qty: 1, price: prod.price || 0, unit: prod.unit, note: prod.instruction }] };
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
    let baseInstallmentAmount = 0;
    let extraCost = 0;

    if (selectedPlanMonth && activePlan && activeInstallments.length > 0) {
      const inst = activeInstallments.find(i => i.installment_number === selectedPlanMonth);
      if (inst && inst.amount > 0) {
        baseInstallmentAmount = Number(inst.amount);

        // Find extra services that are not in the plan for this month
        const monthData = (activePlan.plan_details || []).find((d: any) => d.month === selectedPlanMonth);
        const plannedServiceNames = new Set((monthData?.services || []).map((s: any) => s.service_name));

        extraCost = form.services.reduce((sum, sItem) => {
          if (!plannedServiceNames.has(sItem.name)) {
            const svc = services.find(ms => ms.name === sItem.name);
            return sum + ((svc?.basePrice ?? 0) * sItem.qty);
          }
          return sum;
        }, 0);
      }
    }

    if (baseInstallmentAmount > 0) {
      setForm(f => ({ ...f, actualCost: baseInstallmentAmount + extraCost }));
      return;
    }

    const cost = form.services.reduce((sum, sItem) => {
      return sum + ((sItem.price ?? 0) * sItem.qty);
    }, 0) + form.medicines.reduce((sum, mItem) => {
      return sum + ((mItem.price ?? 0) * mItem.qty);
    }, 0);

    const treatedTeeth = Object.values(toothData).filter(s => s !== "normal").length;
    const suggestedCost = cost === 0 && treatedTeeth > 0 ? treatedTeeth * 800 : cost;

    setForm(f => ({ ...f, actualCost: suggestedCost > 0 ? suggestedCost : "" }));
  }, [form.services, form.medicines, toothData, services, selectedPlanMonth, activePlan, activeInstallments]);

  const onUpdateAppt = async (id: number, updates: Partial<Appointment>, detailedServices?: any[], medicines?: any[]) => {
    try {
      if (updates.status) {
        if (updates.status === "รอชำระเงิน" && updates.treatmentNotes !== undefined) {
          // บันทึก Supabase ก่อน แล้วค่อยอัปเดต UI
          await saveTreatment(id, updates.treatmentNotes, updates.recommendations || "", updates.treatmentServices || [], updates.cost || 0, updates.odontogramData, doctor?.id, activePlan?.plan_id, selectedPlanMonth || undefined, detailedServices, medicines);
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
    setActivePlan(null);
    setSelectedPlanMonth(null);
    if (a.patientId) {
      const historyOdontogram = await getPatientLatestOdontogram(a.patientId);
      const { wholeMouth, ...rest } = historyOdontogram;
      setToothData(rest as any);

      const planData = await getPatientActiveTreatmentPlan(a.patientId);
      if (planData && planData.dentist_id === doctor?.id) {
        setActivePlan(planData);
        if (planData.plan_details && planData.plan_details.length > 0) {
          const nextMonth = planData.plan_details.find((d: any) => d.status !== 'completed');
          if (nextMonth) {
            setSelectedPlanMonth(nextMonth.month);
          }
        }
      } else {
        setActivePlan(null);
        setSelectedPlanMonth(null);
      }
    } else {
      setToothData({});
    }
  };

  const submitTreatment = async (appt: Appointment) => {
    const formattedServices = form.services.map(s => `${s.name}${s.locationCode ? ` (ซี่ ${s.locationCode})` : ''}${s.qty > 1 ? ` x${s.qty}` : ''}`);
    const formattedMedicines = form.medicines.map(m => `💊 ${m.name} x${m.qty} ${m.unit || ''}`);
    formattedServices.push(...formattedMedicines);

    const detailedServices = [...form.services];

    if (selectedPlanMonth && activePlan && activeInstallments.length > 0) {
      const inst = activeInstallments.find(i => i.installment_number === selectedPlanMonth);
      if (inst && Number(inst.amount) > 0) {
        formattedServices.unshift(`ชำระค่างวดจัดฟัน งวดที่ ${inst.installment_number} (รอบเดือนที่ ${selectedPlanMonth})`);

        detailedServices.unshift({
          id: null, // Null to avoid foreign key violation
          name: `จัดฟัน งวดที่ ${inst.installment_number} (แผน: ${activePlan.plan_name})`,
          qty: 1,
          price: Number(inst.amount)
        } as any);
      }
    }

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

  return (
    <div>
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

      {selectedPatientIdForPlan && (
        <TreatmentPlanBuilder
          patientId={selectedPatientIdForPlan}
          existingPlan={isEditingPlan ? activePlan : undefined}
          lockedDentistId={doctor?.id}
          onClose={(newPlan) => {
            setSelectedPatientIdForPlan(null);
            setIsEditingPlan(false);
            if (newPlan) {
              setActivePlan(newPlan);
              setSelectedPlanMonth(1);

              // Auto pull month 1 data
              if (newPlan.plan_details && newPlan.plan_details.length > 0) {
                const m1 = newPlan.plan_details.find((d: any) => d.month === 1) || newPlan.plan_details[0];
                if (m1) {
                  setForm(f => ({
                    ...f,
                    notes: m1.notes || f.notes,
                    services: (() => {
                      const existingNames = new Set(f.services.map(s => s.name));
                      const newS = (m1.services || []).filter((s: any) => !existingNames.has(s.service_name)).map((s: any) => ({ name: s.service_name, qty: 1 }));
                      return [...f.services, ...newS];
                    })()
                  }));
                }
              }
            }
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
                      if (a.patientId) {
                        const planData = await getPatientActiveTreatmentPlan(a.patientId);
                        setActivePlan(planData || null);
                      }
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

                  {activePlan && activePlan.plan_details && (
                    <div className="mb-4 bg-teal-50/50 rounded-xl p-3 border border-teal-100 mt-2">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-semibold text-teal-800">
                          แผนการรักษา: {activePlan.plan_name}
                        </p>
                        {activePlan.dentist_id === doctor?.id && (
                          <button
                            onClick={() => {
                              setIsEditingPlan(true);
                              setSelectedPatientIdForPlan(a.patientId);
                            }}
                            className="bg-white border border-teal-200 text-teal-600 text-[10px] px-2.5 py-1 rounded-md hover:bg-teal-50 transition-colors flex items-center gap-1 shadow-sm"
                          >
                            ✏️ แก้ไขแผน
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap pb-2">
                        {activePlan.plan_details.map((plan: any) => {
                          const isCompleted = plan.status === 'completed';
                          return (
                            <div
                              key={plan.month}
                              className={`flex flex-col items-center justify-center w-9 h-9 rounded-md border transition-all ${isCompleted ? "bg-teal-600 border-teal-600 text-white" :
                                  "bg-white border-slate-200 text-slate-600"
                                }`}
                            >
                              <span className="text-sm font-bold">{plan.month}</span>
                              {!isCompleted && plan.services?.length > 0 && <div className="w-1 h-1 rounded-full bg-teal-400 mt-0.5"></div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

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
                    {!activePlan && ["จัดฟัน", "รักษาราก", "เทียม", "ปลอม", "วีเนียร์", "ครอบฟัน"].some(kw => a.service.includes(kw)) && (
                      <button
                        onClick={() => setSelectedPatientIdForPlan(a.patientId)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all text-teal-700 bg-teal-50 hover:bg-teal-100"
                      >
                        + สร้างแผนการรักษา
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

                    {/* Toggle whole mouth */}
                    <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                      {!activePlan && ["จัดฟัน", "รักษาราก", "เทียม", "ปลอม", "วีเนียร์", "ครอบฟัน"].some(kw => a.service.includes(kw)) && (
                        <button
                          onClick={() => setSelectedPatientIdForPlan(a.patientId)}
                          className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all text-teal-700 bg-teal-50 hover:bg-teal-100 mr-2"
                        >
                          + สร้างแผนการรักษา
                        </button>
                      )}
                    </div>
                  </div>

                  {activePlan && activePlan.plan_details && (() => {
                    const currentMonthData = activePlan.plan_details.find((d: any) => d.month === selectedPlanMonth);
                    const totalMonths = activePlan.plan_details.length;
                    const completedMonths = activePlan.plan_details.filter((d: any) => d.status === 'completed').length;
                    return (
                      <div className="mb-4 rounded-xl border border-teal-200 overflow-hidden">
                        {/* Header - Plan context */}
                        <div className="bg-teal-600 text-white px-3 py-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ClipboardList size={14} />
                            <span className="text-xs font-semibold">{activePlan.plan_name}</span>
                            <span className="bg-teal-500 text-teal-100 text-[10px] px-2 py-0.5 rounded-full">
                              ทำไปแล้ว {completedMonths}/{totalMonths} ครั้ง
                            </span>
                          </div>
                          {activePlan.dentist_id === doctor?.id && (
                            <button
                              onClick={() => { setIsEditingPlan(true); setSelectedPatientIdForPlan(a.patientId); }}
                              className="bg-teal-500 hover:bg-teal-400 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 transition-colors"
                            >
                              ✏️ แก้ไขแผน
                            </button>
                          )}
                        </div>

                        {/* Context banner — บอกหมอว่ากำลังบันทึกอะไร */}
                        {selectedPlanMonth ? (
                          <div className="bg-amber-50 border-b border-amber-200 px-3 py-2 flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5 shrink-0">📋</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-amber-800">
                                กำลังบันทึกการรักษา — ครั้งที่ {selectedPlanMonth} ตามแผน
                              </p>
                              {currentMonthData?.services?.length > 0 ? (
                                <p className="text-[11px] text-amber-700 mt-0.5">
                                  แผนวางไว้: {currentMonthData.services.map((s: any) => s.service_name).join(', ')}
                                  {' '}— บันทึกสิ่งที่ทำจริงด้านล่าง (อาจต่างจากแผนได้)
                                </p>
                              ) : (
                                <p className="text-[11px] text-amber-700 mt-0.5">ไม่มีหัตถการระบุไว้ล่วงหน้าในครั้งนี้ — บันทึกสิ่งที่ทำจริงด้านล่าง</p>
                              )}
                            </div>
                            {currentMonthData?.services?.length > 0 && (
                              <button
                                onClick={() => {
                                  if (currentMonthData) {
                                    setForm(f => ({
                                      ...f,
                                      notes: currentMonthData.notes || f.notes,
                                      services: (() => {
                                        const existingNames = new Set(f.services.map(s => s.name));
                                        const newS = (currentMonthData.services || []).filter((s: any) => !existingNames.has(s.service_name)).map((s: any) => ({ name: s.service_name, qty: 1 }));
                                        return [...f.services, ...newS];
                                      })()
                                    }));
                                    if (currentMonthData.odontogram_data) {
                                      setToothData(prev => ({ ...prev, ...currentMonthData.odontogram_data }));
                                    }
                                  }
                                }}
                                className="shrink-0 bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] px-2 py-1 rounded border border-amber-300 transition-colors whitespace-nowrap"
                              >
                                ↓ ดึงมาใส่
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-2">
                            <span className="text-slate-400 shrink-0">👆</span>
                            <p className="text-[11px] text-slate-600">
                              เลือกครั้งที่ด้านล่างเพื่อระบุว่าวันนี้ทำตาม<strong>ครั้งที่เท่าไหร่</strong>ในแผน — หรือไม่เลือกก็ได้ถ้าเป็นการรักษาที่ไม่ใช่ส่วนของแผนนี้
                            </p>
                          </div>
                        )}

                        {/* Month selector */}
                        <div className="bg-white px-3 py-2.5">
                          <p className="text-[10px] text-slate-400 mb-1.5 font-medium uppercase tracking-wide">เลือกครั้งที่ในแผน</p>
                          <div className="flex gap-1.5 flex-wrap">
                            {activePlan.plan_details.map((plan: any) => {
                              const isSelected = selectedPlanMonth === plan.month;
                              const isCompleted = plan.status === 'completed';
                              return (
                                <button
                                  key={plan.month}
                                  onClick={() => setSelectedPlanMonth(isSelected ? null : plan.month)}
                                  title={isCompleted ? `ครั้งที่ ${plan.month} — เสร็จแล้ว` : `ครั้งที่ ${plan.month}${plan.services?.length > 0 ? ': ' + plan.services.map((s: any) => s.service_name).join(', ') : ''}`}
                                  className={`flex flex-col items-center justify-center w-9 h-9 rounded-md border transition-all ${isCompleted ? "bg-teal-600 border-teal-600 text-white cursor-default" :
                                      isSelected ? "bg-teal-100 border-teal-500 text-teal-800 shadow-sm ring-1 ring-teal-500" :
                                        "bg-white border-slate-200 text-slate-600 hover:border-teal-300"
                                    }`}
                                >
                                  <span className="text-sm font-bold">{plan.month}</span>
                                  {!isCompleted && plan.services?.length > 0 && <div className="w-1 h-1 rounded-full bg-teal-400 mt-0.5"></div>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

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
                      </details>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-medium block" style={{ color: "#4A6080" }}>บันทึกหัตถการ / สิ่งที่ทำ</label>
                          <button
                            onClick={() => {
                              const summary = generateToothSummary(toothData);
                              if (summary) {
                                setForm(f => ({ ...f, notes: f.notes ? `${f.notes}\n- ${summary}` : `- ${summary}` }));
                              }
                            }}
                            className="text-[10px] text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 hover:bg-teal-100 transition-colors"
                          >
                            + แทรกซี่ฟันจากกราฟิก
                          </button>
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
                        let baseInstAmount = 0;
                        if (selectedPlanMonth && activePlan && activeInstallments.length > 0) {
                          const inst = activeInstallments.find(i => i.installment_number === selectedPlanMonth);
                          if (inst && Number(inst.amount) > 0) baseInstAmount = Number(inst.amount);
                        }

                        const servicesCost = form.services.reduce((sum, s) => sum + ((s.price ?? 0) * s.qty), 0);
                        const treatedTeeth = Object.values(toothData).filter(s => s !== "normal").length;
                        const suggestedExtraCost = servicesCost === 0 && treatedTeeth > 0 ? treatedTeeth * 800 : servicesCost;
                        const totalBill = baseInstAmount + suggestedExtraCost;

                        if (totalBill > 0) {
                          return (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-2 flex items-center justify-between shadow-sm">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-red-800 uppercase tracking-wide">บิลที่จะส่งให้พนักงานเก็บเงิน</span>
                                <div className="flex items-center gap-1.5 text-xs text-red-600 mt-1">
                                  {baseInstAmount > 0 && <span>ค่างวด ({baseInstAmount.toLocaleString()})</span>}
                                  {baseInstAmount > 0 && suggestedExtraCost > 0 && <span>+</span>}
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
