import { Save, ArrowLeft } from "lucide-react";

interface SettingsHeaderProps {
  saving: boolean;
  onSave: () => void;
  onBack?: () => void;
}

export default function SettingsHeader({ saving, onSave, onBack }: SettingsHeaderProps) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-3">
      <div>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-semibold mb-1 text-[#4A6080] hover:text-[#1A365D] transition-colors cursor-pointer"
          >
            <ArrowLeft size={13} /> กลับไปเลือกหมวดหมู่
          </button>
        )}
        <h1 className="text-2xl font-bold text-[#1A365D]" style={{ fontFamily: "Sarabun, sans-serif" }}>
          ตั้งค่าระบบคลินิก
        </h1>
        <p className="text-xs text-[#4A6080]">จัดการเวลาเปิด-ปิด และวันหยุดทำการของคลินิก</p>
      </div>
      <button
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-1.5 px-4 py-2 bg-[#1A365D] hover:bg-[#122847] text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50 shadow-xs cursor-pointer"
      >
        <Save size={13} />
        {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
      </button>
    </div>
  );
}
