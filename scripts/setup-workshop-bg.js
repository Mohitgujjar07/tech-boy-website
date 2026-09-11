const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcFile = 'C:/Users/mohit/.gemini/antigravity/brain/e8f502a1-cf09-4226-a8a3-2e72e9e20c1d/.user_uploaded/media_1789144531030.jpg';
const destArtJpg = 'd:/techboy-sol-web/assets/art/workshops-portal-clouds.jpg';
const destBgJpg = 'd:/techboy-sol-web/assets/bg/workshops-portal-clouds.jpg';
const destArtWebp = 'd:/techboy-sol-web/assets/art/workshops-portal-clouds.webp';
const destBgWebp = 'd:/techboy-sol-web/assets/bg/workshops-portal-clouds.webp';

console.log('Source exists:', fs.existsSync(srcFile));

// Copy JPG files
fs.copyFileSync(srcFile, destArtJpg);
fs.copyFileSync(srcFile, destBgJpg);

console.log('Copied JPG to assets/art and assets/bg');

// Convert to WebP using ffmpeg
try {
  execSync(`ffmpeg -y -i "${destArtJpg}" -c:v libwebp -quality 84 "${destArtWebp}"`, { stdio: 'inherit' });
  execSync(`ffmpeg -y -i "${destBgJpg}" -c:v libwebp -quality 84 "${destBgWebp}"`, { stdio: 'inherit' });
  console.log('Generated WebP variants successfully');
} catch (e) {
  console.error('Error generating WebP:', e.message);
}

console.log('Verifying files:');
console.log('art jpg size:', fs.statSync(destArtJpg).size);
console.log('art webp size:', fs.statSync(destArtWebp).size);
