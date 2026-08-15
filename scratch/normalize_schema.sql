CREATE TABLE public.announcement (
    announcement_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    link VARCHAR(255),
    media_url VARCHAR(255),
    target VARCHAR(50) NOT NULL DEFAULT 'public',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.promotion (
    promotion_id SERIAL PRIMARY KEY,
    tag VARCHAR(100),
    tag_color VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    original_price DECIMAL(10, 2),
    sale_price DECIMAL(10, 2),
    valid_until DATE,
    icon VARCHAR(50),
    highlight_color VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.announcement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users
CREATE POLICY "Allow read access to all users" ON public.announcement FOR SELECT USING (true);
CREATE POLICY "Allow read access to all users" ON public.promotion FOR SELECT USING (true);

-- Allow all access to service_role (Admin bypasses RLS in supabaseApi.ts using anon key mostly? Wait, the seed script uses service_role, but frontend uses anon key.)
-- For this simple clinic app, we typically allow full access for all operations to anon as well, just like other tables.
CREATE POLICY "Allow all access to anon" ON public.announcement FOR ALL USING (true);
CREATE POLICY "Allow all access to anon" ON public.promotion FOR ALL USING (true);

-- Move existing data from clinic_settings (we will do this via a Node JS script to parse JSON and insert).
