import { Check } from "lucide-react";

// ความยาวขั้นต่ำของรหัสผ่าน
export const PASSWORD_MIN_LENGTH = 8;

// เงื่อนไขความปลอดภัยของรหัสผ่านที่ผู้ใช้ต้องผ่านทุกข้อ
export const PASSWORD_RULES: { key: string; label: string; test: (p: string) => boolean }[] = [
  { key: "length", label: `อย่างน้อย ${PASSWORD_MIN_LENGTH} ตัวอักษร`, test: p => p.length >= PASSWORD_MIN_LENGTH },
  { key: "upper", label: "ตัวพิมพ์ใหญ่ (A-Z)", test: p => /[A-Z]/.test(p) },
  { key: "lower", label: "ตัวพิมพ์เล็ก (a-z)", test: p => /[a-z]/.test(p) },
  { key: "number", label: "ตัวเลข (0-9)", test: p => /[0-9]/.test(p) },
  { key: "special", label: "อักขระพิเศษ (! @ # $ %)", test: p => /[^A-Za-z0-9\s]/.test(p) },
];

/** คืนค่ารายการเงื่อนไขที่รหัสผ่านยังไม่ผ่าน (ว่างแปลว่าผ่านครบทุกข้อ) */
export function getPasswordIssues(password: string): string[] {
  return PASSWORD_RULES.filter(r => !r.test(password)).map(r => r.label);
}

/** สร้างข้อความแจ้งเตือนเมื่อรหัสผ่านยังไม่ครบตามเงื่อนไข หรือคืนค่า null เมื่อผ่านครบ */
export function getPasswordErrorMessage(password: string): string | null {
  if (/\s/.test(password)) return "รหัสผ่านห้ามเว้นวรรค";
  const issues = getPasswordIssues(password);
  if (issues.length === 0) return null;
  return `กรุณาตั้งรหัสผ่านให้ครบ: ${issues.join(", ")}`;
}

/** รายการตรวจสอบเงื่อนไขรหัสผ่านแบบเรียลไทม์ขณะผู้ใช้พิมพ์ */
export function PasswordChecklist({ password }: { password: string }) {
  return (
    <div className="pt-1 pb-0.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
        {PASSWORD_RULES.map(rule => {
          const passed = rule.test(password);
          return (
            <div
              key={rule.key}
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: passed ? "#16A34A" : "#64748B" }}
            >
              {passed ? (
                <Check size={12} strokeWidth={2.5} className="flex-shrink-0" />
              ) : (
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mx-0.5"
                  style={{ backgroundColor: "#CBD5E1" }}
                />
              )}
              <span>{rule.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
