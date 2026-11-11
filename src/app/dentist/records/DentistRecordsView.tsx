import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { PatientInfo } from "@/app/shared/data";
import { useRealtimeAppointments } from "@/app/shared/useRealtimeAppointments";
import { getPatients } from "@/app/shared/supabaseApi";
import PatientCard from "./PatientCard";

interface DentistRecordsProps {
  doctorId?: number;
}

/**
 * 📁 [DENTIST RECORDS VIEW]
 * หน้าเวชระเบียนคนไข้ของทันตแพทย์ (Flat Architecture)
 * ตรงกับเมนู "เวชระเบียน" (key: records) บน Sidebar
 */
export default function DentistRecordsView({ doctorId }: DentistRecordsProps) {
  const { appointments } = useRealtimeAppointments();
  const [q, setQ] = useState("");
  const [allPatients, setAllPatients] = useState<PatientInfo[]>([]);

  useEffect(() => {
    getPatients().then(setAllPatients).catch(console.error);
  }, []);

  const results = allPatients.filter(
    (p) => p.name.includes(q) || p.hn.includes(q)
  );

  return (
    <div>
      {/* 1. ส่วนหัวและช่องค้นหา */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-sans text-[#1A365D]">
            เวชระเบียนคนไข้
          </h1>
          <p className="text-xs text-[#4A6080] mt-0.5">
            ประวัติและข้อมูลการรักษาทั้งหมด
          </p>
        </div>

        {/* ช่องค้นหา */}
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="ค้นหาชื่อคนไข้ หรือ HN..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#1A365D] bg-white text-slate-700 placeholder:text-slate-400 shadow-xs transition-colors"
          />
        </div>
      </div>

      {/* 2. รายการการ์ดคนไข้ */}
      {results.length === 0 ? (
        <div className="text-center py-12 text-[#4A6080] bg-white rounded-2xl border border-gray-100">
          ไม่พบข้อมูลคนไข้ที่ค้นหา
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              appointments={appointments}
            />
          ))}
        </div>
      )}
    </div>
  );
}

