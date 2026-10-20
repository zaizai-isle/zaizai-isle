-- PRD-compliant daily-learning review packages. Existing v1 rows remain readable,
-- but only complete v2 packages can enter the new approval and publication path.
alter table public.daily_learning_article_drafts
  add column package_schema_version smallint not null default 1,
  add column content_id text,
  add column content_type text,
  add column production_status text not null default 'legacy_v1',
  add column planning jsonb,
  add column work_record jsonb,
  add column claims jsonb,
  add column assets jsonb,
  add column quality jsonb;

alter table public.daily_learning_article_drafts
  add constraint daily_learning_package_schema_check
    check (package_schema_version in (1, 2)),
  add constraint daily_learning_content_type_check
    check (content_type is null or content_type in ('single_artwork', 'related_reading')),
  add constraint daily_learning_production_status_check
    check (production_status in (
      'legacy_v1', 'candidate', 'researching', 'draft', 'reviewed',
      'asset_cleared', 'ready', 'awaiting_owner_review',
      'owner_approved', 'published'
    )),
  add constraint daily_learning_v2_package_required_check
    check (
      package_schema_version = 1
      or (
        content_id is not null
        and char_length(content_id) between 3 and 150
        and content_type is not null
        and production_status <> 'legacy_v1'
        and jsonb_typeof(planning) = 'object'
        and jsonb_typeof(work_record) = 'object'
        and jsonb_typeof(content) = 'object'
        and jsonb_typeof(claims) = 'array'
        and jsonb_array_length(claims) > 0
        and jsonb_typeof(assets) = 'array'
        and jsonb_array_length(assets) > 0
        and jsonb_typeof(quality) = 'object'
      )
    );

create unique index daily_learning_drafts_owner_content_version_v2_idx
  on public.daily_learning_article_drafts (owner_id, content_id, version)
  where package_schema_version = 2;

create index daily_learning_drafts_owner_review_queue_idx
  on public.daily_learning_article_drafts (owner_id, updated_at desc)
  where production_status = 'awaiting_owner_review';

create table public.daily_learning_review_decisions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.island_owner_accounts(user_id) on delete restrict,
  draft_id uuid not null unique references public.daily_learning_article_drafts(id) on delete restrict,
  content_id text not null,
  draft_version integer not null check (draft_version > 0),
  decision text not null check (decision in ('approved', 'changes_requested', 'deferred', 'rejected')),
  review_note text not null default '' check (char_length(review_note) <= 4000),
  decided_at timestamptz not null default now()
);

create index daily_learning_review_decisions_owner_date_idx
  on public.daily_learning_review_decisions (owner_id, decided_at desc);

alter table public.daily_learning_review_decisions enable row level security;
revoke all on public.daily_learning_review_decisions from public, anon, authenticated;
grant select, insert on public.daily_learning_review_decisions to authenticated;

create policy daily_learning_review_decisions_owner_select
  on public.daily_learning_review_decisions for select
  to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.island_owner_accounts owner
      where owner.user_id = (select auth.uid())
    )
  );

create policy daily_learning_review_decisions_owner_insert
  on public.daily_learning_review_decisions for insert
  to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1
      from public.daily_learning_article_drafts draft
      where draft.id = daily_learning_review_decisions.draft_id
        and draft.owner_id = (select auth.uid())
        and draft.package_schema_version = 2
        and draft.content_id = daily_learning_review_decisions.content_id
        and draft.version = daily_learning_review_decisions.draft_version
        and draft.production_status = 'awaiting_owner_review'
    )
  );

create or replace function public.protect_daily_learning_review_decision()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'Daily-learning review decisions are immutable.';
end;
$$;

revoke all on function public.protect_daily_learning_review_decision() from public;

create trigger protect_daily_learning_review_decision_before_change
before update or delete on public.daily_learning_review_decisions
for each row execute function public.protect_daily_learning_review_decision();

create or replace function public.protect_daily_learning_v2_draft()
returns trigger language plpgsql set search_path = '' as $$
begin
  if old.package_schema_version <> 2 then
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

  if new.status = 'approved' and (
    new.production_status <> 'owner_approved'
    or new.approved_content is distinct from new.content
  ) then
    raise exception 'V2 approval requires an owner decision and matching snapshot.';
  end if;
  return new;
end;
$$;

revoke all on function public.protect_daily_learning_v2_draft() from public;

create trigger protect_daily_learning_v2_draft_before_update
before update on public.daily_learning_article_drafts
for each row execute function public.protect_daily_learning_v2_draft();

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
    or target.production_status <> 'awaiting_owner_review' then
    raise exception 'Draft is not available for owner review.';
  end if;

  insert into public.daily_learning_review_decisions (
    owner_id, draft_id, content_id, draft_version, decision, review_note
  ) values (
    target.owner_id, target.id, target.content_id, target.version,
    p_decision, coalesce(p_note, '')
  );

  if p_decision = 'approved' then
    update public.daily_learning_article_drafts
    set production_status = 'owner_approved',
        status = 'approved',
        review_note = coalesce(p_note, ''),
        image_permission_verified = true,
        historical_sources_verified = true,
        approved_content = content
    where id = target.id;
  end if;
end;
$$;

revoke all on function public.review_daily_learning_v2(uuid, text, text) from public;
grant execute on function public.review_daily_learning_v2(uuid, text, text) to authenticated;

alter table public.daily_learning_publications
  add column package_schema_version smallint,
  add column content_id text,
  add column package_snapshot jsonb;

create unique index daily_learning_publications_owner_content_version_v2_idx
  on public.daily_learning_publications (owner_id, content_id, draft_version)
  where package_schema_version = 2;

drop policy daily_learning_publications_owner_insert_approved
  on public.daily_learning_publications;

grant insert (
  owner_id, draft_id, source_id, draft_version, source_record, content,
  package_schema_version, content_id, package_snapshot
) on public.daily_learning_publications to authenticated;

create policy daily_learning_publications_owner_insert_approved_v2
  on public.daily_learning_publications for insert
  to authenticated
  with check (
    owner_id = (select auth.uid())
    and package_schema_version = 2
    and content_id is not null
    and jsonb_typeof(package_snapshot) = 'object'
    and exists (
      select 1
      from public.daily_learning_article_drafts draft
      where draft.id = daily_learning_publications.draft_id
        and draft.owner_id = (select auth.uid())
        and draft.package_schema_version = 2
        and draft.production_status = 'owner_approved'
        and draft.status = 'approved'
        and draft.content_id = daily_learning_publications.content_id
        and draft.source_id = daily_learning_publications.source_id
        and draft.version = daily_learning_publications.draft_version
        and draft.source_record = daily_learning_publications.source_record
        and draft.approved_content = daily_learning_publications.content
        and jsonb_build_object(
          'schema_version', draft.package_schema_version,
          'content_id', draft.content_id,
          'content_type', draft.content_type,
          'planning', draft.planning,
          'work', draft.work_record,
          'article', draft.content,
          'claims', draft.claims,
          'assets', draft.assets,
          'quality', draft.quality
        ) = daily_learning_publications.package_snapshot
    )
  );

comment on table public.daily_learning_review_decisions is
  'Immutable owner decisions bound to a specific PRD-compliant daily-learning content version.';
