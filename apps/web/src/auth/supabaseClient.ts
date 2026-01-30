import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const isTest = import.meta.env.MODE === 'test';

const fallbackUrl = 'https://example.supabase.co';
const fallbackKey = 'test-anon-key';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase env vars: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  supabaseUrl ?? (isTest ? fallbackUrl : ''),
  supabaseAnonKey ?? (isTest ? fallbackKey : '')
);
