"use client";

import { cn } from "@/lib/utils";
import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";
import { motion } from "framer-motion";
import { MapPin, RefreshCw, Droplets, Wind, ArrowDown, ArrowUp, Thermometer, Sun, Moon, MoonStar, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog, CloudDrizzle, CloudSun, CloudMoon } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language-context";

interface WeatherData {
  temp: number;
  condition: string;
  location: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  isDay: boolean;
  minTemp: number;
  maxTemp: number;
}

// Weather Gradients & Filters Definitions
const WeatherDefs = () => (
  <svg width="0" height="0" className="absolute pointer-events-none">
    <defs>
      {/* Sun: Solid Orange/Gold Gradient */}
      <linearGradient id="sun-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDB813" />
        <stop offset="100%" stopColor="#EA580C" />
      </linearGradient>

      {/* Moon: Solid Silver/Blue Gradient */}
      <linearGradient id="moon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F1F5F9" />
        <stop offset="100%" stopColor="#94A3B8" />
      </linearGradient>

      {/* Cloud: Solid White/Grey Gradient */}
      <linearGradient id="cloud-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#CBD5E1" />
      </linearGradient>

      {/* Rain: Solid Blue Gradient */}
      <linearGradient id="rain-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>

      {/* Lightning: Solid Yellow Gradient */}
      <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="100%" stopColor="#EAB308" />
      </linearGradient>

      {/* CloudSun: Solid White to Orange */}
      <linearGradient id="cloud-sun-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="20%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#FDB813" />
      </linearGradient>

      {/* CloudMoon: Solid White to Blue */}
      <linearGradient id="cloud-moon-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="20%" stopColor="#E2E8F0" />
        <stop offset="100%" stopColor="#60A5FA" />
      </linearGradient>

      {/* Soft Drop Shadow for Depth */}
      <filter id="icon-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.15" />
      </filter>
    </defs>
  </svg>
);

// Standard Lucide Icons with Styling
const WeatherIcon = ({ condition, isDay }: { condition: string; isDay: boolean }) => {
      const iconProps = {
        className: "w-16 h-16",
        strokeWidth: 1.5,
        style: { filter: "url(#icon-shadow)" }
      };
    
      switch (condition) {
        case 'Sunny':
      return isDay 
        ? <Sun {...iconProps} stroke="url(#sun-gradient)" fill="url(#sun-gradient)" />
        : <MoonStar {...iconProps} stroke="url(#moon-gradient)" fill="url(#moon-gradient)" strokeWidth={0} />;
    case 'Rainy':
      return <CloudRain {...iconProps} stroke="url(#rain-gradient)" fill="url(#rain-gradient)" />;
    case 'Drizzle':
      return <CloudDrizzle {...iconProps} stroke="url(#rain-gradient)" fill="url(#rain-gradient)" />;
    case 'Snowy':
      return <CloudSnow {...iconProps} stroke="url(#cloud-gradient)" fill="url(#cloud-gradient)" />;
    case 'Thunderstorm':
      return <CloudLightning {...iconProps} stroke="url(#lightning-gradient)" fill="url(#lightning-gradient)" />;
    case 'Foggy':
      return <CloudFog {...iconProps} stroke="url(#cloud-gradient)" fill="url(#cloud-gradient)" />;
    case 'Cloudy':
      return <Cloud {...iconProps} stroke="url(#cloud-gradient)" fill="url(#cloud-gradient)" strokeWidth={0} />;
    default:
      // Part Cloudy
      return isDay 
        ? <CloudSun {...iconProps} stroke="url(#cloud-sun-gradient)" fill="url(#cloud-sun-gradient)" />
        : <CloudMoon {...iconProps} stroke="url(#cloud-moon-gradient)" fill="url(#cloud-moon-gradient)" />;
  }
};

export function WeatherCard() {
  const { t, language } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>({
    temp: 8,
    condition: "Sunny",
    location: "weather.shanghai",
    humidity: 45,
    windSpeed: 12,
    feelsLike: 8,
    isDay: new Date().getHours() >= 6 && new Date().getHours() < 18,
    minTemp: 4,
    maxTemp: 12
  });
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<string>("");

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=31.2304&longitude=121.4737&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&daily=temperature_2m_max,temperature_2m_min&wind_speed_unit=kmh&timezone=Asia%2FShanghai"
      );
      const data = await response.json();
      const current = data.current;
      const daily = data.daily;
      
      let condition = "Cloudy";
      const code = current.weather_code;
      
      // WMO Weather interpretation codes (WW)
      if (code === 0) {
        condition = "Sunny";
      } else if (code === 1 || code === 2 || code === 3) {
        condition = "Cloudy"; // Actually Partly Cloudy for 1/2
      } else if (code === 45 || code === 48) {
        condition = "Foggy";
      } else if (code >= 51 && code <= 55) {
        condition = "Drizzle";
      } else if ((code >= 61 && code <= 65) || (code >= 80 && code <= 82)) {
        condition = "Rainy";
      } else if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
        condition = "Snowy";
      } else if (code >= 95) {
        condition = "Thunderstorm";
      }
      
      setWeather({
        temp: Math.round(current.temperature_2m),
        condition: condition,
        location: "weather.shanghai",
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        feelsLike: Math.round(current.apparent_temperature),
        isDay: !!current.is_day,
        minTemp: Math.round(daily.temperature_2m_min[0]),
        maxTemp: Math.round(daily.temperature_2m_max[0])
      });
    } catch (error) {
      console.error("Failed to fetch weather", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const weekday = now.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'short' });
    setDate(`${year}.${month}.${day} ${weekday}`);
    fetchWeather(); 
  }, [language]);

  const getBackgroundClass = () => {
    if (!weather) return "bg-[#8291a0]/40";

    const isDay = weather.isDay;
    const condition = weather.condition;

    // Apple Weather-inspired Gradients (Soft & Glassy)
    if (condition === 'Sunny') {
      return isDay 
        ? "bg-gradient-to-b from-[#2980B9]/80 to-[#6DD5FA]/80" // Bright Blue Sky
        : "bg-gradient-to-b from-[#0F2027]/80 via-[#203A43]/80 to-[#2C5364]/80"; // Deep Night
    } else if (condition === 'Rainy' || condition === 'Drizzle' || condition === 'Thunderstorm') {
      return isDay
        ? "bg-gradient-to-b from-[#373B44]/80 to-[#4286f4]/80" // Stormy Blue-Grey
        : "bg-gradient-to-b from-[#232526]/80 to-[#414345]/80"; // Dark Storm
    } else if (condition === 'Snowy') {
      return isDay
        ? "bg-gradient-to-b from-[#83a4d4]/80 to-[#b6fbff]/80" // Icy Blue
        : "bg-gradient-to-b from-[#141E30]/80 to-[#243B55]/80"; // Dark Ice
    } else if (condition === 'Foggy' || condition === 'Cloudy') {
      return isDay
        ? "bg-gradient-to-b from-[#5D6D7E]/80 to-[#BFC9CA]/80" // Cloudy Grey
        : "bg-gradient-to-b from-[#232526]/80 to-[#414345]/80"; // Night Cloud
    } else {
      // Default
      return isDay
        ? "bg-gradient-to-b from-[#4facfe]/80 to-[#00f2fe]/80"
        : "bg-gradient-to-b from-[#0f172a]/80 to-[#334155]/80";
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
      default: return condition;
    }
  };

  return (
    <BentoCard 
      colSpan={2} 
      rowSpan={1} 
      className={cn(
        "h-full min-h-[200px] flex flex-col justify-between backdrop-blur-xl text-white p-5 overflow-hidden relative shadow-lg transition-all duration-500 group",
        getBackgroundClass()
      )}
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
                className="text-sm font-semibold tracking-wide text-white drop-shadow-md cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-2"
              >
                {loading ? t('weather.locating') : t(weather?.location || '')}
                {loading && <RefreshCw className="w-3 h-3 animate-spin" />}
              </h3>
            </div>
            <div className="text-xs font-medium text-white/60 pl-4.5">
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
              <div className="text-xs font-medium text-white/60 drop-shadow-md flex items-center gap-2">
                <span>{getWeatherLabel(weather?.condition || '')}</span>
                <span>{t('weather.feels_like')} {weather?.feelsLike}°</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Big Glassy Icon */}
        <div className="flex flex-col justify-center h-full">
           <motion.div 
             className="transform scale-150 mr-4 filter drop-shadow-2xl"
             whileHover={{ 
               rotate: [0, -10, 10, -5, 5, 0],
               transition: { duration: 0.5 }
             }}
           >
              <WeatherIcon condition={weather?.condition || 'Sunny'} isDay={weather?.isDay ?? true} />
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
