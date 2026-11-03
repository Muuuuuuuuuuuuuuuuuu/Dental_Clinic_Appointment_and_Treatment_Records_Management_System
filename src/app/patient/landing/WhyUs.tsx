import { Shield, Award, Calendar, Heart } from "lucide-react";

export default function WhyUs() {
  return (
    <section id="about" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="mx-auto px-6 lg:px-25 w-full py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="rounded-3xl overflow-hidden" style={{ aspectRatio: "5/4", boxShadow: "0 20px 60px rgba(26,54,93,0.15)" }}>
              <img src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=900&h=720&fit=crop&auto=format" alt="คลินิก" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -right-6 p-5 rounded-2xl" style={{ backgroundColor: "#1A365D", boxShadow: "0 12px 40px rgba(26,54,93,0.3)" }}>
              <p className="text-3xl font-bold text-white" style={{ fontFamily: "Sarabun, sans-serif" }}>JCI</p>
              <p className="text-xs mt-1" style={{ color: "#FFD6DC" }}>มาตรฐานสากล</p>
            </div>
          </div>
          <div>
            <div className="inline-block text-sm font-medium px-4 py-1.5 rounded-full mb-5" style={{ backgroundColor: "#FFD6DC", color: "#FF6B7E" }}>ทำไมต้องเลือกเรา</div>
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>มาตรฐานระดับสากล<br />ใส่ใจทุกรายละเอียด</h2>
            <p className="text-base leading-relaxed mb-8" style={{ color: "#4A6080", fontWeight: 300 }}>เราเชื่อว่าการดูแลสุขภาพช่องปากคือการสร้างความมั่นใจและคุณภาพชีวิตที่ดีขึ้น</p>
            <div className="space-y-5">
              {[
                { icon: Shield, title: "อุปกรณ์ปลอดเชื้อมาตรฐาน", desc: "ผ่านการฆ่าเชื้อด้วยระบบ Autoclave ทุกชิ้น มั่นใจได้ 100%" },
                { icon: Award, title: "ทันตแพทย์เฉพาะทางครบทุกสาขา", desc: "ทีมแพทย์จบจากสถาบันชั้นนำ มีใบรับรองความเชี่ยวชาญเฉพาะด้าน" },
                { icon: Calendar, title: "จองออนไลน์ได้ตลอด 24 ชั่วโมง", desc: "ระบบจองอัจฉริยะ เลือกเวลา เลือกแพทย์ได้ตามต้องการ" },
                { icon: Heart, title: "ดูแลต่อเนื่องหลังการรักษา", desc: "ติดตามผลการรักษา ส่ง reminder นัดถัดไปอัตโนมัติ" },
              ].map(p => (
                <div key={p.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "#FFD6DC" }}>
                    <p.icon size={18} style={{ color: "#FF8C9A" }} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: "#1A365D" }}>{p.title}</h4>
                    <p className="text-sm" style={{ color: "#4A6080", fontWeight: 300 }}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
