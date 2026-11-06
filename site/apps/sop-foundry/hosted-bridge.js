(()=>{'use strict';
const previousFetch=window.fetch.bind(window),SESSION='gravityFoundryHostedSessionV1',CONN='gravityFoundryHostedManagerV1',BRAND='gravityFoundryHostedBrandV1';
const employeeFiles=new Set(['employee-app.html','staff-sops.html','staff-recipes.html','staff-posters.html','staff-message.html','training.html']);
const routeFile=location.pathname.split('/').pop()||'';
const file=routeFile&&!routeFile.includes('.')?routeFile+'.html':routeFile;
const isEmployeePage=()=>employeeFiles.has(file)||(file==='assistant.html'&&new URLSearchParams(location.search).get('room')!=='build');
function read(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}}
function write(key,value){localStorage.setItem(key,JSON.stringify(value))}
function session(){const s=read(SESSION);if(!s?.token||!s?.active||Date.parse(s.expiresAt||0)<=Date.now())return null;return s}
function connection(){const c=read(CONN);return c?.workspaceCode&&c?.managerKey?c:null}
function auth(token,headers={}){const h=new Headers(headers);h.set('Authorization','Bearer '+token);return h}
function hostedRoute(url){const map={'/api/published-sops':'published-sops','/api/staff-recipes':'staff-recipes','/api/published-posters':'published-posters','/api/activity':'activity','/api/messages':'messages','/api/training':'training','/api/assistant':'assistant'};const target=map[url.pathname];return target?'/foundry-hosted/'+target+url.search:null}
const EMPLOYEE_PUBLIC_FIELDS={sop:['id','sourceId','title','station','category','frequency','role','purpose','steps','checks','correction','records','safety','revision','revisionUpdatedAt','effectiveDate','approvedBy','publishedAt','trainingRequirement','changeSummary','nextReviewDate','status','restaurantName'],recipe:['id','title','type','category','yield','ingredients','steps','allergens','notes','glassware','ice','garnish','serviceware','buildType','revision','approvedBy','publishedAt','status','changeSummary','effectiveDate'],poster:['id','title','station','category','lines','note','revision','sopId','relatedSopIds','status','updatedAt','orientation','templateKey']};
function employeePublic(item,kind){if(!item||typeof item!=='object'||Array.isArray(item))return null;const data={};for(const key of EMPLOYEE_PUBLIC_FIELDS[kind]||[]){if(Object.prototype.hasOwnProperty.call(item,key))data[key]=structuredClone(item[key]);}return data;}
function snapshot(s){return{restaurantName:s?.branding?.name||s?.workroom?.restaurant||window.foundryBrand?.name||'Your Restaurant',branding:s?.branding||{name:window.foundryBrand?.name||'Your Restaurant',logo:''},publishedSops:Object.values(s?.publishedSops||{}).map(x=>employeePublic(x,'sop')),publishedRecipes:Object.values(s?.publishedRecipes||{}).map(x=>employeePublic(x,'recipe')),posters:Object.values(s?.posters||{}).filter(x=>x.status==='Active').map(x=>employeePublic(x,'poster'))}}
async function sync(){const c=connection();if(!c)return{connected:false};const state=await window.GravityFoundryWeb.load(),employeePin=String(state.pins?.staff||'');const r=await previousFetch('/foundry-hosted/manager/sync',{method:'POST',headers:auth(c.managerKey,{'Content-Type':'application/json'}),body:JSON.stringify({employeePin,snapshot:snapshot(state)})}),d=await r.json();if(!r.ok)throw Error(d.error||'Hosted employee sync failed.');const next={...c,lastSync:d.syncedAt||new Date().toISOString(),lastError:''};write(CONN,next);return{connected:true,...d}}
// On first use, reconcile all hosted history; subsequent syncs overlap by 5s.
const PULL_STREAMS=['activity','messages','training'],FIRST_EVENT='1970-01-01T00:00:00.000Z';
let ongoingPull=null;
function pullStart(cursor){if(!cursor)return FIRST_EVENT;const t=Date.parse(cursor);return Number.isFinite(t)?new Date(Math.max(0,t-5000)).toISOString():FIRST_EVENT}
function sameConnection(initial){const current=connection();return current&&current.workspaceCode===initial.workspaceCode&&current.managerKey===initial.managerKey?current:null}
async function pull(){
  if(ongoingPull)return ongoingPull;
  const job=(async()=>{
    const c=connection();if(!c)return{connected:false,added:0};
    let added=0,pages=0,checkpoint={...(c.lastPullV2||{})};
    for(const stream of PULL_STREAMS){
      const since=pullStart(checkpoint[stream]);let until='',after=null,finished=false;
      for(let pageNumber=0;pageNumber<10000;pageNumber++){
        if(!sameConnection(c))throw Error('Hosted manager connection changed during synchronization. No checkpoint was advanced.');
        const query=new URLSearchParams({stream,since});
        if(until)query.set('until',until);
        if(after){query.set('afterAt',after.at);query.set('afterId',after.id)}
        const response=await previousFetch('/foundry-hosted/manager/events?'+query.toString(),{headers:auth(c.managerKey)});
        const data=await response.json();
        if(!response.ok)throw Error(data.error||'Could not retrieve employee '+stream+' records.');
        if(data.stream!==stream||!Array.isArray(data.records)||typeof data.hasMore!=='boolean'||!Number.isFinite(Date.parse(data.until)))
          throw Error('Hosted synchronization returned an invalid page. No checkpoint was advanced.');
        if(until&&data.until!==until)throw Error('Hosted history window changed during synchronization.');
        until=data.until;pages++;
        if(typeof document!=='undefined'){
          const status=document.getElementById('actionStatus');
          if(status)status.textContent='Synchronizing employee '+stream+' records (page '+pages+', '+added+' recovered so far).';
        }
        if(data.hasMore&&(!data.nextCursor||!data.nextCursor.at||!data.nextCursor.id||!data.records.length))
          throw Error('Hosted event response is incomplete. No checkpoint was advanced.');
        if(after&&data.hasMore&&data.nextCursor.at===after.at&&data.nextCursor.id===after.id)
          throw Error('Hosted event pagination did not advance.');
        if(data.records.length){
          const original=await window.GravityFoundryWeb.load();
          const existing=Array.isArray(original[stream])?original[stream]:[];
          const ids=new Set(existing.map(x=>x.id)),incoming=[];
          for(const record of data.records){
            if(!record||!record.id)throw Error('Hosted employee record is missing its identifier.');
            if(!ids.has(record.id)){ids.add(record.id);incoming.push(record)}
          }
          if(incoming.length){
            if(!sameConnection(c))throw Error('Hosted manager connection changed during synchronization.');
            await window.GravityFoundryWeb.save({...original,[stream]:[...incoming.reverse(),...existing]});
            added+=incoming.length;
          }
        }
        if(data.hasMore){after=data.nextCursor;continue}
        const fresh=sameConnection(c);
        if(!fresh)throw Error('Hosted manager connection changed during synchronization.');
        checkpoint={...checkpoint,[stream]:until};
        write(CONN,{...fresh,lastPullV2:checkpoint,lastPullCount:added,lastPullCheckedAt:new Date().toISOString()});
        finished=true;break;
      }
      if(!finished)throw Error('Hosted synchronization exceeded the safe page limit. No complete checkpoint available.');
    }
    const fresh=sameConnection(c);
    if(!fresh)throw Error('Hosted manager connection changed during synchronization.');
    write(CONN,{...fresh,lastPullCount:added,lastPullCheckedAt:new Date().toISOString()});
    return{connected:true,added,pages,serverTime:new Date().toISOString(),reconciled:true};
  })();
  ongoingPull=job;
  try{return await job}finally{ongoingPull=null}
}
async function status(){const c=connection();if(!c)return{connected:false};const r=await previousFetch('/foundry-hosted/manager/status',{headers:auth(c.managerKey)}),d=await r.json();if(!r.ok)throw Error(d.error||'Hosted employee status unavailable.');return{connected:true,...d}}
function clearEmployeeSession(){const s=read(SESSION);localStorage.removeItem(SESSION);localStorage.removeItem(BRAND);return s}
window.GravityFoundryHosted={session,connection,sync,pull,status,clearEmployeeSession,isEmployeePage};
window.fetch=async(input,init={})=>{const url=new URL(typeof input==='string'?input:input instanceof Request?input.url:String(input),location.href),method=(init.method||(input instanceof Request?input.method:'GET')||'GET').toUpperCase(),staff=session();
  if(url.origin===location.origin&&isEmployeePage()&&staff){const target=hostedRoute(url);if(target){const headers=auth(staff.token,init.headers||(input instanceof Request?input.headers:{}));return previousFetch(target,{...init,method,headers})}}
  const response=await previousFetch(input,init);
  if(url.origin===location.origin&&!isEmployeePage()&&response.ok&&method!=='GET'&&connection()&&['/api/published-sops','/api/staff-recipes','/api/posters','/api/room-settings'].includes(url.pathname)){setTimeout(()=>sync().catch(e=>{const c=connection();if(c)write(CONN,{...c,lastError:e.message})}),0)}
  return response;
};
})();
