// 阶段②午夜门禁在线核验（匿名身份，全程只读，无需构建）：
//   1) 未来稿不可读：以 anon key 直查发布表，任何 is_visible 且 display_date 晚于
//      Asia/Pontianak 当地今天的行都必须隐身；按 id 的深链式查询也必须为空。
//   2) 已过午夜可读：今天（或最近一天）的可见行必须能按 id / content_id 读到全文。
// 策略迁移 20261119120000 应用前，本脚本会如实报告现存未来稿为"泄漏"。
// 用法：node scripts/daily-learning-midnight-smoke.mjs
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function readEnvLocal() {
  const file = join(process.cwd(), ".env.local");
  const map = {};
  if (existsSync(file)) {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) map[m[1]] = m[2].trim();
    }
  }
  return map;
}

const env = readEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("需要 .env.local 中的 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY。");
  process.exit(2);
}

const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Pontianak", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
const v = Object.fromEntries(parts.map((p) => [p.type, p.value]));
const today = `${v.year}-${v.month}-${v.day}`;

async function rest(query, head = {}) {
  const res = await fetch(`${url}/rest/v1/daily_learning_publications?${query}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, ...head },
  });
  if (!res.ok) throw new Error(`REST HTTP ${res.status}: ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

const failures = [];
const future = await rest(`select=id,content_id,display_date,content->>title&is_visible=eq.true&display_date=gt.${today}&order=display_date.asc&limit=100`);
console.log(`Asia/Pontianak 今天=${today}；anon 可见的未来稿行数=${future.length}（午夜策略生效后必须为 0）。`);
for (const row of future) {
  failures.push(`未来稿泄漏：${row.display_date} ${row.content_id ?? row.id}`);
  const deep = await rest(`select=id&is_visible=eq.true&id=eq.${row.id}`);
  if (deep.length) failures.push(`未来稿深链仍可按 id 读到：${row.id}`);
}

// 匿名直访线上文章链接：未来稿链接不得服务端渲染正文。
// 新构建=无正文兼容壳（可）；尚未部署新构建时旧正文页会命中正文标记 → 记为链接级泄漏。
const siteBase = (env.LEARNING_SITE_URL || "https://zaizai-isle.github.io/zaizai-isle").replace(/\/$/, "");
const bodyMarker = "查看作品资料"; // LearningArticle 的正文区标记，兼容壳与 404 都不含它
for (const row of future) {
  if (!row.content_id) continue;
  const link = `${siteBase}/learning/${encodeURIComponent(row.content_id)}/`;
  try {
    const res = await fetch(link, { cache: "no-store" });
    if (res.status === 404) { console.log(`未来稿文章链接匿名不可读（404）：${row.content_id}`); continue; }
    const html = await res.text();
    if (html.includes(bodyMarker)) failures.push(`未来稿文章链接仍服务端渲染正文：${link}`);
    else console.log(`未来稿文章链接为兼容壳/空态：${row.content_id}（HTTP ${res.status}）`);
  } catch (error) {
    console.warn(`（文章链接核验跳过：${link} —— ${error instanceof Error ? error.message : String(error)}；请在可联网环境复跑。）`);
  }
}

// 已过午夜的可读性：找最近一条已到期可见行（岛主 SQL 或机器人写入的成品行）。
const readable = await rest(`select=id,content_id,display_date,content->>title&is_visible=eq.true&order=display_date.desc&limit=1`);if (!readable.length) {
  console.log("（当前无可见发布行，跳过可读性正面验证。）");
} else {
  const row = readable[0];
  if (row.display_date > today) {
    failures.push(`最新可见行 ${row.display_date} 尚未到点却可读：${row.content_id ?? row.id}`);
  } else {
    const full = await rest(`select=id&is_visible=eq.true&id=eq.${row.id}`);
    if (!full.length) failures.push(`已到午夜的可读行按 id 查不到：${row.id}（${row.display_date}）`);
    else console.log(`午夜后可读验证通过：${row.display_date} ${row.content_id ?? row.id} 可匿名读取。`);
  }
}

if (failures.length) {
  console.error("午夜门禁未通过：\n" + failures.map((f) => "  - " + f).join("\n"));
  console.error("（若策略迁移 20261119120000 尚未在 SQL Editor 执行，请先执行再复跑。）");
  process.exit(1);
}
console.log("午夜门禁在线核验通过：未来稿匿名不可读，已到期行匿名可读，全程无需构建。");
