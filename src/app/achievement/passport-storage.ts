import type { StampDraft } from "./passport-model";
import type { PreparedPassportPhoto } from "./passport-photo";

export const PASSPORT_SCHEMA_VERSION = 2;
export const DEFAULT_PASSPORT_ID = "default-life-passport";

const DATABASE_NAME = "zaizai-life-passport";
const PASSPORT_STORE = "passports";
const STAMP_STORE = "stamps";
const PHOTO_STORE = "stamp-photos";
const METADATA_STORE = "passport-meta";
const STORAGE_SAFETY_BUFFER = 512 * 1024;

export interface PassportRecord {
  id: string;
  name: string;
  declaration: string;
  coverTheme: "island-paper";
  passportNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface StampRecord extends StampDraft {
  id: string;
  passportId: string;
  hasPhoto: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StampPhotoRecord extends PreparedPassportPhoto {
  stampId: string;
  createdAt: string;
}

interface SaveStampOptions {
  id?: string;
  draft: StampDraft;
  photo: PreparedPassportPhoto | null;
}

export interface PassportSchemaUpgradePlan {
  createCoreStores: boolean;
  createMetadataStore: boolean;
}

export interface PassportStorageRepairPlan {
  orphanPhotoIds: string[];
  stampPhotoFlags: Array<{ id: string; hasPhoto: boolean }>;
}

let databasePromise: Promise<IDBDatabase> | undefined;

function requestResult<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("本地数据库操作失败"));
  });
}

function transactionDone(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error("本地数据库事务已取消"));
    transaction.onerror = () => reject(transaction.error ?? new Error("本地数据库事务失败"));
  });
}

export function passportSchemaUpgradePlan(oldVersion: number): PassportSchemaUpgradePlan {
  return {
    createCoreStores: oldVersion < 1,
    createMetadataStore: oldVersion < 2,
  };
}

function applySchemaUpgrade(database: IDBDatabase, oldVersion: number) {
  const plan = passportSchemaUpgradePlan(oldVersion);
  if (plan.createCoreStores) {
    database.createObjectStore(PASSPORT_STORE, { keyPath: "id" });
    const stamps = database.createObjectStore(STAMP_STORE, { keyPath: "id" });
    stamps.createIndex("passportId", "passportId", { unique: false });
    stamps.createIndex("date", "date", { unique: false });
    stamps.createIndex("updatedAt", "updatedAt", { unique: false });
    database.createObjectStore(PHOTO_STORE, { keyPath: "stampId" });
  }
  if (plan.createMetadataStore) {
    const metadata = database.createObjectStore(METADATA_STORE, { keyPath: "key" });
    metadata.put({ key: "schema", version: PASSPORT_SCHEMA_VERSION, migratedAt: new Date().toISOString() });
  }
}

function openPassportDatabase() {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("当前浏览器不支持本地护照存储"));
  }
  databasePromise ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, PASSPORT_SCHEMA_VERSION);
    request.onupgradeneeded = (event) => applySchemaUpgrade(request.result, event.oldVersion);
    request.onsuccess = () => {
      request.result.onversionchange = () => {
        request.result.close();
        databasePromise = undefined;
      };
      resolve(request.result);
    };
    request.onerror = () => {
      databasePromise = undefined;
      reject(request.error ?? new Error("无法打开本地护照"));
    };
    request.onblocked = () => {
      databasePromise = undefined;
      reject(new Error("请关闭其他正在使用人生护照的页面后重试"));
    };
  });
  return databasePromise;
}

function createId(prefix: string) {
  const randomId = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${randomId}`;
}

export async function ensureDefaultPassport() {
  const database = await openPassportDatabase();
  const transaction = database.transaction(PASSPORT_STORE, "readwrite");
  const store = transaction.objectStore(PASSPORT_STORE);
  const existing = await requestResult(store.get(DEFAULT_PASSPORT_ID) as IDBRequest<PassportRecord | undefined>);
  if (existing) {
    await transactionDone(transaction);
    return existing;
  }
  const now = new Date().toISOString();
  const passport: PassportRecord = {
    id: DEFAULT_PASSPORT_ID,
    name: "我的人生护照",
    declaration: "这一程，确实发生过。",
    coverTheme: "island-paper",
    passportNumber: `ZAIZAI-${now.slice(0, 10).replaceAll("-", "")}`,
    createdAt: now,
    updatedAt: now,
  };
  store.add(passport);
  await transactionDone(transaction);
  return passport;
}

export function passportStorageRepairPlan(
  stamps: ReadonlyArray<Pick<StampRecord, "id" | "hasPhoto">>,
  photos: ReadonlyArray<Pick<StampPhotoRecord, "stampId">>,
): PassportStorageRepairPlan {
  const stampIds = new Set(stamps.map((stamp) => stamp.id));
  const photoIds = new Set(photos.map((photo) => photo.stampId));
  return {
    orphanPhotoIds: photos.filter((photo) => !stampIds.has(photo.stampId)).map((photo) => photo.stampId),
    stampPhotoFlags: stamps
      .filter((stamp) => stamp.hasPhoto !== photoIds.has(stamp.id))
      .map((stamp) => ({ id: stamp.id, hasPhoto: photoIds.has(stamp.id) })),
  };
}

export function hasPassportStorageCapacity(
  estimate: Pick<StorageEstimate, "usage" | "quota">,
  requiredBytes: number,
) {
  if (estimate.usage === undefined || estimate.quota === undefined) return true;
  const remainingBytes = Math.max(0, estimate.quota - estimate.usage);
  return remainingBytes >= requiredBytes + STORAGE_SAFETY_BUFFER;
}

async function assertPhotoStorageCapacity(photo: PreparedPassportPhoto) {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) return;
  let estimate: StorageEstimate;
  try {
    estimate = await navigator.storage.estimate();
  } catch {
    return;
  }
  const requiredBytes = photo.sourceBlob.size + photo.thumbnailBlob.size;
  if (!hasPassportStorageCapacity(estimate, requiredBytes)) {
    throw new DOMException("浏览器存储空间不足", "QuotaExceededError");
  }
}

export async function repairPassportStorage() {
  const database = await openPassportDatabase();
  const transaction = database.transaction([STAMP_STORE, PHOTO_STORE], "readwrite");
  const stampStore = transaction.objectStore(STAMP_STORE);
  const photoStore = transaction.objectStore(PHOTO_STORE);
  const [stamps, photos] = await Promise.all([
    requestResult(stampStore.getAll() as IDBRequest<StampRecord[]>),
    requestResult(photoStore.getAll() as IDBRequest<StampPhotoRecord[]>),
  ]);
  const plan = passportStorageRepairPlan(stamps, photos);
  plan.orphanPhotoIds.forEach((stampId) => photoStore.delete(stampId));
  plan.stampPhotoFlags.forEach(({ id, hasPhoto }) => {
    const stamp = stamps.find((item) => item.id === id);
    if (stamp) stampStore.put({ ...stamp, hasPhoto });
  });
  await transactionDone(transaction);
  return {
    removedOrphanPhotos: plan.orphanPhotoIds.length,
    repairedStampFlags: plan.stampPhotoFlags.length,
  };
}

export async function saveStamp({ id, draft, photo }: SaveStampOptions) {
  if (photo) await assertPhotoStorageCapacity(photo);
  const database = await openPassportDatabase();
  const transaction = database.transaction([STAMP_STORE, PHOTO_STORE, PASSPORT_STORE], "readwrite");
  const stampStore = transaction.objectStore(STAMP_STORE);
  const photoStore = transaction.objectStore(PHOTO_STORE);
  const passportStore = transaction.objectStore(PASSPORT_STORE);
  const stampId = id ?? createId("stamp");
  const existing = id
    ? await requestResult(stampStore.get(id) as IDBRequest<StampRecord | undefined>)
    : undefined;
  const now = new Date().toISOString();
  const stamp: StampRecord = {
    ...draft,
    id: stampId,
    passportId: DEFAULT_PASSPORT_ID,
    hasPhoto: Boolean(photo),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  stampStore.put(stamp);
  if (photo) {
    const photoRecord: StampPhotoRecord = { ...photo, stampId, createdAt: now };
    photoStore.put(photoRecord);
  } else {
    photoStore.delete(stampId);
  }
  const passport = await requestResult(passportStore.get(DEFAULT_PASSPORT_ID) as IDBRequest<PassportRecord | undefined>);
  if (passport) passportStore.put({ ...passport, updatedAt: now });
  await transactionDone(transaction);
  return stamp;
}

export async function listStamps() {
  const database = await openPassportDatabase();
  const transaction = database.transaction(STAMP_STORE, "readonly");
  const records = await requestResult(transaction.objectStore(STAMP_STORE).getAll() as IDBRequest<StampRecord[]>);
  await transactionDone(transaction);
  return records.toSorted((left, right) => right.date.localeCompare(left.date) || right.createdAt.localeCompare(left.createdAt));
}

export async function getStamp(stampId: string) {
  const database = await openPassportDatabase();
  const transaction = database.transaction(STAMP_STORE, "readonly");
  const stamp = await requestResult(transaction.objectStore(STAMP_STORE).get(stampId) as IDBRequest<StampRecord | undefined>);
  await transactionDone(transaction);
  return stamp;
}

export async function getStampPhoto(stampId: string) {
  const database = await openPassportDatabase();
  const transaction = database.transaction(PHOTO_STORE, "readonly");
  const photo = await requestResult(transaction.objectStore(PHOTO_STORE).get(stampId) as IDBRequest<StampPhotoRecord | undefined>);
  await transactionDone(transaction);
  return photo;
}

export async function deleteStamp(stampId: string) {
  const database = await openPassportDatabase();
  const transaction = database.transaction([STAMP_STORE, PHOTO_STORE, PASSPORT_STORE], "readwrite");
  transaction.objectStore(STAMP_STORE).delete(stampId);
  transaction.objectStore(PHOTO_STORE).delete(stampId);
  const passportStore = transaction.objectStore(PASSPORT_STORE);
  const passport = await requestResult(passportStore.get(DEFAULT_PASSPORT_ID) as IDBRequest<PassportRecord | undefined>);
  if (passport) passportStore.put({ ...passport, updatedAt: new Date().toISOString() });
  await transactionDone(transaction);
}

export function passportStorageErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "QuotaExceededError") {
    return "浏览器存储空间不足，请清理空间或换一张更小的照片。";
  }
  return error instanceof Error ? error.message : "记录暂时无法保存，请稍后重试。";
}
