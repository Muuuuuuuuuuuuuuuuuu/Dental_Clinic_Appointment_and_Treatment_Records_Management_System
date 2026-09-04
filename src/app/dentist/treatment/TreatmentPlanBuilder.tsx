import React, { useState, useEffect } from 'react';
import { supabase, getDentists } from '../../shared/supabaseApi';
import { X, Calendar, Plus, Trash2, CheckCircle, Clock } from 'lucide-react';
import Odontogram, { ToothStatus } from './Odontogram';
import ToothActionModal from './ToothActionModal';

interface ServiceOption {
  service_id: number;
  service_name: string;
  category?: string;
  apply_to?: string;
}

interface PlanDetail {
  month: number;
  services: ServiceOption[];
  notes: string;
  odontogram_data?: Record<number, ToothStatus>;
  status?: string;
}

export default function TreatmentPlanBuilder({ patientId, onClose, existingPlan, lockedDentistId }: { patientId: number, onClose: (plan?: any) => void, existingPlan?: any, lockedDentistId?: number }) {
  const [months, setMonths] = useState<number>(24);
  const [planDetails, setPlanDetails] = useState<PlanDetail[]>([]);
  const [availableServices, setAvailableServices] = useState<ServiceOption[]>([]);
  
  // Primary Dentist
  const [dentists, setDentists] = useState<any[]>([]);
  const [primaryDentist, setPrimaryDentist] = useState<number | "">("");
  
  // Financial state
  const [totalCost, setTotalCost] = useState<number>(40000);
  const [downPayment, setDownPayment] = useState<number>(3000);
  const [downPaymentMonths, setDownPaymentMonths] = useState<number>(3);
  
  // Bulk add state
  const [bulkService, setBulkService] = useState<number | null>(null);
  
  // Odontogram state
  const [editingOdontogramMonth, setEditingOdontogramMonth] = useState<number | null>(null);
  const [selectedToothForAction, setSelectedToothForAction] = useState<number | null>(null);
  const [isChild, setIsChild] = useState(false);
  
  // โหลด services + plan details
  useEffect(() => {
    fetchServices();
    
    if (existingPlan && existingPlan.plan_details) {
      setPlanDetails(existingPlan.plan_details);
      setMonths(existingPlan.plan_details.length);
      if (existingPlan.total_cost) setTotalCost(existingPlan.total_cost);
    } else {
      generatePlan(24);
    }
  }, [existingPlan]);

  // โหลดรายชื่อหมอ → แล้วค่อย set primary dentist
  useEffect(() => {
    getDentists().then(data => {
      setDentists(data);
      // ต้องรอ dentists โหลดก่อน ถึง select จะแสดงชื่อได้
      if (existingPlan?.dentist_id) {
        setPrimaryDentist(existingPlan.dentist_id);
      } else if (lockedDentistId) {
        setPrimaryDentist(lockedDentistId);
      }
    });
  }, [existingPlan, lockedDentistId]);

  const fetchServices = async () => {
    const { data } = await supabase.from('service').select('service_id, service_name, category, apply_to').eq('is_active', true);
    if (data) setAvailableServices(data);
  };

  const generatePlan = (numMonths: number) => {
    setPlanDetails(prev => {
      const newPlan = [...prev];
      if (numMonths > newPlan.length) {
        for (let i = newPlan.length + 1; i <= numMonths; i++) {
          newPlan.push({
            month: i,
            services: [],
            notes: ''
          });
        }
      } else if (numMonths < newPlan.length) {
        newPlan.length = numMonths;
      }
      return newPlan;
    });
  };

  const handleMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1;
    setMonths(val);
    generatePlan(val);
  };

  const applyBulkService = () => {
    if (!bulkService) return;
    const service = availableServices.find(s => s.service_id === bulkService);
    if (!service) return;

    setPlanDetails(prev => prev.map(p => {
      // Check if already exists
      if (p.services.find(s => s.service_id === bulkService)) return p;
      return { ...p, services: [...p.services, service] };
    }));
  };

  const addServiceToMonth = (monthIndex: number, serviceId: number) => {
    const service = availableServices.find(s => s.service_id === serviceId);
    if (!service) return;
    
    setPlanDetails(prev => {
      const next = [...prev];
      if (!next[monthIndex].services.find(s => s.service_id === serviceId)) {
        next[monthIndex].services.push(service);
      }
      return next;
    });
  };

  const removeServiceFromMonth = (monthIndex: number, serviceId: number) => {
    setPlanDetails(prev => {
      const next = [...prev];
      next[monthIndex].services = next[monthIndex].services.filter(s => s.service_id !== serviceId);
      return next;
    });
  };
  
  const handleNoteChange = (monthIndex: number, text: string) => {
    setPlanDetails(prev => {
      const next = [...prev];
      next[monthIndex].notes = text;
      return next;
    });
  };

  const handleToothClick = (monthIndex: number, tooth: number) => {
    // Rely on editingOdontogramMonth which is already set
    setSelectedToothForAction(tooth);
  };

  const handleToothAction = (status: ToothStatus, serviceName?: string, notes?: string) => {
    if (editingOdontogramMonth !== null && selectedToothForAction !== null) {
      setPlanDetails(prev => {
        const next = [...prev];
        const currentMonth = { ...next[editingOdontogramMonth] };
        
        currentMonth.odontogram_data = { 
          ...(currentMonth.odontogram_data || {}), 
          [selectedToothForAction]: status 
        };
        
        if (serviceName) {
           const svc = availableServices.find(s => s.service_name === serviceName);
           if (svc && !currentMonth.services.some(s => s.service_name === serviceName)) {
             currentMonth.services = [...currentMonth.services, svc];
           }
        }
        if (notes) {
           currentMonth.notes = currentMonth.notes ? `${currentMonth.notes}\n(${notes})` : `(${notes})`;
        }
        
        next[editingOdontogramMonth] = currentMonth;
        return next;
      });
      setSelectedToothForAction(null);
    }
  };

  const handleSave = async () => {
    try {
      let resultData;
      
      const dentistIdVal = primaryDentist ? Number(primaryDentist) : null;
      
      let planId;
      
      if (existingPlan?.plan_id) {
        planId = existingPlan.plan_id;
        // Update existing plan
        const { data, error } = await supabase.from('treatment_plan').update({
          plan_name: `แผนการรักษาจัดฟัน (${months} เดือน)`,
          dentist_id: dentistIdVal
        }).eq('plan_id', planId).select();
        
        if (error) throw error;
        resultData = data;
        
        // --- Sync with treatment_plan_item ---
        // 1. Delete excess months
        const { error: deleteError } = await supabase.from('treatment_plan_item')
          .delete()
          .eq('plan_id', planId)
          .gt('month_number', months);
        if (deleteError) throw new Error("Failed to delete excess months: " + deleteError.message);
          
        // 2. Upsert each month
        for (const p of planDetails) {
          const { data: existingItem } = await supabase.from('treatment_plan_item')
            .select('item_id')
            .eq('plan_id', planId)
            .eq('month_number', p.month)
            .single();
            
          if (existingItem) {
            const { error: updateError } = await supabase.from('treatment_plan_item').update({
              services_json: p.services,
              odontogram_data: p.odontogram_data || {},
              notes: p.notes || ''
              // Do NOT update status here to preserve 'completed' state
            }).eq('item_id', existingItem.item_id);
            if (updateError) throw new Error("Failed to update month " + p.month + ": " + updateError.message);
          } else {
            const { error: insertItemError } = await supabase.from('treatment_plan_item').insert({
              plan_id: planId,
              month_number: p.month,
              services_json: p.services,
              odontogram_data: p.odontogram_data || {},
              notes: p.notes || '',
              status: p.status || 'pending'
            });
            if (insertItemError) throw new Error("Failed to insert month " + p.month + ": " + insertItemError.message);
          }
        }
        
        alert("อัปเดตแผนการรักษาเรียบร้อยแล้ว");
      } else {
        // Create treatment plan
        const { data, error } = await supabase.from('treatment_plan').insert({
          patient_id: patientId,
          plan_name: `แผนการรักษาจัดฟัน (${months} เดือน)`,
          dentist_id: dentistIdVal,
          total_cost: totalCost
        }).select();

        if (error) throw error;
        resultData = data;
        planId = data[0].plan_id;
        
        // --- 1. Create Installments ---
        const installmentsToInsert = [];
        let remainingBalance = totalCost;
        let dueDate = new Date();
        
        for (let i = 1; i <= months; i++) {
          let amount = 0;
          if (i <= downPaymentMonths && remainingBalance > 0) {
            amount = Math.min(downPayment, remainingBalance);
          } else if (remainingBalance > 0) {
            // Auto divide the rest
            const remainingMonths = months - downPaymentMonths;
            amount = remainingMonths > 0 ? Math.ceil(remainingBalance / remainingMonths) : remainingBalance;
            amount = Math.min(amount, remainingBalance);
          }
          
          installmentsToInsert.push({
            plan_id: planId,
            installment_number: i,
            amount: amount,
            due_date: dueDate.toISOString().split('T')[0],
            paid: false
          });
          
          remainingBalance -= amount;
          // Next month
          dueDate.setMonth(dueDate.getMonth() + 1);
        }
        
        if (installmentsToInsert.length > 0) {
          const { error: instError } = await supabase.from('installment').insert(installmentsToInsert);
          if (instError) console.error("Error inserting installments:", instError);
        }
        
        // Insert all months into treatment_plan_item
        const itemsToInsert = planDetails.map(p => ({
          plan_id: planId,
          month_number: p.month,
          services_json: p.services,
          odontogram_data: p.odontogram_data || {},
          notes: p.notes || '',
          status: p.status || 'pending'
        }));
        
        const { error: itemError } = await supabase.from('treatment_plan_item').insert(itemsToInsert);
        if (itemError) {
          console.error("Error inserting items:", itemError);
          throw new Error("บันทึกแผนแม่สำเร็จ แต่บันทึกรายเดือนลง treatment_plan_item ล้มเหลว: " + itemError.message);
        }
        
        alert("บันทึกแผนการรักษาเรียบร้อยแล้ว");
      }
      
      if (resultData && resultData.length > 0) {
        onClose(resultData[0]);
      } else {
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      {selectedToothForAction && (
        <ToothActionModal 
          tooth={selectedToothForAction}
          services={availableServices.map(s => ({ id: s.service_id, name: s.service_name, category: s.category, applyTo: s.apply_to }))}
          onClose={() => setSelectedToothForAction(null)}
          onAction={handleToothAction}
        />
      )}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {existingPlan ? "ดู/แก้ไขตารางแผนการรักษา" : "สร้างตารางแผนการรักษา (Treatment Plan Builder)"}
            </h2>
            <p className="text-sm text-slate-500">
              {existingPlan ? "แก้ไขภาพรวมของแผนการรักษา หรือปรับจำนวนเดือน" : "ระบุจำนวนเดือนและหัตถการที่ต้องทำในแต่ละครั้ง"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-800 border-b pb-2">การตั้งค่าแผนการรักษา (Settings)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  หมอประจำเคส (Primary Doctor)
                  {lockedDentistId && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                      👤 ตั้งจากบัญชีของคุณ
                    </span>
                  )}
                </label>
                <select 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  value={primaryDentist}
                  onChange={(e) => {
                    setPrimaryDentist(e.target.value === "" ? "" : Number(e.target.value));
                  }}
                >
                  <option value="">-- ไม่ระบุ (No specific doctor) --</option>
                  {dentists.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                {lockedDentistId && (
                  <p className="mt-1 text-xs text-slate-500">ℹ️ ระบบเลือกจากบัญชีที่ login อยู่ — สามารถเปลี่ยนได้หากจำเป็น</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6 flex flex-wrap gap-4 items-end shadow-sm">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">จำนวนระยะเวลา (เดือน)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  className="border border-slate-300 rounded-lg px-3 py-2 w-24 focus:ring-2 focus:ring-teal-500 focus:border-teal-500" 
                  value={months}
                  onChange={handleMonthsChange}
                  min="1"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ราคาแพ็กเกจเต็ม (บาท)</label>
              <input 
                type="number" 
                className="border border-slate-300 rounded-lg px-3 py-2 w-32 focus:ring-2 focus:ring-teal-500 focus:border-teal-500" 
                value={totalCost}
                onChange={(e) => setTotalCost(Number(e.target.value))}
                min="0"
                step="1000"
              />
            </div>
            
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 flex-1">
              <label className="block text-xs font-semibold text-orange-800 mb-1">ตั้งค่าการจ่ายล่วงหน้า (ค่างวดแรกเข้า)</label>
              <div className="flex items-center gap-2 text-sm">
                <span>จ่ายเดือนละ</span>
                <input 
                  type="number" 
                  className="border border-orange-200 rounded px-2 py-1 w-24" 
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  step="500"
                />
                <span>เป็นเวลา</span>
                <input 
                  type="number" 
                  className="border border-orange-200 rounded px-2 py-1 w-16" 
                  value={downPaymentMonths}
                  onChange={(e) => setDownPaymentMonths(Number(e.target.value))}
                  min="0"
                />
                <span>เดือน</span>
              </div>
              <p className="text-[10px] text-orange-600 mt-1">*ที่เหลือระบบจะหารเฉลี่ยให้เดือนถัดๆ ไปอัตโนมัติ</p>
            </div>
            
            <div className="w-full h-px bg-slate-200 my-2"></div>
            
            <div className="flex-1 min-w-[300px]">
              <label className="block text-sm font-medium text-slate-700 mb-1">เพิ่มหัตถการลงใน "ทุกเดือน" อัตโนมัติ (Bulk Apply)</label>
              <div className="flex items-center gap-2">
                <select 
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  value={bulkService || ''}
                  onChange={(e) => setBulkService(Number(e.target.value))}
                >
                  <option value="">-- เลือกหัตถการ --</option>
                  {(() => {
                    const mouthServices = availableServices.filter(s => {
                      const applyType = s.apply_to?.toLowerCase();
                      return applyType !== 'tooth' && applyType !== 'รายซี่';
                    });
                    const categories = Array.from(new Set(mouthServices.map(s => s.category || 'อื่นๆ')));
                    // Sort to put 'จัดฟัน' first
                    categories.sort((a, b) => {
                      if (a.includes('จัดฟัน')) return -1;
                      if (b.includes('จัดฟัน')) return 1;
                      if (a.includes('ทั่วไป')) return -1;
                      if (b.includes('ทั่วไป')) return 1;
                      return a.localeCompare(b);
                    });
                    
                    return categories.map(cat => (
                      <optgroup key={cat} label={cat}>
                        {mouthServices.filter(s => (s.category || 'อื่นๆ') === cat).map(s => (
                          <option key={s.service_id} value={s.service_id}>{s.service_name}</option>
                        ))}
                      </optgroup>
                    ));
                  })()}
                </select>
                <button 
                  onClick={applyBulkService}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap"
                >
                  ใช้กับทุกเดือน
                </button>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 text-blue-800 p-3 rounded-lg mb-6 text-sm flex items-start gap-2 border border-blue-100">
            <Clock size={18} className="mt-0.5 shrink-0" />
            <p><strong>หมายเหตุ:</strong> แผนการรักษานี้เป็นการประเมินเบื้องต้นเท่านั้น สามารถปรับเปลี่ยนจำนวนเดือนและหัตถการได้ในอนาคตตามสภาพความเป็นจริง</p>
          </div>

          <div className="space-y-3">
            {planDetails.map((plan, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-teal-200 transition-colors">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-32 shrink-0">
                    <div className="font-bold text-slate-700 text-lg flex items-center gap-2">
                      <Calendar size={18} className="text-teal-600" />
                      เดือนที่ {plan.month}
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {plan.services.map(s => (
                        <div key={s.service_id} className="bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                          {s.service_name}
                          <button 
                            onClick={() => removeServiceFromMonth(index, s.service_id)}
                            className="text-teal-400 hover:text-teal-600 hover:bg-teal-100 rounded-full p-0.5"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      
                      <select 
                        className="bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        onChange={(e) => {
                          if (e.target.value) {
                            addServiceToMonth(index, Number(e.target.value));
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="">+ เพิ่มหัตถการ...</option>
                        {(() => {
                          const mouthServices = availableServices.filter(s => {
                            const applyType = s.apply_to?.toLowerCase();
                            return applyType !== 'tooth' && applyType !== 'รายซี่';
                          });
                          const categories = Array.from(new Set(mouthServices.map(s => s.category || 'อื่นๆ')));
                          categories.sort((a, b) => {
                            if (a.includes('จัดฟัน')) return -1;
                            if (b.includes('จัดฟัน')) return 1;
                            if (a.includes('ทั่วไป')) return -1;
                            if (b.includes('ทั่วไป')) return 1;
                            return a.localeCompare(b);
                          });
                          
                          return categories.map(cat => (
                            <optgroup key={`cat-${index}-${cat}`} label={cat}>
                              {mouthServices.filter(s => (s.category || 'อื่นๆ') === cat).map(s => (
                                <option key={`opt-${index}-${s.service_id}`} value={s.service_id}>{s.service_name}</option>
                              ))}
                            </optgroup>
                          ));
                        })()}
                      </select>
                    </div>
                    
                    <input 
                      type="text" 
                      placeholder="โน้ตเพิ่มเติมสำหรับเดือนนี้..."
                      className="w-full text-sm border-0 border-b border-dashed border-slate-300 focus:border-teal-500 focus:ring-0 px-0 py-1 bg-transparent text-slate-600 placeholder:text-slate-400"
                      value={plan.notes}
                      onChange={(e) => handleNoteChange(index, e.target.value)}
                    />
                    
                    <div>
                      <button
                        onClick={() => setEditingOdontogramMonth(editingOdontogramMonth === index ? null : index)}
                        className={`text-[11px] px-3 py-1 rounded-full border transition-colors flex items-center gap-1 ${
                          editingOdontogramMonth === index || (plan.odontogram_data && Object.keys(plan.odontogram_data).length > 0)
                            ? 'bg-blue-50 border-blue-200 text-blue-600'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        🦷 {editingOdontogramMonth === index ? 'ซ่อนแผนผังฟัน' : 'ระบุซี่ฟัน'}
                        {plan.odontogram_data && Object.keys(plan.odontogram_data).length > 0 && (
                          <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-[9px] font-bold ml-1">
                            {Object.keys(plan.odontogram_data).length}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Odontogram for this month */}
                {editingOdontogramMonth === index && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm font-semibold text-slate-700">ระบุซี่ฟันสำหรับเดือนที่ {plan.month}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-center">
                      <Odontogram
                        toothData={plan.odontogram_data || {}}
                        onToothClick={(tooth) => handleToothClick(index, tooth)}
                        isChild={isChild}
                        setIsChild={setIsChild}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={() => onClose()}
            className="px-5 py-2 rounded-lg text-slate-600 font-medium hover:bg-slate-200 transition-colors"
          >
            ยกเลิก
          </button>
          <button 
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors shadow-sm"
          >
            {existingPlan ? "บันทึกการแก้ไข" : "บันทึกแผนการรักษา"}
          </button>
        </div>

      </div>
    </div>
  );
}
