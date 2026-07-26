import { Calendar, ChevronRight, Star } from "lucide-react";
import ClinicStatusBadge from "./ClinicStatus";

export default function Hero({ onCTA }: { onCTA: () => void }) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ backgroundColor: "#FFFFFF", paddingTop: 72 }}>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle,#FFD6DC 0%,transparent 70%)", transform: "translate(30%,-30%)" }} />
      <div className="max-w-7xl mx-auto px-6 w-full py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <div className="mb-6">
              <ClinicStatusBadge />
            </div>
            <h1 className="text-5xl xl:text-6xl font-bold leading-tight mb-6"
              style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>
              ยิ้มสวย<br /><span style={{ color: "#FF8C9A" }}>มั่นใจทุกวัน</span><br />ดูแลโดยผู้เชี่ยวชาญ
            </h1>
            <p className="text-lg leading-relaxed mb-8 max-w-lg" style={{ color: "#4A6080", fontWeight: 300 }}>
              คลินิกทันตกรรมสุภัทรให้บริการครบวงจร ด้วยทีมทันตแพทย์มืออาชีพและบรรยากาศที่อบอุ่น เพราะสุขภาพฟันที่ดีคือรอยยิ้มที่มั่นใจ
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={onCTA}
                className="flex items-center gap-2.5 px-8 py-4 rounded-full font-semibold text-white transition-all hover:opacity-90 active:scale-95 btn-glow"
                style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)", boxShadow: "0 8px 28px rgba(255,140,154,0.45)", fontSize: "1rem" }}>
                <Calendar size={18} /> จองนัดหมายออนไลน์
              </button>
              <a href="#services" className="flex items-center gap-2 px-8 py-4 rounded-full font-medium transition-all hover:bg-gray-50"
                style={{ color: "#1A365D", border: "1.5px solid rgba(26,54,93,0.2)", fontSize: "1rem" }}>
                ดูบริการทั้งหมด <ChevronRight size={16} />
              </a>
            </div>
            <div className="flex flex-wrap gap-6 mt-10">
              {[{ n: "15+", l: "ปีประสบการณ์" }, { n: "8,500+", l: "คนไข้ที่ไว้วางใจ" }, { n: "98%", l: "ความพึงพอใจ" }].map((b, i) => (
                <div key={b.l} className="animate-fade-in-up" style={{ animationDelay: `${0.3 + i * 0.15}s` }}>
                  <div className="text-2xl font-bold shimmer-text" style={{ fontFamily: "Playfair Display, serif", color: "#FF8C9A" }}>{b.n}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#4A6080" }}>{b.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative hidden lg:block animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative z-10 rounded-3xl overflow-hidden hero-img-float" style={{ aspectRatio: "4/5", boxShadow: "0 24px 80px rgba(26,54,93,0.18)" }}>
              <img src="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800&h=1000&fit=crop&auto=format" alt="ทันตแพทย์" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -right-4 top-12 z-20 p-4 rounded-2xl bg-white card-float" style={{ boxShadow: "0 12px 40px rgba(26,54,93,0.14)", animationDelay: "1s" }}>
              <div className="flex items-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#FBBF24" color="#FBBF24" />)}
              </div>
              <p className="text-lg font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>4.9 / 5.0</p>
              <p className="text-xs" style={{ color: "#4A6080" }}>จาก 1,200+ รีวิว</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
