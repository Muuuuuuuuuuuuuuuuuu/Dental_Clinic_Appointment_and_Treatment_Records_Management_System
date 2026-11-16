import { Edit3 } from "lucide-react";
import StatusBadge from "@/app/shared/components/StatusBadge";
import { StaffInfo } from "@/app/shared/data";

interface StaffTableProps {
  staff: StaffInfo[];
  loading: boolean;
  onEdit: (person: StaffInfo) => void;
  onToggleStatus: (person: StaffInfo) => void;
}

export default function StaffTable({ staff, loading, onEdit, onToggleStatus }: StaffTableProps) {
  if (loading) {
    return <div className="p-8 text-center text-gray-400 bg-white rounded-2xl">กำลังโหลดข้อมูลพนักงาน...</div>;
  }

  if (staff.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
        <p className="text-sm text-[#4A6080]">ไม่พบข้อมูลพนักงาน</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white overflow-hidden shadow-xs border border-gray-100">
      <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 shadow-2xs" style={{ backgroundColor: "#F8F9FA" }}>
            <tr>
              {["ชื่อ-นามสกุล", "ตำแหน่ง", "อีเมล", "เบอร์โทร", "สถานะ", "จัดการ"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "#4A6080" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} style={{ borderBottom: "1px solid rgba(26,54,93,0.05)" }}>
                <td className="px-5 py-3.5 font-medium" style={{ color: "#1A365D" }}>
                  {s.name}
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "#FEF3C7", color: "#D97706" }}>
                    {s.role || "พนักงานคลินิก"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-gray-500">{s.email}</td>
                <td className="px-5 py-3.5 text-xs text-gray-500">{s.phone || "-"}</td>
                <td className="px-5 py-3.5">
                  <button onClick={() => onToggleStatus(s)} className="hover:opacity-80 transition-opacity cursor-pointer">
                    <StatusBadge label="" active={s.active ?? true} />
                  </button>
                </td>
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => onEdit(s)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-[#4A6080] cursor-pointer"
                    title="แก้ไขข้อมูล"
                  >
                    <Edit3 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

