"use client";

import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";
import { ArrowUpRight, X, ExternalLink } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

import projectBanana from "@/assets/project-banana-v3.jpg";
import projectExam from "@/assets/project-exam.jpg";
import projectAiTrainer from "@/assets/project-ai-trainer.jpg";

export function WorksCard() {
  // Updated to use imported images for reliable path resolution
  const { t } = useLanguage();
  const [previewProject, setPreviewProject] = useState<{
    title: string;
    image: string | StaticImageData;
    link: string;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <BentoCard 
        colSpan={2} 
        rowSpan={1} 
        className="h-full justify-between group relative overflow-hidden"
        borderGradient={VERTICAL_BORDER_GRADIENT}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-transparent opacity-50" />
        
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex justify-between items-start gap-5">
             <div className="flex-1 min-w-0">
               <h3 className="text-[18px] font-bold text-gray-900 truncate">{t('page.works.title')}</h3>
               <p className="text-sm text-gray-500 mt-1 truncate">
                 {t('page.works.desc')}
               </p>
             </div>
             <div className="p-2 bg-black text-white rounded-full group-hover:scale-110 transition-transform shrink-0">
               <ArrowUpRight className="w-5 h-5" />
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
             {/* Mini project previews or tags */}
             <div 
                onClick={() => setPreviewProject({
                  title: "Everything is Banana",
                  image: projectBanana,
                  link: "https://app-7s7fn2uu96o1.appmiaoda.com"
                })}
                className="aspect-[3/2] w-full bg-gray-100 rounded-lg border border-gray-200 relative overflow-hidden group/item cursor-pointer"
              >
                <Image 
                  src={projectBanana} 
                  alt="Everything is Banana" 
                  fill 
                  className="object-cover transition-transform duration-300 group-hover/item:scale-105"
                  placeholder="blur"
                />
              </div>
             
             {/* Exam Platform with Preview */}
             <div 
               onClick={() => setPreviewProject({
                  title: "Smart Exam Platform",
                  image: projectExam,
                  link: "https://app-7vpd7214bjlt.appmiaoda.com"
               })}
               className="aspect-[3/2] w-full bg-gray-100 rounded-lg border border-gray-200 relative overflow-hidden group/item cursor-pointer"
             >
               <Image 
                 src={projectExam} 
                 alt="Smart Exam Platform" 
                 fill 
                 className="object-cover transition-transform duration-300 group-hover/item:scale-105"
                 placeholder="blur"
               />
             </div>
             
             {/* AI Trainer with Preview */}
             <div 
               onClick={() => setPreviewProject({
                  title: "AI Trainer Assistant",
                  image: projectAiTrainer,
                  link: "https://www.doubao.com/code/launch/detail/66403617282?from=from_launch_share_link"
               })}
               className="aspect-[3/2] w-full bg-gray-100 rounded-lg border border-gray-200 relative overflow-hidden group/item cursor-pointer"
             >
               <Image 
                 src={projectAiTrainer} 
                 alt="AI Trainer Assistant" 
                 fill 
                 className="object-cover transition-transform duration-300 group-hover/item:scale-105"
                 placeholder="blur"
               />
             </div>
          </div>
        </div>
      </BentoCard>

      {/* Full Screen Preview Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {previewProject && (
            <motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
            >
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => setPreviewProject(null)}
              />
              
              {/* Content Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh] z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0">
                  <h4 className="font-bold text-xl text-gray-900">{previewProject.title}</h4>
                  <button 
                    onClick={() => setPreviewProject(null)}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="relative flex-1 w-full bg-gray-50 overflow-hidden">
                  <Image 
                    src={previewProject.image}
                    alt={previewProject.title}
                    fill 
                    className="object-contain p-4"
                  />
                </div>

                <div className="p-4 border-t border-gray-100 bg-white shrink-0">
                  <Link 
                    href={previewProject.link}
                    target="_blank"
                    className="w-full py-3 bg-black text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-[0.98] shadow-lg"
                  >
                    <span>Visit Website</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}