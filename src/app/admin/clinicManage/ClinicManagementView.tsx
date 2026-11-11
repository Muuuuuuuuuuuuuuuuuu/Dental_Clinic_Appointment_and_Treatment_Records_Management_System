import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { getServices } from "@/app/shared/supabaseApi";
import ServiceManagement from "./services/ServiceManagement";
import ClinicSettingsManagement from "./settings/ClinicSettings";
import ProductManagement from "./products/ProductManagement";
import { CLINIC_CARD_DEFS, ClinicSubView } from "./constants";

/**
 * 🏥 [CLINIC MANAGEMENT VIEW]
 * ศูนย์กลางการจัดการข้อมูลคลินิก (บริการ, วันเวลาเปิด-ปิด, คลังยาและสินค้า)
 */
export default function ClinicManagementView() {
  const [subView, setSubView] = useState<ClinicSubView>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    getServices()
      .then((svc) => setCounts({ services: svc.length }))
      .catch(console.error);
  }, []);

  if (subView === "services") return <ServiceManagement onBack={() => setSubView(null)} />;
  if (subView === "settings") return <ClinicSettingsManagement onBack={() => setSubView(null)} />;
  if (subView === "products") return <ProductManagement onBack={() => setSubView(null)} />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>
          จัดการคลินิก
        </h1>
        <p className="text-sm" style={{ color: "#4A6080" }}>เลือกหมวดหมู่ที่ต้องการจัดการ</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 w-full">
        {CLINIC_CARD_DEFS.map((card) => (
          <button
            key={card.key}
            onClick={() => setSubView(card.key)}
            className="group flex flex-col justify-between text-left bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
            style={{ borderColor: "rgba(26,54,93,0.08)" }}
          >
            {/* ส่วนหัวการ์ด */}
            <div className="p-4 sm:p-5 pb-3.5" style={{ background: card.gradient }}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-2.5"
                style={{ backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}
              >
                <card.icon size={20} color="white" />
              </div>
              <h3 className="text-base font-bold text-white tracking-wide">{card.title}</h3>
            </div>

            {/* ส่วนเนื้อหาของการ์ด */}
            <div className="p-4 sm:p-5 pt-3.5 flex-1 flex flex-col justify-between">
              <p className="text-xs leading-relaxed mb-4 min-h-[36px]" style={{ color: "#4A6080" }}>
                {card.desc}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full truncate"
                  style={{
                    backgroundColor: card.bgLight,
                    color: card.key === "settings" ? "#D97706" : card.key === "products" ? "#059669" : "#5B4DC7",
                  }}
                >
                  {card.key === "settings"
                    ? "ข้อมูลทั่วไป"
                    : counts[card.key] !== undefined
                    ? `${counts[card.key]} ${card.countLabel}`
                    : "ไม่ระบุจำนวน"}
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

