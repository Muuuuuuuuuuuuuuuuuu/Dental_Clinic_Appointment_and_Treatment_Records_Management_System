import { Home, Calendar, Bell, FileText, Activity } from "lucide-react";

export type View =
  | "landing" | "login" | "register" | "otp" | "consent" | "forgot-password"
  | "dashboard" | "profile" | "booking" | "appointments" | "history" | "record";

export type { UserRole } from "@/app/shared/types";

export interface PatientUser {
  patientId?: number;
  firstName: string;
  lastName: string;
  idCard: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  address?: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
  conditions: string;
  allergies: string;
}

export interface PatientAppointment {
  id: number;
  service: string;
  doctor: string;
  date: string;
  time: string;
  status: string;
  source?: "patient" | "doctor";
  historyRef?: number;
  approvalStatus?: "auto-approved" | "pending-manual-review";
  durationMins?: number;
}

export interface TreatmentRecord {
  id: number;
  service: string;
  doctor: string;
  date: string;
  time: string;
  cost: string;
  notes: string;
  teeth?: string;
  medications?: string[];
  recommendations?: string;
  nextApptId?: number;
  odontogramData?: Record<number, string>;
}

export const patientStatusColor: Record<string, { bg: string; text: string }> = {
  "ยืนยันการจอง": { bg: "#EFF6FF", text: "#1D4ED8" },
  "เช็คอินเรียบร้อย": { bg: "#FDF4FF", text: "#A21CAF" },
  "กำลังรักษา": { bg: "#F3E8FF", text: "#6B21A8" },
  "รอชำระเงิน": { bg: "#FEF2F2", text: "#B91C1C" },
  "เสร็จสิ้น": { bg: "#E8FFF0", text: "#1B7A3E" },
  "ไม่มาตามนัด": { bg: "#F3F4F6", text: "#4B5563" },
};

export const NAV_ITEMS = [
  { key: "dashboard", label: "แดชบอร์ด", icon: Home },
  { key: "booking", label: "จองนัดหมาย", icon: Calendar },
  { key: "appointments", label: "รายการนัดหมาย", icon: Bell },
  { key: "history", label: "ประวัติการรักษา", icon: FileText },
  { key: "record", label: "สุขภาพฟันของฉัน", icon: Activity },
];
