import assert from 'node:assert/strict';
import inventory from '../functions/gravity-report/articles.json' with {type:'json'};
const aliases=[
 'https://gravity-migration--gravity-leadership-system.netlify.app',
 'https://gravity-release-review--gravity-leadership-system.netlify.app'
];
const canonical='https://gravityleadershipsystem.com';
const initial=inventory.articles.slice(0,5);
async function get(url){
 const res=await fetch(url,{headers:{'user-agent':'Gravity-Release-Audit/1.0'},signal:AbortSignal.timeout(20000)});
 const body=await res.text();
 return {res,body};
}
for(const host of aliases){
 let checked=0;
 for(const issue of initial){
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
 assert.equal((feed.body.match(/<item>/g)||[]).length,5,'RSS must have 5 published article entries');
 assert(feed.body.includes(canonical+'/gravity-report/'),'RSS points to wrong host');
 assert(!feed.body.includes('https://thomasmonroebooks.com'),'RSS includes old hostname');
 assert.match(feed.res.headers.get('x-robots-tag')||'',/noindex/i);
 const map=await get(host+'/gravity-report/sitemap.xml');
 assert.equal(map.res.status,200);
 assert.equal((map.body.match(/<lastmod>/g)||[]).length,5);
 assert(map.body.includes(canonical+'/gravity-report/'));
 const future=await get(host+'/gravity-report/'+inventory.articles[5].slug);
 assert.equal(future.res.status,404,'Scheduled article made public before release');
 assert.match(future.res.headers.get('x-robots-tag')||'',/noindex/i);
 const schedule=await get(host+'/gravity-report/articles.json');
 assert.equal(schedule.res.status,200);
 const published=JSON.parse(schedule.body).articles.filter(x=>x.released);
 assert.equal(published.length,5);
 console.log('GRAVITY_REPORT_LIVE_PASS '+JSON.stringify({host,publishedArticles:checked,rssItems:5,articleSitemapItems:5,embargo:'PASS',canonicals:'PASS',noindex:'PASS'}));
}
