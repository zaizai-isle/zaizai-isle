-- ============================================================
-- RPC-AUTO-PUBLISH-DRAFT（草案，未执行）
-- 扩展 review_daily_learning_v2：decision='approved' 时在
-- 同一事务内完成「写审核决定 → 草稿转 approved/owner_approved
-- → 插入不可变发布记录」，一次点击 = 审核通过 + 发布。
--
-- 执行方式：岛主在 Supabase SQL Editor 整段执行
-- 项目：luudxrfxwwirsszqtgiu
-- 基线：20261020073800_daily_learning_v2_contract.sql
--       + 20261021024000（打回/拒绝行为）
--       + 20261030022602（display_date 列）
--       + 20261030063615（is_visible 列）
--       + 20261107235900（审核门禁 + 自动化账号）
--
-- 必填列核对（daily_learning_publications）：
--   owner_id / draft_id / source_id / draft_version /
--   source_record / content  —— 建表时 NOT NULL，无默认值
--   package_schema_version / content_id / package_snapshot
--     —— 20261020073800 追加；v2 插入策略
--        daily_learning_publications_owner_insert_approved_v2
--        强制 package_schema_version=2、content_id 非空、
--        package_snapshot 必须逐字段等于草稿快照（键序无关）。
--   display_date —— 20261030022602 追加，默认当天 Asia/Pontianak；
--     本函数优先取草稿计划发布日（planning.planned_publish_date /
--     planning.display_date / plan_issue 内嵌 YYYY-MM-DD），
--     取不到则回退当天 Asia/Pontianak。
--   published_at / is_visible —— 有默认值，不显式写入。
--
-- 权限注意：列级 INSERT 授权（20261020073800）不含 display_date，
-- 显式写该列前必须补 grant（见下方 0.1）。
--
-- 事务内顺序由触发器链决定，不可调换：
--   1) 插入 daily_learning_review_decisions（策略要求草稿此刻
--      仍是 awaiting_owner_review）；
--   2) 更新草稿 → owner_approved / approved（v2 触发器要求
--      已存在匹配的 approved 决定行，且 approved_content=content）；
--   3) 插入 daily_learning_publications（v2 插入策略读到的是
--      本事务第 2 步之后的草稿状态）。
--
-- 保持 security invoker：全部写入以岛主会话身份评估 RLS。
-- 机器人账号（daily_learning_automation_accounts）调用会在
-- 第 1 步被决策表策略拒绝，整个事务回滚——审核+发布仍只有岛主可做。
-- 打回（changes_requested）/ 拒绝（rejected）/ 暂缓（deferred）
-- 行为与 20261021024000 完全一致，不发布。
-- ============================================================

begin;

-- ---------- 0.1 补列级授权：允许写入 display_date ----------
-- 与已有的 update(display_date, is_visible) 授权面对同一控制面，
-- 不扩大岛主对发布表的控制范围。
grant insert (display_date)
  on public.daily_learning_publications to authenticated;

-- ---------- 1. 扩展后的审核 RPC（签名不变） ----------
create or replace function public.review_daily_learning_v2(
  p_draft_id uuid,
  p_decision text,
  p_note text default ''
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target public.daily_learning_article_drafts%rowtype;
  v_display_date date;
begin
  if p_decision not in ('approved', 'changes_requested', 'deferred', 'rejected') then
    raise exception 'Invalid review decision.';
  end if;
  if char_length(coalesce(p_note, '')) > 4000 then
    raise exception 'Review note is too long.';
  end if;

  select * into target
  from public.daily_learning_article_drafts
  where id = p_draft_id
  for update;

  if target.id is null
    or target.owner_id <> (select auth.uid())
    or target.package_schema_version <> 2
    or target.production_status <> 'awaiting_owner_review'
    or target.status <> 'pending_review' then
    raise exception 'Draft is not available for owner review.';
  end if;

  -- 步骤 1：写不可变审核决定行（与现状一致）
  insert into public.daily_learning_review_decisions (
    owner_id, draft_id, content_id, draft_version, decision, review_note
  ) values (
    target.owner_id, target.id, target.content_id, target.version,
    p_decision, coalesce(p_note, '')
  );

  if p_decision = 'approved' then
    -- 步骤 2：草稿转 approved / owner_approved（与现状一致）
    update public.daily_learning_article_drafts
    set production_status = 'owner_approved',
        status = 'approved',
        review_note = coalesce(p_note, ''),
        image_permission_verified = true,
        historical_sources_verified = true,
        approved_content = content
    where id = target.id;

    -- 展示日期：草稿计划发布日优先，取不到回退当天 Asia/Pontianak。
    -- 非法日期串（如 2026-02-31）不阻断审核，静默回退当天。
    begin
      v_display_date := coalesce(
        case
          when jsonb_typeof(target.planning) = 'object'
            and (target.planning ->> 'planned_publish_date') ~ '^\d{4}-\d{2}-\d{2}$'
            then (target.planning ->> 'planned_publish_date')::date
          when jsonb_typeof(target.planning) = 'object'
            and (target.planning ->> 'display_date') ~ '^\d{4}-\d{2}-\d{2}$'
            then (target.planning ->> 'display_date')::date
          when jsonb_typeof(target.planning) = 'object'
            and (target.planning ->> 'plan_issue') ~ '\d{4}-\d{2}-\d{2}'
            then substring(target.planning ->> 'plan_issue' from '\d{4}-\d{2}-\d{2}')::date
          else null
        end,
        (now() at time zone 'Asia/Pontianak')::date
      );
    exception when others then
      v_display_date := (now() at time zone 'Asia/Pontianak')::date;
    end;

    -- 步骤 3：同一事务插入不可变发布记录。
    -- package_snapshot 必须与 v2 插入策略的 jsonb_build_object
    -- 逐字段一致（jsonb 比较与键序无关）。
    insert into public.daily_learning_publications (
      owner_id, draft_id, source_id, draft_version, source_record, content,
      package_schema_version, content_id, package_snapshot, display_date
    ) values (
      target.owner_id, target.id, target.source_id, target.version,
      target.source_record, target.content,
      2, target.content_id,
      jsonb_build_object(
        'schema_version', target.package_schema_version,
        'content_id', target.content_id,
        'content_type', target.content_type,
        'planning', target.planning,
        'work', target.work_record,
        'article', target.content,
        'claims', target.claims,
        'assets', target.assets,
        'quality', target.quality
      ),
      v_display_date
    );
  elsif p_decision = 'changes_requested' then
    -- 打回行为不变（20261021024000）
    update public.daily_learning_article_drafts
    set status = 'changes_requested',
        review_note = coalesce(p_note, '')
    where id = target.id;
  elsif p_decision = 'rejected' then
    update public.daily_learning_article_drafts
    set status = 'rejected',
        review_note = coalesce(p_note, '')
    where id = target.id;
  else
    -- deferred 维持现状：落到 changes_requested 工作流
    update public.daily_learning_article_drafts
    set status = 'changes_requested',
        review_note = coalesce(p_note, '')
    where id = target.id;
  end if;
end;
$$;

revoke all on function public.review_daily_learning_v2(uuid, text, text) from public;
grant execute on function public.review_daily_learning_v2(uuid, text, text) to authenticated;

commit;

-- ============================================================
-- 执行后自检（SQL Editor 逐条跑）
-- ① 任一 approved+owner_approved 且尚无发布记录的旧草稿，
--    重新走一次审核不可能（已非 awaiting_owner_review）；
--    新审核通过的草稿应立刻出现在 daily_learning_publications：
--      select d.id, d.status, d.production_status, p.display_date, p.published_at
--      from public.daily_learning_article_drafts d
--      join public.daily_learning_publications p on p.draft_id = d.id
--      order by p.published_at desc limit 5;
-- ② 机器人账号调用本函数应报决策表策略违例（整事务回滚）。
-- ============================================================
