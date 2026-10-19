# Zaizai Isle 文档地图

> 当前站点版本：V1.4.5
>
> 文档基线日期：2026-10-14
>
> 说明：此页是文档库索引；“当前”文档代表现行约束，“规划”文档代表后续方向，“归档”文档仅用于追溯。

## 当前文档

| 文档 | 用途 | 状态 |
|---|---|---|
| [产品说明书](/zaizai-isle/docs/PRODUCT_DOCUMENTATION) | 当前产品定位、信息架构、模块与版本足迹 | Current · V1.4.5 |
| 生长足迹（文档库左侧导航） | 当前执行版本与各历史产品快照 | Current |
| [产品愿景与叙事规范](/zaizai-isle/docs/prd/Product) | 个人数字空间定位、积累原则、表达与建设边界 | Current |
| [当前执行 PRD](/zaizai-isle/docs/prd/PRD-ACTIVE) | 本轮改动范围、非目标与验收标准 | Active · V1.5 calibration |
| [发布检查清单](/zaizai-isle/docs/prd/ReleaseChecklist) | 文档、质量、GitHub Pages 发布前检查 | Active |
| [全站性能契约](/zaizai-isle/docs/prd/PerformanceContract) | 页面加载层级、客户端边界、占位、数据与资源规则 | Active · Required for page work |

## 模块与版本规划

| 文档 | 用途 | 状态 |
|---|---|---|
| [版本升级规划](/zaizai-isle/docs/prd/VersionUpgradePlan) | V1.3 至 V2.0 的站点演进路径 | Active |
| [人生护照版本规划](/zaizai-isle/docs/prd/LifePassportRoadmap) | `/achievement` 的独立功能版本路线 | Active · Passport v0.2.2 |
| [人生护照下一阶段范围草案](/zaizai-isle/docs/prd/LifePassportNextPhase) | 云端持久化优先，浏览功能后续 | Active · 实施中 |
| [小岛日签规格](/zaizai-isle/docs/prd/IsleDaily-v0.1) | `/daily` 的当前能力、内容规则与边界 | Active · Daily v0.1 |
| [每日学习模块草案](/zaizai-isle/docs/prd/DailyLearning-v0.1) | 每日一则艺术史或设计史内容、私人反馈与积累方式 | Draft · 未开发 |
| [岛主账户与私人数据方案](/zaizai-isle/docs/prd/IslandOwnerAccount) | 人生护照与每日学习共用的永久岛主身份、匿名访客边界 | Draft · 未开发 |
| [资产优化计划](/zaizai-isle/docs/prd/AssetOptimizationPlan) | 静态导出下的图片与天气图标策略 | Maintained |

[人生护照云端部署与验证](/zaizai-isle/docs/prd/LifePassportCloudDeployment)：免注册、恢复密钥、部署步骤与验收边界。

## 历史与归档

| 文档 | 说明 | 状态 |
|---|---|---|
| [V1.0 PRD](/zaizai-isle/docs/archive/PRD-001-v1.0) | 初始个人主页与 Bento Grid 需求 | Archived |
| [V1.2 PRD](/zaizai-isle/docs/archive/PRD-002-v1.2) | 移动端与分析能力阶段需求 | Archived |
| [V1.2.6 实施计划](/zaizai-isle/docs/archive/ImplementationPlan-v1.2.6) | 旧版结构实施记录 | Archived |
| [V1.2.0 产品快照](/zaizai-isle/docs/history/PRODUCT_V1.2.0_Original) | Experience 阶段产品说明书原始快照 | Historical snapshot |
| [V1.3.0 产品快照](/zaizai-isle/docs/history/PRODUCT_V1.3.0_Reconstructed) | Maintenance Memory 发布提交中的产品说明 | Reconstructed snapshot |
| [V1.4.0 产品快照](/zaizai-isle/docs/history/PRODUCT_V1.4.0_Reconstructed) | Built Structures 发布提交中的产品说明 | Reconstructed snapshot |
| [V1.4.1 产品快照](/zaizai-isle/docs/history/PRODUCT_V1.4.1_Reconstructed) | Passport 与 Banana Proxy 发布提交中的产品说明 | Reconstructed snapshot |
| [V1.4.2 产品快照](/zaizai-isle/docs/history/PRODUCT_V1.4.2_Reconstructed) | Passport Journal Refinement 发布提交中的产品说明 | Reconstructed snapshot |
| [V1.4.5 产品快照](/zaizai-isle/docs/history/PRODUCT_V1.4.5_Reconstructed) | 首页加载优化发布提交的追溯产品快照 | Reconstructed snapshot |

### 产品快照补档说明

V1.2.0 之后曾继续编辑同一份 `PRODUCT_DOCUMENTATION.md`，发布流程没有要求冻结副本，因此 V1.3.0 至 V1.4.5 的独立快照于 2026-10-14 从发布提交追溯补建。仓库当前仍没有版本 Tag。

| 版本 | 可追溯发布提交 | 发布时间 | 补档状态 |
|---|---|---|---|
| V1.3.0 | `3c8a6be` | 2026-07-16 | 已追溯补建 |
| V1.4.0 | `92941dc` | 2026-08-07 | 已追溯补建 |
| V1.4.1 | `79243ce` | 2026-08-10 | 已追溯补建 |
| V1.4.2 | `780f4d7` | 2026-08-12 | 已追溯补建 |
| V1.4.5 | `79a982b` | 2026-10-13 | 已追溯补建；发布时未同步版本元数据 |

V1.2.6 和 V1.2.8 留有实施计划或生成资产归档，但这些材料不能替代完整产品快照；V1.2.9 目前仅有维护记录与 Git 历史。是否为补丁版本逐一补档，可在正式回填历史时统一决定。

## 文档维护规则

1. 产品定位或模块职责改变时，更新产品说明书与当前执行 PRD。
2. 独立模块拥有自己的内部版本，不占用 Zaizai Isle 站点版本号。
3. 发布时同步更新 `package.json`、`CHANGELOG.md`、产品说明书和发布检查记录。
4. 已失效但仍有追溯价值的文档进入 `docs/archive/`，不继续作为当前依据。
5. 文档状态必须明确使用 Current、Active、Maintained、Historical 或 Archived。
6. 长期定位以 Product 为准，本轮范围以 PRD-ACTIVE 为准；产品说明区分现有能力与待实现方向。历史内容迁移是后续可选工作，不是当前发布前置条件。
7. 每个正式发布版本应在 `docs/history/` 保存当时的产品说明快照，并在生长足迹中链接；实现计划和 Git 提交不能替代面向产品的版本快照。
8. 追溯快照必须注明来源提交、原始发布时间和补建日期，不能伪装成发布当时已经存在的文档。
