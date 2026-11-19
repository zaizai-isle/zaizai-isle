// Banana AI 前端配置：只允许走 Supabase Edge Function 代理。
// 供应商凭证（Cloudflare / Replicate / Gemini）一律只存在于服务端 secrets；
// 本文件被静态导出打进浏览器包，因此这里禁止引用任何 NEXT_PUBLIC_* 供应商密钥。

const DEFAULT_PROXY_IMAGE_MODEL = '@cf/black-forest-labs/flux-2-klein-4b';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const EXPLICIT_BASE_URL = process.env.NEXT_PUBLIC_BANANA_AI_BASE_URL;

function deriveSupabaseFunctionBaseUrl(): string {
  if (!SUPABASE_URL || SUPABASE_URL.includes('your_supabase_url')) return '';

  try {
    const url = new URL(SUPABASE_URL);
    return `${url.origin}/functions/v1/banana-ai`;
  } catch {
    return '';
  }
}

const SUPABASE_FUNCTION_BASE_URL = deriveSupabaseFunctionBaseUrl();

// 兼容旧导出名：provider 恒为 proxy；'gemini' 直连模式已因凭证泄露移除。
export const BANANA_AI_PROVIDER = 'proxy';
export const BANANA_AI_API_KEY =
  process.env.NEXT_PUBLIC_BANANA_AI_API_KEY || SUPABASE_ANON_KEY || '';
export const BANANA_AI_BASE_URL =
  EXPLICIT_BASE_URL || SUPABASE_FUNCTION_BASE_URL;

// 仅作展示用的模型标签；真实供应商模型由代理的私有 secrets 决定。
export const BANANA_IMAGE_MODEL =
  process.env.NEXT_PUBLIC_BANANA_IMAGE_MODEL || DEFAULT_PROXY_IMAGE_MODEL;
export const BANANA_VISION_MODEL =
  process.env.NEXT_PUBLIC_BANANA_VISION_MODEL || '@cf/moondream/moondream3.1-9B-A2B';
export const BANANA_CHAT_MODEL =
  process.env.NEXT_PUBLIC_BANANA_CHAT_MODEL || 'banana-ai-analysis';

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
