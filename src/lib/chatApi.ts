// chatApi.ts
// 香蕉学分析报告 AI 调用

import {
  BANANA_AI_PROVIDER,
  BANANA_CHAT_MODEL,
  buildGeminiGenerateUrl,
  buildProxyUrl,
  getAuthHeaders,
  parseAiError,
} from './bananaAiConfig';

// ─────────────────────────────────────────────
// 功能三：生成香蕉学分析报告（流式输出）
// ─────────────────────────────────────────────
export async function generateBananaAnalysis(
  imageDescription: string,
  onUpdate?: (content: string) => void
): Promise<string> {
  if (BANANA_AI_PROVIDER === 'proxy') {
    return generateBananaAnalysisWithProxy(imageDescription, onUpdate);
  }

  if (BANANA_AI_PROVIDER === 'gemini') {
    return generateBananaAnalysisWithGemini(imageDescription, onUpdate);
  }

  throw new Error('暂不支持该 AI provider，请使用 gemini 或 proxy');
}

async function generateBananaAnalysisWithGemini(
  imageDescription: string,
  onUpdate?: (content: string) => void
): Promise<string> {
  const systemPrompt =
    '你是一位幽默风趣的「香蕉学」专家。你需要用伪科学的口吻，对图片进行荒诞但听起来很专业的分析。分析要包含一些虚构的科学术语，比如「碳水化合物弯曲率」、「可剥性指数」、「香蕉化适配度」等。语气要严肃认真，但内容要荒诞有趣。';

  const userPrompt = `请对以下图片内容进行「香蕉学」分析：${imageDescription}

要求：
1. 使用伪科学术语
2. 分析要听起来专业但内容荒诞
3. 包含一些虚构的数据和指标
4. 保持幽默风趣的语气
5. 字数控制在150字左右`;

  const response = await fetch(
    `${buildGeminiGenerateUrl(BANANA_CHAT_MODEL, 'streamGenerateContent')}&alt=sse`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw await parseAiError(response, '香蕉学分析生成失败');
  }

  // 读取 SSE 流
  const reader = response.body!.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? ''; // 最后一行可能不完整，留到下次

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') continue;

      try {
        const parsed = JSON.parse(jsonStr);
        const chunk =
          parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        if (chunk) {
          fullText += chunk;
          onUpdate?.(fullText); // 实时回调，供进度展示
        }
      } catch {
        // 忽略解析失败的行
      }
    }
  }

  return fullText;
}

async function generateBananaAnalysisWithProxy(
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
