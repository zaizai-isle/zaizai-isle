-- ============================================================
-- R1+B1 完整迁移（岛主在 Supabase SQL Editor 整段执行）
-- 项目：luudxrfxwwirsszqtgiu
-- 基线：20261030045838_daily_learning_mutable_pending_drafts.sql
-- 执行成功后，把本文件复制为
--   supabase/migrations/20261107235900_daily_learning_review_gate_and_automation_account.sql
-- 随下次提交入库，保持 schema 记录一致。
-- ============================================================

begin;

-- ---------- 第一部分：B1 门禁修复 ----------

-- 1.1 收紧草稿 INSERT 策略：v2 行必须以 awaiting_owner_review 出生
drop policy if exists daily_learning_drafts_owner_insert
  on public.daily_learning_article_drafts;
create policy daily_learning_drafts_owner_insert
  on public.daily_learning_article_drafts for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (select 1 from public.island_owner_accounts o where o.user_id = (select auth.uid()))
    and status = 'pending_review'
    and not image_permission_verified
    and not historical_sources_verified
    and approved_content is null
    and (
      package_schema_version is null
      or package_schema_version <> 2
      or production_status = 'awaiting_owner_review'
    )
  );

-- 1.2 触发器函数：在 20261030045838 版本上做两处修改
--     修改点A：支持 INSERT 事件（old 为 null 时的 v2 出生检查）
--     修改点B：status 进入 approved 时无条件要求岛主审核决定行
create or replace function public.protect_daily_learning_v2_draft()
returns trigger language plpgsql set search_path = '' as $$
begin
  -- 修改点A：INSERT 分支（原函数只有 UPDATE 语义）
  if tg_op = 'INSERT' then
    if new.package_schema_version = 2 and (
      new.production_status is distinct from 'awaiting_owner_review'
      or new.status is distinct from 'pending_review'
      or new.approved_content is not null
    ) then
      raise exception 'V2 drafts must be born as awaiting_owner_review pending_review working copies.';
    end if;
    return new;
  end if;

  if old.package_schema_version <> 2 then
    return new;
  end if;

  -- Unreviewed working copies can change without allocating a content version.
  if old.status = 'pending_review' and new.status = 'pending_review'
    and old.production_status = 'awaiting_owner_review'
    and new.production_status = 'awaiting_owner_review'
    and old.approved_content is null and new.approved_content is null
    and not exists (select 1 from public.daily_learning_publications p where p.draft_id = old.id)
    and not exists (select 1 from public.daily_learning_review_decisions d where d.draft_id = old.id)
  then
    if new.id is distinct from old.id
      or new.package_schema_version is distinct from old.package_schema_version
      or new.content_id is distinct from old.content_id
      or new.owner_id is distinct from old.owner_id
      or new.source_id is distinct from old.source_id
      or new.version is distinct from old.version then
      raise exception 'Working-copy identity is immutable.';
    end if;
    return new;
  end if;

  if new.package_schema_version is distinct from old.package_schema_version
    or new.content_id is distinct from old.content_id
    or new.content_type is distinct from old.content_type
    or new.owner_id is distinct from old.owner_id
    or new.source_id is distinct from old.source_id
    or new.source_record is distinct from old.source_record
    or new.content is distinct from old.content
    or new.version is distinct from old.version
    or new.planning is distinct from old.planning
    or new.work_record is distinct from old.work_record
    or new.claims is distinct from old.claims
    or new.assets is distinct from old.assets
    or new.quality is distinct from old.quality then
    raise exception 'V2 review packages are immutable. Create a new version.';
  end if;

  if new.production_status is distinct from old.production_status then
    if not (
      old.production_status = 'awaiting_owner_review'
      and new.production_status = 'owner_approved'
      and exists (
        select 1
        from public.daily_learning_review_decisions decision
        where decision.draft_id = old.id
          and decision.owner_id = old.owner_id
          and decision.content_id = old.content_id
          and decision.draft_version = old.version
          and decision.decision = 'approved'
      )
    ) then
      raise exception 'Invalid daily-learning v2 status transition.';
    end if;
  end if;

  -- 修改点B（核心）：approved 无条件要求决策行，不再依赖状态是否变化
  if new.status = 'approved' then
    if not exists (
      select 1
      from public.daily_learning_review_decisions decision
      where decision.draft_id = new.id
        and decision.owner_id = new.owner_id
        and decision.content_id = new.content_id
        and decision.draft_version = new.version
        and decision.decision = 'approved'
    ) then
      raise exception 'Cannot approve without an owner review decision.';
    end if;
    if new.production_status <> 'owner_approved'
      or new.approved_content is distinct from new.content then
      raise exception 'V2 approval requires an owner decision and matching snapshot.';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.protect_daily_learning_v2_draft() from public;

-- 1.3 触发器扩展到 INSERT（堵住"出生即 approved"）
drop trigger if exists protect_daily_learning_v2_draft_before_update
  on public.daily_learning_article_drafts;
create trigger protect_daily_learning_v2_draft_before_change
  before insert or update on public.daily_learning_article_drafts
  for each row execute function public.protect_daily_learning_v2_draft();

-- ---------- 第二部分：R1 机器人账号分离 ----------

-- 2.1 自动化账号允许清单
create table if not exists public.daily_learning_automation_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  note text
);
alter table public.daily_learning_automation_accounts enable row level security;
revoke all on public.daily_learning_automation_accounts from anon, authenticated;
-- 必须放行 authenticated 的 SELECT：草稿策略的子查询要读这张表，
-- 否则机器人连策略都无法评估（2026-11-07 冒烟测试实测踩中）。
-- uid 本身不是秘密，真正的门禁是机器人密码 + 各表写入策略。
grant select on public.daily_learning_automation_accounts to authenticated;
create policy daily_learning_automation_accounts_read
  on public.daily_learning_automation_accounts for select to authenticated
  using (true);
-- 增删行仍只由岛主通过 SQL Editor（postgres 角色）维护

-- 2.1.5 机器人需要能"看见"岛主账号行，草稿策略的子查询才评估得动
--       （island_owner_accounts 原本只有自助读策略；此策略仅对允许清单中的机器人开放）
create policy island_owner_read_by_automation
  on public.island_owner_accounts for select to authenticated
  using (
    exists (select 1 from public.daily_learning_automation_accounts a where a.user_id = (select auth.uid()))
  );

-- 2.2 机器人对草稿的三条受限策略（读/建/改，全部锁死在待审工作副本）
drop policy if exists daily_learning_drafts_automation_select
  on public.daily_learning_article_drafts;
create policy daily_learning_drafts_automation_select
  on public.daily_learning_article_drafts for select to authenticated
  using (
    exists (select 1 from public.daily_learning_automation_accounts a where a.user_id = (select auth.uid()))
    and exists (select 1 from public.island_owner_accounts o where o.user_id = daily_learning_article_drafts.owner_id)
  );

drop policy if exists daily_learning_drafts_automation_insert
  on public.daily_learning_article_drafts;
create policy daily_learning_drafts_automation_insert
  on public.daily_learning_article_drafts for insert to authenticated
  with check (
    exists (select 1 from public.daily_learning_automation_accounts a where a.user_id = (select auth.uid()))
    and exists (select 1 from public.island_owner_accounts o where o.user_id = daily_learning_article_drafts.owner_id)
    and package_schema_version = 2
    and production_status = 'awaiting_owner_review'
    and status = 'pending_review'
    and approved_content is null
    and not image_permission_verified
    and not historical_sources_verified
  );

drop policy if exists daily_learning_drafts_automation_update
  on public.daily_learning_article_drafts;
create policy daily_learning_drafts_automation_update
  on public.daily_learning_article_drafts for update to authenticated
  using (
    exists (select 1 from public.daily_learning_automation_accounts a where a.user_id = (select auth.uid()))
    and production_status = 'awaiting_owner_review'
    and status = 'pending_review'
  )
  with check (
    exists (select 1 from public.daily_learning_automation_accounts a where a.user_id = (select auth.uid()))
    and production_status = 'awaiting_owner_review'
    and status = 'pending_review'
    and approved_content is null
  );

-- 2.3 review_decisions / publications 策略不动：均要求 owner_id = auth.uid()
--     机器人 uid 不在 island_owner_accounts → 天然无法写审核决定与发布表。

commit;

-- ============================================================
-- 执行后自检（在 SQL Editor 逐条跑，应全部返回 0 行或报错）
-- ① 岛主直接 INSERT 一个 owner_approved 的 v2 草稿 → 应报
--    "V2 drafts must be born as awaiting_owner_review..."
--    （测试用的 id 用 gen_random_uuid()，测完 delete 掉自己刚插的行）
-- ============================================================
