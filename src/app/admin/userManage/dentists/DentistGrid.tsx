import React from "react";
import { Edit3, Award, Mail, Phone } from "lucide-react";
import StatusBadge from "@/app/shared/components/StatusBadge";
import { DentistInfo } from "@/app/shared/data";

interface DentistGridProps {
  dentists: DentistInfo[];
  loading: boolean;
  onEdit: (dentist: DentistInfo) => void;
  onToggleStatus: (dentist: DentistInfo) => void;
}

export default function DentistGrid({
  dentists,
  loading,
  onEdit,
  onToggleStatus,
}: DentistGridProps) {
  if (loading) {
    return <div className="p-8 text-center text-gray-400 bg-white rounded-2xl">กำลังโหลดข้อมูลทันตแพทย์...</div>;
  }

  if (dentists.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
        <p className="text-sm text-[#4A6080]">ไม่พบข้อมูลทันตแพทย์</p>
      </div>
    );
  }

  return (
    <div className="max-h-[580px] overflow-y-auto pr-1">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {dentists.map((d) => (
        <div
          key={d.id}
          className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow"
        >
          <div>
            <div className="flex items-start justify-between mb-3.5">
              <div className="flex items-center gap-3">
                {d.imageUrl ? (
                  <img src={d.imageUrl} alt={d.firstName} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                ) : (
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-base font-bold shrink-0"
                    style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}
                  >
                    {d.firstName?.[0] ?? "ด"}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-sm" style={{ color: "#1A365D" }}>
                    {d.titleName || "ทพ."} {d.firstName} {d.lastName}
                  </h3>
                  <p className="text-xs font-medium text-[#FF8C9A]">{d.specialty || "ทันตกรรมทั่วไป"}</p>
                </div>
              </div>
              <button
                onClick={() => onEdit(d)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-[#4A6080] cursor-pointer"
                title="แก้ไข"
              >
                <Edit3 size={15} />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-gray-500 pt-2 border-t border-gray-100 mb-3">
              <div className="flex items-center gap-2">
                <Award size={13} className="text-gray-400 shrink-0" />
                <span className="truncate">ว. {d.license || "-"} ({d.university || "-"})</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-gray-400 shrink-0" />
                <span className="truncate">{d.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-gray-400 shrink-0" />
                <span>{d.phone || "-"}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <button onClick={() => onToggleStatus(d)} className="hover:opacity-80 transition-opacity cursor-pointer">
              <StatusBadge label="" active={d.active ?? true} />
            </button>
            {d.serviceIds && d.serviceIds.length > 0 && (
              <span className="text-[11px] font-medium px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md">
                รับ {d.serviceIds.length} บริการ
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
  );
}

