const https = require('https');

const DOMAINS = [
  { name: 'GitHub Pages', base: 'https://mohitgujjar07.github.io/tech-boy-website' },
  { name: 'Vercel', base: 'https://aarambhx-technology.vercel.app' },
  { name: 'Firebase (Default Project)', base: 'https://aarambhx-technology-58499.web.app' },
  { name: 'Firebase (Alt Site 1)', base: 'https://aarambhx-tech.web.app' },
  { name: 'Firebase (Alt Site 2)', base: 'https://aarambhxtech.web.app' }
];

const ROUTES = [
  '/',
  '/highlights',
  '/highlights.html',
  '/admin',
  '/admin.html',
  '/academy',
  '/academy.html',
  '/work',
  '/work.html',
  '/brochure',
  '/brochure.html',
  '/verify',
  '/verify.html'
];

async function checkUrl(initialUrl) {
  try {
    const res = await fetch(initialUrl, { redirect: 'follow' });
    const text = await res.text();
    return {
      status: res.status,
      redirected: res.redirected,
      finalUrl: res.url,
      size: text.length,
      hasBiec: text.includes('BIEC') || text.includes('Electronica'),
      hasRyzen: text.includes('Ryzen') || text.includes('Lenovo'),
      hasInvoice: text.includes('AX-INV') || text.includes('Invoice Generator') || text.includes('Generate Invoice'),
      hasOldPromo: text.includes('100% Practical Campus Delivery')
    };
  } catch (err) {
    return { error: err.message };
  }
}

async function run() {
  console.log('=== VERIFYING TRI-PLATFORM LIVE DEPLOYMENTS (FOLLOWING REDIRECTS) ===\n');
  for (const domain of DOMAINS) {
    console.log(`\n------------------------------------------------------------`);
    console.log(`Platform: ${domain.name} (${domain.base})`);
    console.log(`------------------------------------------------------------`);
    for (const route of ROUTES) {
      const fullUrl = `${domain.base}${route}`;
      const res = await checkUrl(fullUrl);
      if (res.error) {
        console.log(`  ❌ ${route} -> Error: ${res.error}`);
      } else {
        const ok = res.status === 200;
        const icon = ok ? '✅' : '❌';
        let flags = [];
        if (res.redirected) flags.push(`redirected to ${res.finalUrl.replace(domain.base, '')}`);
        if (route.includes('highlights')) {
          flags.push(`BIEC:${res.hasBiec ? 'YES' : 'NO'}`);
          flags.push(`Ryzen:${res.hasRyzen ? 'YES' : 'NO'}`);
          flags.push(`OldPromo:${res.hasOldPromo ? 'STILL_PRESENT' : 'REMOVED'}`);
        }
        if (route.includes('admin')) {
          flags.push(`InvoiceGen:${res.hasInvoice ? 'YES' : 'NO'}`);
        }
        const flagStr = flags.length ? ` [${flags.join(', ')}]` : '';
        console.log(`  ${icon} ${route} -> HTTP ${res.status} (${res.size} bytes)${flagStr}`);
      }
    }
  }
}

run();
