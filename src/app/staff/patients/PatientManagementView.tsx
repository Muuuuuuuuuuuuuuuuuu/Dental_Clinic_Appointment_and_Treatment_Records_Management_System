import React, { useState } from "react";
import { Search, UserPlus, Users } from "lucide-react";
import PatientVerification from "./PatientVerification";
import StaffRegisterPatient from "./StaffRegisterPatient";

type TabView = "search" | "register";

export default function PatientManagementView() {
  const [activeTab, setActiveTab] = useState<TabView>("search");

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>จัดการคนไข้</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>ค้นหาประวัติ หรือ ลงทะเบียนคนไข้ใหม่</p>
        </div>
      </div>

      {/* แถบเลือกหมวดหมู่ */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2" style={{ scrollbarWidth: "none" }}>
        <button
          onClick={() => setActiveTab("search")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === "search" ? 'shadow-md' : 'hover:bg-white/50'}`}
          style={{
            backgroundColor: activeTab === "search" ? "white" : "transparent",
            color: activeTab === "search" ? "#1A365D" : "#4A6080",
          }}
        >
          <Search size={16} /> ค้นหาประวัติคนไข้
        </button>
        <button
          onClick={() => setActiveTab("register")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === "register" ? 'shadow-md' : 'hover:bg-white/50'}`}
          style={{
            backgroundColor: activeTab === "register" ? "white" : "transparent",
            color: activeTab === "register" ? "#1A365D" : "#4A6080",
          }}
        >
          <UserPlus size={16} /> ลงทะเบียนใหม่
        </button>
      </div>

      {/* แสดงเนื้อหาตามแท็บที่เลือก */}
      <div className="mt-4">
        {activeTab === "search" ? (
          <div className="bg-white/50 p-1 rounded-2xl border border-transparent">
            {/* 
              We reuse PatientVerification directly.
              Note: We might want to adjust its internal styling later so it blends perfectly.
            */}
            <PatientVerification />
          </div>
        ) : (
          <div className="bg-white/50 p-1 rounded-2xl border border-transparent">
            <StaffRegisterPatient />
          </div>
        )}
      </div>
    </div>
  );
}
