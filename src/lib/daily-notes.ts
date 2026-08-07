export type DailyLanguage = "zh" | "en";
export type DailySeason = "spring" | "summer" | "autumn" | "winter";

export interface DailyNoteContent {
  lines: string[];
  author: string;
  source: string;
  label: string;
}

interface DailyNoteEntry {
  zh: DailyNoteContent;
  en: DailyNoteContent;
}

export interface DailyNote extends DailyNoteContent {
  index: number;
}

export interface TraditionalDate {
  lunar: string;
  solarTerm: string;
}

const SOLAR_TERMS_ZH = [
  "小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨",
  "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑",
  "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至",
] as const;

const SOLAR_TERMS_EN = [
  "Minor Cold", "Major Cold", "Start of Spring", "Rain Water", "Awakening of Insects", "Spring Equinox", "Pure Brightness", "Grain Rain",
  "Start of Summer", "Grain Full", "Grain in Ear", "Summer Solstice", "Minor Heat", "Major Heat", "Start of Autumn", "End of Heat",
  "White Dew", "Autumn Equinox", "Cold Dew", "Frost's Descent", "Start of Winter", "Minor Snow", "Major Snow", "Winter Solstice",
] as const;

// Minutes from the conventional 1900 solar-term epoch. This compact table is
// commonly used for civil-calendar display and is reliable for 1900–2100.
const SOLAR_TERM_MINUTES = [
  0, 21208, 42467, 63836, 85337, 107014, 128867, 150921,
  173149, 195551, 218072, 240693, 263343, 285989, 308563, 331033,
  353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758,
] as const;

const SOLAR_TERM_EPOCH = Date.UTC(1900, 0, 6, 2, 5);
const TROPICAL_YEAR_MS = 31_556_925_974.7;

function solarTermTime(year: number, termIndex: number): number {
  return SOLAR_TERM_EPOCH
    + TROPICAL_YEAR_MS * (year - 1900)
    + SOLAR_TERM_MINUTES[termIndex] * 60_000;
}

function getSolarTerm(date: Date, language: DailyLanguage): string {
  // Compare at the end of the selected civil day in China Standard Time.
  const selected = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 15, 59, 59);
  let termIndex = 23;

  for (let index = 0; index < SOLAR_TERM_MINUTES.length; index += 1) {
    const boundary = solarTermTime(date.getFullYear(), index);
    if (boundary <= selected) {
      termIndex = index;
    } else {
      break;
    }
  }

  return language === "zh" ? SOLAR_TERMS_ZH[termIndex] : SOLAR_TERMS_EN[termIndex];
}

function toChineseLunarDay(day: number): string {
  const numerals = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  if (day <= 10) return `初${numerals[day - 1]}`;
  if (day < 20) return `十${numerals[day - 11]}`;
  if (day === 20) return "二十";
  if (day < 30) return `廿${numerals[day - 21]}`;
  return "三十";
}

export function getTraditionalDate(date: Date, language: DailyLanguage): TraditionalDate {
  const formatter = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
    month: "long",
    day: "numeric",
  });
  const parts = formatter.formatToParts(date);
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = Number(parts.find((part) => part.type === "day")?.value ?? 1);
  const lunar = language === "zh"
    ? `${month}${toChineseLunarDay(day)}`
    : `Lunar ${month} ${day}`;

  return { lunar, solarTerm: getSolarTerm(date, language) };
}

// Public-domain poetry and short original island observations. English entries
// are independently curated rather than literal translations of the Chinese.
const DAILY_NOTES: DailyNoteEntry[] = [
  {
    zh: { lines: ["山中何事？", "松花酿酒，春水煎茶。"], author: "张可久", source: "人月圆·山中书事", label: "山林" },
    en: { lines: ["Let the day arrive", "before you ask it for answers."], author: "Zaizai Isle", source: "Island Note", label: "Arrival" },
  },
  {
    zh: { lines: ["行到水穷处，", "坐看云起时。"], author: "王维", source: "终南别业", label: "从容" },
    en: { lines: ["A quiet beginning", "is still a beginning."], author: "Zaizai Isle", source: "Island Note", label: "Beginning" },
  },
  {
    zh: { lines: ["掬水月在手，", "弄花香满衣。"], author: "于良史", source: "春山夜月", label: "春夜" },
    en: { lines: ["Some things become clear", "only when we stop chasing clarity."], author: "Zaizai Isle", source: "Island Note", label: "Clarity" },
  },
  {
    zh: { lines: ["相看两不厌，", "只有敬亭山。"], author: "李白", source: "独坐敬亭山", label: "相看" },
    en: { lines: ["Stay with this moment.", "It knows where the path begins."], author: "Zaizai Isle", source: "Island Note", label: "Now" },
  },
  {
    zh: { lines: ["绿蚁新醅酒，", "红泥小火炉。"], author: "白居易", source: "问刘十九", label: "相聚" },
    en: { lines: ["Leave a little room", "for the unexpected to enter."], author: "Zaizai Isle", source: "Island Note", label: "Possibility" },
  },
  {
    zh: { lines: ["晚来天欲雪，", "能饮一杯无？"], author: "白居易", source: "问刘十九", label: "冬日" },
    en: { lines: ["Warmth often begins", "with a small light kept nearby."], author: "Zaizai Isle", source: "Island Note", label: "Warmth" },
  },
  {
    zh: { lines: ["明月松间照，", "清泉石上流。"], author: "王维", source: "山居秋暝", label: "清寂" },
    en: { lines: ["Listen long enough", "and silence becomes a landscape."], author: "Zaizai Isle", source: "Island Note", label: "Listening" },
  },
  {
    zh: { lines: ["人闲桂花落，", "夜静春山空。"], author: "王维", source: "鸟鸣涧", label: "幽静" },
    en: { lines: ["Morning does not hurry,", "yet everything begins."], author: "Zaizai Isle", source: "Island Note", label: "Morning" },
  },
  {
    zh: { lines: ["月出惊山鸟，", "时鸣春涧中。"], author: "王维", source: "鸟鸣涧", label: "春山" },
    en: { lines: ["Be gentle with the part of you", "that is still learning the way."], author: "Zaizai Isle", source: "Island Note", label: "Gentleness" },
  },
  {
    zh: { lines: ["竹喧归浣女，", "莲动下渔舟。"], author: "王维", source: "山居秋暝", label: "暮色" },
    en: { lines: ["Hope rarely announces itself.", "Sometimes it simply stays."], author: "Zaizai Isle", source: "Island Note", label: "Hope" },
  },
  {
    zh: { lines: ["海上生明月，", "天涯共此时。"], author: "张九龄", source: "望月怀远", label: "明月" },
    en: { lines: ["Distance feels softer", "under the same moon."], author: "Zaizai Isle", source: "Island Note", label: "Moonlight" },
  },
  {
    zh: { lines: ["潮平两岸阔，", "风正一帆悬。"], author: "王湾", source: "次北固山下", label: "远行" },
    en: { lines: ["A steady wind is enough", "when the sail knows its direction."], author: "Zaizai Isle", source: "Island Note", label: "Direction" },
  },
  {
    zh: { lines: ["晴空一鹤排云上，", "便引诗情到碧霄。"], author: "刘禹锡", source: "秋词", label: "高远" },
    en: { lines: ["Look up.", "The day may be wider than it felt."], author: "Zaizai Isle", source: "Island Note", label: "Wonder" },
  },
  {
    zh: { lines: ["沉舟侧畔千帆过，", "病树前头万木春。"], author: "刘禹锡", source: "酬乐天扬州初逢席上见赠", label: "新生" },
    en: { lines: ["New growth often starts", "beside what has already fallen."], author: "Zaizai Isle", source: "Island Note", label: "Renewal" },
  },
  {
    zh: { lines: ["我见青山多妩媚，", "料青山见我应如是。"], author: "辛弃疾", source: "贺新郎·甚矣吾衰矣", label: "青山" },
    en: { lines: ["Meet the world with warmth,", "and notice what looks back."], author: "Zaizai Isle", source: "Island Note", label: "Encounter" },
  },
  {
    zh: { lines: ["一松一竹真朋友，", "山鸟山花好弟兄。"], author: "辛弃疾", source: "鹧鸪天·博山寺作", label: "知己" },
    en: { lines: ["Good company can be quiet:", "a tree, a window, a familiar path."], author: "Zaizai Isle", source: "Island Note", label: "Company" },
  },
  {
    zh: { lines: ["小舟从此逝，", "江海寄余生。"], author: "苏轼", source: "临江仙·夜饮东坡醒复醉", label: "江海" },
    en: { lines: ["Not every departure is an ending.", "Some are a wider kind of home."], author: "Zaizai Isle", source: "Island Note", label: "Departure" },
  },
  {
    zh: { lines: ["竹杖芒鞋轻胜马，", "谁怕？一蓑烟雨任平生。"], author: "苏轼", source: "定风波·莫听穿林打叶声", label: "自在" },
    en: { lines: ["Walk lightly through the rain.", "The road is still the road."], author: "Zaizai Isle", source: "Island Note", label: "Courage" },
  },
  {
    zh: { lines: ["回首向来萧瑟处，", "归去，也无风雨也无晴。"], author: "苏轼", source: "定风波·莫听穿林打叶声", label: "归去" },
    en: { lines: ["When the weather passes,", "you may find the sky was never your enemy."], author: "Zaizai Isle", source: "Island Note", label: "Weather" },
  },
  {
    zh: { lines: ["且将新火试新茶，", "诗酒趁年华。"], author: "苏轼", source: "望江南·超然台作", label: "年华" },
    en: { lines: ["Make something small today.", "Let it be enough."], author: "Zaizai Isle", source: "Island Note", label: "Making" },
  },
  {
    zh: { lines: ["此心安处是吾乡。"], author: "苏轼", source: "定风波·南海归赠王定国侍人寓娘", label: "心安" },
    en: { lines: ["Home is sometimes the place", "where your breathing becomes quiet."], author: "Zaizai Isle", source: "Island Note", label: "Home" },
  },
  {
    zh: { lines: ["水光潋滟晴方好，", "山色空蒙雨亦奇。"], author: "苏轼", source: "饮湖上初晴后雨", label: "湖光" },
    en: { lines: ["Clear light and soft rain", "belong to the same landscape."], author: "Zaizai Isle", source: "Island Note", label: "Landscape" },
  },
  {
    zh: { lines: ["欲把西湖比西子，", "淡妆浓抹总相宜。"], author: "苏轼", source: "饮湖上初晴后雨", label: "相宜" },
    en: { lines: ["There is more than one way", "for a day to be beautiful."], author: "Zaizai Isle", source: "Island Note", label: "Beauty" },
  },
  {
    zh: { lines: ["荷风送香气，", "竹露滴清响。"], author: "孟浩然", source: "夏日南亭怀辛大", label: "夏夜" },
    en: { lines: ["A breeze can carry", "what words leave behind."], author: "Zaizai Isle", source: "Island Note", label: "Summer" },
  },
  {
    zh: { lines: ["野旷天低树，", "江清月近人。"], author: "孟浩然", source: "宿建德江", label: "江月" },
    en: { lines: ["Under an open sky,", "even a small step has room."], author: "Zaizai Isle", source: "Island Note", label: "Room" },
  },
  {
    zh: { lines: ["微微风簇浪，", "散作满河星。"], author: "查慎行", source: "舟夜书所见", label: "星河" },
    en: { lines: ["The river keeps the stars", "without asking them to stay."], author: "Zaizai Isle", source: "Island Note", label: "Starlight" },
  },
  {
    zh: { lines: ["有约不来过夜半，", "闲敲棋子落灯花。"], author: "赵师秀", source: "约客", label: "等候" },
    en: { lines: ["Waiting is not empty", "when attention is awake."], author: "Zaizai Isle", source: "Island Note", label: "Waiting" },
  },
  {
    zh: { lines: ["春有百花秋有月，", "夏有凉风冬有雪。"], author: "无门慧开", source: "颂平常心是道", label: "四时" },
    en: { lines: ["Every season brings", "its own way of being enough."], author: "Zaizai Isle", source: "Island Note", label: "Seasons" },
  },
  {
    zh: { lines: ["若无闲事挂心头，", "便是人间好时节。"], author: "无门慧开", source: "颂平常心是道", label: "好时节" },
    en: { lines: ["A quiet mind can turn", "an ordinary day into a good season."], author: "Zaizai Isle", source: "Island Note", label: "Ease" },
  },
  {
    zh: { lines: ["春水碧于天，", "画船听雨眠。"], author: "韦庄", source: "菩萨蛮·人人尽说江南好", label: "江南" },
    en: { lines: ["Let the rain speak softly.", "You do not need to answer everything."], author: "Zaizai Isle", source: "Island Note", label: "Rain" },
  },
  {
    zh: { lines: ["醉后不知天在水，", "满船清梦压星河。"], author: "唐珙", source: "题龙阳县青草湖", label: "清梦" },
    en: { lines: ["Dreams need no map", "to find their way across the night."], author: "Zaizai Isle", source: "Island Note", label: "Dreaming" },
  },
  {
    zh: { lines: ["今夜偏知春气暖，", "虫声新透绿窗纱。"], author: "刘方平", source: "月夜", label: "春信" },
    en: { lines: ["A new sound at the window", "can be the first sign of spring."], author: "Zaizai Isle", source: "Island Note", label: "Spring" },
  },
];

const DAY_MS = 86_400_000;
const CONTENT_EPOCH = Date.UTC(2024, 0, 1);

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

export function getTodayKey(): string {
  return toDateKey(new Date());
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function getDailyNote(date: Date, language: DailyLanguage): DailyNote {
  const utcDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const dayOffset = Math.floor((utcDate - CONTENT_EPOCH) / DAY_MS);
  const index = ((dayOffset % DAILY_NOTES.length) + DAILY_NOTES.length) % DAILY_NOTES.length;
  return { ...DAILY_NOTES[index][language], index };
}

export function getSeason(monthIndex: number): DailySeason {
  if (monthIndex >= 2 && monthIndex <= 4) return "spring";
  if (monthIndex >= 5 && monthIndex <= 7) return "summer";
  if (monthIndex >= 8 && monthIndex <= 10) return "autumn";
  return "winter";
}
