// 候选池运行时读取：审核页与岛主提醒共用同一份解析/新鲜度逻辑。
// 采集机器人直写 Storage（latest.json），此处每次 no-store 现读——
// 候选数据更新即刻生效，不需要任何部署或重新构建。
import { learningResearchPoolUrl } from "./learning-research-pool";
import { pontianakToday } from "./pontianak-date";

export const RESEARCH_POOL_DRY_THRESHOLD_DAYS = 3;

export type ResearchPoolState = {
  /** review_status=needs_editorial_review 的候选，等待岛主编辑判断。 */
  candidates: Record<string, unknown>[];
  researchDate: string;
  dryDays: number;
  poolIssue: string;
};

function emptyState(poolIssue: string, partial?: Partial<ResearchPoolState>): ResearchPoolState {
  return { candidates: [], researchDate: "", dryDays: 0, poolIssue, ...partial };
}

function daysBetween(from: string, to: string) {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return Math.max(0, Math.round((end - start) / 86_400_000));
}

/** 纯解析：池 JSON → 候选/新鲜度状态；坏输入一律收敛为带说明的空态。 */
export function parseResearchPool(data: unknown, today = pontianakToday()): ResearchPoolState {
  if (!data || typeof data !== "object") return emptyState("无法读取，采集任务可能未运行");
  const pool = data as { status?: unknown; research_date?: unknown; items?: unknown };
  if (pool.status !== "research_candidates_only") return emptyState(`状态异常（${String(pool.status ?? "缺失")}）`);
  const candidates = Array.isArray(pool.items)
    ? (pool.items as Record<string, unknown>[]).filter((item) => item.review_status === "needs_editorial_review")
    : [];
  const researchDate = typeof pool.research_date === "string" ? pool.research_date : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(researchDate)) return emptyState("缺少采集日期", { candidates });
  const dryDays = daysBetween(researchDate, today) ?? 0;
  if (dryDays >= RESEARCH_POOL_DRY_THRESHOLD_DAYS) return { candidates, researchDate, dryDays, poolIssue: "已干涸" };
  return { candidates, researchDate, dryDays: 0, poolIssue: "" };
}

/** 现读现解析：调用方每次拿到的都是 Storage 上的最新候选池。 */
export async function loadResearchPoolState(): Promise<ResearchPoolState> {
  const url = learningResearchPoolUrl();
  if (!url) return emptyState("未配置 Supabase 地址");
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return emptyState("无法读取，采集任务可能未运行");
    return parseResearchPool(await response.json());
  } catch {
    return emptyState("无法读取，采集任务可能未运行");
  }
}
