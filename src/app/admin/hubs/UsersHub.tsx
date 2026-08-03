import React, { useState, useEffect } from "react";
import { Shield, UserCheck, Users, Smile, ArrowLeft, ChevronRight } from "lucide-react";
import { getAdmins, getDentists, getStaff, getPatients } from "../../shared/supabaseApi";
import AdminManagement from "../users/AdminManagement";
import DentistManagement from "../users/DentistManagement";
import StaffManagement from "../users/StaffManagement";
import PatientManagement from "../users/PatientManagement";

type UsersSubView = null | "admins" | "dentists" | "staff" | "patients";

const CARD_DEFS = [
  {
    key: "admins" as const,
    icon: Shield,
    title: "ผู้ดูแลระบบ",
    desc: "จัดการบัญชีแอดมินและสิทธิ์การเข้าถึงระบบ",
    gradient: "linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)",
    bgLight: "#FDECEC",
    countLabel: "คน",
  },
  {
    key: "dentists" as const,
    icon: UserCheck,
    title: "ทันตแพทย์",
    desc: "จัดการบัญชีทันตแพทย์และข้อมูลความเชี่ยวชาญ",
    gradient: "linear-gradient(135deg, #27AE60 0%, #1E8449 100%)",
    bgLight: "#E8F8EF",
    countLabel: "คน",
  },
  {
    key: "staff" as const,
    icon: Users,
    title: "พนักงาน",
    desc: "จัดการบัญชีพนักงานและตำแหน่งงาน",
    gradient: "linear-gradient(135deg, #F39C12 0%, #E67E22 100%)",
    bgLight: "#FEF5E7",
    countLabel: "คน",
  },
  {
    key: "patients" as const,
    icon: Smile,
    title: "คนไข้",
    desc: "จัดการข้อมูลคนไข้และประวัติการรักษา",
    gradient: "linear-gradient(135deg, #3498DB 0%, #2980B9 100%)",
    bgLight: "#EBF5FB",
    countLabel: "คน",
  },
];

export default function UsersHub() {
  const [subView, setSubView] = useState<UsersSubView>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    Promise.all([getAdmins(), getDentists(), getStaff(), getPatients()])
      .then(([adm, den, stf, pat]) => {
        setCounts({ admins: adm.length, dentists: den.length, staff: stf.length, patients: pat.length });
      })
      .catch(console.error);
  }, []);

  // Sub-view rendering
  if (subView === "admins") return <SubViewWrapper title="ผู้ดูแลระบบ" onBack={() => setSubView(null)}><AdminManagement /></SubViewWrapper>;
  if (subView === "dentists") return <SubViewWrapper title="ทันตแพทย์" onBack={() => setSubView(null)}><DentistManagement /></SubViewWrapper>;
  if (subView === "staff") return <SubViewWrapper title="พนักงาน" onBack={() => setSubView(null)}><StaffManagement /></SubViewWrapper>;
  if (subView === "patients") return <SubViewWrapper title="คนไข้" onBack={() => setSubView(null)}><PatientManagement /></SubViewWrapper>;

  // Hub card selector
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>
          จัดการผู้ใช้งาน
        </h1>
        <p className="text-sm" style={{ color: "#4A6080" }}>เลือกประเภทผู้ใช้งานที่ต้องการจัดการ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CARD_DEFS.map((card) => (
          <button
            key={card.key}
            onClick={() => setSubView(card.key)}
            className="group text-left bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{ borderColor: "rgba(26,54,93,0.08)" }}
          >
            {/* Gradient header */}
            <div className="p-5 pb-3" style={{ background: card.gradient }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-2.5"
                style={{ backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
                <card.icon size={22} color="white" />
              </div>
              <h3 className="text-base font-bold text-white">{card.title}</h3>
            </div>

            {/* Body */}
            <div className="p-5 pt-3">
              <p className="text-xs mb-4 leading-relaxed" style={{ color: "#4A6080" }}>
                {card.desc}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: card.bgLight, color: card.gradient.includes("E74C3C") ? "#C0392B" : card.gradient.includes("27AE60") ? "#1E8449" : card.gradient.includes("F39C12") ? "#D68910" : "#2980B9" }}>
                  {counts[card.key] !== undefined ? `${counts[card.key]} ${card.countLabel}` : "..."}
                </span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-1"
                  style={{ backgroundColor: "#F0F4F8" }}>
                  <ChevronRight size={14} style={{ color: "#4A6080" }} />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SubViewWrapper({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <div>
      <button onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium mb-4 px-3 py-1.5 rounded-lg transition-colors hover:bg-white/80"
        style={{ color: "#4A6080" }}>
        <ArrowLeft size={16} />
        ← กลับไปเลือกหมวดหมู่
      </button>
      {children}
    </div>
  );
}
