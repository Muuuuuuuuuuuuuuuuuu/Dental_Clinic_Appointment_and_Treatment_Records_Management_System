import { useState, useEffect } from "react";
import { X, Menu, Smile, User, Calendar, ChevronRight } from "lucide-react";
import ClinicStatusBadge from "./ClinicStatus";

export default function Header({ onLoginClick, isLoggedIn, onPortal }: { onLoginClick: () => void; isLoggedIn: boolean; onPortal: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.95)",
        boxShadow: scrolled ? "0 2px 24px rgba(26,54,93,0.1)" : "0 1px 0 rgba(26,54,93,0.06)",
        backdropFilter: "blur(12px)",
      }}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ height: 72 }}>
        <a href="#" className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
            <Smile size={20} color="white" />
          </div>
          <div>
            <div className="font-bold text-base leading-tight" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>คลินิกสุภัทร</div>
            <div className="text-xs" style={{ color: "#4A6080", letterSpacing: "0.05em" }}>SUPHAT CLINIC</div>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-6">
          {[["บริการของเรา", "#services"], ["โปรโมชั่น", "#promotions"], ["ทีมทันตแพทย์", "#doctors"], ["ติดต่อเรา", "#contact"]].map(([l, h]) => (
            <a key={l} href={h} className="text-sm font-medium transition-opacity hover:opacity-60" style={{ color: l === "โปรโมชั่น" ? "#FF8C9A" : "#1A365D" }}>{l}</a>
          ))}
          <ClinicStatusBadge compact />
        </nav>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <button onClick={onPortal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)", boxShadow: "0 4px 16px rgba(255,140,154,0.35)" }}>
              <User size={14} /> บัญชีของฉัน
            </button>
          ) : (
            <>
              <button onClick={onLoginClick} className="hidden md:flex text-sm font-medium hover:opacity-60 transition-opacity" style={{ color: "#1A365D" }}>
                เข้าสู่ระบบ
              </button>
              <button onClick={onLoginClick}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)", boxShadow: "0 4px 16px rgba(255,140,154,0.35)" }}>
                <Calendar size={14} /> จองคิว
              </button>
            </>
          )}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ color: "#1A365D" }}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t bg-white" style={{ borderColor: "rgba(26,54,93,0.08)" }}>
          <div className="px-6 py-4 space-y-1">
            {[["บริการของเรา", "#services"], ["ทีมทันตแพทย์", "#doctors"], ["เกี่ยวกับเรา", "#about"], ["ติดต่อเรา", "#contact"]].map(([l, h]) => (
              <a key={l} href={h} onClick={() => setMenuOpen(false)} className="block py-2.5 text-sm font-medium" style={{ color: "#1A365D" }}>{l}</a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

