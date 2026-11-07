// ─── Shared Data, Types, Constants & Utilities Facade ──────────────────────
// จัดระเบียบแยกตามโมดูลเพื่อความเป็นระเบียบและมาตรฐานการพัฒนา:
// - types/       : โครงสร้างข้อมูล (Appointment, User, Clinic ฯลฯ)
// - constants/   : ค่าคงที่ระบบ (STATUS_COLORS, DAYS ฯลฯ)
// - utils/       : ฟังก์ชันคำนวณและตัวช่วย (hasHealthAlert, getClinicStatus, getAppointmentBreakdown ฯลฯ)

export * from "./types";
export * from "./constants";
export * from "./utils";
