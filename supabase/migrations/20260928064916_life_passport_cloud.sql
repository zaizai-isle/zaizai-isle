begin;
create schema if not exists passport_private;
revoke all on schema passport_private from public, anon, authenticated;
grant usage on schema passport_private to authenticated, anon;

create table passport_private.passports (
  id uuid primary key,
  owner_id uuid not null unique references auth.users(id),
  record jsonb not null,
  recovery_hash bytea not null,
  write_window timestamptz not null default now(),
  write_count integer not null default 0
);
create table passport_private.members (
  passport_id uuid not null references passport_private.passports(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key(passport_id, user_id)
);
create index passport_members_user on passport_private.members(user_id);
create table passport_private.assets (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references passport_private.passports(id),
  created_at timestamptz not null default now(),
  retired boolean not null default false,
  unique(passport_id,id)
);
create table passport_private.stamps (
  passport_id uuid not null references passport_private.passports(id),
  id text not null check (id ~ '^[a-zA-Z0-9_-]{1,100}$'),
  record jsonb not null check (octet_length(record::text) <= 24000),
  asset uuid,
  width integer not null default 0 check (width between 0 and 1600),
  height integer not null default 0 check (height between 0 and 1600),
  operation uuid not null,
  primary key(passport_id, id),
  foreign key(passport_id,asset) references passport_private.assets(passport_id,id)
);
create unique index passport_asset_once on passport_private.stamps(asset) where asset is not null;
create table passport_private.recovery_attempts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_start timestamptz not null default now(),
  attempts integer not null default 0
);
alter table passport_private.passports enable row level security;
alter table passport_private.members enable row level security;
alter table passport_private.stamps enable row level security;
alter table passport_private.assets enable row level security;
alter table passport_private.recovery_attempts enable row level security;
revoke all on all tables in schema passport_private from public, anon, authenticated;

create function passport_private.api(action text, payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  pid uuid := nullif(payload->>'passportId','')::uuid;
  p passport_private.passports%rowtype;
  s passport_private.stamps%rowtype;
  a uuid;
  secret text := payload->>'secret';
  n integer;
  d jsonb;
  rec jsonb;
  t text := to_char(clock_timestamp() at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"');
  sid text := payload->>'id';
begin
  if uid is null then raise exception '请先建立匿名身份'; end if;
  if octet_length(payload::text) > 30000 then raise exception '请求内容过大'; end if;
  if action = 'home' then
    select x.* into p from passport_private.passports x
      join passport_private.members m on m.passport_id=x.id
      where m.user_id=uid and (pid is null or x.id=pid)
      order by x.record->>'createdAt' limit 1;
    if p.id is null and pid is not null then raise exception '当前设备无权访问这本护照，请使用恢复密钥'; end if;
    return p.record;
  elsif action = 'create' then
    perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));
    select * into p from passport_private.passports where owner_id=uid;
    if found then return p.record; end if;
    if pid is null or secret is null or secret !~ '^[0-9a-f]{64}$' then raise exception '恢复密钥格式不正确'; end if;
    rec := jsonb_build_object('id',pid,'name','我的人生护照','declaration','这一程，确实发生过。','coverTheme','island-paper',
      'passportNumber','ZAIZAI-' || upper(left(pid::text,8)),'createdAt',t,'updatedAt',t);
    insert into passport_private.passports(id,owner_id,record,recovery_hash) values(pid,uid,rec,sha256(convert_to(secret,'UTF8')));
    insert into passport_private.members values(pid,uid);
    return rec;
  elsif action = 'recover' then
    insert into passport_private.recovery_attempts(user_id) values(uid) on conflict do nothing;
    update passport_private.recovery_attempts set
      attempts=case when window_start < now()-interval '1 minute' then 1 else attempts+1 end,
      window_start=case when window_start < now()-interval '1 minute' then now() else window_start end
      where user_id=uid returning attempts into n;
    if n>10 then return jsonb_build_object('error','恢复尝试过于频繁，请一分钟后重试'); end if;
    select * into p from passport_private.passports where id=pid and recovery_hash=sha256(convert_to(secret,'UTF8'));
    if not found then return jsonb_build_object('error','恢复密钥无效或已失效'); end if;
    if (select count(*) from passport_private.members where user_id=uid)>=20
      and not exists(select 1 from passport_private.members where user_id=uid and passport_id=pid) then
      return jsonb_build_object('error','当前设备关联的护照数量已达上限');
    end if;
    insert into passport_private.members values(pid,uid) on conflict do nothing;
    return p.record;
  end if;

  if not exists(select 1 from passport_private.members where user_id=uid and passport_id=pid) then
    raise exception '当前设备无权访问这本护照';
  end if;
  if action='list' then
    return (select coalesce(jsonb_agg(jsonb_build_object('record',record,'asset',asset,'width',width,'height',height,'operation',operation)
      order by record->>'date' desc,record->>'createdAt' desc,id), '[]'::jsonb) from passport_private.stamps where passport_id=pid);
  elsif action='get' then
    select * into s from passport_private.stamps where passport_id=pid and id=sid;
    if not found then return null; end if;
    return jsonb_build_object('record',s.record,'asset',s.asset,'width',s.width,'height',s.height,'operation',s.operation);
  elsif action='check-key' then
    return (select to_jsonb(recovery_hash=sha256(convert_to(secret,'UTF8'))) from passport_private.passports where id=pid);
  end if;

  select * into p from passport_private.passports where id=pid for update;
  if p.write_window < now()-interval '1 minute' then
    update passport_private.passports set write_window=now(),write_count=1 where id=pid;
  elsif p.write_count >= 120 then raise exception '操作过于频繁，请一分钟后重试';
  else update passport_private.passports set write_count=write_count+1 where id=pid;
  end if;

  if action='rotate' then
    if secret is null or secret !~ '^[0-9a-f]{64}$' then raise exception '恢复密钥格式不正确'; end if;
    update passport_private.passports set recovery_hash=sha256(convert_to(secret,'UTF8')) where id=pid;
    return 'true'::jsonb;
  elsif action='reserve' then
    if (select count(*) from passport_private.assets where passport_id=pid)>=110 then raise exception '照片空间已达上限，请稍后重试或删除不需要的记录'; end if;
    insert into passport_private.assets(passport_id) values(pid) returning id into a;
    return to_jsonb(a);
  elsif action='garbage' then
    update passport_private.assets x set retired=true where passport_id=pid and created_at<now()-interval '1 hour'
      and not exists(select 1 from passport_private.stamps used_stamp where used_stamp.asset=x.id);
    return (select coalesce(jsonb_agg(id),'[]'::jsonb) from passport_private.assets where passport_id=pid and retired);
  elsif action='release' then
    a := (payload->>'asset')::uuid;
    delete from passport_private.assets x where id=a and passport_id=pid and retired
      and not exists(select 1 from storage.objects o where o.bucket_id='life-passport-photos' and o.name like pid::text || '/' || a::text || '/%');
    return 'true'::jsonb;
  elsif action='delete' then
    select * into s from passport_private.stamps where passport_id=pid and id=sid;
    if not found then return 'true'::jsonb; end if;
    if (payload->>'expected') is distinct from (s.record->>'updatedAt') then raise exception '记录已在其他设备修改，请刷新后重试'; end if;
    delete from passport_private.stamps where passport_id=pid and id=sid;
    update passport_private.assets set retired=true where id=s.asset;
    return 'true'::jsonb;
  elsif action='save' then
    select * into s from passport_private.stamps where passport_id=pid and id=sid;
    if s.id is not null and ((payload->>'importOnly')::boolean is true or s.operation=(payload->>'operation')::uuid) then
      return jsonb_build_object('record',s.record,'asset',s.asset,'width',s.width,'height',s.height,'operation',s.operation);
    end if;
    if (payload->>'expected') is distinct from (s.record->>'updatedAt') then raise exception '记录已在其他设备修改或删除，请刷新后重试'; end if;
    if s.id is null and (select count(*) from passport_private.stamps where passport_id=pid)>=100 then raise exception '每本护照最多保存 100 枚印章'; end if;
    d := payload->'draft';
    if d is null or jsonb_typeof(d)<>'object' or length(trim(coalesce(d->>'title','')))=0
      or length(d->>'title')>200 or length(coalesce(d->>'note',''))>5000
      or length(coalesce(d->>'location',''))>300 or length(coalesce(d->>'category',''))>100
      or coalesce(d->>'style','') not in ('classic','date','journal')
      or coalesce(d->>'texture','') not in ('original','fade','film','photocopy','experimental')
      or coalesce(d->>'date','') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception '记录字段不完整或超出长度限制'; end if;
    perform (d->>'date')::date;
    a := nullif(payload->>'asset','')::uuid;
    if a is not null then
      if not exists(select 1 from passport_private.assets where id=a and passport_id=pid and not retired and created_at>now()-interval '1 hour')
        or (select count(*) from storage.objects where bucket_id='life-passport-photos' and name in (pid::text || '/' || a::text || '/source.webp',pid::text || '/' || a::text || '/thumbnail.webp'))<>2 then
        raise exception '照片上传未完成或已过期，请重试';
      end if;
    end if;
    rec := jsonb_build_object('id',sid,'passportId',pid,'title',d->>'title','category',coalesce(d->>'category','其他'),
      'icon',left(coalesce(d->>'icon','✦'),16),'achievementId',d->>'achievementId','date',d->>'date','note',coalesce(d->>'note',''),
      'location',coalesce(d->>'location',''),'style',d->>'style','texture',d->>'texture','experimentalFilter',coalesce(d->>'experimentalFilter','ascii'),
      'hasPhoto',a is not null,'createdAt',coalesce(s.record->>'createdAt',case when (payload->>'importOnly')::boolean then ((payload->>'createdAt')::timestamptz)::text end,t),'updatedAt',t);
    insert into passport_private.stamps(passport_id,id,record,asset,width,height,operation)
      values(pid,sid,rec,a,coalesce((payload->>'width')::integer,0),coalesce((payload->>'height')::integer,0),(payload->>'operation')::uuid)
      on conflict(passport_id,id) do update set record=excluded.record,asset=excluded.asset,width=excluded.width,height=excluded.height,operation=excluded.operation;
    if s.asset is distinct from a then update passport_private.assets set retired=true where id=s.asset; end if;
    update passport_private.passports set record=jsonb_set(record,'{updatedAt}',to_jsonb(t)) where id=pid;
    return jsonb_build_object('record',rec,'asset',a,'width',coalesce((payload->>'width')::integer,0),'height',coalesce((payload->>'height')::integer,0),'operation',payload->'operation');
  end if;
  raise exception '未知的护照操作';
end $$;
revoke all on function passport_private.api(text,jsonb) from public,anon,authenticated;
grant execute on function passport_private.api(text,jsonb) to authenticated;

create function public.life_passport_api(action text,payload jsonb default '{}'::jsonb)
returns jsonb language sql security invoker set search_path='' as $$ select passport_private.api(action,payload); $$;
revoke all on function public.life_passport_api(text,jsonb) from public,anon;
grant execute on function public.life_passport_api(text,jsonb) to authenticated;

create function passport_private.asset_access(object_name text, access_mode text)
returns boolean language sql stable security definer set search_path='' as $$
  select auth.uid() is not null and exists (
    select 1 from passport_private.assets a join passport_private.members m on m.passport_id=a.passport_id
    where m.user_id=auth.uid()
      and object_name in (a.passport_id::text || '/' || a.id::text || '/source.webp',a.passport_id::text || '/' || a.id::text || '/thumbnail.webp')
      and case access_mode when 'read' then true when 'insert' then not a.retired and a.created_at>now()-interval '1 hour'
        when 'delete' then a.retired else false end
  );
$$;
revoke all on function passport_private.asset_access(text,text) from public,anon;
grant execute on function passport_private.asset_access(text,text) to authenticated, anon;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
  values('life-passport-photos','life-passport-photos',false,2097152,array['image/webp']);
create policy passport_photo_read on storage.objects for select to authenticated
  using(bucket_id='life-passport-photos' and passport_private.asset_access(name,'read'));
create policy passport_photo_insert on storage.objects for insert to authenticated
  with check(bucket_id='life-passport-photos' and passport_private.asset_access(name,'insert'));
create policy passport_photo_delete on storage.objects for delete to authenticated
  using(bucket_id='life-passport-photos' and passport_private.asset_access(name,'delete'));
-- Restrictive policy prevents unrelated broad Storage policies from exposing this bucket.
create policy passport_photo_guard on storage.objects as restrictive for all to public
  using(bucket_id<>'life-passport-photos' or passport_private.asset_access(name,'read'))
  with check(bucket_id<>'life-passport-photos' or passport_private.asset_access(name,'insert'));
-- Immutable objects cannot be overwritten through another permissive UPDATE policy.
create policy passport_photo_no_update on storage.objects as restrictive for update to public
  using(bucket_id<>'life-passport-photos') with check(bucket_id<>'life-passport-photos');
create policy passport_photo_delete_guard on storage.objects as restrictive for delete to public
  using(bucket_id<>'life-passport-photos' or passport_private.asset_access(name,'delete'));
notify pgrst,'reload schema';
commit;
