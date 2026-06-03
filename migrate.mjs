/**
 * 数据迁移脚本 v2 — 支持自动重试 + 断点续传
 *
 * 使用方法：
 *   1. 填入下方四个配置项
 *   2. node migrate.mjs
 *
 * 断点续传：迁移进度会保存在 migrate-progress.json
 * 如果中途中断，重新运行会自动跳过已成功的条目
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';

// ─── 配置区 ──────────────────────────────────────────
const OLD_SUPABASE_URL = 'https://backend.appmiaoda.com/projects/supabase251289015490232320';
const OLD_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMDc5MzM5MTcwLCJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwic3ViIjoiYW5vbiJ9.s8jx-AV8s9HMRGeAemYeO3-dNTPxl5W_GGHwbXjkLl8';

const NEW_SUPABASE_URL = 'https://luudxrfzwwirsszqtgiu.supabase.co';    // ← 填你自己的
const NEW_SUPABASE_KEY = 'sb_publishable_Pf6swFljMSj2wl2rbaAu2g_FtEp6qSr';  // ← 填你自己的

const NEW_BUCKET = 'banana_images';
const PROGRESS_FILE = './migrate-progress.json';  // 进度存档文件
const RETRY_TIMES = 3;    // 每条最多重试次数
const DELAY_MS = 300;     // 每条间隔（ms），避免限流
// ─────────────────────────────────────────────────────

const oldDb = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_KEY);
const newDb = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_KEY);

// 读取进度存档
function loadProgress() {
  if (!existsSync(PROGRESS_FILE)) return { done: [] };
  try {
    return JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'));
  } catch {
    return { done: [] };
  }
}

// 保存进度存档
function saveProgress(done) {
  writeFileSync(PROGRESS_FILE, JSON.stringify({ done }, null, 2));
}

// 带重试的 fetch
async function fetchWithRetry(url, retries = RETRY_TIMES) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.arrayBuffer();
    } catch (err) {
      if (i === retries - 1) throw err;
      const wait = 1000 * (i + 1);
      console.log(`    重试 ${i + 1}/${retries - 1}，等待 ${wait}ms...`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}

// 上传图片到新存储桶，返回公开 URL
async function uploadImage(buffer, path, mimeType = 'image/png') {
  const { data, error } = await newDb.storage
    .from(NEW_BUCKET)
    .upload(path, buffer, { contentType: mimeType, upsert: true });
  if (error) throw new Error(`上传失败: ${error.message}`);
  const { data: urlData } = newDb.storage.from(NEW_BUCKET).getPublicUrl(data.path);
  return urlData.publicUrl;
}

function guessMime(url) {
  if (url.includes('.png')) return 'image/png';
  if (url.includes('.webp')) return 'image/webp';
  if (url.includes('.gif')) return 'image/gif';
  return 'image/jpeg';
}

async function migrate() {
  console.log('🍌 数据迁移脚本 v2\n');

  // 读取进度
  const progress = loadProgress();
  const doneSet = new Set(progress.done);
  if (doneSet.size > 0) {
    console.log(`📂 发现进度存档，已完成 ${doneSet.size} 条，将跳过这些记录\n`);
  }

  // 读取原平台全部数据
  let allWorks = [];
  let offset = 0;
  const pageSize = 1000;

  console.log('📥 读取原平台数据...');
  while (true) {
    const { data, error } = await oldDb
      .from('banana_works')
      .select('*')
      .order('created_at', { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('❌ 读取原平台数据失败:', error.message);
      process.exit(1);
    }
    if (!data || data.length === 0) break;
    allWorks = allWorks.concat(data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  const total = allWorks.length;
  const toMigrate = allWorks.filter((w) => !doneSet.has(w.id));
  console.log(`共 ${total} 条，需迁移 ${toMigrate.length} 条\n`);

  let success = 0;
  let failed = 0;
  const failedIds = [];

  for (let i = 0; i < toMigrate.length; i++) {
    const work = toMigrate[i];
    console.log(`[${i + 1}/${toMigrate.length}] ${work.id}`);

    try {
      // 下载 + 上传原始图片
      const origMime = guessMime(work.original_image_url);
      const origExt = origMime.split('/')[1];
      const origBuffer = await fetchWithRetry(work.original_image_url);
      const newOrigUrl = await uploadImage(origBuffer, `originals/${work.id}.${origExt}`, origMime);

      // 下载 + 上传香蕉化图片
      const bananaBuffer = await fetchWithRetry(work.banana_image_url);
      const newBananaUrl = await uploadImage(bananaBuffer, `bananas/${work.id}.png`, 'image/png');

      // 写入新数据库
      const { error: insertError } = await newDb.from('banana_works').upsert({
        id: work.id,
        original_image_url: newOrigUrl,
        banana_image_url: newBananaUrl,
        analysis_report: work.analysis_report,
        likes: work.likes,
        created_at: work.created_at,
      });
      if (insertError) throw new Error(`写入数据库失败: ${insertError.message}`);

      // 记录进度
      doneSet.add(work.id);
      saveProgress([...doneSet]);
      console.log(`  ✅ 成功`);
      success++;
    } catch (err) {
      console.log(`  ❌ 失败: ${err.message}`);
      failed++;
      failedIds.push(work.id);
    }

    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  console.log(`\n🎉 迁移完成！成功 ${success} 条，失败 ${failed} 条`);

  if (failedIds.length > 0) {
    console.log('\n失败的 ID：');
    failedIds.forEach((id) => console.log(`  - ${id}`));
    console.log('\n提示：再次运行脚本可自动重试失败的条目（已成功的会跳过）');
  } else {
    console.log('\n✨ 全部迁移成功！可以删除 migrate-progress.json 了');
  }
}

migrate().catch(console.error);
