// bananaApi.ts
// 使用 Google Gemini API 替代原秒哒平台的图片处理能力

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

// 将图片文件转换为 Base64
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // 去掉 data:image/xxx;base64, 前缀
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

// ─────────────────────────────────────────────
// 功能一：香蕉化图片（图生图）
// 使用 gemini-3.1-flash-image-preview
// ─────────────────────────────────────────────
export async function bananaifyImage(
  imageBase64: string,
  mimeType: string
): Promise<string> {
  const prompt = `核心指令：基于输入图像的构图和光影，进行全面的、像素级的语义内容替换。将输入图像中所有识别出的对象，替换为香蕉形态的物体。

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

  const response = await fetch(
    `${GEMINI_BASE_URL}/models/gemini-3.1-flash-image-preview:generateContent?key=${GEMINI_API_KEY}`,
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
              { text: prompt },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || '香蕉化处理失败');
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


  throw new Error('Gemini 未返回图片，请稍后重试');
}

// ─────────────────────────────────────────────
// 功能二：理解图片内容（图转文字描述）
// 使用 gemini-3.1-flash-image-preview，直接同步返回，无需轮询
// ─────────────────────────────────────────────
export async function understandImage(imageUrl: string): Promise<string> {
  // 先把 URL 的图片下载为 base64
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  const mimeType = blob.type || 'image/jpeg';

  const response = await fetch(
    `${GEMINI_BASE_URL}/models/gemini-3.1-flash-image-preview:generateContent?key=${GEMINI_API_KEY}`,
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
                text: '请详细描述这张图片的内容，包括主要物体、场景、颜色等信息。',
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || '图片理解失败');
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('图片理解结果为空');
  return text;
}

// ─────────────────────────────────────────────
// 保留原来的函数签名兼容性
// 原来图片理解是异步轮询，现在直接返回结果
// ─────────────────────────────────────────────
export async function submitImageUnderstanding(
  imageUrl: string,
  _question: string
): Promise<string> {
  // 直接复用 understandImage，返回描述文本作为"taskId"占位
  const description = await understandImage(imageUrl);
  return description; // 直接当结果返回，跳过轮询
}

export async function pollImageUnderstanding(
  taskIdOrDescription: string
): Promise<string> {
  // 原来需要轮询，现在 submitImageUnderstanding 已直接返回结果
  // 这里直接透传即可，保持 HomePage.tsx 调用链不变
  return taskIdOrDescription;
}
