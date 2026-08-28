ALTER TABLE public.patient 
ADD COLUMN IF NOT EXISTS health_form_completed BOOLEAN DEFAULT FALSE;

-- แจ้ง PostgREST ให้รีโหลด Schema ทันที
NOTIFY pgrst, 'reload schema';
