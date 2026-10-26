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
assert(homepage.includes('https://gravity-leadership-system.netlify.app'), 'Absolute staging URLs must resolve on the preview host');
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
// Protect the previously repaired navigation and download-host links.
// Controlled staging QA deployment requested on 2026-10-23; production remains untouched.
const navPages = [
  'index.html','start-here.html','books.html','contact.html','gravity-assist.html','register.html',
  'windows-programs.html','gravity-sop-foundry.html','gravity-shift-lab.html',
  'gravity-inventory-center.html','gravity-work-study-lab.html'
];
for (const file of navPages) {
  const body = fs.readFileSync(path.join(site, file), 'utf8');
  const nav = [...body.matchAll(/<nav[^>]*>[\s\S]*?<\/nav>/gi)].map(m => m[0]).find(html => /id=["']site-nav["']|data-menu/.test(html));
  assert(nav, 'Missing primary navigation on ' + file);
  for (const route of ['/windows-programs','/testing-room','/start-here']) {
    const links = [...nav.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);
    const count = links.filter(href => href === route).length;
    assert(count === 1, 'Expected exactly one ' + route + ' link on ' + file + ', found ' + count);
  }
  assert(!body.includes('https://gravity-leadership-system.netlify.app/assets/downloads/windows/manuals/current/'), 'Windows manual links must be relative on ' + file);
}

// Verify local book/Windows downloads resolve on the packaged staging site.
const downloadAudit = {};
for (const page of ['books.html','windows-programs.html','gravity-fulfillment-center.html','free-resources.html']) {
  const html = fs.readFileSync(path.join(site,page),'utf8');
  const links = [...html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)].map(m=>m[1]);
  const local = links.filter(link=>/\.(?:pdf|docx|zip|exe)(?:[?#]|$)/i.test(link) && !/^(?:https?:)?\/\//i.test(link));
  for(const link of local) {
    const relative = decodeURIComponent(link.split(/[?#]/)[0]).replace(/^\/+/, '');
    const resolved = path.resolve(site,relative);
    assert(resolved.startsWith(site+path.sep) && fs.existsSync(resolved), 'Missing linked download on '+page+': '+link);
  }
  downloadAudit[page] = local.length;
}
const registration = fs.readFileSync(path.join(site,'register.html'),'utf8');
assert(registration.includes('name="gravity-registration"') && registration.includes('data-netlify="true"'), 'Registration form missing Netlify form markup');
assert(fs.existsSync(path.join(site,'assets/js/registration-identity.js')), 'Registration identity script missing');
console.log('Download and registration markup gates:',JSON.stringify(downloadAudit));


// Baseline mobile structural checks for critical public routes (not visual-device certification).
for (const page of ['index.html','register.html','windows-programs.html','gravity-sop-foundry.html','gravity-shift-lab.html','gravity-inventory-center.html','gravity-work-study-lab.html','testing-room.html']) {
  const html = fs.readFileSync(path.join(site,page),'utf8');
  assert(/<meta\b[^>]*name=["']viewport["'][^>]*>/i.test(html) && /<meta\b[^>]*name=["']viewport["'][^>]*content=["'][^"']*width=device-width/i.test(html), 'Missing responsive viewport on '+page);
  assert(/data-menu-toggle/.test(html) && /data-menu/.test(html), 'Missing accessible mobile navigation structure on '+page);
}
const navigationJs=fs.readFileSync(path.join(site,'assets/js/site.js'),'utf8');
assert(navigationJs.includes("menuToggle.setAttribute('aria-expanded'") && navigationJs.includes("nav.classList.toggle('open'"), 'Mobile menu open/close logic missing');

console.log(JSON.stringify({result:'PASS (static staging gates only)',htmlPages:pages.length,criticalFiles:required.length,notes:[
 'No backend, database, Windows-native, Netlify Form migration or customer QR end-to-end claim.',
 'Preview must remain noindex and must not be used as production.',
 'Original TMB deploy and domain are unchanged.'
]},null,2));
