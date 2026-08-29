import React, { useState, useEffect } from 'react';
import { supabase, getDentists } from '../../shared/supabaseApi';
import { X, Calendar, Plus, Trash2, CheckCircle, Clock } from 'lucide-react';
import Odontogram, { ToothStatus } from './Odontogram';
import ToothActionModal from './ToothActionModal';

interface ServiceOption {
  service_id: number;
  service_name: string;
}

interface PlanDetail {
  month: number;
  services: ServiceOption[];
  notes: string;
  odontogram_data?: Record<number, ToothStatus>;
}

export default function TreatmentPlanBuilder({ patientId, onClose, existingPlan }: { patientId: number, onClose: (plan?: any) => void, existingPlan?: any }) {
  const [months, setMonths] = useState<number>(24);
  const [planDetails, setPlanDetails] = useState<PlanDetail[]>([]);
  const [availableServices, setAvailableServices] = useState<ServiceOption[]>([]);
  
  // Primary Dentist
  const [dentists, setDentists] = useState<any[]>([]);
  const [primaryDentist, setPrimaryDentist] = useState<number | "">("");
  
  // Bulk add state
  const [bulkService, setBulkService] = useState<number | null>(null);
  
  // Odontogram state
  const [editingOdontogramMonth, setEditingOdontogramMonth] = useState<number | null>(null);
  const [selectedToothForAction, setSelectedToothForAction] = useState<number | null>(null);
  const [isChild, setIsChild] = useState(false);
  const [isWholeMouth, setIsWholeMouth] = useState(false);
  
  useEffect(() => {
    fetchServices();
    getDentists().then(data => setDentists(data));
    
    if (existingPlan && existingPlan.plan_details) {
      setPlanDetails(existingPlan.plan_details);
      setMonths(existingPlan.plan_details.length);
      if (existingPlan.dentist_id) setPrimaryDentist(existingPlan.dentist_id);
    } else {
      generatePlan(24);
    }
  }, [existingPlan]);

  const fetchServices = async () => {
    const { data } = await supabase.from('service').select('service_id, service_name').eq('is_active', true);
    if (data) setAvailableServices(data);
  };

  const generatePlan = (numMonths: number) => {
    const newPlan: PlanDetail[] = [];
    for (let i = 1; i <= numMonths; i++) {
      newPlan.push({
        month: i,
        services: [],
        notes: ''
      });
    }
    setPlanDetails(newPlan);
  };

  const handleMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setMonths(val);
  };
  
  const handleGenerate = () => {
    generatePlan(months);
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
      
      if (existingPlan?.plan_id) {
        // Update existing plan
        const { data, error } = await supabase.from('treatment_plan').update({
          plan_name: `แผนการรักษาจัดฟัน (${months} เดือน)`,
          plan_details: planDetails,
          dentist_id: dentistIdVal
        }).eq('plan_id', existingPlan.plan_id).select();
        
        if (error) throw error;
        resultData = data;
        
        alert("อัปเดตแผนการรักษาเรียบร้อยแล้ว");
      } else {
        // Create treatment plan
        const { data, error } = await supabase.from('treatment_plan').insert({
          patient_id: patientId,
          plan_name: `แผนการรักษาจัดฟัน (${months} เดือน)`,
          dentist_id: dentistIdVal,
          plan_details: planDetails // Ensure DB is updated to accept this column
        }).select();

        if (error) throw error;
        resultData = data;
        
        alert("บันทึกแผนการรักษาเรียบร้อยแล้ว");
      }
      
      if (resultData && resultData.length > 0) {
        onClose(resultData[0]);
      } else {
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      alert("เกิดข้อผิดพลาด: " + err.message + "\n(หาก Error ว่าไม่พบ plan_details กรุณาตรวจสอบฐานข้อมูลว่าเพิ่ม column หรือยัง)");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      {selectedToothForAction && (
        <ToothActionModal 
          tooth={selectedToothForAction}
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
                <label className="block text-sm font-medium text-slate-700 mb-1">หมอประจำเคส (Primary Doctor)</label>
                <select 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  value={primaryDentist}
                  onChange={(e) => setPrimaryDentist(e.target.value === "" ? "" : Number(e.target.value))}
                >
                  <option value="">-- ไม่ระบุ (No specific doctor) --</option>
                  {dentists.map(d => (
                    <option key={d.dentist_id} value={d.dentist_id}>{d.first_name} {d.last_name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6 flex flex-wrap gap-4 items-end shadow-sm">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">จำนวนระยะเวลา (เดือน/ครั้ง)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  className="border border-slate-300 rounded-lg px-3 py-2 w-24 focus:ring-2 focus:ring-teal-500 focus:border-teal-500" 
                  value={months}
                  onChange={handleMonthsChange}
                  min="1"
                />
                <button 
                  onClick={handleGenerate}
                  className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  สร้างตาราง
                </button>
              </div>
            </div>
            
            <div className="w-px h-12 bg-slate-200 mx-2 hidden sm:block"></div>
            
            <div className="flex-1 min-w-[300px]">
              <label className="block text-sm font-medium text-slate-700 mb-1">เพิ่มหัตถการลงใน "ทุกเดือน" อัตโนมัติ (Bulk Apply)</label>
              <div className="flex items-center gap-2">
                <select 
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  value={bulkService || ''}
                  onChange={(e) => setBulkService(Number(e.target.value))}
                >
                  <option value="">-- เลือกหัตถการ --</option>
                  {availableServices.map(s => (
                    <option key={s.service_id} value={s.service_id}>{s.service_name}</option>
                  ))}
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
                        {availableServices.map(s => (
                          <option key={s.service_id} value={s.service_id}>{s.service_name}</option>
                        ))}
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
                      <button onClick={() => setIsWholeMouth(!isWholeMouth)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${!isWholeMouth ? 'bg-white border text-blue-600 shadow-sm' : 'text-gray-500'}`}>
                        เหมาทั้งปาก (ไม่ระบุซี่)
                      </button>
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
