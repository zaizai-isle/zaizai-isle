import { Fragment } from "react";
import { TranslatedText } from "@/components/TranslatedText";
import { BentoCard } from "./BentoCard";
import { TranslatedBentoHeader } from "./TranslatedBentoHeader";
import { CORE_BUILD_PROGRESS_BLOCKS, createCoreBuildViewModel } from "./core-build.config";

const toneByGroup = {
  running: "isle-core-tone-running text-emerald-800 border-emerald-700/30 bg-emerald-700/12",
  steady: "isle-core-tone-steady text-sky-800 border-sky-700/30 bg-sky-700/12",
  building: "isle-core-tone-building text-amber-800 border-amber-700/35 bg-amber-700/12",
} as const;

export const CoreBuildCard = () => {
  const { groups, progress } = createCoreBuildViewModel();
  const { buildingStart, buildingBlocks } = progress;

  return (
    <BentoCard colSpan={4} rowSpan={2} theme="light" className="isle-core-build-card h-full min-h-[460px] sm:min-h-[500px] md:min-h-0 flex flex-col overflow-hidden font-mono p-4 sm:p-5 md:p-6">
      <TranslatedBentoHeader titleKey="build.core_build" subtitleKeys={["build.timeline.stage_label", "build.timeline.stage_value"]} className="mb-2 sm:mb-3" theme="light" />
      <div className="mb-3 sm:mb-4">
        <p className="isle-core-summary text-[13px] sm:text-sm leading-relaxed"><TranslatedText translationKey="build.timeline.summary" /></p>
        <div className="mt-2 sm:mt-2.5">
          <div className="grid grid-cols-[repeat(24,minmax(0,1fr))] gap-0.5 sm:gap-1 opacity-90">
            {Array.from({ length: CORE_BUILD_PROGRESS_BLOCKS }).map((_, index) => {
              const isBuilding = index >= buildingStart && index < buildingStart + buildingBlocks;
              const isSettled = index < buildingStart;
              const tone = isSettled ? "isle-core-settled" : isBuilding ? "isle-core-building animate-pulse motion-reduce:animate-none" : "isle-core-pending";
              return <span className={`h-2 sm:h-2.5 rounded-[2px] transition-all motion-reduce:transition-none ${tone}`} key={`progress-block-${index}`} />;
            })}
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 grid grid-rows-3 gap-2 sm:gap-2.5">
        {groups.map((group) => (
          <section key={group.id} className="isle-core-section h-full rounded-xl border px-2.5 py-2 sm:px-3 sm:py-2.5 flex flex-col justify-center">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <h4 className="isle-core-label text-[10px] sm:text-[11px] uppercase tracking-[0.12em]"><TranslatedText translationKey={group.titleKey} /></h4>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${toneByGroup[group.id]}`}><TranslatedText translationKey={group.statusKey} /></span>
            </div>
            <p className="isle-core-body text-[13px] sm:text-sm leading-snug break-words">
              {group.modules.length > 0 ? group.modules.map((module, index) => (
                <Fragment key={module.id}>{index > 0 ? " · " : null}<TranslatedText translationKey={module.moduleKey} /></Fragment>
              )) : <TranslatedText translationKey="build.group.empty" />}
            </p>
          </section>
        ))}
      </div>
      <div className="isle-core-footer text-[10px] italic mt-1.5 sm:mt-2 text-right">— <TranslatedText translationKey="build.footer_note" /></div>
    </BentoCard>
  );
};
