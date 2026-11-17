import { User, Stethoscope, Users, Settings } from "lucide-react";
import { UserRole } from "@/app/shared/types";

export interface DemoAccount {
  label: string;
  email: string;
  pass: string;
}

export interface RoleTabItem {
  key: UserRole;
  label: string;
  demos: DemoAccount[];
}

export const ROLE_TABS: RoleTabItem[] = [
  {
    key: "patient",
    label: "คนไข้",
   
    demos: [
      { label: "สมหญิง", email: "somying@example.com", pass: "12345678" },
      { label: "สมศักดิ์", email: "somsak@example.com", pass: "12345678" },
      { label: "อนุชา", email: "anucha@example.com", pass: "12345678" },
      { label: "กัลยา", email: "kanya@example.com", pass: "12345678" },
      { label: "สุรชัย", email: "surachai@example.com", pass: "12345678" },
    ],
  },
  {
    key: "doctor",
    label: "ทันตแพทย์",
    demos: [
      { label: "ทพญ. อรนุช", email: "dr.ornuch@clinic.com", pass: "12345678" },
      { label: "ทพ. วิชัย", email: "dr.wichai@clinic.com", pass: "12345678" },
      { label: "ทพญ. พิมพ์ใจ", email: "dr.pimjai@clinic.com", pass: "12345678" },
      { label: "ทพ. ศิริชัย", email: "dr.sirichai@clinic.com", pass: "12345678" },
      { label: "ทพญ. นภาพร", email: "dr.napaporn@clinic.com", pass: "12345678" },
    ],
  },
  {
    key: "staff",
    label: "พนักงาน",
    demos: [
      { label: "รัตนา (ต้อนรับ)", email: "rattana@clinic.com", pass: "12345678" },
    ],
  },
  {
    key: "admin",
    label: "ผู้ดูแลระบบ",
    demos: [
      { label: "Admin 1 (คลินิกหลัก)", email: "admin@clinic.com", pass: "12345678" },
    ],
  },
];
