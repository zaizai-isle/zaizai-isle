const REPLICATE_API_BASE_URL = 'https://api.replicate.com/v1';
const DEFAULT_REPLICATE_IMAGE_MODEL = 'black-forest-labs/flux-kontext-dev';
const CLOUDFLARE_API_BASE_URL = 'https://api.cloudflare.com/client/v4/accounts';
const DEFAULT_CLOUDFLARE_IMAGE_MODEL = '@cf/black-forest-labs/flux-2-klein-4b';
const DEFAULT_CLOUDFLARE_VISION_MODEL = '@cf/moondream/moondream3.1-9B-A2B';
const TERMINAL_STATUSES = new Set(['succeeded', 'failed', 'canceled']);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type BananaRequest = {
  model?: string;
  prompt?: string;
  image_base64?: string;
  imageBase64?: string;
  mime_type?: string;
  mimeType?: string;
  question?: string;
  image_description?: string;
  imageDescription?: string;
  image_width?: number;
  imageWidth?: number;
  image_height?: number;
  imageHeight?: number;
};

type Prediction = {
  status?: string;
  output?: unknown;
  error?: unknown;
  urls?: {
    get?: string;
  };
};

type ImageProvider = 'cloudflare' | 'replicate';

type CloudflareResponse<T> = {
  result?: T;
  success?: boolean;
  errors?: Array<{
    message?: string;
  }>;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function getTask(request: Request) {
  const parts = new URL(request.url).pathname.split('/').filter(Boolean);
  return parts.at(-1) || '';
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function bufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}

function getImageDataUrl(body: BananaRequest) {
  const imageBase64 = body.image_base64 || body.imageBase64;
  const mimeType = body.mime_type || body.mimeType || 'image/png';

  if (!imageBase64) {
    throw new Error('Missing image_base64');
  }

  return `data:${mimeType};base64,${imageBase64}`;
}

function getCloudflareConfig() {
  const accountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
  const apiToken = Deno.env.get('CLOUDFLARE_API_TOKEN');

  if (!accountId || !apiToken) {
    throw new Error('Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN in Supabase function secrets');
  }

  return { accountId, apiToken };
}

function base64ToBlob(base64: string, mimeType: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
}

function getCloudflareError<T>(response: CloudflareResponse<T>, status: number) {
  return response.errors?.map((error) => error.message).filter(Boolean).join('; ') || String(status);
}

function getImageProvider(): ImageProvider {
  const configuredProvider = Deno.env.get('BANANA_IMAGE_PROVIDER')?.toLowerCase();

  if (configuredProvider === 'cloudflare' || configuredProvider === 'replicate') {
    return configuredProvider;
  }

  return Deno.env.get('CLOUDFLARE_ACCOUNT_ID') && Deno.env.get('CLOUDFLARE_API_TOKEN')
    ? 'cloudflare'
    : 'replicate';
}

async function runCloudflareImageEdit(body: BananaRequest) {
  const { accountId, apiToken } = getCloudflareConfig();
  const model = Deno.env.get('CLOUDFLARE_IMAGE_MODEL') || DEFAULT_CLOUDFLARE_IMAGE_MODEL;
  const prompt = body.prompt || 'Transform the image into a surreal banana-themed version.';
  const imageBase64 = body.image_base64 || body.imageBase64;
  const mimeType = body.mime_type || body.mimeType || 'image/webp';
  if (!imageBase64) throw new Error('Missing image_base64');

  const form = new FormData();
  form.append('prompt', prompt);
  form.append('input_image_0', base64ToBlob(imageBase64, mimeType), 'banana-input.webp');
  form.append('width', String(body.image_width || body.imageWidth || 1024));
  form.append('height', String(body.image_height || body.imageHeight || 1024));

  const response = await fetch(`${CLOUDFLARE_API_BASE_URL}/${accountId}/ai/run/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
    body: form,
  });

  const result = await response.json() as CloudflareResponse<{ image?: string }>;
  if (!response.ok || result.success === false) {
    throw new Error(`Cloudflare image edit failed: ${getCloudflareError(result, response.status)}`);
  }

  const generatedImage = result.result?.image;
  if (!generatedImage) {
    throw new Error('Cloudflare did not return image data');
  }

  return {
    image_base64: generatedImage,
    mime_type: 'image/png',
  };
}

async function runCloudflareVision(body: BananaRequest) {
  const { accountId, apiToken } = getCloudflareConfig();
  const model = Deno.env.get('CLOUDFLARE_VISION_MODEL') || DEFAULT_CLOUDFLARE_VISION_MODEL;
  const question = body.question || '请详细描述这张图片的内容，包括主要物体、场景、颜色等信息。';

  const response = await fetch(`${CLOUDFLARE_API_BASE_URL}/${accountId}/ai/run/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      task: 'query',
      image: getImageDataUrl(body),
      question,
      reasoning: false,
      max_tokens: 512,
      stream: false,
    }),
  });

  const result = await response.json() as CloudflareResponse<unknown>;
  if (!response.ok || result.success === false) {
    throw new Error(`Cloudflare vision failed: ${getCloudflareError(result, response.status)}`);
  }

  const extractAnswer = (value: unknown, depth = 0): string | undefined => {
    if (typeof value === 'string') return value;
    if (!value || typeof value !== 'object' || depth > 2) return undefined;

    const record = value as Record<string, unknown>;
    for (const key of ['answer', 'response', 'caption', 'description', 'result']) {
      const answer = extractAnswer(record[key], depth + 1);
      if (answer) return answer;
    }
    return undefined;
  };

  const answer = extractAnswer(result.result);
  if (!answer) {
    const resultKeys = result.result && typeof result.result === 'object'
      ? Object.keys(result.result).join(',')
      : typeof result.result;
    throw new Error(`Cloudflare vision did not return an answer (result keys: ${resultKeys})`);
  }
  return { text: answer };
}

function getOutputUrl(output: unknown): string {
  if (typeof output === 'string') return output;

  if (Array.isArray(output)) {
    const first = output[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object' && 'url' in first) {
      return String(first.url);
    }
  }

  if (output && typeof output === 'object' && 'url' in output) {
    return String(output.url);
  }

  throw new Error('Replicate did not return an output image URL');
}

async function pollPrediction(prediction: Prediction, token: string): Promise<Prediction> {
  let current = prediction;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    if (current.status && TERMINAL_STATUSES.has(current.status)) {
      return current;
    }

    const getUrl = current.urls?.get;
    if (!getUrl) break;

    await wait(2500);
    const response = await fetch(getUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Replicate polling failed with status ${response.status}`);
    }

    current = await response.json();
  }

  return current;
}

async function runReplicateImageEdit(body: BananaRequest) {
  const token = Deno.env.get('REPLICATE_API_TOKEN');
  if (!token) {
    throw new Error('Missing REPLICATE_API_TOKEN in Supabase function secrets');
  }

  const model = Deno.env.get('REPLICATE_IMAGE_MODEL') || DEFAULT_REPLICATE_IMAGE_MODEL;
  const prompt = body.prompt || 'Transform the image into a surreal banana-themed version.';
  const inputImage = getImageDataUrl(body);

  const response = await fetch(`${REPLICATE_API_BASE_URL}/models/${model}/predictions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'wait=60',
    },
    body: JSON.stringify({
      input: {
        prompt,
        input_image: inputImage,
        aspect_ratio: 'match_input_image',
        output_format: 'png',
        output_quality: 90,
        num_inference_steps: 30,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Replicate request failed: ${error}`);
  }

  const prediction = await pollPrediction(await response.json(), token);

  if (prediction.status !== 'succeeded') {
    throw new Error(`Replicate prediction ${prediction.status || 'timed out'}: ${prediction.error || ''}`);
  }

  const imageUrl = getOutputUrl(prediction.output);
  const imageResponse = await fetch(imageUrl);

  if (!imageResponse.ok) {
    throw new Error(`Failed to download Replicate output: ${imageResponse.status}`);
  }

  return {
    image_base64: bufferToBase64(await imageResponse.arrayBuffer()),
    mime_type: imageResponse.headers.get('Content-Type') || 'image/png',
    image_url: imageUrl,
  };
}

async function runImageEdit(body: BananaRequest) {
  if (getImageProvider() === 'cloudflare') {
    return runCloudflareImageEdit(body);
  }

  return runReplicateImageEdit(body);
}

function createFallbackDescription(body: BananaRequest) {
  const question = body.question ? `问题：${body.question}` : '';

  return {
    text: [
      '这是一张用户上传并准备进行香蕉化处理的原始图片。',
      '当前代理主要负责图像编辑，未启用额外视觉理解模型。',
      question,
    ]
      .filter(Boolean)
      .join('\n'),
  };
}

function createBananaAnalysis(body: BananaRequest) {
  const description = body.image_description || body.imageDescription || '用户上传的原始图片';

  return {
    text: `根据香蕉学初步检测，${description} 的可剥性指数已达到 87.4%，碳水化合物弯曲率呈现稳定上扬趋势。图像中的主体结构具备良好的蕉化适配度，经过果皮纹理覆盖后，整体视觉会进入“高熟度超现实”状态。建议继续观察其香蕉熵扩散范围，避免局部场景因过度香甜而发生审美滑移。`,
  };
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const task = getTask(request);
    const body = await request.json() as BananaRequest;

    if (task === 'bananaify') {
      return jsonResponse(await runImageEdit(body));
    }

    if (task === 'understand') {
      if (getImageProvider() === 'cloudflare') {
        return jsonResponse(await runCloudflareVision(body));
      }
      return jsonResponse(createFallbackDescription(body));
    }

    if (task === 'analysis') {
      return jsonResponse(createBananaAnalysis(body));
    }

    return jsonResponse({ error: `Unknown banana-ai task: ${task}` }, 404);
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Unknown banana-ai error',
      },
      500
    );
  }
});
