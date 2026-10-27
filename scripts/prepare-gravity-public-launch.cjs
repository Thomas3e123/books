'use strict';
/* Public Gravity site packaging. ONLY run on the isolated Gravity migration branch.
 * Preview packaging deliberately applies noindex; this function reverses those
 * staging settings in the deploy directory, without touching TMB production. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const site = path.join(root, 'site');
const old = 'https://gravity-leadership-system.netlify.app';
const canonical = 'https://gravityleadershipsystem.com';
const privatePage = rel => /(^|\/)(testing-room-manager|registration-thanks|employee-app|manager-room|manager-dashboard|private)(\/|\.|$)/i.test(rel);
let publicPages = 0, privatePages = 0, removed = 0;
function walk(dir) {
 for (const ent of fs.readdirSync(dir, {withFileTypes:true})) {
  const file=path.join(dir,ent.name);
  if (ent.isDirectory()) {walk(file);continue;}
  if (!ent.name.endsWith('.html')) continue;
  const rel=path.relative(site,file).replaceAll('\\','/');
  let html=fs.readFileSync(file,'utf8').split(old).join(canonical);
  // A staging-wide meta noindex cannot coexist with a public index directive.
  if (!privatePage(rel)) {
   const matches=html.match(/<meta\b[^>]*\bcontent\s*=\s*["']noindex\s*,\s*nofollow["'][^>]*>/gi)||[];
   html=html.replace(/<meta\b[^>]*\bcontent\s*=\s*["']noindex\s*,\s*nofollow["'][^>]*>\s*/gi,'');
   removed+=matches.length;publicPages++;
  } else privatePages++;
  fs.writeFileSync(file,html);
 }
}
walk(site);
const headersFile=path.join(site,'_headers');
let headers=fs.readFileSync(headersFile,'utf8');
headers=headers.replace(/(\/\*\s*\n)\s*X-Robots-Tag:\s*noindex,\s*nofollow\s*\n/i,'$1');
// Netlify _headers does not reliably merge duplicate path blocks: add the
// reader noindex to its ORIGINAL cache-control rule instead of appending one.
headers=headers.replace(/(\/assets\/reader\/\*\r?\n)(?!  X-Robots-Tag:)/, '$1  X-Robots-Tag: noindex, nofollow\n');
const disallowPaths=['/apps/sop-foundry/employee-app*','/testing-room-manager*','/registration-thanks*'];
for(const route of disallowPaths) {
 if (!headers.includes(route+'\n')) headers+='\n'+route+'\n  X-Robots-Tag: noindex, nofollow\n';
}
fs.writeFileSync(headersFile,headers);
fs.writeFileSync(path.join(site,'robots.txt'),
 'User-agent: *\nAllow: /\nDisallow: /apps/sop-foundry/employee-app\nDisallow: /testing-room-manager\nDisallow: /registration-thanks\nDisallow: /assets/reader/\n\nSitemap: '+canonical+'/sitemap.xml\n');
const sitemap=path.join(site,'sitemap.xml');
if (fs.existsSync(sitemap)) fs.writeFileSync(sitemap,fs.readFileSync(sitemap,'utf8').split(old).join(canonical));
const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
assert(publicPages>100,'Unusually few public pages: '+publicPages);
assert(!/\/\*\s*\n\s*X-Robots-Tag:\s*noindex/i.test(headers),'Wildcard robots block remained');
assert(!fs.readFileSync(path.join(site,'robots.txt'),'utf8').includes('Disallow: /\n'),'All crawling blocked');
for(const rel of ['index.html','about.html','start-here.html','gravity-report.html']) {
 const html=fs.readFileSync(path.join(site,rel),'utf8');
 assert(!/<meta\b[^>]*\bcontent\s*=\s*["']noindex/i.test(html),rel+' remains noindex');
 assert(!html.includes(old),rel+' retains staging host');
}
const announcement=fs.readFileSync(path.join(root,'functions/gravity-report/index.mjs'),'utf8');
assert(announcement.includes('gravity-has-a-new-home'),'Gravity Report transition article is missing');
console.log(JSON.stringify({mode:'GRAVITY PUBLIC ONLY',publicPages,privatePages,removedStagingNoindexTags:removed,canonical},null,2));
