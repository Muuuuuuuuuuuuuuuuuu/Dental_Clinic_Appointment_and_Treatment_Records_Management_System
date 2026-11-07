import { useState, useEffect } from "react";
import { PatientInfo } from "@/app/shared/data";
import { useRealtimeAppointments } from "@/app/shared/useRealtimeAppointments";
import { getPatients } from "@/app/shared/supabaseApi";
import { PatientHeader, PatientCard, EmptyPatientState } from "./components";

interface DentistPatientsProps {
  doctorId?: number;
}

/**
 * 📁 [DENTIST PATIENTS VIEW]
 * หน้าเวชระเบียนคนไข้ของทันตแพทย์ (Flat & Clean Architecture)
 */
export default function DentistPatientsView({ doctorId }: DentistPatientsProps) {
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
      <PatientHeader search={q} onSearchChange={setQ} />

      {/* 2. รายการการ์ดคนไข้ */}
      {results.length === 0 ? (
        <EmptyPatientState />
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
