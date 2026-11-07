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
  estimatedTime?: number; // ระยะเวลา (นาที)
  active: boolean;
  isPublic?: boolean;
  applyTo?: string;
  details?: {
    benefits: string[];
    procedures: string[];
    care: string[];
  };
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
  mediaUrl?: string; // ลิงก์รูปภาพหรือวิดีโอ
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

export interface SpecialClosure {
  id: number;
  date: string;   // รูปแบบวันที่ YYYY-MM-DD
  reason: string;
  isRecurring?: boolean;
  linkedAnnouncementId?: number; // เชื่อมโยงกับประกาศของคลินิก
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

