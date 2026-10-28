import assert from 'node:assert/strict';
import fs from 'node:fs';
import handler from '../functions/gravity-report/index.mjs';

const home=fs.readFileSync('site/gravity-report.html','utf8');
const css=fs.readFileSync('site/assets/css/gravity-report-reading.css','utf8');
const js=fs.readFileSync('site/assets/js/gravity-report-reading.js','utf8');
const url='https://gravityleadershipsystem.com';

assert(home.includes('class="gravity-knowledge report-catalog"'),'Catalog body class missing');
assert(home.includes('gravity-report-reading.css'),'Catalog CSS missing');
assert(home.includes('gravity-report-reading.js'),'Catalog script missing');
assert(home.includes('id="report-search"'),'Search input missing');
assert(home.includes('class="report-upcoming-group"'),'Upcoming schedule expandable section missing');
assert(home.includes('data-report-upcoming'),'Scheduled issue container missing');
assert.equal((home.match(/<article class="report-card"/g)||[]).length,30,'All 30 issues must remain in the HTML');
assert(home.indexOf('id="report-search"')<home.indexOf('gravity-new-home-report'),'Published catalog must precede long editorial notes');
assert(home.includes('data-netlify="true"')&&home.includes('newsletter-consent'),'Newsletter form must be preserved');
assert(!home.includes('Five full articles are available now.'),'Hard-coded outdated issue count in hero');
assert(js.includes('a.released')&&js.includes('encodeURIComponent(a.slug)'),'Client must respect publication flags');
assert(js.includes('aria')||home.includes('aria-live'),'Accessible catalog status required');
assert(js.includes('data-report-font')&&js.includes('localStorage'),'Reader font-size memory required');
assert(js.includes('report-toc')&&js.includes('report-reading-progress'),'TOC and reading progress must initialize');
assert(css.includes('@media(max-width:600px)'),'Mobile breakpoint missing');
assert(css.includes('@media print'),'Print-friendly article view missing');
assert(css.includes('max-width:68ch'),'Readable text measure missing');

assert(js.includes("url='https://gravityleadershipsystem.com'+href"),'Catalog sharing must use canonical Gravity domain');
assert(js.includes('Read the full article on Gravity:'),'Copied Facebook caption must invite readers back to Gravity');
assert(js.includes('socialPost(title,summary,url)')&&js.includes('fullArticleText(title,url)'),'Both sharing copy formats required');
assert(js.includes("data-report-share='post'")||js.includes("'data-report-share','post'"),'Facebook copying option missing on catalog');
assert(css.includes('.report-share-buttons')&&css.includes('.report-card-share'),'Share controls must be readable on mobile');
for(const key of ['x.com/intent/tweet','linkedin.com/sharing/share-offsite','api.whatsapp.com/send','reddit.com/submit','bsky.app/intent/compose','mailto:?']){
 assert(js.includes(key),'Catalog network missing: '+key);
 assert(fs.readFileSync('functions/gravity-report/index.mjs','utf8').includes(key),'Article network missing: '+key);
}
assert(js.includes('Copy social post'),'Cross-platform copy-to-post label missing');
assert(css.includes('report-share-more')&&css.includes('report-card-more'),'Share extras must be grouped for readability');



const RealDate=globalThis.Date;
async function at(iso,path){
 const moment=new RealDate(iso);
 globalThis.Date=class SimDate extends RealDate{constructor(...a){super(...(a.length?a:[moment.toISOString()]));}static now(){return moment.getTime()}};
 try{return handler(new Request(url+path),{})}finally{globalThis.Date=RealDate}
}
async function page(iso,slug){const resp=await at(iso,'/gravity-report/'+slug);return {resp,html:await resp.text()}}
const slug1='why-do-my-restaurant-managers-keep-making-excuses';
const slug6='how-do-i-lower-restaurant-labor-costs-without-hurting-service';
let a=await page('2026-10-28T15:00:00Z',slug1);
assert.equal(a.resp.status,200);
for(const item of ['class="report-article"','class="report-body"','class="report-toc"','data-report-font="increase"','data-report-font="decrease"','class="report-reading-progress"','gravity-report-reading.css','gravity-report-reading.js','Skip to article']){
 assert(a.html.includes(item),'Missing reader element '+item);
}
assert(a.html.includes('Publisher and Editor of The Gravity Report'),'Publisher credit lost');

assert(a.html.includes('data-report-share="post"'),'Article has no copy Facebook post button');
assert(a.html.includes('data-report-share="full"'),'Article has no copy full article button');
assert(a.html.includes('data-report-share="link"'),'Article has no copy-link button');
assert(a.html.includes('https://www.facebook.com/sharer/sharer.php?u='),'Article has no direct Facebook share link');
assert(a.html.includes('data-report-url="'+url+'/gravity-report/'+slug1+'"'),'Article sharing URL does not link back to Gravity');
assert(a.html.includes('<meta property="og:image"'),'Facebook preview image metadata missing');
for(const key of ['x.com/intent/tweet','linkedin.com/sharing/share-offsite','api.whatsapp.com/send','reddit.com/submit','bsky.app/intent/compose','mailto:?']){
 assert(a.html.includes(key),'Article share link missing: '+key);
}
assert(a.html.includes('Copy social post'),'Cross-platform article button missing');
assert(a.html.includes('More ways to share'),'Secondary share options missing');

assert(a.html.includes('<meta property="og:url" content="'+url+'/gravity-report/'+slug1+'">'),'Facebook URL metadata must be canonical');

assert(a.html.includes('rel="next"'),'Published next article link missing');
assert(!a.html.includes('rel="prev"'),'Issue one must not have a predecessor');
a=await page('2026-10-28T15:00:00Z',slug6);
assert.equal(a.resp.status,200,'Issue six should be published by 28 Oct');
assert(a.html.includes('rel="prev"'),'Issue six should have published previous');
assert(!a.html.includes('rel="next"'),'Issue seven must remain unlinked before Oct 30');
a=await page('2026-10-30T14:01:00Z',slug6);
assert(a.html.includes('rel="next"'),'Issue seven should become a reading navigation option when released');
const locked=await page('2026-10-28T15:00:00Z','why-are-restaurant-employees-ignoring-procedures');
assert.equal(locked.resp.status,404,'Future issue must never leak through new reader navigation');
const special=await page('2026-10-28T15:00:00Z','gravity-has-a-new-home');
assert.equal(special.resp.status,200,'Announcement must remain readable');
assert(special.html.includes('class="report-toc"'),'Special article must use same reader UI');

console.log('GRAVITY_REPORT_READING_QA PASS — all 30 issues preserved; article controls, mobile/print, reading navigation, release gate, announcements, newsletter intact');
