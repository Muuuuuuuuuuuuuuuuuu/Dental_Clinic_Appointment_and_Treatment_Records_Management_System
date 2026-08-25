const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jggwuyqpcouziysxhaws.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3d1eXFwY291eml5c3hoYXdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNDc1MiwiZXhwIjoyMDk4NTAwNzUyfQ.QbKCunwMlSQyHnqlcBKGxRz0Von3sJfqd9fYG-m_qOw'
);

const announcements = [
  {
    title: "แจ้งวันหยุดเทศกาลสงกรานต์ คลินิกปิดทำการ 13-15 เม.ย.",
    content: "ทางคลินิกขอเรียนให้ผู้รับบริการทุกท่านทราบว่า คลินิกจะหยุดทำการในช่วงเทศกาลสงกรานต์ ตั้งแต่วันที่ 13 ถึง 15 เมษายน และจะเปิดให้บริการตามปกติในวันที่ 16 เมษายน ขออภัยในความไม่สะดวกครับ",
    target: "public",
    media_url: "https://images.unsplash.com/photo-1628177142898-93e46e63286a?w=800&q=80",
    link: ""
  },
  {
    title: "ประกาศงานเลี้ยงปีใหม่ประจำปีสำหรับทีมงานทุกคน",
    content: "ปีนี้ทางคลินิกจัดงานเลี้ยงปีใหม่ ในวันที่ 25 ธันวาคม ขอเชิญคุณหมอและพนักงานทุกท่านมาร่วมงานปาร์ตี้ ธีมงานคือ 'สีน้ำเงิน-ทอง' เตรียมตัวกันมาให้พร้อมนะครับ!",
    target: "all_internal",
    media_url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
    link: ""
  },
  {
    title: "อัปเดตแนวทางการใช้เครื่องมือ X-Ray ใหม่",
    content: "สำหรับทันตแพทย์ทุกท่าน ทางคลินิกได้นำเครื่อง X-Ray รุ่นใหม่เข้ามา ขอความกรุณาศึกษาวิธีการใช้งานตามคู่มือที่แนบมา และเข้าร่วมการอบรมสั้นๆ ในวันศุกร์นี้ครับ",
    target: "dentist",
    media_url: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80",
    link: "https://docs.google.com/xray-guide"
  },
  {
    title: "ระเบียบการเบิกจ่ายชุดพนักงานคลินิกใหม่",
    content: "แจ้งพนักงานทุกท่าน ฝ่ายบุคคลได้มีการปรับเปลี่ยนชุดยูนิฟอร์มใหม่ สามารถมาเบิกชุดได้ที่ฝ่ายบุคคลตั้งแต่วันจันทร์หน้าเป็นต้นไป",
    target: "staff",
    media_url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&q=80",
    link: ""
  }
];

const promotions = [
  {
    tag: "โปรโมชั่นจัดฟัน",
    tag_color: "#FF6B7E",
    title: "จัดฟันใส Invisalign",
    desc_text: "ลดพิเศษสำหรับนักศึกษา 20% พร้อมผ่อน 0% นาน 10 เดือน",
    original_price: 150000,
    sale_price: 120000,
    valid_until: "2026-12-31",
    icon: "✨",
    highlight: "#FFE8EC"
  },
  {
    tag: "ฟอกสีฟัน",
    tag_color: "#3B82F6",
    title: "ฟอกสีฟันขาวกระจ่างใส",
    desc_text: "เทคโนโลยี Cool Light เห็นผลทันทีใน 45 นาที",
    original_price: 8500,
    sale_price: 5900,
    valid_until: "2026-09-30",
    icon: "🦷",
    highlight: "#EFF6FF"
  }
];

async function seed() {
  const { error: aError } = await supabase.from('announcement').insert(announcements);
  if (aError) console.error("Error seeding announcements:", aError);
  else console.log("Seeded announcements!");
  
  const { error: pError } = await supabase.from('promotion').insert(promotions);
  if (pError) console.error("Error seeding promotions:", pError);
  else console.log("Seeded promotions!");
}

seed();
