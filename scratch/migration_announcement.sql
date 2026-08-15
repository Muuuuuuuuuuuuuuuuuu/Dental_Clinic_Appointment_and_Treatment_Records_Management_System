ALTER TABLE public.announcement 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS expires_at DATE NULL;

ALTER TABLE public.promotion 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS expires_at DATE NULL;

-- Notify postgrest to reload schema
NOTIFY pgrst, 'reload schema';
