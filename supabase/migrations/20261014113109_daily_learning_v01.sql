create table public.island_owner_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- The permanent account is provisioned in Supabase Auth, never from the public site.
insert into public.island_owner_accounts (user_id)
values ('ac237c2c-4be3-461c-a2e2-697118287ced');

create table public.daily_learning_responses (
  user_id uuid not null references public.island_owner_accounts(user_id) on delete cascade,
  entry_id text not null check (char_length(entry_id) between 1 and 120),
  reaction text not null check (reaction in ('interesting', 'neutral', 'unclear')),
  note text not null default '' check (char_length(note) <= 1000),
  viewed_snapshot jsonb not null check (jsonb_typeof(viewed_snapshot) = 'object' and pg_column_size(viewed_snapshot) <= 20000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, entry_id)
);

alter table public.island_owner_accounts enable row level security;
alter table public.daily_learning_responses enable row level security;

revoke all on public.island_owner_accounts from public, anon, authenticated;
revoke all on public.daily_learning_responses from public, anon, authenticated;
grant select on public.island_owner_accounts to authenticated;
grant select, insert, update on public.daily_learning_responses to authenticated;

create policy island_owner_self_read on public.island_owner_accounts
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy daily_learning_owner_read on public.daily_learning_responses
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (select 1 from public.island_owner_accounts owner where owner.user_id = (select auth.uid()))
  );

create policy daily_learning_owner_insert on public.daily_learning_responses
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.island_owner_accounts owner where owner.user_id = (select auth.uid()))
  );

create policy daily_learning_owner_update on public.daily_learning_responses
  for update to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (select 1 from public.island_owner_accounts owner where owner.user_id = (select auth.uid()))
  )
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.island_owner_accounts owner where owner.user_id = (select auth.uid()))
  );

comment on table public.island_owner_accounts is 'Server-managed allowlist for the permanent island-owner account.';
comment on table public.daily_learning_responses is 'Private daily-learning feedback. Passport data remains in its own schema.';
