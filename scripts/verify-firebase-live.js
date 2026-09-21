const urls = [
  'https://aarambhx-technology-58499.web.app/admin',
  'https://aarambhx-technology-58499.firebaseapp.com/admin',
  'https://aarambhx-tech.web.app/admin',
  'https://aarambhx-tech.firebaseapp.com/admin',
  'https://aarambhxtech.web.app/admin',
  'https://aarambhxtech.firebaseapp.com/admin'
];

async function check() {
  console.log('=== VERIFYING ALL FIREBASE LIVE DOMAINS ===');
  for (const url of urls) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      const html = await res.text();
      const hasSecure = html.includes('Secured Access &bull; Authorized Personnel Only');
      const hasOldEmail = html.includes('Restricted Access:');
      const hasOldPasskey = html.includes('Default Passkey:');
      console.log(`\nURL: ${url}`);
      console.log(`  -> HTTP Status: ${res.status}`);
      console.log(`  -> "Secured Access" badge present: ${hasSecure ? 'YES' : 'NO'}`);
      console.log(`  -> Old Whitelist emails exposed:   ${hasOldEmail ? 'LEAKED' : 'NONE (CLEAN)'}`);
      console.log(`  -> Default Passkey text exposed:   ${hasOldPasskey ? 'LEAKED' : 'NONE (CLEAN)'}`);
    } catch (e) {
      console.error(url, e.message);
    }
  }
}

check();
