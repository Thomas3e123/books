import assert from 'node:assert/strict';
import fs from 'node:fs';
import handler from '../functions/gravity-report/index.mjs';

const origin='https://gravityleadershipsystem.com';
const page=fs.readFileSync('site/book-reader.html','utf8');
const js=fs.readFileSync('site/assets/js/book-reader.js','utf8');
const index=fs.readFileSync('site/gravity-report.html','utf8');
const reader=fs.readFileSync('site/assets/js/gravity-report-reading.js','utf8');
const css=fs.readFileSync('site/assets/css/gravity-report-reading.css','utf8');
assert(page.includes('Gravity Reader'),'Combined tool branding missing');
assert(page.includes('id="reader-available-articles"') && page.includes('id="reader-article-buttons"'),'Published article list missing');
assert(page.includes('book-reader.js?v=20261028-gravity-report-audio-v1'),'Old cached Book Reader script');
assert(js.includes("fetch('/gravity-report/articles.json'"),'Report release feed not used');
assert(js.includes("filter(a=>a.released"),'Future issues must not populate the audio catalog');
assert(js.includes("catalog=booksUnlocked?EMBEDDED_CATALOG.slice():[]"),'Registration barrier for books not preserved');
assert(js.includes("new URLSearchParams(location.search).get('article')"),'Deep links to listening missing');
assert(js.includes("kind==='report'?0:mainContentOffset(text)"),'Article text may be incorrectly skipped as book front matter');
assert(reader.includes("/book-reader?article="),'Article catalog lacks listening links');
assert(css.includes('data-reading-theme="contrast"')&&css.includes('data-reading-theme="sepia"'),'Reading color options missing');
assert(css.includes('data-reading-font="sans"'),'Readable font choice missing');
const OriginalDate=globalThis.Date;
async function at(iso,uri){
  const time=new OriginalDate(iso);
  globalThis.Date=class SimDate extends OriginalDate{constructor(...args){super(...(args.length?args:[time.toISOString()]));}static now(){return time.valueOf()}};
  try{return await handler(new Request(origin+uri),{});}finally{globalThis.Date=OriginalDate;}
}
const slug='why-do-my-restaurant-managers-keep-making-excuses';
let resp=await at('2026-10-28T16:00:00Z','/gravity-report/reader-text?slug='+slug);
assert.equal(resp.status,200,'Published narration inaccessible');
assert.match(resp.headers.get('content-type'),/text\/plain/);
const text=await resp.text();
assert(text.includes('By Thomas Butler')&&text.includes('Thomas Monroe Books')&&text.includes('gravityleadershipsystem.com'),'Original creator credit and website must survive');
assert(text.length>500,'Narration text unexpectedly short');
assert(!/<p|<h2|<a\s/i.test(text),'HTML markup left in narration');
resp=await at('2026-10-28T16:00:00Z','/gravity-report/'+slug);
let html=await resp.text();
assert(html.includes('/book-reader?article='+slug),'Published article needs deep listening link');
assert(html.includes('id="report-reading-theme"')&&html.includes('id="report-reading-font"'),'Article reading comfort preferences unavailable');
resp=await at('2026-10-28T16:00:00Z','/gravity-report/reader-text?slug=why-are-restaurant-employees-ignoring-procedures');
assert.equal(resp.status,404,'Unpublished article narration leaked');
resp=await at('2026-10-30T14:01:00Z','/gravity-report/reader-text?slug=why-are-restaurant-employees-ignoring-procedures');
assert.equal(resp.status,200,'Scheduled narration did not release on time');
resp=await at('2026-10-28T16:00:00Z','/gravity-report/reader-text?slug=not-an-article');
assert.equal(resp.status,404,'Unknown article must not generate narration');
console.log('GRAVITY_REPORT_LISTENING_QA PASS — live audio text, schedule gate, reader integration, accessible palette, credit preserved');
