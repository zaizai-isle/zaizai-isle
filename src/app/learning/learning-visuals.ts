export interface LearningDetail {
  title: string;
  text: string;
  alt: string;
  // Normalized source-image rectangle: x, y, width, height.
  crop: [number, number, number, number];
}

export interface LearningVisual {
  asset: string;
  width: number;
  height: number;
  alt: string;
  category: string;
  medium: string;
  credit: string;
  source: string;
  original: string;
  license: string;
  licenseUrl: string;
  note: string;
  details: LearningDetail[];
}

export const learningVisuals: Record<string, LearningVisual> = {
  "hokusai-great-wave": {
    asset: "wave", width: 1200, height: 807,
    alt: "完整的《神奈川冲浪里》：蓝色巨浪围住几艘船，远处的富士山落在浪弧下方。",
    category: "绘画", medium: "木版画", credit: "The Metropolitan Museum of Art · JP1847",
    source: "https://www.metmuseum.org/art/collection/search/45434",
    original: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/45434/134438/main-image",
    license: "Public Domain", licenseUrl: "https://www.metmuseum.org/about-the-met/policies-and-documents/open-access",
    note: "保留完整画面；站内图片仅缩放与压缩，以下细节为原作局部。",
    details: [
      { title: "浪与山之间", text: "巨大的浪围出一道弧线，远处的山落在其中。试着来回看它们，感受画面的尺度差。", alt: "浪的弧线与远处的小富士山，展示前景与远景的尺度差。", crop: [0.22, 0.19, 0.60, 0.64] },
      { title: "船与人之间", text: "找到船上俯身的人，再回看整片浪。人的尺度让浪的压迫感变得具体。", alt: "画面右侧的船与船上俯身的人物。", crop: [0.51, 0.43, 0.47, 0.36] },
    ],
  },
  "bauhaus-chair-b3": {
    asset: "chair", width: 1562, height: 1467,
    alt: "瓦西里椅的完整照片：弯曲金属管形成框架，黑色承托面悬在框架之间。",
    category: "家具", medium: "钢管家具", credit: "照片 © 1971markus@wikipedia.de",
    source: "https://commons.wikimedia.org/wiki/File:Marcel_Breuer_-_Wassily_Chair.jpg",
    original: "https://upload.wikimedia.org/wikipedia/commons/d/de/Marcel_Breuer_-_Wassily_Chair.jpg",
    license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    note: "照片拍摄于 2015 年，展示该设计的后期实例。缩放、压缩及局部展示沿用 CC BY-SA 4.0；不是 1925 年原型的档案照片。",
    details: [
      { title: "留空，也是一种形状", text: "沿着金属管的转折看一圈，再看框架之间的空隙。椅子的轮廓由线条围出来，背景仍能穿过它。", alt: "椅子的框架与承托面局部，能看到管材之间的留空。", crop: [0.12, 0.23, 0.76, 0.65] },
    ],
  },
  "london-underground-map": {
    asset: "map", width: 1024, height: 715,
    alt: "1933 年伦敦地铁线路图，彩色线路以直线和转角组织站点，泰晤士河横穿图中。",
    category: "信息设计", medium: "线路图", credit: "Harry Beck · Wikimedia Commons",
    source: "https://commons.wikimedia.org/wiki/File:Beckmap1.jpg",
    original: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Beckmap1.jpg",
    license: "Public Domain（来源页标注）", licenseUrl: "https://commons.wikimedia.org/wiki/File:Beckmap1.jpg#Licensing",
    note: "1933 年地图扫描图，保留完整画面。站内仅缩放、压缩；局部用于观察线网结构，不作为现行出行地图。",
    details: [
      { title: "先看连接，再看距离", text: "挑一条颜色，从一个站点沿线走到下一个站点。直线和规则的转角让视线容易跟随；换乘的位置比地面的真实距离更突出。", alt: "伦敦地铁线路图中央的彩色线路与换乘关系局部。", crop: [0.25, 0.25, 0.50, 0.50] },
    ],
  },
};

export function learningImagePath(asset: string, size: "small" | "medium" | "large" = "large") {
  // Commons images retain their original host and attribution. The Met image is
  // served locally in three sizes. No full-resolution media enters the homepage.
  if (asset === "chair") {
    return size === "large" ? "https://upload.wikimedia.org/wikipedia/commons/d/de/Marcel_Breuer_-_Wassily_Chair.jpg" : `https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/Marcel_Breuer_-_Wassily_Chair.jpg/${size === "small" ? 330 : 960}px-Marcel_Breuer_-_Wassily_Chair.jpg`;
  }
  if (asset === "map") {
    return size === "large" ? "https://upload.wikimedia.org/wikipedia/commons/3/3e/Beckmap1.jpg" : `https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/Beckmap1.jpg/${size === "small" ? 330 : 960}px-Beckmap1.jpg`;
  }
  return `/zaizai-isle/learning/${asset}-${size}.webp`;
}
