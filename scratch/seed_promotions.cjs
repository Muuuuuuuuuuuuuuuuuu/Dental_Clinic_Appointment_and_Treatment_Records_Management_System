const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jggwuyqpcouziysxhaws.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3d1eXFwY291eml5c3hoYXdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNDc1MiwiZXhwIjoyMDk4NTAwNzUyfQ.QbKCunwMlSQyHnqlcBKGxRz0Von3sJfqd9fYG-m_qOw'
);

const promotions = [
  {
    id: 1,
    tag: "โปรโมชั่นจัดฟัน",
    tagColor: "#FF6B7E",
    title: "จัดฟันใส Invisalign",
    desc: "ลดพิเศษสำหรับนักศึกษา 20% พร้อมผ่อน 0% นาน 10 เดือน",
    originalPrice: 150000,
    salePrice: 120000,
    validUntil: "2026-12-31",
    icon: "✨",
    highlight: "#FFE8EC"
  },
  {
    id: 2,
    tag: "ฟอกสีฟัน",
    tagColor: "#3B82F6",
    title: "ฟอกสีฟันขาวกระจ่างใส",
    desc: "เทคโนโลยี Cool Light เห็นผลทันทีใน 45 นาที",
    originalPrice: 8500,
    salePrice: 5900,
    validUntil: "2026-09-30",
    icon: "🦷",
    highlight: "#EFF6FF"
  }
];

async function seedPromotions() {
  const { error } = await supabase
    .from('clinic_settings')
    .upsert({ 
      setting_key: 'promotions', 
      setting_value: JSON.stringify(promotions) 
    }, { onConflict: 'setting_key' });
    
  if (error) {
    console.error("Upsert failed:", error);
  } else {
    console.log("Successfully seeded promotions!");
  }
}

seedPromotions();
