'use strict';
const fs = require('node:fs');
const path = require('node:path');
const site = path.resolve(__dirname, '..', 'site');
const required = [
  'index.html','about.html','books.html','contact.html','gravity-report.html',
  'gravity-assist.html','gravity-sop-foundry.html','gravity-shift-lab.html',
  'gravity-inventory-center.html','gravity-work-study-lab.html','windows-programs.html',
  'register.html','testing-room.html','assets/images/gravity-system-mark.svg',
  'assets/js/site.js','_redirects','_headers','robots.txt'
];
for (const file of required) {
  if (!fs.existsSync(path.join(site, file))) throw new Error('Missing protected source resource: ' + file);
}
const homepage = fs.readFileSync(path.join(site, 'index.html'), 'utf8');
const contact = fs.readFileSync(path.join(site, 'contact.html'), 'utf8');
const headers = fs.readFileSync(path.join(site, '_headers'), 'utf8');
const robots = fs.readFileSync(path.join(site, 'robots.txt'), 'utf8');
const redirects = fs.readFileSync(path.join(site, '_redirects'), 'utf8');
const assert = (good, message) => { if (!good) throw new Error(message); };
assert(homepage.includes('gravity-migration-preview-notice'), 'Missing migration-preview warning on home');
assert(homepage.includes('The Gravity Restaurant Leadership System'), 'Missing Gravity business identity');
assert(homepage.includes('https://gravityleadershipsystem.com'), 'Missing Gravity URLs');
assert(homepage.includes('Published by Thomas Monroe Books') || homepage.includes('published by Thomas Monroe Books'), 'Lost book-publisher attribution');
assert(contact.includes('mailto:thomas.butler@gravityleadershipsystem.com'), 'Contact not switched to verified business mailbox');
assert(/Disallow:\s*\//.test(robots), 'Staging robots.txt is not blocking indexing');
assert(headers.includes('X-Robots-Tag: noindex, nofollow'), 'Staging must send noindex header');
assert(redirects.includes('/e/*'), 'Employee QR route not retained');
const pages = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes:true })) {
    const full=path.join(dir,f.name);
    if (f.isDirectory()) walk(full);
    else if (f.name.endsWith('.html')) pages.push(full);
  }
}
walk(site);
assert(pages.length > 100, 'Missing pages');
for (const p of pages) {
  const body = fs.readFileSync(p,'utf8');
  assert(body.includes('gravity-migration-preview-notice'), 'Missing staging banner: ' + p);
  assert(!/rel="canonical"[^>]*thomasmonroebooks\.com/i.test(body), 'Old canonical in ' + p);
}
console.log(JSON.stringify({result:'PASS (static staging gates only)',htmlPages:pages.length,criticalFiles:required.length,notes:[
 'No backend, database, Windows-native, Netlify Form migration or customer QR end-to-end claim.',
 'Preview must remain noindex and must not be used as production.',
 'Original TMB deploy and domain are unchanged.'
]},null,2));
