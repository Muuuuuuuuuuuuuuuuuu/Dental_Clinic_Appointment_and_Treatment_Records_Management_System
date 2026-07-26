import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_URL';
const supabaseKey = 'YOUR_KEY';

// I will just write the query text, but since we are running in local dev server, I can't easily execute it against their local instance without their env vars. I will assume the join works based on standard PostgREST conventions.
