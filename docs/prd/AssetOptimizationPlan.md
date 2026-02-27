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
| Original Asset | Size | Expected WebP Size | Saving |
| :--- | :--- | :--- | :--- |
| `shoebill-sprite-transparent.png` | 1.2MB | ~250KB | ~80% |
| `Zaizai-Isle_Shoebill.png` | 351KB | ~80KB | ~77% |
| `avatar-v1.jpg` | 70KB | ~30KB | ~57% |
| `project-*.jpg` (x3) | ~450KB | ~180KB | ~60% |
| **Total** | **~2.1MB** | **~540KB** | **~1.5MB** |

### 3.2 Weather Icon Refactoring
The `WeatherIconsMap.ts` (370KB) is currently a large JS bundle.
- **Problem**: Next.js must parse this large JS file on load, even if weather is not visible.
- **Solution**: Move icons to `public/weather-icons/` and load them as static SVGs via `<img>` tags or dynamic `fetch`. This offloads 370KB from the JS bundle.

### 3.3 Sprite Optimization
The `shoebill-sprite-transparent.png` contains 7 rows of animations. 
- **Recommendation**: In addition to WebP conversion, consider splitting into smaller individual animations if certain states are rarely used, or using a more optimized sprite sheet layout.

## 4. Directory Organization
- Consolidate all "Source" assets (unprocessed icons) into a non-build folder like `.assets/source`.
- Keep "Runtime" assets (processed, optimized) in `public/` or `src/assets/`.
