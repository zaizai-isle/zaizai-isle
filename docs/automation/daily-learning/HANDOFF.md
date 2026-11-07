# 每日一看自动入库：Agent 交接手册

> 适用仓库：`/Users/ieb32/Dev/zaizai-isle`  
> Supabase 项目：`luudxrfzwwirsszqtgiu`  
> 当前模式：模式 A，Agent 研究、写作、校验并自动送入私有审核队列；岛主独占正式发布权。  
> 更新日期：2026-11-06

## 1. 任务最终结果

每次运行最多完成一件事：制作一份新的、可追溯的 `daily_learning_package_v2`，或者用新证据更新同一 `content_id` 下仍可编辑的工作草稿。

完成标准：

1. 内容包通过 `validateLearningPackageV2`，即 `valid=true`。
2. 包保存到被 Git 忽略的 `.codex-output/learning-drafts/`，不覆盖已有文件。
3. 包以幂等方式写入 `public.daily_learning_article_drafts`。
4. 写入后重新查询，确认状态为 `pending_review / awaiting_owner_review`，内容与本地包完全相同。
5. 未核实的图片、版权、史实和版本问题原样保存在 `claims`、`quality` 与审核字段中。
6. Agent 不调用审核或发布接口，不写 `daily_learning_review_decisions`，不写 `daily_learning_publications`。

`readyForOwnerReview=false` 不阻止私有入库。它表示仍有待核事项，不表示包结构无效。

## 2. 不可越过的权限边界

Agent 可以：

- 搜索候选、研究、写正文和生成 v2 包。
- 自动保存本地研究和固定内容包。
- 自动新增或更新私有待审核草稿。
- 在图片、manifest 或必要代码确实发生变化时，完成代码校验后提交并推送严格限定的每日一看文件。

Agent 不可以：

- 自动批准、自动发布或调用 `review_daily_learning_v2`。
- 修改已批准、已退回、已有正式审核决定或已发布的草稿。
- 把 `needs_review`、`blocked` 或未知事实改写为 `verified`、`passed`。
- 读取岛主私人反馈来选题。
- 使用 Gemini 或其他外部生成模型。
- 通过生成图代替真实作品图片。
- 执行浏览器页面验证。浏览器验证由岛主手动完成。
- 为了完成任务扩大数据库权限、绕过 RLS 或把服务端密钥放进仓库/前端。

正式发布的当前门禁以代码为准：`validateLearningPackageForPublication` 要求 v2 包结构有效并含一张结构有效的主图。`readyForOwnerReview`、未核 claims 和 blockers 继续展示并进入发布快照，但不会阻止岛主主动发布。这个例外只属于岛主，Agent 仍然不能发布。

## 3. 真相来源与阅读顺序

不要只读旧 PRD。按下面顺序建立当前事实：

1. 仓库根目录 `AGENTS.md`。
2. `docs/prd/DailyLearning-README.md` 指定的产品定义、A 观察体系、B 历史框架、编辑规范、前 20 期、来源登记与生产模板。
3. 本目录的 [`decisions.md`](./decisions.md) 与 [`declined.md`](./declined.md)。
4. 当前代码：
   - `src/app/learning/learning-package.ts`
   - `src/app/learning/review/LearningReview.tsx`
   - `src/app/learning/learning-asset-cache.ts`
   - `src/components/bento/DailyLearningCardContent.tsx`
5. 当前数据库迁移：
   - `20261020073800_daily_learning_v2_contract.sql`
   - `20261030045838_daily_learning_mutable_pending_drafts.sql`
   - `20261030063615_manage_daily_learning_publications.sql`
6. `data/learning/research/latest.json`、`.codex-output/learning-drafts/` 与自动化 memory。
7. Supabase 当前数据。数据库状态、代码和最新文件优先于旧流程文档。

2026-11-06 起，历史流程文档（AgentPipeline、AgentReview-Implementation、RelatedReading 样稿、旧实施计划、旧发布准备、简版产品定义、AgentProductionPolicy）已移入 `docs/prd/archive/`，不再作为阅读清单。其中仍有效的规则已合并进本手册（见 §4.3、§4.9）。归档文档只用于考古，不作为当前操作要求。

## 4. 每次运行的固定流程

### 4.1 建立基线

先查询并保存：

- `island_owner_accounts` 是否恰好一条记录。
- `daily_learning_article_drafts` 的 `content_id`、版本、状态、更新时间、A/M/B、媒介、地区、主图与 `quality.generated_at`。
- `daily_learning_publications` 和 `daily_learning_review_decisions`。
- 每个本地 `content_id` 中 `quality.generated_at` 最新的 v2 包。

本地同一 `content_id` 有多份研究文件时，只采用 `quality.generated_at` 最新的完整包。过程记录、备份、旧 blocked 文件和错误生成的历史版本不能当成待入库的新包。

比较本地包和数据库包时要比较完整标准包：

```text
schema_version, content_id, content_type, planning, work,
article, claims, assets, quality
```

如果数据库草稿的 `quality.generated_at` 或 `updated_at` 更新，不得用旧本地文件回写。

### 4.2 优先补入已有有效本地包

如果存在 `valid=true`、数据库中尚无相同包的本地包，先完成幂等检查并入库，不要重复研究同一作品。

以下情况才开始新选题：

- 没有遗漏入库的有效本地包；
- 没有新证据可用于更新可编辑草稿；
- 当前运行仍需要生产新内容。

### 4.3 选择候选

候选必须同时满足：

- 是一件明确馆藏作品或明确历史版本；
- 有可追溯的官方对象页；
- 有具体图片文件或至少有可信的具体文件登记；
- 与近期 `content_id`、作品、A/M/B、媒介、地区和作者不过度重复；
- 能提出一个由作品具体特征支撑的问题。

优先检查前 20 期与来源登记；已全部发布时，从尚未充分覆盖的 B 节点和地区、媒介中扩展。不要为了轮换而降低证据标准。

数据源等级（检索顺序，不替代单件作品的质量判断）：

| 等级 | 数据源 | 必要条件 |
| --- | --- | --- |
| 优先 | Met Open Access、Art Institute of Chicago、Cleveland Open Access、Smithsonian Open Access | 具体作品标记 Open Access / CC0 / `is_public_domain=true` |
| 补充 | Library of Congress、Wikimedia Commons | 逐项核对具体文件许可、署名与再利用要求 |
| 仅研究 | MoMA、V&A、Design Museum 及专业档案 | 页面可访问不构成图片使用许可 |

本机网络实测（2026-11-06）：`upload.wikimedia.org` 与 `thumb.wikimedia.org` 不可达；Met API 与 Met 图片 CDN 被网关劫持；Cleveland 原生 open access CDN 可直连下载。选题前必须先实测图片 URL 可达性；下不到图的候选只入池记录，不生产文字稿。机构级可达性清单（`data/learning/research/source-reachability.json`）待建，建成前按本段实测结论执行。

选题顺序：① 前 20 期未发布候选；② 来源登记中已备素材；③ 覆盖缺口参考（A/M/B 空白格是加分项，不是配额，质量优先）；④ 自由探索。允许少量自由探索，不强制覆盖比例。

多样性检查：每次选题对照已发布与队列中未发布草稿，检查 A/M/B、线索、地区、时期、媒介、作者是否集中。单次选题不因一条主观反馈被排除。

内容类型：`single_artwork`（一件作品、一个核心问题、一项主 A/M/B）与 `related_reading`（比较多件已核实作品，区分史实影响与方法比较，独立可读）。"4 单件 + 1 关联"仅为编辑参考比例。

反馈边界：不自动读取私人反馈选题；即使获得授权，也只把明确的兴趣、疑问和理解困难当弱信号；不建兴趣评分或心理画像；私人反馈不进入公开文案、外部搜索查询或第三方模型请求。

### 4.4 先锁定版本和图片，再写正文

研究顺序必须是：

1. 官方对象页：馆藏号、标题、作者/文化、年代、媒介、机构。
2. 具体图片文件页：文件名、作品对应关系、许可、尺寸、署名。
3. 至少一个独立或专题来源：历史背景、工艺、语境。
4. 排除同名作品、部件记录、替代视图和其他馆藏的相似作品。
5. 尝试读取实际图片像素；许可核查和图片可达性必须分开记录。
6. 只在上述边界明确后写正文。

如果未读取像素：

- 可以使用来源明确记录的真实文件宽高，不能从作品厘米尺寸或搜索缩略图猜测。
- 可用馆方的图像描述组织保守的观察动作，但 visible claim、asset availability 和视觉检查必须保持待核。
- 正文不能声称 Agent 已经“看到”未读图片。

如果宽高未知，包在结构上无效。保存研究，报告 `assets[n] 必须记录有效宽高`，不得编造数字，也不得入库。

### 4.5 写公开正文与内部审核记录

读者字段只写作品内容：

- `work.title/creator/date/medium/institution`
- `article.title/introduction/observations/history/connection/question`
- 对应的 `source_record` 展示字段

这些字段不得出现：

```text
候选作品、照片匹配待核、待官方复核、沿用研究登记、受阻研究、
研究草稿、图片尚待读取、待核、待审、未核、needs_review、blocked
```

所有不确定性写入：

- `claims[].verification_status`
- `quality.checks`
- `quality.blockers`
- `quality.human_review_items`
- `assets[].rights_statement`
- `assets[].availability_status`

单篇正文保持一个核心问题，1–2 个观察段，历史背景只服务当前观察，最后保留三种固定反馈和可选自由文字。

### 4.6 结构校验与本地保存

必须调用仓库当前的 `validateLearningPackageV2`，不能凭字段目测代替。

保存规则：

- 路径：`.codex-output/learning-drafts/YYYY-MM-DD-<source>-<id>-v2-<state>.json`
- 使用新文件名，不覆盖历史文件。
- 研究证据、校验结果、数据库 preflight 和 run audit 放进同日期研究目录。
- 本地包是研究快照；数据库 `version` 是业务版本，两者不能混为一谈。

还要执行公开文案扫描和以下代码验证：

```bash
env PATH="$PWD/.conda-env/bin:$PATH" \
  node --import tsx --test \
  scripts/daily-learning-cloud.test.mjs \
  scripts/daily-learning-package.test.ts

git diff --check
```

如果只新增 Git 忽略的研究文件，通常不需要 lint/build。若修改任何代码、manifest 或公开资源，则继续执行：

```bash
env PATH="$PWD/.conda-env/bin:$PATH" npm run lint
env PATH="$PWD/.conda-env/bin:$PATH" npm run build
```

### 4.7 Supabase 幂等写入

目标表：`public.daily_learning_article_drafts`。

字段映射：

| 包字段 | 数据库字段 |
| --- | --- |
| `schema_version` | `package_schema_version` |
| `content_id` | `content_id` |
| `content_type` | `content_type` |
| `planning` | `planning` |
| `work` | `work_record` |
| `article` | `content` |
| `claims` | `claims` |
| `assets` | `assets` |
| `quality` | `quality` |
| work + 主图权利/尺寸/alt | `source_record` |

`source_record` 至少完整映射作品信息、`source_id`、主图 URL、权利说明、许可 URL、署名、真实宽高和 alt。不要只写一部分包。

写入事务必须：

1. 以 `content_id` 获取 advisory transaction lock，或使用等价的单事务串行保护。
2. 再次确认唯一 owner。
3. 再次检查同一完整包是否已存在；相同则成功退出，不新增也不更新。
4. 再次检查 publications 与 review decisions。
5. 查找可编辑工作草稿：
   - 同一 `content_id`
   - `status='pending_review'`
   - `production_status='awaiting_owner_review'`
   - 无正式审核决定
   - 无 publication
   - 无 `approved_content`
6. 有可编辑草稿时原地更新，保留 `id`、`source_id`、`version`。
7. UPDATE 条件必须包含 `id`、`status`、`production_status`、`updated_at`，并重新检查 publications/decisions。
8. UPDATE 返回 0 行时停止并报告并发冲突；绝不能退回 INSERT。
9. 只有没有任何可编辑草稿时，按同一 `content_id` 最大版本 + 1 新建。
10. 新建状态固定为 `pending_review / awaiting_owner_review`，`package_schema_version=2`。

已批准、已发布、有审核决定或 `changes_requested/rejected` 的版本是锁定快照。修订时新增版本，绝不能更新旧行。

写入后独立 requery：

- `id/content_id/version/status/production_status/updated_at`
- 完整包相等
- owner 正确
- blockers 数量
- decisions=0
- publications=0

这一步没有通过，不能报告“入库成功”。

### 4.8 图片和部署分支

只有取得可追溯原图并需要交付公开静态资源时才进入这个分支。

- 原图保留作研究证据，不直接用于首页或详情页。
- 生成等比阅读图与轻量首页缩略图。
- 不擅自裁切作品。竖图完整显示，首页使用 `contain`；横图使用横版容器。
- `assets` 记录阅读图的真实宽高。
- manifest 同一 `asset_id` 记录阅读图 `path`、`thumbnail_path`、字节数和 SHA256。
- 首页不得加载原始大图、详情图或被裁掉人物/作品边界的图片。

部署前必须通过：结构校验、幂等检查、manifest/哈希/尺寸检查、lint、每日一看测试、production build。

提交时只暂存本次运行新生成或修改的每日一看文件。排除原始大图、临时研究、密钥和工作区原有修改。推送前确认远端没有分叉；不强推、不改写历史。部署代码和静态资源不等于文章批准或发布。

### 4.9 异常分类与处理

| 异常 | 处理 |
| --- | --- |
| 来源冲突 | 标记 `blocked_source_conflict`；保留差异与原文证据 |
| 作品版本不明确 | 标记 `blocked_object_version`；停止成稿 |
| 主图许可不明确 | 标记 `blocked_image_rights`；寻找合规替代候选 |
| 图片不可下载或无法访问 | 标记 `blocked_asset_unavailable`；候选只入池，不生产文字稿 |
| 关键论断无证据 | 删除或收窄论断；无法处理则退回研究 |
| 重复选题或关联不足 | 说明重复原因，提出其他候选 |
| 生产失败 | 保留日志；不得自动发布旧稿或未经审核的稿件 |

Agent 无法独立核实的项目如实标记待核。不得将不确定项写成审核通过。

## 5. 通知规则

只有以下情况通知岛主：

- 新 v2 包成功入库；
- 校验或入库失败；
- 新出现来源、版权或作品版本风险；
- 需要岛主补图、补证或作决定。

相同包已存在、旧 blocker 没有新证据、没有新候选时保持安静。

成功通知只写：

- 草稿 ID、`content_id`、版本、A/M/B；
- 本地包位置；
- 仍需人工看的 1–3 个具体事项；
- 明确说明未批准、未发布。

不要把研究过程、所有来源尝试和长篇内部日志塞进通知。

## 6. 当前已知问题与改进方向

现有实现能工作，但仍有明显工程债务：

1. 数据库 intake 逻辑主要由每次运行临时拼 SQL，容易产生字段映射、转义和并发差异。应收敛为仓库内受测脚本或受约束的数据库函数。
2. `.codex-output` 同一作品保留大量 blocked、backup、update 和 deployed 文件。必须按 `quality.generated_at` 与数据库新鲜度选最新包，不能按文件名或修改时间猜。
3. `collect_learning_research.py` 只产生候选，不保证具体图片许可、像素可读或文章可写；不能把 `latest.json` 当生产队列。
4. `cache_learning_assets.py` 是旧式缓存器，当前图片规则还要求独立缩略图、方向处理、字节数和 SHA256。使用前先核对当前 manifest 和 dirty changes，不能直接批量运行。
5. ~~旧 PRD 与当前规则冲突。后续应将本手册和 `DailyLearning-AgentProductionPolicy` 合并成单一规范，并删除过时描述。~~ 已完成（2026-11-06）：政策有效内容已合并进本手册 §4.3、§4.9，历史文档移入 `docs/prd/archive/`。

## 7. 下一位 Agent 的首要工程任务

在不改变产品规则的前提下，建议先完成一个仓库内 `scripts/intake_daily_learning_package.mjs`：

- 输入单个 v2 JSON 文件；
- 调用共享 validator；
- 执行公开文案扫描；
- 查询当前数据库状态；
- 计算标准包哈希；
- 按本手册的事务、幂等和并发规则更新或插入；
- 输出机器可读 audit；
- 默认不碰 approval/publication；
- 为相同包、可编辑原地更新、锁定后新版本、并发失败写数据库测试。

这会消除当前最容易出错的“每次由 Agent 临时生成 intake SQL”环节。

## 8. 可直接交给下一位 Agent 的短提示词

```text
在 /Users/ieb32/Dev/zaizai-isle 执行每日一看模式 A。
先读 AGENTS.md、docs/prd/DailyLearning-README.md、
docs/automation/daily-learning/HANDOFF.md、decisions.md、declined.md，
再以当前代码、迁移、Supabase 和最新本地包为准。

先做本地包与数据库全量幂等扫描，优先补入 valid=true 的遗漏包；
没有遗漏时才选一件版本与具体图片可追溯的新作品。
先锁定对象、图片文件、许可和版本，再写正文。
公开文案不得出现内部审核状态；未知事实如实保留在 claims/quality/assets。
valid=true 即可进入 pending_review/awaiting_owner_review，readyForOwnerReview=false 不阻止私有入库。
可编辑待审核草稿原地更新并保留 id/source_id/version；锁定版本才新增 version。
所有更新带 id/status/production_status/updated_at 并发条件，失败后不得 fallback insert。
写入后重新查询并验证完整包相等、无 decision/publication。
不得批准、发布、调用 review_daily_learning_v2、读取私人反馈或使用外部生成模型。
浏览器验证由岛主完成。
只有新包成功入库、失败、新风险或需要岛主决定时通知。
```
