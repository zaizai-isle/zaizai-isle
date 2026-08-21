"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Download, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { exportSavedStamp } from "../passport-export";
import {
  deleteStamp,
  ensureDefaultPassport,
  getStampPhoto,
  listStamps,
  passportStorageErrorMessage,
  repairPassportStorage,
  type PassportRecord,
  type StampRecord,
} from "../passport-storage";

interface StampView {
  stamp: StampRecord;
  thumbnailUrl?: string;
}

type PassportViewState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; passport: PassportRecord; stamps: StampView[] };

type DetailActionState = "idle" | "exporting" | "exported" | "deleting" | "error";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

export default function PassportPage() {
  const [viewState, setViewState] = useState<PassportViewState>({ status: "loading" });
  const [selectedStampId, setSelectedStampId] = useState<string>();
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [actionState, setActionState] = useState<DetailActionState>("idle");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let active = true;
    const objectUrls: string[] = [];

    const loadPassport = async () => {
      try {
        const [passport] = await Promise.all([ensureDefaultPassport(), repairPassportStorage()]);
        const stamps = await listStamps();
        const photos = await Promise.all(stamps.map((stamp) => stamp.hasPhoto ? getStampPhoto(stamp.id) : Promise.resolve(undefined)));
        const stampViews = stamps.map((stamp, index) => {
          const photo = photos[index];
          if (!photo) return { stamp };
          const thumbnailUrl = URL.createObjectURL(photo.thumbnailBlob);
          objectUrls.push(thumbnailUrl);
          return { stamp, thumbnailUrl };
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
  }, []);

  const selectedView = viewState.status === "ready"
    ? viewState.stamps.find(({ stamp }) => stamp.id === selectedStampId)
    : undefined;

  const openStamp = (stampId: string) => {
    setSelectedStampId(stampId);
    setDeleteConfirmationOpen(false);
    setActionState("idle");
    setActionError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeStamp = () => {
    setSelectedStampId(undefined);
    setDeleteConfirmationOpen(false);
    setActionState("idle");
    setActionError("");
  };

  const exportStamp = async () => {
    if (!selectedView) return;
    setActionState("exporting");
    setActionError("");
    try {
      const photo = selectedView.stamp.hasPhoto ? await getStampPhoto(selectedView.stamp.id) : undefined;
      await exportSavedStamp(selectedView.stamp, photo);
      setActionState("exported");
    } catch (error) {
      setActionError(passportStorageErrorMessage(error));
      setActionState("error");
    }
  };

  const removeStamp = async () => {
    if (!selectedView) return;
    setActionState("deleting");
    setActionError("");
    try {
      await deleteStamp(selectedView.stamp.id);
      setViewState((current) => current.status === "ready"
        ? { ...current, stamps: current.stamps.filter(({ stamp }) => stamp.id !== selectedView.stamp.id) }
        : current);
      closeStamp();
    } catch (error) {
      setActionError(passportStorageErrorMessage(error));
      setActionState("error");
    }
  };

  return (
    <main className="achievement-paper min-h-dvh bg-[#d9ddda] text-[#202624]">
      <header className="border-b border-[#56615d] bg-[#202624] text-[#f2f0e8]">
        <div className="mx-auto flex min-h-12 max-w-6xl items-center justify-between gap-4 px-4 py-1 sm:px-6">
          <Link href="/achievement" className="flex min-h-10 items-center gap-2 text-sm text-[#d9ddd8] hover:text-white"><ArrowLeft className="h-4 w-4" />继续盖章</Link>
          <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-[#b9bfba]"><BookOpen className="h-3.5 w-3.5" />LOCAL PASSPORT v0.2.2</span>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {viewState.status === "loading" ? <p role="status" className="py-20 text-center text-[#686d68]">正在翻开护照…</p> : null}
        {viewState.status === "error" ? <div role="alert" className="mx-auto max-w-xl border border-[#a02f28]/30 bg-[#f2f0e8] p-6 text-center text-[#a02f28]"><p>{viewState.message}</p><Link href="/achievement" className="mt-4 inline-flex min-h-10 items-center underline underline-offset-4">返回创建页</Link></div> : null}

        {viewState.status === "ready" ? (
          <>
            <div className="grid gap-5 border-b border-[#aeb3ad] pb-7 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#526b45]">{viewState.passport.passportNumber}</span>
                <h1 className="achievement-handwriting mt-2 text-4xl tracking-wide text-[#263b35] sm:text-5xl">{viewState.passport.name}</h1>
                <p className="achievement-handwriting mt-3 text-lg text-[#686d68]">{viewState.passport.declaration}</p>
              </div>
              <div className="sm:text-right"><strong className="achievement-title text-4xl text-[#263b35]">{viewState.stamps.length}</strong><span className="ml-2 text-sm text-[#686d68]">枚人生印章</span></div>
            </div>

            {selectedView ? (
              <section aria-labelledby="stamp-detail-title" className="mt-7">
                <button type="button" onClick={closeStamp} className="flex min-h-10 items-center gap-2 text-sm text-[#526b45] hover:text-[#263b35]"><ArrowLeft className="h-4 w-4" />返回护照</button>
                <div className="journal-paper-slip mt-3 grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(280px,.8fr)_minmax(0,1fr)] lg:gap-10">
                  {selectedView.thumbnailUrl ? <div role="img" aria-label={`${selectedView.stamp.title}的照片`} className="aspect-[4/3] bg-[#c9ccc7] bg-cover bg-center" style={{ backgroundImage: `url(${selectedView.thumbnailUrl})` }} /> : <div aria-hidden="true" className="grid aspect-[4/3] place-items-center border border-dashed border-[#a7aca6] text-6xl text-[#526b45]">{selectedView.stamp.icon}</div>}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] tracking-[0.1em] text-[#68716c]"><span>{selectedView.stamp.category}</span><time dateTime={selectedView.stamp.date}>{formatDate(selectedView.stamp.date)}</time></div>
                    <h2 id="stamp-detail-title" className="achievement-title mt-4 text-3xl text-[#263b35] sm:text-4xl">{selectedView.stamp.title}</h2>
                    <p className="achievement-handwriting mt-4 min-h-16 whitespace-pre-wrap text-xl leading-8 text-[#59615c]">{selectedView.stamp.note || "这一枚印章没有附言。"}</p>
                    {selectedView.stamp.location ? <p className="mt-4 flex items-center gap-2 text-sm text-[#686d68]"><MapPin className="h-4 w-4" />{selectedView.stamp.location}</p> : null}

                    <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                      <Link href={`/achievement?stamp=${encodeURIComponent(selectedView.stamp.id)}`} className="journal-ink-button inline-flex h-11 items-center justify-center gap-2 px-5 font-semibold text-[#f2f0e8]"><Pencil className="h-4 w-4" />编辑这枚印章</Link>
                      <button type="button" disabled={actionState === "exporting"} onClick={() => void exportStamp()} className="achievement-handwriting journal-topic relative flex h-11 items-center justify-center gap-2 px-4 text-base text-[#526b45] disabled:opacity-45"><Download className="h-4 w-4" />{actionState === "exporting" ? "正在生成…" : "再次下载 PNG"}</button>
                      <button type="button" onClick={() => setDeleteConfirmationOpen(true)} className="flex h-11 items-center justify-center gap-2 px-3 text-sm text-[#8b4b45] hover:text-[#a02f28]"><Trash2 className="h-4 w-4" />删除</button>
                    </div>

                    {actionState === "exported" ? <p role="status" className="mt-3 text-sm text-[#526b45]">人生凭证已开始下载。</p> : null}
                    {actionState === "error" ? <p role="alert" className="mt-3 text-sm text-[#a02f28]">{actionError}</p> : null}

                    {deleteConfirmationOpen ? (
                      <div className="mt-5 border-t border-[#b7b9b2] pt-4">
                        <p className="text-sm leading-6 text-[#6f3935]">删除后，这枚印章及其本地照片将无法恢复。</p>
                        <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row">
                          <button type="button" onClick={() => setDeleteConfirmationOpen(false)} className="h-10 px-4 text-sm text-[#5f6560]">保留这枚印章</button>
                          <button type="button" disabled={actionState === "deleting"} onClick={() => void removeStamp()} className="h-10 bg-[#8b3d37] px-4 text-sm font-semibold text-white disabled:opacity-55">{actionState === "deleting" ? "正在删除…" : "确认删除"}</button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>
            ) : viewState.stamps.length === 0 ? (
              <div className="mx-auto grid max-w-xl place-items-center py-24 text-center">
                <span className="grid h-20 w-20 place-items-center rounded-full border border-dashed border-[#7f8983] text-3xl text-[#526b45]">✦</span>
                <h2 className="achievement-title mt-6 text-2xl text-[#263b35]">护照还在等待第一枚印章</h2>
                <p className="mt-2 text-sm leading-6 text-[#686d68]">一次普通但真实的抵达，也值得被留下。</p>
                <Link href="/achievement" className="journal-ink-button mt-6 inline-flex h-11 items-center gap-2 px-5 font-semibold text-[#f2f0e8]"><Plus className="h-4 w-4" />盖下第一枚印章</Link>
              </div>
            ) : (
              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {viewState.stamps.map(({ stamp, thumbnailUrl }) => (
                  <article key={stamp.id} className="journal-paper-slip overflow-hidden p-4 sm:p-5" style={{ contentVisibility: "auto", containIntrinsicSize: "280px" }}>
                    <button type="button" onClick={() => openStamp(stamp.id)} className="block w-full text-left">
                      {thumbnailUrl ? <div role="img" aria-label={`${stamp.title}的照片`} className="mb-4 aspect-[4/3] bg-[#c9ccc7] bg-cover bg-center" style={{ backgroundImage: `url(${thumbnailUrl})` }} /> : <div aria-hidden="true" className="mb-4 grid aspect-[4/3] place-items-center border border-dashed border-[#a7aca6] text-4xl text-[#526b45]">{stamp.icon}</div>}
                      <div className="flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.1em] text-[#68716c]"><span>{stamp.category}</span><time dateTime={stamp.date}>{formatDate(stamp.date)}</time></div>
                      <h2 className="achievement-title mt-3 text-2xl text-[#263b35]">{stamp.title}</h2>
                      {stamp.note ? <p className="achievement-handwriting mt-2 line-clamp-2 min-h-12 text-lg leading-6 text-[#59615c]">{stamp.note}</p> : <p className="mt-2 min-h-12 text-sm text-[#8a8f8a]">这一枚印章没有附言。</p>}
                      {stamp.location ? <p className="mt-3 flex items-center gap-1.5 text-xs text-[#686d68]"><MapPin className="h-3.5 w-3.5" />{stamp.location}</p> : null}
                      <span className="achievement-handwriting mt-4 inline-block text-sm text-[#526b45]">查看这枚印章 ↗</span>
                    </button>
                  </article>
                ))}
              </div>
            )}
          </>
        ) : null}
      </section>
    </main>
  );
}
