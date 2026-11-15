import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert, User, Activity, CheckSquare } from 'lucide-react';
import { PatientUser } from '../types';

export interface HealthChecklistData {
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
  hasAllergy: boolean | null;
  allergiesText: string;
  allergies?: string[];
  allergyOther?: string;
  hasCondition: boolean | null;
  conditionsText: string;
  conditions?: string[];
  conditionOther?: string;
  hasMedications?: boolean | null;
  medicationNote?: string;
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

  // ตรวจสอบว่าเคยมีข้อมูลสุขภาพในระบบหรือไม่
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
      const hasEmergency =
        formData.emergencyName.trim() !== '' &&
        formData.emergencyPhone.trim() !== '' &&
        formData.emergencyRelationship.trim() !== '';

      const validAllergy =
        formData.hasAllergy === false ||
        (formData.hasAllergy === true && (formData.allergiesText || '').trim() !== '');

      const validCondition =
        formData.hasCondition === false ||
        (formData.hasCondition === true && (formData.conditionsText || '').trim() !== '');

      const validConsent = formData.consent;

      valid = hasEmergency && validAllergy && validCondition && validConsent;
    }

    onChange(formData, valid);
  }, [formData, isReturning]);

  const inputStyle = "w-full px-4 py-3 rounded-xl border text-base outline-none transition-all focus:ring-2 focus:ring-[#FF8C9A]/40 bg-[#F0F4F8] border-transparent text-[#1A365D]";

  const renderReturningUserOptions = () => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] space-y-6 animate-fade-in mb-6">
      <div className="text-[#1A365D] mb-2">
        <h3 className="font-bold text-lg">ยืนยันข้อมูลสุขภาพ</h3>
        <p className="text-sm text-[#4A6080]">ประวัติสุขภาพล่าสุดของคุณระบุว่า:</p>
      </div>

      <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0] space-y-2">
        <p className="text-sm text-[#4A6080]"><span className="font-semibold text-[#1A365D]">โรคประจำตัว:</span> {user?.conditions || 'ไม่มี'}</p>
        <p className="text-sm text-[#4A6080]"><span className="font-semibold text-[#1A365D]">ประวัติแพ้ยา:</span> {user?.allergies || 'ไม่มี'}</p>
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
                hasAllergy: user?.allergies && user.allergies !== 'ไม่มี' && user.allergies !== 'ไม่มีประวัติ' ? true : null,
                allergiesText: user?.allergies && user.allergies !== 'ไม่มี' && user.allergies !== 'ไม่มีประวัติ' ? user.allergies : '',
                allergies: [],
                allergyOther: '',
                hasCondition: user?.conditions && user.conditions !== 'ไม่มี' && user.conditions !== 'ไม่มีประวัติ' ? true : null,
                conditionsText: user?.conditions && user.conditions !== 'ไม่มี' && user.conditions !== 'ไม่มีประวัติ' ? user.conditions : '',
                conditions: [],
                conditionOther: '',
                hasMedications: null,
                medicationNote: '',
                consent: false
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
              แบบฟอร์มประวัติสุขภาพและใบยินยอม
            </h3>
            <p className="text-sm opacity-90 mt-1">เพื่อความปลอดภัยสูงสุด กรุณาให้ข้อมูลตามความเป็นจริง (ข้อมูลถูกจัดเก็บเป็นความลับ)</p>
          </div>

          <div className="p-6 space-y-8">

            {/* ส่วนที่ 1: ข้อมูลผู้ติดต่อฉุกเฉิน */}
            <section className="space-y-4">
              <h4 className="font-bold text-[#1A365D] flex items-center gap-2">
                ส่วนที่ 1: ข้อมูลผู้ติดต่อฉุกเฉิน
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:pl-7">
                <div>
                  <label className="block text-sm font-medium text-[#4A6080] mb-1">ชื่อ-นามสกุล ผู้ติดต่อฉุกเฉิน</label>
                  <input type="text" className={inputStyle} value={formData.emergencyName} onChange={e => setFormData({ ...formData, emergencyName: e.target.value })} placeholder="ระบุชื่อผู้ติดต่อฉุกเฉิน" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A6080] mb-1">ความสัมพันธ์กับคนไข้</label>
                  <input type="text" className={inputStyle} value={formData.emergencyRelationship} onChange={e => setFormData({ ...formData, emergencyRelationship: e.target.value })} placeholder="เช่น บิดา, มารดา, สามี" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A6080] mb-1">เบอร์โทรศัพท์ผู้ติดต่อฉุกเฉิน</label>
                  <input type="tel" className={inputStyle} value={formData.emergencyPhone} onChange={e => setFormData({ ...formData, emergencyPhone: e.target.value })} placeholder="08X-XXX-XXXX" maxLength={10} />
                </div>
              </div>
            </section>

            <hr className="border-[#E2E8F0]" />

            {/* ส่วนที่ 2: ประวัติการแพ้ยาและสารเคมี */}
            <section className="space-y-4">
              <h4 className="font-bold text-[#1A365D] flex items-center gap-2">
                ส่วนที่ 2: ประวัติการแพ้ยาและสารเคมี
              </h4>

              <div className="space-y-3 md:pl-7">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-transparent hover:bg-[#F8FAFC] transition-all">
                  <input
                    type="radio"
                    name="hasAllergy"
                    checked={formData.hasAllergy === false}
                    onChange={() => setFormData({ ...formData, hasAllergy: false, allergiesText: '', allergies: [], allergyOther: '' })}
                    className="w-5 h-5 accent-[#FF8C9A]"
                  />
                  <span className="font-semibold text-[#1A365D]">ไม่เคยมีประวัติแพ้ยา หรือสารเคมีใดๆ</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-transparent hover:bg-[#F8FAFC] transition-all">
                  <input
                    type="radio"
                    name="hasAllergy"
                    checked={formData.hasAllergy === true}
                    onChange={() => setFormData({ ...formData, hasAllergy: true })}
                    className="w-5 h-5 accent-[#FF8C9A]"
                  />
                  <span className="font-semibold text-[#1A365D]">มีประวัติแพ้ยา หรือสารเคมี</span>
                </label>

                {formData.hasAllergy === true && (
                  <div className="ml-8 mt-2 space-y-3 p-4 bg-[#FFF0F2] rounded-xl border border-[#FFE0E4] animate-fade-in">
                    <label className="block text-sm font-semibold text-[#E0314C]">
                      ระบุรายละเอียดตัวยา สารเคมี หรือยาชาที่แพ้:
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-[#FF8C9A]/40 bg-white border-[#FFE0E4] text-[#1A365D] placeholder:text-[#4A6080]/60 resize-none shadow-sm"
                      value={formData.allergiesText}
                      onChange={(e) => setFormData({ ...formData, allergiesText: e.target.value })}
                      placeholder="เช่น แพ้ยาแก้ปวดไอบูโพรเฟน, เพนิซิลลิน, ยาชาสำหรับทำฟัน, ถุงมือยางลาเท็กซ์ (ระบุอาการที่แพ้เพิ่มเติมได้)"
                    />
                    <p className="text-xs text-[#E0314C]/80">
                      * ข้อมูลนี้สำคัญอย่างยิ่ง เพื่อให้ทันตแพทย์เตรียมยาและสารทางทันตกรรมที่ปลอดภัยสำหรับคุณ
                    </p>
                  </div>
                )}
              </div>
            </section>

            <hr className="border-[#E2E8F0]" />

            {/* ส่วนที่ 3: ภาวะสุขภาพและโรคประจำตัว */}
            <section className="space-y-4">
              <h4 className="font-bold text-[#1A365D] flex items-center gap-2">
                ส่วนที่ 3: ภาวะสุขภาพและโรคประจำตัว
              </h4>

              <div className="space-y-3 md:pl-7">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-transparent hover:bg-[#F8FAFC] transition-all">
                  <input
                    type="radio"
                    name="hasCondition"
                    checked={formData.hasCondition === false}
                    onChange={() => setFormData({ ...formData, hasCondition: false, conditionsText: '', conditions: [], conditionOther: '' })}
                    className="w-5 h-5 accent-[#FF8C9A]"
                  />
                  <span className="font-semibold text-[#1A365D]">ไม่มี ภาวะสุขภาพหรือโรคประจำตัวใดๆ</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-transparent hover:bg-[#F8FAFC] transition-all">
                  <input
                    type="radio"
                    name="hasCondition"
                    checked={formData.hasCondition === true}
                    onChange={() => setFormData({ ...formData, hasCondition: true })}
                    className="w-5 h-5 accent-[#FF8C9A]"
                  />
                  <span className="font-semibold text-[#1A365D]">มี โรคประจำตัว หรือ ภาวะสุขภาพ</span>
                </label>

                {formData.hasCondition === true && (
                  <div className="ml-8 mt-2 space-y-3 p-4 bg-[#FFF0F2] rounded-xl border border-[#FFE0E4] animate-fade-in">
                    <label className="block text-sm font-semibold text-[#E0314C]">
                      ระบุโรคประจำตัว ยาที่ทานประจำ หรือภาวะสุขภาพ:
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-[#FF8C9A]/40 bg-white border-[#FFE0E4] text-[#1A365D] placeholder:text-[#4A6080]/60 resize-none shadow-sm"
                      value={formData.conditionsText}
                      onChange={(e) => setFormData({ ...formData, conditionsText: e.target.value })}
                      placeholder="เช่น ทานยาละลายลิ่มเลือด, โรคหัวใจ, ความดันโลหิตสูง, เบาหวาน, โรคกระดูกพรุน, หอบหืด, กำลังตั้งครรภ์/ให้นมบุตร"
                    />
                    <p className="text-xs text-[#E0314C]/80">
                      * โปรดระบุชื่อยาประจำตัว (โดยเฉพาะยาละลายลิ่มเลือดหรือยารักษากระดูก) เพื่อการวางแผนหัตถการอย่างปลอดภัย
                    </p>
                  </div>
                )}
              </div>
            </section>

            <hr className="border-[#E2E8F0]" />

            {/* ส่วนที่ 4: ความยินยอม (E-Consent) */}
            <section className="space-y-4">
              <h4 className="font-bold text-[#1A365D] flex items-center gap-2">
                ส่วนที่ 4: ความยินยอม
              </h4>

              <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.consent ? 'border-[#1B7A3E] bg-[#E8FFF0]' : 'border-[#E2E8F0] hover:border-[#FF8C9A] bg-[#F8FAFC]'}`}>
                <input type="checkbox" checked={formData.consent} onChange={e => setFormData({ ...formData, consent: e.target.checked })} className="mt-1 w-6 h-6 accent-[#1B7A3E]" />
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
