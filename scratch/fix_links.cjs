const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jggwuyqpcouziysxhaws.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3d1eXFwY291eml5c3hoYXdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNDc1MiwiZXhwIjoyMDk4NTAwNzUyfQ.QbKCunwMlSQyHnqlcBKGxRz0Von3sJfqd9fYG-m_qOw'
);

async function fixLinks() {
  // 1. Get the announcement ID
  const { data: anns } = await supabase.from('announcement').select('id, title').like('title', '%25-26 สิงหาคม%');
  if (!anns || anns.length === 0) {
    console.log("Announcement not found");
    return;
  }
  const annId = anns[0].id;

  // 2. Update the holidays to link to this announcement
  const { error } = await supabase
    .from('clinic_holiday')
    .update({ linked_announcement_id: annId })
    .in('holiday_date', ['2026-08-25', '2026-08-26']);
    
  if (error) console.error("Error linking:", error);
  else console.log("Successfully linked holidays to announcement ID:", annId);
}

fixLinks();
