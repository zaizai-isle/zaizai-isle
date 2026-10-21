-- Close reviewed v2 versions after a non-approval decision. The package remains
-- immutable; any requested change must be delivered as a new version.
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
    or target.production_status <> 'awaiting_owner_review'
    or target.status <> 'pending_review' then
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
  elsif p_decision = 'changes_requested' then
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
    update public.daily_learning_article_drafts
    set status = 'changes_requested',
        review_note = coalesce(p_note, '')
    where id = target.id;
  end if;
end;
$$;

revoke all on function public.review_daily_learning_v2(uuid, text, text) from public;
grant execute on function public.review_daily_learning_v2(uuid, text, text) to authenticated;
