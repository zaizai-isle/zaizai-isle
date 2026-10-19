# 每日一看｜馆藏资料采集与程序读取 v0.2

## 1. 运行规则

- 定时任务：`.github/workflows/daily-learning-research.yml`。
- 计划频率：每日一次，08:00 Asia/Tokyo。GitHub Actions 可能延迟执行。
- 手动运行：GitHub → Actions → Daily Learning Research Collection → Run workflow。
- 采集脚本：`scripts/collect_learning_research.py`。
- 单次最多收集 5 条候选作品。每个数据源最多提供 1 条。
- 采集任务保存馆藏元数据和图片 URL。任务不下载图片，不撰写正文，不批准发布。
- 已有当天归档时，重复运行会直接退出。需要重新采集时，先制定保留历史的重试方案。

## 2. 数据源

| ID | 数据源 | 采集条件 |
|---|---|---|
| `met` | The Met Collection API | `isPublicDomain=true`，包含主图 |
| `artic` | Art Institute of Chicago API | `is_public_domain=true`，包含图像 |
| `cleveland` | Cleveland Museum of Art API | `share_license_status=CC0`，包含图像 |
| `smk` | SMK / National Gallery of Denmark API | `public_domain=true`，包含图像 |
| `loc` | Library of Congress API | 包含来源页面和预览图，使用权待确认 |

- 数据源采用每日轮换顺序，避免固定来源始终排在前面。
- 每日轮换 A01–A08 观察主题。
- 采集结果中的 A、B 编码只表示本次检索条件，不代表已完成内容分类。
- 单个 API 失败时，任务记录 `warnings`。其他数据源可以继续采集。
- 所有图片均保留 `image_permission_verified=false`，直到编辑完成逐项核实。

## 3. 文件结构

```text
data/learning/research/
├── README.md                # 本说明
├── latest.json              # 最近一次成功采集
├── index.json               # 来源 ID 去重及归档索引
└── runs/
    └── YYYY-MM-DD.json      # 每日归档（Asia/Tokyo）
```

- `latest.json` 和 `runs/` 文件只在首次成功采集后产生。
- `index.json` 中的 `seen_ids` 用于避免重复。
- `runs` 索引最多记录最近 90 次运行；历史归档文件不会因这个上限而自动删除。
- 本地程序须先 `git pull`。未同步时，本地数据不会自动更新。

## 4. JSON 格式

主要字段：

| 字段 | 类型 | 用途 |
|---|---|---|
| `schema_version` | number | 数据结构版本。当前为 1 |
| `status` | string | 固定为 `research_candidates_only` |
| `research_date` | string | 当地采集日期 |
| `theme.observation_code` | string | 本次查询的 A 主题 |
| `theme.history_node` | string | 本次查询的 B 节点 |
| `theme.classification_verified` | boolean | 固定为 false |
| `items` | array | 候选作品数组 |
| `items[].source_id` | string | 数据源前缀 + 来源作品 ID |
| `items[].title` | string | 馆藏作品名称 |
| `items[].creator` | string | 创作者原始信息 |
| `items[].date` | string | 作品年代原始信息 |
| `items[].medium` | string | 媒介原始信息 |
| `items[].source_url` | string | 馆藏原始页面 |
| `items[].catalog_api_url` | string | 馆藏 API |
| `items[].image_url` | string | 图像 URL。未下载 |
| `items[].rights.catalog_public_domain` | boolean / null | 来源字段或筛选值 |
| `items[].rights.image_permission_verified` | boolean | 发布图片是否已人工核实；采集器固定 false |
| `items[].review_status` | string | 固定为 `needs_editorial_review` |
| `warnings` | string[] | 单数据源失败或格式问题 |

馆藏返回的作者与媒介可能包含复杂文本。编辑必须重新核实后才可写入正式内容。

## 5. 程序读取方式

### 本地 CLI

```bash
git pull
node scripts/read-learning-research.mjs
node scripts/read-learning-research.mjs --json
```

首次任务尚未运行成功时，`latest.json` 不存在。此时读取脚本会返回非零退出码。

### Node.js 代码

```js
import { readFile } from "node:fs/promises";

const file = "data/learning/research/latest.json";
const research = JSON.parse(await readFile(file, "utf8"));

if (research.schema_version !== 1 || research.status !== "research_candidates_only") {
  throw new Error("Unexpected research data");
}

const pending = research.items.filter(
  (item) => item.review_status === "needs_editorial_review"
);
console.log(pending);
```

### Next.js 静态站点

项目目前使用 `output: "export"`。

- `data/learning/research/` 不在 `public/` 下，浏览器不能直接请求。
- 服务端构建脚本可以读取候选 JSON。
- 页面应当只读取**经过用户批准的正式内容数据**。
- 不允许直接将 `latest.json` 转换成公开内容。
- 已发布内容的现有来源为 `src/app/learning/learning-content.ts`。采集器不修改该文件。

## 6. 模式 A 发布边界

```text
馆藏 API
  → 候选资料 JSON
  → Agent 研究与生成草稿
  → 事实、图片许可、文案审核
  → 用户批准指定内容版本
  → 正式内容数据
  → 网站发布
```

本任务只实现前两个环节。

- 不自动生成正式文章。
- 不自动修改已发布文章。
- 不自动公开私人反馈。
- 不自动发布未经用户批准的内容。
- 仓库为公开仓库。不得提交身份信息、密钥、私人反馈或非公开资料。

## 7. 尚未完成的验证

- 当前未验证新增 API 的完整在线采集结果。
- 当前未验证首次 GitHub Actions 定时任务成功执行。
- 部分馆藏字段可能调整。运行失败信息记录在 GitHub Actions 日志和结果中的 `warnings`。
- 将采集结果交给内容生产 Agent 的自动编排尚未实现。
