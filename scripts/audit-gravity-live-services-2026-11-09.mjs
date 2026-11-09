// Read-only, external production service audit. No form submissions, no authentication,
// no POST/PUT/DELETE, no customer account or private content.
const BASE='https://gravityleadershipsystem.com';
const routes=[
  {name:'Encrypted cloud backup database readiness',path:'/gravity-cloud-backup/health',expect:'cloud'},
  {name:'Work Study device-link readiness',path:'/work-study-link/health',expect:'work-study'},
  {name:'SOP Foundry hosted readiness',path:'/foundry-hosted/health',expect:'foundry'},
  {name:'Gravity Guide endpoint configuration',path:'/.netlify/functions/gravity-guide',expect:'guide'},
  {name:'Neural audio endpoint configuration',path:'/.netlify/functions/gravity-tts',expect:'tts'},
  {name:'Published Gravity Report article listing',path:'/gravity-report/articles.json',expect:'report'},
  {name:'Public Help Center',path:'/help-center',expect:'html'},
  {name:'Public support request script',path:'/assets/js/gravity-support-request.js',expect:'js'},
  {name:'Gravity Guide resource registry',path:'/assets/js/gravity-guide-registry.js',expect:'js'},
  {name:'Reader catalog',path:'/assets/reader/catalog.json',expect:'catalog'}
];
const report=[];
function summarize(name,body){
 if(name==='cloud')return {ok:body?.ok,databaseReady:body?.databaseReady,authenticatedAccountRequired:body?.authenticatedAccountRequired};
 if(name==='work-study'||name==='foundry')return {ok:body?.ok,service:body?.service};
 if(name==='guide'||name==='tts')return {ok:body?.ok,configured:body?.configured,function:body?.function};
 if(name==='report')return {articleCount:Array.isArray(body?.articles)?body.articles.length:null};
 if(name==='catalog')return {bookCount:Array.isArray(body?.books)?body.books.length:null};
 return {};
}
for(const item of routes){
 const url=BASE+item.path;const started=Date.now();
 try{
  const response=await fetch(url,{method:'GET',redirect:'manual',headers:{'User-Agent':'GravityReadOnlyServiceAudit/2026-11-09','Accept':'application/json,text/html,application/javascript'},signal:AbortSignal.timeout(12000)});
  let meta={};let parseError='';
  if(['cloud','work-study','foundry','guide','tts','report','catalog'].includes(item.expect)){
   try{meta=summarize(item.expect,await response.json())}catch(err){parseError='Response was not valid JSON';}
  } else {
   const text=await response.text();
   meta={bytes:text.length,hasSupportForm:item.path==='/help-center'?
       (text.includes("id='gravity-support-request'")||text.includes('id="gravity-support-request"'))&&
       (text.includes("id='support-submit'")||text.includes('id="support-submit"')):undefined,
     hasGuidePrimaryPaths:item.path.endsWith('gravity-guide-registry.js')?text.includes('url":"/gravity-assist"'):undefined};
  }
  let ok=response.status===200&&!parseError;
  if(item.expect==='cloud')ok=ok&&meta.ok===true&&meta.databaseReady===true;
  if(['work-study','foundry','guide','tts'].includes(item.expect))ok=ok&&meta.ok===true;
  if(['guide','tts'].includes(item.expect))ok=ok&&meta.configured===true;
  if(item.expect==='report')ok=ok&&Number.isInteger(meta.articleCount);
  if(item.expect==='catalog')ok=ok&&meta.bookCount===15;
  if(item.expect==='html')ok=ok&&meta.hasSupportForm;
  if(item.expect==='js'&&item.path.endsWith('gravity-guide-registry.js'))ok=ok&&meta.hasGuidePrimaryPaths;
  report.push({name:item.name,path:item.path,status:response.status,ok,elapsedMs:Date.now()-started,...meta,...parseError?{error:parseError}:{}});
 }catch(error){report.push({name:item.name,path:item.path,ok:false,elapsedMs:Date.now()-started,error:String(error?.name||'Network error')});}
}
console.log('GRAVITY_LIVE_READ_ONLY_HEALTH '+JSON.stringify({runAt:new Date().toISOString(),base:BASE,method:'GET only',noCustomerWrites:true,checks:report.length,passed:report.filter(x=>x.ok).length,failed:report.filter(x=>!x.ok).length,results:report}));
if(report.some(x=>!x.ok))process.exitCode=1;
