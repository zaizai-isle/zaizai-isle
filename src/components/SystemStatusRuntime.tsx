"use client";

import { useEffect, useRef } from "react";
import { useBackground } from "@/lib/background-context";

export function SystemStatusRuntime() {
  const timeRef = useRef<HTMLSpanElement>(null);
  const { settings } = useBackground();

  useEffect(() => {
    const header = document.getElementById("system-status");
    if (header) header.dataset.textMode = settings.textMode || "dark";
  }, [settings.textMode]);

  useEffect(() => {
    const header = document.getElementById("system-status");
    if (!header) return;
    const update = () => { header.dataset.scrolled = String(window.scrollY > 20); };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    let timer: number | undefined;
    const updateTime = () => {
      if (timeRef.current) timeRef.current.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    };
    const start = () => {
      if (document.visibilityState !== "visible" || timer !== undefined) return;
      updateTime();
      timer = window.setInterval(updateTime, 1000);
    };
    const stop = () => {
      if (timer !== undefined) window.clearInterval(timer);
      timer = undefined;
    };
    const handleVisibility = () => document.visibilityState === "visible" ? start() : stop();
    start();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => { stop(); document.removeEventListener("visibilitychange", handleVisibility); };
  }, []);

  return <span ref={timeRef} className="text-sm font-mono font-bold tracking-[0.15em] tabular-nums opacity-90" />;
}
