import { WeatherData } from "@/components/bento/WeatherCard";
import { supabase } from "@/lib/supabase";

// Configuration
const LOCAL_CACHE_DURATION = 5 * 60 * 1000; // Local browser cache: 5 minutes
const GLOBAL_CACHE_DURATION = 15 * 60 * 1000; // Supabase global cache: 15 minutes (approx 96 API calls/day)
const QWEATHER_API_KEY = process.env.NEXT_PUBLIC_QWEATHER_KEY || ""; 
// Note: You need to add NEXT_PUBLIC_QWEATHER_KEY to your .env.local file

export type WeatherProvider = 'open-meteo' | 'qweather';

interface CachedData {
  timestamp: number;
  data: WeatherData;
}

// QWeather Response Types
interface QWeatherNowResponse {
  code: string;
  now: {
    temp: string;
    icon: string;
    text: string;
    windSpeed: string;
    humidity: string;
    feelsLike: string;
  };
}

interface QWeatherDailyResponse {
  code: string;
  daily: Array<{
    tempMax: string;
    tempMin: string;
    sunrise: string;
    sunset: string;
  }>;
}

// Mapping QWeather icon codes to our conditions
const mapQWeatherCode = (code: string): string => {
  const c = parseInt(code);
  if (c === 100 || c === 150) return "Sunny"; // Sunny / Clear
  if (c >= 101 && c <= 104) return "Cloudy"; // Cloudy / Overcast
  if (c >= 151 && c <= 154) return "Cloudy"; // Cloudy Night
  // Note: 101-103 are often partly cloudy. Let's refine based on WMO map logic
  if (c === 101 || c === 102 || c === 103 || c === 151 || c === 152 || c === 153) return "PartlyCloudy";
  if (c === 104 || c === 154) return "Cloudy";
  
  if (c >= 300 && c <= 399) return "Rainy"; // Rain
  if (c >= 400 && c <= 499) return "Snowy"; // Snow
  if (c >= 500 && c <= 515) return "Foggy"; // Fog / Haze
  if (c >= 200 && c <= 299) return "Windy"; // Wind

  
  // Drizzle is often subset of Rain in QWeather (300-304 are showers/storms, 305-309 light rains)
  // Let's map specific light rains to Drizzle if needed, but QWeather puts them under 3xx.
  // We'll stick to simple mapping for now.
  
  if (c >= 200 && c <= 299) return "Thunderstorm"; // Wind/Storm (Wait, 2xx is wind?)
  // QWeather 2xx is Wind/Storm? No, standard is:
  // 1xx: Sunny/Cloudy
  // 2xx: Wind (rarely used as condition icon)
  // 3xx: Rain
  // 4xx: Snow
  // 5xx: Fog/Haze
  // 9xx: Others
  
  // Thunderstorm is often in 3xx (e.g. 302 Thundershower)
  if (c === 302 || c === 303 || c === 304) return "Thunderstorm";
  
  return "Sunny"; // Default
};

export const fetchWeatherWithCache = async (provider: WeatherProvider = 'open-meteo', lang: string = 'en'): Promise<WeatherData | null> => {
  // 1. Check Local Browser Cache (L1 Cache)
  const cacheKey = `weather_cache_${provider}_${lang}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    try {
      const parsed: CachedData = JSON.parse(cached);
      const now = Date.now();
      if (now - parsed.timestamp < LOCAL_CACHE_DURATION) {
        console.log(`Using local cached weather data from ${provider}`);
        return parsed.data;
      }
    } catch (e) {
      console.error("Cache parse error", e);
      localStorage.removeItem(cacheKey);
    }
  }

  // 2. Check Supabase Global Cache (L2 Cache)
  if (supabase) {
    try {
      const { data: globalCache, error } = await supabase
        .from('weather_cache')
        .select('*')
        .eq('id', 1)
        .single();

      if (globalCache && globalCache.updated_at) {
        const globalTime = new Date(globalCache.updated_at).getTime();
        const now = Date.now();
        
        // If global cache is fresh enough (within 15 mins)
        if (now - globalTime < GLOBAL_CACHE_DURATION) {
          console.log(`Using Supabase global cached weather data`);
          const weatherData = globalCache.data as WeatherData;
          
          // Update local cache to sync
          const cacheEntry: CachedData = {
            timestamp: Date.now(),
            data: weatherData
          };
          localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
          
          return weatherData;
        }
      }
    } catch (error) {
      console.warn("Failed to read from Supabase weather_cache", error);
    }
  }

  // 3. Fetch Fresh Data (L3 Source)
  console.log(`Fetching fresh weather data from ${provider}`);
  let data: WeatherData | null = null;

  try {
    if (provider === 'qweather') {
      data = await fetchQWeather(lang);
    } else {
      data = await fetchOpenMeteo();
    }
  } catch (error) {
    console.error(`Failed to fetch weather from ${provider}`, error);
    return null;
  }

  // 4. Update Caches
  if (data) {
    // Update Local Cache
    const cacheEntry: CachedData = {
      timestamp: Date.now(),
      data
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));

    // Update Supabase Global Cache
    if (supabase) {
      try {
        await supabase.from('weather_cache').upsert({
          id: 1,
          data: data,
          updated_at: new Date().toISOString(),
          provider: provider
        });
        console.log("Updated Supabase global weather cache");
      } catch (error) {
        console.warn("Failed to update Supabase weather_cache", error);
      }
    }
  }

  return data;
};

// Open-Meteo Implementation (Existing logic refactored)
const fetchOpenMeteo = async (): Promise<WeatherData> => {
  const response = await fetch(
    "https://api.open-meteo.com/v1/forecast?latitude=31.2304&longitude=121.4737&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&daily=temperature_2m_max,temperature_2m_min&wind_speed_unit=kmh&timezone=Asia%2FShanghai"
  );
  const data = await response.json();
  const current = data.current;
  const daily = data.daily;
  
  let condition = "Cloudy";
  const code = current.weather_code;
  
  // WMO Mapping
  if (code === 0) condition = "Sunny";
  else if (code === 1 || code === 2) condition = "PartlyCloudy";
  else if (code === 3) condition = "Cloudy";
  else if (code === 45 || code === 48) condition = "Foggy";
  else if (code >= 51 && code <= 55) condition = "Drizzle";
  else if ((code >= 61 && code <= 65) || (code >= 80 && code <= 82)) condition = "Rainy";
  else if ((code >= 71 && code <= 77) || code === 85 || code === 86) condition = "Snowy";
  else if (code >= 95) condition = "Thunderstorm";

  return {
    temp: Math.round(current.temperature_2m),
    condition,
    location: "weather.shanghai",
    humidity: current.relative_humidity_2m,
    windSpeed: Math.round(current.wind_speed_10m),
    feelsLike: Math.round(current.apparent_temperature),
    isDay: !!current.is_day,
    minTemp: Math.round(daily.temperature_2m_min[0]),
    maxTemp: Math.round(daily.temperature_2m_max[0])
  };
};

// QWeather Implementation
const fetchQWeather = async (lang: string): Promise<WeatherData> => {
  if (!QWEATHER_API_KEY) {
    throw new Error("Missing NEXT_PUBLIC_QWEATHER_KEY");
  }

  // Map language to QWeather format (en, zh, etc.)
  // QWeather supports 'zh' for Simplified Chinese, 'en' for English
  const qLang = lang === 'zh' ? 'zh' : 'en';

  // Ensure coordinates are max 2 decimal places as per API docs
  const location = "121.47,31.23";

  // Fetch Current Weather
  // Using standard 'key' parameter for Dev/Free tier
  const nowRes = await fetch(
    `https://devapi.qweather.com/v7/weather/now?location=${location}&key=${QWEATHER_API_KEY}&lang=${qLang}`
  );
  const nowData = await nowRes.json();
  
  if (nowData.code !== "200") {
    // Handle standard error (with code) or new error format (with error object)
    const errorCode = nowData.code || nowData.error?.status || 'unknown';
    const errorMsg = nowData.error?.title || nowData.code || 'Unknown Error';
    console.error("QWeather Now API Error Response:", nowData);
    throw new Error(`QWeather Now API Error: ${errorCode} (${errorMsg})`);
  }

  // Fetch Daily Forecast (for Min/Max)
  const dailyRes = await fetch(
    `https://devapi.qweather.com/v7/weather/3d?location=${location}&key=${QWEATHER_API_KEY}&lang=${qLang}`
  );
  const dailyData = await dailyRes.json();
  
  if (dailyData.code !== "200") {
     const errorCode = dailyData.code || dailyData.error?.status || 'unknown';
     const errorMsg = dailyData.error?.title || dailyData.code || 'Unknown Error';
     console.error("QWeather Daily API Error Response:", dailyData);
     throw new Error(`QWeather Daily API Error: ${errorCode} (${errorMsg})`);
  }

  const today = dailyData.daily[0];
  const now = nowData.now;
  
  const iconCode = parseInt(now.icon);
  const isDay = iconCode < 150; 

  return {
    temp: parseInt(now.temp),
    condition: mapQWeatherCode(now.icon),
    iconCode: iconCode,
    location: "weather.shanghai",
    humidity: parseInt(now.humidity),
    windSpeed: parseInt(now.windSpeed),
    feelsLike: parseInt(now.feelsLike),
    isDay: isDay,
    minTemp: parseInt(today.tempMin),
    maxTemp: parseInt(today.tempMax)
  };
};
