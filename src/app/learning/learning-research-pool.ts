// 研究候选池托管在 Supabase Storage 公共桶：采集机器人直写，秒级上线，不再经过 git/部署。
// 纯字符串工具，零依赖，客户端与服务端两侧均可安全导入。
export const LEARNING_RESEARCH_BUCKET = "learning-research";

export function learningResearchPoolObjectUrl(objectPath: string): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${LEARNING_RESEARCH_BUCKET}/${objectPath}`;
}

export function learningResearchPoolUrl(): string | null {
  return learningResearchPoolObjectUrl("latest.json");
}
