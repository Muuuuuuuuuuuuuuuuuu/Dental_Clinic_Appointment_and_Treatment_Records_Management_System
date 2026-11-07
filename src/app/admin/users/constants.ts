import { Shield, UserCheck, Users, Smile, LucideIcon } from "lucide-react";

export type UsersSubView = null | "admins" | "dentists" | "staff" | "patients";

export interface UserCardDef {
  key: "admins" | "dentists" | "staff" | "patients";
  icon: LucideIcon;
  title: string;
  desc: string;
  gradient: string;
  bgLight: string;
  countLabel: string;
}

export const USER_CARD_DEFS: UserCardDef[] = [
  {
    key: "admins",
    icon: Shield,
    title: "ผู้ดูแลระบบ",
    desc: "จัดการบัญชีแอดมินและสิทธิ์การเข้าถึงระบบ",
    gradient: "linear-gradient(135deg, #8f1d21 0%, #e14c53 100%)",
    bgLight: "#FDECEC",
    countLabel: "คน",
  },
  {
    key: "dentists",
    icon: UserCheck,
    title: "ทันตแพทย์",
    desc: "จัดการบัญชีทันตแพทย์และข้อมูลความเชี่ยวชาญ",
    gradient: "linear-gradient(135deg, #F47983 0%, #DB5A6B 100%)",
    bgLight: "#E8F8EF",
    countLabel: "คน",
  },
  {
    key: "staff",
    icon: Users,
    title: "พนักงาน",
    desc: "จัดการบัญชีพนักงานและตำแหน่งงาน",
    gradient: "linear-gradient(135deg, #C93756 0%, #74ffcb 100%)",
    bgLight: "#FEF5E7",
    countLabel: "คน",
  },
  {
    key: "patients",
    icon: Smile,
    title: "คนไข้",
    desc: "ค้นหาและจัดการประวัติคนไข้ทั้งหมดในระบบ",
    gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    bgLight: "#D1FAE5",
    countLabel: "คน",
  },
];

