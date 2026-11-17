import { TimeFilter } from "../types";

interface QueueHeaderProps {
  timeFilter: TimeFilter;
  setTimeFilter: (val: TimeFilter) => void;
  formattedDate: string;
  count: number;
}

const FILTER_OPTIONS: { id: TimeFilter; label: string }[] = [
  { id: "today", label: "วันนี้" },
  { id: "week", label: "สัปดาห์นี้" },
  { id: "month", label: "เดือนนี้" },
  { id: "all", label: "ทั้งหมด" },
];

export default function QueueHeader({
  timeFilter,
  setTimeFilter,
  formattedDate,
  count,
}: QueueHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>
          คิวการรักษา
        </h1>
        <p className="text-sm " style={{ color: "#4A6080" }}>
          {timeFilter === "today"
            ? `วันที่ ${formattedDate}`
            : timeFilter === "week"
            ? "สัปดาห์นี้"
            : timeFilter === "month"
            ? "เดือนนี้"
            : "คิวทั้งหมด"} • {count} ราย
        </p>
      </div>
      <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
        {FILTER_OPTIONS.map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => setTimeFilter(f.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              timeFilter === f.id ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

