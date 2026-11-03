import React, { useState, useEffect } from "react";
import { Settings, ArrowLeft, ChevronRight, Clock, Package } from "lucide-react";
import { getServices } from "../../shared/supabaseApi";
import ServiceManagement from "../settings/ServiceManagement";
import ClinicSettingsManagement from "../settings/ClinicSettingsManagement";
import ProductManagement from "../settings/ProductManagement";

type ClinicSubView = null | "services" | "settings" | "products";

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
    key: "settings" as const,
    icon: Clock,
    title: "ตั้งค่าเวลาและวันหยุด",
    desc: "จัดการเวลาเปิด-ปิด วันหยุดประจำสัปดาห์ และวันปิดพิเศษ",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    bgLight: "#FEF3C7",
    countLabel: "ตั้งค่า",
  },
  {
    key: "products" as const,
    icon: Package,
    title: "สินค้าและยา",
    desc: "จัดการรายการยาและสินค้าทั่วไป (เพิ่ม แก้ไข ราคา)",
    gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    bgLight: "#D1FAE5",
    countLabel: "รายการ",
  },
];

export default function ClinicHub() {
  const [subView, setSubView] = useState<ClinicSubView>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    getServices()
      .then((svc) => setCounts({ services: svc.length }))
      .catch(console.error);
  }, []);

  if (subView === "services") return <SubViewWrapper onBack={() => setSubView(null)}><ServiceManagement /></SubViewWrapper>;
  if (subView === "settings") return <SubViewWrapper onBack={() => setSubView(null)}><ClinicSettingsManagement /></SubViewWrapper>;
  if (subView === "products") return <SubViewWrapper onBack={() => setSubView(null)}><ProductManagement /></SubViewWrapper>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>
          จัดการคลินิก
        </h1>
        <p className="text-sm" style={{ color: "#4A6080" }}>เลือกหมวดหมู่ที่ต้องการจัดการ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        {CARD_DEFS.map((card) => (
          <button
            key={card.key}
            onClick={() => setSubView(card.key)}
            className="group text-left bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{ borderColor: "rgba(26,54,93,0.08)" }}
          >
            <div className="p-6 pb-4" style={{ background: card.gradient }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
                <card.icon size={24} color="white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-0.5">{card.title}</h3>
            </div>
            <div className="p-6 pt-4">
              <p className="text-sm mb-4 leading-relaxed" style={{ color: "#4A6080" }}>
                {card.desc}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: card.bgLight, color: card.key === "settings" ? "#D97706" : "#5B4DC7" }}>
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

function SubViewWrapper({ onBack, children }: { onBack: () => void; children: React.ReactNode }) {
  return (
    <div>
      <button onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium mb-4 px-3 py-1.5 rounded-lg transition-colors hover:bg-white/80"
        style={{ color: "#4A6080" }}>
        <ArrowLeft size={16} />
        กลับไปเลือกหมวดหมู่
      </button>
      {children}
    </div>
  );
}
