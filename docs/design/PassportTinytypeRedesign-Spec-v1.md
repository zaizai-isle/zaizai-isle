# 人生护照 · Tinytype 手帐语言改版设计规范

> 状态：**已作废（Superseded）**· 本版误将 Tinytype 的 App 整体 UI 风格作为参考对象；作者实际想要的是其"卡片设计模板系统"，见取代版本 [PassportCardTemplates-Spec-v2.md](PassportCardTemplates-Spec-v2.md)
>
> 版本：v1.0 · 2026-11-04
>
> 参考来源：Tinytype iOS 应用公开资源包的设计语言分析（解包资源仅作风格研究，**不提取、不复用任何其字体与插画文件**）
>
> 适用范围：`/achievement`、`/achievement/passport` 及护照导出海报
>
> 上位约束：[docs/prd/PerformanceContract.md](../prd/PerformanceContract.md)

---

## 1. 改版目标

把人生护照从"墨绿手帐"语言升级为 Tinytype 式"文具印刷手帐"语言：**米白纸 + 墨蓝细线 + 点阵网格 + 便签块 + 小写等宽标签 + 手绘涂鸦**。数据层、路由、交互逻辑全部保持不变，只升级皮肤层与结构外壳。

## 2. 设计 DNA（从参考资源反推）

| # | 规则 | 参考证据 | Web 实现方式 |
|---|---|---|---|
| D1 | 暖米白纸底，几乎无渐变 | `page_background.webp` 纯色底 | `background-color` |
| D2 | bullet-journal 圆点网格铺满内容区 | Notes 页点阵 | `radial-gradient` 平铺，零图片 |
| D3 | 墨蓝灰细实线外框 + 虚线行分隔 | `calendar_background.webp` 表格 | `border` + `repeating-linear-gradient` |
| D4 | 浅蓝便签块做强调标签 | 日历页"月"标签块 | 纯色 div |
| D5 | 小写等宽英文标签（`month /`、`tinytype`） | 页眉页脚 | `font-mono` + `lowercase` + 字距 |
| D6 | 手写中文为标题与正文主体 | 小赖字体/娃娃体（版权资源） | 沿用现有三款手写体，见 §4 |
| D7 | 手绘涂鸦点缀（桂冠、麦穗、吉祥物、散落字母 logo） | stage_share 桂冠、tinytype logo | 原创 SVG，见 §5 |
| D8 | 页面即实体文具：页眉大标题、标签页、格线区、页脚签名 | 整页构图 | 组件结构，见 §6 |

## 3. 色彩令牌

替换 `achievement.css` 中现有墨绿系令牌。**类名全部保留，只改值**，避免 JSX 大面积重写。

```css
/* 新令牌（挂在 .achievement-paper 上） */
--tt-paper:        #FBF6E7;  /* 米白纸底（主背景） */
--tt-paper-deep:   #F3EAD3;  /* 纸背/卡片底 */
--tt-kraft:        #E9CFA8;  /* 牛皮纸（强调底、日历表头） */
--tt-ink:          #33414F;  /* 墨蓝灰（线条/正文，替代 #263b35） */
--tt-ink-strong:   #26313D;  /* 深墨（大标题） */
--tt-ink-muted:    #77808C;  /* 弱化文字（替代 #686d68） */
--tt-sticky:       #D9E6EE;  /* 便签浅蓝（强调块、选中底） */
--tt-highlight:    #F0DC7E;  /* 荧光笔黄（替代 #e2d849） */
--tt-danger:       #B5544B;  /* 删除/警示（替代 #a02f28，降饱和更印刷感） */
--tt-accent:       #4A6B8A;  /* 交互强调（hover/focus，替代 #526b45） */
```

旧→新映射（保持调用点不变）：

| 旧值（出现处） | 新值 |
|---|---|
| `#263b35` 墨绿正文 | `var(--tt-ink)` |
| `#202624` 深墨 | `var(--tt-ink-strong)` |
| `#526b45` 强调绿 | `var(--tt-accent)` |
| `#686d68` 弱化 | `var(--tt-ink-muted)` |
| `#ede9dd` 纸底 | `var(--tt-paper)` |
| `#e2d849` 荧光条 | `var(--tt-highlight)` |
| `#a02f28` 危险红 | `var(--tt-danger)` |

## 4. 字体规范

**不新增字体文件。** Tinytype 使用的 `XiaoLaiZiTiPSC.ttf`（25MB）、`DanMingA.woff`（15MB）为受版权保护的应用资源，仅可作风格参考，禁止引入项目。

| 用途 | 字体 | 说明 |
|---|---|---|
| 大标题 / 区块标题 | 现有 `--font-you-ran-xiao-kai` | 保持手写感主体 |
| 正文 / 输入 | 现有 `--font-xin-ye-nian` | 保持 |
| 区块标题备选 | 现有 `--font-hong-lei-xing-shu` | 保持 |
| 小写英文标签（新） | Tailwind `font-mono` + `lowercase tracking-[0.18em]` | 复刻 `month /` 标签感，零新增资源 |

后续若追求更接近的小赖风格，可另行立项引入 OFL 开源的 **小赖字体（Xiaolai）** 或 **霞鹜文楷**，并必须按性能契约做 `pyftsubset` 子集化后放路由级加载——本改版不包含此项。

## 5. 原创 SVG 资源清单

全部由本项目原创绘制，输出到 `src/assets/achievement/`，统一规格：`stroke="#33414F"`、`stroke-width 1.5~2`、`stroke-linecap="round"`、路径带轻微抖动模拟手绘、`fill="none"`。

| 文件 | 内容 | 使用位置 |
|---|---|---|
| `tt-laurel-left.svg` / `tt-laurel-right.svg` | 手绘麦穗/桂冠枝，约 64×96 | 护照主页标题两侧、删除确认弹窗标题 |
| `tt-logo-scatter.svg` | 散落排布的 "zaizai" 手写字母组合 logo | 护照主页页脚（对应 tinytype 页脚 logo） |
| `tt-tape.svg` | 半透明墨蓝和纸胶带，两端锯齿 | 选项卡/卡片选中态（替代现 `bg-stick-selected.svg` 的用法） |
| `tt-sun-doodle.svg` | 简笔太阳涂鸦 | 空状态、成功态点缀 |
| `tt-sparkle-doodle.svg` | 四角星涂鸦组 | 标题旁、海报角落 |
| `tt-arrow-doodle.svg` | 手绘弯箭头 | 引导文案指向按钮 |

## 6. 核心组件规格

### 6.1 点阵纸面 `.tt-page`
护照主页与创建页主区背景。

```css
.tt-page {
  background-color: var(--tt-paper);
  background-image: radial-gradient(circle, rgba(51,65,79,.16) 1.1px, transparent 1.2px);
  background-size: 26px 26px;
}
```

### 6.2 手帐页眉 `.tt-header`
- 左侧：大号手写标题（`text-4xl/5xl`，`--tt-ink-strong`）
- 右侧：小写等宽标签 `passport /`、`create /`（`font-mono text-[10px] tracking-[0.18em]`）
- 标题下方一条**点阵行**（`radial-gradient` 平铺，高 4px），复刻 Notes 页页眉
- 移除现有深色顶栏（`bg-[#202624]`），改为同纸底色 + 细墨线底边

### 6.3 手绘框 `.tt-frame`
卡片、日历弹层、弹窗外框。

```css
.tt-frame {
  border: 1.5px solid var(--tt-ink);
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px; /* 手绘抖动圆角 */
  background: var(--tt-paper);
}
```

### 6.4 虚线分隔 `.tt-dash`
```css
.tt-dash {
  height: 2px;
  background-image: repeating-linear-gradient(90deg, var(--tt-ink) 0 5px, transparent 5px 11px);
  opacity: .55;
}
```

### 6.5 便签块 `.tt-sticky`
护照号、印章计数等强调信息：浅蓝底 `--tt-sticky` + 右侧细墨线 + 手写数字，对应日历页"月"标签块。

### 6.6 贴纸选项卡（创建页）
- 默认：`.tt-frame` + 纸底
- hover：上浮 1px + 边框转 `--tt-accent`
- 选中：右上角斜贴 `tt-tape.svg` + 底色转 `--tt-sticky`

### 6.7 日历弹层（Tinytype 表格式）
按 `calendar_background.webp` 重构视觉：细墨线外框 → 表头行（周一~周日，中英双语小字）→ 实线行分隔 + 行内虚线书写位 → 底部浅蓝"月"便签块显示"这个月你一共记录：N 次"。选中日为实心墨蓝圆点反白。

## 7. 导出海报同步规格（`passport-renderer.ts`）

| 项 | 现状 | 改版 |
|---|---|---|
| 底色 | `#ffffff` + 随机墨点 | `#FBF6E7` + 规则点阵（26px 网格，`rgba(51,65,79,.16)`，Canvas 双层循环绘制） |
| 线色 | `POSTER_COLORS.moss #595959` | `#33414F` |
| 分隔 | 实线 | `ctx.setLineDash([5, 6])` 虚线 |
| 外框 | 无 | 距边 48px 墨蓝细线圆角矩形（`roundRect`） |
| 页脚 | 文字 | 文字 + `tt-logo-scatter` 矢量路径重绘（Canvas 不引 SVG 文件，路径内联） |
| 印章 | 墨绿描边 | 同结构，颜色改墨蓝；`classic` 圆章保留弧排文字 |

渲染前必须 `await document.fonts.load()` 等待手写字体就绪，防止导出回退字体。

## 8. 逐文件改动映射（实施时）

| 文件 | 改动类型 | 内容 |
|---|---|---|
| `src/app/achievement/achievement.css` | 令牌+样式重写 | §3 令牌、§6 新类、旧类换值保类名 |
| `src/app/achievement/passport/page.tsx` | 结构调整 | §6.2 页眉、§6.3/6.5 卡片与便签、页脚 logo |
| `src/app/achievement/page.tsx` | 结构调整 | §6.2 页眉 `create /` |
| `src/app/achievement/_components/PassportSteps.tsx` | 结构调整 | §6.6 贴纸选项卡、§6.7 日历 |
| `src/app/achievement/passport-renderer.ts` | 视觉同步 | §7 |
| `src/assets/achievement/*.svg` | 新增 | §5 六个原创文件 |
| 数据层 / 路由 / `layout.tsx` | **不动** | — |

## 9. 性能契约合规检查

- [x] 点阵、虚线、手绘框全部 CSS/Canvas 实现，零新增图片请求（SVG 合计 < 12KB）
- [x] 不新增字体文件；沿用现有路由级字体加载
- [x] 样式仍留在 `achievement.css` 路由级入口，不进全局
- [x] 无新依赖、无新 Client Provider
- [x] 动效仅 hover 位移 + 透明度，且尊重 `prefers-reduced-motion`

## 10. 实施阶段与验收

| 阶段 | 内容 | 验收 |
|---|---|---|
| P1 | CSS 令牌 + 点阵/虚线/框（不动 JSX） | `npm run build` 通过；作者浏览器目测"味道" |
| P2 | 生成 6 个原创 SVG + 护照主页/创建页结构 | lint + build；两路由目测 |
| P3 | 日历弹层 + 导出海报同步 | 导出 PNG 目测字体与线型 |
| P4 | 细节回调（间距、hover、空状态） | 作者手动浏览器验收（按 AGENTS.md 约定） |

## 11. 风险与边界

1. **版权红线**：参考包内字体、插画、webp 一律不入库；`.tmp-design-ref/` 为临时研究目录，实施前删除。
2. **手写体覆盖**：现有字体若缺某生僻字回退到 Kaiti，风格可接受，不额外处理。
3. **深色顶栏移除**：`LOCAL/CLOUD PASSPORT` 状态标签迁移为页眉右侧小写等宽标签，功能不减。
4. **海报回归**：`passport-renderer.ts` 改动会影响历史印章的重新导出样式，属预期（重新导出即新语言）。
