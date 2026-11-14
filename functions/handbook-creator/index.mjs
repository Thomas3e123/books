import {foundingYear,PRICE,paymentReady} from '../../handbook/access.mjs';
import {paymentService} from '../../handbook/payments.mjs';
import {validate} from '../../handbook/source/core.mjs';
import {createPDF,createWord} from '../../handbook/source/export.mjs';
const MAX_REQUEST_BYTES=4_000_000;
async function readLimitedBody(req){
 const declared=Number(req.headers.get('content-length')||0);
 if(Number.isFinite(declared)&&declared>MAX_REQUEST_BYTES)return null;
 if(!req.body){const raw=await req.text();return Buffer.byteLength(raw,'utf8')>MAX_REQUEST_BYTES?null:raw;}
 const reader=req.body.getReader(),chunks=[];let total=0;
 try{while(true){const{done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>MAX_REQUEST_BYTES){await reader.cancel();return null;}chunks.push(Buffer.from(value));}}
 finally{reader.releaseLock();}
 return Buffer.concat(chunks,total).toString('utf8');
}
const SAFE_ERRORS=new Map([
 ['This is not a supported Gravity handbook project.',400],
 ['Invalid answer in backup.',400],
 ['An answer exceeds the supported size.',400],
 ['Invalid logo in backup.',400],
 ['Invalid skipped-question status.',400],
 ['Restaurant name must be 140 characters or fewer.',400],
 ['Live checkout is not available yet. No payment has been taken.',503],
 ['Invalid unlock code.',400],
 ['This checkout has expired. Start a new checkout.',400],
 ['Square could not complete this request. Please retry.',502],
 ['Invalid checkout request.',400],
 ['Unexpected checkout address.',502],
 ['Purchase verification failed.',400],
 ['Payment is not complete.',409],
 ['Payment is incomplete, declined or refunded. Downloads remain locked.',402]
]);
export async function handle(req,{env={},now=Date.now(),payments=paymentService(env)}={}){
 const json=(v,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'private, no-store'}});
 if(req.headers.get('Origin')&&req.headers.get('Origin')!==new URL(req.url).origin)return json({error:'Origin not allowed.'},403);
 const action=new URL(req.url).searchParams.get('action')||'status';const free=foundingYear(now);
 if(action==='status')return json({free,freeThrough:'October 1, 2027',price:PRICE,currency:'USD',paymentReady:paymentReady(env)});
 if(req.method!=='POST')return json({error:'POST required.'},405);
 try{
 const raw=await readLimitedBody(req);if(raw===null)return json({error:'Project is too large.'},413);let b={};try{b=raw?JSON.parse(raw):{}}catch{return json({error:'Request body must contain valid JSON.'},400)};
 if(action==='checkout'){if(free)return json({free:true,error:'The Creator is free during the Founding Year. No checkout is needed.'},409);return json(await payments.create(b.requestId));}
 if(action==='verify'){return json(await payments.verify(b.ticket));}
 if(action==='preview')return json({pages:createPDF(validate(b.project)).pages});
 if(action==='export'){
 if(!free&&!await payments.licensed(b.license))return json({error:'The Founding Year has ended. Unlock unlimited handbooks for $29, or enter your existing unlock code.',purchaseRequired:true},402);
 if(!['pdf','docx'].includes(b.format))return json({error:'Choose PDF or Word.'},400);
 const project=validate(b.project);const blob=b.format==='pdf'?new Blob([createPDF(project,!!b.mono).doc.output('arraybuffer')],{type:'application/pdf'}):await createWord(project);
 return new Response(blob,{headers:{'Content-Type':blob.type,'Content-Disposition':`attachment; filename="Gravity-Handbook.${b.format}"`,'Cache-Control':'private, no-store'}});
 }
 return json({error:'Unknown action.'},404);
 }catch(e){console.error('handbook-creator request failed',e?.name||'unknown');const message=typeof e?.message==='string'?e.message:'';const status=SAFE_ERRORS.get(message);return json({error:status?message:'Unable to complete this request. Your saved work is still on this device. Please retry.'},status||503);}
}
export default req=>handle(req,{env:{SQUARE_ACCESS_TOKEN:Netlify.env.get('SQUARE_ACCESS_TOKEN'),SQUARE_LOCATION_ID:Netlify.env.get('SQUARE_LOCATION_ID'),GRAVITY_HANDBOOK_BRIDGE_SECRET:Netlify.env.get('GRAVITY_HANDBOOK_BRIDGE_SECRET')}});
export const config={rateLimit:{windowLimit:60,windowSize:60,aggregateBy:['ip','domain']}};
