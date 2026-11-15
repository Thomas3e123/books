import assert from 'node:assert/strict';
import inventory from '../functions/gravity-report/articles.json' with {type:'json'};
const aliases=[
 'https://gravity-migration--gravity-leadership-system.netlify.app',
 'https://gravity-release-review--gravity-leadership-system.netlify.app'
];
const canonical='https://gravityleadershipsystem.com';
const special={slug:'gravity-has-a-new-home',release_date:'2026-10-27',release_time:'00:00'};
async function get(url){
 const res=await fetch(url,{headers:{'user-agent':'Gravity-Release-Audit/1.0'},signal:AbortSignal.timeout(20000)});
 const body=await res.text();
 return {res,body};
}
function isReleased(issue,asOf){return asOf>=issue.release_date+'T'+issue.release_time;}
for(const host of aliases){
 const scheduleResponse=await get(host+'/gravity-report/articles.json');
 assert.equal(scheduleResponse.res.status,200);
 const schedule=JSON.parse(scheduleResponse.body);
 assert.equal(schedule.articles.length,inventory.articles.length,'Live schedule and approved inventory counts differ');
 for(const issue of inventory.articles){
  const live=schedule.articles.find(x=>x.slug===issue.slug);
  assert(live,'Scheduled article missing from live schedule: '+issue.slug);
  assert.equal(live.title,issue.title,'Scheduled title differs: '+issue.slug);
  assert.equal(live.release_date,issue.release_date,'Release date differs: '+issue.slug);
  assert.equal(live.released,isReleased(issue,schedule.as_of_central),'Release state does not match approved date/time: '+issue.slug);
  if(!live.released){assert.equal(live.summary,null,'Future summary leaked: '+issue.slug);assert.equal(live.search_text,null,'Future search text leaked: '+issue.slug);}
 }
 const published=inventory.articles.filter(issue=>isReleased(issue,schedule.as_of_central));
 assert(published.length>0,'No approved articles are published');
 let checked=0;
 for(const issue of published){
  const path='/gravity-report/'+issue.slug;
  const {res,body}=await get(host+path);
  assert.equal(res.status,200,'Published article unavailable at '+host+path);
  assert.match(res.headers.get('content-type')||'',/text\/html/i);
  assert(body.includes(issue.article_html),'Approved article body missing: '+issue.slug);
  assert(body.includes('rel="canonical" href="'+canonical+path+'"'),'Gravity canonical incorrect: '+issue.slug);
  assert(!body.includes('rel="canonical" href="https://thomasmonroebooks.com'),'Old domain in canonical');
  assert.match(res.headers.get('x-robots-tag')||'',/noindex/i,'Preview article missing X-Robots-Tag');
  checked++;
 }
 const feed=await get(host+'/gravity-report/feed.xml');
 assert.equal(feed.res.status,200);
 assert.match(feed.res.headers.get('content-type')||'',/application\/rss\+xml/);
 const expectedItems=published.length+(isReleased(special,schedule.as_of_central)?1:0);
 assert.equal((feed.body.match(/<item>/g)||[]).length,expectedItems,'RSS count must match released schedule plus the separate move announcement');
 assert(feed.body.includes(canonical+'/gravity-report/'),'RSS points to wrong host');
 assert(!feed.body.includes('https://thomasmonroebooks.com'),'RSS includes old hostname');
 assert.match(feed.res.headers.get('x-robots-tag')||'',/noindex/i);
 const map=await get(host+'/gravity-report/sitemap.xml');
 assert.equal(map.res.status,200);
 assert.equal((map.body.match(/<loc>/g)||[]).length,expectedItems+1,'Article sitemap must include released schedule entries, the separate move announcement, and the Gravity Report landing page');
 assert(map.body.includes(canonical+'/gravity-report/'));
 const next=inventory.articles.find(issue=>!isReleased(issue,schedule.as_of_central));
 if(next){
  const future=await get(host+'/gravity-report/'+next.slug);
  assert.equal(future.res.status,404,'Scheduled article made public before release');
  assert.match(future.res.headers.get('x-robots-tag')||'',/noindex/i);
 }
 console.log('GRAVITY_REPORT_LIVE_PASS '+JSON.stringify({host,asOfCentral:schedule.as_of_central,scheduledArticles:schedule.articles.length,publishedArticles:checked,rssItems:expectedItems,articleSitemapItems:expectedItems+1,embargo:'PASS',canonicals:'PASS',noindex:'PASS'}));
}
