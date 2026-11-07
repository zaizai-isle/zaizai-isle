# 归档说明

> 归档日期：2026-11-06  
> 规则：归档文档只用于考古与追溯，**不作为任何当前操作要求**。当前规则一律以 `docs/automation/daily-learning/HANDOFF.md`、`decisions.md`、`declined.md` 及现行代码、迁移为准。

## 归档清单与原因

| 文档 | 归档原因 | 现行替代 |
| --- | --- | --- |
| `DailyLearning-v0.2.md` | 10-15 简版产品定义，被 10-16 的 ProductDefinition v0.2 取代 | `../DailyLearning-ProductDefinition-v0.2.md` |
| `DailyLearning-AgentPipeline-v0.1.md` | 含已废止流程（岛主手工导入 JSON、批准后再发布） | `docs/automation/daily-learning/HANDOFF.md` |
| `DailyLearning-AgentReview-Implementation.md` | 历史审核实现描述，与当前审核页和迁移不符 | `HANDOFF.md` + `src/app/learning/review/` |
| `DailyLearning-RelatedReading-Sample-10-v0.1.md` | 内容验证样稿，前 20 期已实际发布，使命完成 | 数据库已发布内容 |
| `DailyLearning-ImplementationPlan-v0.2.md` | 10-20 实施计划所列事项已全部落地（v2 契约、可编辑草稿、发布管理迁移） | 当前代码与迁移 |
| `DailyLearning-ReleaseReadiness-v0.1.md` | 10-16 核对稿，当时未读取本地仓库与线上环境，状态全部过期 | `HANDOFF.md` §2、§6 |
| `DailyLearning-AgentProductionPolicy-v0.1.md` | 与 HANDOFF 大量重叠；有效内容（数据源等级、选题顺序、多样性检查、内容类型比例、反馈边界、异常分类）已于 2026-11-06 合并进 HANDOFF §4.3、§4.9 | `HANDOFF.md` |

## 岛主补充决定的原文位置

政策文档头部各节"岛主补充"（10-30 自动入库、11-04 发布门禁、11-05 文案分离与图片方向）的权威记录在 `docs/automation/daily-learning/decisions.md`，未随归档失效。
