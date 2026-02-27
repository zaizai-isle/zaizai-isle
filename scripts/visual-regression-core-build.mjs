import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.VR_BASE_URL || "http://127.0.0.1:3000/zaizai-isle/";
const UPDATE_BASELINE = process.argv.includes("--update");

const ROOT_DIR = path.resolve(__dirname, "..");
const BASELINE_DIR = path.join(ROOT_DIR, "tests", "visual", "baseline", "core-build");
const ACTUAL_DIR = path.join(ROOT_DIR, "tmp", "visual-regression", "core-build");
const MAX_DIFF_RATIO = 0.001;

const SCENARIOS = [
  {
    name: "desktop-light",
    viewport: { width: 1536, height: 960 },
    backgroundSettings: { type: "color", value: "#f3f5f8", textMode: "dark" },
  },
  {
    name: "desktop-dark",
    viewport: { width: 1536, height: 960 },
    backgroundSettings: { type: "color", value: "#0b1120", textMode: "light" },
  },
  {
    name: "mobile-light",
    viewport: { width: 430, height: 932 },
    backgroundSettings: { type: "color", value: "#f3f5f8", textMode: "dark" },
  },
  {
    name: "mobile-dark",
    viewport: { width: 430, height: 932 },
    backgroundSettings: { type: "color", value: "#0b1120", textMode: "light" },
  },
];

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function compareImages(actualPath, baselinePath) {
  const [actualImage, baselineImage] = await Promise.all([
    sharp(actualPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    sharp(baselinePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
  ]);

  const actualMeta = actualImage.info;
  const baselineMeta = baselineImage.info;

  if (
    actualMeta.width !== baselineMeta.width ||
    actualMeta.height !== baselineMeta.height ||
    actualMeta.channels !== baselineMeta.channels
  ) {
    return {
      passed: false,
      reason: "dimension-mismatch",
      details: `${actualMeta.width}x${actualMeta.height} vs ${baselineMeta.width}x${baselineMeta.height}`,
    };
  }

  let diffPixels = 0;
  const totalPixels = actualMeta.width * actualMeta.height;
  const channelCount = actualMeta.channels;
  const threshold = 12;

  for (let i = 0; i < actualImage.data.length; i += channelCount) {
    const dr = Math.abs(actualImage.data[i] - baselineImage.data[i]);
    const dg = Math.abs(actualImage.data[i + 1] - baselineImage.data[i + 1]);
    const db = Math.abs(actualImage.data[i + 2] - baselineImage.data[i + 2]);
    const da = Math.abs(actualImage.data[i + 3] - baselineImage.data[i + 3]);

    if (dr > threshold || dg > threshold || db > threshold || da > threshold) {
      diffPixels += 1;
    }
  }

  const diffRatio = diffPixels / totalPixels;
  return {
    passed: diffRatio <= MAX_DIFF_RATIO,
    reason: "pixel-diff",
    details: `${diffPixels}/${totalPixels} (${(diffRatio * 100).toFixed(4)}%)`,
  };
}

async function screenshotCard(page, outputPath) {
  await page.waitForSelector(".js-core-build-card", { timeout: 20000 });
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
      }
    `,
  });
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });
  await page.waitForNetworkIdle({ idleTime: 500, timeout: 15000 });

  const cardHandle = await page.$(".js-core-build-card");
  if (!cardHandle) {
    throw new Error("Cannot find .js-core-build-card on the page.");
  }

  await cardHandle.screenshot({ path: outputPath });
}

async function runScenario(browser, scenario) {
  const page = await browser.newPage();
  await page.setViewport(scenario.viewport);
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);

  await page.evaluateOnNewDocument((settings) => {
    localStorage.setItem("language", "zh");
    localStorage.setItem("background_settings", JSON.stringify(settings));
  }, scenario.backgroundSettings);

  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 45000 });
  const expectsLightCard = scenario.backgroundSettings.textMode === "dark";
  await page.waitForFunction(
    (shouldBeLight) => {
      const card = document.querySelector(".js-core-build-card");
      if (!card) return false;
      const className = card.className;
      const hasLightOverride = typeof className === "string" && className.includes("!bg-white/85");
      return shouldBeLight ? hasLightOverride : !hasLightOverride;
    },
    { timeout: 20000 },
    expectsLightCard
  );

  const actualPath = path.join(ACTUAL_DIR, `${scenario.name}.png`);
  const baselinePath = path.join(BASELINE_DIR, `${scenario.name}.png`);
  await screenshotCard(page, actualPath);

  await page.close();

  if (UPDATE_BASELINE || !existsSync(baselinePath)) {
    await fs.copyFile(actualPath, baselinePath);
    return { scenario: scenario.name, status: "baseline-updated" };
  }

  const comparison = await compareImages(actualPath, baselinePath);
  if (!comparison.passed) {
    return {
      scenario: scenario.name,
      status: "failed",
      actualPath,
      baselinePath,
      details: comparison.details,
      reason: comparison.reason,
    };
  }

  return { scenario: scenario.name, status: "passed" };
}

async function main() {
  await Promise.all([ensureDir(BASELINE_DIR), ensureDir(ACTUAL_DIR)]);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const results = [];
  try {
    for (const scenario of SCENARIOS) {
      results.push(await runScenario(browser, scenario));
    }
  } finally {
    await browser.close();
  }

  const failed = results.filter((result) => result.status === "failed");
  const updated = results.filter((result) => result.status === "baseline-updated");
  const passed = results.filter((result) => result.status === "passed");

  if (updated.length > 0) {
    for (const result of updated) {
      console.log(`🟡 baseline updated: ${result.scenario}`);
    }
  }

  for (const result of passed) {
    console.log(`✅ passed: ${result.scenario}`);
  }

  if (failed.length > 0) {
    for (const result of failed) {
      console.error(`❌ failed: ${result.scenario}`);
      console.error(`   reason:   ${result.reason}`);
      console.error(`   details:  ${result.details}`);
      console.error(`   baseline: ${result.baselinePath}`);
      console.error(`   actual:   ${result.actualPath}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`\nCore build visual regression passed (${results.length} scenarios).`);
}

main().catch((error) => {
  console.error("❌ visual regression execution failed:");
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
