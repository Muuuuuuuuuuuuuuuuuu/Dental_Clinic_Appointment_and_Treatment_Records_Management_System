import { X, ShieldCheck, Lock, FileText, UserCheck, HeartPulse, Phone, Check } from "lucide-react";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 🛡️ [PRIVACY POLICY MODAL]
 * ป๊อปอัปนโยบายความเป็นส่วนตัวและคุ้มครองข้อมูลส่วนบุคคล (PDPA)
 * สำหรับคลินิกทันตกรรมสุภัทร ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
 */
export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200"
        style={{ fontFamily: "Sarabun, sans-serif" }}
      >
        {/* ส่วนหัว Modal */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#0F2340] to-[#1A365D] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#FF8C9A]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold">นโยบายความเป็นส่วนตัว (Privacy Notice)</h2>
              <p className="text-xs text-white/70">
                คลินิกทันตกรรมสุภัทร · การคุ้มครองข้อมูลส่วนบุคคลตาม พ.ร.บ. PDPA พ.ศ. 2562
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all"
            aria-label="ปิดหน้าต่าง"
          >
            <X size={18} />
          </button>
        </div>

        {/* เนื้อหานโยบาย เลื่อนอ่านได้ */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-sm text-gray-600 leading-relaxed custom-scrollbar">
          {/* ข้อมูลเบื้องต้น */}
          <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100/80 flex items-start gap-3">
            <Lock className="text-blue-600 mt-0.5 shrink-0" size={18} />
            <p className="text-xs text-blue-900 leading-normal">
              <strong>คลินิกทันตกรรมสุภัทร</strong> ให้ความสำคัญสูงสุดกับความปลอดภัยของข้อมูลส่วนบุคคลและข้อมูลสุขภาพช่องปากของผู้รับบริการ นโยบายฉบับนี้จัดทำขึ้นเพื่อชี้แจงให้ท่านทราบถึงวิธีการเก็บรวบรวม การใช้ การเก็บรักษา และสิทธิของท่านในฐานะเจ้าของข้อมูลส่วนบุคคล
            </p>
          </div>

          {/* ข้อ 1 */}
          <div>
            <h3 className="text-sm font-bold text-[#0F2340] mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#FF8C9A]/20 text-[#D94F65] flex items-center justify-center text-xs font-bold">1</span>
              ข้อมูลส่วนบุคคลที่คลินิกจัดเก็บรวบรวม
            </h3>
            <p className="mb-2 text-xs text-gray-500">
              คลินิกจะจัดเก็บข้อมูลเท่าที่จำเป็นสำหรับการให้บริการรักษาทันตกรรมและการบริหารจัดการนัดหมาย:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600">
              <li>
                <strong>ข้อมูลทั่วไปและข้อมูลติดต่อ:</strong> ชื่อ, นามสกุล, เลขประจำตัวประชาชน, วันเดือนปีเกิด, เพศ, หมายเลขโทรศัพท์, อีเมล และที่อยู่ปัจจุบัน
              </li>
              <li>
                <strong>ข้อมูลสุขภาพและประวัติการรักษา (ข้อมูลอ่อนไหว - Sensitive Data):</strong> ประวัติการแพ้ยา, โรคประจำตัว, ประวัติการผ่าตัด, ประวัติสุขภาพช่องปาก, ผังฟัน (Odontogram), ภาพถ่ายทางรังสี (X-ray) และบันทึกขั้นตอนการรักษา
              </li>
              <li>
                <strong>ข้อมูลการนัดหมายและการใช้บริการ:</strong> วันที่และเวลานัดหมาย, ทันตแพทย์ผู้ให้การรักษา, รายการบริการทันตกรรม, ประวัติการเลื่อนหรือยกเลิกนัดหมาย
              </li>
              <li>
                <strong>ข้อมูลการเงินและการชำระเงิน:</strong> บันทึกค่าบริการ, รายละเอียดใบเสร็จรับเงิน, หลักฐานการชำระเงิน (สลิปโอนเงิน)
              </li>
            </ul>
          </div>

          {/* ข้อ 2 */}
          <div>
            <h3 className="text-sm font-bold text-[#0F2340] mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#FF8C9A]/20 text-[#D94F65] flex items-center justify-center text-xs font-bold">2</span>
              วัตถุประสงค์ในการประมวลผลข้อมูล
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2">
                <HeartPulse size={16} className="text-rose-500 mt-0.5 shrink-0" />
                <span className="text-xs text-gray-700">การวินิจฉัย วางแผน และดำเนินกระบวนการรักษาทันตกรรมอย่างปลอดภัย</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2">
                <FileText size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <span className="text-xs text-gray-700">การจัดทำบันทึกเวชระเบียนคนไข้ตามมาตรฐานพระราชบัญญัติสถานพยาบาล</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2">
                <UserCheck size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-xs text-gray-700">การยืนยันตัวตน, จัดการระบบคิวตรวจ, และการแจ้งเตือนใกล้นัดหมาย</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2">
                <Lock size={16} className="text-amber-500 mt-0.5 shrink-0" />
                <span className="text-xs text-gray-700">การออกเอกสารทางการเงิน ใบรับรองแพทย์ และการปฏิบัติตามกฎหมายบัญชี-ภาษี</span>
              </div>
            </div>
          </div>

          {/* ข้อ 3 */}
          <div>
            <h3 className="text-sm font-bold text-[#0F2340] mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#FF8C9A]/20 text-[#D94F65] flex items-center justify-center text-xs font-bold">3</span>
              มาตรการรักษาความปลอดภัยของข้อมูล
            </h3>
            <p className="text-xs text-gray-600 leading-normal">
              คลินิกใช้มาตรการทางเทคนิคและบริหารจัดการเพื่อปกป้องข้อมูลส่วนบุคคลของท่านจากการเข้าถึง แก้ไข หรือเปิดเผยโดยมิชอบ รวมถึงการเข้ารหัสข้อมูลที่เก็บรักษาในระบบคลาวด์ การจำกัดสิทธิ์การเข้าถึงเวชระเบียนเฉพาะทันตแพทย์และเจ้าหน้าที่คลินิกที่ได้รับมอบหมายเท่านั้น
            </p>
          </div>

          {/* ข้อ 4 */}
          <div>
            <h3 className="text-sm font-bold text-[#0F2340] mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#FF8C9A]/20 text-[#D94F65] flex items-center justify-center text-xs font-bold">4</span>
              ระยะเวลาการเก็บรักษาข้อมูล
            </h3>
            <p className="text-xs text-gray-600 leading-normal">
              คลินิกจะเก็บรักษาประวัติการรักษาและเวชระเบียนของท่านไว้เป็นเวลาอย่างน้อย <strong>5 ปี</strong> นับจากวันที่ท่านได้รับการรักษาครั้งล่าสุด ตามเกณฑ์และระเบียบปฏิบัติของพระราชบัญญัติสถานพยาบาล พ.ศ. 2541 และกฎหมายที่เกี่ยวข้อง
            </p>
          </div>

          {/* ข้อ 5 */}
          <div>
            <h3 className="text-sm font-bold text-[#0F2340] mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#FF8C9A]/20 text-[#D94F65] flex items-center justify-center text-xs font-bold">5</span>
              สิทธิของเจ้าของข้อมูลส่วนบุคคล (คนไข้)
            </h3>
            <p className="mb-2 text-xs text-gray-500">
              ภายใต้พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 ท่านมีสิทธิตามกฎหมายดังต่อไปนี้:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 p-2 bg-gray-50/80 rounded-lg">
                <Check size={14} className="text-emerald-500 shrink-0" />
                <span>สิทธิขอเข้าถึงและขอรับสำเนาประวัติการรักษา</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-gray-50/80 rounded-lg">
                <Check size={14} className="text-emerald-500 shrink-0" />
                <span>สิทธิขอให้แก้ไขข้อมูลให้ถูกต้องและเป็นปัจจุบัน</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-gray-50/80 rounded-lg">
                <Check size={14} className="text-emerald-500 shrink-0" />
                <span>สิทธิขอให้ระงับการใช้หรือทำลายข้อมูล (เมื่อพ้นกำหนดเก็บตามกฎหมาย)</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-gray-50/80 rounded-lg">
                <Check size={14} className="text-emerald-500 shrink-0" />
                <span>สิทธิในการเพิกถอนความยินยอมในการรับข่าวสารประชาสัมพันธ์</span>
              </div>
            </div>
          </div>

          {/* ข้อ 6 */}
          <div>
            <h3 className="text-sm font-bold text-[#0F2340] mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#FF8C9A]/20 text-[#D94F65] flex items-center justify-center text-xs font-bold">6</span>
              ช่องทางการติดต่อคลินิก
            </h3>
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5 text-xs text-gray-700">
              <p className="font-semibold text-gray-900">คลินิกทันตกรรมสุภัทร (ผู้ควบคุมข้อมูลส่วนบุคคล)</p>
              <p>ที่อยู่: เลขที่ 1 หมู่ 6 ตำบลกำแพงแสน อำเภอกำแพงแสน จังหวัดนครปฐม 73140</p>
              <div className="flex flex-wrap gap-4 pt-1 text-gray-600">
                <span className="flex items-center gap-1">
                  <Phone size={13} className="text-[#FF8C9A]" /> โทรศัพท์: 02-555-1234
                </span>
                <span>เวลาทำการ: จันทร์–เสาร์ 09:00–20:00 น.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ส่วนท้าย Modal */}
        <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-400">
            ปรับปรุงล่าสุด: พฤศจิกายน 2569
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1A365D] to-[#0F2340] text-white text-xs font-bold hover:brightness-110 transition-all shadow-sm"
          >
            รับทราบและปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
