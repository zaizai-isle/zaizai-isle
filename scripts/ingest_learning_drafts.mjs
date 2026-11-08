// D2 机器人入库脚本 · 每日一看自动化规则 v1
// 用法: env PATH="$PWD/.conda-env/bin:$PATH" HTTPS_PROXY=http://127.0.0.1:7897 NODE_USE_ENV_PROXY=1 \
//       npx tsx scripts/ingest_learning_drafts.mjs <package.json ...> [--commit]
// 默认 dry-run（只校验+探测，不写库）；--commit 才以机器人身份写入 awaiting_owner_review 草稿。
// 机器人权限由 RLS 强制：只能建/改待审工作副本，永远碰不到审核决定与发布（见 20261107235900 迁移）。
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
// tsx 将 TS 编译为 CJS，命名导出可能挂在 default 下，做兼容取法
const pkgModule = await import('../src/app/learning/learning-package.ts');
const validateLearningPackageV2 = pkgModule.validateLearningPackageV2 ?? pkgModule.default?.validateLearningPackageV2;
if (typeof validateLearningPackageV2 !== 'function') {
  console.error('无法加载 validateLearningPackageV2');
  process.exit(1);
}

const root = resolve(import.meta.dirname, '..');
const env = Object.fromEntries(
  readFileSync(resolve(root, '.env.local'), 'utf8').split('\n')
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.split('=')[0], l.split('=').slice(1).join('=').trim()])
);
const OWNER_ID = env.LEARNING_OWNER_ID ?? 'ac237c2c-4be3-461c-a2e2-697118287ced';
const REACH_LOG = resolve(root, 'data/learning/research/source-reachability.json');

const args = process.argv.slice(2);
const commit = args.includes('--commit');
const files = args.filter((a) => !a.startsWith('--'));
if (!files.length) {
  console.error('用法: ingest_learning_drafts.mjs <package.json ...> [--commit]');
  process.exit(2);
}

const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const { data: session, error: loginErr } = await supabase.auth.signInWithPassword({
  email: env.LEARNING_BOT_EMAIL,
  password: env.LEARNING_BOT_PASSWORD,
});
if (loginErr) { console.error(`机器人登录失败: ${loginErr.message}`); process.exit(1); }
console.log(`机器人登录 OK (${session.user.id.slice(0, 8)}) · ${commit ? '提交模式' : 'dry-run'}`);

// R3 可达性探测：主图 source_url 不可达则本包跳过入库
async function probe(url) {
  if (!url) return { ok: false, reason: 'no source_url' };
  try {
    const res = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-1023' }, signal: AbortSignal.timeout(20000) });
    return { ok: res.status < 400, status: res.status };
  } catch (e) { return { ok: false, reason: String(e.cause?.code ?? e.message) }; }
}

const reachLog = existsSync(REACH_LOG) ? JSON.parse(readFileSync(REACH_LOG, 'utf8')) : {};
let inserted = 0, blocked = 0;

for (const file of files) {
  const pkg = JSON.parse(readFileSync(resolve(root, file), 'utf8'));
  const id = pkg.content_id ?? file;

  // D3 校验（与审核页同一校验器）
  const v = validateLearningPackageV2(pkg);
  if (!v.valid || !v.readyForOwnerReview) {
    console.log(`✗ ${id}: 校验不过 → ${JSON.stringify(v.blockers ?? v.errors).slice(0, 200)}`);
    blocked++; continue;
  }

  // R3 主图可达性（v2 包资产字段为 image_url）
  const main = (pkg.assets ?? []).find((a) => a.role === 'main') ?? (pkg.assets ?? [])[0];
  const mainUrl = main?.image_url ?? main?.source_page;
  const probeRes = await probe(mainUrl);
  reachLog[mainUrl ?? id] = { checked_at: new Date().toISOString(), ...probeRes };
  if (!probeRes.ok) {
    console.log(`✗ ${id}: 主图不可达 (${probeRes.status ?? probeRes.reason})，跳过入库`);
    blocked++; continue;
  }

  const row = {
    owner_id: OWNER_ID,
    source_id: String(pkg.source_id ?? id).slice(0, 150),
    source_record: pkg.planning?.source ?? { content_id: id },
    content: pkg.article ?? {},
    package_schema_version: 2,
    content_id: id,
    content_type: pkg.content_type ?? 'single_artwork',
    production_status: 'awaiting_owner_review',
    status: 'pending_review',
    planning: pkg.planning ?? null,
    work_record: pkg.work ?? null,
    claims: pkg.claims ?? null,
    assets: pkg.assets ?? null,
    quality: pkg.quality ?? null,
  };

  if (!commit) { console.log(`○ ${id}: 校验通过+可达（dry-run 未写库）`); continue; }

  // 幂等：同 content_id 已有待审草稿则更新，否则新建
  const { data: existing } = await supabase
    .from('daily_learning_article_drafts')
    .select('id').eq('owner_id', OWNER_ID).eq('content_id', id)
    .eq('production_status', 'awaiting_owner_review').maybeSingle();
  const res = existing
    ? await supabase.from('daily_learning_article_drafts')
        .update({ ...row, version: (existing.version ?? 1) + 1 }).eq('id', existing.id).select('id').single()
    : await supabase.from('daily_learning_article_drafts').insert(row).select('id').single();
  if (res.error) { console.log(`✗ ${id}: 写库失败 ${res.error.message}`); blocked++; }
  else { console.log(`✓ ${id}: 待审草稿 ${existing ? '已更新' : '已创建'} ${res.data.id.slice(0, 8)}`); inserted++; }
}

writeFileSync(REACH_LOG, JSON.stringify(reachLog, null, 2) + '\n');
console.log(`\n入库 ${inserted} · 拦截 ${blocked}${commit ? '' : '（dry-run，加 --commit 生效）'}`);
process.exit(blocked && commit ? 1 : 0);
