/**
 * Download Authentic Real Photography for AarambhX Engineering Journal
 * Sourced from professional photographers on Unsplash (Zero AI Generation)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DEST_DIR = path.resolve(__dirname, '..', 'assets', 'journal');

const REAL_IMAGES = [
  {
    name: 'claude-code-terminal.webp',
    title: 'Claude Code Terminal Session',
    url: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=1200&fm=webp&q=80'
  },
  {
    name: 'deepseek-datacenter-ai.webp',
    title: 'DeepSeek Datacenter AI Server Racks',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&fm=webp&q=80'
  },
  {
    name: 'vibe-coding-workspace.webp',
    title: 'Vibe Coding Modern Workspace',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&fm=webp&q=80'
  },
  {
    name: 'computer-use-automation.webp',
    title: 'Multi-Screen Computer Use Workstation',
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&fm=webp&q=80'
  },
  {
    name: 'build-ai-agent-python.webp',
    title: 'Developer Coding Python AI Agent',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&fm=webp&q=80'
  }
];

function downloadFile(urlStr, destPath) {
  return new Promise((resolve, reject) => {
    https.get(urlStr, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AarambhX/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadFile(res.headers.location, destPath));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} from ${urlStr}`));
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function run() {
  if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
  }

  console.log('Downloading real authentic tech photography into assets/journal/...\n');

  for (const item of REAL_IMAGES) {
    const targetFile = path.join(DEST_DIR, item.name);
    console.log(`- Downloading "${item.title}" -> assets/journal/${item.name}...`);
    try {
      await downloadFile(item.url, targetFile);
      const stat = fs.statSync(targetFile);
      console.log(`  ✔ Successfully saved ${(stat.size / 1024).toFixed(1)} KB`);
    } catch (err) {
      console.error(`  ✘ Failed to download ${item.name}: ${err.message}`);
    }
  }

  console.log('\nAll real images processed successfully.');
}

if (require.main === module) {
  run().catch(console.error);
}

module.exports = { run };
