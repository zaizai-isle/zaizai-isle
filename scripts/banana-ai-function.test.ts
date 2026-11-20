import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

type EdgeHandler = (request: Request) => Promise<Response>;

const secrets = new Map<string, string>();
let handler: EdgeHandler | undefined;

Object.assign(globalThis, {
  Deno: {
    env: {
      get(name: string) {
        return secrets.get(name);
      },
    },
    serve(nextHandler: EdgeHandler) {
      handler = nextHandler;
    },
  },
});

const edgeFunctionModule = '../supabase/functions/banana-ai/index.ts';
const functionReady = import(edgeFunctionModule);

test('bananaify uses Cloudflare image editing and preserves the frontend response contract', async () => {
  await functionReady;
  configureQuota('5', '10');

  const originalFetch = globalThis.fetch;
  let requestUrl = '';
  let requestBody: FormData | undefined;

  globalThis.fetch = async (input, init) => {
    if (String(input).startsWith('https://sb.test/')) return Response.json({ ok: true, duplicate: false });
    requestUrl = String(input);
    requestBody = init?.body as FormData;

    return Response.json({
      success: true,
      result: { image: 'generated-image-base64' },
    });
  };

  try {
    assert.ok(handler);
    const response = await handler(new Request('https://example.com/banana-ai/bananaify', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Turn everything into bananas',
        image_base64: 'c291cmNlLWltYWdl',
        mime_type: 'image/webp',
        image_width: 1024,
        image_height: 768,
      }),
    }));

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      image_base64: 'generated-image-base64',
      mime_type: 'image/png',
    });
    assert.equal(
      requestUrl,
      'https://api.cloudflare.com/client/v4/accounts/test-account/ai/run/@cf/black-forest-labs/flux-2-klein-4b'
    );
    assert.ok(requestBody instanceof FormData);
    assert.equal(requestBody.get('prompt'), 'Turn everything into bananas');
    assert.equal(requestBody.get('width'), '1024');
    assert.equal(requestBody.get('height'), '768');
    const inputImage = requestBody.get('input_image_0');
    assert.ok(inputImage instanceof Blob);
    assert.equal(inputImage.type, 'image/webp');
    assert.equal(await inputImage.text(), 'source-image');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('understand uses Cloudflare vision analysis', async () => {
  await functionReady;
  configureQuota('5', '10');

  const originalFetch = globalThis.fetch;
  let requestBody: Record<string, unknown> | undefined;

  globalThis.fetch = async (input, init) => {
    if (String(input).startsWith('https://sb.test/')) return Response.json({ ok: true, duplicate: false });
    requestBody = JSON.parse(String(init?.body));
    return Response.json({
      success: true,
      result: { answer: '一只黄色香蕉猫坐在窗边。' },
    });
  };

  try {
    assert.ok(handler);
    const response = await handler(new Request('https://example.com/banana-ai/understand', {
      method: 'POST',
      body: JSON.stringify({
        question: '描述图片',
        image_base64: 'c291cmNlLWltYWdl',
        mime_type: 'image/webp',
      }),
    }));

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { text: '一只黄色香蕉猫坐在窗边。' });
    assert.deepEqual(requestBody, {
      task: 'query',
      image: 'data:image/webp;base64,c291cmNlLWltYWdl',
      question: '描述图片',
      reasoning: false,
      max_tokens: 512,
      stream: false,
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// ─────────────────────────────────────────────
// 额度控制：真实 PGlite 执行迁移 SQL，Edge handler 经假 PostgREST 调 RPC。
// ─────────────────────────────────────────────
const QUOTA_MIGRATION = '../supabase/migrations/20261119090000_banana_ai_quota.sql';

async function createQuotaDb() {
  const db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated; create role service_role;
    create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
  `);
  await db.exec(await readFile(new URL(QUOTA_MIGRATION, import.meta.url), 'utf8'));
  return db;
}

type RpcCall = { url: string; headers: Record<string, string>; body: Record<string, unknown> };

function installQuotaFetch(db: PGlite, counters: { vendor: number; rpc: RpcCall[] }, mode: 'ok' | 'down' | 'vendor-error' = 'ok') {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input, init) => {
    const url = String(input);

    if (url === 'https://sb.test/rest/v1/rpc/consume_banana_ai_quota') {
      const headers = Object.fromEntries(
        new Headers((init?.headers as Record<string, string>) || {}).entries()
      );
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      counters.rpc.push({ url, headers, body });
      if (mode === 'down') {
        return new Response('quota backend unavailable', { status: 500 });
      }
      const result = await db.query<{ outcome: unknown }>(
        'select public.consume_banana_ai_quota($1::jsonb, $2::uuid) as outcome',
        [JSON.stringify(body.p_tiers), body.p_request_id ?? null]
      );
      return Response.json(result.rows[0].outcome);
    }

    if (url.startsWith('https://api.cloudflare.com/')) {
      counters.vendor += 1;
      if (mode === 'vendor-error') throw new Error('Vendor response lost');
      return Response.json({ success: true, result: { image: 'generated-image-base64' } });
    }

    throw new Error(`unexpected fetch: ${url}`);
  };

  return () => {
    globalThis.fetch = originalFetch;
  };
}

function configureQuota(perClient: string, globalLimit: string) {
  secrets.clear();
  secrets.set('CLOUDFLARE_ACCOUNT_ID', 'test-account');
  secrets.set('CLOUDFLARE_API_TOKEN', 'test-cloudflare-token');
  secrets.set('SUPABASE_URL', 'https://sb.test');
  secrets.set('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key');
  secrets.set('BANANA_QUOTA_PER_CLIENT', perClient);
  secrets.set('BANANA_QUOTA_DAILY_GLOBAL', globalLimit);
}

function bananaifyRequest(requestId?: string, authorization = 'Bearer anon-anon-key') {
  return new Request('https://example.com/banana-ai/bananaify', {
    method: 'POST',
    headers: { Authorization: authorization },
    body: JSON.stringify({
      request_id: requestId ?? crypto.randomUUID(),
      image_base64: 'c291cmNlLWltYWdl',
      mime_type: 'image/webp',
    }),
  });
}

function userJwt(sub: string) {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `Bearer ${encode({ alg: 'none' })}.${encode({ role: 'authenticated', sub })}.x`;
}

async function windows(db: PGlite) {
  const rows = await db.query('select scope, used, window_day from banana_private.quota_windows order by scope');
  return rows.rows as Array<{ scope: string; used: number; window_day: string }>;
}

test('quota: 并发打满后不再调用供应商，且不会超扣', async (t) => {
  const db = await createQuotaDb();
  configureQuota('3', '5');
  const counters = { vendor: 0, rpc: [] as RpcCall[] };
  const restore = installQuotaFetch(db, counters);
  await t.test('handler uses service key for the quota RPC', async () => {
    const response = await handler!(bananaifyRequest());
    assert.equal(response.status, 200);
    assert.equal(counters.vendor, 1);
    assert.equal(counters.rpc.length, 1);
    assert.equal(counters.rpc[0].headers.apikey, 'test-service-key');
    assert.equal(counters.rpc[0].headers.authorization, 'Bearer test-service-key');
  });

  const responses = await Promise.all(
    Array.from({ length: 10 }, () => handler!(bananaifyRequest()))
  );
  const statuses = await Promise.all(responses.map((r) => r.status));
  const bodies = await Promise.all(responses.map((r) => r.json() as Promise<{
    error?: { quota_exhausted: boolean; message: string };
  }>));

  const okCount = statuses.filter((s) => s === 200).length;
  const denied = responses.filter((r) => r.status === 429).length;

  await t.test('per-client limit caps total successes at 3 (1 already consumed above)', () => {
    assert.equal(okCount, 2);
    assert.equal(denied, 8);
    assert.equal(counters.vendor, 3, '额度用尽后不得再调用供应商');
  });

  await t.test('denied responses carry the quota_exhausted contract', () => {
    const first = bodies.find((_, i) => statuses[i] === 429);
    assert.equal(first?.error?.quota_exhausted, true);
    assert.match(first?.error?.message ?? '', /额度已经用完/);
  });

  await t.test('quota windows never overshoot the limits', async () => {
    const rows = await windows(db);
    const ipRow = rows.find((r) => r.scope.startsWith('ip:'));
    const globalRow = rows.find((r) => r.scope === 'global');
    assert.ok(ipRow && globalRow);
    assert.equal(ipRow.used, 3);
    assert.equal(globalRow.used, 3);
  });
  restore();
  await db.close();
});

test('quota: 同一请求的并发重试只扣一次且只调用一次供应商', async (t) => {
  const db = await createQuotaDb();
  configureQuota('2', '10');
  const counters = { vendor: 0, rpc: [] as RpcCall[] };
  const restore = installQuotaFetch(db, counters);

  const requestId = crypto.randomUUID();
  const responses = await Promise.all(
    Array.from({ length: 5 }, () => handler!(bananaifyRequest(requestId)))
  );
  await t.test('only the reservation winner is allowed to call the vendor', async () => {
    assert.deepEqual(responses.map((r) => r.status).sort(), [200, 409, 409, 409, 409]);
    assert.equal(counters.vendor, 1);
    const duplicate = responses.find((r) => r.status === 409);
    assert.equal((await duplicate?.json()).error.duplicate_request, true);
  });

  await t.test('quota is consumed exactly once for five retries', async () => {
    const rows = await windows(db);
    const globalRow = rows.find((r) => r.scope === 'global');
    assert.ok(globalRow);
    assert.equal(globalRow.used, 1, '同一请求只消耗一次额度');
  });

  await t.test('a different request_id still respects the remaining budget', async () => {
    assert.equal((await handler!(bananaifyRequest())).status, 200);
    const denied = await handler!(bananaifyRequest());
    assert.equal(denied.status, 429);
    assert.equal(counters.vendor, 2);
  });
  restore();
  await db.close();
});

test('quota: 供应商响应丢失后仍拒绝重复调用，额度用尽后拒绝新请求', async (t) => {
  const db = await createQuotaDb();
  configureQuota('1', '10');
  const counters = { vendor: 0, rpc: [] as RpcCall[] };
  const restore = installQuotaFetch(db, counters, 'vendor-error');
  t.after(async () => { restore(); await db.close(); });

  const paidRequestId = crypto.randomUUID();
  assert.equal((await handler!(bananaifyRequest(paidRequestId))).status, 500);
  assert.equal(counters.vendor, 1);

  const starved = await handler!(bananaifyRequest());
  assert.equal(starved.status, 429);
  assert.equal(counters.vendor, 1, '未扣减成功的请求不得调用供应商');

  const retry = await handler!(bananaifyRequest(paidRequestId));
  assert.equal(retry.status, 409);
  assert.equal(counters.vendor, 1);

  const rows = await windows(db);
  assert.equal(rows.find((r) => r.scope === 'global')?.used, 1, '重试不重复扣额');
});

test('quota: 额度校验后端不可用时 fail-closed，不调用供应商', async () => {
  const db = await createQuotaDb();
  configureQuota('5', '10');
  const counters = { vendor: 0, rpc: [] as RpcCall[] };
  const restore = installQuotaFetch(db, counters, 'down');

  const response = await handler!(bananaifyRequest());
  assert.equal(response.status, 503);
  assert.equal(counters.vendor, 0);
  const body = await response.json() as { error?: { message?: string } };
  assert.match(body.error?.message ?? '', /额度校验服务暂不可用/);
  restore();
  await db.close();
});

test('quota: 额度按登录用户与匿名访客分档；SQL 层拒绝匿名直连', async (t) => {
  const db = await createQuotaDb();
  configureQuota('1', '10');
  const counters = { vendor: 0, rpc: [] as RpcCall[] };
  const restore = installQuotaFetch(db, counters);

  const uid = '11111111-1111-4111-8111-111111111111';
  assert.equal((await handler!(bananaifyRequest(undefined, userJwt(uid)))).status, 200);
  assert.equal((await handler!(bananaifyRequest(undefined, userJwt(uid)))).status, 429);

  const rows = await windows(db);
  assert.ok(rows.find((r) => r.scope === `user:${uid}`), '登录用户按 user 维度记账');
  assert.ok(!rows.some((r) => r.scope.startsWith('ip:')), '登录用户不应落入 ip 档');

  await t.test('anon / authenticated roles cannot execute the RPC directly', async () => {
    for (const role of ['anon', 'authenticated']) {
      await db.exec(`reset role; set role ${role}`);
      await assert.rejects(
        db.query(
          `select public.consume_banana_ai_quota('[{"scope":"global","limit":99}]'::jsonb, null)`
        ),
        /permission denied/
      );
    }
    await db.exec('reset role');
  });
  restore();
  await db.close();
});

test('quota: 未配置额度后端时拒绝供应商调用', async () => {
  secrets.clear();
  secrets.set('CLOUDFLARE_ACCOUNT_ID', 'test-account');
  secrets.set('CLOUDFLARE_API_TOKEN', 'test-cloudflare-token');

  const originalFetch = globalThis.fetch;
  const counters = { vendor: 0 };
  globalThis.fetch = async (input) => {
    if (String(input).startsWith('https://api.cloudflare.com/')) {
      counters.vendor += 1;
      return Response.json({ success: true, result: { image: 'generated-image-base64' } });
    }
    throw new Error(`unexpected fetch: ${String(input)}`);
  };

  try {
    const response = await handler!(bananaifyRequest());
    assert.equal(response.status, 503);
    assert.equal(counters.vendor, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('quota 迁移与护照共存：同一库内匿名登录仍能保存与恢复', async () => {
  const db = new PGlite();
  const passportUser = '22222222-2222-4222-8222-222222222222';
  const passportId = '33333333-3333-4333-8333-333333333333';
  await db.exec(`
    create role anon; create role authenticated; create role service_role;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key);
    insert into auth.users values('${passportUser}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth,storage to authenticated,anon;
    grant execute on function auth.uid() to authenticated,anon;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(bucket_id text,name text,primary key(bucket_id,name));
    alter table storage.objects enable row level security;
    grant select,insert,update,delete on storage.objects to authenticated,anon;
  `);
  await db.exec(await readFile(new URL('../supabase/migrations/20260928064916_life_passport_cloud.sql', import.meta.url), 'utf8'));
  await db.exec(await readFile(new URL(QUOTA_MIGRATION, import.meta.url), 'utf8'));

  // 先消耗一次香蕉额度（service_role 路径），再验证护照匿名会话不受影响
  const consumed = await db.query<{ o: { ok: boolean } }>(
    `select public.consume_banana_ai_quota('[{"scope":"ip:2222","limit":5}]'::jsonb, null) as o`
  );
  assert.equal(consumed.rows[0].o.ok, true);

  await db.exec('reset role; set role authenticated');
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [passportUser]);
  const secret = 'e'.repeat(64);
  const create = await db.query<{ r: { id: string } }>(
    'select public.life_passport_api($1,$2::jsonb) as r',
    ['create', JSON.stringify({ passportId, secret })]
  );
  assert.equal(create.rows[0].r.id, passportId);

  const draft = { title: '额度上线当天', date: '2026-11-19', category: '生活', icon: '✦', note: '', location: '', style: 'classic', texture: 'original', experimentalFilter: 'ascii' };
  const saved = await db.query<{ r: { record: { title: string } } }>(
    'select public.life_passport_api($1,$2::jsonb) as r',
    ['save', JSON.stringify({ passportId, id: 'stamp-q', draft, operation: crypto.randomUUID() })]
  );
  assert.equal(saved.rows[0].r.record.title, draft.title);

  const listed = await db.query<{ r: unknown[] }>('select public.life_passport_api($1,$2::jsonb) as r', ['list', JSON.stringify({ passportId })]);
  assert.equal(listed.rows[0].r.length, 1);
  await db.close();
});
