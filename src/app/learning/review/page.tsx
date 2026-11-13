import type { Metadata } from "next";
import { LearningReview } from "./LearningReview";
import { learningResearchPoolUrl } from "../learning-research-pool";
import "../learning.css";

export const metadata: Metadata = { title: "内容审核 | 每日一看" };

type ResearchPool = {
  status?: unknown;
  research_date?: unknown;
  items?: unknown;
};

// 构建期从 Supabase Storage 拉取当日候选池快照；失败则回退空候选，
// 审核页主体（Supabase 草稿流）不受影响。
async function fetchResearchPool(): Promise<ResearchPool | null> {
  const url = learningResearchPoolUrl();
  if (!url) return null;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as ResearchPool;
  } catch {
    return null;
  }
}

export default async function ReviewPage() {
  const research = await fetchResearchPool();
  const candidates = research?.status === "research_candidates_only" && Array.isArray(research.items)
    ? (research.items as Record<string, unknown>[]).filter((item) => item.review_status === "needs_editorial_review")
    : [];
  const researchDate = typeof research?.research_date === "string" ? research.research_date : "";

  return <LearningReview initialCandidates={candidates} researchDate={researchDate} />;
}
