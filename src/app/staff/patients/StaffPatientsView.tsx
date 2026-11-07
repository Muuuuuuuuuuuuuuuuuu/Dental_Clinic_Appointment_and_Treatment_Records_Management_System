import { useState } from "react";
import { PatientHeader, PatientSearchTab, PatientRegisterTab } from "./components";

/**
 * 🧑‍💼 [STAFF PATIENTS VIEW]
 * หน้าค้นหาและลงทะเบียนคนไข้ (Flat & Clean Architecture)
 */
export default function StaffPatientsView() {
  const [activeTab, setActiveTab] = useState<"search" | "register">("search");

  return (
    <div>
      {/* 1. ส่วนหัวและแถบสลับแท็บ ค้นหา / ลงทะเบียน */}
      <PatientHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 2. เนื้อหาตามแท็บที่เลือก */}
      <main>
        {activeTab === "search" && <PatientSearchTab />}
        {activeTab === "register" && <PatientRegisterTab />}
      </main>
    </div>
  );
}
