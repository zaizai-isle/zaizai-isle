# 每日一看｜Agent 草稿与审核（实施说明）

## 当前状态

- 本分支新增草稿生成脚本、私有草稿表迁移、岛主审核页面、自动生成工作流。
- 采集成功仍待验证。仓库目前未发现 `data/learning/research/latest.json`。
- 审核页面与生成脚本未执行端到端验证。
- 已在现有 Supabase 项目应用草稿表和 RLS，并验证启用状态。
- 本分支不变更已发布内容。

## 使用方式

1. 合并本分支后，部署站点。
2. 在 GitHub Actions 的 `Daily Learning Research Collection` 手动执行一次，并检查 `latest.json`。
3. 在仓库 Secrets 配置 `GEMINI_API_KEY`、`NEXT_PUBLIC_SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`。
4. 通过 `Daily Learning Agent Drafts` 工作流执行草稿生成。采集任务成功后，也会自动触发。
5. 岛主访问 `/learning/review/`，使用现有岛主账户登录。
6. 浏览草稿、来源和图片，选择批准、退回或放弃。

## 安全边界

- 未配置必要密钥时，草稿生成工作流跳过。
- Agent 生成文章时，史实与图片权利默认未审核。
- 仅岛主账户可读取和修改草稿。
- 只有史实与图片权利均确认后，才能批准指定版本。
- 批准后的版本不可变更。修改需新建版本。
- **批准不等于发布**。本分支未实现正式发布操作。
- 不要将 service_role 密钥放入 `NEXT_PUBLIC_*` 环境变量或浏览器代码。

## 数据流

```text
馆藏资料 JSON → Agent 生成结构化草稿 → Supabase 私有草稿表
→ /learning/review/ → 用户审核 → approved（未发布）
```

## 当前待验证事项

- 日采集器的 API 兼容性、工作流触发及提交权限。
- `GEMINI_API_KEY` 的模型访问权限与输出结构。
- GitHub Actions 的 Supabase Secrets 是否配置。
- 本地 lint/build、站点身份验证与移动端样式。
- 通过审核后如何安全地发布已批准版本。
