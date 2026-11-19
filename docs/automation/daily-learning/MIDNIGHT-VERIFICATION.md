# 每日一看 · 午夜门禁与兼容入口上线手册（2026-11-19）

> 本手册对应两项有意变更：
> ① 反转 CODE-REVIEW-2026-11-06 R8——公开阅读入口统一回 `/learning?entry=…`，
>    `/learning/<id>/` 降级为纯兼容跳转壳（构建产物只含外壳与兼容映射）；
> ② 新增未来稿门禁——发布行在 Asia/Pontianak 当地午夜前对访客不可读。
> 全程无需本地构建参与门禁；策略生效只取决于迁移是否执行。

## 紧急项

生产库现有定时稿 `daily-learning:cleveland-150088`（display_date=2026-11-20）
在旧策略下匿名已全文可读（`scripts/daily-learning-midnight-smoke.mjs` 实测报告）。
请**尽快**完成下面第 1 步；随后 GitHub Actions 完成一次新构建部署后，
旧深链正文页也同步消失。

## 第 1 步 · 应用公开读策略（Supabase SQL Editor，整段执行）

执行 `supabase/migrations/20261119120000_daily_learning_midnight_visibility.sql`。
效果：anon / 非岛主登录用户只能读 `is_visible 且 display_date ≤ 当地今天` 的行；
岛主（owner 白名单）保留全部行的预览与管理。

## 第 2 步 · 匿名直查核验（本机即可，只读）

```bash
env PATH="$PWD/.conda-env/bin:$PATH" node scripts/daily-learning-midnight-smoke.mjs
```

通过标准：`anon 可见的未来稿行数=0`，且已到期的最新可见行可按 id 匿名读到。
迁移执行后立即复跑，第 1 步的 cleveland 行应从"可见未来稿"中消失。

## 第 3 步 · 定时稿跨午夜实测（无构建参与）

1. 岛主在审核页把某测试稿展示日期设为明天（或 SQL：
   `update public.daily_learning_publications set display_date = ((now() at time zone 'Asia/Pontianak')::date + 1) where id = '<测试行 id>';`）。
2. 午夜前：匿名打开 `https://<站点>/zaizai-isle/learning/?entry=publication-<测试行 id>`
   → 必须显示"今天没有新内容/不可用"空态；再跑第 2 步脚本 → 行数=0。
3. Asia/Pontianak 午夜过后（或岛主把日期改回今天模拟到点）：同一链接无需任何
   构建/部署立即渲染正文；脚本复跑 → 可读验证通过。

## 第 4 步 · 下架后无缓存残留

岛主在审核页对某已到期行点"下架"后，用无痕窗口：
- 打开原兼容链接 `/zaizai-isle/learning/<content_id>/` → 跳转到入口后显示不可用；
- 直接刷新入口链接、以及从其它页面前进/后退回到该入口 → 均重新查询 Supabase，
  不显示正文（站内无 Service Worker；合集卡片 `prefetch=false`；兼容壳本身无正文）。

## 第 5 步 · 构建产物验收

```bash
env PATH="$PWD/.conda-env/bin:$PATH" npm run build
env PATH="$PWD/.conda-env/bin:$PATH" node scripts/verify-learning-compat.mjs
```

通过标准：以发布表实际旧链接清单（当前 48 条）逐条有跳转壳；
`out/` 全部 HTML 中旧正文指纹残留 0 条。
