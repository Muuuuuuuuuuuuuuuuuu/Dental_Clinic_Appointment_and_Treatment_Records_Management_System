import React, { useState, useEffect, useMemo } from "react";
import { Search, FileText, CheckCircle, CreditCard, X, Smile, Printer, CalendarPlus, ChevronRight, Banknote, Smartphone, Receipt } from "lucide-react";

import { Appointment, STATUS_COLORS, AppointmentStatus } from "../../shared/data";
import { supabase, processPaymentApi, addAppointment, getClinicTimeSlots, TimeSlotStatus } from "../../shared/supabaseApi";
import { useRealtimeAppointments } from "../../shared/useRealtimeAppointments";

export default function PaymentView({ 
  appointments: initialAppointments,
  onUpdateAppt
}: { 
  appointments?: Appointment[];
  onUpdateAppt?: (id: number, updates: Partial<Appointment>) => void;
}) {
  const { appointments, refetch: fetchAppointments, setAppointments } = useRealtimeAppointments();
  const [loading, setLoading] = useState(!initialAppointments);

  // Selected patient for payment
  const [selectedApptId, setSelectedApptId] = useState<number | null>(null);
  
  // Payment Dashboard States
  const [baseCost, setBaseCost] = useState<string>("");
  const [discount, setDiscount] = useState<string>("0");
  const [paymentMethod, setPaymentMethod] = useState<string>("เงินสด");

  // Installment info
  const [installmentInfo, setInstallmentInfo] = useState<{ id: number; amount: number; installment_number: number } | null>(null);

  // Modals
  const [receiptData, setReceiptData] = useState<any | null>(null);
  const [followUp, setFollowUp] = useState<Appointment | null>(null);
  const [isOpenTicket, setIsOpenTicket] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [isBound, setIsBound] = useState(false);
  
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlotStatus[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    if (!followUp || isOpenTicket || !followUpDate) {
      setTimeSlots([]);
      return;
    }
    setIsLoadingSlots(true);
    getClinicTimeSlots(followUpDate, followUp.serviceId || 1, isBound ? followUp.doctorId : undefined, followUp.patientId).then(slots => {
      setTimeSlots(slots);
    }).finally(() => {
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
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  // Payable: Any appointment with status "รอชำระเงิน"
  const payable = appointments.filter(a => a.status === "รอชำระเงิน");
  
  // Paid today: Appointments with status "เสร็จสิ้น" AND date is today
  const paid = appointments.filter(a => a.status === "เสร็จสิ้น" && a.date === todayStr);

  const selectedAppt = appointments.find(a => a.id === selectedApptId);

  // Reset dashboard when selecting new patient
  useEffect(() => {
    if (!selectedAppt) return;
    setDiscount("0");
    setPaymentMethod("เงินสด");
    setInstallmentInfo(null);

    // Try to get installment amount for this patient's plan
    const fetchInstallment = async () => {
      try {
        const { data: apptData } = await supabase
          .from('appointment')
          .select('patient_id')
          .eq('appointment_id', selectedAppt.id)
          .maybeSingle();

        if (!apptData?.patient_id) {
          setBaseCost(String(selectedAppt.cost || ""));
          return;
        }

        const { data: plans } = await supabase
          .from('treatment_plan')
          .select('plan_id')
          .eq('patient_id', apptData.patient_id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!plans || plans.length === 0) {
          setBaseCost(String(selectedAppt.cost || ""));
          return;
        }

        const { data: insts } = await supabase
          .from('installment')
          .select('installment_id, installment_number, amount')
          .eq('plan_id', plans[0].plan_id)
          .eq('paid', false)
          .order('installment_number')
          .limit(1);

        if (insts && insts.length > 0) {
          setInstallmentInfo({ id: insts[0].installment_id, amount: Number(insts[0].amount), installment_number: insts[0].installment_number });
          setBaseCost(String(insts[0].amount));
        } else {
          setBaseCost(String(selectedAppt.cost || "0"));
        }
      } catch (err) {
        console.error('fetchInstallment error:', err);
        setBaseCost(String(selectedAppt.cost || ""));
      }
    };

    fetchInstallment();
  }, [selectedApptId]);

  const netTotal = useMemo(() => {
    const base = parseInt(baseCost || "0", 10);
    const disc = parseInt(discount || "0", 10);
    return Math.max(0, base - disc);
  }, [baseCost, discount]);

  const processPayment = async () => {
    if (!selectedAppt) return;
    
    try {
      await processPaymentApi(selectedAppt.id, netTotal, paymentMethod);
      
      const newApptData = { status: "เสร็จสิ้น" as AppointmentStatus, cost: netTotal, paid: true };
      
      setAppointments(apps => apps.map(a => a.id === selectedAppt.id ? { ...a, ...newApptData } : a));
      
      if (onUpdateAppt) {
        onUpdateAppt(selectedAppt.id, newApptData);
      }
      
      // Prepare receipt data
      setReceiptData({
        ...selectedAppt,
        baseCost: parseInt(baseCost || "0", 10),
        discount: parseInt(discount || "0", 10),
        netTotal,
        paymentMethod
      });
      
      setSelectedApptId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to process payment");
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      
      {/* LEFT PANEL: Queue List */}
      <div className="w-1/3 flex flex-col min-w-[320px] bg-white rounded-3xl p-5 border border-gray-100" style={{ boxShadow: "0 4px 20px rgba(26,54,93,0.03)" }}>
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>รายการชำระเงิน</h2>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
          
          {/* Payable Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold" style={{ color: "#4A6080" }}>รอชำระเงิน</h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FFE8EC", color: "#FF6B7E" }}>
                {payable.length}
              </span>
            </div>
            
            {payable.length === 0 ? (
              <div className="text-center py-8 rounded-xl border border-dashed border-gray-200">
                <CreditCard size={24} className="mx-auto mb-2 opacity-20" style={{ color: "#1A365D" }} />
                <p className="text-xs" style={{ color: "#94A3B8" }}>ไม่มีรายการรอชำระเงิน</p>
              </div>
            ) : (
              <div className="space-y-2">
                {payable.map(a => (
                  <button 
                    key={a.id} 
                    onClick={() => setSelectedApptId(a.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all border ${selectedApptId === a.id ? 'border-orange-400 bg-orange-50' : 'border-gray-100 bg-gray-50 hover:border-gray-300'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-sm" style={{ color: "#1A365D" }}>{a.patientName}</p>
                      <ChevronRight size={16} style={{ color: selectedApptId === a.id ? "#F57F17" : "#CBD5E1" }} />
                    </div>
                    <p className="text-xs truncate" style={{ color: "#4A6080" }}>{a.service}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded text-white bg-gradient-to-r from-orange-400 to-orange-500">
                        รอชำระเงิน
                      </span>
                      <span className="text-[10px]" style={{ color: "#94A3B8" }}>เวลา {a.time} น.</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Paid Today Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold" style={{ color: "#4A6080" }}>ชำระแล้ววันนี้</h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#E8FFF0", color: "#1B7A3E" }}>
                {paid.length}
              </span>
            </div>
            
            {paid.length === 0 ? (
              <div className="text-center py-6 text-xs" style={{ color: "#94A3B8" }}>ยังไม่มีรายการชำระเงินวันนี้</div>
            ) : (
              <div className="space-y-2">
                {paid.map(a => (
                  <div key={a.id} className="w-full text-left p-3 rounded-xl border border-gray-100 bg-white">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-sm" style={{ color: "#1A365D" }}>{a.patientName}</p>
                      <span className="font-bold text-sm" style={{ color: "#1B7A3E" }}>฿{(a.cost ?? 0).toLocaleString()}</span>
                    </div>
                    <p className="text-xs truncate mb-2" style={{ color: "#4A6080" }}>{a.service}</p>
                    <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-green-50 text-green-700 w-fit">
                      <CheckCircle size={10} /> ชำระแล้ว
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
        
        {/* Daily Summary */}
        <div className="pt-4 mt-4" style={{ borderTop: "1px solid rgba(26,54,93,0.06)" }}>
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
            <span className="font-semibold text-xs" style={{ color: "#4A6080" }}>รวมรายได้วันนี้</span>
            <span className="font-bold text-lg" style={{ color: "#1B7A3E" }}>
              ฿{paid.reduce((s, a) => s + (a.cost ?? 0), 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Payment Dashboard */}
      <div className="flex-1 bg-white rounded-3xl p-8 border border-gray-100 flex flex-col relative overflow-y-auto" style={{ boxShadow: "0 4px 20px rgba(26,54,93,0.03)" }}>
        {!selectedAppt ? (
          <div className="m-auto text-center">
            <Receipt size={64} className="mx-auto mb-4 opacity-10" style={{ color: "#1A365D" }} />
            <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>เลือกลูกค้าเพื่อรับชำระเงิน</h2>
            <p className="text-sm" style={{ color: "#4A6080" }}>คลิกที่รายชื่อลูกค้าจากเมนูด้านซ้ายเพื่อเริ่มต้นการออกบิล</p>
          </div>
        ) : (
          <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
            {/* Header */}
            <div className="flex justify-between items-start mb-4 pb-3" style={{ borderBottom: "1px dashed rgba(26,54,93,0.1)" }}>
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ color: "#1A365D" }}>{selectedAppt.patientName}</h2>
                <p className="text-xs" style={{ color: "#4A6080" }}>HN: {selectedAppt.hn || "HN-XXXX"}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 inline-block mb-1">สถานะ: รอชำระเงิน</p>
                <p className="text-xs font-medium" style={{ color: "#1A365D" }}>ทันตแพทย์: ทพ. {selectedAppt.doctorName}</p>
              </div>
            </div>

            {/* Treatment Summary */}
            <div className="mb-4">
              <h3 className="text-xs font-bold mb-2" style={{ color: "#4A6080" }}>ใบสรุปการรักษาจากแพทย์</h3>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                <div>
                  <p className="font-semibold text-sm mb-2" style={{ color: "#1A365D" }}>หัตถการ / บริการที่ทำ</p>
                  {(selectedAppt.detailedServices && selectedAppt.detailedServices.length > 0) ? (
                    <div className="space-y-1.5">
                      {selectedAppt.detailedServices.map((s, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm py-1.5 px-3 rounded-lg bg-white border border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="font-medium" style={{ color: "#1D6FA4" }}>{s.name}</span>
                            {s.locationCode && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">ซี่ {s.locationCode}</span>}
                            {s.qty > 1 && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">x{s.qty}</span>}
                          </div>
                          <span className="font-semibold" style={{ color: "#1A365D" }}>฿{(s.price * s.qty).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (selectedAppt.treatmentServices && selectedAppt.treatmentServices.length > 0) ? (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedAppt.treatmentServices.map(s => (
                        <span key={s} className="text-[11px] px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "white", color: "#1D6FA4", border: "1px solid #E8F4FF" }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: "#4A6080" }}>{selectedAppt.service}</p>
                  )}
                </div>
                
                {selectedAppt.treatmentNotes && (
                  <div>
                    <p className="font-semibold text-xs mb-1" style={{ color: "#1A365D" }}>บันทึกหัตถการ:</p>
                    <div className="text-xs p-2.5 bg-white rounded-lg border border-gray-100" style={{ color: "#4A6080" }}>
                      {selectedAppt.treatmentNotes}
                    </div>
                  </div>
                )}
                
                {selectedAppt.recommendations && (
                  <div>
                    <p className="font-semibold text-xs mb-1 text-orange-600">คำแนะนำสำหรับคนไข้:</p>
                    <div className="text-xs p-2.5 bg-orange-50 rounded-lg border border-orange-100 text-orange-800">
                      {selectedAppt.recommendations}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Billing Calculator */}
            <div className="mb-4 space-y-2">
              <h3 className="text-xs font-bold mb-1" style={{ color: "#4A6080" }}>สรุปยอดค่าใช้จ่าย</h3>
              
              {/* Installment Badge */}
              {installmentInfo && (
                <div className="flex items-center justify-between text-xs bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-1">
                  <span className="font-semibold text-blue-800">งวดที่ {installmentInfo.installment_number} (ค่างวดจัดฟัน)</span>
                  <span className="font-bold text-blue-700">฿{installmentInfo.amount.toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: "#1A365D" }}>ค่ารักษา (Base Cost)</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold" style={{ color: "#4A6080" }}>฿</span>
                  <input
                    type="number"
                    value={baseCost}
                    onChange={e => setBaseCost(e.target.value)}
                    placeholder="0"
                    className="w-28 px-2 py-1.5 rounded-lg text-right text-sm font-bold outline-none border border-gray-200 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-red-500">ส่วนลด (Discount)</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-red-500">- ฿</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={e => setDiscount(e.target.value)}
                    placeholder="0"
                    className="w-28 px-2 py-1.5 rounded-lg text-right text-sm font-bold text-red-500 outline-none border border-red-100 bg-red-50 focus:border-red-400 transition-colors"
                  />
                </div>
              </div>
              
              <div className="pt-2 flex items-center justify-between" style={{ borderTop: "1px dashed rgba(26,54,93,0.1)" }}>
                <span className="text-sm font-bold" style={{ color: "#1A365D" }}>ยอดชำระสุทธิ (Net Total)</span>
                <span className="text-2xl font-black" style={{ color: "#1B7A3E" }}>฿{netTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-auto">
              <h3 className="text-xs font-bold mb-2" style={{ color: "#4A6080" }}>ช่องทางการชำระเงิน</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "เงินสด", icon: Banknote, label: "เงินสด", bg: "#F0Fdf4", border: "#bbf7d0", color: "#166534" },
                  { id: "โอนเงิน", icon: Smartphone, label: "โอนเงิน / PromptPay", bg: "#eff6ff", border: "#bfdbfe", color: "#1e3a8a" },
                  { id: "บัตรเครดิต", icon: CreditCard, label: "บัตรเครดิต", bg: "#fdf4ff", border: "#fbcfe8", color: "#831843" },
                ].map(method => {
                  const isSelected = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${isSelected ? 'shadow-sm scale-105' : 'hover:bg-gray-50'}`}
                      style={{ 
                        borderColor: isSelected ? method.color : "transparent",
                        backgroundColor: isSelected ? method.bg : "#F8FAFC"
                      }}
                    >
                      <method.icon size={20} className="mb-1" style={{ color: isSelected ? method.color : "#94A3B8" }} />
                      <span className="text-xs font-semibold" style={{ color: isSelected ? method.color : "#64748B" }}>{method.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setSelectedApptId(null)}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:bg-gray-100"
                style={{ color: "#4A6080" }}>
                ยกเลิก
              </button>
              <button
                onClick={processPayment}
                disabled={netTotal < 0}
                className="flex-[2] py-3 rounded-xl font-bold text-white text-base transition-all hover:opacity-90 flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg,#22C55E,#16A34A)" }}>
                <CheckCircle size={18} /> รับชำระเงิน ฿{netTotal.toLocaleString()}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(26,54,93,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden relative">
            <div className="h-2 w-full" style={{ background: "linear-gradient(90deg, #1A365D, #1D6FA4)" }}></div>
            <div className="p-8 pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#E8F4FF" }}>
                    <Smile size={20} style={{ color: "#1D6FA4" }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold leading-tight" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>คลินิกสุภัทร</h2>
                    <p className="text-[10px]" style={{ color: "#4A6080" }}>ใบเสร็จรับเงิน #{receiptData.id}</p>
                  </div>
                </div>
                <button onClick={() => setReceiptData(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} style={{ color: "#4A6080" }} /></button>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-xs text-center mb-1" style={{ color: "#4A6080" }}>ชำระเงินสำเร็จ</p>
                <p className="text-3xl font-black text-center" style={{ color: "#1B7A3E" }}>฿{receiptData.netTotal.toLocaleString()}</p>
                <div className="flex items-center justify-center gap-1 mt-2 text-xs font-bold px-2 py-1 bg-white rounded-full mx-auto w-fit border border-gray-200" style={{ color: "#1A365D" }}>
                  {receiptData.paymentMethod === "เงินสด" && <Banknote size={12} />}
                  {receiptData.paymentMethod === "โอนเงิน" && <Smartphone size={12} />}
                  {receiptData.paymentMethod === "บัตรเครดิต" && <CreditCard size={12} />}
                  ชำระผ่าน{receiptData.paymentMethod}
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {[
                  ["คนไข้", receiptData.patientName],
                  ["บริการ", receiptData.service],
                  ["ทันตแพทย์", receiptData.doctorName],
                  ["วันที่", new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs border-b border-dashed border-gray-200 pb-2">
                    <span style={{ color: "#64748B" }}>{k}</span>
                    <span className="font-semibold text-right max-w-[180px] truncate" style={{ color: "#1A365D" }}>{v}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 mb-6">
                <div className="flex justify-between text-xs">
                  <span style={{ color: "#64748B" }}>ค่ารักษา (Base)</span>
                  <span style={{ color: "#1A365D" }}>฿{receiptData.baseCost.toLocaleString()}</span>
                </div>
                {receiptData.discount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-red-500">ส่วนลด (Discount)</span>
                    <span className="text-red-500">- ฿{receiptData.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200 mt-2">
                  <span style={{ color: "#1A365D" }}>ยอดรวมสุทธิ</span>
                  <span style={{ color: "#1B7A3E" }}>฿{receiptData.netTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => { 
                    setFollowUp(receiptData); 
                    setReceiptData(null); 
                    setIsOpenTicket(false); 
                    setShowLink(false); 
                    setIsBound(false); 
                    setFollowUpDate("");
                    setFollowUpTime("");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                  style={{ backgroundColor: "#E8F4FF", color: "#1D6FA4" }}>
                  <CalendarPlus size={14} /> นัดครั้งถัดไป
                </button>
                <button onClick={() => setReceiptData(null)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 shadow-md"
                  style={{ backgroundColor: "#1A365D" }}>
                  <Printer size={14} /> พิมพ์ใบเสร็จ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto Follow-up Booking Modal */}
      {followUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(26,54,93,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden relative">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>สร้างนัดหมายครั้งถัดไป</h2>
                <button onClick={() => setFollowUp(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} style={{ color: "#4A6080" }} /></button>
              </div>
              
              {showLink ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#E8FFF0", color: "#22C55E" }}>
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: "#1A365D" }}>สร้างใบนัดแบบเปิดสำเร็จ</h3>
                  <p className="text-sm mb-6" style={{ color: "#4A6080" }}>
                    ระบบได้บันทึก {isBound ? "(พร้อมตั้งเป็นหมอประจำเคส) " : ""}และสร้างลิงก์สำหรับเลือกวันเวลาแล้ว
                  </p>
                  <div className="p-3 bg-gray-50 border rounded-xl flex items-center justify-between mb-6">
                    <span className="text-xs text-gray-500 truncate mr-3">https://suphat.clinic/booking?followUp=123</span>
                    <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90" style={{ backgroundColor: "#1D6FA4" }}>
                      คัดลอกลิงก์
                    </button>
                  </div>
                  <button onClick={() => setFollowUp(null)} className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90" style={{ backgroundColor: "#1A365D" }}>
                    ปิดหน้าต่าง
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                    <p className="text-xs mb-1" style={{ color: "#4A6080" }}>สำหรับคนไข้:</p>
                    <p className="font-bold text-base" style={{ color: "#1A365D" }}>{followUp.patientName}</p>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    {/* Case Binding */}
                    <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border-2 transition-all" style={{ backgroundColor: isBound ? "#F0Fdf4" : "white", borderColor: isBound ? "#22C55E" : "#E2E8F0" }}>
                      <input type="checkbox" checked={isBound} onChange={e => setIsBound(e.target.checked)} className="w-4 h-4 rounded mt-0.5" />
                      <div>
                        <span className="text-sm font-bold block" style={{ color: "#1A365D" }}>ตั้ง {followUp.doctorName} เป็นแพทย์ประจำเคส</span>
                        <span className="text-xs text-gray-500">คนไข้จะได้คิวเฉพาะวันที่หมอท่านนี้เข้าเวรเท่านั้น</span>
                      </div>
                    </label>

                    <div>
                      <label className="text-xs font-bold block mb-1" style={{ color: "#4A6080" }}>บริการที่ต้องการนัด</label>
                      <input 
                        value={followUp.service} 
                        onChange={e => setFollowUp({...followUp, service: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none border border-gray-200 bg-white text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                      />
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-3 cursor-pointer mb-4 p-3 rounded-xl bg-gray-50 border border-gray-200">
                        <input type="checkbox" checked={isOpenTicket} onChange={e => setIsOpenTicket(e.target.checked)} className="w-4 h-4 rounded" />
                        <span className="text-sm font-bold" style={{ color: "#1A365D" }}>สร้างเป็น "ใบนัดแบบเปิด" (รอคนไข้ระบุวันทีหลัง)</span>
                      </label>

                      {!isOpenTicket && (
                        <div className="grid grid-cols-1 gap-3 p-4 rounded-xl border border-gray-200 bg-white">
                          <div>
                            <label className="text-xs font-bold block mb-1" style={{ color: "#4A6080" }}>วันที่นัด</label>
                            <input type="date" value={followUpDate} onChange={e => { setFollowUpDate(e.target.value); setFollowUpTime(''); }} className="w-full px-3 py-2 rounded-lg text-sm outline-none border border-gray-200" style={{ color: "#1A365D" }} />
                          </div>
                          {followUpDate && (
                            <div>
                              <label className="text-xs font-bold block mb-2" style={{ color: "#4A6080" }}>เวลาที่ว่าง</label>
                              {isLoadingSlots ? (
                                <div className="text-xs text-center py-4 text-gray-500">กำลังตรวจสอบคิวว่าง...</div>
                              ) : timeSlots.length > 0 ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                                  {timeSlots.map((s, i) => {
                                    const isAvail = s.status === 'Available';
                                    return (
                                      <button key={i}
                                        disabled={!isAvail}
                                        onClick={() => setFollowUpTime(s.time)}
                                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center border-2 transition-all ${
                                          followUpTime === s.time ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" :
                                          !isAvail ? "border-gray-100 bg-gray-50 text-gray-400 opacity-60 cursor-not-allowed" :
                                          "border-transparent bg-gray-100 text-[#4A6080] hover:bg-blue-50 hover:text-blue-600"
                                        }`}>
                                        {s.time}
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-xs text-center py-4 text-red-500 bg-red-50 rounded-lg border border-red-100">ไม่มีคิวว่างในวันนี้ หรือหมอไม่ได้เข้าเวร</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setFollowUp(null)}
                      disabled={isSubmitting}
                      className="w-1/3 py-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all text-sm disabled:opacity-50">
                      ยกเลิก
                    </button>
                    <button onClick={async () => {
                        if (!isOpenTicket && (!followUpDate || !followUpTime)) {
                          alert('กรุณาระบุวันและเวลา หรือเลือกใบนัดแบบเปิด');
                          return;
                        }
                        setIsSubmitting(true);
                        try {
                          await addAppointment({
                            patientId: followUp.patientId,
                            hn: '',
                            patientName: followUp.patientName,
                            patientPhone: '',
                            service: followUp.service,
                            serviceId: followUp.serviceId || 1, // Fallback if edited
                            doctorName: isBound ? followUp.doctorName : '',
                            doctorId: isBound ? followUp.doctorId : undefined,
                            date: isOpenTicket ? '' : followUpDate,
                            time: isOpenTicket ? '' : followUpTime,
                            status: isOpenTicket ? 'รอการยืนยัน' : 'ยืนยันการจอง',
                            source: 'doctor',
                            note: isBound ? `แพทย์ประจำเคส: ${followUp.doctorName}` : ''
                          } as any);
                          
                          if (isOpenTicket) {
                            setShowLink(true);
                          } else {
                            setFollowUp(null);
                            alert('สร้างนัดหมายครั้งถัดไปสำเร็จ');
                          }
                        } catch (err: any) {
                          alert(err.message || 'เกิดข้อผิดพลาดในการสร้างนัดหมาย');
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                      disabled={isSubmitting}
                      className="w-2/3 py-4 rounded-xl font-bold text-white text-base transition-all hover:opacity-90 shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg,#1D6FA4,#1A365D)" }}>
                      {isSubmitting ? "กำลังดำเนินการ..." : (isOpenTicket ? "สร้างใบนัดแบบเปิด & รับลิงก์" : "ยืนยันการนัดหมาย")}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
