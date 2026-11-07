export type AppointmentStatus =
  | "รอการยืนยัน"
  | "ยืนยันการจอง"
  | "เช็คอินเรียบร้อย"
  | "กำลังรักษา"
  | "รอชำระเงิน"
  | "เสร็จสิ้น"
  | "ยกเลิก"
  | "ไม่มาตามนัด";

/** สถานะนัดหมายที่ยังดำเนินอยู่ (Active / Scheduled / In-Progress) */
export const ACTIVE_APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "รอการยืนยัน",
  "ยืนยันการจอง",
  "เช็คอินเรียบร้อย",
  "กำลังรักษา",
  "รอชำระเงิน"
];

export interface AppointmentBreakdown {
  completed: number;
  scheduled: number;
  cancelled: number;
  noShow: number;
  total: number;
}

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

