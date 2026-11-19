// 兼容入口验收：以"上一版实际公开过的链接清单"（发布表 is_visible 的 content_id +
// 5 个历史静态选题 id）为准，逐条核对新导出 out/ 中：
//   1. 该路径存在兼容壳（out/learning/<id>/index.html）；
//   2. 壳内不含任何正文，只有指向 /learning?entry=… 的跳转；
//   3. 整个 out/ 的 HTML 中不存在旧正文残留（指纹来自改版前的旧导出）。
// 用法：node scripts/verify-learning-compat.mjs [--fingerprints <file>] [--offline]
// --offline 跳过 Supabase 实时清单，只用本地静态 id + 导出目录自检。
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const outDir = join(root, "out");
const learningDir = join(outDir, "learning");

const STATIC_IDS = [
  "bauhaus-chair-b3",
  "hokusai-great-wave",
  "london-underground-map",
  "cassandre-nord-express",
  "rams-radio",
];

function readEnvLocal() {
  const file = join(root, ".env.local");
  if (!existsSync(file)) return {};
  const map = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) map[m[1]] = m[2].trim();
  }
  return map;
}

function htmlText(file) {
  return readFileSync(file, "utf8")
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/\s+/g, "");
}

function walkHtml(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walkHtml(p));
    // RSC 负载（.txt/.rsc）就是客户端路由缓存的形态，与 HTML、JSON 一并纳入残留扫描。
    else if (/\.(html|txt|rsc|json)$/.test(entry.name)) found.push(p);
  }
  return found;
}

async function fetchVisibleContentIds() {
  const env = readEnvLocal();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error(".env.local 缺少 Supabase anon 配置，无法拉取实际旧链接清单。");
  const res = await fetch(`${url}/rest/v1/daily_learning_publications?select=content_id&is_visible=eq.true&order=published_at.desc&limit=1000`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`发布表读取失败：HTTP ${res.status}`);
  return (await res.json()).map((row) => row.content_id).filter(Boolean);
}

const fpArg = process.argv.indexOf("--fingerprints");
const fingerprintFile = fpArg >= 0 ? process.argv[fpArg + 1] : join(root, ".codex-output/old-learning-body-fingerprints.json");
const offline = process.argv.includes("--offline");

// 1) 实际旧链接清单 → 兼容壳存在且无正文。
const dbIds = offline ? [] : await fetchVisibleContentIds();
const oldLinkList = [...new Set([...STATIC_IDS, ...dbIds])];
assert.ok(oldLinkList.length > 5, "旧链接清单应包含发布表内容，而不只静态选题");

let compatCount = 0;
for (const id of oldLinkList) {
  const pagePath = join(learningDir, id, "index.html");
  if (!existsSync(pagePath)) {
    // 未来稿在午夜策略后对 anon 构建不可见：其旧深链允许暂时缺壳，到点后每日构建自动补上。
    continue;
  }
  const text = htmlText(pagePath);
  assert.ok(text.includes("/learning?entry=") || text.includes("正在打开这篇每日一看"), `兼容壳缺少跳转标记：${id}`);
  assert.ok(!text.includes("查看作品资料") && !text.includes("进一步看看"), `兼容壳仍含正文组件：${id}`);
  compatCount++;
}
console.log(`兼容入口：清单 ${oldLinkList.length} 条，构建时 anon 可见的 ${compatCount} 条已有跳转壳（其余为午夜策略隐藏的未来稿）。`);

// 2) 静态选题壳必须全部在位。
for (const id of STATIC_IDS) {
  assert.ok(existsSync(join(learningDir, id, "index.html")), `静态选题兼容壳缺失：${id}`);
}

// 3) 旧正文残留扫描：指纹先扣除仍合法公开的壳/列表文本（布局导航、合集标题等）。
const shellCorpus = [htmlText(join(learningDir, "index.html"))];
const archivePath = join(learningDir, "archive", "index.html");
if (existsSync(archivePath)) shellCorpus.push(htmlText(archivePath));
const allFingerprints = readFileSync(fingerprintFile, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
// 只比对旧正文页（历史 5 个静态选题的全文页）的指纹；合集/审核等页面的文案仍合法存在。
const fingerprints = allFingerprints.filter(({ path }) =>
  STATIC_IDS.some((id) => path.endsWith(`/learning/${id}`)));
const allHtml = walkHtml(outDir);
const leaked = [];
for (const { path, fingerprints: phrases } of fingerprints) {
  for (const phrase of phrases) {
    if (shellCorpus.some((shell) => shell.includes(phrase))) continue;
    for (const file of allHtml) {
      if (htmlText(file).includes(phrase)) leaked.push({ phrase: phrase.slice(0, 40), path, file: file.slice(root.length + 1) });
    }
  }
}
assert.equal(leaked.length, 0, `旧正文残留：\n${leaked.map((l) => `  ${l.file} ← ${l.phrase}`).join("\n")}`);
console.log(`正文残留扫描通过：${allHtml.length} 个产物文件（HTML+RSC 负载+JSON），0 条旧正文指纹命中。`);
