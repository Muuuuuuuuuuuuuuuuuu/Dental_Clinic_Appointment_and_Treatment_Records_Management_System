import { useState, useEffect } from "react";
import { Percent, Tag } from "lucide-react";
import { Promotion } from "../../shared/data";
import { getPublicPromotions } from "../../shared/supabaseApi";
import ClinicStatusBadge from "./ClinicStatus";

export default function Promotions({ onCTA }: { onCTA: () => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicPromotions()
      .then(setPromotions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const daysLeft = (until: string) => {
    const diff = Math.ceil((new Date(until).getTime() - Date.now()) / 86400000);
    if (diff <= 0) return "หมดอายุแล้ว";
    if (diff === 1) return "หมดพรุ่งนี้!";
    if (diff <= 7) return `เหลือ ${diff} วัน`;
    return `ถึง ${new Date(until).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}`;
  };

  if (loading) return null;

  return (
    <section id="promotions" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4" style={{ backgroundColor: "#FFE8EC", color: "#FF6B7E" }}>
              <Percent size={13} /> โปรโมชั่นล่าสุด
            </div>
            <h2 className="text-4xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>ข้อเสนอพิเศษ<br />เฉพาะช่วงนี้เท่านั้น</h2>
          </div>
          <ClinicStatusBadge />
        </div>

        {promotions.length === 0 ? (
          <div className="text-center py-16 rounded-3xl" style={{ backgroundColor: "#F8F9FA", border: "1px dashed rgba(26,54,93,0.15)" }}>
            <p className="text-lg" style={{ color: "#4A6080" }}>ยังไม่มีโปรโมชั่นในขณะนี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {promotions.map(p => {
            const original = Number(p.originalPrice);
            const sale = Number(p.salePrice);
            const saved = original - sale;
            const pct = Math.round(saved / original * 100);
            const isHot = hovered === p.id;
            return (
              <div key={p.id}
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
                className="rounded-3xl overflow-hidden flex flex-col transition-all duration-300"
                style={{
                  backgroundColor: "white",
                  boxShadow: isHot ? "0 20px 60px rgba(26,54,93,0.15)" : "0 2px 16px rgba(26,54,93,0.07)",
                  transform: isHot ? "translateY(-6px)" : "translateY(0)",
                }}>
                {/* Top color strip */}
                <div className="p-5 pb-4" style={{ backgroundColor: p.highlight || '#FFE8EC' }}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{p.icon || '✨'}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: p.tagColor || '#FF6B7E' }}>{p.tag}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#1A365D" }}>-{pct}%</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-base leading-snug" style={{ color: "#1A365D" }}>{p.title}</h3>
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs leading-relaxed mb-4 flex-1" style={{ color: "#4A6080" }}>{p.desc}</p>
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <div className="text-xs line-through" style={{ color: "#94A3B8" }}>฿{Number(p.originalPrice).toLocaleString()}</div>
                      <div className="text-xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#FF8C9A" }}>฿{Number(p.salePrice).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium" style={{ color: p.salePrice < p.originalPrice ? "#1B7A3E" : "#4A6080" }}>ประหยัด ฿{saved.toLocaleString()}</div>
                      <div className="text-xs mt-0.5" style={{ color: daysLeft(p.validUntil).includes("หมด") ? "#E74C3C" : "#4A6080" }}>
                        {daysLeft(p.validUntil)}
                      </div>
                    </div>
                  </div>
                  <button onClick={onCTA}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 flex items-center justify-center gap-1.5"
                    style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
                    <Tag size={13} /> จองโปรนี้
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        )}

        <p className="text-center text-xs mt-8" style={{ color: "#94A3B8" }}>
          * ราคาดังกล่าวเป็นราคาโปรโมชั่น ไม่รวมค่าบริการเพิ่มเติมในกรณีที่มีการรักษาพิเศษ • เงื่อนไขเป็นไปตามที่คลินิกกำหนด
        </p>
      </div>
    </section>
  );
}
