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
  { id: "classic", label: "抵达圆章", description: "抵达的确认印章", mark: "抵达" },
  { id: "date", label: "日期凭证章", description: "纸页上的时间凭证", mark: "日期" },
  { id: "journal", label: "手帐纪念章", description: "轻松、私人、手作感", mark: "记住" },
];

export const PHOTO_TEXTURES: PhotoTextureDefinition[] = [
  { id: "original", label: "原片", description: "保留本来的色彩" },
  { id: "fade", label: "褪色", description: "时光洗练的色彩" },
  { id: "film", label: "胶片", description: "温暖的旅途质感" },
  { id: "photocopy", label: "复印", description: "复古的档案质感" },
  { id: "experimental", label: "实验", description: "字符与像素的实验" },
];

export function createInitialStampDraft(): StampDraft {
  return {
    title: "",
    category: "低谷与重生",
    icon: "✦",
    date: new Date().toLocaleDateString("en-CA"),
    note: "",
    location: "",
    style: "classic",
    texture: "original",
    experimentalFilter: "ascii",
  };
}
