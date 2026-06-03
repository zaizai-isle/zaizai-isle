# Asset Optimization Plan (V1.2.9)

## 1. Overview
Current project assets include several high-resolution raster images and a large auto-generated icon map. Since the project uses `output: 'export'` for GitHub Pages, Next.js built-in image optimization is disabled (`unoptimized: true`). This makes manual asset optimization (format migration, resizing) mandatory for performance.

## 2. Immediate Cleanups (Completed)
- [x] Remove default Next.js icons (`next.svg`, `vercel.svg`, etc.) from `public/`.
- [x] Remove redundant `public/PRODUCT_DOCUMENTATION.md`.
- [x] Remove `public/icon.jpg` (Duplicate of `src/assets/avatar-v1.jpg`).


## 3. High-Impact Optimizations (Recommendations)

### 3.1 WebP Migration
Migrate all high-resolution PNG/JPG assets to WebP format.
| Original Asset | Size | Runtime WebP Size | Saving |
| :--- | :--- | :--- | :--- |
| `shoebill-sprite-transparent.png` | 1.23MB | 473KB | ~62% |
| `Zaizai-Isle_Shoebill.png` | 352KB | 52KB | ~85% |
| `avatar-v1.jpg` | 70KB | 35KB | ~50% |
| `project-*.jpg` (x3) | 457KB | 338KB | ~26% |
| **Total** | **~2.11MB** | **~898KB** | **~1.2MB** |

### 3.2 Weather Icon Refactoring
The `WeatherIconsMap.ts` (370KB) was previously a large inline SVG module.
- **Problem**: Next.js had to parse this large JS file when the icon component imported it.
- **Solution**: Move icons to `public/weather-icons/` and load them as static SVGs through `next/image`. This keeps the icon payload out of the Weather card JS chunk.

## 4. Implementation Status
- [x] Generate runtime WebP variants for high-impact raster assets.
- [x] Update app and README references to prefer WebP assets.
- [x] Move weather icon rendering to static SVG files under `public/weather-icons/`.
- [ ] Consider removing or archiving original raster assets after production verification.
- [ ] Consider splitting the shoebill sprite by state if animation payload remains too large.

### 3.3 Sprite Optimization
The `shoebill-sprite-transparent.png` contains 7 rows of animations. 
- **Recommendation**: In addition to WebP conversion, consider splitting into smaller individual animations if certain states are rarely used, or using a more optimized sprite sheet layout.

## 5. Directory Organization
- Consolidate all "Source" assets (unprocessed icons) into a non-build folder like `.assets/source`.
- Keep "Runtime" assets (processed, optimized) in `public/` or `src/assets/`.
