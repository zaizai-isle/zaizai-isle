import type { FilterId } from "./canvas-renderer";

export type StampStyleId = "classic" | "date" | "journal";
export type PhotoTextureId = "original" | "fade" | "film" | "photocopy" | "experimental";

export interface StampDraft {
  achievementId?: string;
  title: string;
  category: string;
  icon: string;
  date: string;
  note: string;
  description: string;
  location: string;
  style: StampStyleId;
  texture: PhotoTextureId;
  experimentalFilter: FilterId;
}

export interface StampStyleDefinition {
  id: StampStyleId;
  label: string;
  description: string;
  mark: string;
}

export interface PhotoTextureDefinition {
  id: PhotoTextureId;
  label: string;
  description: string;
}

export const STAMP_STYLES: StampStyleDefinition[] = [
  { id: "classic", label: "经典圆章", description: "像一次郑重的抵达确认", mark: "抵达" },
  { id: "date", label: "日期方章", description: "像留在纸页上的时间凭证", mark: "2026" },
  { id: "journal", label: "手帐异形章", description: "更轻松、私人，也保留手作感", mark: "↗" },
];

export const PHOTO_TEXTURES: PhotoTextureDefinition[] = [
  { id: "original", label: "原片", description: "保留这一刻本来的颜色" },
  { id: "fade", label: "褪色", description: "像被时间保存过的照片" },
  { id: "film", label: "胶片", description: "温暖、低对比的旅途质感" },
  { id: "photocopy", label: "复印", description: "黑白档案与票据质感" },
  { id: "experimental", label: "实验", description: "使用原有字符与像素滤镜" },
];

export function createInitialStampDraft(): StampDraft {
  return {
    title: "",
    category: "日常小确幸",
    icon: "✦",
    date: new Date().toLocaleDateString("en-CA"),
    note: "",
    description: "",
    location: "",
    style: "classic",
    texture: "original",
    experimentalFilter: "ascii",
  };
}
