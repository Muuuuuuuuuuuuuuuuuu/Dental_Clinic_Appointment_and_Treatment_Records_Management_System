import React from "react";
import { Smile, Clock } from "lucide-react";

export default function AuthShell({ children, title, sub }: { children: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="min-h-screen flex" style={{ fontFamily: "Prompt, sans-serif" }}>
      {/* Left panel - branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-12"
        style={{ background: "linear-gradient(160deg, #1A365D 0%, #2A507A 100%)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
            <Smile size={20} color="white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm" style={{ fontFamily: "Playfair Display, serif" }}>คลินิกสุภัทร</div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>SUPHAT CLINIC</div>
          </div>
        </div>
        <div>
          <img
            src="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=500&h=400&fit=crop&auto=format"
            alt="คลินิก"
            className="w-full rounded-2xl object-cover mb-8 auth-panel-img"
            style={{ maxHeight: 260 }}
          />
          <p className="text-2xl font-bold text-white leading-snug mb-3" style={{ fontFamily: "Playfair Display, serif" }}>
            ยิ้มสวย มั่นใจทุกวัน<br />ดูแลโดยผู้เชี่ยวชาญ
          </p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            จองนัดหมาย ติดตามประวัติการรักษา และดูแลสุขภาพช่องปากได้ทุกที่ทุกเวลา
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          <Clock size={12} /> เปิดให้บริการ จ-ส เวลา 09:00-20:00 น.
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
              <Smile size={16} color="white" />
            </div>
            <span className="font-bold text-base" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>คลินิกสุภัทร</span>
          </div>

          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>{title}</h1>
          <p className="text-sm mb-8" style={{ color: "#4A6080" }}>{sub}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A365D" }}>{label}</label>
      {children}
    </div>
  );
}

