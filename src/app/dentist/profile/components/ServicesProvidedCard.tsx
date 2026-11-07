import React from "react";
import { DentistInfo, ServiceInfo } from "@/app/shared/data";

interface ServicesProvidedCardProps {
  doctor: DentistInfo;
  allServices: ServiceInfo[];
}

/**
 * 🦷 [RIGHT CARD COMPONENT] รายการบริการที่รับรักษา
 */
export default function ServicesProvidedCard({
  doctor,
  allServices,
}: ServicesProvidedCardProps) {
  const hasServices = doctor.serviceIds && doctor.serviceIds.length > 0;

  return (
    <div
      className="rounded-2xl bg-white p-6"
      style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
    >
      <h3 className="font-semibold mb-4 text-sm text-[#1A365D]">
        บริการที่รับรักษา
      </h3>
      {!hasServices ? (
        <p className="text-sm text-gray-500">ยังไม่มีข้อมูลบริการที่รับรักษา</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {doctor.serviceIds?.map((sid) => {
            const srv = allServices.find((s) => s.id === sid);
            if (!srv) return null;
            return (
              <div
                key={sid}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {srv.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

