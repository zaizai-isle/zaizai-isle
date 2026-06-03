import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const NEW_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const NEW_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 单例，避免 App Router 里多次初始化
declare global {
    var _supabase: SupabaseClient | undefined;
}

export const supabase =
    globalThis._supabase ??
    (globalThis._supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_ANON_KEY));