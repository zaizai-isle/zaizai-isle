import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const legacyLinks = JSON.parse(readFileSync(new URL("../src/app/learning/legacy-learning-links.json", import.meta.url), "utf8"));
const fingerprints = Object.values(JSON.parse(readFileSync(
  new URL("./fixtures/legacy-learning-body-fingerprints.json", import.meta.url), "utf8",
))).flat();
const outDir = process.argv[2] || "out";

assert.ok(legacyLinks.length > 5 && new Set(legacyLinks).size === legacyLinks.length, "旧链接清单为空或有重复");
assert.ok(fingerprints.length > 0, "缺少旧正文指纹");

for (const id of legacyLinks) {
  const file = join(outDir, "learning", id, "index.html");
  assert.ok(existsSync(file), `缺少旧链接跳转壳：${id}`);
  const html = readFileSync(file, "utf8");
  assert.ok(html.includes(`href="/zaizai-isle/learning/?entry=${encodeURIComponent(id)}"`), `跳转目标错误：${id}`);
  assert.ok(!/查看作品资料|进一步看看/.test(html), `旧链接仍含正文：${id}`);
}

let scanned = 0;
for (const file of readdirSync(outDir, { recursive: true, withFileTypes: true })) {
  // These formats carry prerendered route data. The client still bundles the
  // intentionally public static articles for explicit legacy entry requests.
  if (!file.isFile() || !/\.(html|txt|rsc|json)$/.test(file.name)) continue;
  const path = join(file.parentPath, file.name);
  const text = readFileSync(path, "utf8");
  const normalized = text.replace(/<[^>]+>|\s+/g, "");
  for (const phrase of fingerprints) {
    assert.ok(!normalized.includes(phrase), `预渲染产物含旧正文：${relative(outDir, path)}`);
  }
  scanned++;
}

console.log(`旧链接：${legacyLinks.length} 个跳转壳通过。扫描 ${scanned} 个预渲染产物，未发现旧正文指纹。`);
