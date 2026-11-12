import React, { useState, useEffect } from "react";
import { MapPin, Phone } from "lucide-react";
import { getDailyHours, getWeeklyOffDays, DayHours } from "@/app/shared/supabaseApi";

export default function Contact({ onCTA }: { onCTA: () => void }) {
  const [dailyHours, setDailyHours] = useState<Record<string, DayHours>>({});
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([]);

  useEffect(() => {
    Promise.all([
      getDailyHours().then(data => setDailyHours(data)),
      getWeeklyOffDays().then(data => setWeeklyOffDays(data))
    ]).catch(console.error);
  }, []);

  return (
    <section id="contact" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="mx-auto px-6 lg:px-25 w-full py-12 justify-between">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>มาเยี่ยมชมคลินิก<br />ของเราได้เลย</h2>
            <div className="rounded-2xl overflow-hidden mb-6" style={{ aspectRatio: "16/9", backgroundColor: "#EDF2F7" }}>
              <img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=450&fit=crop&auto=format" alt="ที่ตั้งคลินิก" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3"><MapPin size={18} className="mt-0.5 flex-shrink-0" style={{ color: "#FF8C9A" }} /><p className="text-sm" style={{ color: "#4A6080" }}>123/45 ถนนสุขุมวิท ซอย 15 แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพมหานคร 10110</p></div>
              <div className="flex items-center gap-3"><Phone size={18} style={{ color: "#FF8C9A" }} /><p className="text-sm" style={{ color: "#4A6080" }}>02-555-1234 / 089-876-5432</p></div>
            </div>
          </div>
          <div>
            <div className="rounded-2xl p-8 mb-6" style={{ backgroundColor: "#F8F9FA", border: "1px solid rgba(26,54,93,0.08)" }}>
              <h3 className="text-xl font-semibold mb-5" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>เวลาทำการ</h3>
              {[
                { day: "จันทร์", idx: 1 }, { day: "อังคาร", idx: 2 }, { day: "พุธ", idx: 3 },
                { day: "พฤหัสบดี", idx: 4 }, { day: "ศุกร์", idx: 5 }, { day: "เสาร์", idx: 6 }, { day: "อาทิตย์", idx: 0 }
              ].map(h => {
                const isOff = weeklyOffDays.includes(h.idx);
                const hrs = dailyHours[h.idx.toString()];
                const t = isOff || !hrs ? "ปิดทำการ" : `${hrs.open} – ${hrs.close} น.`;
                return (
                  <div key={h.day} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(26,54,93,0.08)" }}>
                    <span className="text-sm" style={{ color: "#1A365D" }}>{h.day}</span>
                    <span className="text-sm font-medium" style={{ color: t === "ปิดทำการ" ? "#4A6080" : "#FF8C9A" }}>{t}</span>
                  </div>
                );
              })}
            </div>
            <div className="rounded-2xl p-8" style={{ background: "linear-gradient(135deg,#1A365D 0%,#2A507A 100%)", boxShadow: "0 12px 40px rgba(26,54,93,0.25)" }}>
              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "Sarabun, sans-serif" }}>พร้อมดูแลคุณแล้ว</h3>
              <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.7)" }}>จองนัดหมายออนไลน์ง่ายๆ เลือกแพทย์และเวลาที่สะดวกได้เลย</p>
              <button onClick={onCTA} className="w-full py-3.5 rounded-xl font-semibold text-white hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)", boxShadow: "0 4px 20px rgba(255,140,154,0.4)" }}>
                จองนัดหมายเดี๋ยวนี้
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
