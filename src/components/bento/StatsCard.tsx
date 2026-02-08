"use client";

import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";
import { ArrowUpRight } from "lucide-react";
import { motion, useSpring, useTransform, useMotionValue, animate } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { toPng } from 'html-to-image';
import { useLanguage } from "@/lib/language-context";
import { supabase } from "@/lib/supabase";

function Counter({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, { duration: 2, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

export function StatsCard() {
  const { t } = useLanguage();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadCount, setDownloadCount] = useState(12045);
  const [visitorCount, setVisitorCount] = useState(532);
  const hasIncrementedVisitor = useRef(false);

  useEffect(() => {
    // Initial fetch from Supabase (or fallback to default)
    const fetchStats = async () => {
      const client = supabase;
      if (client) {
        try {
          // Fetch downloads and visitors
          const { data, error } = await client
            .from('stats')
            .select('downloads, visitors')
            .single();

          if (data) {
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
        } catch (err) {
          console.warn('Failed to fetch stats:', err);
        }
      }
    };
    fetchStats();
  }, []);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    // Increment local count immediately for better UX
    setDownloadCount(prev => prev + 1);

    // Update Supabase
    const client = supabase;
    if (client) {
      // Using rpc for atomic increment is better, but simple update for now
      // Assuming there's a 'stats' table with a single row where id=1
      await client.rpc('increment_downloads');
    }

    try {
      // Target the hidden SharePoster element instead of the main container
      const element = document.getElementById('share-poster');
      if (element) {
        // Add a small delay to ensure styles are stable
        await new Promise(resolve => setTimeout(resolve, 100));

        const dataUrl = await toPng(element, {
          cacheBust: true,
          pixelRatio: 2, // 2x resolution for high quality
          // No need for extra padding or background color as the poster handles it
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
      }
    } catch (err) {
      console.error('Failed to download image', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <BentoCard
      onClick={handleDownload}
      colSpan={1}
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
            <div className="text-2xl md:text-3xl text-white/90 font-bold mt-0.5 flex items-baseline leading-none">
              <Counter value={visitorCount} />
              <span className="text-xs font-normal text-white/40 ml-1">+</span>
            </div>
          </div>
        </div>

        {/* Downloads */}
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-white/40">
              {t('stats.downloads')}
            </p>
            <div className="text-2xl md:text-3xl text-white/90 font-bold mt-0.5 flex items-baseline leading-none">
              <Counter value={downloadCount} />
              <span className="text-xs font-normal text-white/40 ml-1">+</span>
            </div>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
