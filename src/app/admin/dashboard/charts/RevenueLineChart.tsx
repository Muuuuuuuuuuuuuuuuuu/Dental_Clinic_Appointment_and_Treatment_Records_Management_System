import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Timeframe } from "../useDashboardData";

interface RevenueLineChartProps {
  chartData: any[];
  timeframe: Timeframe;
  onChartClick: (data: any) => void;
}

/**
 * 📈 [CHART COMPONENT] กราฟเส้นแสดงรายได้
 */
export default function RevenueLineChart({
  chartData,
  timeframe,
  onChartClick,
}: RevenueLineChartProps) {
  return (
    <div
      className="rounded-xl bg-white p-4 flex flex-col"
      style={{ boxShadow: "0 2px 8px rgba(26,54,93,0.05)" }}
    >
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h2 className="font-semibold text-xs" style={{ color: "#1A365D" }}>
          กราฟรายได้ ({timeframe === "today" ? "รายชั่วโมง" : timeframe === "month" ? "รายเดือน" : "7 วัน"})
        </h2>
        {timeframe !== "today" && (
          <span className="text-[9px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
            คลิกจุดเพื่อดูวันนั้น
          </span>
        )}
      </div>
      <div className="h-48 sm:h-52 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            onClick={onChartClick}
            style={{ cursor: timeframe !== "today" ? "pointer" : "default" }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,54,93,0.06)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 9, fill: "#4A6080" }}
              axisLine={false}
              tickLine={false}
              minTickGap={15}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#4A6080" }}
              axisLine={false}
              tickLine={false}
              width={25}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#22C55E"
              strokeWidth={2.5}
              dot={{ fill: "#22C55E", r: 2.5 }}
            />
            <Tooltip
              formatter={(v: number) => [`฿${v.toLocaleString()}`, "รายได้"]}
              contentStyle={{ borderRadius: 10, border: "none", fontSize: 10 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
