"use client";

import { useBackground } from "@/lib/background-context";
import { useEffect } from "react";

export function BackgroundWrapper() {
  const { settings } = useBackground();

  useEffect(() => {
    document.body.dataset.textMode = settings.textMode || "dark";
  }, [settings.textMode]);

  if (settings.type === 'default') {
    return null;
  }

  return (
    <div
      className="isle-fade-in fixed inset-0 -z-50 w-full h-full pointer-events-none"
      style={{
        backgroundColor: settings.type === 'color' ? settings.value : undefined,
        backgroundImage: settings.type === 'image' ? `url(${settings.value})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
}
