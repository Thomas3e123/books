import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import handler,{config} from '../functions/gravity-report/index.mjs';
import firstTen from '../functions/gravity-report/articles.json' with {type:'json'};
import a11 from '../functions/gravity-report/issues-11-15.json' with {type:'json'};
import a16 from '../functions/gravity-report/issues-16-20.json' with {type:'json'};
import a21 from '../functions/gravity-report/issues-21-25.json' with {type:'json'};
import a26 from '../functions/gravity-report/issues-26-30.json' with {type:'json'};
import bonuses from '../functions/gravity-report/issues-31-36.json' with {type:'json'};
const drafts=[...a11,...a16,...a21,...a26];
const ORIGIN='https://gravityleadershipsystem.com';
const slug=t=>t.toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const url=d=>'/gravity-report/'+(d.slug??slug(d.title));
const leadWords=d=>(d.lead+' '+d.sections.map(x=>x[1].join(' ')).join(' ')).split(/\s+/).length;
const front=fs.readFileSync('site/gravity-report.html','utf8');
assert.equal(firstTen.articles.length,10,'Original ten articles must be preserved');
assert.equal(drafts.length,20,'Twenty completed follow-up articles required');
assert.deepEqual(drafts.map(x=>x.issue),Array.from({length:20},(_,i)=>i+11));
assert(drafts.every(a=>a.sections.length===5&&a.sections.every(x=>x.length===2&&x[1].length===2)));
assert(drafts.every(a=>leadWords(a)>=350),'An editorial article is too short for release');
assert.equal(bonuses.length,6,'Six bonus human-interest articles are expected');
assert.deepEqual(bonuses.map(x=>x.issue),Array.from({length:6},(_,i)=>i+31));
assert(bonuses.every(a=>a.sections.length===5&&a.sections.every(x=>x.length===2&&x[1].length===2)));
assert(bonuses.every(a=>leadWords(a)>=350),'A bonus article is too short for release');
assert(bonuses.every(a=>a.illustrative_scenario===true),'Invented bonus stories must be identified as illustrative scenarios');
assert(front.includes('Restaurant stories · Real-world business lessons'),'Report positioning must not claim fictional scenarios are real reporting');
assert(!front.includes('New human-interest stories, Field Notes and guest perspectives are in development'),'Report schedule copy must not describe already-published content as in development');
assert(new Set([...firstTen.articles,...drafts,...bonuses].map(x=>slug(x.title))).size===36,'Duplicate article titles');
assert.equal((front.match(/<article class="report-card"/g)||[]).length,30);
assert.equal((front.match(/<div class="report-field-download">/g)||[]).length,5,'Exactly five downloadable Field Sheets on report landing');
for(const [number,key] of [[3,'manager-follow-through'],[4,'food-waste'],[5,'employee-retention']]){
 const filename=`gravity-field-sheet-${String(number).padStart(2,'0')}-${key}.pdf`;
 assert(front.includes(filename),'Report landing missing Field Sheet '+number);
 const bytes=fs.readFileSync('site/assets/downloads/'+filename);
 assert(bytes.subarray(0,5).toString('latin1')==='%PDF-','Invalid PDF header: '+filename);
 assert(bytes.includes(Buffer.from('%%EOF')),'Missing PDF EOF: '+filename);
}

assert.equal((front.match(/<a href="\/gravity-report\/[^"]+">Read full article →<\/a>/g)||[]).length,5);
assert(front.includes('data-netlify="true"')&&front.includes('name="newsletter-consent"'));
assert(config.path.includes('/gravity-report/:slug'));
for(const a of firstTen.articles.slice(0,5))assert(front.includes('href="'+url(a)+'"'),'Live article missing clickable link');
assert(front.includes('<ol data-report-article-index></ol>'),'Missing insertion point for the date-aware HTML index');
for(const a of drafts)assert(front.includes('data-report-issue="'+a.issue+'"'),'Future article missing on index page');
const RealDate=globalThis.Date;
async function at(iso,path){
 const m=new RealDate(iso);
 globalThis.Date=class MockDate extends RealDate{constructor(...args){super(...(args.length?args:[m.toISOString()]));}static now(){return m.valueOf();}};
 try{return await handler(new Request(ORIGIN+path),{});}finally{globalThis.Date=RealDate;}
}
for (const path of [url(firstTen.articles[0]), '/gravity-report/gravity-has-a-new-home']) {
 const response = await at('2026-11-23T18:00:00Z', path);
 assert.equal(response.status, 200);
 const html = await response.text();
 const assets = [...html.matchAll(/(?:href|src)="(\/assets\/(?:js|css)\/[^"?]+)([^"]*)"/g)];
 assert(assets.some(([, file]) => file === '/assets/js/site.js'));
 for (const [, file, query] of assets) {
  const hash = createHash('sha256').update(fs.readFileSync('site' + file)).digest('hex');
  assert.equal(query, '?v=' + hash.slice(0, 16), path + ' references an outdated ' + file);
 }
}
// Check every catalog entry at a pre-publication date and after the last release.
const catalogAt = async date => (await (await at(date,'/gravity-report/articles.json')).json()).articles;
const early = '2026-01-01T12:00:00Z', late = '2030-01-01T12:00:00Z';
assert((await catalogAt(early)).every(a => !a.released && a.field_sheet_url === null));
const entries = await catalogAt(late);
entries.push({slug:'gravity-has-a-new-home',field_sheet_url:'/gravity-report/gravity-has-a-new-home?download=field-sheet'});
const downloads = new Set();
for (const a of entries) {
 const route = '/gravity-report/' + a.slug;
 assert.equal((await at(early,route + '?download=field-sheet')).status,404);
 const html = await (await at(late,route)).text();
 assert(html.includes('href="' + a.field_sheet_url + '" data-no-registration-gate download'),route);
 assert(!downloads.has(a.field_sheet_url),'Duplicate sheet: ' + route);
 downloads.add(a.field_sheet_url);
 if (a.field_sheet_url.startsWith('/assets/')) {
  assert(fs.existsSync('site' + a.field_sheet_url));
 } else {
  const response = await at(late,a.field_sheet_url);
  assert.equal(response.headers.get('content-type'),'application/pdf',route);
  const pdf = Buffer.from(await response.arrayBuffer()).toString('latin1');
  assert(pdf.startsWith('%PDF-') && pdf.includes('%%EOF') && /\/Count 1\b/.test(pdf),route);
  assert(pdf.includes(ORIGIN + route) && pdf.includes(ORIGIN + '/)'),route);
 }
}
let r=await at('2026-10-20T18:30:00Z','/gravity-report/articles.json');
let schedule=await r.json();
assert.equal(schedule.articles.length,36);
assert.equal(schedule.articles.filter(x=>x.released).length,5);
assert(schedule.articles.filter(x=>!x.released).every(x=>x.summary===null&&x.search_text===null),'Unpublished summary or article text leaked');
const firstParagraph=firstTen.articles[0].article_html.match(/<p>(.*?)<\/p>/)?.[1].replace(/&#39;/g,"'");
assert(firstParagraph&&schedule.articles[0].search_text.includes(firstParagraph),'Released article body is missing from the searchable catalog');
assert(!schedule.articles[0].search_text.includes('<p>'),'Search text should be plain text, not HTML markup');
assert(!schedule.articles[0].search_text.includes('&#39;'),'Search text should decode apostrophe entities');
for(let i=0;i<5;i++)assert.equal(schedule.articles[i].release_date,'2026-10-20');
// Verify all five preserved, originally approved full articles are already
// retrievable on their published dates and point to the NEW Gravity domain.
for(const article of firstTen.articles.slice(0,5)){
 const response=await at('2026-10-26T17:00:00Z',url(article));
 assert.equal(response.status,200,'Published full article is unavailable: '+article.title);
 const html=await response.text();
 assert(html.includes(article.article_html),'Approved original article body changed or missing: '+article.title);
 assert(html.includes('<link rel="canonical" href="'+ORIGIN+url(article)+'">'),'Article canonical is not Gravity: '+article.title);
 assert(!html.includes('rel="canonical" href="https://thomasmonroebooks.com'),'Legacy host in article canonical');
}

const expectedInitial=['2026-10-27','2026-10-30','2026-11-03','2026-11-06','2026-11-10'];
assert.deepEqual(schedule.articles.slice(5,10).map(x=>x.release_date),expectedInitial);
const projected=schedule.articles.slice(10,30);
assert.equal(projected[0].release_date,'2026-11-13');
assert.equal(projected.at(-1).release_date,'2027-01-19');
for(const a of projected)assert(['Tuesday','Friday'].includes(new Intl.DateTimeFormat('en-US',{timeZone:'UTC',weekday:'long'}).format(new RealDate(a.release_date+'T12:00:00Z'))));
for(const a of projected){
 const d=new RealDate(a.release_date+'T12:00:00Z');
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',timeZoneName:'shortOffset'}).formatToParts(d);
 const offset=Number(parts.find(p=>p.type==='timeZoneName').value.replace('GMT',''));
 const day=a.release_date, moment=new RealDate(day+'T00:00:00Z').valueOf();
 const before=new RealDate(moment+(9-offset)*3600000-60000).toISOString();
 const after=new RealDate(moment+(9-offset)*3600000).toISOString();
 const path='/gravity-report/'+a.slug;
 const beforeIndex=await at(before,'/gravity-report/articles.json?view=links');
 const afterIndex=await at(after,'/gravity-report/articles.json?view=links');
 assert(!(await beforeIndex.text()).includes('href="'+path+'"'));
 assert((await afterIndex.text()).includes('href="'+path+'"'));
 assert.equal(afterIndex.headers.get('Cache-Control'),'no-store');
 r=await at(before,path);
 assert.equal(r.status,404,'Future article leaked before release: '+a.issue);
 assert.equal(r.headers.get('X-Robots-Tag'),'noindex');
 r=await at(after,path);
 assert.equal(r.status,200,'Article failed to release at 9 a.m. Central: '+a.issue);
 const body=await r.text();
 assert(body.includes('By Thomas Butler')&&((body.match(/<h2>/g)||[]).length>=5),'Article sections or attribution missing: '+a.issue);
 assert(body.includes('datePublished')&&body.includes(a.title.replace(/&/g,'&amp;')),'Article metadata missing: '+a.issue);
}
const bonusMoment='2026-11-18T15:00:00Z';
r=await at(bonusMoment,'/gravity-report/articles.json');
const currentCatalog=await r.json();
assert.equal(currentCatalog.articles.length,36);
assert.equal(currentCatalog.articles.filter(x=>x.released).length,18,'Six bonuses should publish without advancing the existing issue schedule');
for(const bonus of bonuses){
 const path='/gravity-report/'+slug(bonus.title),response=await at(bonusMoment,path);
 assert.equal(response.status,200,'Bonus article did not publish: '+bonus.title);
 const html=await response.text();
 assert(html.includes(bonus.title)&&html.includes('<link rel="canonical" href="'+ORIGIN+path+'">'),'Bonus article metadata missing: '+bonus.title);
 assert(html.includes(bonus.lead.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('"','&quot;')),'Bonus article body missing: '+bonus.title);
 assert(html.includes('Illustrative scenario · Issue '+String(bonus.issue).padStart(2,'0'))&&html.includes('Fictional, illustrative scenario'),'Bonus story disclosure missing: '+bonus.title);
}
r=await at('2026-10-20T18:30:00Z','/gravity-report/feed.xml');
const initialRss=await r.text();
assert.equal((initialRss.match(/<item>/g)||[]).length,5);
assert(initialRss.includes(ORIGIN+'/gravity-report/'),'RSS links must resolve to Gravity');
assert(!initialRss.includes('https://thomasmonroebooks.com'),'RSS must not point to old TMB');
r=await at('2026-11-13T15:00:00Z','/gravity-report/feed.xml');
assert.equal(((await r.text()).match(/<item>/g)||[]).length,12);
r=await at('2026-11-21T12:00:00Z','/gravity-report/feed.xml');
const feedDates=Array.from((await r.text()).matchAll(/<pubDate>([^<]+)<\/pubDate>/g),match=>Date.parse(match[1]));
assert.equal(feedDates.length,20);
assert.deepEqual(feedDates,[...feedDates].sort((a,b)=>b-a),'RSS subscribers should see the latest publication first');
r=await at('2027-01-19T15:00:00Z','/gravity-report/feed.xml');
assert.equal(((await r.text()).match(/<item>/g)||[]).length,37);
r=await at('2026-10-20T18:30:00Z','/gravity-report/sitemap.xml');
const initialMap=await r.text();
assert.equal((initialMap.match(/<lastmod>/g)||[]).length,5);
assert(initialMap.includes(ORIGIN+'/gravity-report/'),'Article sitemap links must resolve to Gravity');
r=await at('2027-01-19T15:00:00Z','/gravity-report/sitemap.xml');
assert.equal(((await r.text()).match(/<lastmod>/g)||[]).length,37);
console.log('GRAVITY_REPORT_CHECKS=PASS complete=36 published_at_bonus_release=18 scheduled=18 original_schedule_preserved=PASS bonuses=6 future_gate=PASS timezone=America/Chicago rss=PASS sitemap=PASS opt_in=present');
