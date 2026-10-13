import { SystemStatusRuntime } from "./SystemStatusRuntime";

export const SystemStatus = () => (
  <header id="system-status" data-text-mode="dark" data-scrolled="false" className="system-status-header sticky top-0 left-0 right-0 z-40 h-14 flex items-center justify-center w-full mt-16">
    <div className="w-full max-w-[1536px] px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center justify-between w-full transition-colors duration-300">
        <div className="flex items-center pl-8">
          <div className="flex items-center gap-3 group cursor-default">
            <span className="text-xs font-bold tracking-[0.3em] font-mono opacity-80">ISLE.SYS</span>
            <div className="flex items-center gap-1.5 ml-2">
              <div className="w-1 h-1 rounded-full bg-emerald-400/80 animate-pulse" />
              <span className="text-[9px] font-mono uppercase tracking-[0.1em] opacity-40">Live</span>
            </div>
          </div>
        </div>
        <div className="flex items-center pr-8 gap-6">
          <div className="hidden sm:flex items-center gap-6 text-[9px] font-mono tracking-[0.1em] uppercase opacity-40">
            <span>V.1.2.6-CALIB</span><span>S.RT:99.9%</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="system-status-divider h-3 w-px mx-2 opacity-20" />
            <SystemStatusRuntime />
          </div>
        </div>
      </div>
    </div>
  </header>
);
