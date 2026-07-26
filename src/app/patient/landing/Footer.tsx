import { Smile, MapPin, Phone, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#0F2340" }}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}><Smile size={16} color="white" /></div>
              <span className="font-bold text-sm text-white" style={{ fontFamily: "Playfair Display, serif" }}>คลินิกสุภัทร</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>ให้บริการทันตกรรมครบวงจร ด้วยมาตรฐานสากล ราคาที่เข้าถึงได้</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">บริการของเรา</h4>
            <ul className="space-y-2.5">{["ตรวจฟันและขูดหินปูน", "ฟอกสีฟัน", "จัดฟัน", "รากฟันเทียม", "อุดฟัน"].map(s => (
              <li key={s}><a href="#services" className="text-sm hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}>{s}</a></li>
            ))}</ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">ติดต่อเรา</h4>
            <div className="space-y-3">
              {[{Icon: MapPin, t: "123/45 ถนนสุขุมวิท ซอย 15 กรุงเทพฯ"}, {Icon: Phone, t: "02-555-1234"}, {Icon: Clock, t: "จ–ศ 09:00–20:00 น."}].map(({Icon, t}) => (
                <div key={t} className="flex items-start gap-2">
                  <Icon size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#FF8C9A" }} />
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>© 2025 คลินิกสุภัทร · สงวนลิขสิทธิ์</p>
          <div className="flex items-center gap-6">{["นโยบายความเป็นส่วนตัว", "เงื่อนไขการใช้งาน"].map(t => (
            <a key={t} href="#" className="text-xs hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.3)" }}>{t}</a>
          ))}</div>
        </div>
      </div>
    </footer>
  );
}
