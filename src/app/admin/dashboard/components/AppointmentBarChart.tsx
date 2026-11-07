import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Timeframe } from "../hooks/useDashboardData";

interface AppointmentBarChartProps {
  chartData: any[];
  timeframe: Timeframe;
  onChartClick: (data: any) => void;
}

/**
 * 📊 [CHART COMPONENT] กราฟแท่งแสดงจำนวนนัดหมาย
 */
export default function AppointmentBarChart({
  chartData,
  timeframe,
  onChartClick,
}: AppointmentBarChartProps) {
  return (
    <div
      className="rounded-xl bg-white p-4 flex flex-col"
      style={{ boxShadow: "0 2px 8px rgba(26,54,93,0.05)" }}
    >
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h2 className="font-semibold text-xs" style={{ color: "#1A365D" }}>
          กราฟนัดหมาย ({timeframe === "today" ? "รายชั่วโมง" : timeframe === "month" ? "รายเดือน" : "7 วัน"})
        </h2>
        {timeframe !== "today" && (
          <span className="text-[9px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
            คลิกแท่งกราฟ
          </span>
        )}
      </div>
      <div className="h-48 sm:h-52 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            barSize={timeframe === "month" ? 10 : timeframe === "today" ? 10 : 16}
            onClick={onChartClick}
            style={{ cursor: timeframe !== "today" ? "pointer" : "default" }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,54,93,0.06)" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 9, fill: "#4A6080" }}
              axisLine={false}
              tickLine={false}
              minTickGap={10}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#4A6080" }}
              axisLine={false}
              tickLine={false}
              width={25}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(v: number) => [`${v} เคส`, "นัดหมาย"]}
              contentStyle={{ borderRadius: 10, border: "none", fontSize: 10 }}
            />
            <Bar dataKey="appts" fill="#1A365D" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
