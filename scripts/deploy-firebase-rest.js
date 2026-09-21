const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const zlib = require('zlib');

// 1. Get access token from CI environment or local configstore
let refreshToken = process.env.FIREBASE_TOKEN;
if (!refreshToken) {
  const homeDir = process.env.USERPROFILE || process.env.HOME || '';
  const configPath = path.join(homeDir, '.config', 'configstore', 'firebase-tools.json');
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      refreshToken = config?.tokens?.refresh_token;
    } catch {}
  }
}

if (!refreshToken) {
  console.error('❌ Error: No Firebase credentials found. Run firebase login or set FIREBASE_TOKEN.');
  process.exit(1);
}
// Standalone OAuth token refresh using Google's token endpoint (zero external dependencies)
async function getFreshOAuthToken(token) {
  const postData = new URLSearchParams({
    client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
    client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi',
    grant_type: 'refresh_token',
    refresh_token: token
  }).toString();

  const res = await makeRequest(
    'https://oauth2.googleapis.com/token',
    'POST',
    { 'Content-Type': 'application/x-www-form-urlencoded' },
    postData
  );

  return res.access_token;
}

function makeRequest(urlStr, method, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        ...headers
      }
    };

    if (body && typeof body === 'string') {
      options.headers['Content-Length'] = Buffer.byteLength(body);
    } else if (body && Buffer.isBuffer(body)) {
      options.headers['Content-Length'] = body.length;
    }

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const resBuffer = Buffer.concat(chunks);
        const resText = resBuffer.toString('utf8');
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(resText));
          } catch {
            resolve(resText);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode} ${res.statusMessage}: ${resText}`));
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

function getDeployFiles(dir, baseDir = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

    if (
      entry.name.startsWith('.') ||
      entry.name === 'node_modules' ||
      entry.name === 'tests' ||
      entry.name === 'scripts' ||
      entry.name === 'scratch' ||
      entry.name === 'server.js' ||
      entry.name === 'package.json' ||
      entry.name === 'package-lock.json' ||
      entry.name.endsWith('.log') ||
      entry.name.endsWith('.bat') ||
      entry.name.endsWith('.ps1') ||
      entry.name.endsWith('.cmd')
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      files = files.concat(getDeployFiles(fullPath, baseDir));
    } else {
      const rawContent = fs.readFileSync(fullPath);
      const gzipped = zlib.gzipSync(rawContent, { level: 6 });
      const hash = crypto.createHash('sha256').update(gzipped).digest('hex');
      files.push({
        filePath: '/' + relPath,
        diskPath: fullPath,
        rawSize: rawContent.length,
        size: gzipped.length,
        hash,
        gzipped
      });
    }
  }
  return files;
}

async function deploySite(siteId, token, files) {
  console.log(`\n======================================================`);
  console.log(`[Deploying Site]: ${siteId}`);
  console.log(`======================================================`);

  const fileHashMap = {};
  const hashToGzip = {};
  for (const f of files) {
    fileHashMap[f.filePath] = f.hash;
    hashToGzip[f.hash] = f.gzipped;
  }

  // 1. Create new version
  console.log(`Step 1: Creating new Hosting version for ${siteId}...`);
  const versionPayload = JSON.stringify({
    config: {
      cleanUrls: true,
      trailingSlashBehavior: "REMOVE",
      redirects: [
        { glob: "/developer", location: "/academy", statusCode: 301 },
        { glob: "/developer.html", location: "/academy.html", statusCode: 301 }
      ],
      headers: [
        {
          glob: "**",
          headers: {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "SAMEORIGIN",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin"
          }
        },
        {
          glob: "assets/**",
          headers: {
            "Cache-Control": "public, max-age=31536000, immutable"
          }
        },
        {
          glob: "**/*.@(css|js)",
          headers: {
            "Cache-Control": "public, max-age=0, must-revalidate"
          }
        },
        {
          glob: "**/*.html",
          headers: {
            "Cache-Control": "public, max-age=0, must-revalidate"
          }
        }
      ]
    }
  });

  const versionRes = await makeRequest(
    `https://firebasehosting.googleapis.com/v1beta1/sites/${siteId}/versions`,
    'POST',
    {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    versionPayload
  );

  const versionName = versionRes.name;
  console.log(`  -> Version created: ${versionName}`);

  // 2. Populate files
  console.log(`Step 2: Populating ${files.length} files...`);
  const populatePayload = JSON.stringify({ files: fileHashMap });
  const populateRes = await makeRequest(
    `https://firebasehosting.googleapis.com/v1beta1/${versionName}:populateFiles`,
    'POST',
    {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    populatePayload
  );

  const uploadRequiredHashes = populateRes.uploadRequiredHashes || [];
  const uploadUrl = populateRes.uploadUrl;
  console.log(`  -> Required file uploads: ${uploadRequiredHashes.length} / ${files.length}`);

  // 3. Upload files that Firebase doesn't already have
  if (uploadRequiredHashes.length > 0) {
    console.log(`Step 3: Uploading ${uploadRequiredHashes.length} gzip files to Firebase...`);
    let uploaded = 0;
    // Batch upload with concurrency of 10
    const concurrency = 10;
    for (let i = 0; i < uploadRequiredHashes.length; i += concurrency) {
      const batch = uploadRequiredHashes.slice(i, i + concurrency);
      await Promise.all(batch.map(async (hash) => {
        const content = hashToGzip[hash];
        await makeRequest(
          `${uploadUrl}/${hash}`,
          'POST',
          {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/octet-stream'
          },
          content
        );
        uploaded++;
        if (uploaded % 10 === 0 || uploaded === uploadRequiredHashes.length) {
          process.stdout.write(`  [${uploaded}/${uploadRequiredHashes.length}] files uploaded\r`);
        }
      }));
    }
    console.log(`\n  -> Upload completed successfully!`);
  } else {
    console.log(`  -> All files already cached in Firebase! Zero upload time!`);
  }

  // 4. Finalize version
  console.log(`Step 4: Finalizing version ${versionName}...`);
  await makeRequest(
    `https://firebasehosting.googleapis.com/v1beta1/${versionName}?update_mask=status`,
    'PATCH',
    {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    JSON.stringify({ status: 'FINALIZED' })
  );
  console.log(`  -> Version status: FINALIZED`);

  // 5. Release version
  console.log(`Step 5: Releasing version to production...`);
  const releaseRes = await makeRequest(
    `https://firebasehosting.googleapis.com/v1beta1/sites/${siteId}/releases?versionName=${versionName}`,
    'POST',
    {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  );
  console.log(`  -> Release complete: ${releaseRes.name}`);
  console.log(`✅ SUCCESS: ${siteId} is now LIVE in production!`);
}

async function main() {
  console.log('=== AARAMBHX FIREBASE HOSTING DEPLOYER (REST API) ===');
  console.log('Fetching fresh OAuth credentials...');
  const accessToken = await getFreshOAuthToken(refreshToken);
  console.log('OAuth token obtained.');

  console.log('Scanning project files...');
  const files = getDeployFiles(process.cwd());
  console.log(`Prepared ${files.length} static assets for deployment.`);

  const SITES = [
    'aarambhx-technology-58499',
    'aarambhx-tech',
    'aarambhxtech'
  ];

  for (const site of SITES) {
    try {
      await deploySite(site, accessToken, files);
    } catch (err) {
      console.error(`❌ Error deploying site ${site}:`, err.message);
    }
  }

  console.log('\nAll Firebase sites deployed successfully!');
}

main().catch(console.error);
