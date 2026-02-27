"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useBackground } from "@/lib/background-context";
import { useLanguage } from "@/lib/language-context";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Check, ImagePlus, Plus, SwatchBook } from "lucide-react";
import { GlassButton } from "./GlassButton";

const CustomScrollArea = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startScrollTop, setStartScrollTop] = useState(0);

  const updateThumb = useCallback(() => {
    if (!contentRef.current) return;
    const { clientHeight, scrollHeight, scrollTop } = contentRef.current;

    if (scrollHeight <= clientHeight) {
      setThumbHeight(0);
      return;
    }

    const heightRatio = clientHeight / scrollHeight;
    const height = Math.max(heightRatio * clientHeight, 20); // Min height 20px
    setThumbHeight(height);

    const maxScrollTop = scrollHeight - clientHeight;
    const maxThumbTop = clientHeight - height;

    // Avoid division by zero
    if (maxScrollTop === 0) {
      setThumbTop(0);
    } else {
      setThumbTop((scrollTop / maxScrollTop) * maxThumbTop);
    }
  }, []);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const observer = new ResizeObserver(() => {
      updateThumb();
    });

    observer.observe(element);
    element.addEventListener('scroll', updateThumb);
    window.addEventListener('resize', updateThumb);

    // Initial update (defer to avoid synchronous state updates during effect)
    setTimeout(() => {
      updateThumb();
    }, 0);

    return () => {
      observer.disconnect();
      element.removeEventListener('scroll', updateThumb);
      window.removeEventListener('resize', updateThumb);
    };
  }, [updateThumb]);

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!contentRef.current) return;
    setIsDragging(true);
    setStartY(e.clientY);
    setStartScrollTop(contentRef.current.scrollTop);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!contentRef.current) return;

      const { clientHeight, scrollHeight } = contentRef.current;
      const maxScrollTop = scrollHeight - clientHeight;
      const maxThumbTop = clientHeight - thumbHeight;

      if (maxThumbTop === 0) return;

      const deltaY = e.clientY - startY;
      const deltaScroll = (deltaY / maxThumbTop) * maxScrollTop;

      contentRef.current.scrollTop = startScrollTop + deltaScroll;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startY, startScrollTop, thumbHeight]);

  return (
    <div className={cn("relative group", className)}>
      <div
        ref={contentRef}
        className="h-full w-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {children}
      </div>

      {/* Scrollbar Track & Thumb */}
      {thumbHeight > 0 && (
        <div className={cn(
          "absolute top-0 right-[-16px] h-full w-[4px] transition-opacity duration-300 bg-transparent",
          isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          <div
            className={cn(
              "w-full rounded-full cursor-pointer transition-colors",
              isDragging ? "bg-gray-400" : "bg-gray-300 hover:bg-gray-400"
            )}
            style={{
              height: `${thumbHeight}px`,
              transform: `translateY(${thumbTop}px)`
            }}
            onMouseDown={handleDragStart}
          />
        </div>
      )}
    </div>
  );
};

const PRESET_COLORS = [
  "#000000", // Black
  "#5d6bc4", // Periwinkle
  "#00a3c4", // Cyan
  "#e8707c", // Rose
  "#4466e2", // Blue
  "#ffd4c2", // Peach
  "#f3d8c1", // Beige
  "#d8a656", // Gold
  "#d24b8e", // Magenta
  "#e63e26", // Orange Red
  "#f6d2cf", // Pale Pink
  "#e6e7e9", // Light Gray
  "#fde8ea", // Very Pale Pink
  "#76787c", // Dark Gray
  "#bdc0c4", // Silver
  "#4a4c50", // Dark Charcoal
  "#007873", // Teal
  "#6bc4a5", // Mint
  "#fdb913", // Yellow
];

const PRESET_IMAGES = [
  "https://images.unsplash.com/photo-1738430275628-3e23fbe995b5?q=80&w=3870&auto=format&fit=crop#light-bg",  // Deep vibe
  "https://images.unsplash.com/photo-1624801529902-43193947c41a?q=80&w=3874&auto=format&fit=crop#light-bg", // Bright
  "https://images.unsplash.com/photo-1704513815017-9e637d33149f?q=80&w=3870&auto=format&fit=crop#light-bg",  //
  "https://images.unsplash.com/photo-1768300835487-f4711bf749de?q=80&w=3871&auto=format&fit=crop#light-bg", // Daylight
  "https://images.unsplash.com/photo-1507295386538-ddd5e86cd597?q=80&w=3732&auto=format&fit=crop#light-bg", // Daylight
  "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?q=80&w=3008&auto=format&fit=crop#light-bg", // Bright
  "https://images.unsplash.com/photo-1728525950004-753aded36b04?q=80&w=3773&auto=format&fit=crop#dark-bg", // Light
  "https://images.unsplash.com/photo-1644515172713-f340282f2ab1?q=80&w=3870&auto=format&fit=crop#dark-bg",  // 
  "https://images.unsplash.com/photo-1576262040338-fdbe208fa9c6?q=80&w=3869&auto=format&fit=crop#light-bg",  // 
  "https://images.unsplash.com/photo-1566830646085-d84daacdf482?q=80&w=3870&auto=format&fit=crop#light-bg", // Daylight
  "https://images.unsplash.com/photo-1608458319972-eb0c3a00d752?q=80&w=3774&auto=format&fit=crop#light-bg", // Light
];

import { cn, trackEvent } from "@/lib/utils";

export function BackgroundController({ className }: { className?: string }) {
  const { settings, setBackground, resetBackground } = useBackground();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleColorSelect = (color: string) => {
    setBackground('color', color);
    trackEvent('select_background_color', { color });
  };

  const handleImageSelect = (imageUrl: string) => {
    setBackground('image', imageUrl);
    trackEvent('select_background_image', { type: 'preset' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setBackground('image', result);
        trackEvent('upload_background_image');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    resetBackground();
    trackEvent('reset_background');
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <GlassButton
        className={className}
        active={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        title={t('bg.settings')}
        style={{ rotate: isOpen ? 90 : 0 }}
      >
        <SwatchBook className="w-4 h-4" />
      </GlassButton>

      {/* Settings Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 right-6 z-50 w-[360px] bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-5 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <SwatchBook className="w-4 h-4" />
                {t('bg.settings')}
              </h3>
            </div>

            {/* Content */}
            <CustomScrollArea className="h-[420px]">
              <div className="space-y-6">
                {/* Images Section */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 ml-1">{t('bg.image')}</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Upload Button */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full aspect-[3/2] rounded-lg bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center text-gray-400 cursor-pointer transition-colors group border border-gray-100"
                      title={t('bg.upload')}
                    >
                      <ImagePlus className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-medium">{t('bg.upload')}...</span>
                    </div>

                    {PRESET_IMAGES.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => handleImageSelect(img)}
                        className="w-full aspect-[3/2] rounded-lg overflow-hidden border border-gray-200 relative transition-transform hover:scale-105"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Preset ${index + 1}`} className="w-full h-full object-cover" />
                        {settings.type === 'image' && settings.value === img && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {settings.type === 'image' && !PRESET_IMAGES.includes(settings.value) && (
                    <div className="mt-2 relative rounded-lg overflow-hidden h-24 border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={settings.value}
                        alt="Current background"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">Current Custom</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Colors Section */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 ml-1">{t('bg.color')}</h4>
                  <div className="grid grid-cols-6 gap-2">
                    {/* Reset Button */}
                    <button
                      onClick={handleReset}
                      className="w-full aspect-square rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors border border-gray-100"
                      title={t('bg.reset')}
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>

                    {/* Custom Color Button */}
                    <div className="relative w-full aspect-square rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors overflow-hidden cursor-pointer border border-gray-100">
                      <Plus className="w-5 h-5 pointer-events-none" />
                      <input
                        type="color"
                        value={settings.type === 'color' ? settings.value : '#ffffff'}
                        onChange={(e) => handleColorSelect(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Custom Color"
                      />
                    </div>

                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorSelect(color)}
                        className="w-full aspect-square rounded-full border border-gray-200 relative transition-transform hover:scale-105"
                        style={{ backgroundColor: color }}
                      >
                        {settings.type === 'color' && settings.value === color && (
                          <Check className={`w-4 h-4 absolute inset-0 m-auto ${['#ffffff', '#f3d8c1', '#f6d2cf', '#e6e7e9', '#fde8ea', '#ffd4c2', '#bdc0c4', '#6bc4a5', '#fdb913'].includes(color) ? 'text-black' : 'text-white'
                            }`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CustomScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
