import { useState } from "react";
import { PatientHeader, PatientSearchTab, PatientRegisterTab } from "./components";
import {
  PENDING_REG_STORAGE_KEY,
  isPendingSessionValid,
} from "./components/PatientRegister/hooks/usePatientRegister";

export default function StaffPatientsView() {
  const [activeTab, setActiveTab] = useState<"search" | "register">(() => {
    try {
      const raw = localStorage.getItem(PENDING_REG_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!isPendingSessionValid(parsed)) {
          localStorage.removeItem(PENDING_REG_STORAGE_KEY);
        }
        return "register";
      }
    } catch {}
    return "search";
  });

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
