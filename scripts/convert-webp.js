/**
 * @file convert-webp.js
 * @description Automatically discovers and converts JPG/PNG images to modern WebP format
 * using the system-installed FFmpeg binary for optimal compression and zero layout shift.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');

// Candidate images to convert
const imagePaths = [
  path.join(ROOT_DIR, 'hero.jpg'),
  path.join(ASSETS_DIR, 'aarambhx-logo.jpg'),
  path.join(ASSETS_DIR, 'logo.jpg'),
  path.join(ASSETS_DIR, 'logo-circle.png'),
  path.join(ASSETS_DIR, 'logo-transparent.png'),
  path.join(ASSETS_DIR, 'favicon.png'),
  path.join(ASSETS_DIR, 'art', 'tracks-floating-island-sunset.jpg'),
  path.join(ASSETS_DIR, 'art', 'booking-streetlamp-matrix.png'),
  path.join(ASSETS_DIR, 'art', 'faq-ascii-clouds.png'),
  path.join(ASSETS_DIR, 'art', 'academy-hero-landscape.jpg'),
  path.join(ASSETS_DIR, 'art', 'touch-hands-matrix.png'),
  path.join(ASSETS_DIR, 'art', 'footer-cyber-desk.jpg'),
  path.join(ASSETS_DIR, 'art', 'work-hero-meadow-beam.png'),
  path.join(ASSETS_DIR, 'art', 'client-turnkey-preview.jpg'),
  path.join(ASSETS_DIR, 'art', 'vms-preview.jpg'),
  path.join(ASSETS_DIR, 'art', 'iot-telemetry-preview.jpg'),
  path.join(ASSETS_DIR, 'art', 'lab-ledger-preview.jpg'),
  path.join(ASSETS_DIR, 'art', 'concert-entry-preview.jpg'),
  path.join(ASSETS_DIR, 'art', 'elector-portal-preview.jpg'),
  path.join(ASSETS_DIR, 'art', 'student-innovation-aurora.jpg'),
  path.join(ASSETS_DIR, 'art', 'laptop-matrix-glow.jpg'),
  path.join(ASSETS_DIR, 'art', 'bonsai-matrix-code.jpg'),
  path.join(ASSETS_DIR, 'art', 'diagnostic-paper-plane.jpg'),
  path.join(ASSETS_DIR, 'art', 'digital-cloud-sunset.jpg'),
  path.join(ASSETS_DIR, 'art', 'emerald-matrix-clouds.png'),
  path.join(ASSETS_DIR, 'art', 'hero-digital-clouds.jpg'),
  path.join(ASSETS_DIR, 'art', 'methodology-halo-ring.jpg'),
  path.join(ASSETS_DIR, 'art', 'mountain-matrix-peak.jpg'),
  path.join(ASSETS_DIR, 'art', 'testimonials-matrix-portal.jpg'),
  path.join(ASSETS_DIR, 'art', 'built-to-scale-horizon.jpg'),
  path.join(ASSETS_DIR, 'art', 'booking-retro-crt-mountains.jpg')
];

console.log('=== AARAMBHX TECHNOLOGY: WEBP OPTIMIZATION PIPELINE ===\n');

let totalOriginalSize = 0;
let totalWebpSize = 0;
let convertedCount = 0;

imagePaths.forEach(imgFile => {
  if (!fs.existsSync(imgFile)) {
    return;
  }

  const origStat = fs.statSync(imgFile);
  const webpFile = imgFile.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  totalOriginalSize += origStat.size;

  try {
    // Quality 82 provides near lossless perception with 40-70% size reduction
    const cmd = `ffmpeg -y -i "${imgFile}" -c:v libwebp -quality 82 "${webpFile}"`;
    execSync(cmd, { stdio: 'pipe' });

    if (fs.existsSync(webpFile)) {
      const webpStat = fs.statSync(webpFile);
      totalWebpSize += webpStat.size;
      convertedCount++;
      const savedPct = (((origStat.size - webpStat.size) / origStat.size) * 100).toFixed(1);
      console.log(`✔ Converted: ${path.relative(ROOT_DIR, imgFile)} (${(origStat.size / 1024).toFixed(1)} KB) -> ${(webpStat.size / 1024).toFixed(1)} KB (-${savedPct}%)`);
    }
  } catch (err) {
    console.error(`✖ Failed to convert ${imgFile}:`, err.message);
  }
});

const totalSavedPct = (((totalOriginalSize - totalWebpSize) / totalOriginalSize) * 100).toFixed(1);
console.log(`\n======================================================`);
console.log(`Successfully converted ${convertedCount} images to WebP.`);
console.log(`Original total: ${(totalOriginalSize / (1024 * 1024)).toFixed(2)} MB`);
console.log(`WebP total:     ${(totalWebpSize / (1024 * 1024)).toFixed(2)} MB`);
console.log(`Total Reduction: -${totalSavedPct}% byte savings!`);
console.log(`======================================================\n`);
