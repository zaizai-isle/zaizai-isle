// 旧 Gemini 凭证失效自证：在任何可联网机器上运行（本工作区到 Google 域网络不通，无法代跑）。
// 三种结果，绝不把"网络不可达"误判成"已失效"：
//   退出 0 = Google 明确拒绝该 key（已失效/已撤销）✓
//   退出 1 = 该 key 仍能调用（尚未撤销：去 Google AI Studio 撤销并删 Actions secret 后复跑）
//   退出 2 = 无法连到 Google（换网络后复跑）
// 用法：node scripts/verify-gemini-key-revoked.mjs [key]
// 不带参数时从 .env.local 的 NEXT_PUBLIC_GEMINI_API_KEY 读取（历史泄漏的那把）。
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

let key = process.argv[2];
if (!key) {
  const file = join(process.cwd(), ".env.local");
  if (!existsSync(file)) { console.error("未提供 key，且缺少 .env.local。"); process.exit(2); }
  const line = readFileSync(file, "utf8").split("\n").find((entry) => entry.startsWith("NEXT_PUBLIC_GEMINI_API_KEY="));
  key = line?.slice("NEXT_PUBLIC_GEMINI_API_KEY=".length).trim();
}
if (!key) { console.error("读不到旧 Gemini key。"); process.exit(2); }

const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`;
let response;
try {
  response = await fetch(endpoint, { signal: AbortSignal.timeout(15_000) });
} catch (error) {
  console.error(`无法连接 Google（${error instanceof Error ? error.name : String(error)}）——无法判定，换网络复跑。`);
  process.exit(2);
}
const body = await response.text();
if (response.ok) {
  console.error("旧 key 仍然有效：模型列表返回 200。必须立即在 Google AI Studio 撤销，并删除 GitHub Actions secret。");
  process.exit(1);
}
const dead = response.status === 400 || response.status === 403 || /API_KEY_INVALID|API key not valid|permission/i.test(body);
if (dead) {
  console.log(`旧 key 已失效（HTTP ${response.status}）：${body.slice(0, 160)}`);
  process.exit(0);
}
console.error(`HTTP ${response.status} 且响应不含明确的 key 拒绝信号，请人工核对：${body.slice(0, 300)}`);
process.exit(2);
