import React, { useState, useEffect } from "react";
import { Link as LinkIcon, Megaphone } from "lucide-react";
import { Announcement } from "../data";
import { getAnnouncements } from "../supabaseApi";

interface AnnouncementViewProps {
  role: "dentist" | "staff";
}

export default function AnnouncementView({ role }: AnnouncementViewProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnnouncements()
      .then(data => {
        setAnnouncements(data.filter(a => a.target === "all_internal" || a.target === role));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [role]);

  if (loading) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>
          <Megaphone size={24} color="#F59E0B" /> ประกาศจากคลินิก
        </h1>
        <p className="text-sm" style={{ color: "#4A6080" }}>อัปเดตข่าวสารและประกาศสำคัญภายในองค์กร</p>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border" style={{ borderColor: "rgba(26,54,93,0.1)" }}>
          <Megaphone size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-500">ยังไม่มีประกาศใหม่ในขณะนี้</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {announcements.map(a => (
            <div key={a.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border flex flex-col hover:shadow-md transition-shadow" style={{ borderColor: "rgba(26,54,93,0.1)" }}>
              {a.mediaUrl && (
                <div className="h-48 w-full overflow-hidden bg-gray-100">
                  <img src={a.mediaUrl} alt="announcement" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <span className="text-xs font-medium px-2 py-1 bg-amber-50 text-amber-700 rounded-md w-fit mb-3">
                  ประกาศ
                </span>
                <h3 className="font-bold mb-3 text-xl leading-tight" style={{ color: "#1A365D" }}>{a.title}</h3>
                <p className="text-sm mb-6 flex-1" style={{ color: "#4A6080", lineHeight: "1.6" }}>{a.content}</p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <span className="text-xs font-medium" style={{ color: "#94A3B8" }}>อัปเดตเมื่อ: {a.createdAt}</span>
                  {a.link && (
                    <a href={a.link} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                      ดูรายละเอียด <LinkIcon size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
