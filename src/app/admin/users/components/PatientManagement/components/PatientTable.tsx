import React from "react";
import StatusBadge from "@/app/shared/components/StatusBadge";
import { PatientInfo } from "@/app/shared/data";

interface PatientTableProps {
  patients: PatientInfo[];
  loading: boolean;
  onToggleStatus?: (patient: PatientInfo) => void;
}

export default function PatientTable({ patients, loading, onToggleStatus }: PatientTableProps) {
  if (loading) {
    return <div className="p-8 text-center text-gray-400 bg-white rounded-2xl">กำลังโหลดข้อมูลคนไข้...</div>;
  }

  if (patients.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
        <p className="text-sm text-[#4A6080]">ไม่พบข้อมูลคนไข้</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white overflow-hidden shadow-xs border border-gray-100">
      <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="sticky top-0 z-10 shadow-2xs" style={{ backgroundColor: "#F8F9FA" }}>
            <tr>
              {["HN", "ชื่อ-นามสกุล", "อีเมล", "เบอร์โทร", "โรคประจำตัว", "ประวัติแพ้ยา", "สถานะ"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "#4A6080" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid rgba(26,54,93,0.05)" }}>
                <td className="px-5 py-3.5 font-medium" style={{ color: "#1A365D" }}>
                  {p.hn}
                </td>
                <td className="px-5 py-3.5 font-medium">{p.name}</td>
                <td className="px-5 py-3.5 text-xs text-gray-500">{p.email || "-"}</td>
                <td className="px-5 py-3.5 text-xs text-gray-500">{p.phone || "-"}</td>
                <td className="px-5 py-3.5 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded-full ${
                      p.underlyingDisease && p.underlyingDisease !== "ไม่มี"
                        ? "bg-amber-50 text-amber-700 font-medium"
                        : "text-gray-400"
                    }`}
                  >
                    {p.underlyingDisease || "ไม่มี"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded-full ${
                      p.allergyHistory && p.allergyHistory !== "ไม่มี" && p.allergyHistory !== "ไม่มีประวัติ"
                        ? "bg-rose-50 text-rose-700 font-medium"
                        : "text-gray-400"
                    }`}
                  >
                    {p.allergyHistory || "ไม่มี"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => onToggleStatus?.(p)}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                    title={p.active ?? true ? "คลิกเพื่อปิดใช้งานคนไข้" : "คลิกเพื่อเปิดใช้งานคนไข้"}
                  >
                    <StatusBadge label="" active={p.active ?? true} />
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
