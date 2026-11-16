
export default function StatusBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: active ? "#E8FFF0" : "#F0F4F8", color: active ? "#1B7A3E" : "#64748B" }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: active ? "#22C55E" : "#94A3B8" }} />
      {label || (active ? "เปิดใช้งาน" : "ปิดใช้งาน")}
    </span>
  );
}
