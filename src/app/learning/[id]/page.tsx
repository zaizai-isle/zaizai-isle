import { learningEntries } from "../learning-content";
import { listPublishedContentIds } from "../learning-repository";
import LearningEntryRedirect from "../LearningEntryRedirect";

// 兼容入口（阶段②收敛）：上一版公开过的 /learning/<id>/ 路径全部保留为纯跳转壳，
// 只把访客替换到统一的 /learning?entry=… 阅读入口，构建产物不再包含任何正文页。
// 枚举=5 个历史静态选题 id + 构建时 anon 可读（已展示且已过 Asia/Pontianak 午夜）的
// content_id——即上一版真正对外可读过的正文路径；未来稿的旧深链在到点前本就不可读，
// 到点后下一次每日构建自动补上兼容壳，入口链接（?entry=）则无需构建即时生效。
export async function generateStaticParams() {
  const staticParams = learningEntries.map(({ id }) => ({ id }));
  try {
    const contentIds = await listPublishedContentIds();
    const seen = new Set(staticParams.map((param) => param.id));
    return [...staticParams, ...contentIds.filter((id) => !seen.has(id)).map((id) => ({ id }))];
  } catch (error) {
    console.warn("[learning] generateStaticParams 未能从 Supabase 拉取已发布 content_id，回退到硬编码静态选题列表。", error);
    return staticParams;
  }
}
export const dynamicParams = false;

export default async function LearningCompatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  // content_id 含 ":"，静态导出/预渲染时路由参数以 %3A 编码形态传入，解码后原样传给入口。
  let id = rawId;
  try { id = decodeURIComponent(rawId); } catch { /* 保留原值 */ }
  return <LearningEntryRedirect entry={id} />;
}
