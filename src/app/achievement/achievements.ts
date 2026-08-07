export type AchievementRarity = "普通" | "稀有" | "史诗" | "传说";

export interface LifeAchievement {
  id: string;
  category: string;
  icon: string;
  iconImage?: string;
  title: string;
  motto: string;
  description: string;
  rate: string;
  rarity: AchievementRarity;
}

export const ACHIEVEMENT_CATEGORIES = [
  "低谷与重生",
  "独立与成长",
  "工作与野心",
  "远行与突破",
  "爱与告别",
  "家人与归处",
  "身体与自洽",
  "长期主义",
  "日常小确幸",
] as const;

export const LIFE_ACHIEVEMENTS: LifeAchievement[] = [
  { id: "still-here", category: "低谷与重生", icon: "⛵", title: "今天没有消失", motto: "轻舟已过万重山", description: "最难熬的那段日子里，你还是吃了饭、回了消息，也把今天过完。", rate: "0.8%", rarity: "传说" },
  { id: "restart", category: "低谷与重生", icon: "🌱", title: "重新开机", motto: "沉舟侧畔千帆过", description: "你承认自己需要停机，也亲手按下了重新开始。", rate: "3.6%", rarity: "史诗" },
  { id: "bloom", category: "低谷与重生", icon: "🔥", title: "废墟上开花", motto: "野火烧不尽", description: "失去旧地图之后，你用手边的材料搭起了新的生活。", rate: "5.4%", rarity: "史诗" },
  { id: "daylight", category: "低谷与重生", icon: "🌅", title: "终于见天光", motto: "原来长夜真的会结束", description: "那些只能数着分钟熬过的时刻，如今已经留在身后。", rate: "7.1%", rarity: "稀有" },

  { id: "own-room", category: "独立与成长", icon: "🔑", title: "自己的房间", motto: "门钥匙只听你的", description: "你第一次拥有一处可以按自己心意生活的小空间。", rate: "8.2%", rarity: "稀有" },
  { id: "first-pay", category: "独立与成长", icon: "💳", title: "为自己买单", motto: "这一程由我结账", description: "你第一次用自己赚的钱，完整付清一个月的生活。", rate: "6.8%", rarity: "稀有" },
  { id: "say-no", category: "独立与成长", icon: "🛡", title: "学会说不", motto: "边界不是一道歉", description: "你拒绝了不愿承担的期待，也没有急着解释自己。", rate: "4.9%", rarity: "史诗" },
  { id: "own-choice", category: "独立与成长", icon: "🧭", title: "自己做决定", motto: "地图可以自己画", description: "这一次你听完所有意见，然后选择了自己的答案。", rate: "9.3%", rarity: "稀有" },

  { id: "break-wall", category: "工作与野心", icon: "⛏", title: "熬过瓶颈", motto: "守得云开见月明", description: "重复、停滞、怀疑自己之后，你依然留在这件事里。", rate: "3.7%", rarity: "史诗" },
  { id: "ship-it", category: "工作与野心", icon: "🚀", title: "作品已上线", motto: "完成比完美更接近远方", description: "你把脑海里的东西做成了一个别人真的可以使用的作品。", rate: "5.1%", rarity: "史诗" },
  { id: "new-skill", category: "工作与野心", icon: "⚙", title: "技能树 +1", motto: "陌生正在变成肌肉记忆", description: "你越过最笨拙的阶段，学会了一件曾经完全不会的事。", rate: "12.6%", rarity: "稀有" },
  { id: "quiet-win", category: "工作与野心", icon: "🏆", title: "无人见证的胜利", motto: "掌声缺席，成果没有", description: "没有庆功和热搜，但你知道今天完成的事很重要。", rate: "2.9%", rarity: "史诗" },

  { id: "solo-trip", category: "远行与突破", icon: "🎒", title: "一个人出发", motto: "世界在门外加载", description: "没有熟悉的人陪同，你仍然把目的地变成了抵达。", rate: "8.7%", rarity: "稀有" },
  { id: "new-city", category: "远行与突破", icon: "🏙", title: "陌生城市存档", motto: "坐标改变，故事继续", description: "你在一个没有旧习惯保护的地方，重新安排了生活。", rate: "6.2%", rarity: "稀有" },
  { id: "missed-train", category: "远行与突破", icon: "🚉", title: "走错也抵达", motto: "岔路也算地图", description: "计划没有照常发生，但你在意外的路线里找到了出口。", rate: "14.8%", rarity: "普通" },
  { id: "farther", category: "远行与突破", icon: "⛰", title: "比昨天更远", motto: "边界向外挪了一格", description: "你去到了曾经只在屏幕和想象里见过的地方。", rate: "10.4%", rarity: "稀有" },

  { id: "goodbye", category: "爱与告别", icon: "🕊", title: "体面告别", motto: "谢谢你来过", description: "你没有靠伤害留住谁，也没有用结局否定曾经的美好。", rate: "4.5%", rarity: "史诗" },
  { id: "love-again", category: "爱与告别", icon: "❤", title: "再次相信", motto: "旧伤没有关闭新入口", description: "你带着记忆继续靠近，而不是让过去替未来做决定。", rate: "3.2%", rarity: "史诗" },
  { id: "apology", category: "爱与告别", icon: "✉", title: "认真道歉", motto: "不是为了赢回合", description: "你说清自己做错了什么，并把对方的感受放在辩解之前。", rate: "7.6%", rarity: "稀有" },
  { id: "let-go", category: "爱与告别", icon: "🍃", title: "允许离开", motto: "松手也是一种完成", description: "你停止反复追问原因，让一段关系停在它真实结束的位置。", rate: "5.9%", rarity: "史诗" },

  { id: "home-meal", category: "家人与归处", icon: "🍚", title: "回家吃饭", motto: "灯亮着，饭还热", description: "走了很远以后，你又坐回那张熟悉的桌子旁。", rate: "18.5%", rarity: "普通" },
  { id: "call-home", category: "家人与归处", icon: "☎", title: "主动报平安", motto: "让牵挂先落地", description: "没有等到被询问，你先告诉在意你的人：一切都好。", rate: "21.3%", rarity: "普通" },
  { id: "understand", category: "家人与归处", icon: "🏠", title: "理解来时路", motto: "看见他们也曾年轻", description: "你不再只用结果审视家人，开始理解他们当时拥有的选项。", rate: "6.5%", rarity: "稀有" },
  { id: "chosen-home", category: "家人与归处", icon: "🪴", title: "把异乡住成家", motto: "归处可以亲手栽种", description: "你在陌生坐标里养活植物、关系和自己的日常。", rate: "9.7%", rarity: "稀有" },

  { id: "good-sleep", category: "身体与自洽", icon: "🌙", title: "一夜好眠", motto: "世界安静了八小时", description: "你没有追赶任何事，只让身体完整地休息了一晚。", rate: "16.2%", rarity: "普通" },
  { id: "ask-help", category: "身体与自洽", icon: "🤝", title: "开口求助", motto: "不必独自通关", description: "你承认一个人扛不动，并允许别人来到你的关卡。", rate: "4.2%", rarity: "史诗" },
  { id: "ordinary", category: "身体与自洽", icon: "☁", title: "允许普通", motto: "不发光也完整", description: "你不再要求每一天都值得展示，平常也可以被好好度过。", rate: "8.9%", rarity: "稀有" },
  { id: "walk-out", category: "身体与自洽", icon: "👟", title: "走出家门", motto: "今天和风碰了面", description: "哪怕只走了一小段，你也让身体重新进入真实的世界。", rate: "13.1%", rarity: "普通" },

  { id: "hundred-days", category: "长期主义", icon: "📆", title: "第一百天", motto: "微小重复开始有了形状", description: "没有戏剧性的爆发，你只是把同一件事认真做了很久。", rate: "2.4%", rarity: "史诗" },
  { id: "slow-build", category: "长期主义", icon: "🧱", title: "缓慢建成", motto: "进度条仍然向前", description: "成果来得比预想晚，但你没有拿速度否定积累。", rate: "5.7%", rarity: "史诗" },
  { id: "keep-note", category: "长期主义", icon: "📓", title: "留下记录", motto: "时间有了可读的纹理", description: "你持续写下过程，让成长不再只能依靠模糊的回忆。", rate: "7.8%", rarity: "稀有" },
  { id: "return", category: "长期主义", icon: "🔁", title: "再次回来", motto: "中断不等于结束", description: "停下之后你没有羞于重返，今天又继续做了一点。", rate: "11.2%", rarity: "稀有" },

  { id: "enough", category: "日常小确幸", icon: "☕", title: "今天够用了", motto: "晚饭以后可以关掉电脑", description: "你允许一天不被效率填满，并且没有因此责怪自己。", rate: "19.4%", rarity: "普通" },
  { id: "sun", category: "日常小确幸", icon: "☀", title: "晒到太阳", motto: "获得今日份自然充电", description: "你停下来站在光里，没有把这几分钟分配给别的任务。", rate: "31.6%", rarity: "普通" },
  { id: "favorite", category: "日常小确幸", icon: "🍜", title: "吃到想吃的", motto: "愿望在餐桌上兑现", description: "你没有用更重要的事推迟这份简单而明确的快乐。", rate: "27.8%", rarity: "普通" },
  { id: "tiny-finish", category: "日常小确幸", icon: "✓", title: "小事已完成", motto: "清单上少了一颗石子", description: "那件拖了很久的小事，终于从脑海里被你轻轻划掉。", rate: "22.5%", rarity: "普通" },
];

export const DEFAULT_ACHIEVEMENT = LIFE_ACHIEVEMENTS[0];
