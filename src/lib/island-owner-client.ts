import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** The server-side account is shared; this browser session identifier belongs only to Daily Learning. */
export const DAILY_LEARNING_SESSION_KEY = "daily-learning-owner-session";

let ownerClient: SupabaseClient | undefined;

export function isIslandOwnerCloudConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getIslandOwnerClient() {
  if (ownerClient) return ownerClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("岛主云端服务尚未配置。");

  ownerClient = createClient(url, key, {
    auth: {
      storageKey: DAILY_LEARNING_SESSION_KEY,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
  return ownerClient;
}
