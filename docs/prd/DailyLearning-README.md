# 每日一看｜文档目录

> 项目目录目标：`/Users/ieb32/Dev/zaizai-isle/docs/prd`  
> 索引更新日期：2026-11-06  
> 文风：宽松 ASD-STE100

## 一、核心文档（现行）

1. [产品定义 v0.2](./DailyLearning-ProductDefinition-v0.2.md)：定位、目标与范围。初衷锚点：以艺术与设计作品为入口的私人审美探索模块。
2. [审美观察主题 A v0.1](./DailyLearning-ObservationFramework-A-v0.1.md)：8 个主题（A01–A08）、6 种方法（M01–M06）、4 个能力方向。
3. [历史认知框架 B v0.1](./DailyLearning-HistoryFramework-B-v0.1.md)：7 条线索、8 个时期、16 个节点（H01–H16）。
4. [单篇内容编辑规范 v0.1](./DailyLearning-EditorialGuidelines-v0.1.md)：正文、图像、事实与审核规则。

## 二、策划与素材（现行）

5. [A × B 双维度矩阵与前 20 期](./DailyLearning-ContentPlan-20-v0.1.md)：前 20 期已按矩阵发布完毕；§6 覆盖缺口清单仍作选题参考地图使用，不构成固定配额。
6. [史料与图片登记](./DailyLearning-SourceAssetRegister-v0.1.md)：来源与图片发布风险。
7. [内容生产模板](./DailyLearning-ProductionTemplates-v0.1.md)：单件观察、关联阅读、证据和图片记录。

## 三、自动化执行（现行，优先级最高）

日常生产一律以本目录为准，冲突时以下列文档与现行代码、迁移为准：

- [每日一看自动入库 Agent 交接手册](../automation/daily-learning/HANDOFF.md)：当前执行顺序、数据源等级与可达性实测、幂等入库、并发保护、图片交付、异常分类、通知和发布边界。
- [岛主已确认的决定](../automation/daily-learning/decisions.md)：后续 Agent 不得重复询问的有效决定。
- [已拒绝或废止的做法](../automation/daily-learning/declined.md)：后续 Agent 不得再次采用的旧流程与错误做法。

## 四、使用顺序

1. 根据产品定义选择内容目标。
2. 根据 A、B 体系筛选可观察作品；覆盖缺口是参考地图，质量优先。
3. 从 20 期规划与来源登记中选择具有明确作品版本的候选；已发布完毕则按 HANDOFF §4.3 扩展。
4. 按 HANDOFF 锁定对象、图片文件（先实测可达性）、许可和版本，再写正文。
5. 使用内容生产模板完成正文，按单篇内容编辑规范审稿。
6. 结构校验通过后幂等入私有待审核队列；**批准与发布只属于岛主**。

## 五、归档

历史流程与过期文档见 [archive/](./archive/README.md)（含旧 AgentPipeline、AgentReview、样稿、旧实施计划、旧发布准备、简版产品定义、AgentProductionPolicy）。归档文档只用于考古，不作为当前操作要求。

## 六、仓库内依赖

- [IslandOwnerAccount.md](./IslandOwnerAccount.md)：岛主账户与私人数据方案。
- [PerformanceContract.md](./PerformanceContract.md)：全站性能契约。
