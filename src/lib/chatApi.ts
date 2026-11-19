// chatApi.ts
// 香蕉学分析报告 AI 调用（只走 Supabase 代理，不在前端接触供应商凭证）

import {
  BANANA_CHAT_MODEL,
  buildProxyUrl,
  getAuthHeaders,
  parseAiError,
} from './bananaAiConfig';

// ─────────────────────────────────────────────
// 功能三：生成香蕉学分析报告
// ─────────────────────────────────────────────
export async function generateBananaAnalysis(
  imageDescription: string,
  onUpdate?: (content: string) => void
): Promise<string> {
  const response = await fetch(buildProxyUrl('analysis'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      model: BANANA_CHAT_MODEL,
      image_description: imageDescription,
    }),
  });

  if (!response.ok) {
    throw await parseAiError(response, '香蕉学分析生成失败');
  }

  const data = await response.json();
  const text = data?.text || data?.analysis_report || data?.analysisReport;
  if (!text) throw new Error('AI 代理未返回 text');
  onUpdate?.(text);
  return text;
}
