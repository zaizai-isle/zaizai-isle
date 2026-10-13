"use client";

import { useEffect } from "react";
import { scheduleIdle } from "@/lib/utils/schedule-idle";

type AnalyticsWindow = Window & {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
};

export function IdleGoogleAnalytics({ gaId }: { gaId: string }) {
  useEffect(() => {
    let loaded = false;
    const load = () => {
      if (loaded) return;
      loaded = true;
      const analyticsWindow = window as AnalyticsWindow;
      analyticsWindow.dataLayer ||= [];
      analyticsWindow.gtag = (...args: unknown[]) => analyticsWindow.dataLayer?.push(args);
      analyticsWindow.gtag("js", new Date());
      analyticsWindow.gtag("config", gaId);

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
      document.head.appendChild(script);
    };

    const cancelIdle = scheduleIdle(load, 5000);
    const options = { once: true, passive: true } as const;
    window.addEventListener("pointerdown", load, options);
    window.addEventListener("keydown", load, { once: true });
    return () => {
      cancelIdle();
      window.removeEventListener("pointerdown", load);
      window.removeEventListener("keydown", load);
    };
  }, [gaId]);

  return null;
}
