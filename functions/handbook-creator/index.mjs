import {foundingYear,PRICE,paymentReady} from '../../handbook/access.mjs';
import {paymentService} from '../../handbook/payments.mjs';
import {validate} from '../../handbook/source/core.mjs';
import {createPDF,createWord} from '../../handbook/source/export.mjs';
export async function handle(req,{env={},now=Date.now(),payments=paymentService(env)}={}){
 const json=(v,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'private, no-store'}});
 if(req.headers.get('Origin')&&req.headers.get('Origin')!==new URL(req.url).origin)return json({error:'Origin not allowed.'},403);
 const action=new URL(req.url).searchParams.get('action')||'status';const free=foundingYear(now);
 if(action==='status')return json({free,freeThrough:'October 1, 2027',price:PRICE,currency:'USD',paymentReady:paymentReady(env)});
 if(req.method!=='POST')return json({error:'POST required.'},405);
 try{
 const raw=await req.text();if(raw.length>4000000)return json({error:'Project is too large.'},413);const b=raw?JSON.parse(raw):{};
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
 }catch(e){return json({error:e.message||'Unable to complete this request. Your saved work is still on this device.'},400);}
}
export default req=>handle(req,{env:{SQUARE_ACCESS_TOKEN:Netlify.env.get('SQUARE_ACCESS_TOKEN'),SQUARE_LOCATION_ID:Netlify.env.get('SQUARE_LOCATION_ID'),GRAVITY_HANDBOOK_BRIDGE_SECRET:Netlify.env.get('GRAVITY_HANDBOOK_BRIDGE_SECRET')}});
export const config={rateLimit:{windowLimit:60,windowSize:60,aggregateBy:['ip','domain']}};
