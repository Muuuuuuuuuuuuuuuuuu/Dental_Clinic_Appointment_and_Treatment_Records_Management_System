import { CheckCircle2, Circle } from "lucide-react";

// ความยาวขั้นต่ำของรหัสผ่าน
export const PASSWORD_MIN_LENGTH = 8;

// เงื่อนไขความปลอดภัยของรหัสผ่านที่ผู้ใช้ต้องผ่านทุกข้อ
export const PASSWORD_RULES: { key: string; label: string; test: (p: string) => boolean }[] = [
  { key: "length", label: `ความยาวอย่างน้อย ${PASSWORD_MIN_LENGTH} ตัวอักษร`, test: p => p.length >= PASSWORD_MIN_LENGTH },
  { key: "upper", label: "ตัวอักษรภาษาอังกฤษพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว", test: p => /[A-Z]/.test(p) },
  { key: "lower", label: "ตัวอักษรภาษาอังกฤษพิมพ์เล็ก (a-z) อย่างน้อย 1 ตัว", test: p => /[a-z]/.test(p) },
  { key: "number", label: "ตัวเลข (0-9) อย่างน้อย 1 ตัว", test: p => /[0-9]/.test(p) },
  { key: "special", label: "อักขระพิเศษ เช่น ! @ # $ % อย่างน้อย 1 ตัว", test: p => /[^A-Za-z0-9\s]/.test(p) },
];

/** คืนค่ารายการเงื่อนไขที่รหัสผ่านยังไม่ผ่าน (ว่างแปลว่าผ่านครบทุกข้อ) */
export function getPasswordIssues(password: string): string[] {
  return PASSWORD_RULES.filter(r => !r.test(password)).map(r => r.label);
}

/** สร้างข้อความแจ้งเตือนเมื่อรหัสผ่านยังไม่ครบตามเงื่อนไข หรือคืนค่า null เมื่อผ่านครบ */
export function getPasswordErrorMessage(password: string): string | null {
  if (/\s/.test(password)) return "รหัสผ่านต้องไม่มีช่องว่าง";
  const issues = getPasswordIssues(password);
  if (issues.length === 0) return null;
  return `รหัสผ่านยังไม่ครบตามเงื่อนไข กรุณาเพิ่ม: ${issues.join(", ")}`;
}

/** รายการตรวจสอบเงื่อนไขรหัสผ่านแบบเรียลไทม์ขณะผู้ใช้พิมพ์ */
export function PasswordChecklist({ password }: { password: string }) {
  return (
    <div className="p-3 rounded-xl space-y-1.5" style={{ backgroundColor: "#F8FAFC", border: "1px solid rgba(26,54,93,0.08)" }}>
      <p className="text-xs font-semibold mb-1" style={{ color: "#1A365D" }}>รหัสผ่านต้องประกอบด้วย</p>
      {PASSWORD_RULES.map(rule => {
        const passed = rule.test(password);
        return (
          <div key={rule.key} className="flex items-center gap-2 text-xs" style={{ color: passed ? "#1B7A3E" : "#94A3B8" }}>
            {passed ? <CheckCircle2 size={13} className="flex-shrink-0" /> : <Circle size={13} className="flex-shrink-0" />}
            {rule.label}
          </div>
        );
      })}
    </div>
  );
}

