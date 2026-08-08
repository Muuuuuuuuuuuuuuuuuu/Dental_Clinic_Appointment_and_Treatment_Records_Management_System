import React, { useState, useEffect } from "react";
import { Settings, Megaphone, Percent, ArrowLeft, ChevronRight, Clock } from "lucide-react";
import { getServices, getAnnouncements, getPromotions } from "../../shared/supabaseApi";
import ServiceManagement from "../settings/ServiceManagement";
import AnnouncementManagement from "../announcements/AnnouncementManagement";
import PromotionManagement from "../announcements/PromotionManagement";
import ClinicSettingsManagement from "../settings/ClinicSettingsManagement";

type ClinicSubView = null | "services" | "announcements" | "promotions" | "settings";

const CARD_DEFS = [
  {
    key: "services" as const,
    icon: Settings,
    title: "บริการ",
    desc: "จัดการรายการบริการทันตกรรมทั้งหมดของคลินิก",
    gradient: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
    bgLight: "#F0EDFF",
    countLabel: "บริการ",
  },
  {
    key: "announcements" as const,
    icon: Megaphone,
    title: "ประกาศ",
    desc: "แจ้งข่าวสารภายในองค์กรและประกาศสาธารณะ",
    gradient: "linear-gradient(135deg, #1A365D 0%, #2D5F9A 100%)",
    bgLight: "#EBF2FF",
    countLabel: "ประกาศ",
  },
  {
    key: "promotions" as const,
    icon: Percent,
    title: "โปรโมชั่น",
    desc: "จัดการข้อเสนอพิเศษและโปรโมชั่นสำหรับลูกค้า",
    gradient: "linear-gradient(135deg, #FF6B7E 0%, #FF8C9A 100%)",
    bgLight: "#FFF0F2",
    countLabel: "รายการ",
  },
  {
    key: "settings" as const,
    icon: Clock,
    title: "ตั้งค่าเวลาและวันหยุด",
    desc: "จัดการเวลาเปิด-ปิด วันหยุดประจำสัปดาห์ และวันปิดพิเศษ",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    bgLight: "#FEF3C7",
    countLabel: "ตั้งค่า",
  },
];

export default function ClinicHub() {
  const [subView, setSubView] = useState<ClinicSubView>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    Promise.all([getServices(), getAnnouncements(), getPromotions()])
      .then(([svc, ann, promo]) => {
        setCounts({ services: svc.length, announcements: ann.length, promotions: promo.length });
      })
      .catch(console.error);
  }, []);

  // Sub-view rendering
  if (subView === "services") return <SubViewWrapper title="บริการ" onBack={() => setSubView(null)}><ServiceManagement /></SubViewWrapper>;
  if (subView === "announcements") return <SubViewWrapper title="ประกาศ" onBack={() => setSubView(null)}><AnnouncementManagement /></SubViewWrapper>;
  if (subView === "promotions") return <SubViewWrapper title="โปรโมชั่น" onBack={() => setSubView(null)}><PromotionManagement /></SubViewWrapper>;
  if (subView === "settings") return <SubViewWrapper title="ตั้งค่าเวลาและวันหยุด" onBack={() => setSubView(null)}><ClinicSettingsManagement /></SubViewWrapper>;

  // Hub card selector
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>
          จัดการคลินิก
        </h1>
        <p className="text-sm" style={{ color: "#4A6080" }}>เลือกหมวดหมู่ที่ต้องการจัดการ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CARD_DEFS.map((card) => (
          <button
            key={card.key}
            onClick={() => setSubView(card.key)}
            className="group text-left bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{ borderColor: "rgba(26,54,93,0.08)" }}
          >
            {/* Gradient header */}
            <div className="p-6 pb-4" style={{ background: card.gradient }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
                <card.icon size={24} color="white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-0.5">{card.title}</h3>
            </div>

            {/* Body */}
            <div className="p-6 pt-4">
              <p className="text-sm mb-4 leading-relaxed" style={{ color: "#4A6080" }}>
                {card.desc}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: card.bgLight, color: card.gradient.includes("FF6B7E") ? "#E05B6E" : card.gradient.includes("1A365D") ? "#1A365D" : card.gradient.includes("F59E0B") ? "#D97706" : "#5B4DC7" }}>
                  {card.key === "settings" ? "ข้อมูลทั่วไป" : (counts[card.key] !== undefined ? `${counts[card.key]} ${card.countLabel}` : "กำลังโหลด...")}
                </span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-1"
                  style={{ backgroundColor: "#F0F4F8" }}>
                  <ChevronRight size={16} style={{ color: "#4A6080" }} />
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
