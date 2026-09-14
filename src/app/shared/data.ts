// ─── Shared types & mock data across all portals ──────────────────────────────

// Helper: ตรวจสอบว่าคนไข้มีประวัติสุขภาพที่ควรแจ้งเตือนหรือไม่
// ใช้ฟังก์ชันนี้ในทุกหน้าแทนการเขียน !== "ไม่มี" เองทุกครั้ง
const NO_HEALTH_KEYWORDS = ['ไม่มี', 'ไม่มีประวัติ', 'ไม่มีประวัติแพ้ยา', 'ไม่มี ภาวะสุขภาพหรือโรคประจำตัวใดๆ', '-', ''];
export function hasHealthAlert(allergies?: string, conditions?: string): boolean {
  const allergyAlert = !!allergies && !NO_HEALTH_KEYWORDS.some(k => allergies.trim() === k);
  const conditionAlert = !!conditions && !NO_HEALTH_KEYWORDS.some(k => conditions.trim() === k);
  return allergyAlert || conditionAlert;
}

export type AppointmentStatus =
  | "รอการยืนยัน"
  | "ยืนยันการจอง"
  | "เช็คอินเรียบร้อย"
  | "กำลังรักษา"
  | "รอชำระเงิน"
  | "เสร็จสิ้น"
  | "ยกเลิก"
  | "ไม่มาตามนัด";

export interface Appointment {
  id: number;
  hn: string;
  patientId?: number;
  patientName: string;
  patientPhone: string;
  service: string;
  serviceId?: number;

  treatmentPlanId?: number;
  planItemId?: number;
  doctorName: string;
  doctorId?: number;
  date: string;
  time: string;
  endTime?: string;
  durationMins?: number;
  status: AppointmentStatus;
  conditions: string;
  allergies: string;
  treatmentNotes?: string;
  treatmentServices?: string[];
  detailedServices?: any[];
  recommendations?: string;
  cost?: number;
  paid?: boolean;
  source?: "patient" | "doctor";
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelationship?: string;
  note?: string;
  odontogramData?: Record<number, string>;
  walkInRegistration?: {
    citizenId: string;
    firstName: string;
    lastName: string;
    gender: string;
    dob: string;
    address: string;
    email?: string;
    password?: string;
  };
}

export interface DentistInfo {
  id: number;
  userId?: string;
  name: string;
  titleName?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  birthDate?: string;
  address?: string;
  specialty: string;
  license: string;
  university: string;
  experienceYears?: number;
  graduationYear?: number;
  imageUrl?: string;
  startDate?: string;
  citizenId?: string;
  email: string;
  password?: string;
  phone: string;
  active: boolean;
  serviceIds?: number[];
  defaultRoom?: string;
}

export interface PatientInfo {
  id: number;
  hn: string;
  name: string;
  phone: string;
  email: string;
  gender?: string;
  dob?: string;
  address?: string;
  allergyHistory: string;
  underlyingDisease: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}

export interface StaffInfo {
  id: number;
  userId?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  birthDate?: string;
  address?: string;
  role: string;
  email: string;
  password?: string;
  phone: string;
  citizenId?: string;
  startDate: string;
  employmentStatus?: string;
  active: boolean;
  salary?: string;
}

export interface AdminInfo {
  id: string; // auth user id
  name: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  birthDate?: string;
  address?: string;
  role?: string;
  startDate?: string;
  employmentStatus?: string;
  email: string;
  password?: string;
  phone: string;
  citizenId?: string;
  active: boolean;
  salary?: string;
}

export interface TreatmentPackage {
  package_id?: number;
  package_name: string;
  total_cost: number;
  down_payment: number;
  down_payment_months: number;
  monthly_payment: number;
  is_active: boolean;
}

export const SERVICE_CATEGORIES = [
  'ทันตกรรมทั่วไป (General Dentistry)',
  'ศัลยกรรมช่องปาก (Oral Surgery)',
  'ทันตกรรมประดิษฐ์ (Prosthodontics)',
  'จัดฟัน (Orthodontics)',
  'รักษารากฟัน (Endodontics)',
  'ทันตกรรมเพื่อความงาม (Aesthetic)',
  'ทันตกรรมรากเทียม (Implantology)',
  'ทันตกรรมเด็กและป้องกัน (Pediatric & Preventive)'
] as const;

export type ServiceCategoryType = typeof SERVICE_CATEGORIES[number];

export interface ServiceInfo {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  maxPrice?: number;
  category: string;
  newCategoryIcon?: string;
  newCategoryColor?: string;
  estimatedTime?: number; // Duration in minutes
  active: boolean;
  isPublic?: boolean;
  applyTo?: string;
  details?: {
    benefits: string[];
    procedures: string[];
    care: string[];
  };
}

export interface LeaveRequest {
  id: number;
  doctorId: string | number;
  doctorName: string;
  startDate: string;
  endDate: string;
  leaveType?: 'ลาป่วย' | 'ลากิจ' | 'ลาพักร้อน';
  reason: string;
  status: 'รออนุมัติ' | 'อนุมัติแล้ว' | 'ไม่อนุมัติ' | 'ปฏิเสธ';
  createdAt: string;
}



export interface Product {
  id: number;
  name: string;
  type: 'ยา' | 'สินค้าทั่วไป';
  price: number;
  unit?: string;
  instruction?: string;
  isActive: boolean;
}

export interface TreatmentProduct {
  id: number;
  treatmentId: number;
  productId: number;
  quantity: number;
  actualPrice: number;
  doctorNote?: string;
  product?: Product;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  link?: string;
  mediaUrl?: string; // e.g. Image or video URL
  target: "public" | "all_internal" | "dentist" | "staff";
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export interface Promotion {
  id: number;
  tag: string;
  tagColor: string;
  title: string;
  desc: string;
  originalPrice: number | string;
  salePrice: number | string;
  validUntil: string;
  icon: string;
  highlight: string;
  isActive?: boolean;
  expiresAt?: string | null;
}

// ─── Clinic status ────────────────────────────────────────────────────────────

export interface SpecialClosure {
  id: number;
  date: string;   // YYYY-MM-DD
  reason: string;
  isRecurring?: boolean;
  linkedAnnouncementId?: number; // Soft link to announcement
}

export interface Shift {
  id?: number;
  person_id: number;
  person_type: 'dentist' | 'staff';
  day_of_week: number;
  start_time: string | null;
  end_time: string | null;
  is_off: boolean;
}

export type ClinicStatusType = "open" | "closed" | "special";

export interface ClinicStatus {
  type: ClinicStatusType;
  label: string;
  sublabel: string;
  color: string;
  dotColor: string;
  specialReason?: string;
}

export function getClinicStatus(
  now: Date = new Date(),
  specialClosures: SpecialClosure[] = [],
  weeklyOffDays: number[] = [0],
  clinicHours?: Record<string, any> | { open_time?: string; close_time?: string; saturday_close_time?: string },
  dailyHours?: Record<string, { open: string; close: string }>
): ClinicStatus {
  const dateStr = now.toISOString().split("T")[0];
  const special = specialClosures.find(c => c.date === dateStr);
  if (special) {
    return {
      type: "special",
      label: "หยุดพิเศษ",
      sublabel: special.reason,
      color: "#FFF3E0",
      dotColor: "#F59E0B",
      specialReason: special.reason,
    };
  }
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();

  // Day names for display
  const dayNames = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

  // Check weekly off days (dynamic — no longer hardcoded to Sunday)
  if (weeklyOffDays.includes(day)) {
    return { type: "closed", label: "หยุดทำการ", sublabel: `วัน${dayNames[day]} — ไม่มีบริการ`, color: "#FEF2F2", dotColor: "#EF4444" };
  }

  // Parse configurable open/close times — per-day or fallback to legacy
  const parseTime = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };
  
  let openTime: number;
  let closeTime: number;
  
  if (dailyHours && dailyHours[String(day)]) {
    openTime = parseTime(dailyHours[String(day)].open);
    closeTime = parseTime(dailyHours[String(day)].close);
  } else {
    // Legacy fallback
    const legacy = clinicHours as { open_time?: string; close_time?: string; saturday_close_time?: string } | undefined;
    openTime = parseTime(legacy?.open_time || "09:00");
    closeTime = day === 6
      ? parseTime(legacy?.saturday_close_time || legacy?.close_time || "18:00")
      : parseTime(legacy?.close_time || "20:00");
  }

  const closeStr = `${Math.floor(closeTime / 60).toString().padStart(2, '0')}:${(closeTime % 60).toString().padStart(2, '0')}`;
  const openStr = `${Math.floor(openTime / 60).toString().padStart(2, '0')}:${(openTime % 60).toString().padStart(2, '0')}`;
  const hoursStr = `${openStr}–${closeStr} น.`;

  if (mins >= openTime && mins < closeTime) {
    return { type: "open", label: "เปิดให้บริการ", sublabel: `วันนี้ถึง ${closeStr} น.`, color: "#E8FFF0", dotColor: "#22C55E" };
  }

  // Find next working day for "opens again" message
  const findNextOpenDay = (): string => {
    if (mins < openTime) return `วันนี้ ${hoursStr}`;
    for (let i = 1; i <= 7; i++) {
      const nextDay = (day + i) % 7;
      if (!weeklyOffDays.includes(nextDay)) {
        const nextOpen = dailyHours?.[String(nextDay)]?.open || openStr;
        return `${dayNames[nextDay]} ${nextOpen} น.`;
      }
    }
    return `${openStr} น.`;
  };

  return { type: "closed", label: "ปิดให้บริการ", sublabel: `เปิดอีกครั้ง ${findNextOpenDay()}`, color: "#F0F4F8", dotColor: "#94A3B8" };
}

// ─── Status colors ────────────────────────────────────────────────────────────

export const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "รอการยืนยัน": { bg: "#FFFBEB", text: "#D97706", dot: "#F59E0B" },
  "ยืนยันการจอง": { bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6" },
  "เช็คอินเรียบร้อย": { bg: "#FDF4FF", text: "#A21CAF", dot: "#D946EF" },
  "กำลังรักษา": { bg: "#F3E8FF", text: "#6B21A8", dot: "#9333EA" },
  "รอชำระเงิน": { bg: "#FEF2F2", text: "#B91C1C", dot: "#EF4444" },
  "เสร็จสิ้น": { bg: "#E8FFF0", text: "#1B7A3E", dot: "#22C55E" },
  "ยกเลิก": { bg: "#FEE2E2", text: "#991B1B", dot: "#DC2626" },
  "ไม่มาตามนัด":      { bg: "#F3F4F6", text: "#4B5563", dot: "#6B7280" },
};

export type AdminView = "dashboard" | "schedule-hub" | "clinic-hub" | "users-hub" | "settings-hub" | "manual" | "profile";
export type DoctorView = "dashboard" | "queue" | "patients" | "schedule" | "leaves" | "announcements";
export type DocView = "dashboard" | "queue" | "records" | "history" | "calendar" | "profile" | "announcements" | "tracking";
export type StaffView = "queue" | "appointments" | "patients" | "walkin" | "payment" | "leave" | "announcements" | "profile" | "tracking";

import React from 'react';

export const DAYS = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];
