import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const owner = "ac237c2c-4be3-461c-a2e2-697118287ced";
const other = "00000000-0000-4000-8000-000000000002";

test("daily learning: owner allowlist and row isolation", async () => {
  const db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth; create table auth.users(id uuid primary key);
    insert into auth.users values('${owner}'),('${other}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth to authenticated,anon;
    grant execute on function auth.uid() to authenticated,anon;
  `);
  const migration = await readFile(new URL("../supabase/migrations/20261014113109_daily_learning_v01.sql", import.meta.url), "utf8");
  await db.exec(migration);
  async function asUser(id, role = "authenticated") {
    await db.exec(`reset role; set role ${role}`);
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
  }

  await asUser(owner);
  assert.equal((await db.query("select * from public.island_owner_accounts")).rows.length, 1);
  await db.query("insert into public.daily_learning_responses(user_id,entry_id,reaction,note,viewed_snapshot) values($1,'entry-a','interesting','被线条吸引','{}')", [owner]);
  assert.equal((await db.query("select reaction from public.daily_learning_responses")).rows[0].reaction, "interesting");
  await db.query("update public.daily_learning_responses set reaction='unclear' where entry_id='entry-a'");

  await asUser(other);
  assert.equal((await db.query("select * from public.island_owner_accounts")).rows.length, 0);
  assert.equal((await db.query("select * from public.daily_learning_responses")).rows.length, 0);
  await assert.rejects(db.query("insert into public.daily_learning_responses(user_id,entry_id,reaction,viewed_snapshot) values($1,'entry-b','neutral','{}')", [other]), /row-level security/);
  await assert.rejects(db.query("insert into public.daily_learning_responses(user_id,entry_id,reaction,viewed_snapshot) values($1,'entry-b','neutral','{}')", [owner]), /row-level security/);

  await asUser("", "anon");
  await assert.rejects(db.query("select * from public.daily_learning_responses"), /permission denied/);
  await db.close();
});

test("daily learning: private drafts require owner review and approved versions are immutable", async () => {
  const db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth; create table auth.users(id uuid primary key);
    insert into auth.users values('${owner}'),('${other}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth to authenticated,anon;
    grant execute on function auth.uid() to authenticated,anon;
  `);
  const baseMigration = await readFile(new URL("../supabase/migrations/20261014113109_daily_learning_v01.sql", import.meta.url), "utf8");
  const draftMigration = await readFile(new URL("../supabase/migrations/20261019110000_daily_learning_drafts_review.sql", import.meta.url), "utf8");
  await db.exec(baseMigration);
  await db.exec(draftMigration);
  async function asUser(id, role = "authenticated") {
    await db.exec(`reset role; set role ${role}`);
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
  }

  await asUser(owner);
  const inserted = await db.query(`
    insert into public.daily_learning_article_drafts(owner_id,source_id,source_record,content)
    values($1,'smk:test','{"title":"Work"}','{"title":"Draft"}') returning id
  `, [owner]);
  const draftId = inserted.rows[0].id;
  await assert.rejects(
    db.query("update public.daily_learning_article_drafts set status='approved' where id=$1", [draftId]),
    /approved_requires_checks|Approval requires verified sources/
  );
  await db.query(`
    update public.daily_learning_article_drafts
    set status='approved', image_permission_verified=true, historical_sources_verified=true,
        approved_content=content
    where id=$1
  `, [draftId]);
  await assert.rejects(
    db.query("update public.daily_learning_article_drafts set review_note='changed' where id=$1", [draftId]),
    /immutable/
  );

  await asUser(other);
  assert.equal((await db.query("select * from public.daily_learning_article_drafts")).rows.length, 0);
  await assert.rejects(
    db.query("insert into public.daily_learning_article_drafts(owner_id,source_id,source_record,content) values($1,'smk:other','{}','{}')", [other]),
    /row-level security/
  );

  await asUser("", "anon");
  await assert.rejects(db.query("select * from public.daily_learning_article_drafts"), /permission denied/);
  await db.close();
});
