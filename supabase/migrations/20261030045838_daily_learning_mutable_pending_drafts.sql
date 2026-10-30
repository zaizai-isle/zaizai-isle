create or replace function public.protect_daily_learning_v2_draft()
returns trigger language plpgsql set search_path = '' as $$
begin
  if old.package_schema_version <> 2 then
    return new;
  end if;

  -- Unreviewed working copies can change without allocating a content version.
  -- Reviewed/approved/published snapshots retain the original protection below.
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

