import { getIslandOwnerClient } from "@/lib/island-owner-client";
import type { LearningReaction } from "./learning-content";

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
