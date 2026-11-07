// R1 机器人账号冒烟测试 · 2026-11-07
// 验证：机器人只能写"待审工作副本"，审核决定/发布/越权状态全部被拒
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.split('=')[0], l.split('=').slice(1).join('=').trim()])
);
const OWNER = 'ac237c2c-4be3-461c-a2e2-697118287ced';
const SOURCE = `smoke-test-${Date.now()}`;

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const results = [];
const check = (name, pass, detail = '') => {
  if (/automation_accoun/.test(detail)) {
    pass = false; detail = '假阳性：allowlist 表无读权限，策略无法评估（待跑补丁）';
  }
  if (detail.length > 60) detail = detail.slice(0, 60);
  results.push(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ← ' + detail : ''}`);
};

// 0. 机器人登录
const { data: signIn, error: signInErr } = await supabase.auth.signInWithPassword({
  email: env.LEARNING_BOT_EMAIL,
  password: env.LEARNING_BOT_PASSWORD,
});
if (signInErr) {
  console.log(`FAIL  机器人登录  ← ${signInErr.message}`);
  process.exit(1);
}
check('机器人登录', true, signIn.user.id.slice(0, 8));

const draftRow = (over = {}) => ({
  owner_id: OWNER,
  source_id: SOURCE,
  source_record: { smoke: true },
  content: { smoke: true },
  package_schema_version: 2,
  content_id: SOURCE,
  content_type: 'single_artwork',
  production_status: 'awaiting_owner_review',
  status: 'pending_review',
  ...over,
});

// 1. 机器人 SELECT 岛主草稿（automation_select）
const { error: selErr } = await supabase
  .from('daily_learning_article_drafts').select('id').limit(1);
check('机器人读草稿', !selErr, selErr?.message);

// 2. 机器人 INSERT 合规待审草稿
const { data: ins, error: insErr } = await supabase
  .from('daily_learning_article_drafts').insert(draftRow()).select('id').single();
check('机器人写待审草稿', !insErr, insErr?.message ?? ins?.id?.slice(0, 8));

// 3. 机器人 INSERT 出生即 owner_approved → 必须被拒
const { error: bornErr } = await supabase
  .from('daily_learning_article_drafts')
  .insert(draftRow({ source_id: SOURCE + '-bad', content_id: SOURCE + '-bad', production_status: 'owner_approved' }));
check('拒绝出生即owner_approved', !!bornErr, bornErr?.message);

// 4. 机器人 UPDATE 自己的草稿 → owner_approved → 必须被拒
if (ins) {
  const { error: upErr } = await supabase
    .from('daily_learning_article_drafts')
    .update({ production_status: 'owner_approved' }).eq('id', ins.id);
  check('拒绝机器人改owner_approved', !!upErr, upErr?.message);
}

// 5. 机器人 INSERT 审核决定 → 必须被拒
const { error: decErr } = await supabase
  .from('daily_learning_review_decisions')
  .insert({ owner_id: OWNER, draft_id: ins?.id ?? OWNER, content_id: SOURCE, draft_version: 1, decision: 'approved' });
check('拒绝写审核决定', !!decErr, decErr?.message);

// 6. 机器人 INSERT 发布记录 → 必须被拒
const { error: pubErr } = await supabase
  .from('daily_learning_publications')
  .insert({
    owner_id: OWNER,
    draft_id: ins?.id ?? OWNER,
    source_id: SOURCE,
    draft_version: 1,
    source_record: { smoke: true },
    content: { smoke: true },
    display_date: '2026-11-07',
  });
check('拒绝写发布表', !!pubErr, pubErr?.message);

// 7. 机器人 DELETE 测试草稿（预期无权限，留岛主后台清理）
if (ins) {
  const { error: delErr } = await supabase
    .from('daily_learning_article_drafts').delete().eq('id', ins.id);
  check('机器人删草稿(预期拒)', !!delErr, delErr ? '已拒，测试行留后台删' : '竟然可删');
}

console.log(results.join('\n'));
const fails = results.filter((r) => r.startsWith('FAIL'));
console.log(`\n${results.length - fails.length}/${results.length} 通过`);
process.exit(fails.length ? 1 : 0);
