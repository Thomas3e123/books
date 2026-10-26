import data from './articles.json' with {type:'json'};
import volume11 from './issues-11-15.json' with {type:'json'};
import volume16 from './issues-16-20.json' with {type:'json'};
import volume21 from './issues-21-25.json' with {type:'json'};
import volume26 from './issues-26-30.json' with {type:'json'};
// This function is copied from the original TMB publication; keep publisher credit,
// but point article canonicals, RSS GUIDs and article sitemap at Gravity's permanent domain.
const SITE='https://gravityleadershipsystem.com';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slugify=t=>t.toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function extraReleaseDate(issue){
 const i=issue-11;
 const d=new Date(Date.UTC(2026,10,13+Math.floor(i/2)*7+(i%2)*4));
 return d.toISOString().slice(0,10);
}
function fromEditorialDraft(d){
 if(!Number.isInteger(d.issue)||d.issue<11||d.issue>30||d.sections?.length!==5)throw Error('Invalid issue in Gravity Report editorial collection');
 const article_html='<p>'+esc(d.lead)+'</p>'+d.sections.map(([title,paragraphs])=>'<h2>'+esc(title)+'</h2>'+paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')).join('');
 return {issue:d.issue,title:d.title,slug:slugify(d.title),category:d.category,release_date:extraReleaseDate(d.issue),release_time:'09:00',summary:d.lead,article_html};
}
const ALL_ARTICLES=[...data.articles,...[...volume11,...volume16,...volume21,...volume26].map(fromEditorialDraft)];
if(ALL_ARTICLES.length!==30 || new Set(ALL_ARTICLES.map(a=>a.slug)).size!==30 ||
 ALL_ARTICLES.some((a,i)=>a.issue!==i+1))throw Error('Gravity Report publication inventory invalid');
function stamp(){
 const z=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
 const g=k=>z.find(x=>x.type===k).value;
 return g('year')+'-'+g('month')+'-'+g('day')+'T'+g('hour')+':'+g('minute');
}
function released(a,t){return t>=a.release_date+'T'+a.release_time;}
function articlePage(a){
 const url=SITE+'/gravity-report/'+a.slug,description=a.summary.slice(0,155);
 const schema=JSON.stringify({'@context':'https://schema.org','@type':'Article',headline:a.title,description,datePublished:a.release_date,author:{'@type':'Person',name:'Thomas Butler'},publisher:{'@type':'Organization',name:'Thomas Monroe Books'},mainEntityOfPage:url}).replace(/</g,'\\u003c');
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(a.title)} | The Gravity Report</title><meta name="description" content="${esc(description)}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(a.title)}"><meta property="og:description" content="${esc(description)}"><link rel="canonical" href="${url}"><link rel="icon" href="/assets/images/gravity-system-mark.svg"><link rel="stylesheet" href="/assets/css/styles.css?v=20260918-final-consolidation-v1"><script type="application/ld+json">${schema}</script><style>
.report-wrap{max-width:835px;margin:auto;padding:42px 20px 90px}.report-wrap h1{font-size:clamp(2rem,4vw,3rem);line-height:1.16;color:#173340}.report-byline{color:#53616a}.report-content{background:#fffdf8;padding:clamp(20px,5vw,54px);border:1px solid #dacfbd;border-radius:14px}.report-content h2{margin:2em 0 .6em;color:#173340}.report-content p{font-size:1.08rem;line-height:1.8;margin:0 0 1.15em}.report-nav{display:flex;flex-wrap:wrap;gap:18px;padding-top:25px;border-top:1px solid #ddd}.report-eyebrow{color:#896424;text-transform:uppercase;font-weight:700;letter-spacing:.1em}
</style></head><body><header class="site-header"><div class="top-gold"></div><div class="container header-inner"><a class="brand" href="/"><img src="/assets/images/gravity-system-mark.svg" width="620" height="620" alt=""><span class="brand-system-copy"><strong>The Gravity System</strong><small>Published by Thomas Monroe Books</small></span></a><button class="menu-toggle" type="button" data-menu-toggle aria-controls="site-nav" aria-expanded="false"><span>Menu</span></button><nav class="nav" id="site-nav" data-menu aria-label="Main navigation"><a href="/">Home</a><a href="/gravity-report">Gravity Report</a><a href="/knowledge-center">Knowledge Center</a><a href="/books">Books</a><a href="/contact">Contact</a><a class="btn btn-red" href="/start-here">Start Here</a></nav></div></header><main id="main" class="report-wrap"><article><p class="report-eyebrow">The Gravity Report · Issue ${String(a.issue).padStart(2,'0')} · ${esc(a.category)}</p><h1>${esc(a.title)}</h1><p class="report-byline">By Thomas Butler · <time datetime="${a.release_date}">${a.release_date}</time></p><div class="report-content">${a.article_html}<nav class="report-nav"><a href="/gravity-report">← All articles</a><a href="/gravity-report#subscribe">Email updates</a><a href="/knowledge-center">Knowledge Center</a></nav></div></article></main><footer class="site-footer"><div class="container"><p>Thomas Monroe Books · <a href="/privacy">Privacy</a> · <a href="/contact">Contact</a></p></div></footer><script defer src="/assets/js/site.js?v=20261020-report"></script></body></html>`;
}
function publicationUtc(a){
 const noon=new Date(a.release_date+'T12:00:00Z');
 const offsetName=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',timeZoneName:'shortOffset'}).formatToParts(noon).find(x=>x.type==='timeZoneName').value;
 const hours=Number(offsetName.replace('GMT',''));
 if(!Number.isFinite(hours))throw Error('Unable to resolve Central Time UTC offset');
 const [year,month,day]=a.release_date.split('-').map(Number);
 const [hour,minute]=a.release_time.split(':').map(Number);
 return new Date(Date.UTC(year,month-1,day,hour-hours,minute));
}
function rss(items){return '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>The Gravity Report</title><link>'+SITE+'/gravity-report</link><description>Restaurant leadership by Thomas Butler</description>'+items.map(a=>'<item><title>'+esc(a.title)+'</title><link>'+SITE+'/gravity-report/'+a.slug+'</link><guid>'+SITE+'/gravity-report/'+a.slug+'</guid><description>'+esc(a.summary)+'</description><pubDate>'+publicationUtc(a).toUTCString()+'</pubDate></item>').join('')+'</channel></rss>';}
function sitemap(items){return '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>'+SITE+'/gravity-report</loc></url>'+items.map(a=>'<url><loc>'+SITE+'/gravity-report/'+a.slug+'</loc><lastmod>'+a.release_date+'</lastmod></url>').join('')+'</urlset>';}
export default async function handler(req){
 if(!['GET','HEAD'].includes(req.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
 const p=new URL(req.url).pathname.replace(/\/$/,'');const t=stamp(),ready=ALL_ARTICLES.filter(a=>released(a,t));
 const hostname=new URL(req.url).hostname;
 const common={'Cache-Control':'public, max-age=0, must-revalidate','X-Content-Type-Options':'nosniff'};
 // Edge _headers rules do not apply to function responses. Suppress indexing
 // on staging, release review and the duplicate Netlify host explicitly.
 if(hostname.endsWith('.netlify.app'))common['X-Robots-Tag']='noindex, nofollow';
 if(p==='/gravity-report/articles.json'){const schedule=ALL_ARTICLES.map(a=>({issue:a.issue,title:a.title,slug:a.slug,release_date:a.release_date,category:a.category,released:released(a,t),summary:released(a,t)?a.summary:null}));return new Response(JSON.stringify({as_of_central:t,articles:schedule}),{headers:{...common,'Content-Type':'application/json; charset=utf-8'}});}
 if(p==='/gravity-report/feed.xml')return new Response(rss(ready),{headers:{...common,'Content-Type':'application/rss+xml; charset=utf-8'}});
 if(p==='/gravity-report/sitemap.xml')return new Response(sitemap(ready),{headers:{...common,'Content-Type':'application/xml; charset=utf-8'}});
 const a=ALL_ARTICLES.find(x=>x.slug===p.split('/').at(-1));
 if(!a||!released(a,t))return new Response('<!doctype html><html><head><meta name="robots" content="noindex"></head><body><h1>Article not available yet</h1><a href="/gravity-report">The Gravity Report</a></body></html>',{status:404,headers:{...common,'Content-Type':'text/html; charset=utf-8','X-Robots-Tag':'noindex'}});
 return new Response(req.method==='HEAD'?null:articlePage(a),{headers:{...common,'Content-Type':'text/html; charset=utf-8'}});
}
export const config={path:['/gravity-report/articles.json','/gravity-report/feed.xml','/gravity-report/sitemap.xml','/gravity-report/:slug']};
