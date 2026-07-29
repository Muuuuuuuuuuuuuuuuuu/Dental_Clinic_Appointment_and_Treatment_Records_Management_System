import { useState, useEffect } from "react";
import { ClinicStatus, getClinicStatus } from "../../shared/data";
import { getWeeklyOffDays, getClinicClosures, getClinicSettings, getDailyHours } from "../../shared/supabaseApi";

export default function ClinicStatusBadge({ compact = false }: { compact?: boolean }) {
  const [s, setS] = useState<ClinicStatus>(getClinicStatus());

  useEffect(() => {
    Promise.all([getWeeklyOffDays(), getClinicClosures(), getClinicSettings(), getDailyHours()]).then(([offDays, closures, settings, dh]) => {
      setS(getClinicStatus(new Date(), closures, offDays, settings, dh));
    }).catch(console.error);
  }, []);

  const isOpen = s.type === "open";
  const isSpecial = s.type === "special";
  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
        style={{ backgroundColor: s.color, color: isOpen ? "#1B7A3E" : isSpecial ? "#B45309" : "#64748B" }}>
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dotColor, animation: isOpen ? "pulse 2s infinite" : "none" }} />
        {s.label}
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-medium"
      style={{ backgroundColor: s.color, color: isOpen ? "#1B7A3E" : isSpecial ? "#92400E" : "#475569" }}>
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.dotColor, animation: isOpen ? "pulse 2s infinite" : "none" }} />
      <span className="font-semibold">{s.label}</span>
      <span className="hidden sm:inline opacity-75 text-xs">— {s.sublabel}</span>
    </div>
  );
}

export function ClinicStatusCard() {
  const [s, setS] = useState<ClinicStatus>(getClinicStatus());

  useEffect(() => {
    Promise.all([getWeeklyOffDays(), getClinicClosures(), getClinicSettings(), getDailyHours()]).then(([offDays, closures, settings, dh]) => {
      setS(getClinicStatus(new Date(), closures, offDays, settings, dh));
    }).catch(console.error);
  }, []);

  if (s.type === "open") return null;
  return (
    <div className="rounded-2xl p-4 flex items-start gap-3 mb-6"
      style={{ backgroundColor: s.type === "special" ? "#FFF3E0" : "#F1F5F9", border: `1px solid ${s.type === "special" ? "#FED7AA" : "#E2E8F0"}` }}>
      <span className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: s.dotColor }} />
      <div>
        <p className="text-sm font-semibold" style={{ color: s.type === "special" ? "#92400E" : "#475569" }}>
          {s.label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: s.type === "special" ? "#B45309" : "#64748B" }}>{s.sublabel}</p>
      </div>
    </div>
  );
}
