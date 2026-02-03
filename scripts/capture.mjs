import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

async function captureLocal() {
  const url = 'http://localhost:3000/zaizai-isle';
  const outputDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../screenshots');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const savePath = path.join(outputDir, `Zaizai Isle-${timestamp}.png`);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1920, height: 1080 },
    });

    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    await new Promise((r) => setTimeout(r, 2000));

    await page.screenshot({
      path: savePath,
      fullPage: true,
      omitBackground: true,
    });

    console.log(`✅ Screenshot saved to: ${savePath}`);
  } catch (error) {
    console.error(`❌ Capture failed: ${error.message}`);
  } finally {
    if (browser) await browser.close();
  }
}

captureLocal();
