"use client";

import { useBackground } from "@/lib/background-context";
import { motion, AnimatePresence } from "framer-motion";

export function BackgroundWrapper() {
  const { settings } = useBackground();

  if (settings.type === 'default') {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 -z-50 w-full h-full pointer-events-none"
        style={{
          backgroundColor: settings.type === 'color' ? settings.value : undefined,
          backgroundImage: settings.type === 'image' ? `url(${settings.value})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
    </AnimatePresence>
  );
}
