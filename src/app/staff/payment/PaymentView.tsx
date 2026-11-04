import React, { useState, useEffect, useMemo } from "react";
import { Search, FileText, CheckCircle, CreditCard, X, Smile, Printer, CalendarPlus, ChevronRight, Banknote, Smartphone, Receipt, AlertTriangle, Package } from "lucide-react";

import { Appointment, STATUS_COLORS, AppointmentStatus, Product } from "../../shared/data";
import { supabase, addAppointment, getClinicTimeSlots, TimeSlotStatus, getServices } from "../../shared/supabaseApi"; 
import { getProducts, processPaymentApi } from "../../shared/api/treatmentApi";
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

  // คนไข้ที่เลือกเพื่อรับชำระเงิน
  const [selectedApptId, setSelectedApptId] = useState<number | null>(null);
  
  // สถานะหน้าจอรับชำระเงิน
  const [baseCost, setBaseCost] = useState<string>("");
  const [discount, setDiscount] = useState<string>("0");
  const [paymentMethod, setPaymentMethod] = useState<string>("เงินสด");

  // สถานะการคำนวณราคาและส่วนลด
  const [servicesData, setServicesData] = useState<Record<number, any>>({});
  const [adjustedPrices, setAdjustedPrices] = useState<Record<string, string>>({});
  const [adjustedQuantities, setAdjustedQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    getProducts().then(prods => setAllProducts(prods || []));
    getServices().then(data => {
      const map: Record<number, any> = {};
      data.forEach((s: any) => { map[s.service_id || s.id] = s; });
      setServicesData(map);
    });
  }, []);


  const [hasFutureAppointment, setHasFutureAppointment] = useState<boolean>(false);

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
  const [extraProducts, setExtraProducts] = useState<{product: Product, qty: number}[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showProductSelect, setShowProductSelect] = useState(false);

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

    
      // รีเซ็ตข้อมูลหน้าจอเมื่อเลือกคนไข้รายใหม่
      useEffect(() => {
        if (!selectedAppt) return;
        setDiscount("0");
        setPaymentMethod("เงินสด");
        // ตั้งค่าราคาเริ่มต้นจากรายการหัตถการที่แพทย์บันทึก
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

        if (selectedAppt.patientId) {

        import('../../shared/supabaseApi').then(({ getPatientAppointments }) => {
          getPatientAppointments(selectedAppt.patientId!).then(appts => {
            // Check if there are any appointments in the future or "open tickets" (รอการยืนยัน)
            const today = new Date().toISOString().split('T')[0];
            const future = appts.filter(a => 
              a.id !== selectedAppt.id && 
              (a.date > today || (!a.date && (a.status === 'ยืนยันการจอง' || a.status === 'รอการยืนยัน')))
            );
            setHasFutureAppointment(future.length > 0);
          });
        });
      }

      // ดึงยอดค่าบริการจากข้อมูลการรักษาโดยตรง
      // กำหนดยอดค่าบริการเริ่มต้น
    }, [selectedApptId]);

  
  const totalBaseCost = useMemo(() => {
    let srvTotal = parseInt(baseCost || "0", 10);
    if (selectedAppt && selectedAppt.detailedServices) {
      srvTotal = selectedAppt.detailedServices.reduce((sum: number, s: any, idx: number) => {
        const key = `${s.serviceId}-${idx}`;
        const priceStr = adjustedPrices[key];
        const price = priceStr !== undefined ? (parseInt(priceStr, 10) || 0) : s.price;
        const qty = adjustedQuantities[key] !== undefined ? adjustedQuantities[key] : s.qty;
        return sum + (price * qty);
      }, 0);
    }
    const extraTotal = extraProducts.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
    return srvTotal + extraTotal;
  }, [selectedAppt, adjustedPrices, adjustedQuantities, baseCost, extraProducts]);

  const netTotal = useMemo(() => {
    const disc = parseInt(discount || "0", 10);
    return Math.max(0, totalBaseCost - disc);
  }, [totalBaseCost, discount]);


  
  
  const handleQtyChange = (key: string, newQty: number) => {
    if (newQty < 1) return;
    setAdjustedQuantities(prev => ({ ...prev, [key]: newQty }));
  };

  const handlePriceChange = (key: string, value: string, srvData: any) => {
    // อนุญาตให้ลบตัวเลขจนว่างได้ขณะกำลังพิมพ์
    // ให้พนักงานพิมพ์แก้ไขตัวเลขได้อย่างอิสระ
    setAdjustedPrices(prev => ({ ...prev, [key]: value }));
  };

  const prepareReceipt = () => {
    if (!selectedAppt) return;
    
    const finalDetailedServices = selectedAppt.detailedServices?.map((s: any, idx: number) => {
      const key = `${s.serviceId}-${idx}`;
      return {
        ...s,
        price: adjustedPrices[key] !== undefined ? (parseInt(adjustedPrices[key], 10) || 0) : s.price,
        qty: adjustedQuantities[key] !== undefined ? adjustedQuantities[key] : s.qty
      };
    }) || [];

    setReceiptData({
      ...selectedAppt,
      detailedServices: finalDetailedServices,
      baseCost: totalBaseCost,
      discount: parseInt(discount || "0", 10),
      netTotal,
      paymentMethod,
      extraProducts: extraProducts.map(ep => ({ id: ep.product.id, name: ep.product.name, price: ep.product.price, qty: ep.qty }))
    });
  };

  const confirmAndCompletePayment = async () => {
    if (!receiptData) return;
    
    try {
      await processPaymentApi(receiptData.id, receiptData.netTotal, receiptData.paymentMethod, receiptData.extraProducts, receiptData.detailedServices);
      
      const newApptData = { status: "เสร็จสิ้น" as AppointmentStatus, cost: receiptData.netTotal, paid: true };
      setAppointments(apps => apps.map(a => a.id === receiptData.id ? { ...a, ...newApptData } : a));
      
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


  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      
      {/* แผงด้านซ้าย: รายการคิวรอชำระเงิน */}
      <div className="w-1/3 flex flex-col min-w-[320px] bg-white rounded-3xl p-5 border border-gray-100" style={{ boxShadow: "0 4px 20px rgba(26,54,93,0.03)" }}>
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>รายการชำระเงิน</h2>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
          
          {/* รายการที่รอชำระเงิน */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold" style={{ color: "#4A6080" }}>รอชำระเงิน</h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FFD6DC", color: "#FF6B7E" }}>
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
                    <p className="text-xs truncate" style={{ color: "#4A6080" }}>
                      {a.detailedServices && a.detailedServices.length > 0
                        ? a.detailedServices.map((s: any) => `${s.name}${s.locationCode && s.locationCode !== "MOUTH" ? ` (ซี่ ${s.locationCode})` : ""}`).join(", ")
                        : a.treatmentServices && a.treatmentServices.length > 0
                        ? a.treatmentServices.join(", ")
                        : a.service}
                    </p>
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

          {/* รายการที่ชำระเงินแล้ววันนี้ */}
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
                    <p className="text-xs truncate mb-2" style={{ color: "#4A6080" }}>
                      {a.detailedServices && a.detailedServices.length > 0
                        ? a.detailedServices.map((s: any) => `${s.name}${s.locationCode && s.locationCode !== "MOUTH" ? ` (ซี่ ${s.locationCode})` : ""}`).join(", ")
                        : a.treatmentServices && a.treatmentServices.length > 0
                        ? a.treatmentServices.join(", ")
                        : a.service}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-green-50 text-green-700 w-fit">
                      <CheckCircle size={10} /> ชำระแล้ว
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
        
        {/* สรุปยอดรับชำระประจำวัน */}
        <div className="pt-4 mt-4" style={{ borderTop: "1px solid rgba(26,54,93,0.06)" }}>
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
            <span className="font-semibold text-xs" style={{ color: "#4A6080" }}>รวมรายได้วันนี้</span>
            <span className="font-bold text-lg" style={{ color: "#1B7A3E" }}>
              ฿{paid.reduce((s, a) => s + (a.cost ?? 0), 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* แผงด้านขวา: รายละเอียดการคิดเงินและออกใบเสร็จ */}
      <div className="flex-1 bg-white rounded-3xl p-8 border border-gray-100 flex flex-col relative overflow-y-auto" style={{ boxShadow: "0 4px 20px rgba(26,54,93,0.03)" }}>
        {!selectedAppt ? (
          <div className="m-auto text-center">
            <Receipt size={64} className="mx-auto mb-4 opacity-10" style={{ color: "#1A365D" }} />
            <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>เลือกลูกค้าเพื่อรับชำระเงิน</h2>
            <p className="text-sm" style={{ color: "#4A6080" }}>คลิกที่รายชื่อลูกค้าจากเมนูด้านซ้ายเพื่อเริ่มต้นการออกบิล</p>
          </div>
        ) : (
          <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
            {/* ส่วนหัว */}
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


            {/* สรุปรายละเอียดการรักษา */}
            <div className="mb-4">
              <h3 className="text-xs font-bold mb-2" style={{ color: "#4A6080" }}>ใบสรุปการรักษาจากแพทย์</h3>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                <div>
                  
                  <p className="font-semibold text-sm mb-2" style={{ color: "#1A365D" }}>หัตถการ / บริการที่ทำ</p>
                  {(selectedAppt.detailedServices && selectedAppt.detailedServices.length > 0) ? (
                    <div className="space-y-1.5">
                      {selectedAppt.detailedServices.map((s: any, idx: number) => {
                        const key = `${s.serviceId}-${idx}`;
                        const isProduct = String(s.serviceId).startsWith('prod-');
                        const srvData = isProduct ? null : servicesData[s.serviceId];
                        const currentPriceStr = adjustedPrices[key] !== undefined ? adjustedPrices[key] : String(s.price);
                        
                        let priceRangeStr = "";
                        if (srvData && !srvData.is_fixed_price) {
                          const base = srvData.basePrice ? srvData.basePrice.toLocaleString() : "0";
                          const max = srvData.maxPrice ? srvData.maxPrice.toLocaleString() : "ไม่จำกัด";
                          priceRangeStr = ` (฿${base} - ${max})`;
                        }

                        return (
                          <div key={key} className="flex justify-between items-center text-sm py-1.5 px-3 rounded-lg bg-white border border-gray-100">
                            <div className="flex items-center gap-2">
                              <span className="font-medium" style={{ color: "#1D6FA4" }}>
                                {s.name}
                                <span className="text-[10px] font-normal text-gray-400 ml-1">{priceRangeStr}</span>
                              </span>
                              {s.locationCode && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">ซี่ {s.locationCode}</span>}
                              {isProduct ? (
                                <div className="flex items-center gap-2 ml-2">
                                  <button 
                                    onClick={() => handleQtyChange(key, (adjustedQuantities[key] || s.qty) - 1)}
                                    className="w-5 h-5 rounded border flex items-center justify-center hover:bg-gray-50 transition-colors text-xs"
                                  >
                                    -
                                  </button>
                                  <span className="font-semibold text-gray-700 w-3 text-center text-xs">{adjustedQuantities[key] || s.qty}</span>
                                  <button 
                                    onClick={() => handleQtyChange(key, (adjustedQuantities[key] || s.qty) + 1)}
                                    className="w-5 h-5 rounded border flex items-center justify-center hover:bg-gray-50 transition-colors text-xs"
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                (adjustedQuantities[key] || s.qty) > 1 && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">x{adjustedQuantities[key] || s.qty}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold" style={{ color: "#1A365D" }}>฿</span>
                              <input
                                type="number"
                                value={currentPriceStr}
                                onChange={e => handlePriceChange(key, e.target.value, srvData)}
                                disabled={isProduct || (srvData && srvData.is_fixed_price)}
                                className={`w-24 px-2 py-1 rounded-lg text-right text-sm font-bold outline-none border transition-colors ${isProduct || (srvData && srvData.is_fixed_price) ? 'bg-transparent border-transparent text-[#1A365D]' : 'border-gray-200 focus:border-blue-500 bg-white shadow-sm'}`}
                              />
                            </div>
                          </div>
                        );
                      })}
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
                    <div className="text-xs p-2.5 bg-white rounded-lg border border-gray-100 whitespace-pre-line" style={{ color: "#4A6080" }}>
                      {selectedAppt.treatmentNotes}
                    </div>
                  </div>
                )}
                
                {selectedAppt.recommendations && (
                  <div>
                    <p className="font-semibold text-xs mb-1 text-orange-600">คำแนะนำสำหรับคนไข้:</p>
                    <div className="text-xs p-2.5 bg-orange-50 rounded-lg border border-orange-100 text-orange-800 whitespace-pre-line">
                      {selectedAppt.recommendations}
                    </div>
                  </div>
                )}
              </div>
            </div>

            
            
            
                {/* --- ส่วนเพิ่มเวชภัณฑ์และยารายการพิเศษ --- */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-xs" style={{ color: "#1A365D" }}>สินค้าเพิ่มเติมจากหน้าร้าน:</p>
                    <button 
                      onClick={() => setShowProductSelect(!showProductSelect)}
                      className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      + เพิ่มสินค้า
                    </button>
                  </div>
                  
                  {showProductSelect && (
                    <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <select 
                        className="w-full text-xs p-1.5 rounded border border-gray-300 outline-none focus:border-blue-500 mb-2"
                        onChange={(e) => {
                          if(!e.target.value) return;
                          const p = allProducts.find(x => String(x.id) === e.target.value);
                          if(p) {
                            const exists = extraProducts.find(ep => ep.product.id === p.id);
                            if(exists) {
                              setExtraProducts(extraProducts.map(ep => ep.product.id === p.id ? {...ep, qty: ep.qty + 1} : ep));
                            } else {
                              setExtraProducts([...extraProducts, {product: p, qty: 1}]);
                            }
                          }
                          e.target.value = "";
                        }}
                      >
                        <option value="">-- เลือกสินค้า --</option>
                        {allProducts.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (฿{p.price})</option>
                        ))}
                      </select>
                      <button onClick={() => setShowProductSelect(false)} className="text-[10px] text-gray-500 w-full text-center hover:text-gray-700">ปิด</button>
                    </div>
                  )}

                  {extraProducts.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                      {extraProducts.map((ep, idx) => (
                        <div key={`ep-${idx}`} className="flex justify-between items-center text-sm py-1.5 px-3 rounded-lg bg-orange-50 border border-orange-100">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-orange-800">{ep.product.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-white rounded border border-orange-200 px-1">
                              <button onClick={() => {
                                if(ep.qty > 1) {
                                  setExtraProducts(extraProducts.map(x => x.product.id === ep.product.id ? {...x, qty: x.qty - 1} : x));
                                } else {
                                  setExtraProducts(extraProducts.filter(x => x.product.id !== ep.product.id));
                                }
                              }} className="text-orange-600 px-1 font-bold">-</button>
                              <span className="text-xs font-bold w-4 text-center">{ep.qty}</span>
                              <button onClick={() => {
                                setExtraProducts(extraProducts.map(x => x.product.id === ep.product.id ? {...x, qty: x.qty + 1} : x));
                              }} className="text-orange-600 px-1 font-bold">+</button>
                            </div>
                            <span className="font-semibold text-orange-900 w-12 text-right">฿{ep.product.price * ep.qty}</span>
                            <button onClick={() => setExtraProducts(extraProducts.filter(x => x.product.id !== ep.product.id))} className="text-red-500 hover:text-red-700 ml-1 text-xs">ลบ</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

            {/* ส่วนคำนวณยอดชำระเงินสุทธิ */}
            <div className="mb-4 space-y-2">
              <h3 className="text-xs font-bold mb-1" style={{ color: "#4A6080" }}>สรุปยอดค่าใช้จ่าย</h3>
              
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-medium" style={{ color: "#1A365D" }}>รวมยอดบริการและสินค้า</span>
                <span className="text-sm font-semibold" style={{ color: "#4A6080" }}>฿{totalBaseCost.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-medium text-red-500">ส่วนลด (Discount)</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-red-500">- ฿</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={e => setDiscount(e.target.value)}
                    placeholder="0"
                    className="w-24 px-2 py-1.5 rounded-lg text-right text-xs font-bold text-red-500 outline-none border border-red-100 bg-red-50 focus:border-red-400 transition-colors"
                  />
                </div>
              </div>
              
              <div className="pt-2 mt-2 flex items-center justify-between px-1" style={{ borderTop: "1px dashed rgba(26,54,93,0.1)" }}>
                <span className="text-sm font-bold" style={{ color: "#1A365D" }}>ยอดชำระสุทธิ (Net Total)</span>
                <span className="text-2xl font-black" style={{ color: "#1B7A3E" }}>฿{netTotal.toLocaleString()}</span>
              </div>
            </div>


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

            {/* ปุ่มดำเนินการ */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setSelectedApptId(null)}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:bg-gray-100"
                style={{ color: "#4A6080" }}>
                ยกเลิก
              </button>
              <button
                onClick={prepareReceipt}
                disabled={netTotal < 0}
                className="flex-[2] py-3 rounded-xl font-bold text-white text-base transition-all hover:opacity-90 flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg,#22C55E,#16A34A)" }}>
                <CheckCircle size={18} /> รับชำระเงิน ฿{netTotal.toLocaleString()}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* หน้าต่างแสดงใบเสร็จรับเงิน */}
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
                    <h2 className="text-lg font-bold leading-tight" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>คลินิกสุภัทร</h2>
                    <p className="text-[10px]" style={{ color: "#4A6080" }}>ใบเสร็จรับเงิน #{receiptData.id}</p>
                  </div>
                </div>
                <button onClick={() => setReceiptData(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} style={{ color: "#4A6080" }} /></button>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-xs text-center mb-1" style={{ color: "#4A6080" }}>ยอดชำระสุทธิ</p>
                <p className="text-3xl font-black text-center" style={{ color: "#1B7A3E" }}>฿{receiptData.netTotal.toLocaleString()}</p>
                <div className="flex items-center justify-center gap-1 mt-2 text-xs font-bold px-2 py-1 bg-white rounded-full mx-auto w-fit border border-gray-200" style={{ color: "#1A365D" }}>
                  {receiptData.paymentMethod === "เงินสด" && <Banknote size={12} />}
                  {receiptData.paymentMethod === "โอนเงิน" && <Smartphone size={12} />}
                  {receiptData.paymentMethod === "บัตรเครดิต" && <CreditCard size={12} />}
                  ชำระผ่าน{receiptData.paymentMethod}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {[
                  ["คนไข้", receiptData.patientName],
                  [
                    "บริการ",
                    receiptData.detailedServices && receiptData.detailedServices.length > 0
                      ? receiptData.detailedServices
                          .map((s: any) => `${s.name}${s.locationCode && s.locationCode !== "MOUTH" ? ` (ซี่ ${s.locationCode})` : ""}${s.qty > 1 ? ` x${s.qty}` : ""}`)
                          .join(", ")
                      : receiptData.treatmentServices && receiptData.treatmentServices.length > 0
                      ? receiptData.treatmentServices.join(", ")
                      : receiptData.service,
                  ],
                  ["ทันตแพทย์", receiptData.doctorName],
                  ["วันที่", new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs border-b border-dashed border-gray-200 pb-2">
                    <span style={{ color: "#64748B" }}>{k}</span>
                    <span className="font-semibold text-right text-balance" style={{ color: "#1A365D", maxWidth: "65%" }}>{v}</span>
                  </div>
                ))}
                {receiptData.treatmentNotes && (
                  <div className="pt-1 pb-2 border-b border-dashed border-gray-200">
                    <span className="block text-xs mb-1" style={{ color: "#64748B" }}>บันทึกการรักษาจากแพทย์</span>
                    <div className="text-xs font-medium whitespace-pre-line bg-slate-50 rounded-lg p-2.5 border border-slate-100" style={{ color: "#1A365D" }}>
                      {receiptData.treatmentNotes}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-6 border-y border-dashed border-gray-200 py-3">
                <p className="text-xs font-bold" style={{ color: "#1A365D" }}>รายละเอียดค่าใช้จ่าย</p>
                
                {/* รายการหัตถการ */}
                {receiptData.detailedServices?.map((s: any, i: number) => (
                  <div key={`svc-${i}`} className="flex justify-between text-xs">
                    <span style={{ color: "#64748B" }}>
                      {s.name}{s.locationCode && s.locationCode !== "MOUTH" ? ` (ซี่ ${s.locationCode})` : ""} {s.qty > 1 ? `x${s.qty}` : ""}
                    </span>
                    <span style={{ color: "#1A365D" }}>฿{(s.price * s.qty).toLocaleString()}</span>
                  </div>
                ))}
                
                {/* กรณีไม่มีรายการแยกย่อย ให้แสดงชื่อบริการหลัก */}
                {(!receiptData.detailedServices || receiptData.detailedServices.length === 0) && (
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "#64748B" }}>{receiptData.service || "รวมยอดชำระ"}</span>
                    <span style={{ color: "#1A365D" }}>฿{receiptData.baseCost.toLocaleString()}</span>
                  </div>
                )}
                
                {/* รายการเวชภัณฑ์เพิ่มเติม */}
                {receiptData.extraProducts?.map((p: any, i: number) => (
                  <div key={`prod-${i}`} className="flex justify-between text-xs">
                    <span style={{ color: "#64748B" }}>{p.name} {p.qty > 1 ? `x${p.qty}` : ''}</span>
                    <span style={{ color: "#1A365D" }}>฿{(p.price * p.qty).toLocaleString()}</span>
                  </div>
                ))}

                {/* ส่วนลด */}
                {receiptData.discount > 0 && (
                  <div className="flex justify-between text-xs pt-2">
                    <span className="text-red-500 font-medium">ส่วนลด (Discount)</span>
                    <span className="text-red-500 font-medium">- ฿{receiptData.discount.toLocaleString()}</span>
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
                    // เก็บข้อมูลใบเสร็จไว้เพื่อให้กลับมาหน้าใบเสร็จได้หากปิดหน้าต่างนัดต่อเนื่อง
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs font-bold transition-all hover:opacity-90 whitespace-nowrap"
                  style={{ backgroundColor: "#E8F4FF", color: "#1D6FA4" }}>
                  <CalendarPlus size={14} className="shrink-0" /> <span>นัดครั้งถัดไป</span>
                </button>
                <button onClick={confirmAndCompletePayment}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 shadow-md whitespace-nowrap"
                  style={{ backgroundColor: "#1B7A3E" }}>
                  <Printer size={14} className="shrink-0" /> <span>ยืนยันและพิมพ์ใบเสร็จ</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* หน้าต่างทำนัดหมายต่อเนื่องครั้งถัดไป */}
      {followUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(26,54,93,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden relative">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>สร้างนัดหมายครั้งถัดไป</h2>
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
                    <span className="text-xs text-gray-500 truncate mr-3">{`https://suphat.clinic/booking?openTicketId=${openTicketId}`}</span>
                    <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90" style={{ backgroundColor: "#1D6FA4" }}>
                      คัดลอกลิงก์
                    </button>
                  </div>
                  
                  <button onClick={() => { setFollowUp(null); setFollowUpDate(""); setFollowUpTime(""); setIsOpenTicket(false); setShowLink(false); }} className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90" style={{ backgroundColor: "#1A365D" }}>
                    กลับไปหน้าใบเสร็จ
                  </button>

                </div>
              ) : (
                <>
                  <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                    <p className="text-xs mb-1" style={{ color: "#4A6080" }}>สำหรับคนไข้:</p>
                    <p className="font-bold text-base" style={{ color: "#1A365D" }}>{followUp.patientName}</p>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    {/* การผูกเคสรักษาต่อเนื่อง */}
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
                                    const isAvail = s.status === 'available';
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
                      กลับไปหน้าใบเสร็จ
                    </button>

                    <button onClick={async () => {
                        if (!isOpenTicket && (!followUpDate || !followUpTime)) {
                          alert('กรุณาระบุวันและเวลา หรือเลือกใบนัดแบบเปิด');
                          return;
                        }
                        setIsSubmitting(true);
                        try {
                          const newAppt: any = await addAppointment({
                            patientId: followUp.patientId,
                            hn: '',
                            patientName: followUp.patientName,
                            patientPhone: '',
                            service: followUp.service,
                            serviceId: followUp.serviceId || 1, // กรณีสำรอง if edited
                            doctorName: isBound ? followUp.doctorName : '',
                            doctorId: isBound ? followUp.doctorId : undefined,
                            date: isOpenTicket ? '' : followUpDate,
                            time: isOpenTicket ? '' : followUpTime,
                            status: 'ยืนยันการจอง',
                            source: 'doctor',
                            note: isBound ? `แพทย์ประจำเคส: ${followUp.doctorName}` : ''
                          } as any);
                          if (newAppt && (newAppt.appointment_id || newAppt.id)) {
                            setOpenTicketId(newAppt.appointment_id || newAppt.id);
                          }
                          
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
