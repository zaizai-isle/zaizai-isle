# Zaizai Isle 文档地图

> 当前站点版本：V1.4.2
>
> 文档基线日期：2026-08-12
>
> 说明：此页是文档库索引；“当前”文档代表现行约束，“规划”文档代表后续方向，“归档”文档仅用于追溯。

## 当前文档

| 文档 | 用途 | 状态 |
|---|---|---|
| [产品说明书](/zaizai-isle/docs/PRODUCT_DOCUMENTATION) | 当前产品定位、信息架构、模块与版本足迹 | Current · V1.4.2 |
| [产品愿景与叙事规范](/zaizai-isle/docs/prd/Product) | 最高层产品原则、三层叙事与扩建边界 | Current |
| [当前执行 PRD](/zaizai-isle/docs/prd/PRD-ACTIVE) | 本轮改动范围、非目标与验收标准 | Active · V1.4.2 |
| [发布检查清单](/zaizai-isle/docs/prd/ReleaseChecklist) | 文档、质量、GitHub Pages 发布前检查 | Active |

## 模块与版本规划

| 文档 | 用途 | 状态 |
|---|---|---|
| [版本升级规划](/zaizai-isle/docs/prd/VersionUpgradePlan) | V1.3 至 V2.0 的站点演进路径 | Active |
| [人生护照版本规划](/zaizai-isle/docs/prd/LifePassportRoadmap) | `/achievement` 的独立功能版本路线 | Active · Passport v0.2.2 |
| [小岛日签规格](/zaizai-isle/docs/prd/IsleDaily-v0.1) | `/daily` 的当前能力、内容规则与边界 | Active · Daily v0.1 |
| [资产优化计划](/zaizai-isle/docs/prd/AssetOptimizationPlan) | 静态导出下的图片与天气图标策略 | Maintained |

## 历史与归档

| 文档 | 说明 | 状态 |
|---|---|---|
| [V1.0 PRD](/zaizai-isle/docs/archive/PRD-001-v1.0) | 初始个人主页与 Bento Grid 需求 | Archived |
| [V1.2 PRD](/zaizai-isle/docs/archive/PRD-002-v1.2) | 移动端与分析能力阶段需求 | Archived |
| [V1.2.6 实施计划](/zaizai-isle/docs/archive/ImplementationPlan-v1.2.6) | 旧版结构实施记录 | Archived |
| [V1.2.0 产品快照](/zaizai-isle/docs/history/PRODUCT_V1.2.0_Original) | Experience 阶段产品说明书原始快照 | Historical snapshot |

## 文档维护规则

1. 产品定位或模块职责改变时，更新产品说明书与当前执行 PRD。
2. 独立模块拥有自己的内部版本，不占用 Zaizai Isle 站点版本号。
3. 发布时同步更新 `package.json`、`CHANGELOG.md`、产品说明书和发布检查记录。
4. 已失效但仍有追溯价值的文档进入 `docs/archive/`，不继续作为当前依据。
5. 文档状态必须明确使用 Current、Active、Maintained、Historical 或 Archived。
