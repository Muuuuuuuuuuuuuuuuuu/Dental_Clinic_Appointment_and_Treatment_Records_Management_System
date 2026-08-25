const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jggwuyqpcouziysxhaws.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3d1eXFwY291eml5c3hoYXdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNDc1MiwiZXhwIjoyMDk4NTAwNzUyfQ.QbKCunwMlSQyHnqlcBKGxRz0Von3sJfqd9fYG-m_qOw'
);

async function updateTestData() {
  // 1. Update the announcement to a future date (e.g., Aug 25, 2026)
  const { error: annError } = await supabase
    .from('announcement')
    .update({ 
      title: 'แจ้งวันหยุดคลินิก (25-26 สิงหาคม)', 
      content: 'ทางคลินิกขอเรียนให้ผู้รับบริการทุกท่านทราบว่า คลินิกจะหยุดทำการในวันที่ 25-26 สิงหาคม เพื่อจัดกิจกรรมภายใน และจะเปิดให้บริการตามปกติในวันที่ 27 สิงหาคม ขออภัยในความไม่สะดวกครับ'
    })
    .like('title', '%สงกรานต์%'); // Match the old one

  if (annError) console.error("Error updating announcement:", annError);
  else console.log("Updated announcement to August 25-26.");

  // 2. Insert into clinic_holiday so the calendar is actually locked on those days
  const holidays = [
    { holiday_date: '2026-08-25', holiday_name: 'กิจกรรมภายในคลินิก' },
    { holiday_date: '2026-08-26', holiday_name: 'กิจกรรมภายในคลินิก' }
  ];

  const { error: holError } = await supabase
    .from('clinic_holiday')
    .upsert(holidays, { onConflict: 'holiday_date' });

  if (holError) console.error("Error inserting holidays:", holError);
  else console.log("Inserted holidays into clinic_holiday.");
}

updateTestData();
