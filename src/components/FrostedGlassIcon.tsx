import Image from "next/image";

interface FrostedGlassIconProps {
  condition: string;
  isDay: boolean;
  className?: string;
  iconCode?: number;
}

const CONDITION_ICON_CODES: Record<string, { day: number; night: number }> = {
  Sunny: { day: 100, night: 150 },
  FewClouds: { day: 102, night: 152 },
  PartlyCloudy: { day: 103, night: 153 },
  Cloudy: { day: 101, night: 151 },
  Overcast: { day: 104, night: 104 },
  Windy: { day: 2528, night: 2528 },
  Mist: { day: 500, night: 500 },
  Foggy: { day: 501, night: 501 },
  Haze: { day: 502, night: 502 },
  Sand: { day: 503, night: 503 },
  Sandstorm: { day: 507, night: 507 },
  HeavySandstorm: { day: 508, night: 508 },
  FreezingFog: { day: 501, night: 501 },
  Drizzle: { day: 309, night: 309 },
  LightDrizzle: { day: 309, night: 309 },
  ModerateDrizzle: { day: 309, night: 309 },
  HeavyDrizzle: { day: 309, night: 309 },
  LightFreezingDrizzle: { day: 313, night: 313 },
  HeavyFreezingDrizzle: { day: 313, night: 313 },
  Rainy: { day: 306, night: 306 },
  LightRain: { day: 305, night: 305 },
  ModerateRain: { day: 306, night: 306 },
  HeavyRain: { day: 307, night: 307 },
  LightFreezingRain: { day: 313, night: 313 },
  HeavyFreezingRain: { day: 313, night: 313 },
  LightShowerRain: { day: 300, night: 350 },
  ModerateShowerRain: { day: 300, night: 350 },
  HeavyShowerRain: { day: 301, night: 351 },
  Thunderstorm: { day: 302, night: 302 },
  ThunderstormWithLightHail: { day: 303, night: 303 },
  ThunderstormWithHeavyHail: { day: 304, night: 304 },
  Snowy: { day: 401, night: 401 },
  LightSnow: { day: 400, night: 400 },
  ModerateSnow: { day: 401, night: 401 },
  HeavySnow: { day: 402, night: 402 },
  SnowGrains: { day: 499, night: 499 },
  LightShowerSnow: { day: 407, night: 457 },
  HeavyShowerSnow: { day: 407, night: 457 },
};

const getPublicAssetPath = (path: string) => {
  if (typeof window === "undefined") return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const basePath = window.location.pathname.startsWith("/zaizai-isle") ? "/zaizai-isle" : "";
  return `${basePath}${normalizedPath}`;
};

const getFallbackIconCode = (condition: string, isDay: boolean) => {
  const iconSet = CONDITION_ICON_CODES[condition] ?? CONDITION_ICON_CODES.Sunny;
  return isDay ? iconSet.day : iconSet.night;
};

export const WeatherDefs = () => null;

export const FrostedGlassIcon = ({
  condition,
  isDay,
  className = "w-12 h-12 -mt-2",
  iconCode,
}: FrostedGlassIconProps) => {
  const resolvedIconCode = iconCode ?? getFallbackIconCode(condition, isDay);

  return (
    <Image
      src={getPublicAssetPath(`/weather-icons/${resolvedIconCode}.svg`)}
      alt=""
      aria-hidden="true"
      width={48}
      height={48}
      unoptimized
      draggable={false}
      className={`${className} object-contain select-none`}
    />
  );
};
