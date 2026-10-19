# 每日一看｜Agent 草稿与审核实现状态

## 1. 当前实现

- 候选资料：`data/learning/research/latest.json`。
- Agent 脚本：`scripts/generate-learning-drafts.py`。
- 研究任务：`.github/workflows/daily-learning-research.yml`。
- 私有草稿表：`public.daily_learning_article_drafts`。
- 岛主审核页：`/learning/review/`。
- 所有新草稿均为 `pending_review`。
- 用户批准时要求勾选图片许可与历史资料核实。
- 批准版本不可修改。正式发布仍需后续独立操作。
- 不修改既有 `learning-content.ts` 或私人反馈数据。

## 2. 首次启用前条件

1. GitHub 仓库 Actions 必须允许工作流运行和 `contents: write`。
2. GitHub Secrets 需要配置：
   - `GEMINI_API_KEY`：Gemini API 密钥。
   - `SUPABASE_URL`：现有 Supabase 项目 URL。
   - `SUPABASE_SERVICE_ROLE_KEY`：仅服务端使用的密钥。
3. 启用后，在 GitHub Actions 手动触发 `Daily Learning Research Collection`。
4. 检查是否生成 `data/learning/research/latest.json`。
5. 检查 Supabase 草稿表是否写入数据。
6. 用已有岛主账户登录 `/learning/review/`。
7. 检查预览与审核操作。

**警告**：不要把密钥填入 `.env` 的 `NEXT_PUBLIC_` 变量或提交到仓库。

## 3. Agent 执行范围

- 读取最多三件新候选作品。
- 用 Gemini 生成中文草稿。
- 记录来源、观察内容与待核实说明。
- 将草稿保存至 Supabase 私有表。
- 如果缺少 API 密钥，跳过文章生成。
- 不批准、不发布、不更改网站现有文章。
- 未完成的图片许可和历史核实需要岛主审核。

## 4. 审核操作

- 「批准当前版本」：只有勾选两项核实后才能执行，保存不可变快照。
- 「退回修改」：必须填写意见。
- 「放弃选题」：保留记录，不加入发布队列。
- 当前「退回修改」只记录意见；自动基于意见生成新版本尚未实现。
- 当前「批准」不触发发布；发布接口尚未实现。

## 5. 已验证与未验证

已验证：
- Supabase 草稿表已建立。
- RLS 已启用。
- 已创建三项岛主授权策略。
- 表内当前零篇草稿。

未验证：
- GitHub Actions 采集运行成功。
- 新增五个来源返回符合预期字段。
- Gemini 模型调用成功。
- 私有草稿首次写入。
- 前端 TypeScript 构建与浏览器交互。

在运行验证通过前，不应将本分支视为可直接投入正式生产的版本。
