# Changelog

All notable changes to this project will be documented in this file.

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
