// 护照列表的按需视图数据：先记录、后缩略图，坏图只影响自己那一张。
// 依赖注入（photo loader / object URL）以便离线单测。
import type { StampRecord } from "./passport-storage";

export type StampThumbState =
  | { status: "loading" }
  | { status: "empty"; reason: "无照片" | "照片记录缺失" }
  | { status: "ready"; url: string }
  | { status: "error"; message: string };

export type PhotoLike = { thumbnailBlob: Blob; sourceBlob: Blob };

/** 单张缩略图读取：任何失败都被隔离成本卡片的 error 态，绝不冒泡打断其余记录。 */
export async function loadStampThumb(
  stamp: Pick<StampRecord, "id" | "hasPhoto">,
  getPhoto: (stampId: string) => Promise<PhotoLike | undefined>,
  createUrl: (blob: Blob) => string,
): Promise<StampThumbState> {
  if (!stamp.hasPhoto) return { status: "empty", reason: "无照片" };
  try {
    const photo = await getPhoto(stamp.id);
    if (!photo) return { status: "empty", reason: "照片记录缺失" };
    return { status: "ready", url: createUrl(photo.thumbnailBlob) };
  } catch {
    return { status: "error", message: "这张缩略图暂时读不出来，其余记录不受影响。" };
  }
}

/** 原图+海报只在查看或导出时按单枚处理；失败同样只属于这一枚。 */
export async function loadStampPoster<T, S extends Pick<StampRecord, "id" | "hasPhoto">, P extends PhotoLike>(
  stamp: S,
  getPhoto: (stampId: string) => Promise<P | undefined>,
  render: (stamp: S, photo: P | undefined) => Promise<T>
): Promise<{ status: "ready"; poster: T } | { status: "error"; message: string }> {
  try {
    const photo = stamp.hasPhoto ? await getPhoto(stamp.id) : undefined;
    return { status: "ready", poster: await render(stamp, photo) };
  } catch {
    return { status: "error", message: "海报排版失败，请重试或检查这枚印章的照片。" };
  }
}
