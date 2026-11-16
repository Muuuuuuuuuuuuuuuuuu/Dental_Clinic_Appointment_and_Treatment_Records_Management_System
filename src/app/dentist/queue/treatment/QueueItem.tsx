import React from "react";
import { AlertTriangle, ChevronRight, ClipboardList, Clock } from "lucide-react";
import { Appointment, STATUS_COLORS, AppointmentStatus, hasHealthAlert, ServiceInfo } from "@/app/shared/data";
import { ToothStatus } from "../odontogram/Odontogram";
import { SupernumeraryTooth } from "../odontogram/ToothGeometry";
import { TreatmentFormState } from "../types";
import ActiveTreatmentForm from "./ActiveTreatmentForm";

const statusActions: Record<string, { label: string; next: AppointmentStatus; color: string }> = {
  "เช็คอินเรียบร้อย": { label: "เรียกเข้าพบ", next: "กำลังรักษา", color: "#A21CAF" },
  "กำลังรักษา": { label: "บันทึกการรักษา", next: "รอชำระเงิน", color: "#7C3AED" },
};

interface QueueItemProps {
  appointment: Appointment;
  todayString: string;
  isExpanded: boolean;
  isRecording: boolean;
  allAppointments: Appointment[];
  services: ServiceInfo[];
  products: any[];
  toothData: Record<number | string, ToothStatus>;
  extraTeeth: SupernumeraryTooth[];
  isChild: boolean;
  setIsChild: (val: boolean) => void;
  patientHistoryRecords: any[];
  form: TreatmentFormState;
  setForm: React.Dispatch<React.SetStateAction<TreatmentFormState>>;
  isSubmitting: boolean;
  onToggleExpand: () => void;
  onStartRecording: (a: Appointment) => void;
  onUpdateAppt: (id: number, updates: Partial<Appointment>) => void;
  onToothClick: (tooth: number | string, status?: ToothStatus) => void;
  incrementService: (svc: any, tooth?: number | string) => void;
  incrementMedicine: (prod: any) => void;
  decrementMedicine: (prodId: number, e: React.MouseEvent) => void;
  onSaveDraft: (appt: Appointment) => void;
  onSubmitTreatment: (appt: Appointment) => void;
  onCloseRecording: () => void;
}

export default function QueueItem({
  appointment: a,
  todayString,
  isExpanded,
  isRecording,
  allAppointments,
  services,
  products,
  toothData,
  extraTeeth,
  isChild,
  setIsChild,
  patientHistoryRecords,
  form,
  setForm,
  isSubmitting,
  onToggleExpand,
  onStartRecording,
  onUpdateAppt,
  onToothClick,
  incrementService,
  incrementMedicine,
  decrementMedicine,
  onSaveDraft,
  onSubmitTreatment,
  onCloseRecording,
}: QueueItemProps) {
  const sc = STATUS_COLORS[a.status] ?? { bg: "#F0F4F8", text: "#4A6080", dot: "#ccc" };
  const act = statusActions[a.status];
  const hasAlert = hasHealthAlert(a.allergies, a.conditions);

  const history = allAppointments
    .filter(x => x.patientId === a.patientId && x.id !== a.id && ["เสร็จสิ้น", "รอชำระเงิน", "ชำระเงินแล้ว"].includes(x.status))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="rounded-2xl bg-white overflow-hidden transition-all" style={{ boxShadow: "0 2px 16px rgba(26,54,93,0.08)" }}>
      {/* แถวข้อมูลหลักของคิว */}
      <div
        onClick={onToggleExpand}
        className="p-5 flex items-start gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
      >
        <div className="flex flex-col items-center justify-center flex-shrink-0">
          <div className="text-[10px] font-medium text-gray-400 mb-1">
            {a.date === todayString ? "วันนี้" : new Date(a.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
          </div>
          <div
            className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center text-white text-xs font-bold"
            style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}
          >
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
          {hasHealthAlert(undefined, a.conditions) && <p className="text-xs mt-1" style={{ color: "#E65100" }}>โรคประจำตัว: {a.conditions}</p>}
          {hasHealthAlert(a.allergies) && <p className="text-xs" style={{ color: "#E65100" }}>แพ้: {a.allergies}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: sc.bg, color: sc.text }}>
            {a.status}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            style={{ color: "#4A6080" }}
          >
            <ChevronRight size={16} className="transition-transform" style={{ transform: isExpanded ? "rotate(90deg)" : "none" }} />
          </button>
        </div>
      </div>

      {/* ส่วนขยาย: ข้อมูลสุขภาพและปุ่มดำเนินการ */}
      {isExpanded && !isRecording && (
        <div className="px-5 pb-5 border-t" style={{ borderColor: "rgba(26,54,93,0.06)" }}>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: "#4A6080" }}>โรคประจำตัว</p>
              <p className="text-sm" style={{ color: hasHealthAlert(a.conditions) ? "#E65100" : "#1A365D" }}>{a.conditions || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: "#4A6080" }}>ประวัติแพ้ยา</p>
              <p className="text-sm" style={{ color: hasHealthAlert(a.allergies) ? "#E65100" : "#1A365D" }}>{a.allergies || "-"}</p>
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

          {history.length > 0 && (
            <div className="mb-4 bg-slate-50/70 rounded-xl p-3.5 border border-slate-100">
              <p className="text-xs font-semibold mb-2.5" style={{ color: "#1A365D" }}>ประวัติการรักษาล่าสุด</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {history.slice(0, 3).map(h => {
                  const formattedHistDate = h.date
                    ? new Date(h.date).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })
                    : "-";
                  return (
                    <div key={h.id} className="text-xs p-3 bg-white rounded-xl border border-slate-200/70 flex flex-col justify-between shadow-2xs">
                      <div>
                        <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-100">
                          <span className="font-semibold" style={{ color: "#1A365D" }}>{formattedHistDate}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 font-medium" style={{ color: "#4A6080" }}>
                            {h.doctorName || "-"}
                          </span>
                        </div>
                        <p className="font-medium mb-1" style={{ color: "#1A365D" }}>
                          บริการ: <span style={{ color: "#4A6080", fontWeight: 400 }}>{h.service}</span>
                        </p>
                        {h.treatmentNotes && (
                          <div className="mt-1.5 pt-1.5 border-t border-slate-50">
                            <p className="text-[11px] font-medium text-slate-500 mb-0.5">บันทึกจากแพทย์:</p>
                            <p className="text-[11px] leading-relaxed" style={{ color: "#64748B", whiteSpace: "pre-line" }}>
                              {h.treatmentNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            {act && (
              <button
                type="button"
                onClick={() => act.next === "รอชำระเงิน" ? onStartRecording(a) : onUpdateAppt(a.id, { status: act.next })}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: act.color }}
              >
                {act.next === "รอชำระเงิน" ? <><ClipboardList size={14} /> {act.label}</> : <><Clock size={14} /> {act.label}</>}
              </button>
            )}
          </div>
        </div>
      )}

      {/* แบบฟอร์มบันทึกการรักษา (เมื่อกำลังบันทึก) */}
      {isRecording && (
        <ActiveTreatmentForm
          appointment={a}
          recordingId={a.id}
          toothData={toothData}
          extraTeeth={extraTeeth}
          isChild={isChild}
          setIsChild={setIsChild}
          patientHistoryRecords={patientHistoryRecords}
          services={services}
          products={products}
          form={form}
          setForm={setForm}
          isSubmitting={isSubmitting}
          onToothClick={onToothClick}
          incrementService={incrementService}
          incrementMedicine={incrementMedicine}
          decrementMedicine={decrementMedicine}
          onSaveDraft={onSaveDraft}
          onSubmitTreatment={onSubmitTreatment}
          onClose={onCloseRecording}
        />
      )}
    </div>
  );
}

