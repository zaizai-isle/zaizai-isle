import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const userA = '00000000-0000-4000-8000-000000000001';
const userB = '00000000-0000-4000-8000-000000000002';
const passportId = '10000000-0000-4000-8000-000000000001';
const secret = 'a'.repeat(64);
const draft = { title: '第一次抵达', date: '2026-09-28', category: '生活', icon: '✦', note: '留下回忆', location: '', style: 'classic', texture: 'original', experimentalFilter: 'ascii' };

test('cloud passport: identity isolation, recovery, immutable photos, conflicts and quotas', async (t) => {
  const db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key);
    insert into auth.users values('${userA}'),('${userB}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth,storage to authenticated,anon;
    grant execute on function auth.uid() to authenticated,anon;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(bucket_id text,name text,primary key(bucket_id,name));
    alter table storage.objects enable row level security;
    grant select,insert,update,delete on storage.objects to authenticated,anon;
    create policy unrelated_broad_policy on storage.objects for all to public using(true) with check(true);
  `);
  await db.exec(await readFile(new URL('../supabase/migrations/20260928064916_life_passport_cloud.sql', import.meta.url), 'utf8'));
  async function asUser(id, role = 'authenticated') {
    await db.exec(`reset role; set role ${role}`);
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
  }
  async function api(action, payload = {}) {
    return (await db.query('select public.life_passport_api($1,$2::jsonb) as result', [action, JSON.stringify({ passportId, ...payload })])).rows[0].result;
  }
  let first;
  await t.test('anonymous session owns one passport; private tables cannot be bypassed', async () => {
    await asUser(userA);
    const result = await api('create', { secret });
    assert.equal(result.id, passportId);
    assert.equal((await api('create', { passportId: crypto.randomUUID(), secret })).id, passportId);
    await assert.rejects(db.query('select * from passport_private.passports'), /permission denied/);
    await assert.rejects(db.query('insert into passport_private.members values ($1,$2)', [passportId,userB]), /permission denied/);
  });
  await t.test('save, retry, stale edit and stale delete', async () => {
    const operation = crypto.randomUUID();
    first = await api('save', { id: 'stamp-a', draft, operation });
    assert.equal(first.record.title, draft.title);
    assert.deepEqual(await api('save', { id: 'stamp-a', draft, operation }), first);
    await assert.rejects(api('save', { id: 'stamp-a', draft, operation: crypto.randomUUID() }), /其他设备/);
    await assert.rejects(api('delete', { id: 'stamp-a', expected: 'stale' }), /其他设备/);
    const imported = await api('save', { id: 'stamp-a', draft: { ...draft, title: '不得覆盖' }, operation: crypto.randomUUID(), importOnly: true });
    assert.equal(imported.record.title, draft.title);
  });
  let asset;
  await t.test('photo reservations restrict paths and forbid overwrite/live deletion', async () => {
    asset = await api('reserve');
    for (const file of ['source.webp','thumbnail.webp']) {
      await db.query('insert into storage.objects values($1,$2)', ['life-passport-photos',`${passportId}/${asset}/${file}`]);
    }
    await assert.rejects(db.query('insert into storage.objects values($1,$2)', ['life-passport-photos',`${passportId}/${crypto.randomUUID()}/source.webp`]), /row-level security/);
    const photo = await api('save', { id: 'stamp-photo', draft, operation: crypto.randomUUID(), asset, width: 100, height: 100 });
    assert.equal(photo.record.hasPhoto, true);
    assert.equal((await db.query('update storage.objects set name=name returning *')).rows.length, 0);
    assert.equal((await db.query('delete from storage.objects returning *')).rows.length, 0);
    const incomplete = await api('reserve');
    await assert.rejects(api('save', { id: 'stamp-photo', draft, operation: crypto.randomUUID(), expected: photo.record.updatedAt, asset: incomplete }), /上传未完成/);
    assert.equal((await api('get', { id: 'stamp-photo' })).asset, asset);
  });
  await t.test('another anonymous user cannot read/write/delete records or photos', async () => {
    await asUser(userB);
    for (const action of ['list','get','save','delete','rotate','reserve']) {
      await assert.rejects(api(action,{ id: 'stamp-a', secret }), /无权访问/);
    }
    assert.equal((await db.query('select * from storage.objects')).rows.length, 0);
    await assert.rejects(db.query('insert into storage.objects values($1,$2)', ['life-passport-photos',`${passportId}/${asset}/other.webp`]), /row-level security/);
    assert.match((await api('recover',{ secret: 'b'.repeat(64) })).error, /无效/);
  });
  await t.test('recovery grants a new device access; rotation invalidates old keys only', async () => {
    assert.equal((await api('recover',{ secret })).id, passportId);
    assert.equal((await api('list')).length, 2);
    assert.equal((await db.query('select * from storage.objects')).rows.length, 2);
    await api('rotate', { secret: 'c'.repeat(64) });
    assert.equal(await api('check-key',{ secret }), false);
    assert.match((await api('recover',{ secret })).error, /无效/);
    await asUser(userA);
    assert.equal((await api('list')).length, 2);
  });
  await t.test('failed recovery attempts persist and throttle', async () => {
    for(let i=0;i<10;i++) await api('recover',{ secret: 'd'.repeat(64) });
    assert.match((await api('recover',{ secret: 'd'.repeat(64) })).error, /频繁/);
  });
  await t.test('deletion retires photos for cleanup without touching other records', async () => {
    const photo = await api('get',{ id:'stamp-photo' });
    await api('delete',{ id:'stamp-photo', expected: photo.record.updatedAt });
    assert.ok((await api('garbage')).includes(asset));
    assert.equal((await db.query('delete from storage.objects returning *')).rows.length,2);
    await api('release',{asset});
    assert.equal(await api('get',{id:'stamp-photo'}),null);
    assert.equal((await api('get',{id:'stamp-a'})).record.title,draft.title);
  });
  await t.test('server bounds record count, input length and photo reservations', async () => {
    await assert.rejects(api('save',{id:'stamp-large',draft:{...draft,note:'大'.repeat(5001)},operation:crypto.randomUUID()}),/长度限制/);
    for(let i=1;i<100;i++) {
      // Reset only the write-rate window as administrator; record quota stays enforced.
      await db.exec('reset role; update passport_private.passports set write_count=0');
      await asUser(userA);
      await api('save',{id:`stamp-${i}`,draft,operation:crypto.randomUUID()});
    }
    await assert.rejects(api('save',{id:'stamp-over',draft,operation:crypto.randomUUID()}),/100/);
    await db.exec(`reset role; insert into passport_private.assets(passport_id) select '${passportId}' from generate_series(1,109);`);
    await asUser(userA);
    await assert.rejects(api('reserve'),/空间已达上限/);
    await db.exec('reset role; update passport_private.passports set write_count=120');
    await asUser(userA);
    await assert.rejects(api('rotate',{secret}),/频繁/);
  });
  await t.test('unauthenticated visitors cannot call the API or read photos', async () => {
    await asUser('', 'anon');
    await assert.rejects(api('list'),/permission denied/);
    // Even pre-existing permissive Storage policies must not expose this bucket.
    const result = await db.query('select * from storage.objects');
    assert.equal(result.rows.length,0);
  });
  await db.close();
});
