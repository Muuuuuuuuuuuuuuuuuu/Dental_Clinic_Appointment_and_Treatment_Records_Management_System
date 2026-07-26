// ─── Shared types & mock data across all portals ──────────────────────────────

export type AppointmentStatus =
  | "รอการยืนยัน"
  | "ยืนยันการจอง"
  | "รอรักษา"
  | "กำลังรักษา"
  | "เสร็จสิ้น"
  | "รอชำระเงิน"
  | "ชำระเงินแล้ว"
  | "ยกเลิก"
  | "เลื่อนนัด";

export interface Appointment {
  id: number;
  hn: string;
  patientId?: number;
  patientName: string;
  patientPhone: string;
  service: string;
  serviceId?: number;
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
  recommendations?: string;
  cost?: number;
  paid?: boolean;
  source?: "patient" | "doctor";
}

export interface DentistInfo {
  id: number;
  name: string;
  specialty: string;
  license: string;
  university: string;
  email: string;
  phone: string;
  active: boolean;
  userId?: string;
}

export interface PatientInfo {
  id: number;
  hn: string;
  name: string;
  phone: string;
  email: string;
  allergyHistory: string;
  underlyingDisease: string;
}

export interface StaffInfo {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  startDate: string;
  active: boolean;
}

export interface ServiceInfo {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  estimatedTime?: number; // Duration in minutes
  active: boolean;
}

export interface LeaveRequest {
  id: number;
  doctorId: string | number;
  doctorName: string;
  startDate: string;
  endDate: string;
  leavePeriod?: string;
  reason: string;
  status: "รอการอนุมัติ" | "อนุมัติแล้ว" | "ปฏิเสธ";
  createdAt: string;
}

export interface TreatmentPlan {
  id: number;
  hn: string;
  name: string;
  totalCost: number;
  paidAmount: number;
  installments: { dueDate: string; amount: number; paid: boolean; }[];
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  link?: string;
  mediaUrl?: string; // e.g. Image or video URL
  target: "public" | "all_internal" | "dentist" | "staff";
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
}

// ─── Clinic status ────────────────────────────────────────────────────────────

export interface SpecialClosure {
  id?: number;
  date: string;   // YYYY-MM-DD
  reason: string;
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

export function getClinicStatus(now: Date = new Date(), specialClosures: SpecialClosure[] = []): ClinicStatus {
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
  if (day === 0) {
    return { type: "closed", label: "หยุดทำการ", sublabel: "วันอาทิตย์ — ไม่มีบริการ", color: "#FEF2F2", dotColor: "#EF4444" };
  }
  const open = 9 * 60;
  const close = day === 6 ? 17 * 60 : 20 * 60;
  const hoursStr = day === 6 ? "09:00–17:00 น." : "09:00–20:00 น.";
  if (mins >= open && mins < close) {
    return { type: "open", label: "เปิดให้บริการ", sublabel: `วันนี้ถึง ${day === 6 ? "17:00" : "20:00"} น.`, color: "#E8FFF0", dotColor: "#22C55E" };
  }
  const nextOpen = mins < open ? `วันนี้ ${hoursStr}` : day === 6 ? "จันทร์ 09:00 น." : `พรุ่งนี้ 09:00 น.`;
  return { type: "closed", label: "ปิดให้บริการ", sublabel: `เปิดอีกครั้ง ${nextOpen}`, color: "#F0F4F8", dotColor: "#94A3B8" };
}

// ─── Status colors ────────────────────────────────────────────────────────────

export const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "รอการยืนยัน": { bg: "#FFF8E1", text: "#F57F17", dot: "#FBC02D" },
  "ยืนยันการจอง": { bg: "#E8F4FF", text: "#1D6FA4", dot: "#1D6FA4" },
  "รอรักษา": { bg: "#FFF3E0", text: "#E65100", dot: "#E65100" },
  "กำลังรักษา": { bg: "#F3E8FF", text: "#6B21A8", dot: "#9333EA" },
  "เสร็จสิ้น": { bg: "#E8FFF0", text: "#1B7A3E", dot: "#22C55E" },
  "รอชำระเงิน": { bg: "#FFFDE7", text: "#B45309", dot: "#F59E0B" },
  "ชำระเงินแล้ว": { bg: "#F0FDF4", text: "#15803D", dot: "#16A34A" },
  "ยกเลิก": { bg: "#FEF2F2", text: "#B91C1C", dot: "#EF4444" },
  "เลื่อนนัด": { bg: "#F3F4F6", text: "#4B5563", dot: "#6B7280" },
};

export type AdminView = "dashboard" | "dentists" | "staff" | "services" | "schedule" | "leaves" | "announcements";
export type DoctorView = "dashboard" | "queue" | "patients" | "schedule" | "leaves" | "announcements";
export type DocView = "dashboard" | "queue" | "records" | "history" | "calendar" | "profile" | "announcements";
export type StaffView = "queue" | "appointments" | "patients" | "walkin" | "payment" | "leave" | "announcements";

import React from 'react';

export const DAYS = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];


