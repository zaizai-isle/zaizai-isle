"use client";

import { cn } from "@/lib/utils";
import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";
import { MapPin, RefreshCw, Droplets, Wind, ArrowDown, ArrowUp } from "lucide-react";
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

// Custom 3D Frosted Glass Icons
const GlassyWeatherIcon = ({ condition, isDay }: { condition: string; isDay: boolean }) => {
  // Common Gradients & Filters
  const defs = (
    <defs>
      {/* Sun Gradient: Rich Orange/Yellow */}
      <radialGradient id="sun-gradient" cx="50%" cy="50%" r="50%" fx="25%" fy="25%">
        <stop offset="0%" stopColor="#FFF7ED" />
        <stop offset="30%" stopColor="#FDB813" />
        <stop offset="100%" stopColor="#EA580C" />
      </radialGradient>
      
      {/* Moon Gradient: Silver/Gray */}
      <radialGradient id="moon-gradient" cx="50%" cy="50%" r="50%" fx="25%" fy="25%">
        <stop offset="0%" stopColor="#F8FAFC" />
        <stop offset="100%" stopColor="#64748B" />
      </radialGradient>

      {/* Cloud Gradient: Frosted Glass Look */}
      <linearGradient id="cloud-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="white" stopOpacity="0.95" />
        <stop offset="50%" stopColor="#F1F5F9" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.7" />
      </linearGradient>
      
      {/* Rain Gradient: Liquid Blue */}
      <linearGradient id="rain-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>

      {/* Lightning Gradient */}
      <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>

      {/* Soft Drop Shadow for depth */}
      <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.1" />
      </filter>
      
      {/* Stronger Shadow for Floating Effect */}
      <filter id="float-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="4" dy="8" stdDeviation="6" floodColor="#1E293B" floodOpacity="0.2" />
      </filter>

      {/* Inner Glow / Edge Highlight for Glass Effect */}
      <filter id="glass-edge">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="arithmetic" k2="1" k3="-1" result="edge" />
        <feFlood floodColor="white" floodOpacity="0.8" />
        <feComposite in2="edge" operator="in" result="highlight" />
        <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="highlight" />
        </feMerge>
      </filter>
      
      {/* Blur for background elements (simulating frosted glass look behind) */}
      <filter id="blur-glow">
        <feGaussianBlur stdDeviation="6" />
      </filter>
    </defs>
  );

  // Reusable shapes
  const SunShape = ({ className = "", style = {}, r = 14 }) => (
    <circle cx="48" cy="20" r={r} fill="url(#sun-gradient)" filter="url(#soft-shadow)" className={className} style={style} />
  );

  const MoonShape = ({ className = "", style = {} }) => (
    <path
      d="M48 32A14 14 0 1 1 32 16 16 16 0 0 0 48 32z"
      fill="url(#moon-gradient)"
      filter="url(#soft-shadow)"
      className={className}
      style={style}
    />
  );

  const CloudShape = ({ x = 0, y = 0, scale = 1, opacity = 1, filter = "url(#float-shadow)" }) => (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
      {/* Main Cloud Body */}
      <path
        d="M44 44H20c-6.6 0-12-5.4-12-12 0-6 4.4-11 10.2-11.8 1.6-8.6 9.1-15.2 18.2-15.2 10.3 0 18.8 8.4 18.8 18.8 0 .8-.1 1.6-.2 2.3 5.3 1.2 9.2 5.9 9.2 11.5 0 6.6-5.4 12-12 12z"
        fill="url(#cloud-gradient)"
        filter={filter}
      />
      {/* Top Edge Highlight (simulating light hitting the glass edge) */}
      <path
        d="M20 20c-6.6 0-12 5.4-12 12 0 1.5.3 2.9.8 4.2"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
        transform="translate(0, 0.5)"
      />
      <path
        d="M18.2 15c1.6-8.6 9.1-15.2 18.2-15.2 6.5 0 12.3 3.3 15.6 8.5"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
        transform="translate(0, 0.5)"
      />
      {/* Subtle Rim Light around the whole shape */}
      <path
        d="M44 44H20c-6.6 0-12-5.4-12-12 0-6 4.4-11 10.2-11.8 1.6-8.6 9.1-15.2 18.2-15.2 10.3 0 18.8 8.4 18.8 18.8 0 .8-.1 1.6-.2 2.3 5.3 1.2 9.2 5.9 9.2 11.5 0 6.6-5.4 12-12 12z"
        fill="none"
        stroke="white"
        strokeWidth="1"
        strokeOpacity="0.4"
      />
    </g>
  );

  const RainDrops = () => (
    <g filter="url(#soft-shadow)">
      <rect x="24" y="46" width="5" height="12" rx="2.5" fill="url(#rain-gradient)" transform="rotate(15 27 53)" />
      <rect x="36" y="46" width="5" height="12" rx="2.5" fill="url(#rain-gradient)" transform="rotate(15 39 53)" />
      <rect x="48" y="44" width="5" height="12" rx="2.5" fill="url(#rain-gradient)" transform="rotate(15 51 51)" />
    </g>
  );

  // Icon Compositions
  const SunnyIcon = () => (
    <svg viewBox="0 0 64 64" className="w-16 h-16 drop-shadow-lg">
      {defs}
      {/* Rays */}
      <g stroke="url(#sun-gradient)" strokeWidth="3" strokeLinecap="round" opacity="0.6">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line key={angle} x1="32" y1="4" x2="32" y2="9" transform={`rotate(${angle} 32 32)`} />
        ))}
      </g>
      {/* Big Sun */}
      <circle cx="32" cy="32" r="16" fill="url(#sun-gradient)" filter="url(#float-shadow)" />
      {/* Specular Highlight */}
      <ellipse cx="26" cy="26" rx="6" ry="4" fill="white" opacity="0.3" transform="rotate(-45 26 26)" />
    </svg>
  );

  const ClearNightIcon = () => (
    <svg viewBox="0 0 64 64" className="w-16 h-16 drop-shadow-lg">
      {defs}
      <path
        d="M42 36A18 18 0 1 1 24 14 18 18 0 0 0 42 36z"
        fill="url(#moon-gradient)"
        filter="url(#float-shadow)"
      />
      {/* Specular */}
      <circle cx="30" cy="22" r="3" fill="white" opacity="0.2" />
      {/* Stars */}
      <circle cx="52" cy="12" r="1.5" fill="white" opacity="0.8" filter="url(#blur-glow)" />
      <circle cx="58" cy="22" r="1" fill="white" opacity="0.6" />
    </svg>
  );

  const CloudSunIcon = () => (
    <svg viewBox="0 0 64 64" className="w-16 h-16">
      {defs}
      {/* 1. Sun in background */}
      <SunShape />
      
      {/* 2. Glow effect overlapping cloud area (simulating light passing through frosted glass) */}
      <circle cx="48" cy="20" r="18" fill="#F97316" filter="url(#blur-glow)" opacity="0.6" />
      
      {/* 3. Cloud in front */}
      <CloudShape x={-2} y={4} />
    </svg>
  );

  const CloudMoonIcon = () => (
    <svg viewBox="0 0 64 64" className="w-16 h-16">
      {defs}
      <MoonShape style={{ transform: 'translate(10px, -5px)' }} />
      <circle cx="58" cy="11" r="14" fill="#94A3B8" filter="url(#blur-glow)" opacity="0.4" />
      <CloudShape x={-2} y={4} />
    </svg>
  );

  const CloudyIcon = () => (
    <svg viewBox="0 0 64 64" className="w-16 h-16">
      {defs}
      {/* Back cloud, slightly darker/smaller */}
      <CloudShape x={10} y={-6} scale={0.7} opacity={0.6} filter="url(#soft-shadow)" />
      {/* Front cloud */}
      <CloudShape x={-4} y={4} />
    </svg>
  );

  const RainIcon = () => (
    <svg viewBox="0 0 64 64" className="w-16 h-16">
      {defs}
      <RainDrops />
      <CloudShape x={0} y={0} />
    </svg>
  );
  
  const SunRainIcon = () => (
    <svg viewBox="0 0 64 64" className="w-16 h-16">
      {defs}
      {/* Sun behind */}
      <SunShape r={16} />
      {/* Glow through cloud */}
      <circle cx="48" cy="20" r="20" fill="#F97316" filter="url(#blur-glow)" opacity="0.5" />
      
      <RainDrops />
      <CloudShape x={-2} y={2} />
    </svg>
  );

  const SnowIcon = () => (
    <svg viewBox="0 0 64 64" className="w-16 h-16">
      {defs}
      <CloudShape x={0} y={0} />
      <g fill="white" opacity="0.9" filter="url(#soft-shadow)">
        <circle cx="20" cy="50" r="3" />
        <circle cx="32" cy="56" r="3" />
        <circle cx="44" cy="50" r="3" />
        {/* Simple snowflakes cross */}
        <path d="M20 47v6 M17 50h6" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <path d="M32 53v6 M29 56h6" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <path d="M44 47v6 M41 50h6" stroke="white" strokeWidth="1" strokeLinecap="round" />
      </g>
    </svg>
  );

  const ThunderIcon = () => (
    <svg viewBox="0 0 64 64" className="w-16 h-16">
      {defs}
      {/* Glow behind lightning */}
      <path
        d="M32 38L24 48H30L28 58L38 46H32L36 38Z"
        fill="#F59E0B"
        filter="url(#blur-glow)"
        opacity="0.6"
        transform="translate(0, 4)"
      />
      <path
        d="M32 38L24 48H30L28 58L38 46H32L36 38Z"
        fill="url(#lightning-gradient)"
        stroke="white"
        strokeWidth="1"
        filter="url(#soft-shadow)"
      />
      <CloudShape x={0} y={-4} />
    </svg>
  );

  // Logic to choose icon
  switch (condition) {
    case 'Sunny':
      return isDay ? <SunnyIcon /> : <ClearNightIcon />;
    case 'Rainy':
    case 'Drizzle':
      // Use SunRain if it's day, looks nicer and matches reference "sun behind cloud with rain"
      // If it's night or user prefers standard, we could split, but "SunRain" implies sun.
      // Let's use SunRain for Day, and Rain (no sun) for Night/Default
      return isDay ? <SunRainIcon /> : <RainIcon />;
    case 'Snowy':
      return <SnowIcon />;
    case 'Thunderstorm':
      return <ThunderIcon />;
    case 'Cloudy':
    case 'Foggy':
      return <CloudyIcon />;
    default:
      // Default to Part Cloudy
      return isDay ? <CloudSunIcon /> : <CloudMoonIcon />;
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
    isDay: true,
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
    setDate(now.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', weekday: 'long' }));
    fetchWeather(); 
  }, [language]);

  const getBackgroundClass = () => {
    if (!weather) return "bg-[#8291a0]/40";

    const isDay = weather.isDay;
    const condition = weather.condition;

    // Translucent Frosted Glass Gradients (Lighter & Lower Opacity)
    if (condition === 'Sunny') {
      return isDay 
        ? "bg-gradient-to-br from-[#3FA2F6]/50 to-[#6EB5FF]/50" // Light Blue Glass
        : "bg-gradient-to-br from-[#1B1A55]/50 to-[#070F2B]/50"; // Dark Glass
    } else if (condition === 'Rainy' || condition === 'Drizzle' || condition === 'Thunderstorm') {
      return isDay
        ? "bg-gradient-to-br from-[#607D8B]/50 to-[#90A4AE]/50" // Grey Blue Glass
        : "bg-gradient-to-br from-[#2C3E50]/50 to-[#4CA1AF]/50"; 
    } else if (condition === 'Snowy') {
      return isDay
        ? "bg-gradient-to-br from-[#83a4d4]/50 to-[#b6fbff]/50" 
        : "bg-gradient-to-br from-[#141E30]/50 to-[#243B55]/50"; 
    } else if (condition === 'Foggy' || condition === 'Cloudy') {
      return isDay
        ? "bg-gradient-to-br from-[#5D6D7E]/50 to-[#BFC9CA]/50" 
        : "bg-gradient-to-br from-[#232526]/50 to-[#414345]/50"; 
    } else {
      // Default
      return isDay
        ? "bg-gradient-to-br from-[#4facfe]/50 to-[#00f2fe]/50"
        : "bg-gradient-to-br from-[#0f172a]/50 to-[#334155]/50";
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
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      
      {/* Top Section: Main Info & Icon */}
      <div className="flex flex-row justify-between items-start flex-1 w-full z-10">
        {/* Left: Typography Stack */}
        <div className="flex flex-col h-full w-full">
          {/* Location & Date */}
          <div className="flex items-baseline gap-1.5 flex-none">
            <div className="flex items-center gap-1">
              <h3 className="text-lg font-semibold tracking-wide text-white drop-shadow-md">
                {loading ? t('weather.locating') : t(weather?.location || '')}
              </h3>
              <button 
                onClick={fetchWeather}
                className="p-1 opacity-50 hover:opacity-100 transition-opacity rounded-full bg-white/10 ml-1"
                disabled={loading}
                title={t('weather.refresh') || 'Refresh'}
              >
                 <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="text-xs font-medium text-white/70">
              {date}
            </div>
          </div>
          
          {/* Big Temperature & Condition - Vertically Centered */}
          <div className="flex-1 flex flex-col justify-center pb-2">
            <div className="flex items-center gap-3">
              <div className="flex items-start text-7xl font-light tracking-tighter text-white drop-shadow-lg -ml-1">
                {weather?.temp}
                <span className="text-4xl mt-1 font-normal">°</span>
              </div>
              <div className="text-xl font-medium text-white/90 drop-shadow-md pt-2">
                {getWeatherLabel(weather?.condition || '')}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Big Glassy Icon */}
        <div className="flex flex-col justify-center h-full">
           <div className="transform scale-150 mr-4 filter drop-shadow-2xl">
              <GlassyWeatherIcon condition={weather?.condition || 'Sunny'} isDay={weather?.isDay || true} />
           </div>
        </div>
      </div>

      {/* Bottom Section: Unified Stats Row with Translucent Pill Background */}
      <div className="flex items-center justify-between mt-2 z-10 w-full text-xs font-medium text-white/80 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm border border-white/10 shadow-sm">
         {/* H/L */}
         <div className="flex items-center gap-1">
            <span>{weather?.maxTemp}°</span>
            <span className="opacity-50">/</span>
            <span>{weather?.minTemp}°</span>
         </div>
         
         {/* Divider */}
         <div className="w-px h-3 bg-gradient-to-b from-white/0 via-white/20 to-white/0" />
         
         {/* Feels Like */}
         <div className="flex items-center gap-2">
            <span>{t('weather.feels_like')} {weather?.feelsLike}°</span>
         </div>

         {/* Divider */}
         <div className="w-px h-3 bg-gradient-to-b from-white/0 via-white/20 to-white/0" />

         {/* Stats (Humidity & Wind) */}
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
               <Droplets className="w-3 h-3" />
               <span>{weather?.humidity}%</span>
            </div>
            <div className="flex items-center gap-1">
               <Wind className="w-3 h-3" />
               <span>{weather?.windSpeed}km/h</span>
            </div>
         </div>
      </div>
    </BentoCard>
  );
}
