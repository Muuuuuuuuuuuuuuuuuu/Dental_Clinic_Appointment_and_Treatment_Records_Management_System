const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jggwuyqpcouziysxhaws.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3d1eXFwY291eml5c3hoYXdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNDc1MiwiZXhwIjoyMDk4NTAwNzUyfQ.QbKCunwMlSQyHnqlcBKGxRz0Von3sJfqd9fYG-m_qOw'
);

const announcements = [
  {
    id: 101,
    title: "แจ้งวันหยุดเทศกาลสงกรานต์ คลินิกปิดทำการ 13-15 เม.ย.",
    content: "ทางคลินิกขอเรียนให้ผู้รับบริการทุกท่านทราบว่า คลินิกจะหยุดทำการในช่วงเทศกาลสงกรานต์ ตั้งแต่วันที่ 13 ถึง 15 เมษายน และจะเปิดให้บริการตามปกติในวันที่ 16 เมษายน ขออภัยในความไม่สะดวกครับ",
    target: "public",
    mediaUrl: "https://images.unsplash.com/photo-1628177142898-93e46e63286a?w=800&q=80",
    link: "",
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 102,
    title: "ประกาศงานเลี้ยงปีใหม่ประจำปีสำหรับทีมงานทุกคน",
    content: "ปีนี้ทางคลินิกจัดงานเลี้ยงปีใหม่ ในวันที่ 25 ธันวาคม ขอเชิญคุณหมอและพนักงานทุกท่านมาร่วมงานปาร์ตี้ ธีมงานคือ 'สีน้ำเงิน-ทอง' เตรียมตัวกันมาให้พร้อมนะครับ!",
    target: "all_internal",
    mediaUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
    link: "",
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 103,
    title: "อัปเดตแนวทางการใช้เครื่องมือ X-Ray ใหม่",
    content: "สำหรับทันตแพทย์ทุกท่าน ทางคลินิกได้นำเครื่อง X-Ray รุ่นใหม่เข้ามา ขอความกรุณาศึกษาวิธีการใช้งานตามคู่มือที่แนบมา และเข้าร่วมการอบรมสั้นๆ ในวันศุกร์นี้ครับ",
    target: "dentist",
    mediaUrl: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80",
    link: "https://docs.google.com/xray-guide",
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 104,
    title: "ระเบียบการเบิกจ่ายชุดพนักงานคลินิกใหม่",
    content: "แจ้งพนักงานทุกท่าน ฝ่ายบุคคลได้มีการปรับเปลี่ยนชุดยูนิฟอร์มใหม่ สามารถมาเบิกชุดได้ที่ฝ่ายบุคคลตั้งแต่วันจันทร์หน้าเป็นต้นไป",
    target: "staff",
    mediaUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&q=80",
    link: "",
    createdAt: new Date().toISOString().split('T')[0]
  }
];

async function seedAnnouncements() {
  const { error: upsertError } = await supabase
    .from('clinic_settings')
    .upsert({ 
      setting_key: 'announcements', 
      setting_value: JSON.stringify(announcements) 
    }, { onConflict: 'setting_key' });
    
  if (upsertError) {
    console.error("Upsert failed:", upsertError);
  } else {
    console.log("Successfully seeded announcements via upsert!");
  }
}

seedAnnouncements();
