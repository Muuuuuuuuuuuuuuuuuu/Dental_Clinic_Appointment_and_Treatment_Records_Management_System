// ─── Patient-specific types ───────────────────────────────────────────────────

import { Smile, Sparkles, Shield, Award, Heart, Calendar } from "lucide-react";

export type View =
  | "landing" | "login" | "register" | "otp" | "consent" | "forgot-password"
  | "dashboard" | "profile" | "booking" | "appointments" | "history" | "record";

export type UserRole = "patient" | "doctor" | "staff" | "admin" | null;

export interface PatientUser {
  patientId?: number;
  firstName: string; lastName: string; idCard: string; dob: string;
  gender: string; phone: string; email: string;
  emergencyName: string; emergencyPhone: string;
  conditions: string; allergies: string;
}

export interface PatientAppointment {
  id: number; service: string; doctor: string; date: string; time: string;
  status: string; source?: "patient" | "doctor"; historyRef?: number;
  approvalStatus?: "auto-approved" | "pending-manual-review";
  durationMins?: number;
}

export interface TreatmentPlan {
  id: number;
  name: string;
  totalCost: number;
  paidAmount: number;
  installments: { dueDate: string; amount: number; paid: boolean; }[];
}

export interface TreatmentRecord {
  id: number; service: string; doctor: string; date: string; time: string;
  cost: string; notes: string;
  teeth?: string;
  medications?: string[];
  recommendations?: string;
  nextApptId?: number;
  treatmentPlanId?: number;
  odontogramData?: Record<number, string>;
}

// ─── Service type for landing page ────────────────────────────────────────────

export interface ServiceItem {
  icon: any; // Allow various Lucide icons
  title: string;
  desc: string;
  price: string;
  color: string;
  type: "general" | "complex" | "variable";
  baseTimeMins: number; // minimum time in minutes
}

export interface DoctorItem {
  id: number;
  name: string;
  specialty: string;
  img: string;
  years: string;
}

export interface ReviewItem {
  name: string;
  text: string;
  stars: number;
  service: string;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function calcAge(dob: string) {
  if (!dob) return "";
  const b = new Date(dob), n = new Date();
  let y = n.getFullYear() - b.getFullYear();
  let m = n.getMonth() - b.getMonth();
  if (m < 0) { y--; m += 12; }
  return `${y} ปี ${m} เดือน`;
}

export function thDate(s: string) {
  if (!s) return "";
  const d = new Date(s);
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
}

export const patientStatusColor: Record<string, { bg: string; text: string }> = {
  "ยืนยันการจอง":    { bg: "#E8F4FF", text: "#1D6FA4" },
  "เช็คอินเรียบร้อย":{ bg: "#F3E8FF", text: "#6B21A8" },
  "รอชำระเงิน":      { bg: "#FFFDE7", text: "#B45309" },
  "เสร็จสิ้นเรียบร้อย":{ bg: "#E8FFF0", text: "#1B7A3E" },
  "ยกเลิก":          { bg: "#FEF2F2", text: "#B91C1C" },
  "ไม่มาตามนัด":     { bg: "#F3F4F6", text: "#4B5563" },
};


// ─── Auth constants ───────────────────────────────────────────────────────────

import { User, Stethoscope, Users, Settings } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ROLE_TABS: { key: UserRole; label: string; icon: any; demos: {label: string, email: string, pass: string}[] }[] = [
  { key: "patient", label: "คนไข้", icon: User, demos: [
    { label: "สมหญิง", email: "somying@example.com", pass: "demo1234" },
    { label: "มณี", email: "manee@example.com", pass: "demo1234" }
  ]},
  { key: "doctor", label: "ทันตแพทย์", icon: Stethoscope, demos: [
    { label: "ทพญ. อรนุช", email: "dr.ornuch@clinic.com", pass: "doctor123" },
    { label: "ทพ. วิชัย", email: "dr.wichai@clinic.com", pass: "doctor123" },
    { label: "ทพญ. พิมพ์ใจ", email: "dr.pimjai@clinic.com", pass: "doctor123" }
  ]},
  { key: "staff", label: "พนักงาน", icon: Users, demos: [
    { label: "รัตนา (ต้อนรับ)", email: "rattana@clinic.com", pass: "staff123" }
  ]},
  { key: "admin", label: "ผู้ดูแลระบบ", icon: Settings, demos: [
    { label: "Admin", email: "admin@clinic.com", pass: "admin123" }
  ]}
];

export const REG_STEPS = ["ข้อมูลบัญชี", "ยืนยัน OTP", "ข้อมูลส่วนตัว", "ข้อมูลการติดต่อ", "ข้อมูลสุขภาพ"];

export interface RegForm {
  firstName: string; lastName: string; idCard: string; dob: string; gender: string;
  phone: string; emergencyName: string; emergencyPhone: string;
  conditions: string; allergies: string;
  email: string; password: string; confirmPassword: string;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

import { Home, Bell, FileText, Activity } from "lucide-react";

export const NAV_ITEMS = [
  { key: "dashboard",    label: "แดชบอร์ด",         icon: Home },
  { key: "booking",      label: "จองนัดหมาย",        icon: Calendar },
  { key: "appointments", label: "รายการนัดหมาย",     icon: Bell },
  { key: "history",      label: "ประวัติการรักษา",   icon: FileText },
  { key: "record",       label: "สุขภาพฟันของคุณ",   icon: Activity },
  { key: "profile",      label: "ข้อมูลส่วนตัว",     icon: User },
];

// ─── Shared UI constants ──────────────────────────────────────────────────────

export const inputCls = "w-full px-5 py-4 rounded-xl border text-base outline-none transition-all focus:ring-2 focus:ring-[#FF8C9A]/40";
export const inputStyle = { backgroundColor: "#F0F4F8", borderColor: "rgba(26,54,93,0.15)", color: "#1A365D" };
