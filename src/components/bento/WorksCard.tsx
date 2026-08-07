"use client";

import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";
import { ArrowUpRight, ExternalLink, X } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { BentoHeader } from "./BentoCommon";
import {
  BUILT_STRUCTURES,
  getStructureKindKey,
  getStructureStatusKey,
  type BuiltStructure,
} from "./built-structures.config";

const STATUS_STYLES: Record<BuiltStructure["status"], string> = {
  stable: "bg-emerald-950/75 text-emerald-50",
  experimental: "bg-amber-950/75 text-amber-50",
  archived: "bg-slate-800/75 text-slate-100",
};

export function WorksCard() {
  const { t } = useLanguage();
  const [previewProject, setPreviewProject] = useState<BuiltStructure | null>(null);
  const [mounted] = useState<boolean>(() => typeof document !== 'undefined');

  return (
    <>
      <BentoCard
        colSpan={4}
        rowSpan={1}
        theme="light"
        className="h-full justify-between group relative overflow-hidden"
        borderGradient={VERTICAL_BORDER_GRADIENT}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 to-transparent opacity-30" />

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex justify-between items-start gap-5">
            <BentoHeader
              icon={ArrowUpRight}
              title={t('page.works.title')}
              subtitle={t('page.works.desc')}
              theme="light"
              className="flex-1"
            />
            <Link
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("page.works.docs")}
              className="p-2 bg-black/80 text-white rounded-full group-hover:scale-110 transition-transform shrink-0 mt-1"
            >
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {BUILT_STRUCTURES.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => setPreviewProject(project)}
                className="aspect-[3/2] w-full bg-gray-100 rounded-lg border border-gray-200 relative overflow-hidden group/item cursor-pointer"
                aria-label={`${t("page.works.preview")} ${project.title}`}
              >
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-all duration-500 grayscale group-hover/item:grayscale-0 group-hover/item:scale-105"
                  placeholder={project.placeholder}
                />
                <span
                  className={`absolute bottom-2 left-2 rounded-full px-2 py-1 text-[10px] font-semibold tracking-wide backdrop-blur-sm ${STATUS_STYLES[project.status]}`}
                >
                  {t(getStructureStatusKey(project.status))}
                </span>
              </button>
            ))}
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => setPreviewProject(null)}
              />

              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="works-preview-title"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh] z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center gap-4 p-4 border-b border-gray-100 shrink-0">
                  <div className="min-w-0">
                    <h4 id="works-preview-title" className="font-bold text-xl text-gray-900">{previewProject.title}</h4>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span>{t(getStructureStatusKey(previewProject.status))}</span>
                      <span aria-hidden="true">·</span>
                      <span>{t(getStructureKindKey(previewProject.kind))}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewProject(null)}
                    aria-label={t("page.works.close")}
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

                <div className="p-4 border-t border-gray-100 bg-white shrink-0 space-y-3">
                  <p className="text-sm leading-6 text-gray-600">
                    {t(previewProject.descriptionKey)}
                  </p>
                  <Link
                    href={previewProject.href}
                    target={previewProject.external ? "_blank" : undefined}
                    rel={previewProject.external ? "noopener noreferrer" : undefined}
                    className="w-full py-3 bg-black text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-[0.98] shadow-lg"
                  >
                    <span>{t('page.works.view')}</span>
                    {previewProject.external ? (
                      <ExternalLink className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
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
