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
function snapshot(s){return{restaurantName:s?.branding?.name||s?.workroom?.restaurant||window.foundryBrand?.name||'Your Restaurant',branding:s?.branding||{name:window.foundryBrand?.name||'Your Restaurant',logo:''},publishedSops:Object.values(s?.publishedSops||{}),publishedRecipes:Object.values(s?.publishedRecipes||{}),posters:Object.values(s?.posters||{}).filter(x=>x.status==='Active')}}
async function sync(){const c=connection();if(!c)return{connected:false};const state=await window.GravityFoundryWeb.load(),employeePin=String(state.pins?.staff||'');const r=await previousFetch('/foundry-hosted/manager/sync',{method:'POST',headers:auth(c.managerKey,{'Content-Type':'application/json'}),body:JSON.stringify({employeePin,snapshot:snapshot(state)})}),d=await r.json();if(!r.ok)throw Error(d.error||'Hosted employee sync failed.');const next={...c,lastSync:d.syncedAt||new Date().toISOString(),lastError:''};write(CONN,next);return{connected:true,...d}}
async function pull(){const c=connection();if(!c)return{connected:false,added:0};const since=c.lastPull||'1970-01-01T00:00:00.000Z',r=await previousFetch('/foundry-hosted/manager/events?since='+encodeURIComponent(since),{headers:auth(c.managerKey)}),d=await r.json();if(!r.ok)throw Error(d.error||'Could not pull employee records.');const s=await window.GravityFoundryWeb.load();let added=0;for(const [key,rows] of [['activity',d.activity||[]],['messages',d.messages||[]],['training',d.training||[]]]){s[key]=Array.isArray(s[key])?s[key]:[];const ids=new Set(s[key].map(x=>x.id));for(const row of rows){if(!ids.has(row.id)){s[key].unshift(row);ids.add(row.id);added++}}}await window.GravityFoundryWeb.save(s);write(CONN,{...c,lastPull:d.serverTime||new Date().toISOString(),lastPullCount:added});return{connected:true,added,serverTime:d.serverTime}}
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
