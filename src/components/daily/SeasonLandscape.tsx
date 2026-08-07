import Image, { type StaticImageData } from "next/image";
import autumnOilPainting from "@/assets/daily-season-autumn-oil-v2.jpg";
import springOilPainting from "@/assets/daily-season-spring-oil-v2.jpg";
import summerOilPainting from "@/assets/daily-season-summer-oil-v2.jpg";
import winterOilPainting from "@/assets/daily-season-winter-oil-v2.jpg";
import { cn } from "@/lib/utils";
import type { DailySeason } from "@/lib/daily-notes";

interface SeasonLandscapeProps {
  season: DailySeason;
  className?: string;
}

const landscapeLabels: Record<DailySeason, string> = {
  spring: "厚涂油画风格的粉紫月夜与郁金香",
  summer: "厚涂油画风格的晴空、湖水与睡莲",
  autumn: "厚涂油画风格的晚霞、山谷与金色原野",
  winter: "厚涂油画风格的月色、雪山与林间木屋",
};

const landscapeImages: Record<DailySeason, StaticImageData> = {
  spring: springOilPainting,
  summer: summerOilPainting,
  autumn: autumnOilPainting,
  winter: winterOilPainting,
};

export function SeasonLandscape({ season, className }: SeasonLandscapeProps) {
  return (
    <span
      className={cn("relative block overflow-hidden rounded-full bg-[var(--daily-surface-soft)]", className)}
      role="img"
      aria-label={landscapeLabels[season]}
    >
      <Image
        src={landscapeImages[season]}
        alt=""
        aria-hidden="true"
        fill
        sizes="(min-width: 640px) 208px, 96px"
        className="object-cover"
      />
    </span>
  );
}
