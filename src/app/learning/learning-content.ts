import type { LearningVisual } from "./learning-visuals";

export type LearningReaction = "interesting" | "neutral" | "unclear";

export interface LearningEntry {
  id: string;
  contentId?: string;
  publishDate: string;
  title: string;
  subject: string;
  era: string;
  summary: string;
  context: string;
  influence: string;
  question: string;
  creator: string;
  sourceLabel: string;
  sourceUrl: string;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  imageCredit?: string;
  imageLicense?: string;
  imageLicenseUrl?: string;
  medium?: string;
  category?: string;
  observations?: { heading: string; body: string; assetIds?: string[]; crop?: LearningImageCrop }[];
  assets?: LearningArticleAsset[];
  isPublishedRecord?: boolean;
  visualSnapshot?: LearningVisual;
}

export interface LearningArticleAsset {
  id: string;
  role: "main" | "detail" | "comparison";
  imageUrl: string;
  sourceUrl: string;
  width: number;
  height: number;
  alt: string;
  attribution: string;
  rightsStatement: string;
  licenseUrl: string;
  crop?: LearningImageCrop;
}

export interface LearningImageCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const learningEntries: LearningEntry[] = [
  {
    id: "bauhaus-chair-b3",
    publishDate: "2026-10-14",
    title: "一把椅子为什么像一辆自行车？",
    subject: "瓦西里椅（B3 椅）",
    era: "1925 · 包豪斯",
    summary: "马塞尔·布劳耶把自行车车架使用的弯曲钢管带进家具，让椅子从厚重木作变成悬在空气里的线条。",
    context: "工业生产正在改变日常生活。包豪斯的设计者关心的不只是造型，而是怎样让新的材料、机器与现代居住方式彼此适应。最早的 B3 椅由钢管和帆布组成，结构几乎全部显露在外。",
    influence: "今天常见的金属框架家具、轻量办公椅，以及“诚实展示结构”的产品语言，都能看到这种思路的延续。它后来被称为瓦西里椅，但这个名字并非最初设计时就有。",
    question: "如果把软垫和装饰都拿走，你觉得这把椅子更像家具、机器，还是一张空间里的线稿？",
    creator: "Marcel Breuer",
    sourceLabel: "The Metropolitan Museum of Art",
    sourceUrl: "https://www.metmuseum.org/art/collection/search/485067",
  },
  {
    id: "hokusai-great-wave",
    publishDate: "2026-10-15",
    title: "浪这么大，山为什么这么小？",
    subject: "神奈川冲浪里",
    era: "约 1830–1832 · 江户时代",
    summary: "先看几秒：你有没有注意到，浪下面还有一座富士山？",
    context: "这幅作品属于《富嶽三十六景》。北斋利用透视，让富士山在近处的巨浪旁显得很小；靛蓝与进口普鲁士蓝也构成了这组风景鲜明的视觉特色。",
    influence: "看画时，可以留意：吸引注意的不只是物体本身，还有它与周围事物的大小关系。试着把这个观察带到下一张海报或照片里。",
    question: "看过细节后，再看完整画面：最吸引你的地方变了吗？",
    creator: "葛饰北斋",
    sourceLabel: "The Metropolitan Museum of Art",
    sourceUrl: "https://www.metmuseum.org/art/collection/search/45434",
  },
  {
    id: "london-underground-map",
    publishDate: "2026-10-16",
    title: "地图不准确，为什么反而更好用？",
    subject: "伦敦地铁线路图",
    era: "1931–1933 · 信息设计",
    summary: "哈里·贝克放弃真实地理比例，把线路整理成水平、垂直和 45 度角，让乘客优先看懂站点关系。",
    context: "复杂的交通网络若照地理距离绘制，市中心站点会挤在一起。贝克借用了电路图的逻辑：地图不再回答“相距多远”，而是回答“怎样换乘”。",
    influence: "世界各地的公共交通图都延续了拓扑式表达。它提醒设计者：准确不等于把现实原样搬来，而是忠于用户真正需要解决的问题。",
    question: "当设计主动省略真实距离时，你觉得它是在简化，还是在重新定义准确？",
    creator: "Harry Beck",
    sourceLabel: "London Transport Museum",
    sourceUrl: "https://artsandculture.google.com/asset/pocket-underground-map-henry-c-beck/AQGrQloi9u07rQ",
  },
  {
    id: "cassandre-nord-express",
    publishDate: "2026-10-17",
    title: "速度能被画成什么形状？",
    subject: "Nord Express 海报",
    era: "1927 · 装饰艺术",
    summary: "卡桑德尔用夸张透视的车轮、斜向轨道和紧缩文字，把列车尚未移动的纸面变成速度的体验。",
    context: "旅游和交通广告需要在街头很短的注视时间内传达目的地与现代感。几何构图和无衬线字体让信息与形象成为一个整体。",
    influence: "品牌海报、运动广告和电影片名仍在使用尺度反差与斜线制造动势。视觉并不真的移动，却能让身体预先感到方向。",
    question: "遮住列车名称之后，你还能从哪些线索判断它在表达“快”？",
    creator: "A. M. Cassandre",
    sourceLabel: "MoMA",
    sourceUrl: "https://www.moma.org/collection/works/105963/",
  },
  {
    id: "rams-radio",
    publishDate: "2026-10-18",
    title: "克制为什么也会成为一种风格？",
    subject: "Braun RT 20 收音机",
    era: "1961 · 德国功能主义",
    summary: "迪特·拉姆斯把控制件排成可理解的秩序，让产品不过度争夺注意力。",
    context: "战后德国设计强调清晰、耐用与适合工业生产。白色外壳、规则网孔和有限的按钮不是“没有设计”，而是持续删去不服务于使用的表达。",
    influence: "这种克制的产品语言影响了后来大量消费电子，也塑造了我们对“高级”“专业”和“直觉”的视觉判断。",
    question: "你觉得这种安静的外观是在帮助使用，还是也在悄悄建立一种审美权威？",
    creator: "Dieter Rams",
    sourceLabel: "Centre Pompidou",
    sourceUrl: "https://www.centrepompidou.fr/en/ressources/oeuvre/coXykbj",
  },
];

// Only entries with verified display assets are eligible for the daily feature.
export const illustratedEntryIds = ["bauhaus-chair-b3", "hokusai-great-wave", "london-underground-map"];

export function pickInitialEntry(today: string) {
  const available = learningEntries.filter((entry) => illustratedEntryIds.includes(entry.id));
  return available.filter((entry) => entry.publishDate <= today).at(-1) ?? available[0];
}
