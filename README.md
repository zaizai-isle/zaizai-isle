# 🏝️ Welcome to Zaizai Isle

<p align="center">
  <img src="public/Zaizai-Isle_Shoebill.webp" width="100%" alt="Zaizai Isle - AI Product Designer" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Role-AI%20Product%20Designer-blueviolet?style=flat-square" />
  <img src="https://img.shields.io/badge/Status-Building%20&%20Thinking-success?style=flat-square" />
  <img src="https://img.shields.io/badge/Vibe-Minimalist%20&%20Zen-lightgrey?style=flat-square" />
</p>

[✨ Visit the Isle / 访问小岛](https://zaizai-isle.github.io/zaizai-isle/)

[📚 Documentation / 文档库](https://zaizai-isle.github.io/zaizai-isle/docs/) · [Document Map / 文档地图](https://zaizai-isle.github.io/zaizai-isle/docs/PRD_REGISTRY/)

## About · 关于

**Zaizai Isle，一个可长期维护、可继续生长、可承载个人变化的数字小岛。**

这里先承接当下的作品, 关注与新记录。过去散落在其他平台的文章、图片和日常，以后慢慢整理，不设期限。

小岛是这个空间的气质，鲸头鹳是它的陪伴。内容随时间自然积累，不要求每次更新承担额外的运营压力。

网站以 Vibe Coding 的方式逐步建设，功能随实际使用和需要自然生长。

再做一点，再想一点，惊喜总会在不经意间发生。

---

<details>
<summary><strong>English Version</strong></summary>

<br />

**Zaizai Isle, a digital isle that grows, survives, and reflects personal evolution.**

It starts with current projects, interests, and new notes. Older writings and everyday records from other platforms will find their way here gradually.

The isle provides the atmosphere, accompanied by the shoebill. Content grows naturally over time without operational pressure.

Built incrementally through Vibe Coding, the site develops around actual use and needs.

Build more, think more, find the spark.

**Build more, think more, find the spark.**

</details>

---

> ⚠️ **Copyright Notice / 版权声明**
>
> 本项目仅用于个人展示。
>
> This project is for personal showcase only. All code and design rights are reserved.

## Local Environment

This project uses a project-local Conda environment:

```bash
conda activate "$PWD/.conda-env"
npm run dev -- --webpack
```

The environment includes Python `3.13.13`, Node.js `25.8.2`, and npm `11.11.1`.

## Visual Regression

- Update baseline: `npm run vr:core-build:update`
- Verify screenshots: `npm run vr:core-build`

Default URL is `http://127.0.0.1:3000/zaizai-isle/`.  
Override with `VR_BASE_URL`, for example:  
`VR_BASE_URL=http://127.0.0.1:3000/zaizai-isle/ npm run vr:core-build`

## Asset Generation

- Weather icons: `env PATH="$PWD/.conda-env/bin:$PATH" ./node_modules/.bin/tsx scripts/process-icons.ts`
- Runtime images should prefer WebP when the optimized file is smaller and visually equivalent.
- Release checklist: `docs/prd/ReleaseChecklist.md`

## Weather Proxy (Optional)

This project currently uses static export (`output: export`), so built-in Next.js `API Route` is not available in production export mode.

If you have your own proxy endpoint, set:

`NEXT_PUBLIC_WEATHER_PROXY_URL=https://your-domain.com/weather`

The frontend will call this URL with query params:

- `provider=open-meteo|qweather`
- `lang=zh|en`

The endpoint should return normalized `WeatherData` JSON.

## Banana AI API (Optional)

The banana image flow now defaults to a Supabase Edge Function proxy when Supabase is configured. The recommended setup uses Replicate's `black-forest-labs/flux-kontext-dev` image editing model behind that proxy.

```bash
NEXT_PUBLIC_BANANA_AI_PROVIDER=proxy
NEXT_PUBLIC_BANANA_AI_BASE_URL=https://your-project-ref.functions.supabase.co/banana-ai
NEXT_PUBLIC_BANANA_AI_API_KEY=your_supabase_anon_key
NEXT_PUBLIC_BANANA_IMAGE_MODEL=black-forest-labs/flux-kontext-dev
```

- `NEXT_PUBLIC_BANANA_AI_PROVIDER`: `proxy` for the Supabase function, or `gemini` for Gemini-compatible APIs.
- `NEXT_PUBLIC_BANANA_AI_BASE_URL`: optional when `NEXT_PUBLIC_SUPABASE_URL` is set; the frontend can derive the function URL.
- `NEXT_PUBLIC_BANANA_AI_API_KEY`: optional when `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set; used only to invoke the Supabase function.
- `NEXT_PUBLIC_BANANA_IMAGE_MODEL`: image generation model for bananafication.

Deploy the function and set the private Replicate token:

```bash
supabase functions deploy banana-ai
supabase secrets set REPLICATE_API_TOKEN=your_replicate_token
```

Optional function secret:

```bash
supabase secrets set REPLICATE_IMAGE_MODEL=black-forest-labs/flux-kontext-dev
```

The proxy accepts normalized frontend calls:

- `POST {NEXT_PUBLIC_BANANA_AI_BASE_URL}/bananaify`, expects `{ "image_base64": "..." }`.
- `POST {NEXT_PUBLIC_BANANA_AI_BASE_URL}/understand`, expects `{ "text": "..." }`.
- `POST {NEXT_PUBLIC_BANANA_AI_BASE_URL}/analysis`, expects `{ "text": "..." }`.
