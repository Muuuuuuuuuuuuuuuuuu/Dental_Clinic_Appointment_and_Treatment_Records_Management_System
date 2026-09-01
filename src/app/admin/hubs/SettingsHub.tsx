import React, { useState } from "react";
import { Lock, ArrowLeft, ChevronRight, BookOpen } from "lucide-react";
import AccountSettings from "../profile/AccountSettings";
import UserManual from "../help/UserManual";

type SettingsSubView = null | "account" | "manual";

const CARD_DEFS = [

  {
    key: "account" as const,
    icon: Lock,
    title: "ตั้งค่าบัญชี",
    desc: "เปลี่ยนรหัสผ่านและจัดการข้อมูลโปรไฟล์ส่วนตัว",
    gradient: "linear-gradient(135deg, #6B7280 0%, #4B5563 100%)",
    bgLight: "#F3F4F6",
  },
  {
    key: "manual" as const,
    icon: BookOpen,
    title: "คู่มือการใช้งาน",
    desc: "ศึกษาขั้นตอนและวิธีการใช้งานระบบสำหรับผู้ดูแล",
    gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    bgLight: "#D1FAE5",
  },
];

export default function SettingsHub() {
  const [subView, setSubView] = useState<SettingsSubView>(null);

  // Sub-view rendering
  if (subView === "account") return <SubViewWrapper title="ตั้งค่าบัญชี" onBack={() => setSubView(null)}><AccountSettings /></SubViewWrapper>;
  if (subView === "manual") return <SubViewWrapper title="คู่มือการใช้งาน" onBack={() => setSubView(null)}><UserManual /></SubViewWrapper>;

  // Hub card selector
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>
          ตั้งค่า
        </h1>
        <p className="text-sm" style={{ color: "#4A6080" }}>จัดการการตั้งค่าบัญชีผู้ใช้และความปลอดภัย</p>
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
        กลับไปเลือกหมวดหมู่
      </button>
      {children}
    </div>
  );
}
