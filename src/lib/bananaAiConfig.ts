const DEFAULT_GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_REPLICATE_IMAGE_MODEL = 'black-forest-labs/flux-kontext-dev';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const EXPLICIT_PROVIDER = process.env.NEXT_PUBLIC_BANANA_AI_PROVIDER;
const EXPLICIT_BASE_URL = process.env.NEXT_PUBLIC_BANANA_AI_BASE_URL;

function deriveSupabaseFunctionBaseUrl(): string {
  if (!SUPABASE_URL || SUPABASE_URL.includes('your_supabase_url')) return '';

  try {
    const url = new URL(SUPABASE_URL);
    const projectRef = url.hostname.split('.')[0];
    if (!projectRef) return '';
    return `${url.protocol}//${projectRef}.functions.supabase.co/banana-ai`;
  } catch {
    return '';
  }
}

const SUPABASE_FUNCTION_BASE_URL = deriveSupabaseFunctionBaseUrl();

export const BANANA_AI_PROVIDER =
  EXPLICIT_PROVIDER || (EXPLICIT_BASE_URL || SUPABASE_FUNCTION_BASE_URL ? 'proxy' : 'gemini');
export const BANANA_AI_API_KEY =
  process.env.NEXT_PUBLIC_BANANA_AI_API_KEY ||
  (BANANA_AI_PROVIDER === 'proxy' ? SUPABASE_ANON_KEY : process.env.NEXT_PUBLIC_GEMINI_API_KEY) ||
  '';
export const BANANA_AI_BASE_URL =
  EXPLICIT_BASE_URL ||
  (BANANA_AI_PROVIDER === 'proxy'
    ? SUPABASE_FUNCTION_BASE_URL
    : process.env.NEXT_PUBLIC_GEMINI_BASE_URL || DEFAULT_GEMINI_BASE_URL);

export const BANANA_IMAGE_MODEL =
  process.env.NEXT_PUBLIC_BANANA_IMAGE_MODEL ||
  (BANANA_AI_PROVIDER === 'proxy'
    ? DEFAULT_REPLICATE_IMAGE_MODEL
    : process.env.NEXT_PUBLIC_GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image-preview');
export const BANANA_VISION_MODEL =
  process.env.NEXT_PUBLIC_BANANA_VISION_MODEL ||
  process.env.NEXT_PUBLIC_GEMINI_VISION_MODEL ||
  'gemini-2.5-flash';
export const BANANA_CHAT_MODEL =
  process.env.NEXT_PUBLIC_BANANA_CHAT_MODEL ||
  process.env.NEXT_PUBLIC_GEMINI_CHAT_MODEL ||
  'gemini-2.0-flash';

export function buildGeminiGenerateUrl(model: string, action = 'generateContent'): string {
  const baseUrl = BANANA_AI_BASE_URL.replace(/\/$/, '');
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_BANANA_AI_API_KEY || '';
  return `${baseUrl}/models/${model}:${action}?key=${apiKey}`;
}

export function buildProxyUrl(task: string): string {
  const baseUrl = BANANA_AI_BASE_URL.replace(/\/$/, '');
  if (!baseUrl) {
    throw new Error('Banana AI proxy base URL is not configured.');
  }
  return `${baseUrl}/${task}`;
}

export function getAuthHeaders(): Record<string, string> {
  if (!BANANA_AI_API_KEY) return {};
  return { Authorization: `Bearer ${BANANA_AI_API_KEY}` };
}

export async function parseAiError(
  response: Response,
  fallback: string
): Promise<Error> {
  try {
    const err = await response.json();
    const message =
      err?.error?.message ||
      (typeof err?.error === 'string' ? err.error : undefined) ||
      err?.message ||
      fallback;
    return new Error(message);
  } catch {
    return new Error(fallback);
  }
}
