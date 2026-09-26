/**
 * @file build-favicons.js
 * @description Generates ultra-crisp, multi-resolution favicon and brand icon assets
 * from the master AarambhX Technology logo (assets/aarambhx-tech-logo-master.png).
 */

const { execSync } = require('child_process');
const fs = require('path');
const path = require('path');
const fsPromises = require('fs');

const ROOT_DIR = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const MASTER_LOGO = path.join(ASSETS_DIR, 'aarambhx-tech-logo-master.png');

console.log('=== AARAMBHX TECHNOLOGY: FAVICON BUILD PIPELINE ===\n');

if (!fsPromises.existsSync(MASTER_LOGO)) {
  console.error('Error: Master logo not found at', MASTER_LOGO);
  process.exit(1);
}

// 1. Crop emblem (A-mark + swoosh + star): 570x472
const emblemPath = path.join(ASSETS_DIR, 'emblem-only.png');
console.log('1. Extracting high-res brand emblem...');
execSync(`ffmpeg -y -i "${MASTER_LOGO}" -vf "crop=570:472:233:188" "${emblemPath}"`, { stdio: 'pipe' });

// 2. Pad to 800x800 square black canvas with balanced margins
const paddedMasterPath = path.join(ASSETS_DIR, 'favicon-master-padded.png');
console.log('2. Centering emblem on 800x800 black canvas...');
execSync(`ffmpeg -y -i "${emblemPath}" -vf "pad=800:800:115:164:black" "${paddedMasterPath}"`, { stdio: 'pipe' });

// 3. Generate PNG sizes: 128x128, 32x32, 16x16, 180x180
const sizes = [
  { file: 'favicon-128.png', size: 128 },
  { file: 'favicon-32.png', size: 32 },
  { file: 'favicon-16.png', size: 16 },
  { file: 'favicon.png', size: 128 },
  { file: 'apple-touch-icon.png', size: 180 }
];

sizes.forEach(({ file, size }) => {
  const target = path.join(ASSETS_DIR, file);
  console.log(`3. Generating assets/${file} (${size}x${size})...`);
  execSync(`ffmpeg -y -i "${paddedMasterPath}" -vf "scale=${size}:${size}" "${target}"`, { stdio: 'pipe' });
});

// 4. Generate root favicon.ico and assets/favicon.ico
console.log('4. Generating root favicon.ico and assets/favicon.ico...');
const rootIco = path.join(ROOT_DIR, 'favicon.ico');
const assetsIco = path.join(ASSETS_DIR, 'favicon.ico');
execSync(`ffmpeg -y -i "${paddedMasterPath}" -vf "scale=48:48" "${rootIco}"`, { stdio: 'pipe' });
fsPromises.copyFileSync(rootIco, assetsIco);

// 5. Generate assets/favicon.svg with embedded base64 of 128x128 emblem
console.log('5. Generating assets/favicon.svg with real brand emblem...');
const favicon128Path = path.join(ASSETS_DIR, 'favicon-128.png');
const b64 = fsPromises.readFileSync(favicon128Path).toString('base64');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <clipPath id="circleClip">
      <circle cx="32" cy="32" r="31.5"/>
    </clipPath>
  </defs>
  <circle cx="32" cy="32" r="32" fill="#000000"/>
  <image href="data:image/png;base64,${b64}" x="0" y="0" width="64" height="64" clip-path="url(#circleClip)"/>
</svg>
`;

const svgPath = path.join(ASSETS_DIR, 'favicon.svg');
fsPromises.writeFileSync(svgPath, svgContent, 'utf8');

// Clean up temporary padded master
if (fsPromises.existsSync(paddedMasterPath)) {
  fsPromises.unlinkSync(paddedMasterPath);
}

console.log('\n✔ Successfully built all favicon assets!');
