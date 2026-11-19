-- 每日一看：未来稿在 Asia/Pontianak 当地午夜前对访客不可读，午夜后可读。
-- 岛主在 Supabase SQL Editor 整段执行；无需任何前端构建。
--   * 访客（anon / 非岛主 authenticated）：is_visible 且 display_date 已到当地日期才可读。
--   * 岛主（owner_id 白名单成员）：仍可读自己全部发布行（含未到期定时稿与已下架行），
--     审核管理页与"下架后原链接不再出正文"行为不变。
begin;

drop policy if exists daily_learning_publications_listed_or_owner_select
  on public.daily_learning_publications;

create policy daily_learning_publications_public_select_after_local_midnight
  on public.daily_learning_publications for select
  to anon, authenticated
  using (
    (is_visible and display_date <= (now() at time zone 'Asia/Pontianak')::date)
    or owner_id = (select auth.uid())
  );

comment on policy daily_learning_publications_public_select_after_local_midnight
  on public.daily_learning_publications is
  '公开读取=已展示且已过 Asia/Pontianak 当地午夜；owner 白名单成员可预览自己全部发布行。';

notify pgrst, 'reload schema';
commit;
