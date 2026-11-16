/**
 * ⚙️ [APP CONFIG CONSTANTS]
 * ค่าคงที่ส่วนกลางและการกำหนดค่าของระบบคลินิก (Single Source of Truth)
 */

export const CLINIC_NAME = "คลินิกทันตกรรมสุภัทร";
export const CLINIC_NAME_EN = "Supat Dental Clinic";

export const DEFAULT_OPEN_TIME = "09:00";
export const DEFAULT_CLOSE_TIME = "20:00";

// ==========================================
// 📅 [DAY & CALENDAR CONSTANTS] (มาตรฐาน 0 = อาทิตย์ ถึง 6 = เสาร์)
// ==========================================

/** ชื่อวันภาษาไทยแบบเต็ม (Index 0 = อาทิตย์ ... 6 = เสาร์) */
export const DAYS_FULL = [
  "อาทิตย์",
  "จันทร์",
  "อังคาร",
  "พุธ",
  "พฤหัสบดี",
  "ศุกร์",
  "เสาร์",
] as const;

/** ชื่อวันภาษาไทยแบบย่อ (Index 0 = อา. ... 6 = ส.) */
export const DAYS_SHORT = [
  "อา.",
  "จ.",
  "อ.",
  "พ.",
  "พฤ.",
  "ศ.",
  "ส.",
] as const;

/** Aliases เพื่อความสะดวกในการใช้งานข้าม component */
export const DAY_TH = DAYS_FULL;
export const DAY_LABELS = DAYS_FULL;
export const DAY_SHORT = DAYS_SHORT;

/** สีประจำวันทั้ง 7 วัน สำหรับการ์ดตารางเวรและปฏิทิน */
export const DAY_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  0: { bg: "#FEE2E2", text: "#991B1B", border: "#F87171" }, // อาทิตย์ - แดง
  1: { bg: "#FEF9C3", text: "#854D0E", border: "#FACC15" }, // จันทร์ - เหลือง
  2: { bg: "#FCE7F3", text: "#9D174D", border: "#F472B6" }, // อังคาร - ชมพู
  3: { bg: "#DCFCE7", text: "#166534", border: "#4ADE80" }, // พุธ - เขียว
  4: { bg: "#FFEDD5", text: "#9A3412", border: "#FB923C" }, // พฤหัสบดี - ส้ม
  5: { bg: "#E0F2FE", text: "#0369A1", border: "#38BDF8" }, // ศุกร์ - ฟ้า
  6: { bg: "#F3E8FF", text: "#6B21A8", border: "#C084FC" }, // เสาร์ - ม่วงอ่อน
};

/** รายการวันเรียง จันทร์ -> อาทิตย์ สำหรับหน้าแสดงผลเวลาทำการ/เวรประจำ (1..6, 0) */
export const WORK_WEEK_DAYS = [
  { name: "จันทร์", day: 1, idx: 1 },
  { name: "อังคาร", day: 2, idx: 2 },
  { name: "พุธ", day: 3, idx: 3 },
  { name: "พฤหัสบดี", day: 4, idx: 4 },
  { name: "ศุกร์", day: 5, idx: 5 },
  { name: "เสาร์", day: 6, idx: 6 },
  { name: "อาทิตย์", day: 0, idx: 0 },
] as const;

