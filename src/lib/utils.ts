import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Add type definition for window.gtag
declare global {
  interface Window {
    gtag: (command: 'event', eventName: string, params?: Record<string, unknown>) => void;
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function trackEvent(event: string, params?: Record<string, unknown>) {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    console.log(`[GA Debug] Event: ${event}`, params);
    return;
  }
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, params);
  } else {
    console.warn('[GA Debug] window.gtag is not defined');
  }
}
