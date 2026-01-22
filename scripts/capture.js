const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * Capture screenshot of the local development page
 */
async function captureLocal() {
    const url = 'http://localhost:3000/zaizai-isle'; // Adjust based on your local dev server URL and basePath
    const outputDir = path.resolve(__dirname, '../screenshots');
    
    // Create screenshots directory if it doesn't exist
    if (!fs.existsSync(outputDir)){
        fs.mkdirSync(outputDir);
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const savePath = path.join(outputDir, `Zaizai Isle-${timestamp}.png`);

    console.log(`Target URL: ${url}`);
    console.log(`Launching Puppeteer...`);

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: { width: 1920, height: 1080 }
        });

        const page = await browser.newPage();
        
        // Navigate to the page
        console.log('Navigating to page...');
        try {
            await page.goto(url, { 
                waitUntil: 'networkidle0', // Wait until network is idle (no active connections)
                timeout: 30000 
            });
        } catch (e) {
            console.error('Error loading page. Make sure "npm run dev" is running!');
            throw e;
        }

        // Wait a bit more for animations/fonts
        await new Promise(r => setTimeout(r, 2000));

        // Capture full page
        console.log('Capturing full page screenshot...');
        await page.screenshot({ 
            path: savePath, 
            fullPage: true,
            omitBackground: true
        });

        console.log(`✅ Screenshot saved to: ${savePath}`);
    } catch (error) {
        console.error(`❌ Capture failed: ${error.message}`);
    } finally {
        if (browser) await browser.close();
    }
}

captureLocal();
