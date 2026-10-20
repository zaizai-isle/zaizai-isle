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
  const publicationMigration = await readFile(new URL("../supabase/migrations/20261020025338_daily_learning_publications.sql", import.meta.url), "utf8");
  const v2Migration = await readFile(new URL("../supabase/migrations/20261020073800_daily_learning_v2_contract.sql", import.meta.url), "utf8");
  await db.exec(baseMigration);
  await db.exec(draftMigration);
  await db.exec(publicationMigration);
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
    db.query(`
      insert into public.daily_learning_publications(owner_id,draft_id,source_id,draft_version,source_record,content)
      values($1,$2,'smk:test',1,'{"title":"Work"}','{"title":"Draft"}')
    `, [owner,draftId]),
    /row-level security/
  );
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
  await assert.rejects(
    db.query(`
      insert into public.daily_learning_publications(owner_id,draft_id,source_id,draft_version,source_record,content)
      values($1,$2,'smk:tampered',1,'{"title":"Changed"}','{"title":"Changed"}')
    `, [owner,draftId]),
    /row-level security/
  );
  await db.query(`
    insert into public.daily_learning_publications(owner_id,draft_id,source_id,draft_version,source_record,content)
    values($1,$2,'smk:test',1,'{"title":"Work"}','{"title":"Draft"}')
  `, [owner,draftId]);
  assert.equal((await db.query("select source_id from public.daily_learning_publications")).rows[0].source_id, "smk:test");
  await assert.rejects(
    db.query("update public.daily_learning_publications set content='{}' where draft_id=$1", [draftId]),
    /permission denied|immutable/
  );

  await db.exec("reset role");
  await db.exec(v2Migration);
  await asUser(owner);
  assert.equal((await db.query("select package_schema_version from public.daily_learning_article_drafts where id=$1", [draftId])).rows[0].package_schema_version, 1);
  assert.equal((await db.query("select count(*)::int as count from public.daily_learning_publications")).rows[0].count, 1);

  const v2Package = {
    planning: { plan_issue: "01", primary_observation_theme: "A05", primary_observation_method: "M02", primary_history_node: "H09" },
    work: { institution: "Example Museum", object_id: "OBJECT-2" },
    article: { title: "V2 draft", observations: [{ heading: "Observe", body: "Look closely" }] },
    claims: [{ claim_id: "claim-1", verification_status: "verified" }],
    assets: [{ asset_id: "asset-main", role: "main", availability_status: "verified" }],
    quality: { checks: [{ check_id: "structure", status: "passed" }], blockers: [] },
  };
  const v2Inserted = await db.query(`
    insert into public.daily_learning_article_drafts(
      owner_id, source_id, source_record, content, version,
      package_schema_version, content_id, content_type, production_status,
      planning, work_record, claims, assets, quality
    ) values(
      $1, 'example:object-2', '{"title":"Example"}', $2, 1,
      2, 'daily-learning:example-02', 'single_artwork', 'awaiting_owner_review',
      $3, $4, $5, $6, $7
    ) returning id
  `, [owner, JSON.stringify(v2Package.article), JSON.stringify(v2Package.planning), JSON.stringify(v2Package.work), JSON.stringify(v2Package.claims), JSON.stringify(v2Package.assets), JSON.stringify(v2Package.quality)]);
  const v2DraftId = v2Inserted.rows[0].id;
  await assert.rejects(
    db.query("update public.daily_learning_article_drafts set production_status='owner_approved',status='approved',approved_content=content,image_permission_verified=true,historical_sources_verified=true where id=$1", [v2DraftId]),
    /status transition|owner decision/
  );
  await db.query("select public.review_daily_learning_v2($1,'approved','Owner approved this version.')", [v2DraftId]);
  assert.equal((await db.query("select production_status from public.daily_learning_article_drafts where id=$1", [v2DraftId])).rows[0].production_status, "owner_approved");
  assert.equal((await db.query("select decision from public.daily_learning_review_decisions where draft_id=$1", [v2DraftId])).rows[0].decision, "approved");

  const packageSnapshot = { schema_version: 2, content_id: "daily-learning:example-02", content_type: "single_artwork", planning: v2Package.planning, work: v2Package.work, article: v2Package.article, claims: v2Package.claims, assets: v2Package.assets, quality: v2Package.quality };
  await db.query(`
    insert into public.daily_learning_publications(
      owner_id,draft_id,source_id,draft_version,source_record,content,
      package_schema_version,content_id,package_snapshot
    ) values($1,$2,'example:object-2',1,'{"title":"Example"}',$3,2,'daily-learning:example-02',$4)
  `, [owner, v2DraftId, JSON.stringify(v2Package.article), JSON.stringify(packageSnapshot)]);
  await assert.rejects(
    db.query("update public.daily_learning_review_decisions set review_note='changed' where draft_id=$1", [v2DraftId]),
    /permission denied|immutable/
  );

  await asUser(other);
  assert.equal((await db.query("select * from public.daily_learning_article_drafts")).rows.length, 0);
  assert.equal((await db.query("select * from public.daily_learning_publications")).rows.length, 2);
  assert.equal((await db.query("select * from public.daily_learning_review_decisions")).rows.length, 0);
  await assert.rejects(
    db.query("insert into public.daily_learning_article_drafts(owner_id,source_id,source_record,content) values($1,'smk:other','{}','{}')", [other]),
    /row-level security/
  );

  await asUser("", "anon");
  await assert.rejects(db.query("select * from public.daily_learning_article_drafts"), /permission denied/);
  await assert.rejects(db.query("select * from public.daily_learning_review_decisions"), /permission denied/);
  assert.equal((await db.query("select * from public.daily_learning_publications")).rows.length, 2);
  await db.close();
});
