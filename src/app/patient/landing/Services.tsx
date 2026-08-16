import { useState, useEffect } from "react";
import { ChevronRight, Smile, Sparkles, Shield, Award, Heart, Calendar, Zap, Scissors, Crown, Layers, Star, Syringe, Baby, Activity, Clock } from "lucide-react";
import { getLandingServices } from "../../shared/supabaseApi";

const iconMap: Record<string, any> = { Smile, Sparkles, Shield, Award, Heart, Calendar, Zap, Scissors, Crown, Layers, Star, Syringe, Baby, Activity, Clock };

export default function Services({ onCTA }: { onCTA: () => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [services, setServices] = useState<any[]>([]);
  
  useEffect(() => {
    getLandingServices().then(setServices);
  }, []);
  return (
    <section id="services" style={{ backgroundColor: "#F8F9FA" }}>
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14 animate-fade-in-up">
          <div className="inline-block text-sm font-medium px-4 py-1.5 rounded-full mb-4" style={{ backgroundColor: "#FFE8EC", color: "#FF6B7E" }}>บริการทั้งหมด</div>
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>บริการทันตกรรมครบวงจร</h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: "#4A6080", fontWeight: 300 }}>ให้บริการครอบคลุมทุกความต้องการด้านสุขภาพช่องปาก</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => {
            const Icon = iconMap[s.iconName] || Smile;
            return (
            <div key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
              className="group rounded-2xl p-6 cursor-pointer transition-all duration-300 animate-fade-in-up"
              style={{
                backgroundColor: "white",
                boxShadow: hovered === i ? "0 16px 48px rgba(26,54,93,0.14)" : "0 2px 12px rgba(26,54,93,0.06)",
                transform: hovered === i ? "translateY(-4px)" : "translateY(0)",
                animationDelay: `${i * 0.1}s`,
              }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: s.color }}>
                <Icon size={22} style={{ color: "#1A365D" }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "#1A365D" }}>{s.title}</h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#4A6080", fontWeight: 300 }}>{s.desc}</p>
              <div className="flex items-center gap-1.5 mb-4 text-xs font-medium" style={{ color: "#4A6080" }}>
                <Clock size={14} style={{ color: "#FF8C9A" }} />
                <span>ใช้เวลาประมาณ {s.baseTimeMins} นาที</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: "#FF8C9A" }}>{s.price}</span>
                <button onClick={onCTA} className="flex items-center gap-1 text-sm font-medium transition-all" style={{ color: hovered === i ? "#FF8C9A" : "#4A6080" }}>
                  จองเลย <ChevronRight size={14} />
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
