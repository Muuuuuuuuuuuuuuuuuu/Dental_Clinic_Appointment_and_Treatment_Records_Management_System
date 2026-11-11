import React from "react";
import { CheckCircle, ChevronRight, FileText, Send } from "lucide-react";
import { Appointment, ServiceInfo } from "@/app/shared/data";
import Odontogram, { ToothStatus } from "../Odontogram";
import { SupernumeraryTooth } from "../ToothGeometry";
import { TreatmentFormState } from "../types";

interface ActiveTreatmentFormProps {
  appointment: Appointment;
  recordingId: number;
  toothData: Record<number | string, ToothStatus>;
  extraTeeth: SupernumeraryTooth[];
  isChild: boolean;
  setIsChild: (val: boolean) => void;
  patientHistoryRecords: any[];
  services: ServiceInfo[];
  products: any[];
  form: TreatmentFormState;
  setForm: React.Dispatch<React.SetStateAction<TreatmentFormState>>;
  isSubmitting: boolean;
  onToothClick: (tooth: number | string, status?: ToothStatus) => void;
  onAddExtraTooth: (tooth: SupernumeraryTooth) => void;
  onRemoveExtraTooth: (id: string) => void;
  onSaveToothManager: (
    updatedToothData: Record<number | string, ToothStatus>,
    updatedExtraTeeth: SupernumeraryTooth[]
  ) => void;
  incrementService: (svc: any, tooth?: number | string) => void;
  incrementMedicine: (prod: any) => void;
  decrementMedicine: (prodId: number, e: React.MouseEvent) => void;
  onSaveDraft: (appt: Appointment) => void;
  onSubmitTreatment: (appt: Appointment) => void;
  onClose: () => void;
}

export default function ActiveTreatmentForm({
  appointment: a,
  recordingId,
  toothData,
  extraTeeth,
  isChild,
  setIsChild,
  patientHistoryRecords,
  services,
  products,
  form,
  setForm,
  isSubmitting,
  onToothClick,
  onAddExtraTooth,
  onRemoveExtraTooth,
  onSaveToothManager,
  incrementService,
  incrementMedicine,
  decrementMedicine,
  onSaveDraft,
  onSubmitTreatment,
  onClose,
}: ActiveTreatmentFormProps) {
  const servicesCost = form.services.reduce((sum, s) => sum + ((s.price ?? 0) * s.qty), 0);
  const medicinesCost = form.medicines.reduce((sum, m) => sum + ((m.price ?? 0) * m.qty), 0);
  const totalBill = servicesCost + medicinesCost;

  return (
    <div className="px-5 pb-3 border-t" style={{ borderColor: "rgba(26,54,93,0.06)" }}>
      <div className="flex items-center justify-between py-2">
        <p className="text-sm font-semibold" style={{ color: "#1A365D" }}>
          บันทึกการรักษา — {a.patientName}
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div>
          <Odontogram
            key={`odontogram-${recordingId}`}
            toothData={toothData}
            onToothClick={onToothClick}
            isChild={isChild}
            setIsChild={setIsChild}
            extraTeeth={extraTeeth}
            historyRecords={patientHistoryRecords}
            patientName={a.patientName}
            onAddExtraTooth={onAddExtraTooth}
            onRemoveExtraTooth={onRemoveExtraTooth}
            onSaveToothManager={onSaveToothManager}
          />
        </div>

        <div className="space-y-3">
          {/* หัตถการทั่วไป */}
          <details className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden group">
            <summary className="text-[12px] font-bold p-3 cursor-pointer hover:bg-slate-100 flex items-center justify-between text-slate-700">
              <span>หัตถการทั่วไป (ทั้งปาก / ไม่ระบุซี่)</span>
              <ChevronRight size={16} className="text-slate-400 group-open:rotate-90 transition-transform" />
            </summary>
            <div className="p-3 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                {services.filter(s => s.active && s.applyTo !== 'TOOTH').map(s => {
                  const existing = form.services.find(x => x.id === s.id);
                  const isSelected = !!existing;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => incrementService(s)}
                      className="flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-lg text-[11px] text-left transition-all leading-tight relative"
                      style={{
                        backgroundColor: isSelected ? "#FFE8EC" : "#F0F4F8",
                        color: isSelected ? "#1A365D" : "#4A6080",
                        border: isSelected ? "1.5px solid #FF8C9A" : "1.5px solid transparent",
                      }}
                    >
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

          {/* สั่งจ่ายยา */}
          <details className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden group">
            <summary className="text-[12px] font-bold p-3 cursor-pointer hover:bg-slate-100 flex items-center justify-between text-slate-700">
              <span>สั่งจ่ายยา</span>
              <ChevronRight size={16} className="text-slate-400 group-open:rotate-90 transition-transform" />
            </summary>
            <div className="p-3 pt-0 border-t border-slate-100">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                {products.map(p => {
                  const existing = form.medicines.find(x => x.id === p.id);
                  const isSelected = !!existing;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => incrementMedicine(p)}
                      className="flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-lg text-[11px] text-left transition-all leading-tight relative"
                      style={{
                        backgroundColor: isSelected ? "#E0F2FE" : "#F0F4F8",
                        color: isSelected ? "#0369A1" : "#4A6080",
                        border: isSelected ? "1.5px solid #7DD3FC" : "1.5px solid transparent",
                      }}
                    >
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
                <div className="text-center py-2 text-xs text-gray-500">ไม่พบรายการเวชภัณฑ์ในระบบ</div>
              )}
            </div>

            {/* ช่องระบุวิธีใช้ยา */}
            {form.medicines.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 space-y-2">
                <label className="text-[10px] font-bold text-blue-800 uppercase tracking-wide flex items-center gap-1.5">
                  <span>วิธีใช้ยา</span>
                </label>
                {form.medicines.map(m => (
                  <div key={m.id} className="flex flex-col gap-1 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                    <span className="text-xs font-semibold text-slate-700">{m.name}</span>
                    <input
                      type="text"
                      value={m.instruction || ""}
                      onChange={(e) => {
                        setForm(f => ({
                          ...f,
                          medicines: f.medicines.map(x => x.id === m.id ? { ...x, instruction: e.target.value } : x)
                        }));
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
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              placeholder="อธิบายขั้นตอนการรักษาที่ดำเนินการ..."
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
              style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
            />
          </div>

          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>คำแนะนำสำหรับคนไข้</label>
            <textarea
              value={form.recommendations}
              onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
              rows={1}
              placeholder="คำแนะนำการดูแลหลังรักษา..."
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
              style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
            />
          </div>

          {/* สรุปยอดค่าใช้จ่ายเบื้องต้น */}
          {totalBill > 0 && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-2 flex items-center justify-between shadow-sm">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">สรุปค่าใช้จ่ายเบื้องต้น</span>
                <div className="flex items-center gap-2 text-xs text-emerald-700 mt-1">
                  {servicesCost > 0 && <span>ค่าหัตถการ ({servicesCost.toLocaleString()} บ.)</span>}
                  {medicinesCost > 0 && <span>ค่ายา ({medicinesCost.toLocaleString()} บ.)</span>}
                </div>
              </div>
              <div className="text-lg font-black text-emerald-700">
                ฿{totalBill.toLocaleString()}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1 flex-wrap">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onSaveDraft(a)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-300 shadow-2xs disabled:opacity-50"
              title="บันทึกข้อมูลการรักษาและผังฟันลงฐานข้อมูลทันที (เก็บเป็นร่าง ยังไม่ส่งไปแคชเชียร์)"
            >
              <FileText size={14} className="text-slate-500" />
              <span>บันทึกร่าง</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onSubmitTreatment(a)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shadow-sm hover:shadow disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}
            >
              <Send size={14} /> {isSubmitting ? "กำลังส่งข้อมูล..." : "ส่งข้อมูลให้พนักงาน (รอชำระเงิน)"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium"
              style={{ border: "1.5px solid rgba(26,54,93,0.2)", color: "#4A6080" }}
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

