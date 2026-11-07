import { getIslandOwnerClient } from "@/lib/island-owner-client";
import { getOptionalSupabase } from "@/lib/supabaseClient";
import type { LearningReaction } from "./learning-content";
import type { PublicationRow, PublicationSummaryRow } from "./learning-publication-entry";

// 匿名客户端透传：调用方动态导入本模块即可拿到公开读取入口。
export { getOptionalSupabase };

export const LEARNING_DRAFT_PREFIX = "daily-learning-draft:";
export const LEARNING_LOCAL_RESPONSES_KEY = "daily-learning-local-responses";

export interface LearningResponse {
  entryId: string;
  reaction: LearningReaction;
  note: string;
  viewedSnapshot: Record<string, unknown>;
  updatedAt: string;
}

export function listLocalLearningResponses(): LearningResponse[] {
  try {
    const value = JSON.parse(localStorage.getItem(LEARNING_LOCAL_RESPONSES_KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is LearningResponse =>
      item && typeof item === "object" && typeof item.entryId === "string" &&
      ["interesting", "neutral", "unclear"].includes(item.reaction) &&
      typeof item.note === "string" && typeof item.updatedAt === "string"
    );
  } catch {
    return [];
  }
}

export function saveLocalLearningResponse(response: LearningResponse) {
  const rows = listLocalLearningResponses().filter((item) => item.entryId !== response.entryId);
  localStorage.setItem(LEARNING_LOCAL_RESPONSES_KEY, JSON.stringify([response, ...rows]));
}

export async function verifyIslandOwner() {
  const client = getIslandOwnerClient();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) return null;
  const { data, error } = await client.from("island_owner_accounts").select("user_id").eq("user_id", userData.user.id).maybeSingle();
  if (error) throw new Error("暂时无法验证岛主身份。");
  return data ? userData.user : null;
}

export async function listLearningResponses() {
  const { data, error } = await getIslandOwnerClient()
    .from("daily_learning_responses")
    .select("entry_id,reaction,note,viewed_snapshot,updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw new Error("学习记录暂时无法读取，请稍后重试。");
  return (data ?? []).map((row) => ({
    entryId: row.entry_id,
    reaction: row.reaction as LearningReaction,
    note: row.note,
    viewedSnapshot: row.viewed_snapshot as Record<string, unknown>,
    updatedAt: row.updated_at,
  } satisfies LearningResponse));
}

export async function saveLearningResponse(entryId: string, reaction: LearningReaction, note: string, viewedSnapshot: Record<string, unknown>) {
  const client = getIslandOwnerClient();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw new Error("登录已过期，请重新登录。");
  const { error } = await client.from("daily_learning_responses").upsert({
    user_id: userData.user.id,
    entry_id: entryId,
    reaction,
    note: note.trim(),
    viewed_snapshot: viewedSnapshot,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,entry_id" });
  if (error) throw new Error("这次反馈还没有保存成功，请检查网络后重试。");
}

// ---------------------------------------------------------------------------
// 公开读取（anon key）：daily_learning_publications 的 select 策略对 anon 开放
// （is_visible 行公开可读）。列表侧只取精简列，完整正文只在详情页按需读取。
// ---------------------------------------------------------------------------

/** 列表/精选只需要标题与日期，不再整行拉取 source_record/content/package_snapshot。 */
/** 列表/精选取精简列 + 主图所需的最小素材信息（role/asset_id/image_url 由快照 assets 带出）。 */
export const PUBLICATION_SUMMARY_COLUMNS = "id,content_id,display_date,published_at,title:content->>title,subject:content->>subject,assets:package_snapshot->assets";

/** 详情页渲染需要的完整发布快照（仅单行）。 */
export const PUBLICATION_FULL_COLUMNS = "id,content_id,source_id,source_record,content,published_at,display_date,package_schema_version,package_snapshot";

/** “今天”一律以 Asia/Pontianak 时区判断，与 display_date 的写入口径一致。 */
export function pontianakToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Pontianak", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

/** 当日已发布内容；查不到返回 null（调用方必须走诚实空状态，不得回退旧稿）。 */
export async function fetchTodayPublishedPublication(today = pontianakToday()): Promise<PublicationRow | null> {
  const client = getOptionalSupabase();
  if (!client) throw new Error("Supabase 未配置，无法确认今日内容。");
  const { data, error } = await client
    .from("daily_learning_publications")
    .select(PUBLICATION_FULL_COLUMNS)
    .eq("is_visible", true)
    .eq("display_date", today)
    .order("published_at", { ascending: false })
    .limit(1);
  if (error) throw new Error("今日内容读取失败。");
  return (data as PublicationRow[] | null)?.[0] ?? null;
}

/** 往期列表：今天之前的可见发布，默认拉满一屏可滚动的量。 */
export async function listRecentPublicationSummaries(today = pontianakToday(), limit = 30): Promise<PublicationSummaryRow[]> {
  const client = getOptionalSupabase();
  if (!client) throw new Error("Supabase 未配置，无法读取往期精选。");
  const { data, error } = await client
    .from("daily_learning_publications")
    .select(PUBLICATION_SUMMARY_COLUMNS)
    .eq("is_visible", true)
    .lt("display_date", today)
    .order("display_date", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error("往期精选读取失败。");
  return (data as PublicationSummaryRow[] | null) ?? [];
}

/** 按 publication id 读取完整行，兼容旧的 /learning?entry=publication-<id> 深链。 */
export async function fetchPublishedPublicationById(id: string): Promise<PublicationRow | null> {
  const client = getOptionalSupabase();
  if (!client) throw new Error("Supabase 未配置，无法读取这篇内容。");
  const { data, error } = await client
    .from("daily_learning_publications")
    .select(PUBLICATION_FULL_COLUMNS)
    .eq("id", id)
    .eq("is_visible", true)
    .maybeSingle();
  if (error) throw new Error("这篇内容读取失败。");
  return (data as PublicationRow | null) ?? null;
}

/** 按 content_id 读取最新一次可见发布，供详情页静态生成使用。 */
export async function fetchPublishedPublicationByContentId(contentId: string): Promise<PublicationRow | null> {
  const client = getOptionalSupabase();
  if (!client) throw new Error("Supabase 未配置，无法读取这篇内容。");
  const { data, error } = await client
    .from("daily_learning_publications")
    .select(PUBLICATION_FULL_COLUMNS)
    .eq("content_id", contentId)
    .eq("is_visible", true)
    .order("published_at", { ascending: false })
    .limit(1);
  if (error) throw new Error("这篇内容读取失败。");
  return (data as PublicationRow[] | null)?.[0] ?? null;
}

/** 构建期用：全量已发布且可见的 content_id（去重），供 generateStaticParams 生成深链页面。 */
export async function listPublishedContentIds(): Promise<string[]> {
  const client = getOptionalSupabase();
  if (!client) throw new Error("Supabase 未配置，无法枚举已发布内容。");
  const { data, error } = await client
    .from("daily_learning_publications")
    .select("content_id")
    .eq("is_visible", true)
    .order("display_date", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(1000);
  if (error) throw new Error("已发布内容枚举失败。");
  const ids = (data as Array<{ content_id: string | null }> | null) ?? [];
  return [...new Set(ids.map((row) => row.content_id).filter((id): id is string => typeof id === "string" && id.length > 0))];
}
