import React, { useState, useEffect } from "react";
import { Smile, Clock } from "lucide-react";
import { getWeeklyOffDays, getDailyHours } from "../../shared/supabaseApi";

export default function AuthShell({ children, title, sub }: { children: React.ReactNode; title: string; sub: string }) {
  const DAY_SHORT = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
  const [hoursText, setHoursText] = useState("เปิดให้บริการ จ-ส เวลา 09:00-20:00 น.");

  useEffect(() => {
    Promise.all([getWeeklyOffDays(), getDailyHours()]).then(([offDays, dh]) => {
      const workDays = [0,1,2,3,4,5,6].filter(i => !offDays.includes(i));
      if (workDays.length === 0) {
        setHoursText("ปิดให้บริการ");
        return;
      }
      
      // จัดกลุ่มวันที่มีเวลาทำการเหมือนกันเข้าด้วยกัน
      const groups: { days: number[], open: string, close: string }[] = [];
      workDays.forEach(d => {
        const h = dh[String(d)] || { open: "09:00", close: "20:00" };
        const match = groups.find(g => g.open === h.open && g.close === h.close);
        if (match) match.days.push(d);
        else groups.push({ days: [d], open: h.open, close: h.close });
      });

      const parts = groups.map(g => {
        const daysStr = g.days.map(d => DAY_SHORT[d]).join("-");
        return `${daysStr} ${g.open}-${g.close} น.`;
      });
      setHoursText(`เปิดให้บริการ: ${parts.join(', ')}`);
    }).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "Sarabun, sans-serif" }}>
      {/* แผงด้านซ้าย - ข้อมูลคลินิกและภาพประกอบ */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-10 xl:p-12 h-screen sticky top-0"
        style={{ background: "linear-gradient(160deg, #1A365D 0%, #2A507A 100%)" }}
      >
        <div>
          {/* โลโก้คลินิก */}
          <div className="flex items-center gap-3 mb-6 xl:mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
              <Smile size={20} color="white" />
            </div>
            <div>
              <div className="font-bold text-white text-sm" style={{ fontFamily: "Sarabun, sans-serif" }}>คลินิกสุภัทร</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>SUPHAT CLINIC</div>
            </div>
          </div>

          {/* ภาพประกอบและข้อความสโลแกน */}
          <div>
            <img
              src="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=500&h=400&fit=crop&auto=format"
              alt="คลินิก"
              className="w-full rounded-2xl object-cover mb-6 auth-panel-img shadow-lg"
              style={{ maxHeight: 240 }}
            />
            <p className="text-2xl font-bold text-white leading-snug mb-3" style={{ fontFamily: "Sarabun, sans-serif" }}>
              ยิ้มสวย มั่นใจทุกวัน<br />ดูแลโดยผู้เชี่ยวชาญ
            </p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              จองนัดหมาย ติดตามประวัติการรักษา และดูแลสุขภาพช่องปากได้ทุกที่ทุกเวลา
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs pt-4" style={{ color: "rgba(255,255,255,0.4)" }}>
          <Clock size={12} /> {hoursText}
        </div>
      </div>

      {/* แผงด้านขวา - แบบฟอร์ม */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-xl">
          {/* โลโก้สำหรับหน้าจอมือถือ */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
              <Smile size={16} color="white" />
            </div>
            <span className="font-bold text-base" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>คลินิกสุภัทร</span>
          </div>

          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>{title}</h1>
          <p className="text-base mb-10" style={{ color: "#4A6080" }}>{sub}</p>
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

