import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert, UploadCloud, User, Activity, CheckSquare } from 'lucide-react';
import { PatientUser } from '../types';

export interface HealthChecklistData {
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
  hasAllergy: boolean | null;
  allergies: string[];
  allergyOther: string;
  hasCondition: boolean | null;
  conditions: string[];
  conditionOther: string;
  hasMedications: boolean | null;
  medicationNote: string;
  consent: boolean;
  hasChanges: boolean | null;
}

interface Props {
  user: PatientUser | null;
  data: HealthChecklistData;
  onChange: (data: HealthChecklistData, isValid: boolean) => void;
}

export default function HealthChecklistForm({ user, data, onChange }: Props) {
  const [formData, setFormData] = useState<HealthChecklistData>(data);

  // Check if returning user (has valid non-empty data that isn't just the default 'ไม่มี')
  const isReturning = Boolean(user && (
    (user.conditions && user.conditions !== 'ไม่มี' && user.conditions.trim() !== '') || 
    (user.allergies && user.allergies !== 'ไม่มี' && user.allergies.trim() !== '') || 
    (user.emergencyName && user.emergencyName.trim() !== '')
  ));

  useEffect(() => {
    let valid = false;
    
    if (isReturning && formData.hasChanges === false) {
      // ยืนยันว่าข้อมูลสุขภาพไม่เปลี่ยนแปลง
      valid = true;
    } else {
      // ตรวจสอบความครบถ้วนของแบบฟอร์ม
      const hasEmergency = formData.emergencyName.trim() !== '' && formData.emergencyPhone.trim() !== '' && formData.emergencyRelationship.trim() !== '';
      const validAllergy = formData.hasAllergy === false || (formData.hasAllergy === true && formData.allergies.length > 0 && (!formData.allergies.includes('แพ้อื่นๆ') || formData.allergyOther.trim() !== ''));
      const validCondition = formData.hasCondition === false || (formData.hasCondition === true && formData.conditions.length > 0 && (!formData.conditions.includes('โรคอื่นๆ') || formData.conditionOther.trim() !== ''));
      const validConsent = formData.consent;
      
      valid = hasEmergency && validAllergy && validCondition && validConsent;
    }
    
    onChange(formData, valid);
  }, [formData, isReturning]);

  const handleAllergyToggle = (val: string) => {
    let newArr = [...formData.allergies];
    if (newArr.includes(val)) {
      newArr = newArr.filter(a => a !== val);
    } else {
      newArr.push(val);
    }
    setFormData({ ...formData, allergies: newArr });
  };

  const handleConditionToggle = (val: string) => {
    let newArr = [...formData.conditions];
    if (newArr.includes(val)) {
      newArr = newArr.filter(c => c !== val);
    } else {
      newArr.push(val);
    }
    setFormData({ ...formData, conditions: newArr });
  };

  const inputStyle = "w-full px-4 py-3 rounded-xl border text-base outline-none transition-all focus:ring-2 focus:ring-[#FF8C9A]/40 bg-[#F0F4F8] border-transparent text-[#1A365D]";

  const renderReturningUserOptions = () => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] space-y-6 animate-fade-in mb-6">
      <div className="flex items-center gap-3 text-[#1A365D] mb-2">
        <div className="w-10 h-10 rounded-full bg-[#E8F4FF] flex items-center justify-center text-[#2B6CB0]">
          <ShieldAlert size={20} />
        </div>
        <div>
          <h3 className="font-bold text-lg">ยืนยันข้อมูลสุขภาพ (1-Click Verification)</h3>
          <p className="text-sm text-[#4A6080]">ประวัติสุขภาพล่าสุดของคุณระบุว่า:</p>
        </div>
      </div>

      <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0] space-y-2">
        <p className="text-sm text-[#4A6080]"><span className="font-semibold text-[#1A365D]">โรคประจำตัว:</span> {user?.conditions}</p>
        <p className="text-sm text-[#4A6080]"><span className="font-semibold text-[#1A365D]">ประวัติแพ้ยา:</span> {user?.allergies}</p>
      </div>

      <div className="space-y-3 pt-2">
        <p className="font-semibold text-[#1A365D]">ข้อมูลสุขภาพของคุณมีการเปลี่ยนแปลงหรือไม่?</p>
        
        <button 
          type="button"
          onClick={() => setFormData({ ...formData, hasChanges: false, consent: true })}
          className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${formData.hasChanges === false ? 'border-[#1B7A3E] bg-[#E8FFF0]' : 'border-transparent bg-[#F8FAFC] hover:bg-[#E8FFF0]'}`}
        >
          <div>
            <p className={`font-bold ${formData.hasChanges === false ? 'text-[#1B7A3E]' : 'text-[#1A365D]'}`}>ไม่มีอะไรเปลี่ยนแปลง</p>
            <p className={`text-sm ${formData.hasChanges === false ? 'text-[#1B7A3E]/80' : 'text-[#4A6080]'}`}>ใช้ข้อมูลสุขภาพเดิมในการประเมิน</p>
          </div>
          {formData.hasChanges === false && <CheckCircle2 size={24} className="text-[#1B7A3E]" />}
        </button>

        <button 
          type="button"
          onClick={() => {
            if (formData.hasChanges !== true) {
              setFormData({ 
                ...formData, 
                hasChanges: true,
                emergencyName: user?.emergencyName || '',
                emergencyPhone: user?.emergencyPhone || '',
                emergencyRelationship: user?.emergencyRelationship || '',
                hasAllergy: null, allergies: [], allergyOther: '',
                hasCondition: null, conditions: [], conditionOther: '',
                hasMedications: null, medicationNote: '', consent: false
              });
            }
          }}
          className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${formData.hasChanges === true ? 'border-[#FF8C9A] bg-[#FFF0F2]' : 'border-[#E2E8F0] hover:border-[#FF8C9A] hover:bg-[#FFF0F2]'}`}
        >
          <div>
            <p className={`font-bold ${formData.hasChanges === true ? 'text-[#E0314C]' : 'text-[#1A365D]'}`}>มีข้อมูลเพิ่มเติม / ป่วยเป็นโรคใหม่</p>
            <p className={`text-sm ${formData.hasChanges === true ? 'text-[#E0314C]/80' : 'text-[#4A6080]'}`}>อัปเดตประวัติแพ้ยา หรือโรคประจำตัว</p>
          </div>
          {formData.hasChanges === true && <CheckCircle2 size={24} className="text-[#E0314C]" />}
        </button>
      </div>
    </div>
  );

  const showFullForm = !isReturning || formData.hasChanges === true;

  return (
    <div className="space-y-6">
      {isReturning && renderReturningUserOptions()}

      {showFullForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden animate-fade-in">
          <div className="bg-gradient-to-r from-[#FF8C9A] to-[#FFB3BA] p-4 text-white text-center">
            <h3 className="font-bold text-lg flex items-center justify-center gap-2">
              <ShieldAlert size={20} /> แบบฟอร์มประวัติสุขภาพและใบยินยอม
            </h3>
            <p className="text-sm opacity-90 mt-1">เพื่อความปลอดภัยสูงสุด กรุณาให้ข้อมูลตามความเป็นจริง (ข้อมูลถูกจัดเก็บเป็นความลับ)</p>
          </div>

          <div className="p-6 space-y-8">
        
        {/* ส่วนที่ 1 */}
        <section className="space-y-4">
          <h4 className="font-bold text-[#1A365D] flex items-center gap-2">
            <User size={18} className="text-[#FF8C9A]" /> ส่วนที่ 1: ข้อมูลผู้ติดต่อฉุกเฉิน
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:pl-7">
            <div>
              <label className="block text-sm font-medium text-[#4A6080] mb-1">ชื่อ-นามสกุล ผู้ติดต่อฉุกเฉิน</label>
              <input type="text" className={inputStyle} value={formData.emergencyName} onChange={e => setFormData({...formData, emergencyName: e.target.value})} placeholder="ระบุชื่อผู้ติดต่อฉุกเฉิน" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A6080] mb-1">ความสัมพันธ์กับคนไข้</label>
              <input type="text" className={inputStyle} value={formData.emergencyRelationship} onChange={e => setFormData({...formData, emergencyRelationship: e.target.value})} placeholder="เช่น บิดา, มารดา, สามี" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A6080] mb-1">เบอร์โทรศัพท์ผู้ติดต่อฉุกเฉิน</label>
              <input type="tel" className={inputStyle} value={formData.emergencyPhone} onChange={e => setFormData({...formData, emergencyPhone: e.target.value})} placeholder="08X-XXX-XXXX" maxLength={10} />
            </div>
          </div>
        </section>

        <hr className="border-[#E2E8F0]" />

        {/* ส่วนที่ 2 */}
        <section className="space-y-4">
          <h4 className="font-bold text-[#1A365D] flex items-center gap-2">
            <AlertCircle size={18} className="text-[#FF8C9A]" /> ส่วนที่ 2: ประวัติการแพ้ยาและสารเคมี
          </h4>
          
          <div className="space-y-3 md:pl-7">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-transparent hover:bg-[#F8FAFC] transition-all">
              <input type="radio" checked={formData.hasAllergy === false} onChange={() => setFormData({...formData, hasAllergy: false, allergies: [], allergyOther: ''})} className="w-5 h-5 accent-[#FF8C9A]" />
              <span className="font-semibold text-[#1A365D]">ไม่เคยมีประวัติแพ้ยา หรือสารเคมีใดๆ</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-transparent hover:bg-[#F8FAFC] transition-all">
              <input type="radio" checked={formData.hasAllergy === true} onChange={() => setFormData({...formData, hasAllergy: true})} className="w-5 h-5 accent-[#FF8C9A]" />
              <span className="font-semibold text-[#1A365D]">มีประวัติแพ้ยา หรือสารเคมี</span>
            </label>

            {formData.hasAllergy === true && (
              <div className="ml-8 mt-2 space-y-3 p-4 bg-[#FFF0F2] rounded-xl border border-[#FFE0E4] animate-fade-in">
                <p className="text-sm font-semibold text-[#E0314C] mb-3">กรุณาเลือกว่าคุณแพ้ยาหรือสารเคมีชนิดใดบ้าง (เลือกได้มากกว่า 1 ข้อ)</p>
                {['ยาแก้ปวด / ยาแก้อักเสบ (เช่น แอสไพริน, ไอบูโพรเฟน, เพนิซิลลิน)', 'ยาชาสำหรับทำฟัน', 'ยางลาเท็กซ์ (ถุงมือแพทย์)'].map(item => (
                  <label key={item} className="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-white transition-all">
                    <input type="checkbox" checked={formData.allergies.includes(item)} onChange={() => handleAllergyToggle(item)} className="mt-1 w-4 h-4 accent-[#E0314C]" />
                    <div><p className="font-medium text-[#1A365D]">{item}</p></div>
                  </label>
                ))}

                <label className="flex flex-col gap-2 p-2 rounded-lg hover:bg-white transition-all">
                  <div className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.allergies.includes('แพ้อื่นๆ')} onChange={() => handleAllergyToggle('แพ้อื่นๆ')} className="w-4 h-4 accent-[#E0314C]" />
                    <p className="font-medium text-[#1A365D]">แพ้อื่นๆ (โปรดระบุ)</p>
                  </div>
                  {formData.allergies.includes('แพ้อื่นๆ') && (
                    <input type="text" className={`${inputStyle} mt-1`} value={formData.allergyOther} onChange={e => setFormData({...formData, allergyOther: e.target.value})} placeholder="ระบุสิ่งที่แพ้..." />
                  )}
                </label>
              </div>
            )}
          </div>
        </section>

        <hr className="border-[#E2E8F0]" />

        {/* ส่วนที่ 3 */}
        <section className="space-y-4">
          <h4 className="font-bold text-[#1A365D] flex items-center gap-2">
            <Activity size={18} className="text-[#FF8C9A]" /> ส่วนที่ 3: ภาวะสุขภาพและโรคประจำตัว
          </h4>
          
          <div className="space-y-3 md:pl-7">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-transparent hover:bg-[#F8FAFC] transition-all">
              <input type="radio" checked={formData.hasCondition === false} onChange={() => setFormData({...formData, hasCondition: false, conditions: [], conditionOther: ''})} className="w-5 h-5 accent-[#FF8C9A]" />
              <span className="font-semibold text-[#1A365D]">ไม่มี ภาวะสุขภาพหรือโรคประจำตัวใดๆ</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-transparent hover:bg-[#F8FAFC] transition-all">
              <input type="radio" checked={formData.hasCondition === true} onChange={() => setFormData({...formData, hasCondition: true})} className="w-5 h-5 accent-[#FF8C9A]" />
              <span className="font-semibold text-[#1A365D]">มี โรคประจำตัว หรือ ภาวะสุขภาพ</span>
            </label>

            {formData.hasCondition === true && (
              <div className="ml-8 mt-2 space-y-3 p-4 bg-[#FFF0F2] rounded-xl border border-[#FFE0E4] animate-fade-in">
                <p className="text-sm font-semibold text-[#E0314C] mb-3">กรุณาเลือกทุกข้อที่ตรงกับคุณ (เพื่อให้ทันตแพทย์ประเมินความเสี่ยงและวางแผนการรักษาได้อย่างปลอดภัย)</p>
                {[
                  'กลุ่มเลือดและหัวใจ: ทานยาละลายลิ่มเลือด / โรคหัวใจ / ความดันโลหิตสูง / เคยทำบอลลูนหัวใจ',
                  'กลุ่มเบาหวาน: โรคเบาหวาน (ทั้งที่คุมได้และคุมไม่ได้)',
                  'กลุ่มกระดูกและมะเร็ง: โรคกระดูกพรุน / ทานหรือฉีดยารักษากระดูก / มีประวัติฉายแสงรักษามะเร็ง',
                  'กลุ่มทางเดินหายใจและโรคติดต่อ: หอบหืดรุนแรง / โรคติดต่อทางเดินหายใจ / โรคติดต่อทางเลือด',
                  'สำหรับสุภาพสตรี: กำลังตั้งครรภ์ หรือ ให้นมบุตร'
                ].map(item => (
                  <label key={item} className="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-white transition-all">
                    <input type="checkbox" checked={formData.conditions.includes(item)} onChange={() => handleConditionToggle(item)} className="mt-1 w-4 h-4 accent-[#E0314C]" />
                    <div><p className="font-medium text-[#1A365D]">{item}</p></div>
                  </label>
                ))}
                
                <label className="flex flex-col gap-2 p-2 rounded-lg hover:bg-white transition-all">
                  <div className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.conditions.includes('โรคอื่นๆ')} onChange={() => handleConditionToggle('โรคอื่นๆ')} className="w-4 h-4 accent-[#E0314C]" />
                    <p className="font-medium text-[#1A365D]">โรคประจำตัวอื่นๆ (โปรดระบุ)</p>
                  </div>
                  {formData.conditions.includes('โรคอื่นๆ') && (
                    <input type="text" className={`${inputStyle} mt-1`} value={formData.conditionOther} onChange={e => setFormData({...formData, conditionOther: e.target.value})} placeholder="ระบุโรคประจำตัว..." />
                  )}
                </label>
              </div>
            )}
          </div>
        </section>

        <hr className="border-[#E2E8F0]" />

        {/* ส่วนที่ 4 */}
        <section className="space-y-4">
          <h4 className="font-bold text-[#1A365D] flex items-center gap-2">
            <CheckSquare size={18} className="text-[#FF8C9A]" /> ส่วนที่ 4: ความยินยอม (E-Consent)
          </h4>
          
          <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.consent ? 'border-[#1B7A3E] bg-[#E8FFF0]' : 'border-[#E2E8F0] hover:border-[#FF8C9A] bg-[#F8FAFC]'}`}>
            <input type="checkbox" checked={formData.consent} onChange={e => setFormData({...formData, consent: e.target.checked})} className="mt-1 w-6 h-6 accent-[#1B7A3E]" />
            <div>
              <p className={`font-bold text-sm ${formData.consent ? 'text-[#1B7A3E]' : 'text-[#1A365D]'}`}>ข้าพเจ้ายืนยันว่าข้อมูลสุขภาพและประวัติการแพ้ยาข้างต้นเป็นความจริงทุกประการ</p>
              <p className="text-xs text-[#4A6080] mt-1">ข้าพเจ้ารับทราบว่าการปกปิดข้อมูลอาจส่งผลอันตรายต่อชีวิตและการรักษา และข้าพเจ้ายินยอมให้คลินิกจัดเก็บข้อมูลส่วนบุคคลนี้เพื่อใช้ในการประเมินและวางแผนการรักษาทางทันตกรรม</p>
            </div>
          </label>
        </section>

      </div>
    </div>
    )}
    </div>
  );
}
