"use client";

import { BentoCard } from "./BentoCard";
import { ArrowUpRight, Download, Loader2 } from "lucide-react";
import { motion, useSpring, useTransform, useMotionValue, animate } from "framer-motion";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    // Initial fetch from Supabase (or fallback to default)
    const fetchCount = async () => {
      const client = supabase;
      if (client) {
        const { data, error } = await client
          .from('stats')
          .select('downloads')
          .single();
        
        if (data) {
          setDownloadCount(Math.max(12045, data.downloads));
        }
      }
    };
    fetchCount();
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
      const element = document.getElementById('portfolio-container');
      if (element) {
        // Add a small delay to ensure styles are stable
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const width = element.offsetWidth;
        const height = element.offsetHeight;
        const padding = 40;

        const dataUrl = await toPng(element, { 
          cacheBust: true,
          backgroundColor: '#f3f4f6', // Use light gray background instead of #e0e5ec
          width: width + padding * 2,
          height: height + padding * 2,
          style: {
            margin: `${padding}px`,
          }
        });
        
        const link = document.createElement('a');
        link.download = `zaizai-portfolio-${new Date().toISOString().split('T')[0]}.png`;
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
      className="h-full cursor-pointer justify-between bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] backdrop-blur-xl text-white group shadow-lg hover:from-[#333333] hover:to-[#222222] transition-all p-4 md:p-5"
      borderGradient="linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.05) 70%, rgba(255,255,255,0.3) 100%)"
    >
      <div className="flex justify-between items-start relative z-10">
        <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
          {isDownloading ? (
            <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
          ) : (
            <Download className="w-5 h-5 text-gray-300" />
          )}
        </div>
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 text-xs text-white/90 font-medium px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-full border border-white/10 shadow-xl z-50 pointer-events-none">
          {t('stats.click_to_download')}
        </div>
      </div>
      
      <div>
        <div className="text-3xl md:text-4xl font-bold mb-1 flex items-baseline">
          <Counter value={downloadCount} />
          <span className="text-sm font-normal text-gray-400 ml-1">+</span>
        </div>
        <p className="text-sm text-gray-400 font-medium">{t('stats.downloads')}</p>
      </div>
    </BentoCard>
  );
}
