# 每日一看模块代码审查报告

> 审查日期：2026-11-06 · 方式：分区只读审查（数据库/UI/脚本/核心数据层）+ 关键指控逐条人工复核
> 基线：`npm run lint` 通过；`daily-learning-package.test.ts` 10/10 通过
> 本报告的"规则含义"节是制定自动化任务规则的直接输入

## 一、Blocker（4 项，全部经人工复核确认）

### B1 数据库层可零审核记录直接发布
- 位置：[INSERT 策略](../../supabase/migrations/20261019110000_daily_learning_drafts_review.sql#L36)不约束 `production_status`；[保护触发器](../../supabase/migrations/20261020073800_daily_learning_v2_contract.sql#L134)只在 `production_status` **变化时**要求审核决策，且[只挂 UPDATE](../../supabase/migrations/20261020073800_daily_learning_v2_contract.sql#L164)。
- 攻击链：INSERT 时直接写 `owner_approved` → UPDATE 补 `status='approved'`+`approved_content` → INSERT publications。全程 `daily_learning_review_decisions` 零记录。
- 实际风险：能执行的只有岛主会话（anon-key+岛主登录），即**自动化脚本以岛主身份运行时没有数据库护栏**——正是本项目最怕的失效模式。
- 修复：① INSERT 策略强制 `production_status='awaiting_owner_review'`；② 触发器对 `new.status='approved'` 无条件要求匹配决策行。

### B2 版权受限图片随 GitHub Pages 公开
- 已确认 git 跟踪并会部署：`Nord Express PV 1927.avif`（Copyrights World 水印）、`WagtailSource-Railway-map…webp`（London Museum）、`Screenshot-2023-11-15…jpg`；另有 manifest 两条 `moma-*-main` 指向仅研究级来源。`截屏2026-10-26.png` 仅存本地未入库。
- 审核页防护是纯客户端的，静态资源直链无实际访问控制。
- 修复：受限预览图立即移出 `public/`（私有审核走 DB 快照或签名 URL）；`cache_learning_assets.py` 的批量写入路径停用。

### B3 缩略图体系名存实亡
- manifest 34 条仅 2 条有 `thumbnail_path`；[learningThumbnailUrl](../../src/app/learning/learning-asset-cache.ts#L11) 缺失时静默回退原图（最大 8.9MB，目录共 118MB）；`next.config` 全局 `images.unoptimized:true` 使所有尺寸声明失效。首页/历史网格/画廊/主图四处实际加载原图。
- 修复：批量生成缩略图入 manifest；回退策略改为小占位而非原图；建立构建期多尺寸派生流水线。

### B4 `/learning` 正文完全客户端化 + 深链 404
- 正文等 JS+Supabase 查询后才出现（违反性能契约 §2A）；一次拉 100 行完整快照只为渲染一篇。
- [`[id]/page.tsx`](../../src/app/learning/[id]/page.tsx#L5) `generateStaticParams` 只枚举 5 条硬编码兜底且 `dynamicParams=false`，所有 `publication-<uuid>` 直达链接 404，首页卡片被迫用 `?entry=` 丑链接。
- 修复：发布内容构建期静态直出（或 SSR）；`[id]` 路由支持 publication id。

## 二、Major（按主题归并）

**权限与流程**
1. 写入角色≡审批角色：`authenticated` 同时持有 drafts 写、`review_decisions` 直接 INSERT、`publications` INSERT。自动化必须改用独立低权限角色（配合 B1 修复）。
2. 退回/拒绝后 `production_status` 滞留 `awaiting_owner_review`，审核队列索引永久含已关闭草稿。
3. 查询失败/为空时静默回退 10-14 的 v0.1 静态旧稿，读者无法分辨"没有新内容"与"加载失败"。
4. **公开文案扫描零代码实现**：状态词红线（待核/候选/blocked 等）只存在于 HANDOFF 文字，validator 与测试均无。
5. 采集 workflow 10-30 后停摆 7 天无通知；0 候选与全源失败不区分（违反 HANDOFF §5）。

**数据质量**
6. 缺宽高时前端编造 1024×1024，占位比例失真。
7. 局部图裁切决策硬编码在 [learning-detail-decisions.ts](../../src/app/learning/learning-detail-decisions.ts)，每篇新文章需改代码重部署；应进包 `observations[].crop`。
8. `learning-plan-gaps.ts` 整文件手工快照，随 DB 静默腐烂；issue 08 同作品两个编号自相矛盾（应属 `blocked_object_version`）。

**采集器**
9. THEMES 硬编码 8 组 (A,H,keyword)，无 M 维度、与 ContentPlan 矩阵不对齐、H04/H08/H12–H16 永不覆盖。
10. 无法识别"200+错误体"式网关劫持（Met 实测间歇性发生），静默空结果混入正常输出。
11. 不探测图片可达性、不记录宽高/字节，无法支撑"选题前实测可达性"规则；`source-reachability.json` 待建。
12. `cache_learning_assets.py`：按文件名而非 `generated_at` 选包、`--refresh` 会销毁新格式 manifest 的 `thumbnail_*` 字段、wikimedia URL 一律改写不可达域名、macOS-only 硬编码。建议退役重写。

**性能与无障碍**
13. 占位几何不一致致 CLS（骨架 h-28/32 vs 竖图 h-32/36、列 48% vs 36%）。
14. lightbox 无焦点管理（不移入、无陷阱、不归还）。
15. `text-white/35` 9px 文字对比度约 2.5–3:1，低于 WCAG AA。
16. 反馈区就绪前串行 4 次往返（getSession→getUser 重复→白名单→响应列表）。

**测试缺口**
17. validator 仅覆盖约 1/4 分支：主图唯一性（0 主/2 主）、宽高校验、发布门 `!mainAsset` 分支、`related_reading` 全类型均无测试。
18. DB 层并发 UPDATE 0 行、幂等重复写入、发布后工作副本保护、`review_decisions` 防篡改触发器本体均未测。

## 三、Minor（择要）

`pontianakDate` 重复实现且静态导出下冻结于构建时；首页卡片资产映射硬编码 3 个 id；读者页暴露"内容管理"入口与内部流水线文案（"选题准备中"等，贴近红线未硬违规）；`viewedSnapshot` 整包入库行膨胀；`listLearningResponses` 无显式 `user_id` 过滤；`responses.updated_at` 客户端可伪造；deploy.yml 注入 `NEXT_PUBLIC_GEMINI_API_KEY` 与"不用外部生成模型"决定矛盾（建议清理）；`[id]` 页 `aria-label` 无 role；历史图属性盒与 CSS 比例不一致。

## 四、对自动化任务规则的直接含义

| # | 规则条款（建议稿） | 依据 |
| --- | --- | --- |
| R1 | 自动化入库必须使用独立低权限角色：只能 INSERT/UPDATE `production_status='awaiting_owner_review'` 的 v2 草稿；对 `review_decisions`、`publications` 零权限。DB 迁移先行（B1+M1）。 | B1, M1 |
| R2 | 图片交付三件套成为入库硬条件：真实宽高 + 独立缩略图 + SHA256 全部写入 manifest，缺一不入库。 | B3, M12 |
| R3 | 选题前先实测图片 URL 可达性并落 `source-reachability.json`；下不到图只入池不生产。 | M10, M11 |
| R4 | 公开文案扫描写进 validator（正则扫读者可见字段的状态词），不再靠文档自觉。 | M4 |
| R5 | 受限/水印/截图类图片禁止进入 `public/`；私有预览走 DB 快照。 | B2 |
| R6 | 失败通知分级：0 候选（静默）/部分源失败（记录）/全部失败或校验失败（通知岛主）。 | M5 |
| R7 | 空队列时读者端显示"今天没有新内容"，禁止静默回退旧稿。 | M3 |
| R8 | 深链统一为 `/learning/<publication-id>`，`?entry=` 退役。 | B4 |

## 五、建议修复顺序

- **P0（权利与安全）**：B2 移出受限图 → B1+R1 迁移（INSERT 策略+无条件门禁+独立写入角色）
- **P1（内容质量硬规则）**：R2 缩略图流水线 → R4 文案扫描入 validator → R7 空队列显示 → B4 深链
- **P2（采集与运维）**：collector 对齐矩阵+形状校验+失败通知 → cache 脚本退役 → 补测试（主图唯一性/宽高/并发/幂等）
- **P3（体验打磨）**：CLS、lightbox 焦点、对比度、串行往返、Minor 清单
