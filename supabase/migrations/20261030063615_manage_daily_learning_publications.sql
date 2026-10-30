alter table public.daily_learning_publications
  add column if not exists is_visible boolean not null default true;

comment on column public.daily_learning_publications.is_visible is
  'Whether this immutable release is listed on public daily-learning surfaces; owners can restore an unlisted release.';

create index if not exists daily_learning_publications_visible_display_date_idx
  on public.daily_learning_publications (display_date desc, published_at desc)
  where is_visible;

drop policy if exists daily_learning_publications_public_select
  on public.daily_learning_publications;
drop policy if exists daily_learning_publications_listed_or_owner_select
  on public.daily_learning_publications;

create policy daily_learning_publications_listed_or_owner_select
  on public.daily_learning_publications for select
  to anon, authenticated
  using (is_visible or owner_id = (select auth.uid()));

drop policy if exists daily_learning_publications_owner_update_listing
  on public.daily_learning_publications;

create policy daily_learning_publications_owner_update_listing
  on public.daily_learning_publications for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

revoke update on public.daily_learning_publications from authenticated;
grant update (display_date, is_visible)
  on public.daily_learning_publications to authenticated;

create or replace function public.protect_learning_publication()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE'
    and (to_jsonb(new) - array['display_date', 'is_visible'])
      = (to_jsonb(old) - array['display_date', 'is_visible']) then
    return new;
  end if;

  raise exception 'Published learning versions are immutable.';
end;
$$;
