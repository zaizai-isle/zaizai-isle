"use client";

import { cn } from "@/lib/utils";
import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";
import { CloudSun, MapPin, RefreshCw, Droplets, Wind, Sun } from "lucide-react";
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
}

export function WeatherCard() {
  const { t, language } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>({
    temp: 8,
    condition: "Sunny",
    location: "weather.shanghai",
    humidity: 45,
    windSpeed: 12,
    feelsLike: 8,
    isDay: true
  });
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<string>("");

  const fetchWeather = async () => {
    setLoading(true);
    try {
      // Fetch real weather from Open-Meteo API
      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=31.2304&longitude=121.4737&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&wind_speed_unit=kmh&timezone=Asia%2FShanghai"
      );
      const data = await response.json();
      const current = data.current;
      
      // Map WMO weather codes to our conditions
      // 0: Clear sky
      // 1, 2, 3: Mainly clear, partly cloudy, and overcast
      // 45, 48: Fog
      // 51-67: Drizzle/Rain
      // 71-77: Snow
      // 80-82: Showers
      // 95-99: Thunderstorm
      
      let condition = "Cloudy";
      const code = current.weather_code;
      
      if (code === 0 || code === 1) {
        condition = "Sunny";
      } else if (code >= 51) {
        condition = "Rainy";
      }
      
      setWeather({
        temp: Math.round(current.temperature_2m),
        condition: condition,
        location: "weather.shanghai",
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        feelsLike: Math.round(current.apparent_temperature),
        isDay: !!current.is_day
      });
    } catch (error) {
      console.error("Failed to fetch weather", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set current date
    const now = new Date();
    setDate(now.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', weekday: 'long' }));
    
    // Initial fetch to get real data
    fetchWeather(); 
  }, [language]);

  const getBackgroundClass = () => {
    if (!weather) return "bg-[#8291a0]/80";

    const isDay = weather.isDay;
    const condition = weather.condition;

    if (condition === 'Sunny') {
      return isDay 
        ? "bg-gradient-to-br from-[#3b82f6]/75 to-[#60a5fa]/75" // Sunny Day: Blue
        : "bg-gradient-to-br from-[#0f172a]/80 to-[#1e293b]/80"; // Sunny Night: Dark Blue
    } else if (condition === 'Rainy') {
      return "bg-gradient-to-br from-[#334155]/80 to-[#475569]/80"; // Rainy: Dark Gray
    } else {
      // Cloudy or others
      return isDay
        ? "bg-gradient-to-br from-[#64748b]/75 to-[#94a3b8]/75" // Cloudy Day: Gray Blue
        : "bg-gradient-to-br from-[#1e293b]/80 to-[#334155]/80"; // Cloudy Night: Darker Gray
    }
  };

  return (
    <BentoCard 
      colSpan={2} 
      rowSpan={1} 
      className={cn(
        "h-full min-h-[200px] flex flex-col justify-between backdrop-blur-xl text-white p-4 overflow-hidden relative shadow-lg transition-all duration-500",
        getBackgroundClass()
      )}
      borderGradient={VERTICAL_BORDER_GRADIENT}
    >
      {/* Background gradient effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
      
      {/* Header */}
      <div className="flex justify-between items-start z-10">
        <div className="flex flex-col">
          <div className="flex items-center text-white/90 text-sm font-medium mb-0.5">
            <MapPin className="w-3.5 h-3.5 mr-1.5 opacity-80" />
            {loading ? t('weather.locating') : t(weather?.location || '')}
          </div>
          <div className="text-[10px] text-white/60 font-medium pl-5">
            {date}
          </div>
        </div>
        <button 
          onClick={fetchWeather}
          className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/70"
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {/* Main Content */}
      <div className="flex justify-between items-center my-1 z-10 pl-[20px]">
        <div className="flex flex-col">
          <div className="text-4xl font-bold tracking-tighter text-white">
            {weather?.temp}°
          </div>
          <div className="text-[10px] text-white/70 font-medium mt-0.5 flex items-center gap-1">
            <span>{weather?.condition === 'Cloudy' ? t('weather.cloudy') : weather?.condition === 'Sunny' ? t('weather.sunny') : weather?.condition}</span>
            <span>•</span>
            <span>{t('weather.feels_like')} {weather?.feelsLike}°</span>
          </div>
        </div>
        {weather?.condition === 'Sunny' ? (
          <Sun className="w-12 h-12 text-white/90 drop-shadow-md" />
        ) : (
          <CloudSun className="w-12 h-12 text-white/90 drop-shadow-md" />
        )}
      </div>

      {/* Footer Cards */}
      <div className="grid grid-cols-2 gap-2 md:gap-3 z-10 w-full">
        {/* Humidity */}
        <div className="bg-black/10 rounded-full px-3 py-2 flex items-center justify-between border border-white/10 shadow-sm">
          <div className="flex items-center text-white/70 text-xs gap-1.5">
            <Droplets className="w-3.5 h-3.5 opacity-70" />
            <span>{t('weather.humidity')}</span>
          </div>
          <div className="text-sm font-semibold text-white">
            {weather?.humidity}%
          </div>
        </div>

        {/* Wind */}
        <div className="bg-black/10 rounded-full px-3 py-2 flex items-center justify-between border border-white/10 shadow-sm">
          <div className="flex items-center text-white/70 text-xs gap-1.5">
            <Wind className="w-3.5 h-3.5 opacity-70" />
            <span>{t('weather.wind')}</span>
          </div>
          <div className="text-sm font-semibold flex items-baseline gap-1 text-white">
            {weather?.windSpeed} <span className="text-[10px] font-normal text-white/60">km/h</span>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
