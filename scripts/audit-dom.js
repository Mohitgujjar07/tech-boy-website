const fs = require('fs');
const path = require('path');

function inspectHTML(fileName) {
  const content = fs.readFileSync(fileName, 'utf8');
  console.log(`\n================== AUDITING ${fileName} ==================`);

  // Images
  const imgRegex = /<img([^>]*?)>/gi;
  let m;
  let totalImgs = 0;
  let missingAlt = 0;
  let missingDims = 0;

  while ((m = imgRegex.exec(content)) !== null) {
    totalImgs++;
    const attrs = m[1];
    const hasAlt = /alt=["'][^"']*["']/i.test(attrs);
    const hasWidth = /width=["'][^"']*["']/i.test(attrs);
    const hasHeight = /height=["'][^"']*["']/i.test(attrs);

    if (!hasAlt) missingAlt++;
    if (!hasWidth || !hasHeight) {
      missingDims++;
      const srcMatch = /src=["']([^"']*)["']/i.exec(attrs);
      console.log(`[IMG MISSING DIMS] src: ${srcMatch ? srcMatch[1] : 'unknown'} | attrs: ${attrs.trim()}`);
    }
  }
  console.log(`Total images: ${totalImgs}, Missing Alt: ${missingAlt}, Missing Width/Height: ${missingDims}`);

  // Forms and Labels
  const inputRegex = /<(input|select|textarea)([^>]*?)>/gi;
  let totalInputs = 0;
  let missingLabels = 0;
  while ((m = inputRegex.exec(content)) !== null) {
    totalInputs++;
    const attrs = m[2];
    const idMatch = /id=["']([^"']*)["']/i.exec(attrs);
    const ariaLabel = /aria-label=["'][^"']*["']/i.test(attrs);
    const typeMatch = /type=["']([^"']*)["']/i.exec(attrs);
    const type = typeMatch ? typeMatch[1].toLowerCase() : 'text';

    if (type === 'hidden' || type === 'submit' || type === 'button') continue;

    if (idMatch) {
      const id = idMatch[1];
      const hasLabel = new RegExp(`<label[^>]*for=["']${id}["']`, 'i').test(content);
      if (!hasLabel && !ariaLabel) {
        missingLabels++;
        console.log(`[INPUT MISSING LABEL] id="${id}" type="${type}"`);
      }
    } else if (!ariaLabel) {
      missingLabels++;
      console.log(`[INPUT NO ID OR LABEL] attrs: ${attrs.trim()}`);
    }
  }
  console.log(`Total Inputs: ${totalInputs}, Missing Labels/Aria: ${missingLabels}`);

  // Schema.org
  const schemaRegex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
  let schemaCount = 0;
  while ((m = schemaRegex.exec(content)) !== null) {
    schemaCount++;
    try {
      const parsed = JSON.parse(m[1]);
      console.log(`Schema #${schemaCount} valid JSON. Type: ${parsed['@type'] || (parsed['@graph'] ? 'Graph (' + parsed['@graph'].map(g => g['@type']).join(', ') + ')' : 'unknown')}`);
    } catch (e) {
      console.error(`Schema #${schemaCount} INVALID JSON:`, e.message);
    }
  }
  if (schemaCount === 0) console.log(`[WARNING] No Schema.org JSON-LD found!`);

  // OpenGraph & Twitter
  const ogTitle = /<meta\s+property=["']og:title["']/i.test(content);
  const ogImage = /<meta\s+property=["']og:image["']/i.test(content);
  const twitterCard = /<meta\s+(name|property)=["']twitter:card["']/i.test(content);
  const canonical = /<link\s+rel=["']canonical["']/i.test(content);
  console.log(`SEO Meta: og:title=${ogTitle}, og:image=${ogImage}, twitter:card=${twitterCard}, canonical=${canonical}`);
}

inspectHTML('index.html');
inspectHTML('academy.html');
