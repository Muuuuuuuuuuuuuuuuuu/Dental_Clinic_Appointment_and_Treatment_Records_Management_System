ALTER TABLE public.dentist DROP COLUMN IF EXISTS license_expiry;
ALTER TABLE public.dentist ADD COLUMN IF NOT EXISTS university VARCHAR(255);
