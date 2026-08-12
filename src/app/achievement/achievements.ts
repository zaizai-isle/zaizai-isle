export interface LifeAchievement {
  id: string;
  category: string;
  icon: string;
  title: string;
  motto: string;
}

export const ACHIEVEMENT_CATEGORIES = [
  "低谷与重生",
  "独立与选择",
  "身心与自洽",
  "学习与创造",
  "工作与建成",
  "坚持与积累",
  "爱与告别",
  "家人与归处",
  "朋友与同行",
  "远行与突破",
  "善意与回响",
  "日常与欢喜",
] as const;

export const LIFE_ACHIEVEMENTS: LifeAchievement[] = [
  { id: "still-here", category: "低谷与重生", icon: "⛵", title: "今天仍然在场", motto: "轻舟已过万重山" },
  { id: "pause", category: "低谷与重生", icon: "⏸", title: "允许自己暂停", motto: "停下来不是认输" },
  { id: "ask-for-help", category: "低谷与重生", icon: "🤝", title: "第一次开口求助", motto: "不必独自通关" },
  { id: "hardest-night", category: "低谷与重生", icon: "🌙", title: "熬过最难的一夜", motto: "天亮就是答案" },
  { id: "rebuild-routine", category: "低谷与重生", icon: "🧹", title: "重新收拾生活", motto: "把散落的日子捡回来" },
  { id: "peace-with-past", category: "低谷与重生", icon: "🕊", title: "和过去握手言和", motto: "旧事不再替今天做决定" },
  { id: "bloom", category: "低谷与重生", icon: "🌱", title: "在废墟上开花", motto: "失去旧地图以后" },
  { id: "expect-tomorrow", category: "低谷与重生", icon: "🌅", title: "再次期待明天", motto: "心里重新有了以后" },

  { id: "own-choice", category: "独立与选择", icon: "🧭", title: "这次我来决定", motto: "地图可以自己画" },
  { id: "say-no", category: "独立与选择", icon: "🛡", title: "把“不”说出口", motto: "边界不是一道歉" },
  { id: "own-room", category: "独立与选择", icon: "🔑", title: "自己的房间", motto: "门钥匙只听你的" },
  { id: "pay-my-way", category: "独立与选择", icon: "💳", title: "为自己买单", motto: "这一程由我结账" },
  { id: "first-savings", category: "独立与选择", icon: "🪙", title: "攒下第一笔底气", motto: "选择开始有了余地" },
  { id: "solve-alone", category: "独立与选择", icon: "🧩", title: "一个人也解决了", motto: "原来我可以接住自己" },
  { id: "new-road", category: "独立与选择", icon: "↗", title: "换一条路走", motto: "转弯不等于偏航" },
  { id: "own-the-choice", category: "独立与选择", icon: "⚓", title: "为自己的选择负责", motto: "答案由我亲自生活" },

  { id: "good-sleep", category: "身心与自洽", icon: "🌙", title: "一夜好眠", motto: "世界安静了八小时" },
  { id: "proper-meal", category: "身心与自洽", icon: "🍚", title: "好好吃完一顿饭", motto: "今天也值得被喂饱" },
  { id: "care-for-body", category: "身心与自洽", icon: "🌿", title: "开始照顾身体", motto: "身体不是消耗品" },
  { id: "listen-to-body", category: "身心与自洽", icon: "🩺", title: "听见身体的提醒", motto: "疼痛不必靠忍耐证明" },
  { id: "mirror-peace", category: "身心与自洽", icon: "🪞", title: "不再和镜子作战", motto: "这副身体陪我至今" },
  { id: "rest-without-guilt", category: "身心与自洽", icon: "☁", title: "休息时不再内疚", motto: "空白也是生活的一部分" },
  { id: "accept-ordinary", category: "身心与自洽", icon: "🍃", title: "接受自己的普通", motto: "不发光也依然完整" },
  { id: "on-my-side", category: "身心与自洽", icon: "🫶", title: "站回自己这边", motto: "停止成为自己的敌人" },

  { id: "new-skill", category: "学习与创造", icon: "⚙", title: "技能树加一", motto: "陌生正在变成肌肉记忆" },
  { id: "ask-question", category: "学习与创造", icon: "?", title: "问出那个问题", motto: "好奇不必害怕显得无知" },
  { id: "finish-learning", category: "学习与创造", icon: "📖", title: "学完这一程", motto: "翻到了最后一页" },
  { id: "first-work", category: "学习与创造", icon: "✦", title: "第一件作品", motto: "从无到有，已经发生" },
  { id: "share-expression", category: "学习与创造", icon: "📣", title: "让表达被看见", motto: "把心里的东西交给世界" },
  { id: "receive-feedback", category: "学习与创造", icon: "💬", title: "接住真实反馈", motto: "被指出不足也没有碎掉" },
  { id: "another-version", category: "学习与创造", icon: "✏", title: "再改一版", motto: "完成以后还可以生长" },
  { id: "teach-others", category: "学习与创造", icon: "🏮", title: "把答案递给别人", motto: "走过的路开始照亮后来者" },

  { id: "first-income", category: "工作与建成", icon: "💰", title: "第一份收入", motto: "能力第一次有了回音" },
  { id: "graduate-rookie", category: "工作与建成", icon: "🎓", title: "新手村毕业", motto: "慌张正在变成熟练" },
  { id: "take-charge", category: "工作与建成", icon: "📌", title: "这件事我负责", motto: "名字写在责任后面" },
  { id: "ship-it", category: "工作与建成", icon: "🚀", title: "作品已上线", motto: "完成比完美更接近远方" },
  { id: "break-through", category: "工作与建成", icon: "⛏", title: "穿过瓶颈", motto: "停滞没有成为终点" },
  { id: "speak-for-worth", category: "工作与建成", icon: "📢", title: "为自己的价值开口", motto: "认真争取，不必羞于谈论" },
  { id: "leave-wrong-job", category: "工作与建成", icon: "🚪", title: "离开错误的工位", motto: "结束也是职业选择" },
  { id: "lasting-work", category: "工作与建成", icon: "🏗", title: "建成一件长久的事", motto: "时间会替成果继续说话" },

  { id: "day-seven", category: "坚持与积累", icon: "7", title: "第七天", motto: "重复开始有了节奏" },
  { id: "day-hundred", category: "坚持与积累", icon: "📆", title: "第一百天", motto: "微小重复有了形状" },
  { id: "unseen-practice", category: "坚持与积累", icon: "🎯", title: "无人看见的练习", motto: "掌声缺席，积累仍在" },
  { id: "return", category: "坚持与积累", icon: "↩", title: "再次回来", motto: "中断不等于结束" },
  { id: "finally-done", category: "坚持与积累", icon: "✓", title: "终于做完了", motto: "那个未完成项终于合上" },
  { id: "slow-build", category: "坚持与积累", icon: "🧱", title: "缓慢建成", motto: "进度条一直在向前" },
  { id: "one-year", category: "坚持与积累", icon: "🍂", title: "和一件事走过一年", motto: "四季替坚持作证" },
  { id: "keep-record", category: "坚持与积累", icon: "📓", title: "留下记录", motto: "时间有了可读的纹理" },

  { id: "move-closer", category: "爱与告别", icon: "❤", title: "勇敢靠近", motto: "心动以后向前一步" },
  { id: "say-love", category: "爱与告别", icon: "✉", title: "把喜欢说出口", motto: "答案未知，真心已经抵达" },
  { id: "deeply-loved", category: "爱与告别", icon: "🫶", title: "被认真爱过", motto: "有人看见真实的你" },
  { id: "apology", category: "爱与告别", icon: "💌", title: "认真完成一次道歉", motto: "不是为了赢回合" },
  { id: "long-together", category: "爱与告别", icon: "🕰", title: "一起走了很久", motto: "时间没有冲淡在意" },
  { id: "leave-harm", category: "爱与告别", icon: "🚪", title: "从消耗里离开", motto: "爱不该以失去自己为代价" },
  { id: "goodbye", category: "爱与告别", icon: "🕊", title: "好好说完再见", motto: "谢谢你曾经来过" },
  { id: "love-again", category: "爱与告别", icon: "🌹", title: "告别以后再次相信", motto: "旧伤没有关闭新的入口" },

  { id: "call-home", category: "家人与归处", icon: "☎", title: "主动报平安", motto: "让牵挂先落地" },
  { id: "home-meal", category: "家人与归处", icon: "🍚", title: "回家吃饭", motto: "灯亮着，饭还热" },
  { id: "tell-family-love", category: "家人与归处", icon: "❤", title: "把爱说出来", motto: "在意不必只藏在行动里" },
  { id: "see-them-young", category: "家人与归处", icon: "📷", title: "看见他们也曾年轻", motto: "理解彼此的来时路" },
  { id: "family-boundary", category: "家人与归处", icon: "🏡", title: "亲近也有边界", motto: "爱不是无限地让渡自己" },
  { id: "support-family", category: "家人与归处", icon: "🤲", title: "换我接住你", motto: "曾经被照顾的人长大了" },
  { id: "chosen-home", category: "家人与归处", icon: "🪴", title: "把异乡住成家", motto: "归处可以亲手栽种" },
  { id: "chosen-family", category: "家人与归处", icon: "🏠", title: "自己选择的家人", motto: "血缘之外也有归处" },

  { id: "new-friend", category: "朋友与同行", icon: "👋", title: "认识一个新朋友", motto: "陌生人有了名字" },
  { id: "reunion", category: "朋友与同行", icon: "☕", title: "好久不见", motto: "重逢接住了走散的时间" },
  { id: "stand-by-friend", category: "朋友与同行", icon: "🌙", title: "陪你走过低谷", motto: "不催你振作，只陪你天亮" },
  { id: "show-weakness", category: "朋友与同行", icon: "🫂", title: "这次换我示弱", motto: "信任是允许别人接住自己" },
  { id: "celebrate-friend", category: "朋友与同行", icon: "🎉", title: "为你的好消息鼓掌", motto: "你的闪光不会遮住我" },
  { id: "drift-apart", category: "朋友与同行", icon: "🍃", title: "好好走散", motto: "同行结束，感谢仍在" },
  { id: "adult-confidant", category: "朋友与同行", icon: "✨", title: "成年以后遇见知己", motto: "后来的人也能懂得很深" },
  { id: "late-night-call", category: "朋友与同行", icon: "📞", title: "深夜也能拨通", motto: "世界上有一盏灯为你亮着" },

  { id: "solo-trip", category: "远行与突破", icon: "🎒", title: "一个人出发", motto: "世界在门外加载" },
  { id: "new-city", category: "远行与突破", icon: "🏙", title: "在陌生城市醒来", motto: "坐标改变，故事继续" },
  { id: "language-barrier", category: "远行与突破", icon: "💬", title: "跨过语言的边界", motto: "听不懂也可以向前走" },
  { id: "wrong-way", category: "远行与突破", icon: "🚉", title: "走错也抵达", motto: "岔路也算地图" },
  { id: "see-it-myself", category: "远行与突破", icon: "🌄", title: "终于亲眼看见", motto: "屏幕里的远方来到眼前" },
  { id: "body-over-mountain", category: "远行与突破", icon: "⛰", title: "身体带我翻过山", motto: "每一步都算数" },
  { id: "care-abroad", category: "远行与突破", icon: "🧳", title: "在远方照顾好自己", motto: "离开熟悉也没有弄丢生活" },
  { id: "farther", category: "远行与突破", icon: "🗺", title: "比昨天更远", motto: "边界向外移动了一格" },

  { id: "help-stranger", category: "善意与回响", icon: "🤝", title: "接住一个陌生人", motto: "短暂相遇也可以温柔" },
  { id: "keep-promise", category: "善意与回响", icon: "🤞", title: "答应的事做到了", motto: "承诺最终落在行动里" },
  { id: "speak-up", category: "善意与回响", icon: "📢", title: "替沉默的人发声", motto: "有人站出来，风向才会改变" },
  { id: "first-volunteer", category: "善意与回响", icon: "🦺", title: "第一次成为志愿者", motto: "把一段时间交给共同的事" },
  { id: "share-the-road", category: "善意与回响", icon: "📝", title: "把来路写下来", motto: "走过的弯路也能成为路标" },
  { id: "teach-one", category: "善意与回响", icon: "🕯", title: "教会一个人", motto: "会做的事有了新的去处" },
  { id: "late-thanks", category: "善意与回响", icon: "💌", title: "收到迟来的谢谢", motto: "原来善意真的抵达过" },
  { id: "leave-better", category: "善意与回响", icon: "✨", title: "留下一点更好", motto: "离开时比来时多一束光" },

  { id: "enough", category: "日常与欢喜", icon: "☕", title: "今天已经够用了", motto: "晚饭以后可以关掉电脑" },
  { id: "sun", category: "日常与欢喜", icon: "☀", title: "晒到太阳", motto: "获得今日份自然充电" },
  { id: "favorite-food", category: "日常与欢喜", icon: "🍜", title: "吃到想吃的", motto: "愿望在餐桌上兑现" },
  { id: "tidy-corner", category: "日常与欢喜", icon: "🪴", title: "整理好一个角落", motto: "生活重新空出一点位置" },
  { id: "tiny-finish", category: "日常与欢喜", icon: "✓", title: "小事已完成", motto: "清单上少了一颗石子" },
  { id: "sunset", category: "日常与欢喜", icon: "🌇", title: "偶遇一场日落", motto: "今天在结束前发了一会儿光" },
  { id: "laugh-out-loud", category: "日常与欢喜", icon: "😄", title: "今天笑出了声", motto: "快乐来得没有预告" },
  { id: "ordinary-good-day", category: "日常与欢喜", icon: "🍀", title: "平凡的好日子", motto: "没有大事发生，也很好" },
];

export const DEFAULT_ACHIEVEMENT = LIFE_ACHIEVEMENTS[0];
