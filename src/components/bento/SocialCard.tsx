"use client";

import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { Mail, Github, MessageCircle, X, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import qrcodeImage from "@/assets/qrcode.jpg";
import { trackEvent } from "@/lib/utils";

export function SocialCard() {
  const { t } = useLanguage();
  const [showQRCode, setShowQRCode] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showLikeToast, setShowLikeToast] = useState(false);
  const [likes, setLikes] = useState(12);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [flyingHearts, setFlyingHearts] = useState<{ id: number, x: number, y: number, scale: number, rotate: number }[]>([]);

  useEffect(() => {
    let alive = true;
    try {
      const saved = localStorage.getItem('portfolio_has_liked');
      if (saved && alive) {
        setTimeout(() => setHasLiked(true), 0);
      }
    } catch { }
    return () => {
      alive = false;
    };
  }, []);

  const handleEmailClick = () => {
    setShowEmail(true);
    // Auto hide after 3 seconds
    setTimeout(() => setShowEmail(false), 3000);
    // Copy to clipboard
    navigator.clipboard.writeText("zaizaiely@gmail.com"); // Replace with actual email
    trackEvent('copy_email');
  };

  const handleGitHubClick = () => {
    trackEvent('view_github');
    window.open("https://github.com/zaizai-isle"); // Replace with actual GitHub URL
  };

  const handleWeChatClick = () => {
    trackEvent('view_wechat_qr');
    setShowQRCode(true);
  };



  const triggerHeartAnimation = () => {
    // Generate flying hearts
    const hearts = Array.from({ length: 15 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 100, // Random horizontal spread
      y: -50 - Math.random() * 100,   // Random upward distance
      scale: 0.5 + Math.random() * 0.8, // Random size
      rotate: (Math.random() - 0.5) * 90 // Random rotation
    }));
    setFlyingHearts(prev => [...prev, ...hearts]);

    // Cleanup
    setTimeout(() => {
      setFlyingHearts(prev => prev.filter(h => !hearts.find(newH => newH.id === h.id)));
    }, 2000);
  };

  const handleLikeClick = () => {
    if (!hasLiked) {
      setLikes(prev => prev + 1);
      setHasLiked(true);
      localStorage.setItem('portfolio_has_liked', 'true');
      triggerHeartAnimation();
      trackEvent('like_portfolio', { value: likes + 1 });

      // Show toast
      setShowLikeToast(true);
      setTimeout(() => setShowLikeToast(false), 3000);
    }
  };

  const handleMouseEnter = () => {
    if (hasLiked) {
      triggerHeartAnimation();
    }
  };

  return (
    <BentoCard
      colSpan={2}
      rowSpan={1}
      theme="glass"
      className="h-full justify-center items-center relative"
      borderGradient={VERTICAL_BORDER_GRADIENT}
    >
      <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-4">
        {/* WeChat */}
        <button
          onClick={handleWeChatClick}
          className="flex flex-col items-center justify-center gap-1 transition-transform active:scale-95 w-full h-full rounded-full group hover:scale-105"
          title={t('social.wechat')}
        >
          <div className="w-16 h-16 aspect-square flex-shrink-0 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-gray-800 group-hover:bg-white/40 transition-colors">
            <MessageCircle className="w-7 h-7" />
          </div>
        </button>

        {/* Email */}
        <button
          onClick={handleEmailClick}
          className="flex flex-col items-center justify-center gap-1 transition-transform active:scale-95 w-full h-full rounded-full group hover:scale-105 relative"
          title={t('social.email')}
        >
          <div className="w-16 h-16 aspect-square flex-shrink-0 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-gray-800 group-hover:bg-white/40 transition-colors">
            <Mail className="w-7 h-7" />
          </div>
          <AnimatePresence>
            {showEmail && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full whitespace-nowrap z-60"
              >
                {t('social.email.copied')}
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* GitHub */}
        <button
          onClick={handleGitHubClick}
          className="flex flex-col items-center justify-center gap-1 transition-transform active:scale-95 w-full h-full rounded-full group hover:scale-105"
          title={t('social.github')}
        >
          <div className="w-16 h-16 aspect-square flex-shrink-0 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-gray-800 group-hover:bg-white/40 transition-colors">
            <Github className="w-7 h-7" />
          </div>
        </button>

        {/* Like Button */}
        <button
          onClick={handleLikeClick}
          onMouseEnter={handleMouseEnter}
          className={`flex flex-col items-center justify-center gap-1 transition-transform active:scale-95 w-full h-full rounded-full relative ${hasLiked ? 'cursor-default' : 'hover:scale-105'}`}
        >
          <div className={`relative w-16 h-16 aspect-square flex-shrink-0 flex items-center justify-center rounded-full transition-colors backdrop-blur-md border border-white/20 ${hasLiked ? 'bg-red-50/40 text-red-500 border-red-100/80' : 'bg-white/20 text-gray-400 hover:bg-white/40 hover:text-red-400'}`}>
            <Heart className={`w-8 h-8 translate-x-[1px] translate-y-[1px] ${hasLiked ? 'fill-current' : ''}`} />
            <AnimatePresence>
              {flyingHearts.map(heart => (
                <motion.div
                  key={heart.id}
                  initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
                  animate={{
                    opacity: 0,
                    x: heart.x,
                    y: heart.y,
                    scale: heart.scale,
                    rotate: heart.rotate
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute pointer-events-none"
                >
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {showLikeToast && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50"
              >
                {t('social.like.thanks')}
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* WeChat QR Code Modal */}
      <AnimatePresence>
        {showQRCode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute inset-0 z-50 backdrop-blur-md flex flex-col items-center justify-center p-5 rounded-3xl"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowQRCode(false);
              }}
              className="absolute top-1 right-1 p-1.5 text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="bg-white p-2 rounded-2xl shadow-lg">
              <Image
                src={qrcodeImage}
                alt="WeChat QR Code"
                width={132}
                height={132}
                className="object-contain"
                placeholder="blur"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </BentoCard>
  );
}
