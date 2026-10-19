# 每日一看｜采集、生成、审核操作说明 v0.1

## 当前实现

1. `Daily Learning Research Collection` 每日计划采集候选馆藏。
2. 采集成功后写入 `data/learning/research/latest.json`。
3. `Daily Learning Agent Drafts` 在采集工作流成功后触发。
4. Agent 为最多3件未处理候选作品生成完整草稿。
5. 草稿写入 Supabase 私有表 `daily_learning_article_drafts`。
6. 岛主在 `/learning/review/` 审核草稿。
7. 审核批准保留当前版本。不自动发布。

## 配置

在 GitHub 仓库 Settings → Secrets and variables → Actions 中设置：

- `GEMINI_API_KEY`：调用 Gemini generateContent。
- `NEXT_PUBLIC_SUPABASE_URL`：目标 Supabase 项目 URL。
- `SUPABASE_SERVICE_ROLE_KEY`：仅用于受信任的 GitHub Actions 环境。

注意：

- 不要把密钥写入源代码、日志或 `NEXT_PUBLIC_*` 变量。
- 禁止将 service role 密钥传入前端。
- 现有 `island_owner_accounts` 仅允许已经配置的岛主账户进行审核。

## 验证

1. 打开 `https://github.com/zaizai-isle/zaizai-isle/actions/workflows/daily-learning-research.yml`。
2. 手动运行研究采集。检查日志和 JSON 归档。
3. 若采集完成，检查 `data/learning/research/latest.json` 中的 `items` 与 `warnings`。
4. 执行 `Daily Learning Agent Drafts` 或等待采集完成自动触发。
5. 打开 `/zaizai-isle/learning/review/`。使用岛主账户登录。
6. 检查正文、馆藏页面、图片使用许可和历史资料。
7. 选择批准当前版本、退回修改或放弃选题。

## 发布权限

- `pending_review`：Agent 提交，尚未审核。
- `changes_requested`：岛主要求修订。
- `approved`：已确认图片使用许可和历史资料，并保存内容快照。
- `rejected`：放弃。
- 批准后的草稿禁止覆盖或修改。
- **审核批准不等于发布**。正式发布仍需额外步骤。
- 目前不会自动修改现有 `learning-content.ts`。

## 已知限制

- 截至 2026-10-19，仓库未出现采集 JSON 归档。未验证采集链路。
- 当前无法读取 GitHub Actions 实际运行日志。
- 新增5个 API 的完整采集仍需在线测试。
- Gemini 密钥和服务端 Supabase 密钥是否已配置，尚未确认。
- 只有采集文件、模型服务和 Secret 均可用，Agent 草稿生成才会运行。
- 审核界面功能尚未通过生产构建和浏览器操作验证。
- 退回修改目前记录审核意见。自动根据意见重新生成新版本尚未实现。
