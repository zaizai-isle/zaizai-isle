# Implementation Plan - Zaizai Isle Performance Optimization (V1.2.8)

Based on the **Vercel React Best Practices** skill audit, this plan outlines the steps to optimize the "Zaizai Isle" project for better bundle size, rendering performance, and overall smoothness.

## 1. Grid & Page Level Optimization (Bundle & Critical Rendering)

### 1.1 Hoist Static JSX and Components
- **File**: `src/app/page.tsx`
  - Hoist `SectionTitle` outside the `Home` component to prevent re-creation on every render.
- **File**: `src/components/bento/BentoCard.tsx`
  - Hoist `colSpanClasses` and `rowSpanClasses` outside the component.
  - Hoist theme mapping logic if possible.

### 1.2 Implement Dynamic Imports (Code Splitting)
- **File**: `src/app/page.tsx`
  - Use `next/dynamic` to load heavy cards (like `WeatherCard`, `AIHubCard`, `CompressorCard`) only when needed or after hydration. This will significantly reduce the initial JavaScript payload.

## 2. Component Level Optimization (Memoization & Rerenders)

### 2.1 IdentityCard Refactoring
- **File**: `src/components/bento/IdentityCard.tsx`
  - Wrap `Tag`, `Sparkle`, and `Cloud` in `React.memo` to prevent them from re-rendering every 240ms when the `frame` state changes.
  - Hoist static configuration (like `stateRowMap`) outside the component.

### 2.2 WeatherCard Refactoring
- **File**: `src/components/bento/WeatherCard.tsx`
  - Hoist `getBackgroundStyle` and `getWeatherLabel` outside the component.
  - Remove unused state (`date`) from `WeatherCard`.

### 2.3 StatsCard Refactoring
- **File**: `src/components/bento/StatsCard.tsx`
  - Wrap `Counter` in `React.memo`.

## 3. General Best Practices Alignment

- ** Ternary over `&&`**: Review conditional rendering across all components to prefer `condition ? <Comp /> : null` over `condition && <Comp />` where applicable (Rule `rendering-conditional-render`).
- **SVG Animation**: Ensure animations are applied to wrappers where possible rather than raw SVG paths for better performance (Rule `rendering-animate-svg-wrapper`).

## Verification Plan

- [ ] **Build Check**: Run `npm run build` to verify bundle size reduction.
- [ ] **Vibe Check**: Manually verify animations remain smooth after memoization.
- [ ] **Accessibility Check**: Ensure ARIA roles and keyboard interactions are preserved.
