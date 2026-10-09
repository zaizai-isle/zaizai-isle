"use client";

import Link from "next/link";
import { cloudPassportEnabled } from "../passport-cloud";
import { PassportCloudControls } from "../_components/PassportCloudControls";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Download,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { createSavedStampPoster } from "../passport-export";
import {
  deleteStamp,
  ensureDefaultPassport,
  getStampPhoto,
  listStamps,
  passportStorageErrorMessage,
  repairPassportStorage,
  type PassportRecord,
  type StampRecord,
} from "../passport-repository";

interface StampView {
  stamp: StampRecord;
  posterUrl: string;
}

type PassportViewState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; passport: PassportRecord; stamps: StampView[] };

const POSTER_ACTION_CLASS = "inline-flex h-7 w-7 items-center justify-center border border-[#526b45]/30 bg-[#f5f1e5]/95 text-[#263b35] shadow-[0_4px_12px_rgba(32,38,36,.13)] transition hover:-translate-y-px hover:bg-[#526b45] hover:text-[#f2f0e8] motion-reduce:transform-none motion-reduce:transition-none";

function posterFileName(stamp: StampRecord) {
  return `life-passport-portrait-${stamp.date}-${stamp.achievementId ?? stamp.id}.png`;
}

function PosterImage({ view, className = "" }: { view: StampView; className?: string }) {
  return (
    <div
      role="img"
      aria-label={`${view.stamp.title}人生印章海报`}
      className={`aspect-[9/16] bg-[#f5f3ec] bg-contain bg-center bg-no-repeat ${className}`}
      style={{ backgroundImage: `url(${view.posterUrl})` }}
    />
  );
}

export default function PassportPage() {
  const [reload, setReload] = useState(0);
  const [viewState, setViewState] = useState<PassportViewState>({ status: "loading" });
  const [selectedStampId, setSelectedStampId] = useState<string>();
  const [activeMenuStampId, setActiveMenuStampId] = useState<string>();
  const [pendingDeleteStampId, setPendingDeleteStampId] = useState<string>();
  const [deletingStampId, setDeletingStampId] = useState<string>();
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let active = true;
    const objectUrls: string[] = [];

    const loadPassport = async () => {
      try {
        const [passport] = await Promise.all([ensureDefaultPassport(), repairPassportStorage()]);
        const stamps = await listStamps();
        const photos = await Promise.all(stamps.map((stamp) => stamp.hasPhoto ? getStampPhoto(stamp.id) : Promise.resolve(undefined)));
        const posterBlobs = await Promise.all(stamps.map((stamp, index) => createSavedStampPoster(stamp, photos[index])));
        if (!active) return;
        const stampViews = stamps.map((stamp, index) => {
          const posterUrl = URL.createObjectURL(posterBlobs[index]);
          objectUrls.push(posterUrl);
          return { stamp, posterUrl };
        });
        if (active) setViewState({ status: "ready", passport, stamps: stampViews });
      } catch (error) {
        if (active) setViewState({ status: "error", message: passportStorageErrorMessage(error) });
      }
    };

    void loadPassport();
    return () => {
      active = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [reload]);

  useEffect(() => {
    if (!selectedStampId && !pendingDeleteStampId) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (pendingDeleteStampId) setPendingDeleteStampId(undefined);
      else setSelectedStampId(undefined);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pendingDeleteStampId, selectedStampId]);

  const stamps = viewState.status === "ready" ? viewState.stamps : [];
  const selectedView = stamps.find(({ stamp }) => stamp.id === selectedStampId);
  const pendingDeleteView = stamps.find(({ stamp }) => stamp.id === pendingDeleteStampId);

  const downloadPoster = (view: StampView) => {
    const link = document.createElement("a");
    link.href = view.posterUrl;
    link.download = posterFileName(view.stamp);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const removeStamp = async () => {
    if (!pendingDeleteView) return;
    setDeletingStampId(pendingDeleteView.stamp.id);
    setActionError("");
    try {
      await deleteStamp(pendingDeleteView.stamp.id);
      setViewState((current) => current.status === "ready"
        ? { ...current, stamps: current.stamps.filter(({ stamp }) => stamp.id !== pendingDeleteView.stamp.id) }
        : current);
      if (selectedStampId === pendingDeleteView.stamp.id) setSelectedStampId(undefined);
      setPendingDeleteStampId(undefined);
      setActiveMenuStampId(undefined);
    } catch (error) {
      setActionError(passportStorageErrorMessage(error));
    } finally {
      setDeletingStampId(undefined);
    }
  };

  return (
    <main className="achievement-paper min-h-dvh bg-[#d9ddda] text-[#202624]">
      <header className="border-b border-[#56615d] bg-[#202624] text-[#f2f0e8]">
        <div className="mx-auto flex min-h-12 max-w-7xl items-center justify-between gap-4 px-4 py-1 sm:px-6">
          <Link href="/achievement" className="flex min-h-10 items-center gap-2 text-sm text-[#d9ddd8] hover:text-white"><ArrowLeft className="h-4 w-4" />继续盖章</Link>
          <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-[#b9bfba]"><BookOpen className="h-3.5 w-3.5" />{cloudPassportEnabled ? "CLOUD PASSPORT" : "LOCAL PASSPORT"}</span>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-9">
        <PassportCloudControls onChanged={() => { setSelectedStampId(undefined); setPendingDeleteStampId(undefined); setViewState({ status: "loading" }); setReload((value) => value + 1); }} />
        {viewState.status === "loading" ? <p role="status" className="py-20 text-center text-[#686d68]">正在还原人生海报…</p> : null}
        {viewState.status === "error" ? <div role="alert" className="mx-auto max-w-xl border border-[#a02f28]/30 bg-[#f2f0e8] p-6 text-center text-[#a02f28]"><p>{viewState.message}</p><button type="button" className="m-2 min-h-11 px-3 underline" onClick={() => { setViewState({ status: "loading" }); setReload((value) => value + 1); }}>重试加载</button><Link href="/achievement" className="mt-4 inline-flex min-h-10 items-center underline underline-offset-4">返回创建页</Link></div> : null}

        {viewState.status === "ready" ? (
          <>
            <div className="grid gap-5 border-b border-[#aeb3ad] pb-6 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#526b45]">{viewState.passport.passportNumber}</span>
                <h1 className="achievement-handwriting mt-2 text-4xl tracking-wide text-[#263b35] sm:text-5xl">{viewState.passport.name}</h1>
                <p className="achievement-handwriting mt-2 text-lg text-[#686d68]">{viewState.passport.declaration}</p>
              </div>
              <div className="flex items-end justify-between gap-5 sm:justify-end">
                <div className="text-right"><strong className="achievement-title text-4xl text-[#263b35]">{stamps.length}</strong><span className="ml-2 text-sm text-[#686d68]">枚人生印章</span></div>
                <Link href="/achievement" className="hidden min-h-10 items-center gap-1.5 text-sm text-[#526b45] hover:text-[#263b35] sm:flex"><Plus className="h-4 w-4" />继续盖章</Link>
              </div>
            </div>

            {stamps.length === 0 ? (
              <div className="mx-auto grid max-w-xl place-items-center py-24 text-center">
                <span className="grid h-20 w-20 place-items-center rounded-full border border-dashed border-[#7f8983] text-3xl text-[#526b45]">✦</span>
                <h2 className="achievement-title mt-6 text-2xl text-[#263b35]">护照还在等待第一枚印章</h2>
                <p className="mt-2 text-sm leading-6 text-[#686d68]">一次普通但真实的抵达，也值得被留下。</p>
                <Link href="/achievement" className="journal-ink-button mt-6 inline-flex h-11 items-center gap-2 px-5 font-semibold text-[#f2f0e8]"><Plus className="h-4 w-4" />盖下第一枚印章</Link>
              </div>
            ) : (
              <div className="mt-7">
                <section aria-label="人生印章海报">
                  <div className="grid grid-cols-2 items-start gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                      {stamps.map((view) => (
                        <article
                          key={view.stamp.id}
                          className="group relative isolate"
                          onMouseLeave={() => setActiveMenuStampId(undefined)}
                          onBlur={(event) => {
                            if (!event.currentTarget.contains(event.relatedTarget)) setActiveMenuStampId(undefined);
                          }}
                        >
                          <button type="button" onClick={() => setSelectedStampId(view.stamp.id)} className="block w-full text-left" aria-label={`查看${view.stamp.title}海报`}>
                            <PosterImage view={view} className="w-full shadow-[0_7px_18px_rgba(41,45,40,.14)] transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_11px_24px_rgba(41,45,40,.2)] group-focus-within:-translate-y-0.5 group-focus-within:shadow-[0_11px_24px_rgba(41,45,40,.2)] motion-reduce:transform-none motion-reduce:transition-none" />
                          </button>

                          <div className={`absolute right-2 top-2 z-10 flex -translate-y-1 items-center gap-1 opacity-0 pointer-events-none transition duration-150 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100 motion-reduce:transform-none motion-reduce:transition-none ${activeMenuStampId === view.stamp.id ? "pointer-events-auto translate-y-0 opacity-100" : ""}`}>
                            <button type="button" onClick={() => setSelectedStampId(view.stamp.id)} className={POSTER_ACTION_CLASS} aria-label={`查看${view.stamp.title}`} title="查看"><Eye className="h-3.5 w-3.5" /></button>
                            <button type="button" onClick={() => downloadPoster(view)} className={POSTER_ACTION_CLASS} aria-label={`下载${view.stamp.title}`} title="下载"><Download className="h-3.5 w-3.5" /></button>
                            <Link href={`/achievement?stamp=${encodeURIComponent(view.stamp.id)}`} className={POSTER_ACTION_CLASS} aria-label={`编辑${view.stamp.title}`} title="编辑"><Pencil className="h-3.5 w-3.5" /></Link>
                            <button type="button" onClick={() => setActiveMenuStampId((current) => current === view.stamp.id ? undefined : view.stamp.id)} className={POSTER_ACTION_CLASS} aria-expanded={activeMenuStampId === view.stamp.id} aria-haspopup="menu" aria-label={`${view.stamp.title}更多操作`} title="更多"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                          </div>

                          {activeMenuStampId === view.stamp.id ? (
                            <div role="menu" className="absolute right-2 top-11 z-20 min-w-24 border border-[#aeb3ad] bg-[#f5f1e5] p-1 shadow-[0_8px_24px_rgba(32,38,36,.16)]">
                              <button type="button" role="menuitem" onClick={() => setPendingDeleteStampId(view.stamp.id)} className="flex min-h-9 w-full items-center gap-2 px-3 text-left text-sm text-[#8b4b45] hover:bg-[#8b4b45]/8"><Trash2 className="h-3.5 w-3.5" />删除</button>
                            </div>
                          ) : null}
                        </article>
                      ))}
                  </div>
                </section>
              </div>
            )}
          </>
        ) : null}
      </section>

      {selectedView ? (
        <div role="dialog" aria-modal="true" aria-labelledby="poster-dialog-title" className="fixed inset-0 z-50 grid bg-[#151c19]/94 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedStampId(undefined); }}>
          <h2 id="poster-dialog-title" className="sr-only">{selectedView.stamp.title}人生印章海报</h2>
          <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex justify-end gap-2 sm:inset-x-6 sm:top-6">
            <div className="pointer-events-auto flex items-center gap-1.5 bg-[#f5f1e5] p-1.5 shadow-lg">
              <button type="button" onClick={() => downloadPoster(selectedView)} className={POSTER_ACTION_CLASS} aria-label="下载海报" title="下载"><Download className="h-4 w-4" /></button>
              <Link href={`/achievement?stamp=${encodeURIComponent(selectedView.stamp.id)}`} className={POSTER_ACTION_CLASS} aria-label="编辑这枚印章" title="编辑"><Pencil className="h-4 w-4" /></Link>
              <button type="button" onClick={() => setSelectedStampId(undefined)} className={POSTER_ACTION_CLASS} aria-label="关闭海报" title="关闭"><X className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="m-auto h-[calc(100dvh-1.5rem)] max-h-[calc(100dvh-1.5rem)] aspect-[9/16] sm:h-[calc(100dvh-3rem)] sm:max-h-[calc(100dvh-3rem)]">
            <PosterImage view={selectedView} className="h-full shadow-[0_18px_60px_rgba(0,0,0,.42)]" />
          </div>
        </div>
      ) : null}

      {pendingDeleteView ? (
        <div role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title" className="fixed inset-0 z-[60] grid place-items-center bg-[#151c19]/70 p-4">
          <div className="journal-paper-slip w-full max-w-md p-6 sm:p-7">
            <h2 id="delete-dialog-title" className="achievement-title text-2xl text-[#263b35]">删除这枚人生印章？</h2>
            <p className="mt-3 text-sm leading-6 text-[#6f3935]">“{pendingDeleteView.stamp.title}”及其{cloudPassportEnabled ? "云端" : "本地"}照片将被永久删除，无法恢复。</p>
            {actionError ? <p role="alert" className="mt-3 text-sm text-[#a02f28]">{actionError}</p> : null}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => { setPendingDeleteStampId(undefined); setActionError(""); }} className="h-10 px-4 text-sm text-[#5f6560]">保留这枚印章</button>
              <button type="button" disabled={deletingStampId === pendingDeleteView.stamp.id} onClick={() => void removeStamp()} className="h-10 bg-[#8b3d37] px-4 text-sm font-semibold text-white disabled:opacity-55">{deletingStampId ? "正在删除…" : "确认删除"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
