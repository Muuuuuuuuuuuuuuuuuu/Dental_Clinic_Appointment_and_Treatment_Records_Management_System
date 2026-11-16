export type ClinicSubView = null | "services" | "settings" | "products";

export interface ClinicCardDef {
  key: "services" | "settings" | "products";
  title: string;
  desc: string;
  gradient: string;
  bgLight: string;
  countLabel: string;
}

export const CLINIC_CARD_DEFS: ClinicCardDef[] = [
  {
    key: "services",
    title: "บริการ",
    desc: "จัดการรายการบริการทันตกรรมทั้งหมดของคลินิก",
    gradient: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
    bgLight: "#F0EDFF",
    countLabel: "บริการ",
  },
  {
    key: "settings",
    title: "ตั้งค่าเวลาและวันหยุด",
    desc: "จัดการเวลาเปิด-ปิด วันหยุดประจำสัปดาห์ และวันปิดพิเศษ",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    bgLight: "#FEF3C7",
    countLabel: "ตั้งค่า",
  },
  {
    key: "products",
    title: "สินค้าและยา",
    desc: "จัดการรายการยาและสินค้าทั่วไป (เพิ่ม แก้ไข ราคา)",
    gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    bgLight: "#D1FAE5",
    countLabel: "รายการ",
  },
];

