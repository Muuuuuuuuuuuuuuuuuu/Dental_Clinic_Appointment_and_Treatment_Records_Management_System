import React, { useState } from "react";
import { Clock, Lock, ArrowLeft, ChevronRight } from "lucide-react";
import ClinicSettingsManagement from "../settings/ClinicSettingsManagement";
import AccountSettings from "../profile/AccountSettings";

type SettingsSubView = null | "clinic" | "account";

const CARD_DEFS = [
  {
    key: "clinic" as const,
    icon: Clock,
    title: "ตั้งค่าคลินิก",
    desc: "จัดการเวลาเปิด-ปิด วันหยุดประจำสัปดาห์ และวันปิดพิเศษ",
    gradient: "linear-gradient(135deg, #1A365D 0%, #2C5282 100%)",
    bgLight: "#EBF2FF",
  },
  {
    key: "account" as const,
    icon: Lock,
    title: "ตั้งค่าบัญชี",
    desc: "เปลี่ยนรหัสผ่านและจัดการข้อมูลโปรไฟล์ส่วนตัว",
    gradient: "linear-gradient(135deg, #6B7280 0%, #4B5563 100%)",
    bgLight: "#F3F4F6",
  },
];

export default function SettingsHub() {
  const [subView, setSubView] = useState<SettingsSubView>(null);

  // Sub-view rendering
  if (subView === "clinic") return <SubViewWrapper title="ตั้งค่าคลินิก" onBack={() => setSubView(null)}><ClinicSettingsManagement /></SubViewWrapper>;
  if (subView === "account") return <SubViewWrapper title="ตั้งค่าบัญชี" onBack={() => setSubView(null)}><AccountSettings /></SubViewWrapper>;

  // Hub card selector
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>
          ตั้งค่า
        </h1>
        <p className="text-sm" style={{ color: "#4A6080" }}>จัดการการตั้งค่าคลินิกและบัญชีผู้ใช้</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
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
              <h3 className="text-lg font-bold text-white">{card.title}</h3>
            </div>

            {/* Body */}
            <div className="p-6 pt-4">
              <p className="text-sm mb-4 leading-relaxed" style={{ color: "#4A6080" }}>
                {card.desc}
              </p>
              <div className="flex items-center justify-end">
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
