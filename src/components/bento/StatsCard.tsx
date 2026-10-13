"use client";

import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { getSupabaseClient } from "@/lib/supabase";
import { scheduleIdle } from "@/lib/utils/schedule-idle";

const LazySharePoster = lazy(() =>
  import("@/components/SharePoster").then((mod) => ({ default: mod.SharePoster }))
);

function AnimatedNumber({ value }: { value: number }) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const displayedValue = useRef(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.textContent = String(value);
      displayedValue.current = value;
      return;
    }

    const from = displayedValue.current;
    const distance = value - from;
    const startedAt = performance.now();
    const duration = 900;
    let frame = 0;

    const update = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = Math.round(from + distance * eased);
      element.textContent = String(nextValue);
      displayedValue.current = nextValue;

      if (progress < 1) frame = window.requestAnimationFrame(update);
    };

    frame = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(frame);
  }, [value]);

  return <span ref={elementRef} aria-label={String(value)}>{value}</span>;
}

export function StatsCard() {
  const { t } = useLanguage();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadCount, setDownloadCount] = useState(12045);
  const [visitorCount, setVisitorCount] = useState(532);
  const hasIncrementedVisitor = useRef(false);
  const exportInProgress = useRef(false);

  useEffect(() => {
    let active = true;

    // Initial fetch from Supabase (or fallback to default)
    const fetchStats = async () => {
      try {
        const client = await getSupabaseClient();
        if (!active) return;
        if (client) {
          // Fetch downloads and visitors
          const { data, error } = await client
            .from('stats')
            .select('downloads, visitors')
            .single();

          if (data && active) {
            if (data.downloads) setDownloadCount(Math.max(12045, data.downloads));
            if (data.visitors) setVisitorCount(Math.max(532, data.visitors));
          }

          // Increment visitor count (once per session/mount)
          if (!hasIncrementedVisitor.current && !error) {
            hasIncrementedVisitor.current = true;
            setVisitorCount(prev => prev + 1);

            // Try RPC first, fallback to update
            const { error: rpcError } = await client.rpc('increment_visitors');
            if (rpcError) {
              // Fallback: manual update
              // Note: This is less safe for concurrency but works for simple cases
              if (data && !error) {
                await client.from('stats').update({ visitors: (data.visitors || 532) + 1 }).eq('id', 1);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch stats:', err);
      }
    };
    const cancelIdle = scheduleIdle(() => void fetchStats(), 2000);
    return () => {
      active = false;
      cancelIdle();
    };
  }, []);

  const exportSharePoster = useCallback(async () => {
    if (exportInProgress.current) return;
    const element = document.getElementById('share-poster');
    if (!element) return;

    exportInProgress.current = true;

    try {
      const images = Array.from(element.querySelectorAll('img'));
      const waitForImage = (image: HTMLImageElement) => {
        if (image.complete) return image.decode().catch(() => undefined);
        return new Promise<void>((resolve) => {
          image.addEventListener('load', () => resolve(), { once: true });
          image.addEventListener('error', () => resolve(), { once: true });
        });
      };
      const [{ toPng }] = await Promise.all([
        import('html-to-image'),
        document.fonts.ready,
        Promise.all(images.map(waitForImage)),
      ]);
      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
      });

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hour = String(now.getHours()).padStart(2, '0');
      const minute = String(now.getMinutes()).padStart(2, '0');
      const second = String(now.getSeconds()).padStart(2, '0');
      const timestamp = `${year}${month}${day}${hour}${minute}${second}`;

      const link = document.createElement('a');
      link.download = `Zaizai Isle-Share-${timestamp}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
    } finally {
      exportInProgress.current = false;
      setIsDownloading(false);
    }
  }, []);

  const handleDownload = () => {
    if (isDownloading) return;
    setIsDownloading(true);

    // Increment local count immediately for better UX
    setDownloadCount(prev => prev + 1);

    void getSupabaseClient()
      .then((client) => client?.rpc('increment_downloads'))
      .catch((error) => console.warn('Failed to update download count:', error));
  };

  return (
    <>
      <BentoCard
        onClick={handleDownload}
        colSpan={2}
        rowSpan={1}
        theme="dark"
        className="h-full cursor-pointer justify-center group relative overflow-hidden p-4 md:p-5"
        borderGradient={VERTICAL_BORDER_GRADIENT}
      >
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 text-xs text-white/90 font-medium px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-full border border-white/10 shadow-xl z-50 pointer-events-none">
          {t('stats.click_to_download')}
        </div>

        <div className="flex flex-col gap-6 w-full px-1">
          {/* Visitors */}
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-white/40">
                {t('stats.visitors')}
              </p>
              <div className="text-2xl md:text-3xl text-white/90 font-mono font-bold mt-0.5 flex items-baseline leading-none">
                <AnimatedNumber value={visitorCount} />
                <span className="text-[10px] font-normal text-white/30 ml-1.5 uppercase tracking-tighter">TRC</span>
              </div>
            </div>
          </div>

          {/* Downloads */}
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-white/40">
                {t('stats.downloads')}
              </p>
              <div className="text-2xl md:text-3xl text-white/90 font-mono font-bold mt-0.5 flex items-baseline leading-none">
                <AnimatedNumber value={downloadCount} />
                <span className="text-[10px] font-normal text-white/30 ml-1.5 uppercase tracking-tighter">LOG</span>
              </div>
            </div>
          </div>
        </div>
      </BentoCard>

      {isDownloading ? (
        <div aria-hidden="true" className="fixed left-[-9999px] top-0 pointer-events-none">
          <Suspense fallback={null}>
            <LazySharePoster onReady={exportSharePoster} />
          </Suspense>
        </div>
      ) : null}
    </>
  );
}
