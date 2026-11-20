import LearningEntryRedirect from "../LearningEntryRedirect";
import legacyLinks from "../legacy-learning-links.json";

// Frozen at the November 19 migration. Article visibility is checked when
// the destination loads, so a database outage or takedown cannot remove a shell.
export function generateStaticParams() {
  return legacyLinks.map((id) => ({ id }));
}

export const dynamicParams = false;

export default async function LearningCompatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  // content_id 含 ":"，静态导出/预渲染时路由参数以 %3A 编码形态传入，解码后原样传给入口。
  let id = rawId;
  try { id = decodeURIComponent(rawId); } catch { /* 保留原值 */ }
  return <LearningEntryRedirect entry={id} />;
}
