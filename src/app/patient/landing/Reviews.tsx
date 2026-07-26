import { useState, useEffect } from "react";
import { Star, CheckCircle } from "lucide-react";
import { getReviews } from "../../shared/supabaseApi";

export default function Reviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  
  useEffect(() => {
    getReviews().then(setReviews);
  }, []);
  return (
    <section style={{ backgroundColor: "#1A365D" }}>
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white" style={{ fontFamily: "Playfair Display, serif" }}>เสียงจากคนไข้ของเรา</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <div key={i} className="rounded-2xl p-6" style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="flex items-center gap-1 mb-4">{[...Array(r.stars)].map((_, j) => <Star key={j} size={14} fill="#FBBF24" color="#FBBF24" />)}</div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.8)", fontWeight: 300 }}>&ldquo;{r.text}&rdquo;</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{r.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#FFB3BC" }}>{r.service}</p>
                </div>
                <CheckCircle size={16} style={{ color: "#FFB3BC" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
