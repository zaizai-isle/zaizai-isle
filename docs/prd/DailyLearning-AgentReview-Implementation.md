# 每日一看｜Agent 文章生产与人工审核

## 状态

- 采集任务：`.github/workflows/daily-learning-research.yml`。当前仓库没有已确认的采集 JSON。
- Agent 自动草稿：`.github/workflows/daily-learning-draft.yml`。仅在配置完密钥并成功采集后运行。
- 手动草稿：岛主登录 `/learning/review/`，导入候选 JSON 或选择采集记录，点击生成。
- 草稿数据库：`public.daily_learning_article_drafts`。已启用 RLS。
- 生成服务：Supabase Edge Function `daily-learning-generate`。已部署；需要 `GEMINI_API_KEY`。
- 正式网站内容：仍在 `src/app/learning/learning-content.ts`。未接入自动发布。

## 必要配置

### GitHub Actions Secrets

- `GEMINI_API_KEY`：调用 Gemini 生成草稿。
- `SUPABASE_URL`：Supabase 项目 URL。
- `SUPABASE_SERVICE_ROLE_KEY`：仅用于受保护的 GitHub Actions 工作流。
- `LEARNING_OWNER_ID`：与 `island_owner_accounts` 一致的岛主账户 ID。设为 Secret，不提交到仓库。

配置在 GitHub 仓库 → Settings → Secrets and variables → Actions。
四项未全部配置时，定时草稿任务会跳过，不会报错提交不完整内容。

### Supabase Edge Function Secret

- `GEMINI_API_KEY`：供岛主审核页面的按需生成功能调用。
- 不得使用 `NEXT_PUBLIC_*` 环境变量存放密钥。

## 数据流程

```text
博物馆开放 API
   → data/learning/research/latest.json
   → scripts/generate_learning_draft.py
   → Supabase 私有草稿表（pending_review）
   → 岛主审核页面 /learning/review/
   → 事实核实 + 图片许可核实
   → 批准指定版本（approved）
   → 独立人工发布操作（尚未实现）
```

- 单次定时生成最多一篇草稿。
- Agent 只根据馆藏元数据组织初稿。不能把生成内容视为已核实史实。
- 每条草稿记录包括候选来源、生成正文、版本、审核状态、审核意见和审核标记。
- 批准后冻结草稿版本。退回修改需生成新版本。
- 审核页面仅允许岛主访问草稿。RLS 限制其他账户读取。
- 自动运行不修改已发布内容，不更改私人反馈。
- 图片来源链接不表示可直接用于网站。批准前需核实。
- 当前审核页面的批准操作不发布网站内容。

## 验收条件

1. GitHub Actions 成功生成 `data/learning/research/latest.json`。
2. GitHub Secrets 配齐后，定时任务在 Supabase 写入一条 `pending_review` 草稿。
3. 岛主能登录 `/learning/review/`，预览文章、来源和图像。
4. 岛主能退回、放弃或核实资料后批准草稿。
5. 未登录者无法查询草稿。未经批准的文章不出现在正式网站。
6. 以上步骤完成前，不能宣称完整自动化已上线。
