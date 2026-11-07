import { LearningArchive } from "../LearningArchive";

export const metadata = { title: "往期合集 · 每日一看" };

// 往期合集独立页：静态外壳 + 客户端读取全部可见发布（与 /learning 同一数据口径）。
export default function LearningArchivePage() {
  return <LearningArchive />;
}
