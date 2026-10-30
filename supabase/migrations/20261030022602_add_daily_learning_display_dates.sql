alter table public.daily_learning_publications
  add column display_date date not null
  default ((now() at time zone 'Asia/Pontianak')::date);

create index daily_learning_publications_display_date_idx
  on public.daily_learning_publications (display_date desc, published_at desc);

create or replace function public.protect_learning_publication()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE'
    and (to_jsonb(new) - 'display_date') = (to_jsonb(old) - 'display_date') then
    return new;
  end if;

  raise exception 'Published learning versions are immutable.';
end;
$$;

with ordered_publications as (
  select
    id,
    row_number() over (
      order by
        case
          when package_snapshot #>> '{planning,plan_issue}' = 'research-2026-10-19' then 0
          when package_snapshot #>> '{planning,plan_issue}' ~ '^\d{2}$' then 1
          when package_snapshot #>> '{planning,plan_issue}' = 'exploration-2026-10-28' then 2
          else 3
        end,
        case
          when package_snapshot #>> '{planning,plan_issue}' ~ '^\d{2}$'
            then (package_snapshot #>> '{planning,plan_issue}')::integer
          else 0
        end,
        published_at,
        id
    ) as position,
    count(*) over () as publication_count
  from public.daily_learning_publications
)
update public.daily_learning_publications publication
set display_date = date '2026-10-30'
  - (ordered_publications.publication_count - ordered_publications.position)::integer
from ordered_publications
where publication.id = ordered_publications.id;

comment on column public.daily_learning_publications.display_date is
  'Editorial display date in Asia/Pontianak; independent from the immutable publication audit timestamp.';
