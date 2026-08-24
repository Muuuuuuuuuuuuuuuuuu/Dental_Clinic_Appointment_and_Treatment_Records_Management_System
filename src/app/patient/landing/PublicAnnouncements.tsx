import React, { useState, useEffect } from "react";
import { Megaphone, Link as LinkIcon } from "lucide-react";
import { Announcement } from "../../shared/data";
import { getPublicAnnouncements } from "../../shared/supabaseApi";

export default function PublicAnnouncements({ onCTA }: { onCTA: () => void }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicAnnouncements()
      .then(data => {
        setAnnouncements(data.filter(a => a.target === "public" || a.target === "all_internal"));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <section id="announcements" className="py-20 relative overflow-hidden" style={{ backgroundColor: "#F8FAFC" }}>
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#E8F4FF] rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FFF0F2] rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2" />

      <div className="mx-auto px-6 lg:px-25 w-full py-12 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-between w-12 h-12 rounded-xl mb-4" style={{ backgroundColor: "#E8F4FF", color: "#1D6FA4" }}>
            <Megaphone size={24} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>
            ประกาศและข่าวสารจากคลินิก
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#4A6080" }}>
            อัปเดตข้อมูลข่าวสาร โปรโมชั่นพิเศษ และกิจกรรมต่างๆ จาก Dental Clinic
          </p>
        </div>

        {announcements.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <p className="text-lg" style={{ color: "#4A6080" }}>ยังไม่มีประกาศในขณะนี้</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {announcements.map(a => (
              <div key={a.id} className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1 flex flex-col group">
                {a.mediaUrl && (
                  <div className="h-64 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                    <img src={a.mediaUrl} alt={a.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute bottom-4 left-4 z-20">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-bold rounded-full" style={{ color: "#1D6FA4" }}>
                        ข่าวประกาศ
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-8 flex-1 flex flex-col">
                  {!a.mediaUrl && (
                    <span className="px-3 py-1 bg-[#E8F4FF] w-fit text-xs font-bold rounded-full mb-4" style={{ color: "#1D6FA4" }}>
                      ข่าวประกาศ
                    </span>
                  )}
                  <h3 className="text-xl font-bold mb-3" style={{ color: "#1A365D", fontFamily: "Playfair Display, serif" }}>
                    {a.title}
                  </h3>
                  <p className="mb-6 flex-1" style={{ color: "#4A6080", lineHeight: "1.7" }}>
                    {a.content}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100">
                    <span className="text-sm font-medium" style={{ color: "#94A3B8" }}>
                      {a.createdAt}
                    </span>
                    {a.link ? (
                      <a href={a.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold transition-colors" style={{ color: "#1D6FA4" }}>
                        ดูรายละเอียด <LinkIcon size={16} />
                      </a>
                    ) : (
                      <button onClick={onCTA} className="inline-flex items-center gap-2 font-semibold transition-colors hover:text-[#0A4B75]" style={{ color: "#1D6FA4" }}>
                        จองคิวเลย <LinkIcon size={16} className="rotate-45" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
