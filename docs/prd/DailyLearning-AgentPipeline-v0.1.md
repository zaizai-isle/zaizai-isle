# 每日一看｜Agent 内容生产与审核流程 v0.1

**状态：开发分支已实现。首次自动草稿生成、页面验收与正式合并待完成。**

## 1. 执行边界

- Agent 自主收集候选作品，生成文章草稿，存入私有数据库。
- Agent 不得自动批准内容。
- 用户核实图片许可与历史来源后，可以批准指定版本。
- 批准后的版本不可直接修改。
- **批准不等于发布**。正式网站内容仍由独立发布流程管理。
- 不覆盖现有 `learning-content.ts`、历史反馈或已发布日期。

## 2. 流程

```text
GitHub Actions（每日 08:00 Asia/Tokyo）
  -> 馆藏 API 元数据
  -> data/learning/research/latest.json
  -> GitHub OIDC 令牌
  -> Supabase Edge Function: daily-learning-auto
  -> Gemini 多模态文章草稿
  -> Supabase 私有表 daily_learning_article_drafts
  -> 岛主审核 /learning/review
  -> 已批准版本（未发布）
```

- Agent 使用馆藏缩略图与元数据生成正文。
- 图片不能访问时，Agent 只能根据元数据写草稿，必须保留待核实提示。
- 每条候选作品最多自动生成一份初稿。重复采集不会覆盖草稿。
- 单次采集最多五件候选作品。
- 已批准内容必须保留独立版本。

## 3. 身份验证

| 路径 | 验证方式 | 数据权限 |
|---|---|---|
| GitHub 定时任务 -> Edge Function | GitHub OIDC JWT；核验固定仓库、main 分支、工作流路径、事件类型和 audience | 仅在后端写草稿 |
| 岛主 -> 草稿生成函数 | Supabase 用户 JWT + island_owner_accounts | 仅岛主生成 |
| 岛主 -> 审核页面 | Supabase 用户身份 + RLS | 仅岛主读取和审核 |
| 公共站点 -> 正式文章 | 现有静态内容 | 不读取私有草稿 |

数据库管理员密钥不得配置在 GitHub 仓库、浏览器或公开文件中。

## 4. 模型配置

需要在 Supabase 项目 **Edge Functions -> Secrets** 中配置：

- `GEMINI_API_KEY`：服务端模型密钥。**必填**。
- `GEMINI_MODEL`：可选，默认使用 `gemini-3.8-flash`。

不得在聊天、GitHub 仓库文件或 Next.js `NEXT_PUBLIC_` 变量中填写私有密钥。
尚未验证当前 Supabase 项目是否已配置 `GEMINI_API_KEY`。

## 5. 审核页面

部署后的路径：`/zaizai-isle/learning/review/`。

审核操作：

1. 使用岛主账户登录。
2. 查看最新候选作品或导入一条标准候选 JSON。
3. 点击「生成草稿」或等待定时生成。
4. 阅读文章、原图、出处及待核实提示。
5. 核实历史资料和图片许可。
6. 选择「批准当前版本」「退回修改」或「放弃选题」。

**禁止把未经审核的候选数据直接加入公开站点。**

## 6. 已完成的验证

- 2026-10-19：GitHub Actions 工作流运行成功；实际获得3件候选作品。
- 五个数据源均已尝试，运行结果 `warnings=[]`。
- 公开研究目录生成 `latest.json`、`index.json` 与日期归档。
- Supabase 草稿表和3条RLS策略已部署。
- Supabase 两个生成函数已部署，分别处理岛主手动调用与 GitHub OIDC 自动调用。

## 7. 尚未验证

- 模型密钥是否配置。
- 首次真实 Gemini 文章生成是否成功。
- GitHub OIDC 自动调用与私有入库的端到端测试。
- 审核页面的实际登录与浏览器交互。
- Next.js 完整站点构建。独立类型检查另见 GitHub CI。

正式合并前应完成上述验收。