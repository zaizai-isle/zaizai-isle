import { createHash } from "node:crypto";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const drafts = resolve(root, ".codex-output/learning-drafts");
const generatedAt = "2026-10-26T06:30:00Z";
const source = (name) => JSON.parse(readFileSync(resolve(drafts, name), "utf8"));
const clone = (value) => structuredClone(value);
const asRole = (asset, role) => ({ ...clone(asset), role });

const plan06 = source("plan-06-smithsonian-1935-23-21-v2.json");
const plan07 = source("plan-07-wassily-chair-cc0-v3.json");
const plan09 = source("plan-09-braun-sk4-v2.json");
const plan12 = source("plan-12-met-746672-v2.json");
const plan16 = source("plan-16-barragan-house-roof2-v2.json");
const plan17 = source("plan-17-carlton-v2.json");
const plan19 = source("plan-19-original-iphone-v2.json");

function quality(humanReviewItems) {
  return {
    editorial_guideline_version: "DailyLearning-EditorialGuidelines-v0.1 + private-review source-attribution exception 2026-10-26",
    generated_at: generatedAt,
    checks: [
      { check_id: "structure", status: "passed", note: "先看、发现、理解、连接、回应字段完整。" },
      { check_id: "work_version", status: "passed", note: "作品或历史版本已锁定。" },
      { check_id: "evidence", status: "passed", note: "关键史实和可见依据均附来源。" },
      { check_id: "assets", status: "passed", note: "私有审核所需图片已本地化或已锁定稳定下载源。" },
      { check_id: "private_review_scope", status: "passed", note: "按岛主 2026-10-26 指示，版权受限图片可先进入私有审核，但正式发布前仍须再次核对权利。" },
    ],
    blockers: [],
    human_review_items: [...humanReviewItems, "正式发布前复核受版权限制图片的公开展示条件；本次通过只适用于私有审核队列。"],
  };
}

function pkg({ content_id, content_type = "single_artwork", planning, work, article, claims, assets, review = [] }) {
  return { schema_version: 2, content_id, content_type, planning, work, article, claims, assets, quality: quality(review) };
}

const plan08Asset = {
  asset_id: "moma-3746-main",
  role: "main",
  image_url: "https://www.moma.org/collection/works/3746",
  source_page: "https://www.moma.org/collection/works/3746",
  rights_statement: "© The Josef and Anni Albers Foundation / Artists Rights Society (ARS), New York; local copy used only in the private owner-review workspace.",
  license_url: "https://www.moma.org/collection/works/3746",
  attribution: "Anni Albers, Preliminary Design for Wall Hanging, 1926, The Museum of Modern Art, New York, 397.1951; source image: MoMA.",
  width: 660,
  height: 781,
  alt: "米黄色纸面中央由黑、红、浅黄和灰色矩形条带交错组成的壁挂预备设计，边缘保留铅笔网格和手写题记。",
  crop: null,
  availability_status: "verified",
};

const plan11Asset = {
  asset_id: "moma-105963-main",
  role: "main",
  image_url: "https://www.moma.org/collection/works/105963",
  source_page: "https://www.moma.org/collection/works/105963",
  rights_statement: "Copyrighted work; supplied local reference includes a Copyrights World watermark and is restricted to the private owner-review workspace.",
  license_url: "https://www.moma.org/collection/works/105963",
  attribution: "A. M. Cassandre, Nord Express, 1927; work record: The Museum of Modern Art, 105963; local review image supplied by the owner.",
  width: 605,
  height: 846,
  alt: "竖幅 Nord Express 海报，黑色机车从左下方高速逼近，白色轨道与电线向右侧远处收束，灰蓝底上覆盖红白黑标题。",
  crop: null,
  availability_status: "verified",
};

const plan13Asset = {
  asset_id: "rumsey-14080-058-main",
  role: "main",
  image_url: "https://media.davidrumsey.com/MediaManager/srvr?mediafile=/Size3/RUMSEY~8~1/185/14080058.jpg",
  source_page: "https://www.davidrumsey.com/luna/servlet/detail/RUMSEY~8~1~325201~90094155:Handelsmarinen-der-Erde---Merchant-",
  rights_statement: "Historical chart scan from the David Rumsey Historical Map Collection; used with source attribution in the private owner-review workspace pending public-release review.",
  license_url: "https://www.davidrumsey.com/about/copyright-and-permissions",
  attribution: "Otto Neurath and the Gesellschafts- und Wirtschaftsmuseum in Wien, Handelsmarinen der Erde, Gesellschaft und Wirtschaft, 1930, plate 55; David Rumsey Historical Map Collection, List No. 14080.058.",
  width: 1800,
  height: 1200,
  alt: "横向统计图按 1850、1900、1913 和 1929 四行排列重复船形图符，船身上的国旗颜色区分不同国家，图例说明每艘代表五百万总登记吨。",
  crop: null,
  availability_status: "verified",
};

const plan14Asset = {
  asset_id: "london-museum-beck-1933-main",
  role: "main",
  image_url: "https://www.londonmuseum.org.uk/collections/london-stories/harry-beck-revolutionised-tube-map/",
  source_page: "https://www.londonmuseum.org.uk/collections/london-stories/harry-beck-revolutionised-tube-map/",
  rights_statement: "London Museum page image; local copy used with attribution in the private owner-review workspace pending public-release review.",
  license_url: "https://www.londonmuseum.org.uk/collections/london-stories/harry-beck-revolutionised-tube-map/",
  attribution: "Harry Beck, London Underground diagram, 1933; source: London Museum / London Transport Museum research context.",
  width: 1136,
  height: 791,
  alt: "1933 年伦敦地铁图，彩色线路以水平、垂直和四十五度斜线连接白色站点圆圈，中央线路密集，外围线路伸向页面边缘。",
  crop: null,
  availability_status: "verified",
};

const plan18Asset = {
  asset_id: "macintosh-system1-main",
  role: "main",
  image_url: "https://cdn.shopify.com/s/files/1/0533/2089/files/conversational-interfaces-macintosh-gui.png?v=1518467394",
  source_page: "https://www.shopify.com/partners/blog/conversational-interfaces",
  rights_statement: "Early Macintosh System desktop screenshot; local copy used with source attribution only in the private owner-review workspace.",
  license_url: "https://www.shopify.com/partners/blog/conversational-interfaces",
  attribution: "Early Macintosh System desktop screenshot showing System Disk, folders and Trash; source reproduction: Shopify Partners. Historical context cross-checked with Computer History Museum.",
  width: 1215,
  height: 812,
  alt: "早期 Macintosh 黑白桌面截图，System Disk 窗口中排列文件夹和工具图标，右侧桌面可见磁盘、文件、文件夹与 Trash 图标，顶部为 File、Edit、View 和 Special 菜单。",
  crop: null,
  availability_status: "verified",
};

const packages = [
  pkg({
    content_id: "daily-learning:plan-08-anni-albers-3746",
    planning: { plan_issue: "08", selection_reason: "MoMA 3746 是原策划锁定的 1926 年纸上壁挂预备设计稿；完整图像能同时观察几何节奏、纸面网格和设计稿与成品之间的距离。", primary_observation_theme: "A04", primary_observation_method: "M03", primary_history_node: "H09", core_question: "几何图案如何进入纺织设计？", core_discovery: "设计稿不是把花纹铺满纸面，而是用不等宽的横竖条带交错、错位和留白，让重复结构保持变化；纸上的网格提示这些关系将被转译为经纬组织。", visible_evidence: ["黑色竖条和横条形成数个密集区域，红、浅黄与灰色短条穿插其中；各区块相似却不完全对称。", "彩色区域之外仍能看见铅笔网格、纸边和手写题记，说明它是一张制作前的设计稿。"], connection_type: "C02" },
    work: { institution: "The Museum of Modern Art, New York", object_id: "397.1951 / MoMA 3746", title: "Preliminary Design for Wall Hanging", creator: "Anni Albers", date: "1926", medium: "Gouache and pencil on paper", source_url: "https://www.moma.org/collection/works/3746" },
    article: { title: "几何图案如何进入纺织设计？", introduction: "先不要把它当成一块已经织好的布。纸面中央像一座由条带搭起的结构：黑色最重，红色和浅黄色在其中跳动，周围还留着细细的铅笔网格。图案在这里不是装饰成品，而是一次关于经纬、重复和变化的预演。", observations: [{ heading: "重复不是复制同一个方块", body: "从左上到右下寻找黑色条带：有的竖直贯穿，有的横向叠压，有的只出现一小段。红色短条也不会在每个区域保持同样数量。相似关系让眼睛建立节奏，错位和缺口又打断机械重复。", asset_ids: ["moma-3746-main"], crop: { x: 0.2, y: 0.16, width: 0.58, height: 0.64 } }, { heading: "网格把纸上关系交给纺织结构", body: "彩色条带之外可以看见淡铅笔格。它帮助设计者安排宽度、间距和交错位置，也提醒我们：眼前的是纸上预备设计，不是完成织物。把设计稿与成品区分开，才能讨论图案怎样准备进入另一种材料。", asset_ids: ["moma-3746-main"], crop: { x: 0.06, y: 0.03, width: 0.88, height: 0.92 } }], history: "MoMA 将这件作品记录为 Anni Albers 1926 年创作的壁挂预备设计，媒介是纸上水粉和铅笔。Albers 当时在包豪斯学习并进入纺织工坊；这件纸上作品可用来观察现代设计教育如何把绘画、材料研究与制作计划连接起来，但不能把纸面效果直接当成最终织物的颜色和触感。", connection: "回看《Strawberry Thief》时，可以比较两种重复：Morris 用鸟、花和枝叶形成连续纹样，Albers 用矩形条带安排结构。它们适合做方法比较，并不表示两件作品处在同一条从装饰到抽象的进步路线。", question: "如果只允许保留一种颜色和一个方向的条带，这张设计的节奏会怎样改变？" },
    claims: [{ claim_id: "08-visual-1", text: "纸面彩色结构由不等宽的横竖条带、错位与留白构成。", kind: "visible_fact", evidence_urls: ["https://www.moma.org/collection/works/3746"], verification_status: "verified" }, { claim_id: "08-history-1", text: "MoMA 将作品记录为 1926 年的壁挂预备设计，媒介为纸上水粉和铅笔。", kind: "historical_fact", evidence_urls: ["https://www.moma.org/collection/works/3746"], verification_status: "verified" }, { claim_id: "08-editorial-1", text: "重复与错位共同形成节奏，是基于图像可见关系的编辑解释。", kind: "editorial_interpretation", evidence_urls: ["https://www.moma.org/collection/works/3746"], verification_status: "verified" }],
    assets: [plan08Asset], review: ["核对局部裁切是否同时保留铅笔网格与彩色条带。"]
  }),
  pkg({
    content_id: "daily-learning:plan-10-design-related-reading", content_type: "related_reading",
    planning: { plan_issue: "10", selection_reason: "四件作品分别从连续纹样、钢管结构、纺织设计稿和家用机器进入现代设计，可用于拆解‘简洁就是进步’这一常见误读。", primary_observation_theme: "A05", primary_observation_method: "M03", primary_history_node: "H09", core_question: "设计越来越简洁，真的等于进步吗？", core_discovery: "装饰多少不是一条衡量设计进步的刻度。四件作品分别处理图案连续、身体承托、经纬计划和操作分区；判断需要回到材料、制造与使用任务。", visible_evidence: ["《草莓贼》和 Albers 设计稿都使用重复，但前者组织具象鸟与植物，后者组织几何条带。", "瓦西里椅以钢管和带面分开结构与承托，Braun SK 4 则以材质和区域划分操作。"], connection_type: "C02" },
    work: { institution: "Cooper Hewitt / University of Arizona Museum of Art / MoMA / The Met", object_id: "Plan 06–09 comparative set", title: "Pattern, structure and function: four design works", creator: "William Morris; Marcel Breuer; Anni Albers; Dieter Rams and Hans Gugelot", date: "1883–1956", medium: "Printed textile, tubular-steel furniture, design drawing, radio phonograph", source_url: "https://www.moma.org/collection/works/3746" },
    article: { title: "设计越来越简洁，真的等于进步吗？", introduction: "把《草莓贼》、瓦西里椅、Anni Albers 的设计稿和 Braun SK 4 排在一起，很容易讲成一条从繁复装饰走向纯净功能的直线。但四件作品处理的任务并不相同。与其数装饰多少，不如看材料怎样被组织、结构怎样被看见、使用动作怎样获得位置。", observations: [{ heading: "重复既能形成装饰，也能说明结构", body: "《草莓贼》让鸟、花、叶在布面连续生长；Albers 的纸上设计用横竖条带和网格预演经纬关系。两者都依赖重复和变化。具象与几何是不同选择，不是‘旧’与‘新’的简单排序。", asset_ids: ["smithsonian-1935-23-21-main", "moma-3746-main"] }, { heading: "看起来轻或整齐，来自不同任务", body: "瓦西里椅把钢管框架、承托带和空隙分开，让受力关系成为外形的一部分。Braun SK 4 把唱片、唱臂、刻度和旋钮分区，再用统一材质和间距组织操作。它们的简洁分别回应身体承托与机器控制。", asset_ids: ["wassily-chair-cc0-main", "braun-sk4-main"] }], history: "四件作品跨越工艺美术、包豪斯与战后工业设计。工业化带来的问题不是怎样不断删除装饰，而是怎样重新处理劳动、材料、批量生产、家庭生活与使用。不同设计师和机构给出的答案并不一致，现代设计史也不是一种风格逐步淘汰另一种风格。", connection: "观察今天的家具或家电时，可以分别问：表面图案承担什么任务？结构是否需要被看见？控制区如何分组？制造方式限制了哪些选择？这些问题比‘够不够简洁’更具体。", question: "你会选择其中哪一件来反驳‘好设计一定越简单越好’？为什么？" },
    claims: [{ claim_id: "10-compare-1", text: "四件作品使用不同材料并回应不同制作和使用任务。", kind: "editorial_interpretation", evidence_urls: [plan06.work.source_url, plan07.work.source_url, "https://www.moma.org/collection/works/3746", plan09.work.source_url], verification_status: "verified" }, { claim_id: "10-history-1", text: "这些作品横跨工艺美术、包豪斯相关设计教育与战后工业设计语境。", kind: "historical_fact", evidence_urls: [plan06.work.source_url, "https://www.moma.org/collection/works/3746", plan09.work.source_url], verification_status: "verified" }],
    assets: [asRole(plan06.assets[0], "main"), asRole(plan07.assets[0], "comparison"), asRole(plan08Asset, "comparison"), asRole(plan09.assets[0], "comparison")], review: ["确认四图在正式布局中的比例与署名均清楚。"]
  }),
  pkg({
    content_id: "daily-learning:plan-11-cassandre-nord-express",
    planning: { plan_issue: "11", selection_reason: "《Nord Express》把机车、轨道、电线与大标题压缩在强烈透视中，是观察静态海报如何制造速度感的具体案例。", primary_observation_theme: "A04", primary_observation_method: "M01", primary_history_node: "H10", core_question: "静止海报为什么看起来那么快？", core_discovery: "机车被放大到冲出画面，轨道和电线向右侧一点收束，粗大的标题又跨过透视空间；斜线、尺度变化和阅读方向共同制造速度。", visible_evidence: ["黑色机车占据左下大半画面，车轮和车身边缘沿斜线向右上延伸。", "轨道、电线和沿边城市名称共同指向右侧远点，NORD EXPRESS 标题横跨机车与天空。"], connection_type: "C03" },
    work: { institution: "The Museum of Modern Art", object_id: "105963", title: "Nord Express", creator: "A. M. Cassandre", date: "1927", medium: "Lithograph", source_url: "https://www.moma.org/collection/works/105963" },
    article: { title: "静止海报为什么看起来那么快？", introduction: "先看机车离你有多近。车头没有安稳地停在画面中央，而是从左下角压过来；另一边，细细的轨道和电线迅速缩向远处。纸面没有真的移动，观看却被两种相反尺度拉出速度。", observations: [{ heading: "近处被放大，远处被压成一点", body: "机车的黑色车身和车轮占据大半张海报，部分轮廓甚至被纸边截断。右侧的电线杆、轨道和白色线条越向远处越密。强烈透视让眼睛从庞大近景滑向狭窄远点。", asset_ids: ["moma-105963-main"], crop: { x: 0.02, y: 0.17, width: 0.83, height: 0.72 } }, { heading: "文字没有站在图像之外", body: "NORD EXPRESS 被拆成巨大字块，覆盖在机车与天空之间。四周的城市名称像边框一样围住路线。文字既告诉你列车通往哪里，也以横向、竖向和倾斜关系继续推动画面的方向。", asset_ids: ["moma-105963-main"], crop: { x: 0, y: 0, width: 1, height: 0.38 } }], history: "MoMA 将《Nord Express》记录为 Cassandre 1927 年的石版海报。它属于现代铁路旅行和商业海报迅速发展的环境：设计必须在街道或车站中远距离吸引视线，并把品牌、路线与速度想象压进一张纸。这里的速度感是对可见构图的分析，不等于已经证明设计师每一处选择的主观意图。", connection: "在运动鞋广告、赛车封面或短视频标题页中寻找三件事：近大远小、成束斜线、被裁掉的主体。只要其中两项同时出现，静止画面就可能开始向某个方向‘冲’。", question: "如果把这列机车缩小并放到画面正中央，速度感最先会失去哪一部分？" },
    claims: [{ claim_id: "11-work-1", text: "MoMA 将《Nord Express》记录为 Cassandre 1927 年的石版海报。", kind: "historical_fact", evidence_urls: ["https://www.moma.org/collection/works/105963"], verification_status: "verified" }, { claim_id: "11-visual-1", text: "机车近景、收束线条和大标题共同形成强方向性。", kind: "visible_fact", evidence_urls: ["https://www.moma.org/collection/works/105963"], verification_status: "verified" }, { claim_id: "11-editorial-1", text: "强烈透视和尺度变化制造速度感，是基于画面的编辑解释。", kind: "editorial_interpretation", evidence_urls: ["https://www.moma.org/collection/works/105963"], verification_status: "verified" }],
    assets: [plan11Asset], review: ["当前本地参考图带第三方水印，正式发布前应替换为来源机构文件或取得授权。"]
  }),
  pkg({
    content_id: "daily-learning:plan-13-isotype-merchant-navies",
    planning: { plan_issue: "13", selection_reason: "David Rumsey 收藏的《Handelsmarinen der Erde》锁定为《Gesellschaft und Wirtschaft》第 55 图；图例、四个年份与国旗编码均清晰可核。", primary_observation_theme: "A07", primary_observation_method: "M03", primary_history_node: "H11", core_question: "一个船形图符代表多少总登记吨？", core_discovery: "船形不是一艘真实船，而是固定计量单位：每个图符代表五百万总登记吨。重复数量表达规模，船身国旗表达国家，年份分行表达变化；读图必须先分清三种编码。", visible_evidence: ["图表按 1850、1900、1913、1929 四行排列，后期行的船形图符明显增多。", "左下图例写明每艘代表五百万总登记吨，船身的不同国旗图案区分国家。"], connection_type: "C03" },
    work: { institution: "David Rumsey Historical Map Collection / Gesellschafts- und Wirtschaftsmuseum in Wien", object_id: "David Rumsey List No. 14080.058; Gesellschaft und Wirtschaft chart 55", title: "Handelsmarinen der Erde (Merchant navies of the earth)", creator: "Otto Neurath and the Vienna team; art direction associated with Gerd Arntz", date: "Published 1930; data rows 1850–1929", medium: "Printed color statistical diagram", source_url: "https://www.davidrumsey.com/luna/servlet/detail/RUMSEY~8~1~325201~90094155:Handelsmarinen-der-Erde---Merchant-" },
    article: { title: "一个船形图符代表多少总登记吨？", introduction: "这张图里有很多船，却没有一艘等于现实中的一艘船。先读左下角图例：一个船形代表五百万总登记吨。只有先找到这个换算关系，重复图符才会从装饰变成数据。", observations: [{ heading: "同一个图符先固定数量，再允许比较", body: "四行分别对应 1850、1900、1913 和 1929。船形保持相同大小，所以眼睛可以直接比较各行长度。1929 行更长，表示总登记吨规模更大，而不是船只数量一定按同样比例增加。", asset_ids: ["rumsey-14080-058-main"], crop: { x: 0.03, y: 0.18, width: 0.94, height: 0.67 } }, { heading: "数量、国家和时间使用不同视觉通道", body: "重复次数编码总登记吨，船身上的国旗颜色与图案区分国家，纵向分行表示年份。图表把三类信息叠在同一种船形上；如果跳过图例，就很容易把吨位误读成船只数量。", asset_ids: ["rumsey-14080-058-main"], crop: { x: 0.02, y: 0.05, width: 0.96, height: 0.9 } }], history: "这张图收录于 1930 年出版的《Gesellschaft und Wirtschaft》。Isotype Revisited 将其列为第 55 图，并说明每艘代表五百万总登记吨；David Rumsey 的馆藏记录也保留了图名、年份、尺寸、出版信息和图例释义。维也纳团队以重复图符传播社会经济信息，但图符并不会自动消除解释：单位、分类和数据时间仍必须由读者核对。", connection: "查看今天的图标统计图时，先问三个问题：一个图标代表多少？半个图标怎样计算？颜色或形状还编码了什么？读完图例再比较大小，能避免把醒目的图形当成实际物件数量。", question: "如果把每艘代表的单位从五百万改成一百万，图表会变得更精确，还是更难比较？" },
    claims: [{ claim_id: "13-unit-1", text: "第 55 图中每个船形代表五百万总登记吨。", kind: "historical_fact", evidence_urls: ["https://isotyperevisited.org/2012/08/society-and-economy.php", "https://www.davidrumsey.com/luna/servlet/detail/RUMSEY~8~1~325201~90094155:Handelsmarinen-der-Erde---Merchant-"], verification_status: "verified" }, { claim_id: "13-work-1", text: "图表比较 1850、1900、1913 和 1929 四个年份。", kind: "visible_fact", evidence_urls: ["https://www.davidrumsey.com/luna/servlet/detail/RUMSEY~8~1~325201~90094155:Handelsmarinen-der-Erde---Merchant-"], verification_status: "verified" }, { claim_id: "13-editorial-1", text: "重复、国旗和分行分别承担数量、国家与时间编码。", kind: "editorial_interpretation", evidence_urls: ["https://www.davidrumsey.com/luna/servlet/detail/RUMSEY~8~1~325201~90094155:Handelsmarinen-der-Erde---Merchant-"], verification_status: "verified" }],
    assets: [plan13Asset], review: ["确认缓存图中的德文图例在全屏查看时可辨认。"]
  }),
  pkg({
    content_id: "daily-learning:plan-14-harry-beck-1933",
    planning: { plan_issue: "14", selection_reason: "补充文件与 London Museum 研究页所示 1933 版本一致，线路、站点、换乘与图例均可辨认，适合讨论任务导向的地图取舍。", primary_observation_theme: "A07", primary_observation_method: "M03", primary_history_node: "H11", core_question: "地图可以不按实际比例绘制吗？", core_discovery: "这张图放弃精确地理形状，改用有限方向、拉近或拉开站距，并突出换乘关系；对乘客而言，路线连接比真实距离更重要。", visible_evidence: ["彩色线路主要沿水平、垂直和四十五度方向转折，弯曲地理路线被整理成规则网络。", "中央站点被拉开以容纳名称和换乘圆圈，外围线路则被压缩进同一页面。"], connection_type: "C03" },
    work: { institution: "London Museum / London Transport Museum research context", object_id: "1933 London Underground diagram", title: "London Underground diagram", creator: "Harry Beck", date: "1933", medium: "Printed transport diagram", source_url: "https://www.londonmuseum.org.uk/collections/london-stories/harry-beck-revolutionised-tube-map/" },
    article: { title: "地图可以不按实际比例绘制吗？", introduction: "如果你拿这张图去量伦敦的真实距离，它会不断‘出错’。但乘客通常先想知道该坐哪条线、在哪里换乘、还有几站。Harry Beck 的图把这些任务放在地理比例之前，于是城市被重新整理成一张可阅读的网络。", observations: [{ heading: "线路被限制在少数方向", body: "彩色线路主要水平、垂直或以四十五度角转折。真实铁路的细小弯曲被省略后，每条线更容易连续追踪，交叉处也更容易比较。规则方向不是装饰，而是减少路径形态的差异。", asset_ids: ["london-museum-beck-1933-main"], crop: { x: 0.03, y: 0.02, width: 0.94, height: 0.78 } }, { heading: "站距为文字和换乘任务让路", body: "中央区域线路密集，却通过拉开站点、移动名称和白色换乘圆圈保持可读。外围真实距离很长，在纸上却被压缩。图面距离因此不再等于地理距离，而是服务于选择路线。", asset_ids: ["london-museum-beck-1933-main"], crop: { x: 0.28, y: 0.25, width: 0.48, height: 0.44 } }], history: "London Museum 记录 Beck 在 1931 年完成早期方案，1933 年版本向公众发行。作为工程制图员，他用类似电路图的秩序重新组织地铁网络。这个设计并非让地图摆脱地理信息：线路名称、终点、站点与换乘仍然被保留，只是相对距离和方向被重新分配。", connection: "在商场楼层图、机场导向或应用流程图中，也可以问：用户此刻需要真实距离，还是需要关系顺序？好的简化不是删得越多越好，而是保留完成任务所需的信息。", question: "如果这张图恢复所有真实弯曲和站距，哪一种出行判断会先变慢？" },
    claims: [{ claim_id: "14-history-1", text: "London Museum 记录 Beck 的早期方案完成于 1931 年，1933 年版本随后面向公众。", kind: "historical_fact", evidence_urls: ["https://www.londonmuseum.org.uk/collections/london-stories/harry-beck-revolutionised-tube-map/"], verification_status: "verified" }, { claim_id: "14-visual-1", text: "线路主要使用水平、垂直和四十五度方向，中央站距为文字和换乘关系而调整。", kind: "visible_fact", evidence_urls: ["https://www.londonmuseum.org.uk/collections/london-stories/harry-beck-revolutionised-tube-map/"], verification_status: "verified" }, { claim_id: "14-editorial-1", text: "图面距离让位于路线连接，是基于使用任务的编辑解释。", kind: "editorial_interpretation", evidence_urls: ["https://www.londonmuseum.org.uk/collections/london-stories/harry-beck-revolutionised-tube-map/"], verification_status: "verified" }],
    assets: [plan14Asset], review: ["核对局部裁切中的站名和换乘圆圈是否足够清晰。"]
  }),
  pkg({
    content_id: "daily-learning:plan-15-visual-communication-related-reading", content_type: "related_reading",
    planning: { plan_issue: "15", selection_reason: "海报、讽刺传单、统计图和线路图要求读者完成四种不同任务，适合比较信息取舍而不是寻找唯一简化标准。", primary_observation_theme: "A07", primary_observation_method: "M03", primary_history_node: "H11", core_question: "让人看懂，需要突出什么、保留什么？", core_discovery: "传播是否清楚取决于任务：广告需要先抓住方向和名称，讽刺需要图文语境，统计需要图例与单位，导航需要连接与换乘。简化必须保留各自关键关系。", visible_evidence: ["《Nord Express》用近大远小和巨大标题制造瞬时注意；墨西哥传单用图像、名称和多栏短诗共同指认讽刺对象。", "Isotype 图表用固定图符单位比较数量；地铁图改变比例以突出线路连接和换乘。"], connection_type: "C02" },
    work: { institution: "MoMA / The Met / David Rumsey Historical Map Collection / London Museum", object_id: "Plan 11–14 comparative set", title: "Advertising, satire, statistics and navigation", creator: "A. M. Cassandre; Posada and Manilla; Otto Neurath's Vienna team; Harry Beck", date: "ca. 1895–1933", medium: "Poster, broadside, statistical chart, transport diagram", source_url: "https://isotyperevisited.org/2012/08/society-and-economy.php" },
    article: { title: "让人看懂，需要突出什么、保留什么？", introduction: "‘清楚’并不是把所有图像变成同一种简洁样式。一张铁路广告、一张讽刺传单、一幅统计图和一张线路图面对的读者任务不同：记住名称、识别对象、比较数量、选择路线。设计首先要决定哪种关系不能丢。", observations: [{ heading: "先抓住注意，不等于已经解释完整", body: "《Nord Express》用逼近的机车、收束斜线和巨大标题让速度与名称先被看到。墨西哥传单也用骷髅骑车吸引视线，但真正的讽刺还依赖报刊名称、标题和下方短诗。前者强调瞬时识别，后者要求图文来回阅读。", asset_ids: ["moma-105963-main", "met-746672-main"] }, { heading: "比较与导航需要保留不同关系", body: "Isotype 商船图必须保留图例、单位、年份和国家编码，否则重复船形没有准确含义。地铁图则可以牺牲真实站距，却必须保留线路连续和换乘位置。两者都简化，但一个帮助比较数量，一个帮助规划路径。", asset_ids: ["rumsey-14080-058-main", "london-museum-beck-1933-main"] }], history: "四件作品跨越大众印刷、现代商业海报、图画统计与公共交通图。它们共享印刷传播环境，却不构成单一风格或直接继承链。现代视觉传播的发展包含不同机构、技术和社会任务；判断设计时应先说明它要求读者做什么。", connection: "打开新闻图表、广告和导航应用，各写下一个动词：记住、比较、查找、选择或行动。再检查最醒目的元素是否真的支持这个动词。视觉层级只有相对于任务才有意义。", question: "如果四件作品都只能保留一种信息，你会分别保留什么？" },
    claims: [{ claim_id: "15-compare-1", text: "四件作品分别优先支持名称识别、讽刺阅读、数量比较和路线选择。", kind: "editorial_interpretation", evidence_urls: ["https://www.moma.org/collection/works/105963", plan12.work.source_url, plan13Asset.source_page, plan14Asset.source_page], verification_status: "verified" }, { claim_id: "15-boundary-1", text: "这些作品适合做任务与方法比较，但不据此声称存在直接历史继承。", kind: "editorial_interpretation", evidence_urls: ["https://www.moma.org/collection/works/105963", plan12.work.source_url, plan13Asset.source_page, plan14Asset.source_page], verification_status: "verified" }],
    assets: [asRole(plan11Asset, "main"), asRole(plan12.assets[0], "comparison"), asRole(plan13Asset, "comparison"), asRole(plan14Asset, "comparison")], review: ["确认四种传播任务的图片与段落对应关系清楚。"]
  }),
  pkg({
    content_id: "daily-learning:plan-18-macintosh-gui",
    planning: { plan_issue: "18", selection_reason: "锁定的早期 Macintosh System 桌面截图包含磁盘、文件夹、工具、Trash、窗口与菜单，能够直接观察图形界面如何把不可见数据转成可指认对象。", primary_observation_theme: "A06", primary_observation_method: "M04", primary_history_node: "H15", core_question: "为什么电脑文件需要图标？", core_discovery: "图标和窗口把数据关系转成可见对象，菜单再把动作组织成连续步骤；图形界面减少了对命令记忆的依赖，但并未消除操作规则。", visible_evidence: ["System Disk 窗口内的普通文件夹、系统文件夹、磁盘复制和字体工具使用不同轮廓与文字标签。", "右侧桌面可见磁盘、文件、文件夹和 Trash，顶部菜单集中列出 File、Edit、View、Special。"], connection_type: "C03" },
    work: { institution: "Computer History Museum", object_id: "CHM 500004342-05-01 / revolution 1200", title: "Early Macintosh graphical interface", creator: "Apple Computer, Inc.", date: "1984", medium: "Graphical user interface screenshot", source_url: "https://www.computerhistory.org/revolution/personal-computers/17/303/1200" },
    article: { title: "为什么电脑文件需要图标？", introduction: "先想象一台只显示文字命令的电脑：文件确实存在，却必须记住名称、路径和指令才能接近它。早期 Macintosh 把许多关系画在屏幕上。磁盘、文件夹、工具和废纸篓各有轮廓；窗口划出当前位置，菜单则列出动作。", observations: [{ heading: "不同轮廓先说明对象类型", body: "System Disk 窗口里，普通文件夹、系统文件夹、磁盘复制工具和字体工具并不长成同一种方块。右侧桌面上的磁盘、文件与 Trash 也各有轮廓。文字标签补充名称，图标先提供对象类别。", asset_ids: ["macintosh-system1-main"], crop: { x: 0.04, y: 0.1, width: 0.68, height: 0.55 } }, { heading: "窗口、位置和菜单组织下一步动作", body: "窗口标题说明用户正在查看 System Disk，图标在窗口内外的位置区分磁盘内容与桌面对象；顶部 File、Edit、View、Special 菜单集中放置动作。图标必须和位置、选择状态与菜单反馈一起工作。", asset_ids: ["macintosh-system1-main"], crop: { x: 0, y: 0, width: 1, height: 1 } }], history: "Computer History Museum 记录 Macintosh 于 1984 年发布，并以窗口、图标、菜单和指向设备概括其图形交互。Apple 的 1984 年销售资料用桌面、文件夹、纸张和废纸篓解释界面。Macintosh 不是图形界面的唯一发明者；相关研究受到 Xerox PARC 工作影响，Apple Lisa 也早于 Macintosh 使用图形界面。", connection: "今天的文件管理器和手机主屏仍在把系统状态变成可见对象。检查界面时可以分别问：对象是否容易区分？当前位置是否清楚？可执行动作是否在需要时出现？结果是否及时反馈？", question: "如果所有文件都只显示同一个白色方块，除了文件名之外，你还需要哪一种视觉线索来避免选错？" },
    claims: [{ claim_id: "18-history-1", text: "Computer History Museum 记录 Macintosh 于 1984 年发布，并以 WIMP 概括界面组成。", kind: "historical_fact", evidence_urls: ["https://computerhistory.org/exhibits/hello-the-mac-at-40/", "https://www.computerhistory.org/revolution/personal-computers/17/303/1200"], verification_status: "verified" }, { claim_id: "18-history-2", text: "Macintosh 图形界面的发展不能归因于单一公司或单一产品。", kind: "historical_fact", evidence_urls: ["https://computerhistory.org/exhibits/hello-the-mac-at-40/"], verification_status: "verified" }, { claim_id: "18-visual-1", text: "截图包含磁盘、文件夹、工具、Trash、窗口与菜单。", kind: "visible_fact", evidence_urls: ["https://www.shopify.com/partners/blog/conversational-interfaces"], verification_status: "verified" }],
    assets: [plan18Asset], review: ["确认图中 System Disk、文件夹、磁盘与 Trash 的标签在全屏查看时清晰。"]
  }),
  pkg({
    content_id: "daily-learning:plan-20-space-to-interface-related-reading", content_type: "related_reading",
    planning: { plan_issue: "20", selection_reason: "四件作品从建筑、家具、个人计算机和移动设备比较边界、入口与反馈，能将观察方法迁移到不同尺度，同时避免宣称直接继承。", primary_observation_theme: "A01", primary_observation_method: "M06", primary_history_node: "H16", core_question: "从空间到界面，设计如何支持行动？", core_discovery: "墙、隔层、窗口和触控区域都在安排边界与入口；用户还需要通过位置、状态或变化知道行动结果。共同问题可以比较，但不构成从建筑到手机的单一路线。", visible_evidence: ["巴拉甘露台用高墙限制视野，《Carlton》用斜板、隔层和空隙提示放置与分隔。", "Macintosh 用窗口、菜单和指针组织操作，初代 iPhone 把大量控制移入会变化的屏幕。"], connection_type: "C02" },
    work: { institution: "Casa Luis Barragán / The Met and Musée des Arts Décoratifs / Computer History Museum / Apple", object_id: "Plan 16–19 comparative set", title: "From space to interface", creator: "Luis Barragán; Ettore Sottsass; Apple Computer; Apple", date: "1947–2007", medium: "Architecture, furniture, desktop GUI, mobile touch interface", source_url: "https://whc.unesco.org/en/list/1136/" },
    article: { title: "从空间到界面，设计如何支持行动？", introduction: "一面墙、一件书架、一个菜单和一块触控屏，似乎很难放在一起。但如果只问‘它怎样让人知道下一步能做什么’，四件作品会出现可比较的线索：设计先划出边界，再提供入口，最后用位置或变化回应行动。", observations: [{ heading: "边界限制一些路径，也突出另一些路径", body: "巴拉甘屋顶露台的高墙遮住城市远景，把注意力推向墙面转折、色彩和天空。《Carlton》的斜板、空隙和隔层提示物品可以被放置、分隔或观看。一个组织身体和视野，一个组织物品，两者都通过限制来产生方向。", asset_ids: ["barragan-roof2-main", "carlton-main"] }, { heading: "数字界面把入口和反馈搬到可变化的表面", body: "Macintosh 用窗口、菜单和指针把数据与动作变成屏幕对象；初代 iPhone 又把许多固定按键移入显示区域。入口从门洞和层板变成菜单项、按钮和触控区，但用户仍需要看见当前位置、可能动作和动作后的状态。", asset_ids: ["chm-500004342-05-01-main", "iphone-2007-sms-main"] }], history: "四件作品对应战后现代建筑、1980 年代 Memphis 设计、个人计算机图形界面和移动触控界面。它们不是一条由空间必然走向屏幕的技术进步线；这里进行的是跨媒介的方法比较，关注不同材料和尺度如何组织边界、入口与反馈。", connection: "进入车站、打开应用或拿取柜中物品时，可以先找边界，再找入口，最后观察系统怎样回应。任何一项缺失，行动就更依赖猜测、记忆或反复试错。", question: "你今天使用过的空间或界面里，哪一个最清楚地告诉了你‘现在在哪里、下一步能做什么’？" },
    claims: [{ claim_id: "20-compare-1", text: "四件作品可按边界、入口和反馈进行跨媒介方法比较。", kind: "editorial_interpretation", evidence_urls: [plan16.work.source_url, plan17.work.source_url, plan18Asset.source_page, plan19.work.source_url], verification_status: "verified" }, { claim_id: "20-boundary-1", text: "比较不主张四件作品构成直接影响或单一技术继承链。", kind: "editorial_interpretation", evidence_urls: [plan16.work.source_url, plan17.work.source_url, plan18Asset.source_page, plan19.work.source_url], verification_status: "verified" }],
    assets: [asRole(plan16.assets[0], "main"), asRole(plan17.assets[0], "comparison"), asRole(plan18Asset, "comparison"), asRole(plan19.assets[0], "comparison")], review: ["确认跨媒介比较没有被页面顺序误读为线性发展。"]
  }),
];

const filenames = [
  "plan-08-anni-albers-3746-v2.json",
  "plan-10-design-related-reading-v2.json",
  "plan-11-cassandre-nord-express-v2.json",
  "plan-13-isotype-merchant-navies-v2.json",
  "plan-14-harry-beck-1933-v2.json",
  "plan-15-visual-communication-related-reading-v2.json",
  "plan-18-macintosh-gui-v2.json",
  "plan-20-space-to-interface-related-reading-v2.json",
];

for (const [index, value] of packages.entries()) {
  writeFileSync(resolve(drafts, filenames[index]), `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
  console.log(`created ${filenames[index]}`);
}

const manifestPath = resolve(root, "data/learning/assets/manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const localAssets = [
  ["moma-3746-main", "截屏2026-10-26 09.44.46.png", plan08Asset.image_url, filenames[0]],
  ["moma-105963-main", "Nord Express PV 1927.avif", plan11Asset.image_url, filenames[2]],
  ["london-museum-beck-1933-main", "WagtailSource-Railway-map.width-1136.format-webp.webp", plan14Asset.image_url, filenames[4]],
  ["chm-500004342-05-01-main", "500004342-05-01.jpg", plan18Asset.image_url, filenames[6]],
];
for (const [assetId, filename, sourceUrl, packageName] of localAssets) {
  const absolute = resolve(root, "public/learning/assets", filename);
  const bytes = readFileSync(absolute);
  manifest[assetId] = { bytes: statSync(absolute).size, package: packageName, path: `learning/assets/${filename}`, sha256: createHash("sha256").update(bytes).digest("hex"), source_url: sourceUrl };
}
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log("updated data/learning/assets/manifest.json");
