# 每日一看：自动收集研究资料

## 运行规则

- GitHub Actions 每日计划运行，计划时间为日本时间 08:00；实际时间可能延迟。
- 支持在 GitHub Actions 页面手动触发。
- 收集数据源：The Met Collection API、Art Institute of Chicago API。
- 仅收集公共馆藏元数据与图像 URL。不下载图像。
- 采集结果是候选资料。不是已审核作品或已批准发布的文章。
- 发布模式 A：只有用户批准指定内容版本后，程序才可发布。

## 数据目录

- `data/learning/research/latest.json`：最近一次成功采集结果。
- `data/learning/research/runs/YYYY-MM-DD.json`：按日本当地日期归档。
- `data/learning/research/index.json`：采集历史与候选去重清单。

每次成功运行最多新增 5 条馆藏候选资料。
系统依次轮换 A01–A08 观察主题。B 节点只用于搜索规划，不代表已经核实作品归属。

## 程序读取

```js
import { readFile } from 'node:fs/promises';
const data = JSON.parse(await readFile('data/learning/research/latest.json', 'utf8'));
console.log(data.items);
```

本地 `git pull` 后可读到新增 JSON。仓库为公开仓库，勿提交私人笔记、反馈和凭据。

项目当前使用 Next.js 静态导出。该目录不在 `public/` 下。
前端无法通过静态 URL 直接访问。需要由构建程序读取、审核后再生成可公开展示的数据。

## 数据审核状态

- `status = research_candidates_only`：只完成资料收集。
- `items[].review_status = needs_editorial_review`：尚未完成内容审核。
- `items[].rights.catalog_public_domain`：馆藏 API 的公共领域标记。
- `items[].rights.image_permission_verified = false`：必须单独核实图片使用范围及来源。

任何内容不得仅凭自动采集结果发布。
