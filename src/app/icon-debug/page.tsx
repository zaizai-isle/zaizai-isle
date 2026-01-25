import fs from 'fs';
import path from 'path';

type WeatherCondition = {
  label: string;
  items: { code: number; isNight?: boolean }[];
};

const weatherConditions: WeatherCondition[] = [
  { label: "晴", items: [{ code: 100 }, { code: 150, isNight: true }] },
  { label: "多云", items: [{ code: 101 }, { code: 151, isNight: true }] },
  { label: "少云", items: [{ code: 102 }, { code: 152, isNight: true }] },
  { label: "晴间多云", items: [{ code: 103 }, { code: 153, isNight: true }] },
  { label: "阴", items: [{ code: 104 }] },
  { label: "阵雨", items: [{ code: 300 }, { code: 350, isNight: true }] },
  { label: "强阵雨", items: [{ code: 301 }, { code: 351, isNight: true }] },
  { label: "雷阵雨", items: [{ code: 302 }] },
  { label: "强雷阵雨", items: [{ code: 303 }] },
  { label: "雷阵雨伴有冰雹", items: [{ code: 304 }] },
  { label: "小雨", items: [{ code: 305 }] },
  { label: "中雨", items: [{ code: 306 }] },
  { label: "大雨", items: [{ code: 307 }] },
  { label: "极端降雨", items: [{ code: 308 }] },
  { label: "毛毛雨/细雨", items: [{ code: 309 }] },
  { label: "暴雨", items: [{ code: 310 }] },
  { label: "大暴雨", items: [{ code: 311 }] },
  { label: "特大暴雨", items: [{ code: 312 }] },
  { label: "冻雨", items: [{ code: 313 }] },
  { label: "小到中雨", items: [{ code: 314 }] },
  { label: "中到大雨", items: [{ code: 315 }] },
  { label: "大到暴雨", items: [{ code: 316 }] },
  { label: "暴雨到大暴雨", items: [{ code: 317 }] },
  { label: "大暴雨到特大暴雨", items: [{ code: 318 }] },
  { label: "雨", items: [{ code: 399 }] },
  { label: "小雪", items: [{ code: 400 }] },
  { label: "中雪", items: [{ code: 401 }] },
  { label: "大雪", items: [{ code: 402 }] },
  { label: "暴雪", items: [{ code: 403 }] },
  { label: "雨夹雪", items: [{ code: 404 }] },
  { label: "雨雪天气", items: [{ code: 405 }] },
  { label: "阵雨夹雪", items: [{ code: 406 }, { code: 456, isNight: true }] },
  { label: "阵雪", items: [{ code: 407 }, { code: 457, isNight: true }] },
  { label: "小到中雪", items: [{ code: 408 }] },
  { label: "中到大雪", items: [{ code: 409 }] },
  { label: "大到暴雪", items: [{ code: 410 }] },
  { label: "雪", items: [{ code: 499 }] },
  { label: "薄雾", items: [{ code: 500 }] },
  { label: "雾", items: [{ code: 501 }] },
  { label: "霾", items: [{ code: 502 }] },
  { label: "扬沙", items: [{ code: 503 }] },
  { label: "浮尘", items: [{ code: 504 }] },
  { label: "沙尘暴", items: [{ code: 507 }] },
  { label: "强沙尘暴", items: [{ code: 508 }] },
  { label: "浓雾", items: [{ code: 509 }] },
  { label: "强浓雾", items: [{ code: 510 }] },
  { label: "中度霾", items: [{ code: 511 }] },
  { label: "重度霾", items: [{ code: 512 }] },
  { label: "严重霾", items: [{ code: 513 }] },
  { label: "大雾", items: [{ code: 514 }] },
  { label: "特强浓雾", items: [{ code: 515 }] },
];

function getIconSvg(code: number, type: 'original' | 'processed') {
  if (type === 'processed') {
    const filePath = path.join(process.cwd(), 'src/assets/weather-icons', `${code}.svg`);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
  } else {
    const originalDir = path.join(process.cwd(), 'node_modules/qweather-icons/icons');
    if (code < 800 || code > 899) {
        if (fs.existsSync(path.join(originalDir, `${code}-fill.svg`))) {
            return fs.readFileSync(path.join(originalDir, `${code}-fill.svg`), 'utf-8');
        }
    }
    if (fs.existsSync(path.join(originalDir, `${code}.svg`))) {
        return fs.readFileSync(path.join(originalDir, `${code}.svg`), 'utf-8');
    }
  }
  
  return null;
}

function mapCodeToCondition(code: number): string {
  if (code === 100 || code === 150) return 'Sunny';
  if ((code >= 101 && code <= 104) || (code >= 151 && code <= 153)) return 'Cloudy';
  
  // Rain
  if (code >= 300 && code <= 399) {
    if ([302, 303, 304].includes(code)) return 'Thunderstorm';
    if ([309, 313].includes(code)) return 'Drizzle';
    return 'Rainy';
  }
  
  // Snow
  if (code >= 400 && code <= 499) return 'Snowy';
  
  // Fog/Sand
  if (code >= 500 && code <= 515) return 'Foggy';
  
  return 'Sunny'; // Default fallback
}

function getBackgroundClass(condition: string, isDay: boolean) {
  // Apple Weather-inspired Gradients (Soft & Glassy)
  // Note: Using slightly more opaque versions for the gallery to pop against the dark background
  if (condition === 'Sunny') {
    return isDay 
      ? "bg-gradient-to-b from-[#2980B9] to-[#6DD5FA]" // Bright Blue Sky
      : "bg-gradient-to-b from-[#0F2027] via-[#203A43] to-[#2C5364]"; // Deep Night
  } else if (condition === 'Rainy' || condition === 'Drizzle' || condition === 'Thunderstorm') {
    return isDay
      ? "bg-gradient-to-b from-[#373B44] to-[#4286f4]" // Stormy Blue-Grey
      : "bg-gradient-to-b from-[#232526] to-[#414345]"; // Dark Storm
  } else if (condition === 'Snowy') {
    return isDay
      ? "bg-gradient-to-b from-[#83a4d4] to-[#b6fbff]" // Icy Blue
      : "bg-gradient-to-b from-[#141E30] to-[#243B55]"; // Dark Ice
  } else if (condition === 'Foggy' || condition === 'Cloudy') {
    return isDay
      ? "bg-gradient-to-b from-[#5D6D7E] to-[#BFC9CA]" // Cloudy Grey
      : "bg-gradient-to-b from-[#232526] to-[#414345]"; // Night Cloud
  } else if (condition === 'Windy') {
    return isDay
      ? "bg-gradient-to-b from-[#485563] to-[#29323c]" // Windy Grey
      : "bg-gradient-to-b from-[#232526] to-[#414345]"; // Night Wind
  } else {
    // Default
    return isDay
      ? "bg-gradient-to-b from-[#4facfe] to-[#00f2fe]"
      : "bg-gradient-to-b from-[#0f172a] to-[#334155]";
  }
}

export default function IconDebugPage() {
  const allIcons = weatherConditions.flatMap(condition => 
    condition.items.map(item => ({
      ...item,
      label: condition.label
    }))
  );

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Weather Card & Icon Preview</h1>
          <p className="text-gray-500">Total: {allIcons.length} Variants • Dynamic Backgrounds • Frosted Glass Icons</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {allIcons.map((icon) => {
            const processedSvg = getIconSvg(icon.code, 'processed');
            const condition = mapCodeToCondition(icon.code);
            const isDay = !icon.isNight;
            const bgClass = getBackgroundClass(condition, isDay);
            
            return (
              <div 
                key={icon.code} 
                className={`
                  relative h-64 rounded-[32px] overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-blue-500/20
                  ${bgClass}
                `}
              >
                {/* Ambient Glow / Noise Overlay */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none mix-blend-overlay" />
                <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />

                <div className="flex flex-col items-center justify-between h-full p-6 relative z-10">
                    
                    {/* Top Status */}
                    <div className="w-full flex justify-between items-start">
                        <span className="text-white/60 text-[10px] font-mono tracking-widest uppercase">
                          {isDay ? 'DAY' : 'NIGHT'}
                        </span>
                        <span className="text-white/40 text-[10px] font-mono">
                           #{icon.code}
                        </span>
                    </div>

                    {/* Main Icon */}
                    <div className="flex-1 flex items-center justify-center w-full">
                        <div 
                          className="w-24 h-24 -mt-6 text-white filter drop-shadow-xl transform transition-transform hover:rotate-3 hover:scale-110 duration-500 [&>svg]:w-full [&>svg]:h-full [&>svg]:overflow-visible"
                          dangerouslySetInnerHTML={{ __html: processedSvg || '' }} 
                        />
                    </div>
                    
                    {/* Bottom Label Pill */}
                    <div className="w-full">
                       <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2 text-center shadow-lg">
                          <span className="text-white font-medium text-sm tracking-wide block">
                             {icon.label}
                          </span>
                          <span className="text-white/50 text-[10px] uppercase tracking-wider block mt-0.5">
                             {condition}
                          </span>
                       </div>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
