"use client";

import { BentoCard } from "./BentoCard";
import { CloudSun, Loader2, MapPin, RefreshCw, Droplets, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language-context";

interface WeatherData {
  temp: number;
  condition: string;
  location: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
}

export function WeatherCard() {
  const { t, language } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>({
    temp: 12,
    condition: "Cloudy",
    location: "weather.shanghai",
    humidity: 70,
    windSpeed: 12,
    feelsLike: 10
  });
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<string>("");

  const fetchWeather = async () => {
    setLoading(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWeather({
        temp: 12,
        condition: "Cloudy",
        location: "weather.shanghai",
        humidity: 70,
        windSpeed: 12,
        feelsLike: 10
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
    
    // Initial fetch is not needed since we have default data
    // fetchWeather(); 
  }, [language]);

  return (
    <BentoCard 
      colSpan={2} 
      rowSpan={1} 
      className="h-full flex flex-col justify-between bg-[#8291a0]/80 backdrop-blur-xl text-white p-4 overflow-hidden relative shadow-lg hover:bg-[#8c9ba9]/80"
      borderGradient="linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.05) 70%, rgba(255,255,255,0.3) 100%)"
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
            <span>{weather?.condition === 'Cloudy' ? t('weather.cloudy') : weather?.condition}</span>
            <span>•</span>
            <span>{t('weather.feels_like')} {weather?.feelsLike}°</span>
          </div>
        </div>
        <CloudSun className="w-12 h-12 text-white/90 drop-shadow-md" />
      </div>

      {/* Footer Cards */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3 z-10 w-full">
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
