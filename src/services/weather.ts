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

// QWeather Response Types (removed unused interfaces to satisfy lint)

// Mapping QWeather icon codes to our conditions
const mapQWeatherCode = (code: string): string => {
  const c = parseInt(code);
  if (c === 100 || c === 150) return "Sunny";
  // Align condition text with icon semantics:
  // 101/151 -> Cloudy, 102/103/152/153 -> PartlyCloudy, 104/154 -> Overcast
  if (c === 104) return "Overcast";
  if (c === 101 || c === 151) return "Cloudy";
  if (c === 102 || c === 152) return "FewClouds";
  if (c === 103 || c === 153) return "PartlyCloudy";
  // Thunderstorm override (subset of Rain)
  if (c === 302 || c === 303 || c === 304) return "Thunderstorm";
  // Wind family (QWeather uses 2xxx for wind icons, e.g., 2528)
  if (c >= 2000 && c < 3000) return "Windy";
  if (c >= 300 && c <= 399) return "Rainy"; // Rain
  if (c >= 400 && c <= 499) return "Snowy"; // Snow
  if (c >= 500 && c <= 515) return "Foggy"; // Fog / Haze
  if (c >= 200 && c <= 299) return "Windy"; // Legacy wind range (fallback)

  // Drizzle is often subset of Rain in QWeather (300-304 are showers/storms, 305-309 light rains)
  // Let's map specific light rains to Drizzle if needed, but QWeather puts them under 3xx.
  // We'll stick to simple mapping for now.
 
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
      const globalId = provider === 'qweather' ? 2 : 1;
      const { data: globalCache } = await supabase
        .from('weather_cache')
        .select('*')
        .eq('id', globalId)
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
        const globalId = provider === 'qweather' ? 2 : 1;
        await supabase.from('weather_cache').upsert({
          id: globalId,
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

// 1. 定义WMO天气代码到天气描述的基础映射 
const weatherCodeToDesc: Record<number, string> = { 
  0: '晴朗', 
  1: '少云', 
  2: '多云', 
  3: '阴', 
  90: '大风',
  20: '薄雾', 
  23: '霾', 
  26: '扬沙', 
  45: '雾', 
  48: '冻雾', 
  51: '毛毛雨（轻）', 
  53: '毛毛雨（中）', 
  55: '毛毛雨（浓）', 
  56: '冻毛毛雨（轻）', 
  57: '冻毛毛雨（浓）', 
  61: '小雨', 
  63: '中雨', 
  65: '大雨', 
  66: '冻雨（轻）', 
  67: '冻雨（浓）', 
  71: '小雪', 
  73: '中雪', 
  75: '大雪', 
  77: '雪粒', 
  80: '阵雨（轻）', 
  81: '阵雨（中）', 
  82: '阵雨（浓）', 
  85: '阵雪（轻）', 
  86: '阵雪（浓）', 
  95: '雷暴（轻/中）', 
  96: '雷暴伴冰雹（轻）', 
  99: '雷暴伴冰雹（浓）', 
  43: '沙尘暴', 
  44: '强沙尘暴' 
}; 

// 2. 核心映射：WMO代码 → 图标编码（区分白天/夜晚） 
const weatherCodeToIcon: Record<number, { day: number; night: number }> = { 
  // 晴/少云/多云系列 
  0: { day: 100, night: 150 }, 
  1: { day: 102, night: 152 }, // 少云（Mainly clear / Few clouds）
  2: { day: 101, night: 151 }, // 多云（Cloudy）
  3: { day: 104, night: 104 }, 
  
  // 风系列（用户定义：WMO 90 → 大风；QWeather 2528）
  90: { day: 2528, night: 2528 },
  
  // 雾/霾/沙尘系列 
  20: { day: 500, night: 500 }, // 薄雾 
  23: { day: 502, night: 502 }, // 霾 
  26: { day: 503, night: 503 }, // 扬沙 
  45: { day: 501, night: 501 }, // 雾 
  48: { day: 501, night: 501 }, // 冻雾 
  43: { day: 507, night: 507 }, // 沙尘暴 
  44: { day: 508, night: 508 }, // 强沙尘暴 
  
  // 雨系列 
  51: { day: 309, night: 309 }, // 毛毛雨（轻） 
  53: { day: 309, night: 309 }, // 毛毛雨（中） 
  55: { day: 309, night: 309 }, // 毛毛雨（浓） 
  56: { day: 313, night: 313 }, // 冻毛毛雨（轻） 
  57: { day: 313, night: 313 }, // 冻毛毛雨（浓） 
  61: { day: 305, night: 305 }, // 小雨 
  63: { day: 306, night: 306 }, // 中雨 
  65: { day: 307, night: 307 }, // 大雨 
  66: { day: 313, night: 313 }, // 冻雨（轻） 
  67: { day: 313, night: 313 }, // 冻雨（浓） 
  80: { day: 300, night: 350 }, // 阵雨（轻） 
  81: { day: 300, night: 350 }, // 阵雨（中） 
  82: { day: 301, night: 351 }, // 阵雨（浓） 
  
  // 雪系列 
  71: { day: 400, night: 400 }, // 小雪 
  73: { day: 401, night: 401 }, // 中雪 
  75: { day: 402, night: 402 }, // 大雪 
  77: { day: 499, night: 499 }, // 雪粒 
  85: { day: 407, night: 457 }, // 阵雪（轻） 
  86: { day: 407, night: 457 }, // 阵雪（浓） 
  
  // 雷暴系列 
  95: { day: 302, night: 302 }, // 雷暴 
  96: { day: 303, night: 303 }, // 雷暴伴冰雹（轻） 
  99: { day: 304, night: 304 }, // 雷暴伴冰雹（浓） 
  
  // 混合天气 
  36: { day: 404, night: 404 }, // 雨夹雪 
  38: { day: 406, night: 456 }  // 阵雨夹雪 
}; 

// Open-Meteo Implementation (Existing logic refactored)
const fetchOpenMeteo = async (): Promise<WeatherData> => {
  const response = await fetch(
    "https://api.open-meteo.com/v1/forecast?latitude=31.2304&longitude=121.4737&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&daily=temperature_2m_max,temperature_2m_min&wind_speed_unit=kmh&timezone=Asia%2FShanghai"
  );
  const data = await response.json();
  const current = data.current;
  const daily = data.daily;
  
  const wmoCode = current.weather_code;
  const isDay = !!current.is_day;
  
  // Get weather description
  const weatherDesc = weatherCodeToDesc[wmoCode] || `Unknown(${wmoCode})`;
  
  // Get icon code
  const iconMap = weatherCodeToIcon[wmoCode] || { day: 100, night: 150 };
  const iconCode = isDay ? iconMap.day : iconMap.night;
  
  // Special handling: Overcast -> 104
  // WMO Code 3 is usually Overcast, but user map says 'Cloudy' (101/151).
  // If we want to strictly follow user logic:
  // const finalIconCode = (wmoCode === 3 && weatherDesc.includes('阴')) ? 104 : iconCode;
  // Since weatherDesc[3] is '多云', it won't trigger. 
  // However, let's keep the user's logic structure just in case they update the map.
  const finalIconCode = (wmoCode === 3 && weatherDesc.includes('阴')) ? 104 : iconCode;

  // Map to internal condition string for backward compatibility
  let condition = "Sunny";
  // We can use the iconCode or wmoCode to determine the condition string
  if (finalIconCode === 100 || finalIconCode === 150) condition = "Sunny";
  else if (finalIconCode === 101 || finalIconCode === 151) condition = "Cloudy";
  else if (finalIconCode === 104) condition = "Overcast";
  else if (finalIconCode === 102 || finalIconCode === 152) condition = "FewClouds";
  else if (finalIconCode === 103 || finalIconCode === 153) condition = "PartlyCloudy";
  else if (finalIconCode >= 500 && finalIconCode <= 515) condition = "Foggy";
  else if ((finalIconCode >= 300 && finalIconCode <= 304) || finalIconCode === 350 || finalIconCode === 351) condition = "Rainy"; // Showers/Storms
  else if (finalIconCode >= 305 && finalIconCode <= 308) condition = "Rainy"; // Rain
  else if (finalIconCode >= 309 && finalIconCode <= 313) condition = "Drizzle"; // Drizzle
  else if (finalIconCode >= 400 && finalIconCode <= 499) condition = "Snowy";
  else if (finalIconCode >= 302 && finalIconCode <= 304) condition = "Thunderstorm"; // Note: 302-304 overlap with rain, but are thunderstorm
  
  // Refine condition based on WMO code for better accuracy if icon code is ambiguous
  if (wmoCode === 0) condition = "Sunny";
  else if (wmoCode === 1) condition = "FewClouds";
  else if (wmoCode === 2) condition = "Cloudy";
  else if (wmoCode === 3) condition = "Overcast";
  else if (wmoCode === 90) condition = "Windy";
  else if (wmoCode === 20) condition = "Mist";
  else if (wmoCode === 23) condition = "Haze";
  else if (wmoCode === 26) condition = "Sand";
  else if (wmoCode === 45) condition = "Foggy";
  else if (wmoCode === 48) condition = "FreezingFog";
  else if (wmoCode === 43) condition = "Sandstorm";
  else if (wmoCode === 44) condition = "HeavySandstorm";
  else if (wmoCode === 51) condition = "LightDrizzle";
  else if (wmoCode === 53) condition = "ModerateDrizzle";
  else if (wmoCode === 55) condition = "HeavyDrizzle";
  else if (wmoCode === 56) condition = "LightFreezingDrizzle";
  else if (wmoCode === 57) condition = "HeavyFreezingDrizzle";
  else if (wmoCode === 61) condition = "LightRain";
  else if (wmoCode === 63) condition = "ModerateRain";
  else if (wmoCode === 65) condition = "HeavyRain";
  else if (wmoCode === 66) condition = "LightFreezingRain";
  else if (wmoCode === 67) condition = "HeavyFreezingRain";
  else if (wmoCode === 80) condition = "LightShowerRain";
  else if (wmoCode === 81) condition = "ModerateShowerRain";
  else if (wmoCode === 82) condition = "HeavyShowerRain";
  else if (wmoCode === 71) condition = "LightSnow";
  else if (wmoCode === 73) condition = "ModerateSnow";
  else if (wmoCode === 75) condition = "HeavySnow";
  else if (wmoCode === 77) condition = "SnowGrains";
  else if (wmoCode === 85) condition = "LightShowerSnow";
  else if (wmoCode === 86) condition = "HeavyShowerSnow";
  else if (wmoCode === 95) condition = "Thunderstorm";
  else if (wmoCode === 96) condition = "ThunderstormWithLightHail";
  else if (wmoCode === 99) condition = "ThunderstormWithHeavyHail";

  return {
    temp: Math.round(current.temperature_2m),
    condition,
    iconCode: finalIconCode,
    location: "weather.shanghai",
    humidity: current.relative_humidity_2m,
    windSpeed: Math.round(current.wind_speed_10m),
    feelsLike: Math.round(current.apparent_temperature),
    isDay: isDay,
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
