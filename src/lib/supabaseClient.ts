import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const RETRYABLE_METHODS = new Set(['GET', 'HEAD']);
const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);
const MAX_RETRIES = 2;

declare global {
  var _supabase: SupabaseClient | undefined;
}

function hasSupabaseConfig() {
  return (
    Boolean(SUPABASE_URL) &&
    Boolean(SUPABASE_ANON_KEY) &&
    !SUPABASE_URL?.includes('your_supabase_url') &&
    !SUPABASE_ANON_KEY?.includes('your_supabase_anon_key')
  );
}

function getRequestMethod(input: RequestInfo | URL, init?: RequestInit) {
  if (init?.method) return init.method.toUpperCase();
  if (typeof Request !== 'undefined' && input instanceof Request) {
    return input.method.toUpperCase();
  }
  return 'GET';
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryingFetch(input: RequestInfo | URL, init?: RequestInit) {
  const method = getRequestMethod(input, init);
  const canRetry = RETRYABLE_METHODS.has(method);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(input, init);

      if (!canRetry || !RETRYABLE_STATUSES.has(response.status) || attempt === MAX_RETRIES) {
        return response;
      }
    } catch (error) {
      if (!canRetry || attempt === MAX_RETRIES) {
        throw error;
      }
    }

    await wait(250 * 2 ** attempt);
  }

  return fetch(input, init);
}

function createSupabaseClient() {
  return createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      fetch: retryingFetch,
    },
  });
}

export function getOptionalSupabase() {
  if (!hasSupabaseConfig()) return null;

  globalThis._supabase ??= createSupabaseClient();
  return globalThis._supabase;
}

export function getSupabase() {
  const supabase = getOptionalSupabase();

  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.'
    );
  }

  return supabase;
}
