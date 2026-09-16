/**
 * @file optimize-gallery.js
 * @description Scans assets/gallery/photos/ and assets/gallery/videos/,
 * automatically converts images to modern WebP with ffmpeg,
 * and reports file sizes and readiness for the site.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PHOTOS_DIR = path.join(__dirname, '..', 'assets', 'gallery', 'photos');
const VIDEOS_DIR = path.join(__dirname, '..', 'assets', 'gallery', 'videos');

console.log('=== AARAMBHX GALLERY ASSET OPTIMIZER ===\n');

// 1. Photos
if (fs.existsSync(PHOTOS_DIR)) {
  const photoFiles = fs.readdirSync(PHOTOS_DIR).filter(f => !f.startsWith('.') && /\.(png|jpe?g|webp)$/i.test(f));
  console.log(`Discovered ${photoFiles.length} photo(s) in assets/gallery/photos/:`);

  photoFiles.forEach(file => {
    const filePath = path.join(PHOTOS_DIR, file);
    const ext = path.extname(file).toLowerCase();
    const stat = fs.statSync(filePath);
    console.log(`  • ${file} (${Math.round(stat.size / 1024)} KB)`);

    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      const webpName = file.replace(/\.(png|jpe?g)$/i, '.webp');
      const webpPath = path.join(PHOTOS_DIR, webpName);
      if (!fs.existsSync(webpPath)) {
        try {
          console.log(`    -> Converting to ${webpName}...`);
          execSync(`ffmpeg -y -i "${filePath}" -c:v libwebp -quality 85 "${webpPath}"`, { stdio: 'ignore' });
          const webpStat = fs.statSync(webpPath);
          console.log(`    ✔ Created ${webpName} (${Math.round(webpStat.size / 1024)} KB)`);
        } catch (err) {
          console.error(`    ✖ Failed to convert ${file}:`, err.message);
        }
      }
    }
  });
}

// 2. Videos
if (fs.existsSync(VIDEOS_DIR)) {
  const videoFiles = fs.readdirSync(VIDEOS_DIR).filter(f => !f.startsWith('.') && /\.(mp4|webm|mov)$/i.test(f));
  console.log(`\nDiscovered ${videoFiles.length} video(s) in assets/gallery/videos/:`);
  videoFiles.forEach(file => {
    const filePath = path.join(VIDEOS_DIR, file);
    const stat = fs.statSync(filePath);
    const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);
    console.log(`  • ${file} (${sizeMb} MB)`);
    if (stat.size > 15 * 1024 * 1024) {
      console.warn(`    ⚠️ Note: File is over 15MB. Consider compressing or hosting on YouTube.`);
    }
  });
}

console.log('\nGallery optimization scan complete!');
