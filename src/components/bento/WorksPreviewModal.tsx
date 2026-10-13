"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ExternalLink, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/lib/language-context";
import { getStructureKindKey, getStructureStatusKey, type BuiltStructure } from "./built-structures.config";

export default function WorksPreviewModal({ project, onClose }: { project: BuiltStructure; onClose: () => void }) {
  const { t } = useLanguage();

  return createPortal(
    <div className="isle-fade-in fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="works-preview-title" className="isle-pop-in relative w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh] z-10" onClick={(event) => event.stopPropagation()}>
        <div className="flex justify-between items-center gap-4 p-4 border-b border-gray-100 shrink-0">
          <div className="min-w-0">
            <h4 id="works-preview-title" className="font-bold text-xl text-gray-900">{project.title}</h4>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span>{t(getStructureStatusKey(project.status))}</span><span aria-hidden="true">·</span><span>{t(getStructureKindKey(project.kind))}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={t("page.works.close")} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="relative flex-1 w-full bg-gray-50 overflow-hidden">
          <Image src={project.image} alt={project.title} fill sizes="(min-width: 1024px) 960px, 100vw" loading="eager" className="object-contain p-4" />
        </div>
        <div className="p-4 border-t border-gray-100 bg-white shrink-0 space-y-3">
          <p className="text-sm leading-6 text-gray-600">{t(project.descriptionKey)}</p>
          <Link href={project.href} target={project.external ? "_blank" : undefined} rel={project.external ? "noopener noreferrer" : undefined} className="w-full py-3 bg-black text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-[0.98] shadow-lg">
            <span>{t("page.works.view")}</span>
            {project.external ? <ExternalLink className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
