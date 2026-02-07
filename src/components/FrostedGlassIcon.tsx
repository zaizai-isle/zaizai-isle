import React from 'react';
import { WeatherIconsMap } from './generated/WeatherIconsMap';

// SVG Path Data (Extracted from QWeather Icons node_modules/qweather-icons/icons/*-fill.svg)
// We use the exact paths from the original SVGs to maintain fidelity.
// For single-path icons with multiple elements (e.g. Rain + Cloud), we use layering:
// 1. Bottom Layer: Full Path (colored as Cloud/Background)
// 2. Top Layer: Truncated Path (colored as Element/Foreground)
const paths = {
  // Sunny (100-fill) - Single Path
  sunny: "M8.005 3.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm.004-.997a.5.5 0 0 1-.5-.5v-1.5a.5.5 0 0 1 1 0v1.5a.5.5 0 0 1-.5.5ZM3.766 4.255a.498.498 0 0 1-.353-.147l-1.062-1.06a.5.5 0 0 1 .707-.707L4.122 3.4a.5.5 0 0 1-.355.854v.001ZM2.004 8.493h-1.5a.5.5 0 1 1 0-1h1.5a.5.5 0 1 1 0 1Zm.691 5.303a.5.5 0 0 1-.354-.854l1.062-1.06a.5.5 0 0 1 .708.707l-1.063 1.06a.497.497 0 0 1-.353.147Zm5.301 2.201a.5.5 0 0 1-.5-.5v-1.5a.5.5 0 0 1 1 0v1.5a.5.5 0 0 1-.5.5Zm5.304-2.191a.496.496 0 0 1-.353-.147l-1.06-1.06a.5.5 0 1 1 .706-.707l1.06 1.06a.5.5 0 0 1-.353.854Zm2.203-5.299h-1.5a.5.5 0 0 1 0-1h1.5a.5.5 0 1 1 0 1ZM12.25 4.265a.5.5 0 0 1-.354-.854l1.06-1.06a.5.5 0 1 1 .708.707l-1.06 1.06a.498.498 0 0 1-.354.147Z",

  // Clear Night (150-fill) - Single Path
  moon: "M4.733.059c.46-.226.925.238.811.732C4.94 3.424 4.984 6.384 7 8.5c2.017 2.116 5.529 2.888 8.234 2.458.507-.08.948.405.69.844a8.432 8.432 0 0 1-1.547 1.919C10.94 16.9 5.54 16.733 2.313 13.347a8.323 8.323 0 0 1 .38-11.887A8.538 8.538 0 0 1 4.732.06Z",

  // Partly Cloudy Day (101-fill) - Multiple Absolute Paths (Splittable)
  partlyCloudyDay: {
    // All Sun parts (rays + body)
    sun: "M4.745 1.777a.516.516 0 1 0 1.007-.224L5.496.403A.516.516 0 0 0 4.49.627l.255 1.15ZM1.023 3.535l.994.633a.516.516 0 0 0 .554-.87l-.994-.633a.516.516 0 0 0-.554.87ZM.628 8.043l1.15-.256a.516.516 0 0 0-.223-1.008l-1.15.256a.516.516 1 0 .223 1.008Zm10.238-2.28a.535.535 0 0 0 .112-.012l1.15-.256a.516.516 1 0-.224-1.008l-1.15.256a.516.516 0 0 0 .112 1.02ZM8.522 2.728a.516.516 0 0 0 .712-.158l.633-.994a.516.516 0 0 0-.87-.554l-.633.994a.516.516 0 0 0 .158.712ZM2.819 7.032c.071.303.182.596.331.87a3.13 3.13 0 0 0 .908-.486 2.453 2.453 0 0 1-.232-.608A2.504 2.504 0 0 1 8.714 5.72l.004.038a5.42 5.42 0 0 1 1.064.25 3.51 3.51 0 0 0-.061-.512 3.535 3.535 0 0 0-6.902 1.536Z",
    // Cloud part
    cloud: "M11.994 14.396A4.758 4.758 0 0 1 8.406 16a4.76 4.76 0 0 1-3.537-1.547 2.908 2.908 0 0 1-1.056.197C2.258 14.65 1 13.441 1 11.95s1.26-2.7 2.813-2.7c.173 0 .342.015.507.044C5.124 7.924 6.652 7 8.406 7c1.769 0 3.308.94 4.107 2.328a2.93 2.93 0 0 1 .675-.078c1.553 0 2.812 1.209 2.812 2.7s-1.26 2.7-2.813 2.7a2.9 2.9 0 0 1-1.193-.254Z"
  },

  // Partly Cloudy Night (153-fill) - Two Separate Paths
  partlyCloudyNight: {
    cloud: "M11.583 11.078c-.199.005-.396.03-.59.075A4.249 4.249 0 0 0 8.128 10a4.279 4.279 0 0 0-1.642.34 4.05 4.05 0 0 0-1.354.935 2.953 2.953 0 0 0-.579-.056 3.096 3.096 0 0 0-1.364.297c-.423.2-.787.494-1.063.856a1.707 1.707 0 0 0-.44-.094 1.769 1.769 0 0 0-.75.163 1.66 1.66 0 0 0-.595.462 1.53 1.53 0 0 0-.312.662 1.49 1.49 0 0 0 .037.723c.072.235.201.451.378.631.176.18.394.32.638.406a1.778 1.778 0 0 0 1.493-.14c.558.443 1.268.68 1.998.665.527 0 1.046-.126 1.508-.365a4.267 4.267 0 0 0 2.222.511 4.23 4.23 0 0 0 2.162-.699c.345.184.733.28 1.13.282a2.49 2.49 0 0 0 1.69-.652c.451-.418.708-.986.716-1.58a2.297 2.297 0 0 0-.735-1.579 2.597 2.597 0 0 0-1.682-.69Zm0 3.591a1.437 1.437 0 0 1-.66-.169 1.051 1.051 0 0 0-1.058.066 3.036 3.036 0 0 1-1.738.525 3.148 3.148 0 0 1-1.548-.384 1.049 1.049 0 0 0-.509-.132.986.986 0 0 0-.48.122c-.306.156-.65.24-.998.244a2.142 2.142 0 0 1-1.338-.44 1.038 1.038 0 0 0-.65-.226c-.19 0-.599.235-.888.235a.694.694 0 0 1-.427-.21.616.616 0 0 1-.17-.423c0-.156.06-.306.17-.423a.694.694 0 0 1 .427-.21c.05 0 .4.056.489.056a.884.884 0 0 0 .451-.096.816.816 0 0 0 .328-.307c.188-.232.431-.42.71-.549.28-.129.587-.194.898-.192.13 0 .49.066.61.066a1.05 1.05 0 0 0 .39-.095.993.993 0 0 0 .318-.233 3.13 3.13 0 0 1 1.017-.683c.384-.161.8-.248 1.22-.255.403.005.801.085 1.172.235.37.15.705.366.986.637a1 1 0 0 0 .329.21c.123.048.256.072.39.072.1 0 .46-.075.56-.075.362.027.704.173.963.413.26.24.42.559.454.9a1.293 1.293 0 0 1-.419.934 1.467 1.467 0 0 1-.999.387Z",
    moon: "M15.33 7.6a5.33 5.33 0 0 1-3.24 0 5.47 5.47 0 0 1-3.57-3.3 5.57 5.57 0 0 1-.26-3.07.49.49 0 0 0-.67-.57A6.17 6.17 0 0 0 4 6.93a6 6 0 0 0 1.1 2.8 4.61 4.61 0 0 1 2.6-.93h.19a4.66 4.66 0 0 1 2.85.91h.31a3.15 3.15 0 0 1 2.3.89c.188.193.353.408.49.64a6.19 6.19 0 0 0 2.13-3 .5.5 0 0 0-.64-.64Z"
  },

  // Cloudy/Overcast (104-fill) - Two Separate Paths
  cloudy: {
    front: "M11.727 14.217A4.99 4.99 0 0 1 7.9 16a4.988 4.988 0 0 1-3.773-1.719 3 3 0 1 1-.586-5.732A4.998 4.998 0 0 1 7.9 6a4.999 4.999 0 0 1 4.38 2.587 3 3 0 1 1-.553 5.63Z",
    back: "M4.008 6.637a1.545 1.545 0 0 1 1.54-1.467.913.913 0 0 1 .108.012l.084.012a1 1 0 0 0 .961-.445 2.74 2.74 0 0 1 4.598 0 1 1 0 0 0 .961.445l.084-.012a.916.916 0 0 1 .108-.012 1.524 1.524 0 0 1 1.455 2.048c.312.135.602.316.86.538A2.484 2.484 0 0 0 12.136 4.2a3.74 3.74 0 0 0-6.27 0 2.506 2.506 0 0 0-.317-.032A2.548 2.548 0 0 0 3 6.717c.005.174.028.347.069.517.238-.3.569-.51.94-.597h-.001Z"
  },

  // Rain (306-fill) - Separated Paths
  rain: {
    // Cloud part only (Extracted from 306-fill)
    cloud: "M4.727 3.217A4.99 4.99 0 0 1 7.9 10a4.988 4.988 0 0 1-3.773-1.719 3 3 0 1 1-.586-5.732A4.998 4.998 0 0 1 7.9 0a4.999 4.999 0 0 1 4.38 2.587 3 3 0 1 1-.553 5.63Z",
    // Drops only (Extracted from 306-fill)
    drops: "M2.293 13.707A1 1 0 0 1 2 13c0-.5.555-1.395 1-2 .445.605 1 1.5 1 2a1 1 0 0 1-1.707.707Zm10 0A1 1 0 0 1 12 13c0-.5.555-1.395 1-2 .445.605 1 1.5 1 2a1 1 0 0 1-1.707.707ZM7 15a1 1 0 1 0 2 0c0-.5-.555-1.395-1-2-.445.605-1 1.5-1 2Z"
  },

  // Drizzle (Custom) - 2 Drops
  drizzle: {
    cloud: "M4.727 3.217A4.99 4.99 0 0 1 7.9 10a4.988 4.988 0 0 1-3.773-1.719 3 3 0 1 1-.586-5.732A4.998 4.998 0 0 1 7.9 0a4.999 4.999 0 0 1 4.38 2.587 3 3 0 1 1-.553 5.63Z",
    drops: "M2.293 13.707A1 1 0 0 1 2 13c0-.5.555-1.395 1-2 .445.605 1 1.5 1 2a1 1 0 0 1-1.707.707Zm10 0A1 1 0 0 1 12 13c0-.5.555-1.395 1-2 .445.605 1 1.5 1 2a1 1 0 0 1-1.707.707Z"
  },

  // Thunder (302-fill) - Separated Paths
  thunder: {
    // Cloud part only
    cloud: "M3.267 5.591A4.99 4.99 0 0 1 7.9 10a4.988 4.988 0 0 1-3.773-1.719 3 3 0 1 1-.586-5.732A4.998 4.998 0 0 1 7.9 0a4.999 4.999 0 0 1 4.38 2.587 3 3 0 1 1-.553 5.63Z",
    // Bolt part only
    bolt: "M3 13a1 1 0 1 0 2 0c0-.5-.555-1.395-1-2-.445.605-1 1.5-1 2Zm8 0a1 1 0 0 0 2 0c0-.5-.555-1.395-1-2-.445.605-1 1.5-1 2Zm-2.54-.374c-.054 0-.089-.05-.065-.093l.792-1.438C9.21 11.05 9.176 11 9.122 11H7.544a.147.147 0 0 0-.076.02.158.158 0 0 0-.058.057l-1.397 2.637c-.042.079.022.17.118.17h1.42c.05 0 .084.043.069.086l-.739 1.943c-.027.07.072.118.124.063l2.978-3.243c.04-.042.006-.107-.055-.107H8.46Z"
  },

  // Snow (400-fill) - Separated Paths
  snow: {
    // Cloud part only
    cloud: "M1.226 6.217A4.99 4.99 0 0 1 7.9 10a4.988 4.988 0 0 1-3.773-1.719 3 3 0 1 1-.586-5.732A4.998 4.998 0 0 1 7.9 0a4.999 4.999 0 0 1 4.38 2.587 3 3 0 1 1-.553 5.63Z",
    // Flakes only
    flakes: "M5.501 12a.35.35 0 0 0-.35.35v.544l-.47-.272a.35.35 0 1 0-.35.606l.47.272-.47.272a.35.35 0 1 0 .35.606l.47-.272v.544a.35.35 0 1 0 .7 0v-.544l.47.272a.35.35 0 1 0 .35-.606l-.47-.272.47-.272a.35.35 0 1 0-.35-.606l-.47.272v-.544a.35.35 0 0 0-.35-.35Zm5 0a.35.35 0 0 0-.35.35v.544l-.47-.272a.35.35 0 1 0-.35.606l.47.272-.47.272a.35.35 0 1 0 .35.606l.47-.272v.544a.35.35 0 1 0 .7 0v-.544l.47.272a.35.35 0 1 0 .35-.606l-.47-.272.47-.272a.35.35 0 1 0-.35-.606l-.47.272v-.544a.35.35 0 0 0-.35-.35Z"
  },

  // Fog (501-fill) - Separated Paths
  fog: {
    // Cloud part only (acts as background mist)
    cloud: "M7.227 3.217A4.99 4.99 0 0 1 7.9 10a4.988 4.988 0 0 1-3.773-1.719 3 3 0 1 1-.586-5.732A4.998 4.998 0 0 1 7.9 0a4.999 4.999 0 0 1 4.38 2.587 3 3 0 1 1-.553 5.63Z",
    // Lines only
    lines: "M.5 11a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9Zm3 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3Zm4.5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5ZM4.5 15a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0 1h-9Z"
  },

  // Windy (2101-fill) - Single Path
  windy: "M1.293 12.207A1 1 0 0 1 1 11.5c0-.5.555-1.395 1-2 .445.605 1 1.5 1 2a1 1 0 0 1-1.707.707Zm3 1.5A1 1 0 0 1 4 13c0-.5.555-1.395 1-2 .445.605 1 1.5 1 2a1 1 0 0 1-1.707.707ZM10 13a1 1 0 0 0 2 0c0-.5-.555-1.395-1-2-.445.605-1 1.5-1 2Zm-2.707 2.707A1 1 0 0 1 7 15c0-.5.555-1.395 1-2 .445.605 1 1.5 1 2a1 1 0 0 1-1.707.707ZM13 11.5a1 1 0 0 0 2 0c0-.5-.555-1.395-1-2-.445.605-1 1.5-1 2ZM7.9 10a4.99 4.99 0 0 0 3.827-1.783 3 3 0 1 0 .553-5.63A4.999 4.999 0 0 0 7.9 0a4.998 4.998 0 0 0-4.359 2.549 3 3 0 1 0 .586 5.732A4.988 4.988 0 0 0 7.9 10Zm.495-5.467c-.024.043.011.093.065.093h1.468c.06 0 .094.065.055.107L7.005 7.976c-.052.055-.151.006-.124-.063L7.62 5.97c.015-.043-.019-.087-.069-.087h-1.42c-.096 0-.16-.09-.118-.17L7.41 3.078a.159.159 0 0 1 .058-.057.147.147 0 0 1 .076-.02h1.578c.054 0 .089.051.065.094l-.792 1.439Z"
};

export const WeatherDefs = () => (
  <svg width="0" height="0" className="absolute pointer-events-none">
    <defs>
      {/* Sun: Vibrant Orange/Yellow */}
      <linearGradient id="sun-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFC000" />
        <stop offset="100%" stopColor="#FF8000" />
      </linearGradient>

      {/* Moon: Soft Silver/White */}
      <linearGradient id="moon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F5F5F5" />
        <stop offset="100%" stopColor="#C0C0C0" />
      </linearGradient>

      {/* Cloud: White to Light Blue-Grey for Volume */}
      <linearGradient id="cloud-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#D0D6E2" />
      </linearGradient>

      {/* Rain: Bright Blue */}
      <linearGradient id="rain-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00C6FF" />
        <stop offset="100%" stopColor="#0072FF" />
      </linearGradient>

      {/* Snow: Cyan/Ice */}
      <linearGradient id="snow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E0F7FA" />
        <stop offset="100%" stopColor="#81D4FA" />
      </linearGradient>

      {/* Thunder: Vibrant Yellow/Gold */}
      <linearGradient id="thunder-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF176" />
        <stop offset="100%" stopColor="#FBC02D" />
      </linearGradient>

      {/* Fog Lines: Blue Grey */}
      <linearGradient id="fog-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#90A4AE" />
        <stop offset="100%" stopColor="#546E7A" />
      </linearGradient>

      {/* Wind: White/Cyan/Grey */}
      <linearGradient id="wind-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#E0F2F1" />
      </linearGradient>

      {/* Soft Drop Shadow for Depth */}
      <filter id="icon-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.15" />
      </filter>

      {/* Sun Glow Filter */}
      <filter id="sun-glow-def" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
        <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="rgba(250,108,33,0.4)" />
      </filter>
    </defs>
  </svg>
);

interface FrostedGlassIconProps {
  condition: string;
  isDay: boolean;
  className?: string;
  iconCode?: number;
}

export const FrostedGlassIcon = ({ condition, isDay, className = "w-12 h-12 -mt-2", iconCode }: FrostedGlassIconProps) => {
  // Use Optimized Pre-processed Icons if available
  if (iconCode && WeatherIconsMap[iconCode]) {
    const svgContent = WeatherIconsMap[iconCode]
      .replace('width="16"', 'width="100%"')
      .replace('height="16"', 'height="100%"');

    return (
      <div
        className={`${className} [&>svg]:overflow-visible`}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    );
  }

  // Common drop shadow filter
  const shadowStyle = { filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' };

  switch (condition) {
    case 'Sunny':
      // Clear Night -> Moon
      if (!isDay) {
        return (
          <svg viewBox="0 0 16 16" className={className}>
            <path d={paths.moon} fill="url(#moon-gradient)" />
          </svg>
        );
      }
      // Sunny Day
      return (
        <svg viewBox="0 0 16 16" className={`${className} overflow-visible`}>
          <path d={paths.sunny} fill="url(#sun-gradient)" style={{ filter: 'url(#sun-glow-def)' }} />
        </svg>
      );

    case 'PartlyCloudy':
    case 'FewClouds':
      if (!isDay) {
        return (
          <svg viewBox="0 0 16 16" className={className}>
            {/* Moon Behind (Silver) */}
            <path d={paths.partlyCloudyNight.moon} fill="url(#moon-gradient)" />
            {/* Cloud (White Glass) */}
            <path
              d={paths.partlyCloudyNight.cloud}
              fill="url(#cloud-gradient)"
              style={shadowStyle}
            />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 16 16" className={`${className} overflow-visible`}>
          {/* Sun Behind (Orange) */}
          <path d={paths.partlyCloudyDay.sun} fill="url(#sun-gradient)" style={{ filter: 'url(#sun-glow-def)' }} />
          {/* Cloud (White Glass) */}
          <path
            d={paths.partlyCloudyDay.cloud}
            fill="url(#cloud-gradient)"
            style={shadowStyle}
          />
        </svg>
      );

    case 'Cloudy':
    case 'Overcast':
      return (
        <svg viewBox="0 0 16 16" className={className}>
          {/* Back Cloud */}
          <path
            d={paths.cloudy.back}
            fill="url(#cloud-gradient)"
            opacity="0.6"
          />
          {/* Front Cloud */}
          <path
            d={paths.cloudy.front}
            fill="url(#cloud-gradient)"
            style={shadowStyle}
          />
        </svg>
      );

    case 'Rainy':
    case 'LightRain':
    case 'ModerateRain':
    case 'HeavyRain':
    case 'LightShowerRain':
    case 'ModerateShowerRain':
    case 'HeavyShowerRain':
    case 'LightFreezingRain':
    case 'HeavyFreezingRain':
      return (
        <svg viewBox="0 0 16 16" className={className}>
          {/* Layer 1: Cloud Background (original path) */}
          <path
            d={paths.rain.cloud}
            fill="url(#cloud-gradient)"
            style={shadowStyle}
          />
          {/* Layer 2: Drops only on top (Blue) */}
          <path d={paths.rain.drops} fill="url(#rain-gradient)" />
        </svg>
      );

    case 'Drizzle':
    case 'LightDrizzle':
    case 'ModerateDrizzle':
    case 'HeavyDrizzle':
    case 'LightFreezingDrizzle':
    case 'HeavyFreezingDrizzle':
      return (
        <svg viewBox="0 0 16 16" className={className}>
          {/* Layer 1: Cloud Background (original path) */}
          <path
            d={paths.drizzle.cloud}
            fill="url(#cloud-gradient)"
            style={shadowStyle}
          />
          {/* Layer 2: 2 Drops only on top (Blue) */}
          <path d={paths.drizzle.drops} fill="url(#rain-gradient)" />
        </svg>
      );

    case 'Thunderstorm':
    case 'ThunderstormWithLightHail':
    case 'ThunderstormWithHeavyHail':
      return (
        <svg viewBox="0 0 16 16" className={className}>
          {/* Layer 1: Cloud Background (original path) */}
          <path
            d={paths.thunder.cloud}
            fill="url(#cloud-gradient)"
            style={shadowStyle}
          />
          {/* Layer 2: Bolt only on top (Yellow) */}
          <path d={paths.thunder.bolt} fill="url(#thunder-gradient)" />
        </svg>
      );

    case 'Snowy':
    case 'LightSnow':
    case 'ModerateSnow':
    case 'HeavySnow':
    case 'SnowGrains':
    case 'LightShowerSnow':
    case 'HeavyShowerSnow':
      return (
        <svg viewBox="0 0 16 16" className={className}>
          {/* Layer 1: Cloud Background (original path) */}
          <path
            d={paths.snow.cloud}
            fill="url(#cloud-gradient)"
            style={shadowStyle}
          />
          {/* Layer 2: Flakes only on top (Cyan) */}
          <path d={paths.snow.flakes} fill="url(#snow-gradient)" />
        </svg>
      );

    case 'Foggy':
    case 'Mist':
    case 'Haze':
    case 'Sand':
    case 'Sandstorm':
    case 'HeavySandstorm':
    case 'FreezingFog':
      return (
        <svg viewBox="0 0 16 16" className={className}>
          {/* Layer 1: Cloud Background (Blurred) */}
          <path
            d={paths.fog.cloud}
            fill="url(#cloud-gradient)"
            style={{ filter: 'blur(1px)', opacity: 0.8 }}
          />
          {/* Layer 2: Lines only on top */}
          <path d={paths.fog.lines} fill="url(#fog-gradient)" />
        </svg>
      );

    case 'Windy':
      return (
        <svg viewBox="0 0 16 16" className={className}>
          <path d={paths.windy} fill="url(#wind-gradient)" style={shadowStyle} />
        </svg>
      );

    default:
      // Sunny Day
      return (
        <svg viewBox="0 0 16 16" className={`${className} overflow-visible`}>
          <path d={paths.sunny} fill="url(#sun-gradient)" style={{ filter: 'url(#sun-glow-def)' }} />
        </svg>
      );
  }
};
