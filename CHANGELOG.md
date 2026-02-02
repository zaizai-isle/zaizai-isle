# Changelog

All notable changes to this project will be documented in this file.

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

