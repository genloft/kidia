import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URLs are missing from environment variables');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
