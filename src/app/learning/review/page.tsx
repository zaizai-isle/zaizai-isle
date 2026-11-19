import type { Metadata } from "next";
import { LearningReview } from "./LearningReview";
import "../learning.css";

export const metadata: Metadata = { title: "内容审核 | 每日一看" };

// 纯静态外壳：候选池不再在构建期快照，改由 LearningReview 运行时读取
// （research-pool-data，与岛主提醒共用）——机器人直写 latest.json 即刻生效，免部署。
export default function ReviewPage() {
  return <LearningReview />;
}
