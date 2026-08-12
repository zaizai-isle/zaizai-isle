# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

No changes recorded yet.

## [v1.4.2] - 2026-08-12

### Added
- Expanded Life Passport to twelve themes with a broader set of everyday, relationship, growth, work, travel, and recovery milestones.
- Added three bundled local handwriting fonts for consistent Chinese typography in the interface and exported keepsakes.
- Added a hand-drawn date picker and custom date, location, and photo controls to the memory step.

### Changed
- Refined Life Passport copy, hierarchy, option cards, mobile spacing, reduced-motion behavior, and selected-state tape treatment.
- Redesigned the three stamp styles and aligned their previews with the exported 9:16 poster rendering.
- Simplified achievement data to the fields used by the current Passport flow and updated photo/text poster composition.
- Reduced nonessential Banana upload notifications while preserving image compression and error feedback.

### Technical
- Moved Canvas poster typography to the same local fonts used by the Life Passport interface.
- Suppressed root body hydration warnings caused by browser-injected attributes without changing rendered content.

## [v1.4.1] - 2026-08-10

### Added
- Added `AdaptivePaper` for responsive torn-paper surfaces in Life Passport.
- Added a selected-state tape asset and clearer visual feedback for achievement and stamp choices.
- Added a Supabase Edge Function proxy for Replicate image editing with server-side token handling.

### Changed
- Simplified Life Passport from four steps to three by combining styling, confirmation, and export.
- Preserved uploaded photo aspect ratios in previews and refined the 9:16 keepsake composition and stamp rendering.
- Made Banana prefer the Supabase proxy when Supabase is configured, while preserving Gemini as a fallback provider.
- Expanded README setup instructions for the Banana proxy and Replicate secrets.

### Technical
- Excluded Supabase Edge Function sources from the Next.js TypeScript project boundary.
- Recovered the V1.4 deployment from stale queued run #99 with successful build and Pages deployment run #100.

## [v1.4.0] - 2026-08-07

### Added
- Added a config-driven Built Structures registry with stable, experimental, and archived states.
- Added structure type, status, and bilingual descriptions to Works previews.
- Added a Zaizai Isle ownership strip to Banana with a direct return path to the home island.
- Added Life Passport `v0.1.10` as an experimental island structure with a four-step stamp and keepsake export flow.
- Added Isle Daily `v0.1` with date browsing, bilingual notes, lunar and solar-term context, and four seasonal themes.
- Added a maintained documentation map and an Isle Daily product specification.

### Changed
- Internal structures now open in the current tab while external structures use a new tab.
- Adjusted the Banana header so its navigation remains readable on mobile screens.
- Repaired Core Build visual regression startup and theme readiness checks.
- Updated the product guide, active PRD, version roadmap, release checklist, and module roadmaps for the V1.4.0 baseline.
- Updated the GitHub Pages deployment workflow from Node 20 to Node 25 to match the project environment.

### Technical
- Updated package metadata to `1.4.0`.
- Preserved Next.js static export to `out` and automatic GitHub Pages deployment on pushes to `main`.

## [v1.3.0] - 2026-07-16

### Added
- Added `ReleaseChecklist.md` as the first maintenance-memory artifact.
- Added README notes for weather icon generation and release checklist usage.
- Added source/runtime/archive asset policy to the asset optimization plan.
- Added `VersionUpgradePlan.md` for V1.3 through V2.0 planning.

### Changed
- Updated the Product guide next phase to V1.3 Maintenance Memory.
- Cleaned up mechanical Banana lint warnings without changing the image comparison interaction.

### Technical
- `npm run lint` now completes without warnings.

## [v1.2.9] - 2026-06-04

### Added
- Added WebP runtime variants for high-impact visual assets.
- Added static weather icon loading from `public/weather-icons/`.

### Changed
- Updated project version metadata and active product documentation to V1.2.9.
- Updated image references to prefer WebP assets for static export performance.
- Replaced the large inline `WeatherIconsMap` bundle path with static SVG image loading.
- Updated the weather icon generation script to emit static SVG files instead of a JavaScript icon map.

### Technical
- Reduced client-side JavaScript parsing pressure by moving weather icon SVGs out of the component bundle.
- Preserved original raster assets during rollout for fallback and visual verification.
- Archived the previous inline icon map at `docs/archive/generated/WeatherIconsMap.v1.2.8.ts`.

## [v1.2.5] - 2026-02-08

### Added
- **GlassButton Component**:
  - Extracted unified glass button component for all floating controls (LanguageSwitcher, TextModeSwitcher, BackgroundController).
  - Symmetric gradient border with 4-stop highlights (135deg, corners bright, middle dim).
  - Multi-layered inner shadows for realistic depth (`inset 0 1px 2px`, `inset 0 -1px 2px`).
  - Top-arc highlight layer for 3D glass sphere effect.
  - Built-in hover animations (scale: 1.05) and tap feedback (scale: 0.95).
  - Support for `active` state with enhanced background opacity.

- **Text Mode Switcher**:
  - New floating control for dynamic text color adjustment (☀️ Sun / 🌙 Moon toggle).
  - Integrated into bottom-right control panel alongside language and background switches.
  - Automatically syncs with BackgroundContext settings and localStorage.
  - Default mode: `dark` (for optimal contrast with default light gradient background).

### Changed
- **System Header (SystemStatus)**: Major UX and visual overhaul
  - **Positioning**: Changed from `fixed top-0` to `sticky top-0` for natural content flow integration.
  - **Dynamic Spacing**: Header starts with `mt-16` margin, collapses to `mt-0` when scrolled (smooth 500ms transition).
  - **Frosted Glass Background**: Activates on scroll (`scrollY > 20`):
    - Light text mode: `bg-black/10 backdrop-blur-md`
    - Dark text mode: `bg-white/30 backdrop-blur-md`
  - **Full-Width Design**: Header now spans entire viewport width (通栏效果):
    - Removed global `p-4 md:p-8` from body.
    - Content container uses `mx-auto` to maintain centered layout.
  - **Border Cleanup**: Removed bottom border for cleaner, seamless appearance.
  - **Fixed Height**: Strictly enforced `h-14` (56px) for consistent layout calculations.
  - **Text Color Logic**: 
    - Default changed from `light` to `dark` (better contrast with default background).
    - Text/divider colors dynamically adapt to `textMode` setting.

- **Floating Controls Unification**:
  - All three buttons (Language, TextMode, Background) now use identical styling:
    - Shape: `rounded-full`
    - Background: `bg-white/10` with `backdrop-blur-md`
    - Border: Symmetric gradient `0.3 → 0.02 → 0.01 → 0.4`
    - Icon size: Standardized to `w-4 h-4`
    - Text color: `text-white/90`
  - Replaced individual motion.button implementations with unified GlassButton component.

- **CoreBuildCard (岛屿脉动)**: Complete redesign with poetic narrative approach
  - **Theme Switch**: `dark` → `glass` for lighter visual weight and better balance across page.
  - **Visual Redesign**:
    - Replaced technical radar/sonar with hand-drawn abstract island outline SVG.
    - Organic bezier curve path with internal terrain detail line.
    - Breathing animation: Island scales 1 → 1.05 → 1 over 4-second cycle.
    - SVG path draws with `pathLength` animation and pulsing opacity.
  - **Content Transformation** (Technical → Poetic):
    - **Removed**: `LAT: 0.002MS`, `FREQ: 512HZ`, radar grid lines, rotating scan line.
    - **Added**:
      - "岛屿正在呼吸" / "The island breathes"
      - "感知到 127 次生命律动" / "127 vital pulses sensed" (dynamic counter, increments every 8s)
      - "生态系统：繁荣" / "Ecosystem: Thriving"
      - "律动频率：稳定" / "Rhythm: Stable"
  - **Animation Refinement**:
    - Central emerald dot pulses with breathing rhythm (3s cycle).
    - Outer glow halo scales and fades in sync (4s cycle).
    - All animations use `ease-in-out` for natural, organic feel.

- **Layout Adjustments**:
  - **Body**: Removed `p-4 md:p-8` and `flex-col items-center` to enable full-width header.
  - **Main Container**: Changed from global centering to `mx-auto` on content div.
  - **First Section Padding**: Reduced from `pt-20` to `pt-4` (header no longer needs large offset).
  - **Content Container**: Now uses `pb-8` instead of `py-8` (top space handled by header margin).

- **BackgroundContext**:
  - Added `textMode` state (`'light' | 'dark'`).
  - Added `toggleTextMode()` function.
  - Default value updated to `'dark'` for better contrast with default gradient background.
  - Settings now persist `textMode` to localStorage and Supabase.

### Fixed
- **Status Bar Contrast**: Header text now readable on all background conditions (light/dark/custom images).
- **Content Overlap**: Header no longer overlaps first section content when page loads.
- **Visual Consistency**: All three floating buttons now have identical glass styling (no more white/solid outliers).
- **Border Alignment**: Removed black line artifact that appeared on header scroll.
- **Gradient Symmetry**: GlassButton border gradient now truly symmetric (bright-dim-bright pattern).

### Technical
- **Component Extraction**: 
  - Created `GlassButton.tsx` as reusable UI primitive (40 lines, highly composable).
  - Refactored `LanguageSwitcher.tsx` to use GlassButton (reduced from 31 to 27 lines).
  - Refactored `TextModeSwitcher.tsx` to use GlassButton (29 lines).
  - Updated `BackgroundController.tsx` trigger button to GlassButton.

- **Design System Alignment**:
  - Confirmed all cards use unified border gradient via `BentoCard` mask technique.
  - Updated default border gradient angle: `135deg` → `125deg` for subtle asymmetry.
  
- **Theme Distribution** (Current State):
  - Light: 2 cards (IdentityCard, WorksCard)
  - Glass: 2 cards (SocialCard, CoreBuildCard) ← +1 from this release
  - Dark: 8 cards (StatsCard, TechStackCard, AIHubCard, etc.)
  - Custom: 1 card (WeatherCard with dynamic gradients)

---

## [v1.2.3] - 2026-01-30

### Added
- **Stats Card**:
  - Implemented **Visitor Count** functionality: Tracks page visits (default 532) with session-based incrementing.
  - Added **Supabase Integration**: Visitor data attempts to sync with the database, with a robust local fallback.
- **Interaction Feedback**:
  - Added a "Thanks for liking" (感谢喜欢) toast notification when clicking the Like button on the Social Card.

### Changed
- **Stats Card UI**:
  - **Redesigned Layout**: Switched to a cleaner, vertically stacked, and centered layout.
  - **Simplified Visuals**: Removed download and user icons for a more minimal aesthetic.
- **Toolbox**:
  - **Display Limit**: Restricted the main toolbox grid to show a maximum of 8 items to maintain visual balance.
- **Internationalization**:
  - Added translation support for "Visitors" (访客数量).

## [v1.2.2] - 2026-01-25

### Added
- **Weather Icon Optimization**:
  - Integrated `WeatherIconsMap` for pre-processed, zero-latency icon rendering.
  - Implemented `process-icons.ts` script to auto-generate optimized SVGs with glassmorphism effects and gradients.
  - Added robust fallback to standard icons if API data is missing.

### Changed
- **Weather Icons**:
  - Differentiated "Drizzle" from "Rainy" icon: Drizzle now uses a 2-drop variation while Rainy retains the 3-drop design.
  - Adjusted "Drizzle" background gradient to be lighter/softer than "Rainy".
- **Weather Card UI**:
  - Reduced main weather icon size (`w-12 h-12`) and adjusted position (`-mt-2`) for better layout balance.
  - Enhanced Sun icon rendering: Fixed missing glow effect by enabling `overflow-visible` on SVG containers.
- **Service Robustness**:
  - Improved error handling in `weather.ts` to correctly identify and log QWeather API 403 (Invalid Host) errors.

## [v1.2.1] - 2026-01-23

### Changed
- **Visual Refinements**:
  - Unified font sizes for all Bento Card titles (`h3`) to 18px for better consistency.
  - Adjusted text colors in Weather Card (Date, Weather Condition, Feels Like, and Bottom Capsule) to `text-white/50` for a more balanced and softer look.

## [v1.2.0] - 2026-01-23

### Added
- **Weather Card 2.0**:
  - Completely redesigned with Apple Weather-inspired aesthetics.
  - Real-time weather data integration via Open-Meteo API.
  - Dynamic gradient backgrounds based on weather conditions and time of day (Day/Night).
  - Custom 3D-style icons with "Solid Gradient" fill and soft shadows.
  - Interactive hover animation (shake effect) for the main weather icon.
  - Detailed weather metrics: Temperature, Condition, High/Low, Humidity, Wind Speed, Feels Like.
  - Click-to-refresh functionality on location text.
- **Mobile Experience**:
  - Enforced minimum height (200px) for Bento Cards on mobile devices to ensure content visibility.
  - Optimized grid layout for mobile: Stacked cards with specific 2-column layout for Stats & QR code.
- **Visual Polish**:
  - Refined typography hierarchies (unified font sizes for location, date, and metrics).
  - Conditional letter-spacing for English/Chinese titles in Identity Card.
  - Softened shadows and optimized spacing for a cleaner look.

### Changed
- Updated `package.json` version to 1.2.0.
- Optimized `WeatherCard` layout:
  - Aligned temperature and condition text to the bottom.
  - Unified left-side vertical alignment.
  - Simplified bottom stats capsule (removed vertical dividers, adjusted opacity).

### Fixed
- Fixed Moon icon visibility in night mode.
- Fixed linter errors in SVG component nesting.
- Resolved layout crowding issues in the bottom capsule bar.

## [v1.1.0] - 2026-01-22

### Added
- **Deployment & Analytics**:
  - Integrated Google Analytics (GA4) for comprehensive user interaction tracking.
  - Configured SEO Metadata and Open Graph (OG) images for optimized social sharing previews.
  - Added GitHub Actions workflow for automated deployment to GitHub Pages.
- **System**:
  - Implemented `basePath` support for subdirectory hosting on GitHub Pages.

### Fixed
- **Asset Loading**:
  - Resolved image 404 errors by switching from string paths to static imports.
  - Fixed Favicon loading issue in static export mode.
  - Corrected `next.config.mjs` settings to support custom base paths.

## [v1.0.0] - 2026-01-20

### Added
- **Initial Release**:
  - Launch of **Zaizai Isle** - A personal portfolio site for an AI Product Designer.
- **Core Architecture**:
  - Built with **Next.js 14** (App Router), **Tailwind CSS**, and **TypeScript**.
  - **Bento Grid System**: A responsive, masonry-style layout engine using CSS Grid.
- **Components**:
  - **Identity Card**: Personal introduction, avatar, and "Open to Work" status indicator.
  - **Works Card**: Portfolio showcase with project links and descriptions.
  - **Map Card**: Interactive location visualization using Mapbox/Custom styling.
  - **Social Card**: QR Code for WeChat and links to social platforms.
  - **Tech Stack**: Infinite scrolling marquee of development tools and skills.
  - **Guestbook**: Real-time message board integration powered by **Supabase**.
  - **Animations**: Smooth entry and hover effects using **Framer Motion**.
