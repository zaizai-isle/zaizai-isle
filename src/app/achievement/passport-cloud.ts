import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { StampDraft } from './passport-model';
import type { PreparedPassportPhoto } from './passport-photo';
import type { PassportRecord, StampRecord, StampPhotoRecord } from './passport-storage';
import { newRecoveryKey, parseRecoveryKey } from './passport-recovery';

export const cloudPassportEnabled = process.env.NEXT_PUBLIC_PASSPORT_CLOUD_ENABLED === 'true';
const BUCKET = 'life-passport-photos';
const ACTIVE_KEY = 'life-passport-cloud-active';
const RECOVERY_PREFIX = 'life-passport-recovery:';
const PENDING_PREFIX = 'life-passport-recovery-pending:';
let client: SupabaseClient | undefined;
let contextPromise: Promise<PassportRecord> | undefined;
const versions = new Map<string, string>();
interface CloudStamp { record: StampRecord; asset: string | null; width: number; height: number; operation: string }

function cloudClient() {
  if (!cloudPassportEnabled) throw new Error('云端护照尚未启用。');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('云端服务尚未配置，请稍后重试。');
  client ??= createClient(url, key, { auth: { storageKey: 'life-passport-anonymous-session', persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
  return client;
}

async function rpc<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await cloudClient().rpc('life_passport_api', { action, payload });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data as T;
}

async function session() {
  const auth = cloudClient().auth;
  const { data, error } = await auth.getSession();
  if (error) throw new Error('匿名身份暂时无法读取，请重试。');
  if (data.session) return;
  const result = await auth.signInAnonymously();
  if (result.error) throw new Error('无法建立匿名身份。请稍后重试；服务端需开启匿名登录，若有验证要求请联系站点维护者。');
}

async function bootstrap() {
  await session();
  const active = localStorage.getItem(ACTIVE_KEY);
  const existing = await rpc<PassportRecord | null>('home', { passportId: active });
  if (existing) {
    localStorage.setItem(ACTIVE_KEY, existing.id);
    void cleanupAssets(existing.id).catch(() => undefined);
    return existing;
  }
  const passportId = crypto.randomUUID();
  const key = newRecoveryKey(passportId);
  localStorage.setItem(RECOVERY_PREFIX + passportId, key);
  const passport = await rpc<PassportRecord>('create', { passportId, secret: parseRecoveryKey(key).secret });
  localStorage.setItem(ACTIVE_KEY, passport.id);
  return passport;
}

export function ensureCloudPassport(): Promise<PassportRecord> {
  contextPromise ??= (async () => {
    if (navigator.locks) return await navigator.locks.request('life-passport-bootstrap', bootstrap);
    return bootstrap();
  })().catch((error) => { contextPromise = undefined; throw error; });
  return contextPromise;
}

export async function listCloudStamps() {
  const passport = await ensureCloudPassport();
  const rows = await rpc<CloudStamp[]>('list', { passportId: passport.id });
  rows.forEach(({ record }) => versions.set(record.id, record.updatedAt));
  return rows.map(({ record }) => record);
}

async function cloudStamp(id: string) {
  const passport = await ensureCloudPassport();
  return rpc<CloudStamp | null>('get', { passportId: passport.id, id });
}

export async function getCloudStamp(id: string) {
  const row = await cloudStamp(id);
  if (row) versions.set(id, row.record.updatedAt);
  return row?.record;
}

export async function getCloudPhoto(id: string): Promise<StampPhotoRecord | undefined> {
  const row = await cloudStamp(id);
  if (!row?.asset) return undefined;
  const base = `${row.record.passportId}/${row.asset}`;
  const [source, thumbnail] = await Promise.all([
    cloudClient().storage.from(BUCKET).download(`${base}/source.webp`),
    cloudClient().storage.from(BUCKET).download(`${base}/thumbnail.webp`),
  ]);
  if (source.error || thumbnail.error || !source.data || !thumbnail.data) throw new Error('云端照片读取失败，请检查网络后重试。');
  return { stampId: id, sourceBlob: source.data, thumbnailBlob: thumbnail.data, width: row.width, height: row.height, mimeType: 'image/webp', createdAt: row.record.createdAt };
}

async function cleanupAssets(passportId: string) {
  const assets = await rpc<string[]>('garbage', { passportId });
  for (const asset of assets) {
    const { error } = await cloudClient().storage.from(BUCKET).remove([`${passportId}/${asset}/source.webp`, `${passportId}/${asset}/thumbnail.webp`]);
    if (!error) await rpc('release', { passportId, asset });
  }
}

export async function saveCloudStamp({ id = `stamp-${crypto.randomUUID()}`, draft, photo, importRecord }: {
  id?: string; draft: StampDraft; photo: PreparedPassportPhoto | null; importRecord?: StampRecord;
}) {
  const passport = await ensureCloudPassport();
  if (photo && (photo.sourceBlob.size > 2 * 1024 * 1024 || photo.thumbnailBlob.size > 2 * 1024 * 1024)) throw new Error('压缩后的单张照片须小于 2 MB，请选择更小的图片。');
  const operation = crypto.randomUUID();
  let asset: string | null = null;
  try {
    if (photo) {
      asset = await rpc<string>('reserve', { passportId: passport.id });
      // Sequential uploads make partial failures safe to clean up after the request settles.
      for (const [name, blob] of [['source', photo.sourceBlob], ['thumbnail', photo.thumbnailBlob]] as const) {
        const { error } = await cloudClient().storage.from(BUCKET).upload(`${passport.id}/${asset}/${name}.webp`, blob, { contentType: 'image/webp', upsert: false });
        if (error) throw new Error('照片上传失败，尚未更新云端记录，请重试。');
      }
    }
    const row = await rpc<CloudStamp>('save', {
      passportId: passport.id, id, draft, asset, operation,
      width: photo?.width ?? 0, height: photo?.height ?? 0,
      expected: importRecord ? null : versions.get(id) ?? null,
      importOnly: Boolean(importRecord), createdAt: importRecord?.createdAt,
    });
    versions.set(id, row.record.updatedAt);
    void cleanupAssets(passport.id).catch(() => undefined);
    return row.record;
  } catch (error) {
    // A lost response is not proof of a failed commit. Resolve by operation ID.
    const committed = await cloudStamp(id).catch(() => null);
    if (committed?.operation === operation) {
      versions.set(id, committed.record.updatedAt);
      return committed.record;
    }
    throw error;
  }
}

export async function deleteCloudStamp(id: string) {
  const passport = await ensureCloudPassport();
  await rpc('delete', { passportId: passport.id, id, expected: versions.get(id) ?? null });
  versions.delete(id);
  void cleanupAssets(passport.id).catch(() => undefined);
}

export async function recoveryKey() {
  const passport = await ensureCloudPassport();
  for (const prefix of [PENDING_PREFIX, RECOVERY_PREFIX]) {
    const stored = localStorage.getItem(prefix + passport.id);
    if (!stored) continue;
    const parsed = parseRecoveryKey(stored);
    const valid = await rpc<boolean>('check-key', { passportId: passport.id, secret: parsed.secret });
    if (valid) {
      localStorage.setItem(RECOVERY_PREFIX + passport.id, stored);
      localStorage.removeItem(PENDING_PREFIX + passport.id);
      return stored;
    }
  }
  return null;
}

export async function rotateRecoveryKey() {
  const passport = await ensureCloudPassport();
  const key = newRecoveryKey(passport.id);
  // Keep a candidate before the server call so a lost response never loses the new key.
  localStorage.setItem(PENDING_PREFIX + passport.id, key);
  await rpc('rotate', { passportId: passport.id, secret: parseRecoveryKey(key).secret });
  localStorage.setItem(RECOVERY_PREFIX + passport.id, key);
  localStorage.removeItem(PENDING_PREFIX + passport.id);
  return key;
}

export async function recoverPassport(key: string) {
  const { passportId, secret } = parseRecoveryKey(key);
  // Do not auto-create an empty passport just to restore an existing one.
  await session();
  const passport = await rpc<PassportRecord>('recover', { passportId, secret });
  localStorage.setItem(RECOVERY_PREFIX + passportId, key.trim());
  localStorage.setItem(ACTIVE_KEY, passportId);
  versions.clear();
  contextPromise = Promise.resolve(passport);
  return passport;
}

export async function migrateLocalStamps(onProgress: (message: string) => void) {
  const local = await import('./passport-storage');
  const records = await local.listStamps();
  const existing = new Set((await listCloudStamps()).map((stamp) => stamp.id));
  let imported = 0;
  for (const [index, stamp] of records.entries()) {
    if (!existing.has(stamp.id)) {
      const photo = await local.getStampPhoto(stamp.id);
      if (stamp.hasPhoto && !photo) throw new Error(`“${stamp.title}”的本地照片缺失，请先检查原记录。`);
      await saveCloudStamp({ id: stamp.id, draft: stamp, photo: photo ?? null, importRecord: stamp });
      imported++;
    }
    onProgress(`已处理 ${index + 1}/${records.length} 条，本地原件保留。`);
  }
  return { imported, skipped: records.length - imported };
}
