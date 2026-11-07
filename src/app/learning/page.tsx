import { Suspense } from "react";
import { LearningArticleLoading } from "./LearningArticle";
import { PublishedLearning } from "./PublishedLearning";

// 静态外壳：首帧渲染稳定的加载骨架；当日内容、诚实空状态与往期精选
// 由 PublishedLearning 在客户端按 Asia/Pontianak 的“今天”读取，不回退旧稿。
export default function LearningPage() {
  return <Suspense fallback={<LearningArticleLoading />}><PublishedLearning /></Suspense>;
}
