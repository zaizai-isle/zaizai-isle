"use client";

import { cn } from "@/lib/utils";
import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";
import { motion } from "framer-motion";
import { MapPin, RefreshCw, Droplets, Wind, Thermometer } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/lib/language-context";
import { FrostedGlassIcon, WeatherDefs } from "../FrostedGlassIcon";
import { fetchWeatherWithCache } from "@/services/weather";


export interface WeatherData {
  temp: number;
  condition: string;
  iconCode?: number;
  location: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  isDay: boolean;
  minTemp: number;
  maxTemp: number;
}

// Weather Gradients & Filters Definitions - Imported from FrostedGlassIcon




export function WeatherCard() {
  const { t, language } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>({
    temp: 8,
    condition: "Sunny",
    location: "weather.shanghai",
    humidity: 45,
    windSpeed: 12,
    feelsLike: 8,
    isDay: true,
    minTemp: 4,
    maxTemp: 12
  });
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<string>("");

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    try {
      // Use 'open-meteo' (Free, No Key) or 'qweather' (Needs Key in .env.local)
      // To switch to QWeather: fetchWeatherWithCache('qweather', language)
      const data = await fetchWeatherWithCache('open-meteo', language);
  
      
      if (data) {
        setWeather(data);
      }
    } catch (error) {
      console.error("Failed to fetch weather", error);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const weekday = now.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'short' });
    setDate(`${year}.${month}.${day} ${weekday}`);
    fetchWeather(); 

    // Refresh every 5 minutes
    const interval = setInterval(() => {
      fetchWeather();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [language, fetchWeather]);

  const getBackgroundStyle = () => {
    if (!weather) return "linear-gradient(to bottom,#8291a0 0%,#8291a0 35%,#2c3e50 100%)";

    const isDay = weather.isDay;
    const condition = weather.condition;
    const DAY_STOP = 35;    // 顶部颜色占比（白天）
    const NIGHT_STOP = 40;  // 顶部颜色占比（夜晚）
    const mk = (a: string, b: string, stop: number) => `linear-gradient(to bottom, ${a} 0%, ${a} ${stop}%, ${b} 100%)`;

    // Apple Weather-inspired Gradients (Soft & Glassy)
    if (condition === 'Sunny') {
      return isDay 
        ? mk('#3b76b2ff', '#4086d7ff', DAY_STOP)
        : mk('#334155', '#1c2a3f', NIGHT_STOP);
    } else if (condition === 'Rainy' || condition === 'Thunderstorm') {
      return isDay
        ? mk('#373B44', '#4286f4', DAY_STOP)
        : mk('#1e293b', '#0f172a', NIGHT_STOP);
    } else if (condition === 'Drizzle') {
      return isDay
        ? mk('#9ca3af', '#7a869a', DAY_STOP)
        : mk('#334155', '#141f39', NIGHT_STOP);
    } else if (condition === 'Snowy') {
      return isDay
        ? mk('#e8f4f8', '#bfd7e9', DAY_STOP)
        : mk('#64748b', '#334155', NIGHT_STOP);
    } else if (condition === 'PartlyCloudy') {
      return isDay
        ? mk('#2e7bb6ff', '#4a8dd3', DAY_STOP)
        : mk('#1b2a3b', '#0f1a2a', NIGHT_STOP);
    } else if (condition === 'Foggy' || condition === 'Cloudy') {
      return isDay
        ? mk('#e9edf0', '#d1d9df', DAY_STOP)
        : mk('#334155', '#1e293b', NIGHT_STOP);
    } else if (condition === 'Windy') {
      return isDay
        ? mk('#485563', '#29323c', DAY_STOP)
        : mk('#475162', '#1a2338', NIGHT_STOP);
    } else {
      // Default
      return isDay
        ? mk('#7e8b96', '#2c3e50', DAY_STOP)
        : mk('#2c3e50', '#141E30', NIGHT_STOP);
    }
  };

  const getWeatherLabel = (condition: string) => {
    switch (condition) {
      case 'Sunny': return t('weather.sunny');
      case 'Cloudy': return t('weather.cloudy');
      case 'Rainy': return t('weather.rainy');
      case 'Snowy': return t('weather.snowy');
      case 'Thunderstorm': return t('weather.thunderstorm');
      case 'Foggy': return t('weather.foggy');
      case 'Drizzle': return t('weather.drizzle');
      case 'Windy': return t('weather.windy');
      case 'PartlyCloudy': return t('weather.partly_cloudy');
      default: return condition;
    }
  };

  return (
    <BentoCard 
      colSpan={2} 
      rowSpan={1} 
      className={cn(
        "h-full min-h-[200px] flex flex-col justify-between backdrop-blur-xl text-white p-5 overflow-hidden relative shadow-lg transition-all duration-500 group",
      )}
      style={{ backgroundImage: getBackgroundStyle() }}
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
                className="text-[18px] font-semibold tracking-wide text-white drop-shadow-md cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-2"
              >
                {loading ? t('weather.locating') : t(weather?.location || '')}
                {loading && <RefreshCw className="w-3 h-3 animate-spin" />}
              </h3>
            </div>
            <div className="text-xs font-medium text-white/50 pl-4.5">
              {date}
            </div>
          </div>
          
          {/* Big Temperature & Condition - Vertically Centered */}
          <div className="flex-1 flex flex-col justify-center pl-4.5 pb-2">
            <div className="flex flex-col items-start">
              <div className="flex items-start text-5xl font-semibold tracking-tighter text-white drop-shadow-lg -ml-0.5 leading-none">
                {weather?.temp}
                <span className="text-xl font-normal">°</span>
              </div>
              <div className="text-xs font-medium text-white/50 drop-shadow-md flex items-center gap-2">
                <span>{getWeatherLabel(weather?.condition || '')}</span>
                <span>{t('weather.feels_like')} {weather?.feelsLike}°</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Big Glassy Icon */}
        <div className="flex flex-col justify-center h-full">
           <motion.div 
             className="transform scale-150 mr-4"
             whileHover={{ 
               rotate: [0, -10, 10, -5, 5, 0],
               transition: { duration: 0.5 }
             }}
           >
              <FrostedGlassIcon 
                condition={weather?.condition || 'Sunny'} 
                isDay={weather?.isDay ?? true} 
                iconCode={weather?.iconCode}
              />
           </motion.div>
        </div>
      </div>

      {/* Bottom Section: Unified Stats Row with Translucent Pill Background */}
      <div className="flex items-center justify-between z-10 w-full text-xs font-medium text-white/50 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm border border-white/10 shadow-sm">
         {/* H/L */}
         <div className="flex items-center gap-1">
            <Thermometer className="w-3 h-3" />
            <span>{weather?.maxTemp}°</span>
            <span className="opacity-50">/</span>
            <span>{weather?.minTemp}°</span>
         </div>
         
         {/* Humidity */}
         <div className="flex items-center gap-1">
            <Droplets className="w-3 h-3" />
            <span>{weather?.humidity}%</span>
         </div>

         {/* Wind */}
         <div className="flex items-center gap-1">
            <Wind className="w-3 h-3" />
            <span>{weather?.windSpeed}km/h</span>
         </div>
      </div>
    </BentoCard>
  );
}
