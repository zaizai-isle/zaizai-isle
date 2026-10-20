-- Immutable public release records. Approval and publication remain separate.
create table public.daily_learning_publications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.island_owner_accounts(user_id) on delete restrict,
  draft_id uuid not null unique references public.daily_learning_article_drafts(id) on delete restrict,
  source_id text not null check (char_length(source_id) between 3 and 150),
  draft_version integer not null check (draft_version > 0),
  source_record jsonb not null check (
    jsonb_typeof(source_record) = 'object' and pg_column_size(source_record) <= 40000
  ),
  content jsonb not null check (
    jsonb_typeof(content) = 'object' and pg_column_size(content) <= 80000
  ),
  published_at timestamptz not null default now(),
  unique (owner_id, source_id, draft_version)
);

alter table public.daily_learning_publications enable row level security;
revoke all on public.daily_learning_publications from public, anon, authenticated;
grant select on public.daily_learning_publications to anon, authenticated;
grant insert (owner_id, draft_id, source_id, draft_version, source_record, content)
  on public.daily_learning_publications to authenticated;

create policy daily_learning_publications_public_select
  on public.daily_learning_publications for select
  to anon, authenticated
  using (true);

create policy daily_learning_publications_owner_insert_approved
  on public.daily_learning_publications for insert
  to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1
      from public.daily_learning_article_drafts draft
      where draft.id = daily_learning_publications.draft_id
        and draft.owner_id = (select auth.uid())
        and draft.status = 'approved'
        and draft.source_id = daily_learning_publications.source_id
        and draft.version = daily_learning_publications.draft_version
        and draft.source_record = daily_learning_publications.source_record
        and draft.approved_content = daily_learning_publications.content
    )
  );

create or replace function public.protect_learning_publication()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'Published learning versions are immutable.';
end;
$$;

revoke all on function public.protect_learning_publication() from public;

create trigger protect_learning_publication_before_change
before update or delete on public.daily_learning_publications
for each row execute function public.protect_learning_publication();

comment on table public.daily_learning_publications is
  'Public immutable snapshots created only from explicitly approved daily-learning draft versions.';
