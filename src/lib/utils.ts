import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { sendGAEvent } from "@next/third-parties/google"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function trackEvent(event: string, value?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[GA] Track Event: ${event}`, value ? `Value: ${JSON.stringify(value)}` : '');
  }
  sendGAEvent({ event, value });
}
