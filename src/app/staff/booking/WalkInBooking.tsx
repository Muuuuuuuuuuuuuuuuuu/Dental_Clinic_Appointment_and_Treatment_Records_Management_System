import React, { useState, useEffect } from "react";
import { Calendar, Clock, UserPlus, CheckCircle, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

import { Appointment, DentistInfo, ServiceInfo } from "../../shared/data";
import { getDentists, getServices, addAppointment } from "../../shared/supabaseApi";

export default function WalkInBooking() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", phone: "", service: "", doctorId: 0, day: 0, time: "" });
  const [done, setDone] = useState(false);

  const [dentists, setDentists] = useState<DentistInfo[]>([]);
  const [services, setServices] = useState<ServiceInfo[]>([]);

  useEffect(() => {
    Promise.all([getDentists(), getServices()]).then(([d, s]) => {
      setDentists(d.filter(x => x.active));
      setServices(s.filter(x => x.active));
    }).catch(console.error);
  }, []);

  const today = new Date();
  const todayN = today.getDate();
  const year = today.getFullYear();
  const month = today.getMonth();

  const ALL_TIMES = [
    { t: "09:00", booked: false }, { t: "09:30", booked: false }, { t: "10:00", booked: false }, { t: "10:30", booked: false },
    { t: "11:00", booked: true },  { t: "11:30", booked: false }, { t: "13:00", booked: false }, { t: "13:30", booked: false },
    { t: "14:00", booked: true },  { t: "14:30", booked: false }, { t: "15:00", booked: false }, { t: "15:30", booked: false },
    { t: "16:00", booked: false }, { t: "16:30", booked: false }, { t: "17:00", booked: true },  { t: "17:30", booked: false },
    { t: "18:00", booked: false }, { t: "18:30", booked: false }, { t: "19:00", booked: false }, { t: "19:30", booked: false },
  ];

  const getEstMins = (serviceName: string) => {
    if (serviceName.includes("จัดฟัน") || serviceName.includes("รากฟันเทียม")) return 60;
    if (serviceName.includes("ฟอกสีฟัน") || serviceName.includes("รักษารากฟัน")) return 45;
    return 30;
  };
  
  const estMins = form.service ? getEstMins(form.service) : 30;
  const reqSlots = Math.ceil((estMins + 15) / 30); // 15 mins buffer

  const availableTimes = ALL_TIMES.map((slot, i) => {
    if (slot.booked) return { ...slot, canBook: false };
    let canBook = true;
    for (let j = 0; j < reqSlots; j++) {
      if (i + j >= ALL_TIMES.length || ALL_TIMES[i + j].booked) {
        canBook = false;
        break;
      }
    }
    return { ...slot, canBook };
  });

  const confirm = async () => {
    const doctorName = dentists.find(d => d.id === form.doctorId)?.name ?? "";
    const newAppt: Omit<Appointment, "id"> = {
      hn: `HN${Date.now().toString().slice(-3)}`,
      patientName: form.name, patientPhone: form.phone,
      service: form.service, doctorName,
      doctorId: form.doctorId,
      date: `2025-07-${String(form.day).padStart(2, "0")}`,
      time: form.time, status: "รอรักษา",
      conditions: "ไม่ทราบ (Walk-in)", allergies: "ไม่ทราบ (Walk-in)",
    };
    try {
      await addAppointment(newAppt);
      setDone(true);
    } catch (err) {
      console.error(err);
      alert("Failed to book appointment");
    }
  };

  if (done) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#E8FFF0" }}>
          <CheckCircle size={28} style={{ color: "#22C55E" }} />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>จอง Walk-in สำเร็จ!</h2>
        <p className="text-sm mb-1" style={{ color: "#4A6080" }}>{form.name}</p>
        <p className="text-sm mb-6" style={{ color: "#4A6080" }}>{form.service} • เวลา {form.time} น.</p>
        <button onClick={() => { setStep(0); setForm({ name: "", phone: "", service: "", doctorId: 0, day: 0, time: "" }); setDone(false); }}
          className="px-6 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
          จองรายต่อไป
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>จองคิว Walk-in</h1>
        <p className="text-sm" style={{ color: "#4A6080" }}>จองคิวสำหรับคนไข้ที่มาหน้าร้าน</p>
      </div>

      <div className="max-w-2xl">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {["ข้อมูลคนไข้", "บริการ & แพทย์", "วัน-เวลา", "ยืนยัน"].map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium`}
                style={{
                  backgroundColor: i < step ? "#E8FFF0" : i === step ? "#FF8C9A" : "rgba(26,54,93,0.06)",
                  color: i < step ? "#1B7A3E" : i === step ? "white" : "#4A6080",
                }}>
                {i < step ? "✓" : i + 1}
                <span className="hidden sm:inline">{l}</span>
              </div>
              {i < 3 && <div className="w-3 h-0.5" style={{ backgroundColor: i < step ? "#22C55E" : "rgba(26,54,93,0.1)" }} />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "#4A6080" }}>ชื่อ-นามสกุล *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="ชื่อ-นามสกุลคนไข้" className="w-full px-3 py-3 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "#4A6080" }}>เบอร์โทรศัพท์ *</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="0XX-XXX-XXXX" className="w-full px-3 py-3 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: "#4A6080" }}>เลือกบริการ *</p>
                <div className="grid grid-cols-2 gap-2">
                  {services.map(s => (
                    <button key={s.id} onClick={() => setForm(f => ({ ...f, service: s.name }))}
                      className="px-3 py-2.5 rounded-xl text-xs text-left transition-all"
                      style={{
                        backgroundColor: form.service === s.name ? "#FFE8EC" : "#F0F4F8",
                        border: form.service === s.name ? "1.5px solid #FF8C9A" : "1.5px solid transparent",
                        color: "#1A365D",
                      }}>
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: "#4A6080" }}>เลือกทันตแพทย์ *</p>
                <div className="space-y-2">
                  {dentists.map(d => (
                    <button key={d.id} onClick={() => setForm(f => ({ ...f, doctorId: d.id }))}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                      style={{
                        backgroundColor: form.doctorId === d.id ? "#FFE8EC" : "#F0F4F8",
                        border: form.doctorId === d.id ? "1.5px solid #FF8C9A" : "1.5px solid transparent",
                      }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: "#FF8C9A" }}>
                        {d.name[4] ?? "ท"}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "#1A365D" }}>{d.name}</p>
                        <p className="text-xs" style={{ color: "#4A6080" }}>{d.specialty}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: "#4A6080" }}>เลือกวันที่</p>
                <div className="grid grid-cols-7 gap-1">
                  {[...Array(7)].map((_, i) => {
                    const d = todayN + i;
                    const dateDow = new Date(year, month, d).getDay();
                    const isSunday = dateDow === 0;
                    return (
                      <button key={d} disabled={isSunday} onClick={() => setForm(f => ({ ...f, day: d, time: "" }))}
                        className="aspect-square rounded-xl flex items-center justify-center text-xs font-medium transition-all"
                        style={{
                          backgroundColor: form.day === d ? "#FF8C9A" : isSunday ? "transparent" : "#F0F4F8",
                          color: form.day === d ? "white" : isSunday ? "#ccc" : "#1A365D",
                          cursor: isSunday ? "not-allowed" : "pointer"
                        }}>
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
              {form.day > 0 && (
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: "#4A6080" }}>เลือกเวลา</p>
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimes.map(({ t, booked, canBook }) => {
                      return (
                        <button key={t} disabled={!canBook} onClick={() => setForm(f => ({ ...f, time: t }))}
                          className="py-2.5 rounded-xl text-sm font-medium transition-all"
                          style={{
                            backgroundColor: form.time === t ? "#FF8C9A" : booked ? "#F0F4F8" : "white",
                            color: form.time === t ? "white" : !canBook ? "#ccc" : "#1A365D",
                            border: form.time === t ? "none" : booked ? "1px solid transparent" : "1.5px solid rgba(26,54,93,0.12)",
                            cursor: !canBook ? "not-allowed" : "pointer",
                            opacity: !canBook && !booked ? 0.5 : 1
                          }}>
                          {t}
                          {booked && <div className="text-xs opacity-60">จองแล้ว</div>}
                          {!booked && !canBook && <div className="text-xs opacity-60">เวลาไม่พอ</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="font-semibold mb-4" style={{ color: "#1A365D" }}>ยืนยันการจอง Walk-in</h3>
              {[
                ["คนไข้", form.name],
                ["เบอร์โทร", form.phone],
                ["บริการ", form.service],
                ["ทันตแพทย์", dentists.find(d => d.id === form.doctorId)?.name ?? "-"],
                ["วัน-เวลา", `10 กรกฎาคม 2568 เวลา ${form.time} น.`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2.5 text-sm" style={{ borderBottom: "1px solid rgba(26,54,93,0.06)" }}>
                  <span style={{ color: "#4A6080" }}>{k}</span>
                  <span className="font-medium" style={{ color: "#1A365D" }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="px-5 py-2.5 rounded-xl text-sm font-medium"
                style={{ border: "1.5px solid rgba(26,54,93,0.2)", color: "#4A6080" }}>
                ย้อนกลับ
              </button>
            )}
            <button
              onClick={() => step < 3 ? setStep(s => s + 1) : confirm()}
              disabled={
                (step === 0 && (!form.name || !form.phone)) ||
                (step === 1 && (!form.service || !form.doctorId)) ||
                (step === 2 && (!form.day || !form.time))
              }
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
              style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
              {step < 3 ? <><span>ถัดไป</span><ArrowRight size={14} /></> : "ยืนยันการจอง"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
