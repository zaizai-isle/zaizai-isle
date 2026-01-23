# 🏝️ Zaizai Isle - 产品说明文档

## 1. 产品简介
**Zaizai Isle** 是一个基于 **Bento Grid** 设计风格的个人数字花园与作品集网站。它不仅仅是一个静态的简历页面，更是一个集成了实时交互、动态数据展示和个性化体验的现代 Web 应用。

核心价值：
- **极简美学**：采用 Bento Grid 栅格布局，信息呈现清晰有序，视觉风格统一。
- **沉浸体验**：动态天气、昼夜更替、流畅的动画交互，营造静谧的浏览氛围。
- **技术展示**：集成 Next.js 16、Server Components、Supabase 实时数据库等前沿技术。

## 2. 核心架构与技术栈

### 2.1 技术栈概览
- **框架核心**: [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/)
- **样式系统**: [Tailwind CSS v4](https://tailwindcss.com/) + CSS Variables
- **动画交互**: [Framer Motion](https://www.framer.com/motion/) (布局动画、悬停效果)
- **图标系统**: [Lucide React](https://lucide.dev/) (SVG 图标库)
- **后端服务**: [Supabase](https://supabase.com/) (数据库、实时订阅、Edge Functions)
- **工具库**: 
  - `html-to-image`: DOM 转图片生成
  - `date-fns`: 日期处理
  - `@next/third-parties`: Google Analytics 集成
- **部署**: GitHub Pages (静态导出) + GitHub Actions CI/CD

### 2.2 目录结构
```bash
src/
├── app/                  # Next.js App Router 路由
│   ├── layout.tsx        # 全局布局 (Context Providers, Analytics)
│   └── page.tsx          # 主页入口 (Bento Grid 容器)
├── components/
│   ├── bento/            # 核心卡片组件 (Weather, Stats, Identity...)
│   ├── BackgroundController.tsx # 背景控制面板
│   └── SharePoster.tsx   # 名片生成组件
├── lib/
│   ├── supabase.ts       # Supabase 客户端配置
│   ├── *-context.tsx     # React Context (Language, Background)
│   └── utils.ts          # 通用工具函数
└── assets/               # 静态资源 (图片, 头像)
```

## 3. 功能模块详细介绍

### 3.1 核心卡片系统 (Bento Cards)

#### 🪪 Identity Card (身份卡片)
- **功能**: 展示头像、姓名、职位及动态个性签名。
- **交互**: 
  - 集成打字机效果 (Typewriter Effect) 突出展示标语。
  - 支持中英文多语言切换，自动适配字间距（英文模式下更紧凑）。
  - 响应式布局：移动端与桌面端自适应调整。

#### 🌤️ Weather Card (天气卡片)
  *   功能描述: 极度拟真的天气展示组件，不仅提供信息，更提供“氛围感”。
*   核心特性:
    *   实时数据: 集成 Open-Meteo API，精准显示温度、天气状况、湿度、风速、体感温度。
    *   动态视觉:
        *   背景: 随“天气状况”（晴/雨/雪/云）和“昼夜状态”自动切换的 CSS 极光渐变。
        *   图标: 定制设计的 3D 无描边立体渐变图标。夜间模式特别适配对应天气图标。
    *   微交互:
        *   主图标悬停支持 Shake (抖动) 动画。
        *   点击地址文本触发数据刷新，伴随旋转加载动效。
    *   视觉对齐: 严格的排版规范（底部对齐、左侧垂直对齐、统一字号与透明度），确保信息高可读性。

#### 📊 Stats Card (数据卡片)
- **功能**: 展示网站的核心指标及隐藏的“名片下载”功能。
- **数据源**:
  - **GitHub Stars**: 实时获取。
  - **Site Visits**: Google Analytics 或 Supabase 计数。
  - **Downloads**: 记录名片下载次数，存储于 Supabase。
- **交互彩蛋**: 
  - 悬停提示 "点击下载名片"。
  - 点击触发 `html-to-image` 将隐藏的 `<SharePoster />` 组件渲染为高清 PNG 图片并自动下载。

 

#### 💬 Social Card (社交联络卡片)
- **功能**: 集成多渠道联系方式与社交互动入口。
- **内容**: 
  - **WeChat**: 点击展示个人微信二维码模态框。
  - **Email**: 点击复制邮箱地址并显示提示气泡。
  - **GitHub**: 跳转至 GitHub 个人主页。
  - **Like**: 点赞互动，触发爱心飞舞动效 (Flying Hearts Animation)。
- **交互**: 
  - 按钮悬停时的缩放与背景光效。
  - 点赞后的持久化状态 (LocalStorage) 与防止重复点击逻辑。

#### 🛠️ Tools Card (工具栈卡片)
*   功能描述: 提供常用 AI 工具链接与实用小工具。
*   核心特性:
    *   **AI 工具箱**: 聚合常用 AI 工具链接 (ChatGPT, Claude, Midjourney 等)，提供一键直达入口。
    *   **实用小工具**: 内置浏览器端图片压缩工具 (Image Compressor)，支持上传图片进行压缩并下载，演示了前端文件处理能力。
*   交互: 
    *   工具图标悬停会有背景色与光效变化。

#### 📂 Works Card (精选作品卡片)
- **功能**: 展示个人精选项目案例 (Featured Projects)。
- **内容**: 目前收录了 "Everything is Banana", "Smart Exam Platform", "AI Trainer Assistant" 等项目。
- **交互**: 
  - **预览画廊**: 项目封面图以网格形式展示，悬停时轻微放大。
  - **详情弹窗**: 点击项目封面触发模态框 (Modal)，展示高清大图与访问链接，提供沉浸式的作品浏览体验。

### 3.2 全局功能系统

#### 🎨 沉浸式背景系统 (Background System)
- **三种模式**:
  1. **Default**: 动态流体渐变背景。
  2. **Solid Color**: 自定义纯色背景。
  3. **Image**: 上传/选择自定义图片作为背景。
- **实现**: 使用 React Context (`BackgroundContext`) 管理状态，并通过 `localStorage` + Supabase (可选) 实现用户偏好持久化。
- **控制面板**: 右下角悬浮按钮呼出设置面板。

#### 🌐 多语言支持 (i18n)
- **实现**: 基于 `LanguageContext` 的轻量级前端国际化方案。
- **切换**: 右下角悬浮按钮一键切换中/英 (ZH/EN)。
- **深度适配**: 不仅切换文案，还动态调整排版样式（如 `tracking` 字间距）以适应不同语言的视觉平衡。

#### 🎫 社交名片生成 (Share Poster)
*   功能描述: 将个人主页信息转化为易于社交传播的精美海报。
*   触发入口: 位于 Stats Card，点击下载图标或卡片整体触发。
*   技术实现:
    *   隐式渲染: 预渲染一张 375x667px 的隐藏 DOM 海报。
    *   客户端生成: 使用 `html-to-image` 将 DOM 瞬间转换为高清 PNG 图片并触发下载。
    *   内容整合: 包含头像、Slogan、标签、联系方式及二维码。

## 4. 交互与视觉设计
- **响应式布局**: 
  - 移动端 (Mobile): 单列流式布局，卡片最小高度优化 (min-h-200px)。
  - 桌面端 (Desktop): 3x4 或 4x4 网格布局，利用 `md:col-span-x` 实现跨行跨列。
- **微交互**:
  - 按钮/卡片的 Hover 态缩放与光影效果。
  - 页面加载时的交错淡入动画 (Staggered Fade-in)。

## 5. 部署与运维
- **CI/CD**: 配置 `.github/workflows/deploy.yml`，推送到 `main` 分支自动触发构建。
- **构建流程**: `npm run build` 生成静态文件 (`out/` 目录)。
- **环境配置**: 
  - 生产环境依赖 GitHub Secrets 管理 API Keys (Open-Meteo, Supabase, GA_ID)。
  - 针对 GitHub Pages 的 `basePath` 适配，确保图片与资源路径正确。

## 6. 未来规划
* 开发更多实用小工具
* 引入更多 AI Agent 交互能力（如基于大模型的对话式助手）。
* 增强 CMS 属性，支持更丰富的博客/文章内容展示。