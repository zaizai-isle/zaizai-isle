"use client";

import { cn } from "@/lib/utils";
import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";
import { motion } from "framer-motion";
import { MapPin, RefreshCw, Droplets, Wind, Thermometer } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/lib/language-context";
import { FrostedGlassIcon, WeatherDefs } from "../FrostedGlassIcon";
import { fetchWeatherWithCache } from "@/services/weather";
import { WeatherData } from "@/types/weather";

// Weather Gradients & Filters Definitions - Imported from FrostedGlassIcon




const getBackgroundStyle = (weather: WeatherData | null) => {
  if (!weather) return "linear-gradient(to bottom,#8291a0 0%,#8291a0 35%,#2c3e50 100%)";

  const isDay = weather.isDay;
  const condition = weather.condition;
  const DAY_STOP = 35;    // 顶部颜色占比（白天）
  const NIGHT_STOP = 40;  // 顶部颜色占比（夜晚）
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  };

  const mkGlass = (topHex: string, bottomHex: string, stop: number, topAlpha = 0.8, bottomAlpha = 0.6) => {
    const topRgb = hexToRgb(topHex);
    const bottomRgb = hexToRgb(bottomHex);
    return `linear-gradient(to bottom, rgba(${topRgb}, ${topAlpha}) 0%, rgba(${topRgb}, ${topAlpha}) ${stop}%, rgba(${bottomRgb}, ${bottomAlpha}) 100%)`;
  };

  // Apple Weather-inspired Gradients (Soft & Glassy)
  if (condition === 'Sunny') {
    return isDay
      ? mkGlass('#4a90e2', '#7fb3f0', DAY_STOP)
      : mkGlass('#334155', '#1c2a3f', NIGHT_STOP);
  } else if (
    condition === 'Rainy' ||
    condition === 'LightRain' || condition === 'ModerateRain' || condition === 'HeavyRain' ||
    condition === 'LightFreezingRain' || condition === 'HeavyFreezingRain' ||
    condition === 'LightShowerRain' || condition === 'ModerateShowerRain' || condition === 'HeavyShowerRain' ||
    condition === 'Thunderstorm' || condition === 'ThunderstormWithLightHail' || condition === 'ThunderstormWithHeavyHail'
  ) {
    return isDay
      ? mkGlass('#788da2', '#a6b8c9', DAY_STOP)
      : mkGlass('#1e293b', '#0f172a', NIGHT_STOP);
  } else if (
    condition === 'Drizzle' ||
    condition === 'LightDrizzle' || condition === 'ModerateDrizzle' || condition === 'HeavyDrizzle' ||
    condition === 'LightFreezingDrizzle' || condition === 'HeavyFreezingDrizzle'
  ) {
    return isDay
      ? mkGlass('#b4bec9', '#9ca7b5', DAY_STOP)
      : mkGlass('#334155', '#141f39', NIGHT_STOP);
  } else if (
    condition === 'Snowy' ||
    condition === 'LightSnow' || condition === 'ModerateSnow' || condition === 'HeavySnow' ||
    condition === 'SnowGrains' || condition === 'LightShowerSnow' || condition === 'HeavyShowerSnow'
  ) {
    return isDay
      ? mkGlass('#f0f8ff', '#d9e8f5', DAY_STOP)
      : mkGlass('#64748b', '#334155', NIGHT_STOP);
  } else if (condition === 'PartlyCloudy' || condition === 'FewClouds') {
    return isDay
      ? mkGlass('#92acc2', '#b0c4d1', DAY_STOP)
      : mkGlass('#1b2a3b', '#0f1a2a', NIGHT_STOP);
  } else if (condition === 'Foggy' || condition === 'Cloudy' || condition === 'Overcast') {
    return isDay
      ? mkGlass('#afc0ce', '#d2dfe8', DAY_STOP)
      : mkGlass('#1B1B2A', '#262D47', NIGHT_STOP);
  } else if (
    condition === 'Mist' || condition === 'Haze' || condition === 'Sand' ||
    condition === 'Sandstorm' || condition === 'HeavySandstorm' || condition === 'FreezingFog'
  ) {
    return isDay
      ? mkGlass('#f3f6f9', '#e2e6eb', DAY_STOP)
      : mkGlass('#334155', '#1e293b', NIGHT_STOP);
  } else if (condition === 'Windy') {
    return isDay
      ? mkGlass('#607080', '#455566', DAY_STOP)
      : mkGlass('#475162', '#1a2338', NIGHT_STOP);
  } else {
    // Default
    return isDay
      ? mkGlass('#8e9ca8', '#4a5d6e', DAY_STOP)
      : mkGlass('#2c3e50', '#141E30', NIGHT_STOP);
  }
};

type TranslateFn = (key: string) => string;

const getWeatherLabel = (condition: string, t: TranslateFn) => {
  switch (condition) {
    case 'Sunny': return t('weather.sunny');
    case 'Cloudy': return t('weather.cloudy');
    case 'FewClouds': return t('weather.few_clouds');
    case 'Overcast': return t('weather.overcast');
    case 'Rainy': return t('weather.rainy');
    case 'Snowy': return t('weather.snowy');
    case 'Thunderstorm': return t('weather.thunderstorm');
    case 'ThunderstormWithLightHail': return t('weather.thunderstorm_with_light_hail');
    case 'ThunderstormWithHeavyHail': return t('weather.thunderstorm_with_heavy_hail');
    case 'Foggy': return t('weather.foggy');
    case 'Drizzle': return t('weather.drizzle');
    case 'Windy': return t('weather.windy');
    case 'PartlyCloudy': return t('weather.partly_cloudy');
    case 'Mist': return t('weather.mist');
    case 'Haze': return t('weather.haze');
    case 'Sand': return t('weather.sand');
    case 'Sandstorm': return t('weather.sandstorm');
    case 'HeavySandstorm': return t('weather.heavy_sandstorm');
    case 'FreezingFog': return t('weather.freezing_fog');
    case 'LightDrizzle': return t('weather.light_drizzle');
    case 'ModerateDrizzle': return t('weather.moderate_drizzle');
    case 'HeavyDrizzle': return t('weather.heavy_drizzle');
    case 'LightFreezingDrizzle': return t('weather.light_freezing_drizzle');
    case 'HeavyFreezingDrizzle': return t('weather.heavy_freezing_drizzle');
    case 'LightRain': return t('weather.light_rain');
    case 'ModerateRain': return t('weather.moderate_rain');
    case 'HeavyRain': return t('weather.heavy_rain');
    case 'LightFreezingRain': return t('weather.light_freezing_rain');
    case 'HeavyFreezingRain': return t('weather.heavy_freezing_rain');
    case 'LightShowerRain': return t('weather.light_shower_rain');
    case 'ModerateShowerRain': return t('weather.moderate_shower_rain');
    case 'HeavyShowerRain': return t('weather.heavy_shower_rain');
    case 'LightSnow': return t('weather.light_snow');
    case 'ModerateSnow': return t('weather.moderate_snow');
    case 'HeavySnow': return t('weather.heavy_snow');
    case 'SnowGrains': return t('weather.snow_grains');
    case 'LightShowerSnow': return t('weather.light_shower_snow');
    case 'HeavyShowerSnow': return t('weather.heavy_shower_snow');
    default: return condition;
  }
};

export function WeatherCard() {
  const { t, language } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWeatherWithCache('open-meteo', language);
      if (data) {
        setWeather(data);
      }
    } catch (error) {
      console.warn("Unexpected weather fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchWeather();

    // Refresh every 5 minutes
    const interval = setInterval(() => {
      fetchWeather();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [language, fetchWeather]);

  return (
    <BentoCard
      colSpan={4}
      rowSpan={1}
      className={cn(
        "h-full min-h-[192px] flex flex-col justify-between backdrop-blur-xl text-white p-5 overflow-hidden relative shadow-lg transition-all duration-500 group",
      )}
      style={{ backgroundImage: getBackgroundStyle(weather) }}
      borderGradient={VERTICAL_BORDER_GRADIENT}
    >
      <WeatherDefs />
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

      {/* Top Section: Main Info & Icon */}
      <div className="flex flex-row justify-between items-start flex-1 w-full z-10">
        {/* Left: Typography Stack */}
        <div className="flex flex-col h-full w-full">
          {/* Location & Date */}
          <div className="flex flex-col gap-1 mb-2 flex-none">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-white/60 drop-shadow-md" />
              <h3
                onClick={fetchWeather}
                className="text-base font-semibold tracking-wide text-white drop-shadow-md cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-2"
              >
                {loading ? t('weather.locating') : (weather ? t(weather.location) : t('weather.unavailable'))}
                {loading && <RefreshCw className="w-3 h-3 animate-spin" />}
              </h3>
            </div>
            <div className="text-[10px] font-mono text-white/30 pl-4.5 drop-shadow-md uppercase tracking-widest">
              {t('env.mood')}
            </div>
          </div>

          {/* Big Temperature & Condition - Vertically Centered */}
          <div className="flex-1 flex flex-col justify-center pl-4.5 pb-2">
            <div className="flex flex-col items-start">
              <div className="flex items-start text-4xl font-semibold tracking-tighter text-white drop-shadow-lg -ml-0.1 leading-none">
                {weather?.temp ?? '--'}
                <span className="text-xl font-normal">°</span>
              </div>
              <div className="text-xs text-white/40 drop-shadow-md flex items-center gap-2">
                <span>{weather ? getWeatherLabel(weather.condition, t) : '--'}</span>
                <span>{t('weather.feels_like')} {weather?.feelsLike ?? '--'}°</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Big Glassy Icon */}
        <div className="flex flex-col justify-center h-full">
          {weather && (
            <motion.div
              className="transform scale-150 mr-4"
              whileHover={{
                rotate: [0, -10, 10, -5, 5, 0],
                transition: { duration: 0.5 }
              }}
            >
              <FrostedGlassIcon
                condition={weather.condition}
                isDay={weather.isDay}
                iconCode={weather.iconCode}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Section: Unified Stats Row with Translucent Pill Background */}
      <div className="flex items-center justify-between z-10 w-full text-xs font-mono uppercase tracking-wider text-white/30 bg-white/5 rounded-full px-4 py-2 backdrop-blur-sm border border-white/6">
        {/* H/L */}
        <div className="flex items-center gap-1">
          <Thermometer className="w-3 h-3 drop-shadow-sm" />
          <span className="drop-shadow-sm">{weather?.maxTemp ?? '-'}°</span>
          <span className="opacity-50">/</span>
          <span className="drop-shadow-sm">{weather?.minTemp ?? '-'}°</span>
        </div>

        {/* Humidity */}
        <div className="flex items-center gap-1">
          <Droplets className="w-3 h-3 drop-shadow-sm" />
          <span className="drop-shadow-sm">{weather?.humidity ?? '-'}%</span>
        </div>

        {/* Wind */}
        <div className="flex items-center gap-1">
          <Wind className="w-3 h-3 drop-shadow-sm" />
          <span className="drop-shadow-sm">{weather?.windSpeed ?? '-'} <span className="text-[10px]">km/h</span></span>
        </div>
      </div>
    </BentoCard>
  );
}
