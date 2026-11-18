export interface DentistInfo {
  id: number;
  staffId?: number;
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
  citizenId?: string;
  active?: boolean;
  userId?: string;
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
  id: string; // รหัสผู้ใช้สำหรับยืนยันตัวตน
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

export interface Shift {
  id?: number;
  userId?: string;
  staffId?: number;
  person_id: number;
  person_type: 'dentist' | 'staff';
  day_of_week: number;
  start_time: string | null;
  end_time: string | null;
  is_off: boolean;
}

export interface LeaveRequest {
  id: number;
  doctorId: string | number;
  staffId?: number;
  doctorName: string;
  startDate: string;
  endDate: string;
  leaveType?: 'ลาป่วย' | 'ลากิจ' | 'ลาพักร้อน';
  reason: string;
  status: 'รออนุมัติ' | 'อนุมัติแล้ว' | 'ไม่อนุมัติ' | 'ปฏิเสธ';
  createdAt: string;
}

export type AdminView = "dashboard" | "schedule-hub" | "clinic-hub" | "users-hub" | "settings-hub" | "manual" | "profile";
export type DoctorView = "dashboard" | "queue" | "patients" | "schedule" | "leaves" | "announcements";
export type DocView = "dashboard" | "queue" | "records" | "history" | "calendar" | "profile" | "announcements" | "tracking";
export type StaffView = "queue" | "appointments" | "patients" | "walkin" | "payment" | "leave" | "announcements" | "profile" | "tracking";

// บทบาทผู้ใช้งานทั่วทั้งระบบ (ใช้ร่วมกันทุก Portal)
export type UserRole = "patient" | "doctor" | "staff" | "admin" | null;

