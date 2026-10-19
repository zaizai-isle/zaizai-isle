import { TranslatedText } from "@/components/TranslatedText";
import { BentoCard } from "./BentoCard";
import { CORE_BUILD_PROGRESS_BLOCKS, getCoreBuildBlockTone } from "./core-build.config";
import { ISLAND_STATE } from "./island-state.config";

export const CoreBuildCard = () => {
  const { coreBuild } = ISLAND_STATE;

  return (
    <BentoCard colSpan={4} rowSpan={4} theme="light" className="isle-core-build-card h-full min-h-[460px] sm:min-h-[500px] md:min-h-0 flex flex-col overflow-hidden font-mono p-4 sm:p-5 md:p-6">
      <header className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-tight"><TranslatedText translationKey="build.core_build" /></h3>
        <span className="isle-core-label text-[10px] uppercase tracking-[0.18em]">{coreBuild.version}</span>
      </header>

      <div className="mt-5">
        <p className="isle-core-label text-[10px] uppercase tracking-[0.18em]"><TranslatedText translationKey={coreBuild.themeKey} /></p>
        <p className="isle-core-summary mt-2 text-[13px] leading-relaxed sm:text-sm"><TranslatedText translationKey={coreBuild.summaryKey} /></p>
      </div>

      <section className="mt-5" aria-label={`${coreBuild.version} build sequence`}>
        <div className="flex items-end justify-between gap-3">
          <p className="isle-core-label text-[10px] uppercase tracking-[0.14em]"><TranslatedText translationKey="build.sequence.label" /></p>
          <p className="isle-core-body text-xs">{coreBuild.completedCheckpoints} / {coreBuild.totalCheckpoints}</p>
        </div>
        <div className="mt-2.5">
          <div className="grid grid-cols-[repeat(24,minmax(0,1fr))] gap-0.5 sm:gap-1 opacity-90">
            {Array.from({ length: CORE_BUILD_PROGRESS_BLOCKS }).map((_, index) => {
              const tone = getCoreBuildBlockTone(index);
              const className = tone === "settled" ? "isle-core-settled" : "isle-core-building animate-pulse motion-reduce:animate-none";
              return <span className={`h-2 rounded-[2px] transition-all motion-reduce:transition-none sm:h-2.5 ${className}`} key={`progress-block-${index}`} />;
            })}
          </div>
        </div>
      </section>

      <div className="mt-5 grid flex-1 min-h-0 grid-rows-2 gap-2.5">
        <section className="isle-core-section flex flex-col justify-center rounded-xl border px-3 py-3">
          <h4 className="isle-core-label text-[10px] uppercase tracking-[0.14em]"><TranslatedText translationKey="build.current.forming_label" /></h4>
          <p className="isle-core-body mt-1.5 text-[13px] leading-snug sm:text-sm"><TranslatedText translationKey={coreBuild.formingKey} /></p>
        </section>
        <section className="isle-core-section flex flex-col justify-center rounded-xl border px-3 py-3">
          <h4 className="isle-core-label text-[10px] uppercase tracking-[0.14em]"><TranslatedText translationKey="build.current.stabilizing_label" /></h4>
          <p className="isle-core-body mt-1.5 text-[13px] leading-snug sm:text-sm"><TranslatedText translationKey={coreBuild.stabilizingKey} /></p>
        </section>
      </div>

      <div className="isle-core-footer mt-3 flex items-center justify-between gap-3 text-[9px] uppercase tracking-[0.12em] sm:text-[10px]">
        <span><TranslatedText translationKey="build.last_pulse" /></span>
        <time dateTime={coreBuild.updatedAt}>{coreBuild.updatedAt.replaceAll("-", ".")}</time>
      </div>
    </BentoCard>
  );
};
