import { useState } from "react";
import { MessageCircle } from "lucide-react";

export default function FloatingLine() {
  const [tip, setTip] = useState(false);
  return (
    <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3">
      {tip && (
        <div className="px-4 py-2 rounded-xl text-sm font-medium text-white whitespace-nowrap animate-fade-in-up"
          style={{ backgroundColor: "#00B900", boxShadow: "0 8px 24px rgba(0,185,0,0.3)" }}>
          ทักหาเราผ่าน LINE OA
        </div>
      )}
      <button onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}
        className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        style={{ backgroundColor: "#00B900", boxShadow: "0 8px 28px rgba(0,185,0,0.4)" }}
        aria-label="ติดต่อผ่าน LINE OA">
        <MessageCircle size={24} color="white" />
      </button>
    </div>
  );
}
