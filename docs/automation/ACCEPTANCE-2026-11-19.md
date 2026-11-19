# 三阶段收敛验收总账（2026-11-19）

验收基线提交：`c891c21`（线上部署 = HEAD，Actions run 成功）。
本文件把每条要求对应到可复跑的证据；岛主只需完成文末两项人工动作即可全绿。

## ① Banana 凭证 → 额度

| 要求 | 证据 | 状态 |
|---|---|---|
| 导出产物不含供应商凭证 | `npm run audit:export` 通过；线上护照页 HTML+12 个初始 chunk 实扫 0 命中；git 全历史 273 提交 0 命中 | ✅ |
| 旧凭证已失效 | `HTTPS_PROXY=http://127.0.0.1:7897 NODE_USE_ENV_PROXY=1 node scripts/verify-gemini-key-revoked.mjs` | ⛔ 待岛主到 aistudio.google.com/apikey 删除 key（当前实测仍返回 200/50 模型） |
| 额度用尽后不再调用供应商 | `npm run test:banana-ai`：并发打满后供应商调用次数=额度数，之后请求 429 `quota_exhausted` 0 次供应商调用；额度后端不可达 503 fail-closed | ✅（额度表+函数已部署） |
| 同一请求只消耗一次 | 同上：同一 `request_id` 重试 5 次仅扣 1 次（`consume_banana_ai_quota` 幂等台账） | ✅ |
| 护照匿名登录仍能保存与恢复 | `test:banana-ai` 共存用例 + `test:passport-cloud`/`test:passport-storage` 全绿 | ✅ |

额度闸门在线零成本实证（可选）：控制台把 `BANANA_QUOTA_DAILY_GLOBAL` 临时改 0 → 护照页点一次香蕉 → 应立刻"今日额度已用完"且无供应商调用 → 改回 300。

## ② 每日一看收敛

| 要求 | 证据 | 状态 |
|---|---|---|
| 先改数据库读策略 | `20261119120000_daily_learning_midnight_visibility.sql` 已在 SQL Editor 执行；PGlite 三案（午夜前隐身/到点可读/岛主预览）随 `test:daily-learning` 常跑 | ✅ |
| 首页/合集/共享链接统一 `?entry=` | `learningEntryHref` 单点收敛；构建 114/114 页通过 | ✅ |
| 历史 `/learning/<id>/` 无正文兼容壳 | 线上实测：已到期旧链接=200 兼容壳无正文；旧正文指纹在 996 个产物文件（含 RSC 负载）0 残留 | ✅ |
| 未来稿午夜前不可读 | `npm run verify:midnight` 退出 0：anon 未来稿行数=0；未来稿旧链接=404（cleveland-150088 实测） | ✅ |
| 午夜后可读、无需构建 | 策略即门禁（`display_date ≤ 当地今天`）；今日稿 `smk-kms553` 匿名可读实测通过；11-20 稿的跨越复验已挂今晚 00:06 自动执行 | ✅（自动复验兜底） |
| 下架后缓存不回吐正文 | 兼容壳零正文 + 无 Service Worker + 合集不 prefetch + RSC 负载零残留（上项扫描）；`?entry=` 每次挂载实时拉取 | ✅（浏览器人工点验见 MIDNIGHT-VERIFICATION.md 步骤4，可选） |
| 实际旧链接清单验收 | `npm run verify:learning-compat`：线上发布表 47 条全部有壳 | ✅ |

## ③ 两个局部问题

| 要求 | 证据 | 状态 |
|---|---|---|
| 审核页与岛主提醒共用候选池读取、无构建快照 | 共用 `research-pool-data.ts`；review 导出 HTML 0 候选烘入；在线 `latest.json` HTTP 200、`research_date=2026-11-19`（机器人当日写入即生效） | ✅ |
| 候选数据更新无需部署 | 上项在线证据：运行时拉取 `latest.json`（`cache:"no-store"`），不经构建 | ✅ |
| 护照先记录、缩略图按需、原图海报延迟 | 列表先渲染占位、IntersectionObserver 到位才读 `thumbnailBlob`；canvas 渲染器+字体动态导入（页面 chunk 40KB vs 渲染器 80KB 分离） | ✅ |
| 一张坏图不阻塞其余 | `test:passport-view` 3 案：坏图卡片独立报错可重试，其余记录正常；页面 lint 零告警（`c891c21` 修复 disable 注释规则名） | ✅ |

## 待岛主完成

1. **删除旧 Gemini key**（aistudio.google.com/apikey → Delete）；然后复跑文首失效自证，退出 0 即闭环。GitHub Actions 里 `NEXT_PUBLIC_GEMINI_API_KEY` 若还残留也一并删除。
2. （可选）额度闸门 0 值实证 + 浏览器按 MIDNIGHT-VERIFICATION.md 步骤 3/4 点验午夜可读与下架表现。

今晚 00:06（Asia/Pontianak）已排自动复验：cleveland-150088 应转为匿名可读 + 复测 key 撤销状态。
