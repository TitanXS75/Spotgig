import { createClient } from '@supabase/supabase-js';
import type { Database } from './db-types';

// TODO: Replace with your actual Supabase project URL and anon key
// You can find these in your Supabase Dashboard → Project Settings → API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'YOUR_ANON_KEY';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
