import React from "react";
import { Calendar, Clock, FileText, Shield, ChevronRight } from "lucide-react";
import { View } from "../../types";
import { Appointment } from "@/app/shared/data";

interface MetricCardsProps {
  appointments?: Appointment[];
  history?: any[];
  onNavigate: (v: View) => void;
}

/**
 * 📊 [DASHBOARD COMPONENT] การ์ดสรุปสถิตินัดหมายและค่าใช้จ่ายของคนไข้
 */
export default function MetricCards({
  appointments = [],
  history = [],
  onNavigate,
}: MetricCardsProps) {
  const safeAppointments = appointments || [];
  const safeHistory = history || [];

  const activeCount = safeAppointments.filter(
    (a) => a && a.status !== "เสร็จสิ้น" && a.status !== "ยกเลิก" && a.status !== "ไม่มาตามนัด"
  ).length;

  const inServiceCount = safeAppointments.filter(
    (a) =>
      a &&
      (a.status === "เช็คอินเรียบร้อย" ||
        a.status === "กำลังรักษา" ||
        a.status === "รอชำระเงิน")
  ).length;

  const totalCost = safeHistory.reduce(
    (s, h) => s + parseInt((h?.cost || "0").replace(/,/g, ""), 10),
    0
  );

  const metrics = [
    {
      label: "นัดหมายทั้งหมด",
      val: activeCount,
      icon: Calendar,
      nav: "appointments" as View,
    },
    {
      label: "รอรับบริการ",
      val: inServiceCount,
      icon: Clock,
      nav: "appointments" as View,
    },
    {
      label: "ประวัติการรักษา",
      val: history.length,
      icon: FileText,
      nav: "history" as View,
    },
    {
      label: "ค่าใช้จ่ายรวม",
      val: `฿${totalCost.toLocaleString()}`,
      icon: Shield,
      nav: "history" as View,
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((s) => (
        <button
          key={s.label}
          onClick={() => onNavigate(s.nav)}
          className="rounded-2xl p-4 bg-white text-left transition-all hover:shadow-md active:scale-[0.98]"
          style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.05)" }}
        >
          <div
            className="text-2xl font-bold"
            style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
          >
            {s.val}
          </div>
          <div
            className="text-xs mt-0.5 flex items-center gap-1"
            style={{ color: "#4A6080" }}
          >
            {s.label} <ChevronRight size={10} />
          </div>
        </button>
      ))}
    </div>
  );
}
