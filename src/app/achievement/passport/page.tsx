"use client";

import Link from "next/link";
import { cloudPassportEnabled } from "../passport-cloud";
import { PassportCloudControls } from "../_components/PassportCloudControls";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { loadStampPoster, loadStampThumb, type StampThumbState } from "../passport-view-data";

type PassportViewState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; passport: PassportRecord; stamps: StampRecord[] };

type DialogPosterState =
  | { status: "loading" }
  | { status: "ready"; url: string }
  | { status: "error"; message: string };

const POSTER_ACTION_CLASS = "inline-flex h-7 w-7 items-center justify-center border border-[#526b45]/30 bg-[#f5f1e5]/95 text-[#263b35] shadow-[0_4px_12px_rgba(32,38,36,.13)] transition hover:-translate-y-px hover:bg-[#526b45] hover:text-[#f2f0e8] motion-reduce:transform-none motion-reduce:transition-none";

// 海报排版（canvas 渲染器 + 字体）只在查看或导出时动态导入，不进护照初始模块图。
async function importPosterKit() {
  const kit = await import("../passport-export");
  return { createSavedStampPoster: kit.createSavedStampPoster, exportSavedStamp: kit.exportSavedStamp };
}

// 缩略图按需读取：卡片接近视口才取这一张的 thumbnailBlob；失败只影响本卡。
function StampThumb({ stamp }: { stamp: StampRecord }) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<StampThumbState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    let active = true;
    let url: string | undefined;
    const load = () => void loadStampThumb(stamp, getStampPhoto, (blob) => {
      url = URL.createObjectURL(blob);
      return url;
    }).then((next) => {
      if (!active) {
        if (url) URL.revokeObjectURL(url);
        return;
      }
      setState(next);
    });
    if (typeof IntersectionObserver === "undefined") {
      load();
      return () => { active = false; if (url) URL.revokeObjectURL(url); };
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        load();
      }
    }, { rootMargin: "500px" });
    observer.observe(node);
    return () => {
      active = false;
      observer.disconnect();
      if (url) URL.revokeObjectURL(url);
    };
  }, [stamp, attempt]);
  return (
    <div ref={nodeRef} className="aspect-[9/16]">
      {state.status === "loading" ? <div role="status" aria-label="缩略图加载中" className="h-full w-full bg-[#f5f3ec]" data-loading-placeholder="stamp-thumb" /> : null}
      {state.status === "empty" ? (
        <div className="grid h-full w-full place-content-center gap-1 bg-[#f5f3ec] p-3 text-center">
          <span className="text-2xl" aria-hidden>{stamp.icon}</span>
          <strong className="achievement-title text-sm leading-5 text-[#263b35]">{stamp.title}</strong>
          <small className="font-mono text-[10px] tracking-[0.14em] text-[#686d68]">{stamp.date}</small>
        </div>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element -- 缩略图是 IndexedDB/云端 blob object URL，next/image 无法处理 blob: */}
      {state.status === "ready" ? <img src={state.url} alt={`${stamp.title}缩略图`} loading="lazy" decoding="async" className="h-full w-full bg-[#f5f3ec] object-cover" /> : null}
      {state.status === "error" ? (
        <div className="grid h-full w-full place-content-center gap-2 bg-[#f5f3ec] p-3 text-center text-xs text-[#686d68]">
          <span>{state.message}</span>
          <button type="button" className="underline underline-offset-2" onClick={() => { setState({ status: "loading" }); setAttempt((value) => value + 1); }}>重试</button>
        </div>
      ) : null}
    </div>
  );
}

export default function PassportPage() {
  const [reload, setReload] = useState(0);
  const [viewState, setViewState] = useState<PassportViewState>({ status: "loading" });
  const [selectedStampId, setSelectedStampId] = useState<string>();
  const [dialogPoster, setDialogPoster] = useState<DialogPosterState>({ status: "loading" });
  const [posterAttempt, setPosterAttempt] = useState(0);
  const [activeMenuStampId, setActiveMenuStampId] = useState<string>();
  const [pendingDeleteStampId, setPendingDeleteStampId] = useState<string>();
  const [deletingStampId, setDeletingStampId] = useState<string>();
  const [downloadingStampId, setDownloadingStampId] = useState<string>();
  const [actionError, setActionError] = useState("");

  // 先记录：护照与印章列表一读出来就 ready，照片与海报一概不碰。
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const [passport] = await Promise.all([ensureDefaultPassport(), repairPassportStorage()]);
        const stamps = await listStamps();
        if (active) setViewState({ status: "ready", passport, stamps });
      } catch (error) {
        if (active) setViewState({ status: "error", message: passportStorageErrorMessage(error) });
      }
    })();
    return () => { active = false; };
  }, [reload]);

  // 查看：仅为打开的这一枚排版海报（原图此时才读取）。
  useEffect(() => {
    if (!selectedStampId) return;
    const stamp = viewState.status === "ready" ? viewState.stamps.find((item) => item.id === selectedStampId) : undefined;
    if (!stamp) return;
    let active = true;
    let url: string | undefined;
    setDialogPoster({ status: "loading" });
    void (async () => {
      const { createSavedStampPoster } = await importPosterKit();
      const result = await loadStampPoster(stamp, getStampPhoto, (target, photo) => createSavedStampPoster(target, photo));
      if (!active) return;
      if (result.status === "error") setDialogPoster(result);
      else {
        url = URL.createObjectURL(result.poster);
        setDialogPoster({ status: "ready", url });
      }
    })();
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [selectedStampId, posterAttempt, viewState]);

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
  const selectedStamp = stamps.find((stamp) => stamp.id === selectedStampId);
  const pendingDeleteStamp = stamps.find((stamp) => stamp.id === pendingDeleteStampId);

  const downloadPoster = useCallback(async (stamp: StampRecord) => {
    setDownloadingStampId(stamp.id);
    setActionError("");
    try {
      const { exportSavedStamp } = await importPosterKit();
      const photo = stamp.hasPhoto ? await getStampPhoto(stamp.id) : undefined;
      await exportSavedStamp(stamp, photo);
    } catch (error) {
      setActionError(`${stamp.title}：${error instanceof Error ? error.message : "海报导出失败"}，其余印章不受影响。`);
    } finally {
      setDownloadingStampId(undefined);
    }
  }, []);

  const removeStamp = async () => {
    if (!pendingDeleteStamp) return;
    setDeletingStampId(pendingDeleteStamp.id);
    setActionError("");
    try {
      await deleteStamp(pendingDeleteStamp.id);
      setViewState((current) => current.status === "ready"
        ? { ...current, stamps: current.stamps.filter((stamp) => stamp.id !== pendingDeleteStamp.id) }
        : current);
      if (selectedStampId === pendingDeleteStamp.id) setSelectedStampId(undefined);
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
        {viewState.status === "loading" ? <p role="status" className="py-20 text-center text-[#686d68]">正在取出护照记录…</p> : null}
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

            {actionError ? <p role="alert" className="mt-4 border border-[#a02f28]/30 bg-[#f2f0e8] p-3 text-sm text-[#a02f28]">{actionError}</p> : null}

            {stamps.length === 0 ? (
              <div className="mx-auto grid max-w-xl place-items-center py-24 text-center">
                <span className="grid h-20 w-20 place-items-center rounded-full border border-dashed border-[#7f8983] text-3xl text-[#526b45]">✦</span>
                <h2 className="achievement-title mt-6 text-2xl text-[#263b35]">护照还在等待第一枚印章</h2>
                <p className="mt-2 text-sm leading-6 text-[#686d68]">一次普通但真实的抵达，也值得被留下。</p>
                <Link href="/achievement" className="journal-ink-button mt-6 inline-flex h-11 items-center gap-2 px-5 font-semibold text-[#f2f0e8]"><Plus className="h-4 w-4" />盖下第一枚印章</Link>
              </div>
            ) : (
              <div className="mt-7">
                <section aria-label="人生印章记录">
                  <div className="grid grid-cols-2 items-start gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                      {stamps.map((stamp) => (
                        <article
                          key={stamp.id}
                          className="group relative isolate"
                          onMouseLeave={() => setActiveMenuStampId(undefined)}
                          onBlur={(event) => {
                            if (!event.currentTarget.contains(event.relatedTarget)) setActiveMenuStampId(undefined);
                          }}
                        >
                          <button type="button" onClick={() => setSelectedStampId(stamp.id)} className="block w-full text-left" aria-label={`查看${stamp.title}海报`}>
                            <StampThumb stamp={stamp} />
                          </button>

                          <div className={`absolute right-2 top-2 z-10 flex -translate-y-1 items-center gap-1 opacity-0 pointer-events-none transition duration-150 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100 motion-reduce:transform-none motion-reduce:transition-none ${activeMenuStampId === stamp.id ? "pointer-events-auto translate-y-0 opacity-100" : ""}`}>
                            <button type="button" onClick={() => setSelectedStampId(stamp.id)} className={POSTER_ACTION_CLASS} aria-label={`查看${stamp.title}`} title="查看"><Eye className="h-3.5 w-3.5" /></button>
                            <button type="button" onClick={() => void downloadPoster(stamp)} disabled={downloadingStampId === stamp.id} className={POSTER_ACTION_CLASS} aria-label={`下载${stamp.title}`} title={downloadingStampId === stamp.id ? "正在排版海报…" : "下载"}><Download className="h-3.5 w-3.5" /></button>
                            <Link href={`/achievement?stamp=${encodeURIComponent(stamp.id)}`} className={POSTER_ACTION_CLASS} aria-label={`编辑${stamp.title}`} title="编辑"><Pencil className="h-3.5 w-3.5" /></Link>
                            <button type="button" onClick={() => setActiveMenuStampId((current) => current === stamp.id ? undefined : stamp.id)} className={POSTER_ACTION_CLASS} aria-expanded={activeMenuStampId === stamp.id} aria-haspopup="menu" aria-label={`${stamp.title}更多操作`} title="更多"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                          </div>

                          {activeMenuStampId === stamp.id ? (
                            <div role="menu" className="absolute right-2 top-11 z-20 min-w-24 border border-[#aeb3ad] bg-[#f5f1e5] p-1 shadow-[0_8px_24px_rgba(32,38,36,.16)]">
                              <button type="button" role="menuitem" onClick={() => setPendingDeleteStampId(stamp.id)} className="flex min-h-9 w-full items-center gap-2 px-3 text-left text-sm text-[#8b4b45] hover:bg-[#8b4b45]/8"><Trash2 className="h-3.5 w-3.5" />删除</button>
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

      {selectedStamp ? (
        <div role="dialog" aria-modal="true" aria-labelledby="poster-dialog-title" className="fixed inset-0 z-50 grid bg-[#151c19]/94 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedStampId(undefined); }}>
          <h2 id="poster-dialog-title" className="sr-only">{selectedStamp.title}人生印章海报</h2>
          <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex justify-end gap-2 sm:inset-x-6 sm:top-6">
            <div className="pointer-events-auto flex items-center gap-1.5 bg-[#f5f1e5] p-1.5 shadow-lg">
              <button type="button" disabled={dialogPoster.status !== "ready"} onClick={() => void downloadPoster(selectedStamp)} className={POSTER_ACTION_CLASS} aria-label="下载海报" title="下载"><Download className="h-4 w-4" /></button>
              <Link href={`/achievement?stamp=${encodeURIComponent(selectedStamp.id)}`} className={POSTER_ACTION_CLASS} aria-label="编辑这枚印章" title="编辑"><Pencil className="h-4 w-4" /></Link>
              <button type="button" onClick={() => setSelectedStampId(undefined)} className={POSTER_ACTION_CLASS} aria-label="关闭海报" title="关闭"><X className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="m-auto h-[calc(100dvh-1.5rem)] max-h-[calc(100dvh-1.5rem)] aspect-[9/16] sm:h-[calc(100dvh-3rem)] sm:max-h-[calc(100dvh-3rem)]">
            {dialogPoster.status === "loading" ? <div role="status" className="grid h-full w-full place-content-center bg-[#f5f3ec] text-sm text-[#686d68]">正在为这枚印章排版海报…</div> : null}
            {dialogPoster.status === "error" ? <div role="alert" className="grid h-full w-full place-content-center gap-3 bg-[#f5f3ec] p-6 text-center text-sm text-[#a02f28]"><p>{dialogPoster.message}</p><button type="button" className="underline underline-offset-2" onClick={() => setPosterAttempt((value) => value + 1)}>重试排版</button></div> : null}
            {/* eslint-disable-next-line @next/next/no-img-element -- 海报是 canvas 导出的 blob object URL，next/image 无法处理 blob: */}
            {dialogPoster.status === "ready" ? <img src={dialogPoster.url} alt={`${selectedStamp.title}人生印章海报`} className="h-full w-full bg-[#f5f3ec] object-contain shadow-[0_18px_60px_rgba(0,0,0,.42)]" /> : null}
          </div>
        </div>
      ) : null}

      {pendingDeleteStamp ? (
        <div role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title" className="fixed inset-0 z-[60] grid place-items-center bg-[#151c19]/70 p-4">
          <div className="journal-paper-slip w-full max-w-md p-6 sm:p-7">
            <h2 id="delete-dialog-title" className="achievement-title text-2xl text-[#263b35]">删除这枚人生印章？</h2>
            <p className="mt-3 text-sm leading-6 text-[#6f3935]">“{pendingDeleteStamp.title}”及其{cloudPassportEnabled ? "云端" : "本地"}照片将被永久删除，无法恢复。</p>
            {actionError ? <p role="alert" className="mt-3 text-sm text-[#a02f28]">{actionError}</p> : null}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => { setPendingDeleteStampId(undefined); setActionError(""); }} className="h-10 px-4 text-sm text-[#5f6560]">保留这枚印章</button>
              <button type="button" disabled={deletingStampId === pendingDeleteStamp.id} onClick={() => void removeStamp()} className="h-10 bg-[#8b3d37] px-4 text-sm font-semibold text-white disabled:opacity-55">{deletingStampId ? "正在删除…" : "确认删除"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
