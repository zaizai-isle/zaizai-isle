-- Banana AI 额度控制（供应商预算护栏）
-- 岛主在 Supabase SQL Editor 整段执行。
-- 设计：
--   * 额度按 UTC 日期滚动（与 Cloudflare 免费额度重置口径一致），档位由调用方传入
--     （per-client 与 global 两层），事务内先查全部档位、全部有余额才扣减（all-or-nothing）。
--   * 幂等：同一 request_id 最多扣一次；扣减成功后请求若在网络层丢失，重试只放行不再扣减。
--   * 额度不足时不落账（删除预占的 request 行），额度重置后同一请求可再次消费且仍只扣一次。
--   * 仅 service_role 可执行；供应商调用只发生在 banana-ai Edge Function 内。
begin;

create schema if not exists banana_private;
revoke all on schema banana_private from public, anon, authenticated;
grant usage on schema banana_private to service_role;

create table banana_private.quota_windows (
  scope text not null primary key,
  window_day date not null,
  used integer not null default 0 check (used >= 0)
);
create table banana_private.quota_requests (
  request_id uuid not null primary key,
  scopes text[] not null default '{}',
  created_at timestamptz not null default now()
);
alter table banana_private.quota_windows enable row level security;
alter table banana_private.quota_requests enable row level security;
revoke all on all tables in schema banana_private from public, anon, authenticated;
grant select, insert, update, delete on banana_private.quota_windows to service_role;
grant select, insert, update, delete on banana_private.quota_requests to service_role;

create function banana_private.consume_ai_quota(p_tiers jsonb, p_request_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  tier jsonb;
  v_scope text;
  v_limit integer;
  v_used integer;
  wday date := (now() at time zone 'UTC')::date;
  v_scopes text[] := '{}';
  v_limits integer[] := '{}';
  v_remaining jsonb := '{}'::jsonb;
  i integer;
begin
  if p_tiers is null or jsonb_typeof(p_tiers) <> 'array' or jsonb_array_length(p_tiers) = 0 then
    return jsonb_build_object('ok', false, 'error', 'tiers 参数无效');
  end if;

  -- 全站单锁：并发消费在此串行化，杜绝超扣。香蕉额度量级极小，锁开销可忽略。
  perform pg_advisory_xact_lock(hashtextextended('banana-ai-quota', 0));

  -- 幂等预占：request_id 已存在说明本请求此前已扣减过，放行且不再扣。
  if p_request_id is not null then
    insert into banana_private.quota_requests(request_id) values (p_request_id) on conflict do nothing;
    if not found then
      return jsonb_build_object('ok', true, 'duplicate', true);
    end if;
  end if;

  for tier in select * from jsonb_array_elements(p_tiers) loop
    if jsonb_typeof(tier) <> 'object' then
      return jsonb_build_object('ok', false, 'error', 'tiers 参数无效');
    end if;
    v_scope := nullif(trim(coalesce(tier->>'scope', '')), '');
    v_limit := case when jsonb_typeof(tier->'limit') = 'number' then (tier->>'limit')::integer end;
    if v_scope is null or v_limit is null or v_limit < 0 then
      return jsonb_build_object('ok', false, 'error', 'tiers 参数无效');
    end if;
    if not (v_scope = any (v_scopes)) then
      v_scopes := array_append(v_scopes, v_scope);
      v_limits := array_append(v_limits, v_limit);
    end if;
  end loop;

  -- 跨日清零（不算消费），缺失档位建行。
  update banana_private.quota_windows
     set used = 0, window_day = wday
   where scope = any (v_scopes) and window_day < wday;
  insert into banana_private.quota_windows(scope, window_day, used)
  select s, wday, 0 from unnest(v_scopes) as s
  on conflict (scope) do nothing;

  -- 全部档位都有余额才扣（all-or-nothing），避免外层档位被无谓消耗。
  for i in 1 .. array_length(v_scopes, 1) loop
    select used into v_used from banana_private.quota_windows where scope = v_scopes[i];
    if v_used >= v_limits[i] then
      if p_request_id is not null then
        delete from banana_private.quota_requests where request_id = p_request_id;
      end if;
      return jsonb_build_object('ok', false, 'exhausted_scope', v_scopes[i], 'limit', v_limits[i], 'remaining', 0);
    end if;
  end loop;

  update banana_private.quota_windows set used = used + 1 where scope = any (v_scopes);
  if p_request_id is not null then
    update banana_private.quota_requests set scopes = v_scopes where request_id = p_request_id;
  end if;

  for i in 1 .. array_length(v_scopes, 1) loop
    select used into v_used from banana_private.quota_windows where scope = v_scopes[i];
    v_remaining := jsonb_set(v_remaining, array[v_scopes[i]], to_jsonb(greatest(v_limits[i] - v_used, 0)));
  end loop;

  return jsonb_build_object('ok', true, 'duplicate', false, 'remaining', v_remaining);
end $$;
revoke all on function banana_private.consume_ai_quota(jsonb, uuid) from public, anon, authenticated;
grant execute on function banana_private.consume_ai_quota(jsonb, uuid) to service_role;

create function public.consume_banana_ai_quota(p_tiers jsonb, p_request_id uuid default null)
returns jsonb language sql security definer set search_path = '' as $$
  select banana_private.consume_ai_quota(p_tiers, p_request_id);
$$;
revoke all on function public.consume_banana_ai_quota(jsonb, uuid) from public, anon, authenticated;
grant execute on function public.consume_banana_ai_quota(jsonb, uuid) to service_role;

-- 运维：幂等台账只需保留 48 小时以上（覆盖前端一次重试），可定期执行：
--   delete from banana_private.quota_requests where created_at < now() - interval '2 days';
notify pgrst, 'reload schema';
commit;
