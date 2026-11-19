#!/usr/bin/env node
// 扫描静态导出产物 out/ 是否混入供应商凭证。
// 规则：
//   1) .env.local 中除"设计上可公开"的键以外，任何值出现在 out/ 中即失败；
//   2) 命中通用凭证指纹（AIza…、r8_…、service_role JWT、sk-…）即失败；
//   3) NEXT_PUBLIC_QWEATHER_KEY / NEXT_PUBLIC_GA_ID 设计上随前端发布，仅提示。
// 用法：node scripts/audit-export-secrets.mjs [out目录]，退出码非 0 表示发现泄露。
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const outDir = process.argv[2] || 'out';
const envPath = new URL('../.env.local', import.meta.url).pathname;

const PUBLIC_BY_DESIGN = new Set([
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_GA_ID',
  'NEXT_PUBLIC_QWEATHER_KEY',
]);

// 非秘密值：模型名是公开标签；机器人邮箱随 docs 正文发布（秘密是密码，不在这里）。
const NON_SECRET_ENV = new Set([
  'LEARNING_BOT_EMAIL',
]);

function isPublicLabel(name) {
  return name.endsWith('_MODEL') || name.endsWith('_BASE_URL') || name.endsWith('_PROVIDER');
}

const FINGERPRINTS = [
  { id: 'gemini-key', pattern: /AIza[0-9A-Za-z_-]{35}/g },
  { id: 'replicate-token', pattern: /r8_[A-Za-z0-9_]{20,}/g },
  { id: 'sk-key', pattern: /\bsk-[A-Za-z0-9_-]{16,}\b/g },
  { id: 'service-role-jwt', pattern: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g },
];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile()) yield full;
  }
}

function redact(value) {
  return `${value.slice(0, 4)}…${value.slice(-2)} (len ${value.length})`;
}

const findings = [];
const notes = [];

let envVars = new Map();
try {
  const envText = await readFile(envPath, 'utf8');
  for (const line of envText.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    envVars.set(m[1], m[2].trim().replace(/^["']|["']$/g, ''));
  }
} catch {
  notes.push('未找到 .env.local，仅执行指纹扫描');
}

const secretValues = [...envVars.entries()]
  .filter(([name, value]) =>
    value.length >= 16 &&
    !PUBLIC_BY_DESIGN.has(name) &&
    !NON_SECRET_ENV.has(name) &&
    !isPublicLabel(name) &&
    // 前端 BANANA_AI_API_KEY 缺省即 anon key，属于设计上可公开
    value !== envVars.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  );

for await (const file of walk(outDir)) {
  const text = await readFile(file, 'utf8').catch(() => '');
  if (!text) continue;

  for (const [name, value] of secretValues) {
    if (text.includes(value)) {
      findings.push(`[凭证泄露] ${relative('.', file)} 含 ${name} = ${redact(value)}`);
    }
  }

  const serviceRoleJwt = envVars.get('SUPABASE_SERVICE_ROLE_KEY');
  for (const { id, pattern } of FINGERPRINTS) {
    for (const match of text.matchAll(pattern)) {
      if (id === 'service-role-jwt') {
        // 普通 anon JWT 也会命中通用 JWT 指纹，只报告 service_role。
        try {
          const payload = JSON.parse(Buffer.from(match[0].split('.')[1], 'base64url').toString('utf8'));
          if (payload.role !== 'service_role' && match[0] !== serviceRoleJwt) continue;
        } catch {
          continue;
        }
      }
      findings.push(`[指纹命中 ${id}] ${relative('.', file)}: ${redact(match[0])}`);
    }
  }
}

for (const name of ['NEXT_PUBLIC_QWEATHER_KEY', 'NEXT_PUBLIC_GA_ID']) {
  if (envVars.get(name)) notes.push(`[设计公开] ${name} 随前端发布（本次范围外，注意监控滥用）`);
}

for (const line of notes) console.log(line);

if (findings.length > 0) {
  for (const line of findings) console.error(line);
  console.error(`\n导出产物发现 ${findings.length} 处供应商凭证泄露。`);
  process.exit(1);
}

await stat(outDir);
console.log(`导出产物扫描通过：${outDir} 未发现供应商凭证。`);
