-- Private daily-learning article drafts; approval does not publish a draft.
create table if not exists public.daily_learning_article_drafts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.island_owner_accounts(user_id) on delete cascade,
  source_id text not null check (char_length(source_id) between 3 and 150),
  source_record jsonb not null check (jsonb_typeof(source_record) = 'object' and pg_column_size(source_record) <= 40000),
  content jsonb not null check (jsonb_typeof(content) = 'object' and pg_column_size(content) <= 80000),
  version integer not null default 1 check (version > 0),
  status text not null default 'pending_review'
    check (status in ('pending_review', 'changes_requested', 'approved', 'rejected')),
  image_permission_verified boolean not null default false,
  historical_sources_verified boolean not null default false,
  review_note text not null default '' check (char_length(review_note) <= 2000),
  reviewed_at timestamptz,
  approved_content jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, source_id, version),
  constraint approved_requires_checks check (
    status <> 'approved'
    or (image_permission_verified and historical_sources_verified and approved_content is not null)
  )
);
alter table public.daily_learning_article_drafts enable row level security;
revoke all on public.daily_learning_article_drafts from public, anon, authenticated;
grant select, insert, update on public.daily_learning_article_drafts to authenticated;

create policy daily_learning_drafts_owner_select
  on public.daily_learning_article_drafts for select to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (select 1 from public.island_owner_accounts o where o.user_id = (select auth.uid()))
  );
create policy daily_learning_drafts_owner_insert
  on public.daily_learning_article_drafts for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (select 1 from public.island_owner_accounts o where o.user_id = (select auth.uid()))
    and status = 'pending_review' and not image_permission_verified
    and not historical_sources_verified and approved_content is null
  );
create policy daily_learning_drafts_owner_update
  on public.daily_learning_article_drafts for update to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (select 1 from public.island_owner_accounts o where o.user_id = (select auth.uid()))
  )
  with check (
    owner_id = (select auth.uid())
    and exists (select 1 from public.island_owner_accounts o where o.user_id = (select auth.uid()))
  );

-- Preserve approved versions. Any rewrite must create a new version.
create or replace function public.protect_learning_approved_draft()
returns trigger language plpgsql set search_path = '' as $$
begin
  if old.status = 'approved' then
    raise exception 'Approved learning drafts are immutable. Create a new version.';
  end if;
  if new.status = 'approved' and (
    new.approved_content is distinct from new.content
    or not new.image_permission_verified
    or not new.historical_sources_verified
  ) then
    raise exception 'Approval requires verified sources, image rights and a matching content snapshot.';
  end if;
  new.updated_at = now();
  if new.status in ('approved','changes_requested','rejected') then
    new.reviewed_at = now();
  end if;
  return new;
end;
$$;
create trigger protect_learning_approved_draft_before_update
before update on public.daily_learning_article_drafts
for each row execute function public.protect_learning_approved_draft();

comment on table public.daily_learning_article_drafts is
  'Private Agent-written articles. Owner approval freezes a version; publishing is a separate operation.';
