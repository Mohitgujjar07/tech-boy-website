const https = require('https');

function checkURL(url, name) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`\n=== LIVE CHECK: ${name} (${url}) ===`);
        console.log(`Status code: ${res.statusCode}`);
        console.log(`Canonical tag: ${data.includes('rel="canonical"')}`);
        console.log(`OpenGraph title: ${data.includes('property="og:title"')}`);
        console.log(`Twitter card: ${data.includes('twitter:card')}`);
        console.log(`Schema.org JSON-LD: ${data.includes('application/ld+json')}`);
        console.log(`WebP picture tag: ${data.includes('type="image/webp"')}`);
        console.log(`Skip to content: ${data.includes('class="skip-link"')}`);
        resolve();
      });
    }).on('error', (e) => {
      console.error(`Error fetching ${url}:`, e.message);
      resolve();
    });
  });
}

async function run() {
  await checkURL('https://aarambhx-technology.vercel.app/', 'Agency Index');
  await checkURL('https://aarambhx-technology.vercel.app/academy', 'AarambhX Academy');
}

run();
