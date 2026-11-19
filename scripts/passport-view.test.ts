import assert from "node:assert/strict";
import test from "node:test";
import { loadStampPoster, loadStampThumb } from "../src/app/achievement/passport-view-data";

const blob = (tag: string) => ({ tag } as unknown as Blob);
const urls: string[] = [];
const createUrl = (b: Blob) => { const u = `blob:${(b as { tag: string }).tag}`; urls.push(u); return u; };

test("passport thumbs: 一张坏图只坏一张，其余记录照常出缩略图", async () => {
  const stamps = [
    { id: "a", hasPhoto: true },
    { id: "b", hasPhoto: true },
    { id: "c", hasPhoto: true },
  ];
  const getPhoto = async (id: string) => {
    if (id === "b") throw new Error("云端照片读取失败");
    return { thumbnailBlob: blob(`thumb-${id}`), sourceBlob: blob(`source-${id}`) };
  };
  const states = await Promise.all(stamps.map((s) => loadStampThumb(s, getPhoto, createUrl)));
  assert.equal(states[0].status, "ready");
  assert.equal(states[2].status, "ready");
  assert.equal(states[1].status, "error");
  assert.ok((states[0] as { url: string }).url.endsWith("thumb-a"));
  assert.ok((states[2] as { url: string }).url.endsWith("thumb-c"));
});

test("passport thumbs: 无照片与缺记录都是空态，不发起读取也不报错", async () => {
  let touched = 0;
  const getPhoto = async () => { touched += 1; return undefined; };
  assert.equal((await loadStampThumb({ id: "x", hasPhoto: false }, getPhoto, createUrl)).status, "empty");
  assert.equal(touched, 0, "无照片的印章不应触发照片读取");
  assert.deepEqual(
    await loadStampThumb({ id: "y", hasPhoto: true }, getPhoto, createUrl),
    { status: "empty", reason: "照片记录缺失" }
  );
});

test("passport poster: 原图与海报仅在按需渲染时处理，坏图只影响该枚", async () => {
  const renderCalls: string[] = [];
  const getPhoto = async (id: string) => {
    if (id === "broken-photo") throw new Error("云端照片读取失败");
    return { thumbnailBlob: blob("t"), sourceBlob: blob("s") };
  };
  const render = async (stamp: { id: string }, photo: { sourceBlob: Blob } | undefined) => {
    renderCalls.push(stamp.id);
    if (stamp.id === "bad-render") throw new Error("无法读取照片");
    return `poster:${stamp.id}:${photo ? "有原图" : "无照片"}`;
  };
  const ok = await loadStampPoster({ id: "good", hasPhoto: true }, getPhoto, render);
  assert.deepEqual(ok, { status: "ready", poster: "poster:good:有原图" });
  const noPhoto = await loadStampPoster({ id: "bare", hasPhoto: false }, getPhoto, render);
  assert.deepEqual(noPhoto, { status: "ready", poster: "poster:bare:无照片" });
  const brokenPhoto = await loadStampPoster({ id: "broken-photo", hasPhoto: true }, getPhoto, render);
  assert.equal(brokenPhoto.status, "error");
  const badRender = await loadStampPoster({ id: "bad-render", hasPhoto: true }, getPhoto, render);
  assert.equal(badRender.status, "error");
  // 坏照片那枚连排版都不发起；排版失败那枚走到了 render 才被隔离。
  assert.deepEqual(renderCalls, ["good", "bare", "bad-render"]);
});
