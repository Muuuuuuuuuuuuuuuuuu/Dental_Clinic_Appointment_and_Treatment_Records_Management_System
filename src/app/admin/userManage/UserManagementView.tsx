import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { getAdmins, getDentists, getStaff, getPatients } from "@/app/shared/supabaseApi";
import AdminManagement from "./admins/AdminManagement";
import DentistManagement from "./dentists/DentistManagement";
import StaffManagement from "./staff/StaffManagement";
import PatientManagement from "./patients/PatientManagement";
import { USER_CARD_DEFS, UsersSubView } from "./constants";

/**
 * 👥 [USER MANAGEMENT VIEW]
 * ศูนย์กลางการจัดการผู้ใช้งานทั้งหมดในระบบ (แอดมิน, ทันตแพทย์, พนักงาน, คนไข้)
 */
export default function UserManagementView() {
  const [subView, setSubView] = useState<UsersSubView>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    Promise.all([getAdmins(), getDentists(), getStaff(), getPatients()])
      .then(([adm, den, stf, pat]) => {
        setCounts({
          admins: adm.length,
          dentists: den.length,
          staff: stf.length,
          patients: pat.length,
        });
      })
      .catch(console.error);
  }, []);

  if (subView === "admins") return <AdminManagement onBack={() => setSubView(null)} />;
  if (subView === "dentists") return <DentistManagement onBack={() => setSubView(null)} />;
  if (subView === "staff") return <StaffManagement onBack={() => setSubView(null)} />;
  if (subView === "patients") return <PatientManagement onBack={() => setSubView(null)} />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>
          จัดการผู้ใช้งาน
        </h1>
        <p className="text-sm" style={{ color: "#4A6080" }}>เลือกกลุ่มผู้ใช้งานที่ต้องการจัดการ</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 w-full">
        {USER_CARD_DEFS.map((card) => (
          <button
            key={card.key}
            onClick={() => setSubView(card.key)}
            className="group flex flex-col justify-between text-left bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
            style={{ borderColor: "rgba(26,54,93,0.08)" }}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 pb-3.5" style={{ background: card.gradient }}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-2.5"
                style={{ backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}
              >
                <card.icon size={20} color="white" />
              </div>
              <h3 className="text-base font-bold text-white tracking-wide">{card.title}</h3>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 pt-3.5 flex-1 flex flex-col justify-between">
              <p className="text-xs leading-relaxed mb-4 min-h-[36px]" style={{ color: "#4A6080" }}>
                {card.desc}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full truncate"
                  style={{
                    backgroundColor: card.bgLight,
                    color:
                      card.key === "admins"
                        ? "#e14c53"
                        : card.key === "dentists"
                        ? "#DB5A6B"
                        : card.key === "staff"
                        ? "#C93756"
                        : "#059669",
                  }}
                >
                  {counts[card.key] !== undefined ? `${counts[card.key]} ${card.countLabel}` : "กำลังโหลด..."}
                </span>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 shrink-0"
                  style={{ backgroundColor: "#F0F4F8" }}
                >
                  <ChevronRight size={14} style={{ color: "#4A6080" }} />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

