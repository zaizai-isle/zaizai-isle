import type { Metadata } from "next";
import { LearningReview } from "./LearningReview";
import research from "../../../../data/learning/research/latest.json";
import "../learning.css";
import "./review.css";

export const metadata: Metadata = { title: "内容审核 | 每日一看" };
export default function ReviewPage() {
  const candidates = research.status === "research_candidates_only"
    ? research.items.filter((item) => item.review_status === "needs_editorial_review")
    : [];

  return <LearningReview initialCandidates={candidates} researchDate={research.research_date} />;
}
