
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://jggwuyqpcouziysxhaws.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3d1eXFwY291eml5c3hoYXdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNDc1MiwiZXhwIjoyMDk4NTAwNzUyfQ.QbKCunwMlSQyHnqlcBKGxRz0Von3sJfqd9fYG-m_qOw');

async function run() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: 'CREATE TABLE IF NOT EXISTS public.treatment_detail (detail_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ), treatment_id integer NOT NULL, tooth_number character varying, service_name character varying NOT NULL, actual_price numeric(10,2), notes text, CONSTRAINT treatment_detail_pkey PRIMARY KEY (detail_id), CONSTRAINT treatment_detail_treatment_id_fkey FOREIGN KEY (treatment_id) REFERENCES public.treatment_record (treatment_id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE);'
  });
  console.log('Error:', error);
}
run();

