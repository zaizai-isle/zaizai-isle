# 受限图片处置清单（待岛主逐项确认）

> 2026-11-06 · 依据 CODE-REVIEW-2026-11-06.md B2 · `public/learning/assets/` 共 52 文件，git 跟踪 31 个随 GitHub Pages 公开
> 决策方式：每项勾选 删 / 留 / 换源。默认建议按风险分级。

## A 级 · 高权利风险（建议删除，均 git 跟踪、随 Pages 公开）

| # | 文件 | 来源 | 风险 | 建议 |
| --- | --- | --- | --- | --- |
| A1 | `Nord Express PV 1927.avif` | moma.org（研究级） | 文件名含 PV 水印版标记 | 删 |
| A2 | `截屏2026-10-26 09.44.46.png` | moma.org 页面截图 | 截图+文件名泄露本机截图时刻 | 删 |
| A3 | `WagtailSource-Railway-map…webp` | londonmuseum.org.uk | 博物馆官网图，非开放下载通道 | 删 |
| A4 | `macintosh-system-1-desktop.png` | cdn.shopify.com | 第三方 CDN 上的 Apple 系统截图 | 删 |
| A5 | `500004342-05-01.jpg` | computerhistory.org | CHM 官网图，默认非开放授权 | 删 |
| A6 | `rumsey-14080-058-main.jpg` | media.davidrumsey.com | Rumsey 馆藏研究用途许可 | 删或核实许可 |
| A7 | `smk-kks1974-113-main.jpg` | iip-thumb.smk.dk | 丹麦国家美术馆 IIIF 缩略图，权利未核实 | 核实或删 |

## B 级 · 孤儿文件（git 跟踪但不在 manifest，来源不可追溯）

| # | 文件 | 疑似来源 | 建议 |
| --- | --- | --- | --- |
| B1 | `102638251.01.02-scaled-760x0-c-default.jpg` | 商业 CDN（WordPress 缩放后缀） | 删或补 provenance |
| B2 | `MacintoshGroup-scaled-760x0-c-default.jpg` | 疑似 Apple newsroom | 删或补 provenance |
| B3 | `Screenshot-2023-11-15-104902-760x0-c-default.jpg` | 不明截图 | 删 |
| B4 | `Northwest_portion_of_La_Grande_Jatte.jpg` | 疑似 Art Institute 官网 | 删（已有 artic 开放版替代） |
| B5/B6 | `Radio Phonograph (model SK 4:10)-1/2.jpg` | 疑似 MoMA 官网 | 删（已有 braun-sk4 维基版替代） |
| B7 | `Strawberry Thief-2.jpg` | 不明（Morris & Co. 相关） | 删或补 provenance |
| B8 | `met-36491-comparison.jpg` | Met（可能开放但未入 manifest） | 补入 manifest 或删 |
| B9 | `Carlton_Bookcase…png` | manifest 路径与实际文件名不一致 | 修 manifest |

## C 级 · 低风险（保留）

- `upload/thumb.wikimedia.org` 来源全部（PD/CC，含 met-*-owner、vangogh、hiroshige、migrant mother、wassily 等）
- `openaccess-cdn.clevelandart.org`、`images.metmuseum.org`、`artic.edu`、`ids.si.edu`（官方开放访问通道）

## 本地未跟踪文件（不涉公开，仅整理建议）

21 个本地文件（含 62MB 的 `CMA_1983.88_full.tif`、多张 3-4MB Met 原图）不进 git 不公开，风险为零；建议移入 `.codex-output/` 或专用研究目录，避免误提交。

## 岛主决定

- A 级：＿＿＿
- B 级：＿＿＿
- 决定后执行：`git rm` 选中文件 → 修 manifest → 下次部署生效（git 历史旧副本暂不处理，Pages 缓存随部署失效）

## 岛主决定（2026-11-06）

**标记来源，不清理。** manifest 已全量标注 `rights_status` + `rights_note`；所有文件保留原位。
- A 级 7 项 → `rights_status: risk` + 来源与版权状态说明
- C 级开放来源 → `open` / `open-commons`
- B 级孤儿（不在 manifest）：保留，见上表；后续需要时补 provenance
- 新规则：今后入库必须带 `rights_status` 字段
