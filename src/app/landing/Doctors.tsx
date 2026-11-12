import { useState, useEffect } from "react";
import { Award, GraduationCap } from "lucide-react";
import { getLandingDoctors } from "@/app/shared/supabaseApi";

export default function Doctors({ onCTA }: { onCTA: () => void }) {
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    getLandingDoctors().then(setDoctors);
  }, []);
  return (
    <section id="doctors" style={{ backgroundColor: "#F8F9FA" }}>
      <div className="mx-auto px-6 lg:px-25 w-full py-12 justify-between">
        <div className="text-center mb-14">
          <div className="inline-block text-sm font-medium px-4 py-1.5 rounded-full mb-4" style={{ backgroundColor: "#FFD6DC", color: "#FF6B7E" }}>ทีมแพทย์</div>
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>ทีมทันตแพทย์ผู้เชี่ยวชาญ</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {doctors.map((d, i) => (
            <div key={i} className="rounded-3xl overflow-hidden group flex flex-col justify-between" style={{ backgroundColor: "white", boxShadow: "0 4px 24px rgba(26,54,93,0.08)" }}>
              <div className="relative overflow-hidden" style={{ aspectRatio: "1/1" }}>
                <img src={d.img} alt={d.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,transparent 50%,rgba(26,54,93,0.65))" }} />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="font-semibold text-white text-base leading-tight drop-shadow-sm">{d.name}</p>
                  <p className="text-xs mt-1 font-medium" style={{ color: "#FFD6DC" }}>{d.specialty}</p>
                </div>
              </div>
              <div className="p-5 flex flex-col gap-3">
                {d.university && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: "#64748B" }}>
                    <GraduationCap size={15} style={{ color: "#0284C7", flexShrink: 0 }} />
                    <span className="truncate font-medium">{d.university}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Award size={15} style={{ color: "#FF8C9A" }} />
                    <span className="text-xs font-medium" style={{ color: "#4A6080" }}>{d.years}</span>
                  </div>
                  <button onClick={onCTA} className="text-xs font-semibold px-4 py-2 rounded-full hover:opacity-85 transition-opacity" style={{ backgroundColor: "#FFD6DC", color: "#FF6B7E" }}>
                    จองกับแพทย์ท่านนี้
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
