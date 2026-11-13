// bananaApi.ts
// 香蕉图相关 AI 调用

import {
  BANANA_AI_PROVIDER,
  BANANA_IMAGE_MODEL,
  BANANA_VISION_MODEL,
  buildGeminiGenerateUrl,
  buildProxyUrl,
  getAuthHeaders,
  parseAiError,
} from './bananaAiConfig';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}

type AiImageInput = {
  base64: string;
  mimeType: string;
  outputWidth: number;
  outputHeight: number;
};

const AI_INPUT_MAX_DIMENSION = 512;
const AI_OUTPUT_MAX_DIMENSION = 1024;
const AI_OUTPUT_MIN_DIMENSION = 256;

function roundToMultipleOf16(value: number): number {
  return Math.round(value / 16) * 16;
}

// Cloudflare FLUX 的参考图限制为 512x512；只生成 AI 专用副本，不降低图库原图质量。
export async function prepareImageForAi(file: File): Promise<AiImageInput> {
  const bitmap = await createImageBitmap(file);

  try {
    const inputScale = Math.min(1, AI_INPUT_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const inputWidth = Math.max(1, Math.round(bitmap.width * inputScale));
    const inputHeight = Math.max(1, Math.round(bitmap.height * inputScale));
    const canvas = document.createElement('canvas');
    canvas.width = inputWidth;
    canvas.height = inputHeight;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('无法创建图片处理上下文');
    context.drawImage(bitmap, 0, 0, inputWidth, inputHeight);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => result ? resolve(result) : reject(new Error('图片转换失败')),
        'image/webp',
        0.85
      );
    });
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error || new Error('图片读取失败'));
      reader.readAsDataURL(blob);
    });

    const outputScale = AI_OUTPUT_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height);
    const outputWidth = Math.max(
      AI_OUTPUT_MIN_DIMENSION,
      roundToMultipleOf16(bitmap.width * outputScale)
    );
    const outputHeight = Math.max(
      AI_OUTPUT_MIN_DIMENSION,
      roundToMultipleOf16(bitmap.height * outputScale)
    );

    return {
      base64: dataUrl.split(',')[1],
      mimeType: 'image/webp',
      outputWidth,
      outputHeight,
    };
  } finally {
    bitmap.close();
  }
}

const BANANAIFY_PROMPT = `核心指令：基于输入图像的构图和光影，进行全面的、像素级的语义内容替换。将输入图像中所有识别出的对象，替换为香蕉形态的物体。

转换规则：
1. 物体替换：
   - 人物：将所有人物替换为全身由香蕉、香蕉皮、或剥开的香蕉果肉构建的拟人化角色。保留人物的原始姿势和表情（以香蕉的方式表达）。
   - 动物/生物：将所有动物、植物替换为相应的香蕉版本（例如：香蕉猫、香蕉树、香蕉云朵）。
   - 建筑/交通工具：将所有由钢铁、混凝土、玻璃构成的物体（房屋、汽车、桥梁）替换为巨大、紧密堆积的香蕉或香蕉皮结构。
   - 液体/背景：水流或液体替换为流动且黏稠的香蕉泥浆。

2. 纹理与质感：
   - 所有替换后的物体必须具备超现实主义的香蕉皮纹理。
   - 光影保持：严格保持输入图像的原始光源方向、强度和环境反射。
   - 成熟度随机：在同一张图像中，随机使用不同成熟度的香蕉纹理（新鲜的黄皮、带黑斑的熟皮、略带绿色的未熟皮），增加荒谬感和视觉丰富性。`;

async function bananaifyWithGemini(
  imageBase64: string,
  mimeType: string
): Promise<string> {
  const response = await fetch(
    buildGeminiGenerateUrl(BANANA_IMAGE_MODEL),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: imageBase64,
                },
              },
              { text: BANANAIFY_PROMPT },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ['IMAGE'],
        },
      }),
    }
  );

  if (!response.ok) {
    throw await parseAiError(response, '香蕉化处理失败');
  }

  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];

  // 优先找图片数据
  for (const part of parts) {
    if (part.inlineData?.data) {
      return part.inlineData.data;
    }
    // 兼容两种字段名
    if (part.inline_data?.data) {
      return part.inline_data.data;
    }
  }
  throw new Error('AI 未返回图片，请稍后重试');
}

async function bananaifyWithProxy(
  imageBase64: string,
  mimeType: string,
  outputWidth?: number,
  outputHeight?: number
): Promise<string> {
  const response = await fetch(buildProxyUrl('bananaify'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      prompt: BANANAIFY_PROMPT,
      image_base64: imageBase64,
      mime_type: mimeType,
      image_width: outputWidth,
      image_height: outputHeight,
    }),
  });

  if (!response.ok) {
    throw await parseAiError(response, '香蕉化处理失败');
  }

  const data = await response.json();
  const imageBase64Result = data?.image_base64 || data?.imageBase64;
  if (!imageBase64Result) {
    throw new Error('AI 代理未返回 image_base64');
  }

  return imageBase64Result;
}

async function imageUrlToBase64(imageUrl: string): Promise<{
  base64: string;
  mimeType: string;
}> {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const base64 = arrayBufferToBase64(arrayBuffer);
  const mimeType = blob.type || 'image/jpeg';

  return { base64, mimeType };
}

async function understandImageWithGemini(
  imageUrl: string,
  question: string
): Promise<string> {
  const { base64, mimeType } = await imageUrlToBase64(imageUrl);

  const response = await fetch(
    buildGeminiGenerateUrl(BANANA_VISION_MODEL),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: { mime_type: mimeType, data: base64 },
              },
              {
                text: question,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw await parseAiError(response, '图片理解失败');
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('图片理解结果为空');
  return text;
}

async function understandImageWithProxy(
  imageUrl: string,
  question: string
): Promise<string> {
  const { base64, mimeType } = await imageUrlToBase64(imageUrl);
  const response = await fetch(buildProxyUrl('understand'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      model: BANANA_VISION_MODEL,
      question,
      image_base64: base64,
      mime_type: mimeType,
    }),
  });

  if (!response.ok) {
    throw await parseAiError(response, '图片理解失败');
  }

  const data = await response.json();
  const text = data?.text || data?.description;
  if (!text) throw new Error('AI 代理未返回 text');
  return text;
}

// ─────────────────────────────────────────────
// 功能一：香蕉化图片（图生图）
// ─────────────────────────────────────────────
export async function bananaifyImage(
  imageBase64: string,
  mimeType: string,
  outputWidth?: number,
  outputHeight?: number
): Promise<string> {
  if (BANANA_AI_PROVIDER === 'proxy') {
    return bananaifyWithProxy(imageBase64, mimeType, outputWidth, outputHeight);
  }

  if (BANANA_AI_PROVIDER === 'gemini') {
    return bananaifyWithGemini(imageBase64, mimeType);
  }

  throw new Error('暂不支持该 AI provider，请使用 gemini 或 proxy');
}

// ─────────────────────────────────────────────
// 功能二：理解图片内容（图转文字描述）
// ─────────────────────────────────────────────
export async function understandImage(
  imageUrl: string,
  question = '请详细描述这张图片的内容，包括主要物体、场景、颜色等信息。'
): Promise<string> {
  if (BANANA_AI_PROVIDER === 'proxy') {
    return understandImageWithProxy(imageUrl, question);
  }

  if (BANANA_AI_PROVIDER === 'gemini') {
    return understandImageWithGemini(imageUrl, question);
  }

  throw new Error('暂不支持该 AI provider，请使用 gemini 或 proxy');
}

// ─────────────────────────────────────────────
// 保留原来的函数签名兼容性
// 原来图片理解是异步轮询，现在直接返回结果
// ─────────────────────────────────────────────
export async function submitImageUnderstanding(
  imageUrl: string,
  question: string
): Promise<string> {
  // 直接复用 understandImage，返回描述文本作为"taskId"占位
  const description = await understandImage(imageUrl, question);
  return description; // 直接当结果返回，跳过轮询
}

export async function pollImageUnderstanding(
  taskIdOrDescription: string
): Promise<string> {
  // 原来需要轮询，现在 submitImageUnderstanding 已直接返回结果
  // 这里直接透传即可，保持 HomePage.tsx 调用链不变
  return taskIdOrDescription;
}
