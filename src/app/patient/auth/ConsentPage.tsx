import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ShieldCheck, CheckCircle2, ScrollText, AlertCircle } from "lucide-react";
import AuthShell from "./AuthShell";

interface ConsentPageProps {
  onAccept: () => void;
  onBack: () => void;
  loading?: boolean;
  error?: string;
}

export default function ConsentPage({ onAccept, onBack, loading, error }: ConsentPageProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const threshold = 40;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
      if (atBottom) setHasScrolledToBottom(true);
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AuthShell title="นโยบายความเป็นส่วนตัว" sub="กรุณาอ่านและยินยอมก่อนดำเนินการต่อ">
      {/* Icon header */}
      <div className="flex flex-col items-center mb-5">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
          style={{ background: "linear-gradient(135deg, #E8F4FF 0%, #F0F4F8 100%)" }}
        >
          <ScrollText size={28} style={{ color: "#1A365D" }} />
        </div>
        <h3 className="text-base font-semibold" style={{ color: "#1A365D" }}>
          ข้อกำหนดและเงื่อนไขการใช้บริการ
        </h3>
        <p className="text-xs mt-1" style={{ color: "#4A6080" }}>
          คลินิกทันตกรรมสุภัทร
        </p>
      </div>

      {/* Scrollable policy content */}
      <div
        ref={scrollRef}
        className="rounded-2xl border overflow-y-auto text-sm leading-relaxed px-5 py-4 mb-4"
        style={{
          maxHeight: 320,
          borderColor: "rgba(26,54,93,0.12)",
          backgroundColor: "#FAFBFC",
          color: "#2D3748",
        }}
      >
        <PolicyContent />

        {/* Bottom marker */}
        <div className="flex items-center gap-2 mt-6 pt-4" style={{ borderTop: "1px solid rgba(26,54,93,0.08)" }}>
          <ShieldCheck size={16} style={{ color: "#22C55E" }} />
          <span className="text-xs font-medium" style={{ color: "#22C55E" }}>
            คุณได้อ่านนโยบายครบถ้วนแล้ว
          </span>
        </div>
      </div>

      {/* Scroll hint */}
      {!hasScrolledToBottom && (
        <div
          className="flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl mb-3 animate-pulse"
          style={{ backgroundColor: "#FFF3E0", color: "#E65100" }}
        >
          <AlertCircle size={13} />
          กรุณาเลื่อนอ่านจนจบเพื่อดำเนินการต่อ
        </div>
      )}

      {/* Consent checkbox */}
      <label
        className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all"
        style={{
          backgroundColor: agreed ? "#F0FFF4" : "#F0F4F8",
          border: `1.5px solid ${agreed ? "#22C55E" : "rgba(26,54,93,0.12)"}`,
          opacity: hasScrolledToBottom ? 1 : 0.5,
          pointerEvents: hasScrolledToBottom ? "auto" : "none",
        }}
      >
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 w-5 h-5 rounded accent-[#22C55E] flex-shrink-0"
        />
        <span className="text-sm" style={{ color: "#1A365D" }}>
          ข้าพเจ้าได้อ่านและเข้าใจ <strong>นโยบายความเป็นส่วนตัว</strong> และ{" "}
          <strong>ข้อกำหนดและเงื่อนไขการใช้บริการ</strong> ของคลินิกทันตกรรมสุภัทรแล้ว
          และยินยอมให้คลินิกเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของข้าพเจ้า
          ตามวัตถุประสงค์ที่ระบุไว้ในนโยบายฯ
        </span>
      </label>

      {/* Buttons */}
      <div className="flex gap-3 mt-5">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl font-medium transition-all hover:opacity-80"
          style={{ border: "1.5px solid rgba(26,54,93,0.2)", color: "#1A365D" }}
        >
          <span className="flex items-center justify-center gap-1">
            <ChevronLeft size={14} /> ย้อนกลับ
          </span>
        </button>
        <button
          onClick={onAccept}
          disabled={!agreed || !hasScrolledToBottom}
          className="flex-1 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)",
            boxShadow: agreed ? "0 4px 20px rgba(255,140,154,0.4)" : "none",
          }}
        >
          <span className="flex items-center justify-center gap-1.5">
            <CheckCircle2 size={15} />
            ยินยอมและดำเนินการต่อ
          </span>
        </button>
      </div>
    </AuthShell>
  );
}

/* ─── Policy Text Content ──────────────────────────────────────────────────── */

function PolicyContent() {
  const sectionTitle = "text-sm font-bold mb-2";
  const sectionStyle = { color: "#1A365D" };
  const listCls = "list-disc pl-5 space-y-1 mb-4";

  return (
    <>
      <p className="font-semibold text-base mb-3" style={{ color: "#1A365D" }}>
        ประกาศนโยบายความเป็นส่วนตัว (Privacy Notice)
      </p>
      <p className="mb-4" style={{ color: "#4A6080" }}>
        ประกาศนโยบายความเป็นส่วนตัว ("ประกาศ") นี้ จัดทำขึ้นเพื่อให้ท่านซึ่งเป็นผู้ใช้งานระบบ
        คลินิกทันตกรรมสุภัทร ได้ทราบและเข้าใจรูปแบบการเก็บรวบรวม ใช้ และเปิดเผย ("ประมวลผล")
        ข้อมูลส่วนบุคคลที่คลินิกทันตกรรมสุภัทร ซึ่งต่อไปนี้ในประกาศนี้เรียกว่า "คลินิก"
        เป็นผู้ดำเนินการโดยคลินิกเป็นผู้ควบคุมข้อมูล ส่วนบุคคลในข้อมูลส่วนบุคคลที่เก็บรวบรวมจากท่าน
        เพื่อดำเนินการภายใต้ระบบนี้
      </p>

      <p className="mb-4" style={{ color: "#4A6080" }}>
        คลินิกทันตกรรมสุภัทร ได้จัดทำเว็บไซต์และระบบจัดการนัดหมายออนไลน์ขึ้น
        เพื่อให้ท่านในฐานะเจ้าของข้อมูลส่วนบุคคล สามารถเข้าถึงบริการสาธารณสุขด้านทันตกรรมได้อย่างสะดวก
        โดย แพลตฟอร์มนี้ท่านมีความจำเป็นต้องให้ข้อมูลส่วนบุคคล เพื่อปฏิบัติตามกฎหมาย สัญญา
        หรือความจำเป็นต้องให้ข้อมูลส่วนบุคคลเพื่อทำสัญญาหรือให้บริการ ด้านสาธารณสุขและหากท่านให้ข้อมูลอาจทำให้ท่าน
        ไม่สามารถใช้บริการระบบนัดหมายออนไลน์ได้ ทั้งนี้เราดำเนินการเกี่ยวกับการเก็บ รวบรวม ใช้
        หรือเปิดเผยข้อมูลส่วนบุคคลของท่านดังนี้
      </p>

      <p className={sectionTitle} style={sectionStyle}>
        1. ฐานกฎหมายในการประมวลผลข้อมูลส่วนบุคคล
      </p>
      <p className="mb-4" style={{ color: "#4A6080" }}>
        คลินิกทันตกรรมสุภัทรดำเนินการเก็บรวบรวมข้อมูลส่วนบุคคลของท่านภายใต้เหตุผลโดยชอบด้วยกฎหมายเพื่อ
        ความจำเป็น ในการดำเนินการตามภารกิจสาธารณสุขหรือนโยบายของคลินิก โดยดำเนินการตามพระราชบัญญัติคุ้มครอง
        ข้อมูลส่วนบุคคล พ.ศ. 2562
      </p>

      <p className={sectionTitle} style={sectionStyle}>
        2. วัตถุประสงค์ในการเก็บรวบรวมข้อมูลส่วนบุคคล
      </p>
      <p className="mb-2" style={{ color: "#4A6080" }}>
        คลินิกมีความจำเป็นต้องเก็บรวบรวมข้อมูลส่วนบุคคลของท่าน เพื่อวัตถุประสงค์ดังต่อไปนี้:
      </p>
      <ul className={listCls} style={{ color: "#4A6080" }}>
        <li>เพื่อยืนยันตัวตนของท่านในการเข้าใช้ระบบนัดหมายออนไลน์</li>
        <li>เพื่อบริหารจัดการนัดหมายทันตกรรม การติดตามผลการรักษา และการแจ้งเตือนนัดหมาย</li>
        <li>เพื่อจัดเก็บประวัติการรักษาทันตกรรม เพื่อประโยชน์ในการรักษาต่อเนื่องและความปลอดภัยของผู้ป่วย</li>
        <li>เพื่อประโยชน์ในการวินิจฉัยโรค การรักษาพยาบาล หรือการให้บริการด้านสาธารณสุข</li>
        <li>เพื่อติดต่อสื่อสาร แจ้งข่าวสาร โปรโมชั่น หรือข้อมูลบริการที่เกี่ยวข้อง</li>
        <li>เพื่อปฏิบัติตามกฎหมายที่เกี่ยวข้อง รวมถึงพระราชบัญญัติสถานพยาบาล และกฎหมายวิชาชีพทันตกรรม</li>
      </ul>

      <p className={sectionTitle} style={sectionStyle}>
        3. ข้อมูลส่วนบุคคลที่เก็บรวบรวม
      </p>
      <p className="mb-2" style={{ color: "#4A6080" }}>
        คลินิกอาจเก็บรวบรวมข้อมูลส่วนบุคคลของท่าน ดังต่อไปนี้:
      </p>
      <ul className={listCls} style={{ color: "#4A6080" }}>
        <li><strong>ข้อมูลระบุตัวตน:</strong> ชื่อ-นามสกุล, เลขบัตรประชาชน, วันเดือนปีเกิด, เพศ</li>
        <li><strong>ข้อมูลการติดต่อ:</strong> หมายเลขโทรศัพท์, อีเมล, ข้อมูลผู้ติดต่อฉุกเฉิน</li>
        <li><strong>ข้อมูลสุขภาพ:</strong> ประวัติโรคประจำตัว, ประวัติการแพ้ยา, ประวัติการรักษาทันตกรรม</li>
        <li><strong>ข้อมูลบัญชี:</strong> อีเมลและรหัสผ่านสำหรับเข้าสู่ระบบ (รหัสผ่านถูกเข้ารหัสเพื่อความปลอดภัย)</li>
        <li><strong>ข้อมูลการใช้งาน:</strong> ข้อมูลการนัดหมาย, ประวัติการรักษา, บันทึกการเข้าใช้ระบบ</li>
      </ul>

      <p className={sectionTitle} style={sectionStyle}>
        4. ระยะเวลาในการเก็บรักษาข้อมูล
      </p>
      <p className="mb-4" style={{ color: "#4A6080" }}>
        คลินิกจะเก็บรักษาข้อมูลส่วนบุคคลของท่านไว้ตามระยะเวลาที่จำเป็นเพื่อวัตถุประสงค์ที่ระบุไว้ข้างต้น
        หรือตามที่กฎหมายกำหนด ทั้งนี้ ประวัติการรักษาทางการแพทย์จะถูกเก็บรักษาไว้ไม่น้อยกว่า 5 ปี
        นับจากวันที่ให้บริการครั้งสุดท้าย หรือตามที่กฎหมายว่าด้วยสถานพยาบาลกำหนด
      </p>

      <p className={sectionTitle} style={sectionStyle}>
        5. การเปิดเผยข้อมูลส่วนบุคคล
      </p>
      <p className="mb-2" style={{ color: "#4A6080" }}>
        คลินิกอาจเปิดเผยข้อมูลส่วนบุคคลของท่านให้แก่บุคคลภายนอก ในกรณีต่อไปนี้:
      </p>
      <ul className={listCls} style={{ color: "#4A6080" }}>
        <li>ทันตแพทย์และบุคลากรทางการแพทย์ที่เกี่ยวข้องในการให้บริการรักษา</li>
        <li>หน่วยงานราชการหรือหน่วยงานกำกับดูแล ตามที่กฎหมายกำหนด</li>
        <li>ผู้ให้บริการระบบเทคโนโลยีสารสนเทศที่เกี่ยวข้อง (ภายใต้สัญญาและมาตรการคุ้มครองข้อมูลที่เหมาะสม)</li>
        <li>บริษัทประกันภัย กรณีที่ท่านใช้สิทธิประกันสุขภาพ (ต้องได้รับความยินยอมจากท่านก่อน)</li>
      </ul>

      <p className={sectionTitle} style={sectionStyle}>
        6. สิทธิของเจ้าของข้อมูลส่วนบุคคล
      </p>
      <p className="mb-2" style={{ color: "#4A6080" }}>
        ท่านมีสิทธิตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 ดังนี้:
      </p>
      <ul className={listCls} style={{ color: "#4A6080" }}>
        <li><strong>สิทธิในการเข้าถึง:</strong> ท่านมีสิทธิขอเข้าถึงข้อมูลส่วนบุคคลของท่านที่คลินิกเก็บรวบรวมไว้</li>
        <li><strong>สิทธิในการแก้ไข:</strong> ท่านมีสิทธิขอแก้ไขข้อมูลส่วนบุคคลให้ถูกต้อง สมบูรณ์ และเป็นปัจจุบัน</li>
        <li><strong>สิทธิในการลบ:</strong> ท่านมีสิทธิขอให้ลบหรือทำลายข้อมูลส่วนบุคคล เว้นแต่กรณีที่กฎหมายกำหนดไว้เป็นอย่างอื่น</li>
        <li><strong>สิทธิในการคัดค้าน:</strong> ท่านมีสิทธิคัดค้านการประมวลผลข้อมูลส่วนบุคคลในบางกรณี</li>
        <li><strong>สิทธิในการถอนความยินยอม:</strong> ท่านสามารถถอนความยินยอมได้ทุกเมื่อ โดยการถอนความยินยอมจะไม่กระทบต่อ
          การประมวลผลที่ได้ดำเนินการไปก่อนหน้า</li>
        <li><strong>สิทธิในการร้องเรียน:</strong> ท่านมีสิทธิร้องเรียนต่อสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล
          หากเชื่อว่าคลินิกฝ่าฝืนกฎหมายคุ้มครองข้อมูลส่วนบุคคล</li>
      </ul>

      <p className={sectionTitle} style={sectionStyle}>
        7. มาตรการรักษาความปลอดภัยของข้อมูล
      </p>
      <p className="mb-4" style={{ color: "#4A6080" }}>
        คลินิกได้จัดให้มีมาตรการรักษาความปลอดภัยที่เหมาะสม เพื่อป้องกันการสูญหาย เข้าถึง ใช้ เปลี่ยนแปลง แก้ไข
        หรือเปิดเผยข้อมูลส่วนบุคคลโดยปราศจากอำนาจหรือโดยมิชอบ รวมถึงการเข้ารหัสข้อมูล (Encryption)
        การจำกัดสิทธิการเข้าถึง (Access Control) และการตรวจสอบเส้นทางข้อมูล (Audit Log)
      </p>

      <p className={sectionTitle} style={sectionStyle}>
        8. ข้อมูลการติดต่อ
      </p>
      <p className="mb-2" style={{ color: "#4A6080" }}>
        หากท่านมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว หรือต้องการใช้สิทธิตามที่ระบุไว้ข้างต้น สามารถติดต่อได้ที่:
      </p>
      <div className="rounded-xl p-3 mb-2" style={{ backgroundColor: "#F0F4F8" }}>
        <p className="text-sm font-semibold" style={{ color: "#1A365D" }}>คลินิกทันตกรรมสุภัทร</p>
        <p className="text-xs mt-1" style={{ color: "#4A6080" }}>
          เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO)<br />
          อีเมล: privacy@suphatclinic.com<br />
          โทรศัพท์: 02-XXX-XXXX
        </p>
      </div>

      <p className="text-xs mt-4 mb-1" style={{ color: "#94A3B8" }}>
        ปรับปรุงล่าสุด: 15 กรกฎาคม 2569
      </p>
    </>
  );
}
