# 🏝️ Welcome to Zaizai Isle

<p align="center">
  <img src="public/Zaizai-Isle_Shoebill.png" width="100%" alt="Zaizai Isle - AI Product Designer" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Role-AI%20Product%20Designer-blueviolet?style=flat-square" />
  <img src="https://img.shields.io/badge/Status-Building%20&%20Thinking-success?style=flat-square" />
  <img src="https://img.shields.io/badge/Vibe-Minimalist%20&%20Zen-lightgrey?style=flat-square" />
</p>

[✨ Visit the Isle / 访问小岛](https://zaizai-isle.github.io/zaizai-isle/)

## About · 关于

**Zaizai Isle** 是一个以 *Vibe Coding* 方式构建的轻量级个人网站与实验空间。

它不是：
- 传统意义上的简历站  
- 单纯的作品展示页  

它更像是：
- 一个持续生长的个人数字空间  
- 用来承载想法、工具与实验的地方  
- AI 辅助下进行产品设计与交付的真实案例  

整个站点采用渐进式构建方式。  
每一次更新更关注判断力、可用性与整体体验，而不是功能数量。

有些模块已经稳定，  
有些仍在演进中。  
它们存在的原因很简单：在当下，它们值得被做出来。

如果你在这里获得了一点启发，  
或发现了一个不经意的小惊喜，  
那这个网站就已经完成了它的使命。

**再做一点，再想一点，  
惊喜总会在不经意间发生。**

---

<details>
<summary><strong>English Version</strong></summary>

<br />

**Zaizai Isle** is a lightweight personal website built as a real-world case of *Vibe Coding*.

It is not:
- a traditional resume site  
- a static portfolio showcase  
- a technical demo for its own sake  

Instead, it is:
- a small, evolving personal space on the web  
- a place to experiment with ideas, tools, and interactions  
- a practical demonstration of AI-assisted product design and delivery  

The site is built incrementally.  
Each update prioritizes judgment, usability, and overall experience — not feature count.

Some parts are refined.  
Some are still evolving.  
Everything exists because it felt worth building at that moment.

If something here turns out to be useful,  
or unexpectedly interesting,  
then the site is doing what it’s meant to do.

**Build more, think more, find the spark.**

</details>

---

> ⚠️ **Copyright Notice / 版权声明**
>
> 本项目仅用于个人展示。
>
> This project is for personal showcase only. All code and design rights are reserved.

## Visual Regression

- Update baseline: `npm run vr:core-build:update`
- Verify screenshots: `npm run vr:core-build`

Default URL is `http://127.0.0.1:3000/zaizai-isle/`.  
Override with `VR_BASE_URL`, for example:  
`VR_BASE_URL=http://127.0.0.1:3000/zaizai-isle/ npm run vr:core-build`

## Weather Proxy (Optional)

This project currently uses static export (`output: export`), so built-in Next.js `API Route` is not available in production export mode.

If you have your own proxy endpoint, set:

`NEXT_PUBLIC_WEATHER_PROXY_URL=https://your-domain.com/weather`

The frontend will call this URL with query params:

- `provider=open-meteo|qweather`
- `lang=zh|en`

The endpoint should return normalized `WeatherData` JSON.
