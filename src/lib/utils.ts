import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Add type definition for window.gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function trackEvent(event: string, params?: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[GA Debug] Event: ${event}`, params);
  }
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, params);
  } else if (process.env.NODE_ENV === 'development') {
    console.warn('[GA Debug] window.gtag is not defined');
  }
}
