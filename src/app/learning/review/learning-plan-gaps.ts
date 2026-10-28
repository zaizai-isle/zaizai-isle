export type LearningPlanGap = {
  issue: string;
  title: string;
  status: "research_blocked" | "dependency_blocked";
  statusLabel: string;
  coreQuestion: string;
  work: string;
  completed: string[];
  blockers: string[];
  nextAction: string;
  sources: { label: string; url: string }[];
  images?: {
    src: string;
    width: number;
    height: number;
    alt: string;
    caption: string;
    assessment: string;
  }[];
  article?: {
    introduction: string;
    observations: { heading: string; body: string }[];
    history: string;
    connection: string;
    question: string;
  };
};

export const learningPlanGaps: LearningPlanGap[] = [
  {
    issue: "08",
    title: "Anni Albers《Preliminary Design for Wall Hanging》",
    status: "research_blocked",
    statusLabel: "作品与图片已匹配 · 发布许可待核",
    coreQuestion: "几何图案如何进入纺织设计？",
    work: "MoMA 397.1951，1926，水粉和铅笔纸上设计稿，34.9 × 29.5 cm。",
    completed: ["具体作品、馆藏编号、年代、媒介与尺寸已锁定。", "岛主补充图片与 MoMA 3746《Preliminary Design for Wall Hanging》画面及题记一致。"],
    blockers: ["MoMA 标注 © The Josef and Anni Albers Foundation / ARS。", "本地图片已解决私有审核页显示与细节核验，但正式发布前仍需处理再利用许可。"],
    nextAction: "依据匹配图片完成画面细节核验和正文；正式发布前保留权利核查门禁。",
    sources: [{ label: "MoMA 作品页", url: "https://www.moma.org/collection/works/3746" }],
    images: [{ src: "/learning/assets/截屏2026-10-26 09.44.46.png", width: 660, height: 781, alt: "Anni Albers 的壁挂预备设计稿", caption: "岛主补充图片 · 《Preliminary Design for Wall Hanging》，1926", assessment: "匹配作品：画面、题记与 MoMA 3746 一致；发布许可仍待确认。" }],
  },
  {
    issue: "10",
    title: "日常设计关联阅读",
    status: "dependency_blocked",
    statusLabel: "策划已完成 · 等待第 08 期",
    coreQuestion: "设计越来越简洁，真的等于进步吗？",
    work: "《Strawberry Thief》、瓦西里椅、Anni Albers 壁挂设计稿、Braun SK 4。",
    completed: ["第 06、07、09 期已经形成可用 v2 草稿。", "关联阅读的问题和四件作品范围已经锁定。"],
    blockers: ["第 08 期准确图像仍受版权阻塞。", "删掉 Albers 会改变已经确认的四件作品比较范围。"],
    nextAction: "第 08 期图片许可通过后，完成四件作品在装饰、材料、制造和功能上的正文比较。",
    sources: [],
  },
  {
    issue: "11",
    title: "A. M. Cassandre《Nord Express》",
    status: "research_blocked",
    statusLabel: "作品已锁定 · 缺图片许可与正文",
    coreQuestion: "静止海报为什么看起来那么快？",
    work: "MoMA 105963，A. M. Cassandre，1927。",
    completed: ["作品、作者、年代和观察框架 A04 / M01 / H10 已锁定。", "已补充匹配的《Nord Express》本地图，可继续做画面细节核验。"],
    blockers: ["图片右下角带 Copyrights World 水印，底部也明确标注版权保留。", "它可用于私有研究预览，但不能作为正式发布资产。"],
    nextAction: "取得权利方授权，或找到明确开放许可的同一作品文件后完成正文。",
    sources: [{ label: "MoMA 作品页", url: "https://www.moma.org/collection/works/105963" }],
    images: [{ src: "/learning/assets/Nord Express PV 1927.avif", width: 605, height: 846, alt: "A. M. Cassandre 设计的 Nord Express 海报", caption: "岛主补充图片 · 《Nord Express》，1927", assessment: "匹配作品，但文件带版权水印；仅用于私有研究预览。" }],
  },
  {
    issue: "13",
    title: "Isotype 商船统计图",
    status: "research_blocked",
    statusLabel: "研究有关键发现 · 图版与许可未锁定",
    coreQuestion: "一个船形图符代表多少总登记吨？",
    work: "《Gesellschaft und Wirtschaft》图表 54 或 55，1930。",
    completed: ["已发现原问题不能写成船只数量：图符表示总登记吨。", "图表 54 每艘船代表 100 万总登记吨，图表 55 每艘代表 500 万；最终必须选定其中一张。"],
    blockers: ["尚未取得图表 54 或 55 的具体高分辨率文件。", "Isotype Revisited 页面可访问不等于授权本站复用。"],
    nextAction: "向 University of Reading Isotype Collection 核实具体图版、数字文件和再利用条件。",
    sources: [{ label: "Isotype Revisited 研究页", url: "https://isotyperevisited.org/2012/08/society-and-economy.php" }],
  },
  {
    issue: "14",
    title: "Harry Beck 1933 年伦敦地铁图",
    status: "research_blocked",
    statusLabel: "作品已锁定 · 缺图片许可与正文",
    coreQuestion: "地图可以不按实际比例绘制吗？",
    work: "Harry Beck，London Underground diagram，1933。",
    completed: ["作品版本、作者、年代和 A07 / M03 / H11 已锁定。", "已补充匹配的 1933 年图版，可继续核对直线化、站距调整和换乘信息。"],
    blockers: ["补充文件来自 London Museum 页面资源，页面版权声明仍然适用。", "本地下载解决了显示问题，但没有自动取得本站再发布许可。"],
    nextAction: "取得 London Transport Museum 或权利方许可，再核对线路、站距和换乘符号并完成正文。",
    sources: [{ label: "London Museum 研究页", url: "https://www.londonmuseum.org.uk/collections/london-stories/harry-beck-revolutionised-tube-map/" }],
    images: [{ src: "/learning/assets/WagtailSource-Railway-map.width-1136.format-webp.webp", width: 1136, height: 791, alt: "Harry Beck 1933 年伦敦地铁图", caption: "岛主补充图片 · Harry Beck 地铁图，1933", assessment: "匹配作品，可用于私有研究预览；发布许可仍待确认。" }],
  },
  {
    issue: "15",
    title: "视觉传播关联阅读",
    status: "dependency_blocked",
    statusLabel: "问题已确定 · 等待第 11、13、14 期",
    coreQuestion: "让人看懂，需要突出什么、保留什么？",
    work: "《Nord Express》、墨西哥骷髅骑车印刷品、Isotype 商船统计图、1933 年地铁图。",
    completed: ["第 12 期已经形成可用 v2 草稿。", "宣传、讽刺、统计和导航四种传播任务的比较边界已经确定。"],
    blockers: ["第 11、13、14 期都缺可发布图片。", "缺少三件作品时写正文会把四种传播任务比较缩减成另一篇文章。"],
    nextAction: "三期图片权利通过后，以任务、简化方式和保留信息为三个比较维度完成正文。",
    sources: [],
  },
  {
    issue: "18",
    title: "为什么电脑文件需要图标？",
    status: "research_blocked",
    statusLabel: "正文已完成 · 缺 1984 GUI 图片许可",
    coreQuestion: "为什么电脑文件需要图标？",
    work: "1984 Macintosh Finder/System 桌面界面。",
    completed: ["历史来源、作品版本、核心发现和完整正文已经完成。", "已补充匹配的 1984 GUI 截图，并补充原型板、剖面说明图和 Macintosh 硬件照片作为背景参考。"],
    blockers: ["匹配的 CHM 1984 截图明确标注 © Apple Computer, Inc.。", "尚未找到同时满足 1984 版本、完整界面和开放许可的具体文件。"],
    nextAction: "取得 Apple/CHM 许可，或找到同版本开放许可截图；完成像素级核验后即可生成 v2 包。",
    sources: [
      { label: "CHM Macintosh at 40", url: "https://computerhistory.org/exhibits/hello-the-mac-at-40/" },
      { label: "CHM 1984 GUI 截图", url: "https://www.computerhistory.org/revolution/personal-computers/17/303/1200" },
    ],
    images: [
      { src: "/learning/assets/500004342-05-01.jpg", width: 600, height: 401, alt: "1984 Macintosh 图形界面中的财务软件窗口", caption: "Computer History Museum 图像 · 1984 GUI", assessment: "匹配本期界面观察，但原页标注 © Apple Computer, Inc.；仅用于私有研究预览。" },
      { src: "/learning/assets/MacintoshGroup-scaled-760x0-c-default.jpg", width: 760, height: 760, alt: "早期 Macintosh 电脑、键盘和鼠标", caption: "Macintosh 硬件背景图", assessment: "背景参考：能说明屏幕、键盘和鼠标关系，不能替代 GUI 主图。" },
      { src: "/learning/assets/Screenshot-2023-11-15-104902-760x0-c-default.jpg", width: 760, height: 590, alt: "早期 Macintosh 电脑内部结构说明图", caption: "Macintosh 结构说明图", assessment: "背景参考：适合历史理解，不是本期核心观察对象。" },
      { src: "/learning/assets/102638251.01.02-scaled-760x0-c-default.jpg", width: 760, height: 760, alt: "Macintosh 原型电路板", caption: "Macintosh 原型电路板", assessment: "背景参考：属于硬件研发史，不是 1984 GUI 的替代图片。" },
    ],
    article: {
      introduction: "先想象一台只显示文字命令的电脑：文件确实存在，却必须记住名称、路径和指令才能接近它。1984 年 Macintosh 把这套关系画在桌面上。文件像纸张，文件夹像办公夹，磁盘和废纸篓各占一个位置；鼠标让用户可以先看见对象，再决定怎样操作。",
      observations: [
        { heading: "图标把不可见的数据变成可指认的对象", body: "文件、文件夹、磁盘与废纸篓不是同一种小方块。不同轮廓先帮助用户判断对象类型，文字标签再补充名称，让“选择哪一个”成为视觉问题，而不只是记忆问题。" },
        { heading: "窗口和菜单把对象放进操作顺序", body: "窗口说明当前正在看哪个容器，顶部菜单集中列出此刻可用的动作，指针把手的移动对应到屏幕位置。图标必须和位置、选择状态与菜单反馈一起工作。" },
      ],
      history: "Computer History Museum 将图形用户界面称为 Macintosh 的主要创新，并以窗口、图标、菜单和指向设备概括其界面。Apple 1984 年销售指南把屏幕比作桌面，列出文件夹、纸张和废纸篓。这里不能把 Macintosh 写成 GUI 的唯一发明者；Apple 受到 Xerox PARC 研究影响，Lisa 也早于 Macintosh 采用图形界面。",
      connection: "检查今天的文件管理器或手机主屏时，可以分别问：对象是否容易区分？当前位置是否清楚？可执行动作是否在需要时出现？结果是否及时反馈？",
      question: "如果所有文件都只显示同一个白色方块，除了文件名之外，你还需要哪一种视觉线索来避免选错？",
    },
  },
  {
    issue: "20",
    title: "从空间到界面，设计如何支持行动？",
    status: "dependency_blocked",
    statusLabel: "正文已完成 · 等待第 18 期",
    coreQuestion: "从空间到界面，设计如何支持行动？",
    work: "Barragán / Carlton / 1984 Macintosh / 2007 iPhone。",
    completed: ["四件作品的比较问题、两段观察、历史边界、连接和回应问题均已写完。", "第 16、17、19 期已经形成可用 v2 草稿。"],
    blockers: ["第 18 期没有合法的 1984 Macintosh GUI 图片。", "硬件照片或后期 Finder 截图不能替代关联阅读需要比较的历史界面。"],
    nextAction: "第 18 期图片通过后，复用四期资产并生成完整 v2 关联阅读包。",
    sources: [],
    article: {
      introduction: "一面墙、一件书架、一个文件夹图标和一块触控屏，似乎很难放在一起。但如果只问“它怎样让人知道下一步能做什么”，四件作品会出现一条连续线索：设计先划出边界，再提供入口，最后用变化回应行动。",
      observations: [
        { heading: "边界不是终点，它在选择行动方向", body: "巴拉甘露台的高墙遮住城市远景，把注意力推向墙面、色彩和天空。《Carlton》的斜板、空隙和隔层则提示物品可以被放置、分隔或观看。两者都通过限制一些路径来突出另一些路径。" },
        { heading: "界面把入口和反馈搬到可变化的表面", body: "Macintosh 用文件、文件夹、菜单和指针把数据变成可操作对象；初代 iPhone 把许多固定按键移进屏幕。无论实体还是数字设计，用户都需要看见当前位置、可能动作和动作后的新状态。" },
      ],
      history: "四个节点对应战后现代建筑、1980 年代 Memphis 设计、个人计算机 GUI 和移动触控界面。它们不是一条必然的技术继承线；这里只比较不同材料和尺度如何组织边界、入口与反馈。",
      connection: "进入车站、打开应用或拿取柜中物品时，可以先找边界，再找入口，最后观察系统如何回应。任何一项缺失，行动就会依赖猜测、记忆或反复试错。",
      question: "你今天使用过的空间或界面里，哪一个最清楚地告诉了你“现在在哪里、下一步能做什么”？",
    },
  },
];

export const learningPlanGapByIssue = new Map(learningPlanGaps.map((gap) => [gap.issue, gap]));
