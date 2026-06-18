const puppeteer = require('puppeteer-core');
const fs = require('fs');
const https = require('https');
const path = require('path');

(async () => {
  let browser;
  try {
    const browserURL = 'http://127.0.0.1:9222';
    browser = await puppeteer.connect({ browserURL });
    const page = await browser.newPage();
    console.log("Navigating to Instagram...");
    await page.goto('https://www.instagram.com/po_tiramisu?igsh=cjMyc3ltejg0MDQ0', { waitUntil: 'networkidle2' });
    
    console.log("Waiting for images...");
    await page.waitForSelector('img');
    await new Promise(r => setTimeout(r, 5000)); // extra wait for dynamic loading
    
    const images = await page.$$eval('img', imgs => imgs.map(img => img.src).filter(src => src && src.startsWith('http')));
    console.log(`Found ${images.length} images.`);
    
    // We only care about large enough images, maybe the first few distinct ones.
    const uniqueImages = [...new Set(images)].filter(src => src.includes('s150x150') === false && src.includes('150x150') === false); // trying to filter out small thumbnails if possible, though instagram uses srcset
    
    console.log("Downloading first 5 images...");
    let i = 1;
    for (const imgUrl of uniqueImages.slice(0, 5)) {
       const dest = path.join(__dirname, 'apps/web/public/images', `insta_${i}.jpg`);
       const file = fs.createWriteStream(dest);
       https.get(imgUrl, function(response) {
         response.pipe(file);
         file.on('finish', function() {
           file.close();  // close() is async, call cb after close completes.
           console.log(`Saved ${dest}`);
         });
       });
       i++;
    }
    await page.close();
  } catch (err) {
    console.error("Error:", err);
  } finally {
    if (browser) await browser.disconnect();
  }
})();
