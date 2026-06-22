import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

const supabaseUrl = env?.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321';
const supabaseAnonKey = env?.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'dummy_anon_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
