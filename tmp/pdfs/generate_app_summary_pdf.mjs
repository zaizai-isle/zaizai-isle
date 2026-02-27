import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

const outDir = path.resolve('output/pdf');
fs.mkdirSync(outDir, { recursive: true });

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Zaizai Isle App Summary</title>
  <style>
    @page { size: A4; margin: 22mm 18mm; }
    html, body { background: #ffffff; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #0f172a;
      margin: 0;
      font-size: 12px;
      line-height: 1.45;
    }
    h1 { font-size: 22px; margin: 0 0 8px 0; }
    .meta { color: #475569; font-size: 11px; margin-bottom: 12px; }
    h2 {
      font-size: 14px;
      margin: 10px 0 5px;
      padding-bottom: 2px;
      border-bottom: 1px solid #cbd5e1;
    }
    p { margin: 5px 0; }
    ul { margin: 4px 0 0 16px; padding: 0; }
    li { margin: 3px 0; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .note { color: #6b7280; }
  </style>
</head>
<body>
  <h1>Zaizai Isle App Summary</h1>
  <div class="meta">Repo-based summary generated from source files in this repository.</div>

  <h2>What it is</h2>
  <p>Zaizai Isle is a lightweight personal website and experimental space for AI-assisted product design and delivery. It presents an interactive bento-style interface built with Next.js.</p>

  <h2>Who it is for</h2>
  <p>Primary persona: visitors evaluating the creator's AI product design work (for example peers, collaborators, and recruiters).</p>

  <h2>What it does</h2>
  <ul>
    <li>Renders a modular bento-grid homepage with multiple interactive cards.</li>
    <li>Supports bilingual UI content (Chinese/English) with persisted language selection.</li>
    <li>Shows live weather details for Shanghai, refreshed every 5 minutes with browser caching.</li>
    <li>Provides a guestbook with Supabase persistence and realtime insert updates when configured.</li>
    <li>Lets users customize background and text mode, persisted locally and optionally synced to Supabase in production.</li>
    <li>Includes an in-browser image compressor tool using client-side compression.</li>
    <li>Serves a docs area that renders Markdown files from the <span class="mono">docs/</span> directory with a generated TOC.</li>
  </ul>

  <h2>How it works (repo-evidenced architecture)</h2>
  <ul>
    <li><strong>Frontend:</strong> Next.js App Router app; home page is client-rendered and loads major cards via dynamic imports.</li>
    <li><strong>UI/state layer:</strong> <span class="mono">LanguageProvider</span> and <span class="mono">BackgroundProvider</span> manage language/background state and localStorage persistence.</li>
    <li><strong>Service layer:</strong> weather service fetches Open-Meteo (and has optional QWeather path), maps condition/icon codes, and caches results in localStorage.</li>
    <li><strong>Data layer:</strong> Supabase client initializes from env vars; guestbook reads/inserts/subscribes to <span class="mono">guestbook</span>; background settings upsert to <span class="mono">user_settings</span> in production.</li>
    <li><strong>Content flow:</strong> <span class="mono">/docs/[[...slug]]</span> reads Markdown from <span class="mono">docs/</span>, computes heading IDs, and renders with React Markdown.</li>
    <li><strong>Telemetry:</strong> Google Analytics is injected only in production when <span class="mono">NEXT_PUBLIC_GA_ID</span> is set.</li>
  </ul>

  <h2>How to run (minimal)</h2>
  <ol>
    <li>Copy <span class="mono">.env.local.example</span> to <span class="mono">.env.local</span> and fill required values (Supabase URL/key, GA ID).</li>
    <li>Install dependencies: <span class="mono">npm install</span>. <span class="note">Exact package manager lockfile: Not found in repo.</span></li>
    <li>Start dev server: <span class="mono">npm run dev</span>.</li>
    <li>Open <span class="mono">http://localhost:3000</span>.</li>
  </ol>
  <p class="note">Node.js version requirement: Not found in repo.</p>
</body>
</html>`;

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0' });

const outputPath = path.resolve(outDir, 'zaizai-isle-app-summary.pdf');
await page.pdf({
  path: outputPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '22mm', right: '18mm', bottom: '22mm', left: '18mm' }
});

await browser.close();
console.log(outputPath);
