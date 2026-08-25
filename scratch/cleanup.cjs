const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jggwuyqpcouziysxhaws.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3d1eXFwY291eml5c3hoYXdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNDc1MiwiZXhwIjoyMDk4NTAwNzUyfQ.QbKCunwMlSQyHnqlcBKGxRz0Von3sJfqd9fYG-m_qOw'
);

async function cleanEmptyStrings() {
  // Update link
  const { error: err1 } = await supabase.from('announcement')
    .update({ link: null })
    .eq('link', '');
  if (err1) console.error("Error updating link:", err1);
  else console.log("Cleaned empty links");

  // Update media_url
  const { error: err2 } = await supabase.from('announcement')
    .update({ media_url: null })
    .eq('media_url', '');
  if (err2) console.error("Error updating media_url:", err2);
  else console.log("Cleaned empty media_urls");
}

cleanEmptyStrings();
