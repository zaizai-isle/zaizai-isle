const DEFAULT_GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

export const BANANA_AI_PROVIDER =
  process.env.NEXT_PUBLIC_BANANA_AI_PROVIDER || 'gemini';
export const BANANA_AI_API_KEY =
  process.env.NEXT_PUBLIC_BANANA_AI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  '';
export const BANANA_AI_BASE_URL =
  process.env.NEXT_PUBLIC_BANANA_AI_BASE_URL ||
  process.env.NEXT_PUBLIC_GEMINI_BASE_URL ||
  DEFAULT_GEMINI_BASE_URL;

export const BANANA_IMAGE_MODEL =
  process.env.NEXT_PUBLIC_BANANA_IMAGE_MODEL ||
  process.env.NEXT_PUBLIC_GEMINI_IMAGE_MODEL ||
  'gemini-2.5-flash-image-preview';
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
  return `${baseUrl}/models/${model}:${action}?key=${BANANA_AI_API_KEY}`;
}

export function buildProxyUrl(task: string): string {
  const baseUrl = BANANA_AI_BASE_URL.replace(/\/$/, '');
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
    return new Error(err?.error?.message || err?.message || fallback);
  } catch {
    return new Error(fallback);
  }
}
