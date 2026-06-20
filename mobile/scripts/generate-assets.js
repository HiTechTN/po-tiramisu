const sharp = require('sharp');

async function generateAssets() {
  // ── Splash Screen (1284x2778) ──────────────────
  const splashSvg = `<svg width="1284" height="2778" viewBox="0 0 1284 2778" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6B3410"/>
      <stop offset="50%" stop-color="#8B4513"/>
      <stop offset="100%" stop-color="#A0522D"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <text x="50%" y="42%" text-anchor="middle" font-family="Georgia, serif" font-size="180" fill="#FFFFFF">&#x1F370;</text>
  <text x="50%" y="54%" text-anchor="middle" font-family="Georgia, serif" font-size="88" font-weight="bold" fill="#FFFFFF">Po Tiramisu</text>
  <text x="50%" y="61%" text-anchor="middle" font-family="Georgia, serif" font-size="36" fill="#FDF6EE" letter-spacing="6">TIRAMISUS ARTISANAUX</text>
</svg>`;

  await sharp(Buffer.from(splashSvg))
    .resize(1284, 2778)
    .png()
    .toFile('assets/splash.png');
  console.log('✅ Splash screen created (1284x2778)');

  // ── App Icon (1024x1024) ───────────────────────
  const iconSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6B3410"/>
      <stop offset="50%" stop-color="#8B4513"/>
      <stop offset="100%" stop-color="#A0522D"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" rx="200" ry="200" fill="url(#bg)"/>
  <text x="50%" y="48%" text-anchor="middle" font-family="Georgia, serif" font-size="320" fill="#FFFFFF">&#x1F370;</text>
  <text x="50%" y="78%" text-anchor="middle" font-family="Georgia, serif" font-size="48" font-weight="bold" fill="#FDF6EE" letter-spacing="4">PO TIRAMISU</text>
</svg>`;

  await sharp(Buffer.from(iconSvg))
    .resize(1024, 1024)
    .png()
    .toFile('assets/icon.png');
  console.log('✅ App icon created (1024x1024)');

  // ── Favicon (48x48) ────────────────────────────
  const faviconSvg = `<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" rx="8" fill="#8B4513"/>
  <text x="50%" y="70%" text-anchor="middle" font-size="28">&#x1F370;</text>
</svg>`;

  await sharp(Buffer.from(faviconSvg))
    .resize(48, 48)
    .png()
    .toFile('assets/favicon.png');
  console.log('✅ Favicon created (48x48)');

  // ── Adaptive Icon Foreground (512x512) ──────────
  const fgSvg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <text x="50%" y="55%" text-anchor="middle" font-family="Georgia, serif" font-size="280" fill="#FFFFFF">&#x1F370;</text>
</svg>`;

  await sharp(Buffer.from(fgSvg))
    .resize(512, 512)
    .png()
    .toFile('assets/android-icon-foreground.png');
  console.log('✅ Android foreground icon created (512x512)');

  // ── Adaptive Icon Background (512x512) ──────────
  const bgSvg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#8B4513"/>
</svg>`;

  await sharp(Buffer.from(bgSvg))
    .resize(512, 512)
    .png()
    .toFile('assets/android-icon-background.png');
  console.log('✅ Android background icon created (512x512)');

  // ── Monochrome Icon (432x432) ───────────────────
  const monoSvg = `<svg width="432" height="432" viewBox="0 0 432 432" xmlns="http://www.w3.org/2000/svg">
  <text x="50%" y="55%" text-anchor="middle" font-family="Georgia, serif" font-size="240" fill="#FFFFFF">&#x1F370;</text>
</svg>`;

  await sharp(Buffer.from(monoSvg))
    .resize(432, 432)
    .png()
    .toFile('assets/android-icon-monochrome.png');
  console.log('✅ Monochrome icon created (432x432)');

  console.log('\n🎉 All mobile assets generated successfully!');
}

generateAssets().catch(console.error);
