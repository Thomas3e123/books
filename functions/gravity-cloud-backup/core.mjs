// Gravity customer backup API. Authentication is provided by Netlify Identity;
// payloads must be encrypted by the customer's browser before reaching the server.
// No email/password, employee name, wage, recipe, or stock data is accepted in clear text.
const headers={'Cache-Control':'no-store, no-cache, must-revalidate','Content-Type':'application/json; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const MAX_BYTES=900000;
const result=(value,status=200)=>new Response(JSON.stringify(value),{status,headers});
const errors=(message,status)=>result({ok:false,error:message},status);
const legitTool=t=>t==='shift'||t==='inventory';
function safeEnvelope(x){
 if(!x||typeof x!=='object'||Array.isArray(x)||Object.keys(x).sort().join(',')!=='alg,ciphertext,iv,iterations,kdf,salt,version')return false;
 if(x.version!==1||x.alg!=='AES-256-GCM'||x.kdf!=='PBKDF2-SHA256'||x.iterations<310000||x.iterations>1000000)return false;
 for(const [key,min,max] of [['salt',22,50],['iv',16,24],['ciphertext',24,880000]]){
  if(typeof x[key]!=='string'||x[key].length<min||x[key].length>max||!/^[A-Za-z0-9_-]+$/.test(x[key]))return false;
 }
 return true;
}
function sameOrigin(request){
 const origin=request.headers.get('origin');
 if(!origin)return false;
 try{return new URL(origin).origin===new URL(request.url).origin}catch{return false}
}
export function createCloudBackupHandler({getIdentityUser,store}){
 return async request=>{
  try{
   if(request.method==='OPTIONS')return errors('Not available',405);
   const url=new URL(request.url);
   const tail=url.pathname.split('/').filter(Boolean);
   // Only the explicit scoped paths, never arbitrary data keys.
   const tool=tail.at(-1);
   if(!['GET','PUT','DELETE'].includes(request.method))return errors('Method not allowed',405);
   // Origin validation on all state-changing operations; no third-party CORS.
   if(request.method!=='GET'&&!sameOrigin(request))return errors('Same-origin request required',403);
   const user=await getIdentityUser();
   if(!user||typeof user.id!=='string'||!user.id)return errors('Sign in to your verified Gravity customer account',401);
   const uid=user.id;
   if(tool==='status'&&request.method==='GET'){
    const rows=await store.status(uid);
    return result({ok:true,account:{email:user.email||'',id:uid},tools:rows});
   }
   if(!legitTool(tool))return errors('Unknown backup workspace',404);
   if(request.method==='GET'){
    const revision=url.searchParams.has('revision')?Number(url.searchParams.get('revision')):null;
    if(revision!==null&&(!Number.isSafeInteger(revision)||revision<1))return errors('Invalid revision',400);
    const entry=await store.read(uid,tool,revision);
    if(!entry)return errors('No encrypted backup exists for this workspace',404);
    return result({ok:true,tool,revision:entry.revision,createdAt:entry.createdAt,envelope:entry.envelope});
   }
   if(request.method==='PUT'){
    const raw=await request.text();
    if(new TextEncoder().encode(raw).length>MAX_BYTES)return errors('Encrypted backup exceeds the 900 KB limit',413);
    let input;try{input=JSON.parse(raw)}catch{return errors('Invalid JSON backup',400)}
    if(!input||typeof input!=='object'||!safeEnvelope(input.envelope)||!Number.isSafeInteger(input.baseRevision)||input.baseRevision<0)return errors('Invalid encrypted backup envelope or revision',400);
    const size=new TextEncoder().encode(JSON.stringify(input.envelope)).length;
    if(size>MAX_BYTES)return errors('Encrypted backup exceeds the size limit',413);
    const latest=await store.latest(uid,tool);
    if(Number(latest?.revision||0)!==input.baseRevision)return errors('Backup version conflict. Load the latest backup before changing this device.',409);
    if(latest&&Date.now()-new Date(latest.createdAt).getTime()<12000)return errors('Backup was saved recently; retry shortly',429);
    let record;
    try{record=await store.insert(uid,tool,input.baseRevision+1,input.envelope,size)}
    catch(error){if(error?.code==='23505')return errors('Backup conflict; refresh the latest version',409);throw error}
    await store.prune(uid,tool,5);
    return result({ok:true,tool,revision:record.revision,createdAt:record.createdAt},201);
   }
   if(request.method==='DELETE'){
    const raw=await request.text();let body;try{body=JSON.parse(raw)}catch{return errors('Confirmation required',400)}
    if(body?.confirmation!=='DELETE MY CLOUD BACKUPS')return errors('Type the exact deletion confirmation',400);
    const removed=await store.deleteAll(uid,tool);
    return result({ok:true,tool,deleted:removed});
   }
   return errors('Not found',404);
  }catch(e){
   // Never leak database errors, credentials, or employee information to users.
   console.error('Gravity encrypted backup request failed',e?.name||'unknown');
   return errors('Backup service is unavailable; keep your local download and retry',503);
  }
 }
}
