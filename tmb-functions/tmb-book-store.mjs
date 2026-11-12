import { randomUUID, createHmac, timingSafeEqual } from 'node:crypto';
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { BOOK_BY_ID, SQUARE_ITEM_PREFIX } from '../tmb-store/catalog.mjs';

const API='https://connect.squareup.com';
const VERSION='2026-09-16';
const DOMAIN='https://thomasmonroebooks.com';
const reply=(data,status=200)=>Response.json(data,{status,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
const env=(name)=>globalThis.Netlify?.env?.get?.(name) || process.env[name] || '';
const configured=()=>env('TMB_SALES_ENABLED')==='true' &&
 env('TMB_SQUARE_ENVIRONMENT')==='production' &&
 !!env('TMB_SQUARE_ACCESS_TOKEN') &&
 !!env('TMB_SQUARE_LOCATION_ID') &&
 !!env('TMB_DOWNLOAD_SIGNING_SECRET');
function itemName(book){return SQUARE_ITEM_PREFIX+book.id+' | '+book.title;}
function goodId(id){return typeof id==='string'&&/^[a-z0-9-]{4,60}$/.test(id);}
function goodOrderId(id){return typeof id==='string'&&/^[A-Za-z0-9_-]{12,120}$/.test(id);}
async function square(uri,opts={}){
 const response=await fetch(API+'/v2'+uri,{
  ...opts,
  headers:{'Authorization':'Bearer '+env('TMB_SQUARE_ACCESS_TOKEN'),'Square-Version':VERSION,'Content-Type':'application/json',...(opts.headers||{})},
  signal:AbortSignal.timeout(12000)
 });
 let body={};try{body=await response.json()}catch{}
 if(!response.ok||body.errors?.length)throw new Error('Square did not confirm this operation');
 return body;
}
async function verifyPaidOrder(orderId,book){
 const result=await square('/orders/'+encodeURIComponent(orderId));
 const order=result.order;
 if(!order||order.id!==orderId||order.location_id!==env('TMB_SQUARE_LOCATION_ID')||order.state!=='COMPLETED')return false;
 const lines=order.line_items||[];
 if(lines.length!==1)return false;
 const line=lines[0];
 if(line.name!==itemName(book)||line.quantity!=='1' ||
    Number(line.base_price_money?.amount)!==book.priceCents ||
    line.base_price_money?.currency!=='USD')return false;
 const due=Number(order.total_money?.amount);
 if(!Number.isSafeInteger(due)||due<book.priceCents||order.total_money?.currency!=='USD')return false;
 // A completed order alone does NOT prove the payment remains unrefunded.
 const tenders=order.tenders||[];
 if(!tenders.length||tenders.length>5)return false;
 let received=0;
 for(const tender of tenders){
  const id=tender.payment_id||tender.id;
  if(!goodOrderId(id))return false;
  const result=await square('/payments/'+encodeURIComponent(id));
  const payment=result.payment;
  if(!payment||payment.id!==id||payment.order_id!==orderId||
     payment.location_id!==env('TMB_SQUARE_LOCATION_ID')||
     payment.status!=='COMPLETED'||payment.amount_money?.currency!=='USD')return false;
  const gross=Number(payment.amount_money.amount),refunded=Number(payment.refunded_money?.amount||0);
  if(!Number.isSafeInteger(gross)||!Number.isSafeInteger(refunded)||refunded<0||gross<0||refunded>gross)return false;
  received+=gross-refunded;
 }
 return received>=due;
}
function signature(id,orderId,expires){
 const secret=env('TMB_DOWNLOAD_SIGNING_SECRET');
 return createHmac('sha256',secret).update(id+'\n'+orderId+'\n'+expires).digest('hex');
}
function checkSignature(id,orderId,expires,sig){
 if(!/^[a-f0-9]{64}$/.test(sig||'')||!Number.isSafeInteger(expires)||
    expires<Date.now()||expires>Date.now()+15*60*1000)return false;
 const want=Buffer.from(signature(id,orderId,expires),'hex');
 return timingSafeEqual(want,Buffer.from(sig,'hex'));
}
function sourceFile(book){
 const candidates=[
  path.resolve(process.cwd(),book.sourcePdf),
  path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..',book.sourcePdf)
 ];
 return candidates.find(p=>existsSync(p)&&statSync(p).isFile())||null;
}
export default async function handle(request){
 const url=new URL(request.url);
 if(request.method==='GET'&&url.searchParams.get('action')==='status'){
  return reply({live:configured(),provider:configured()?'Square':null,freeAlternative:true});
 }
 if(!configured())return reply({error:'Paid purchasing is not enabled. The complete books remain free on Gravity during the Founding Year.'},503);
 if(request.method==='POST'){
  if(Number(request.headers.get('content-length')||0)>2048)return reply({error:'Invalid request'},413);
  const origin=request.headers.get('origin');
  if(origin && origin!==DOMAIN)return reply({error:'Invalid request origin'},403);
  let body={};try{body=await request.json()}catch{return reply({error:'Invalid request'},400)}
  const book=goodId(body.id)&&BOOK_BY_ID.get(body.id);
  if(!book)return reply({error:'Unknown title'},404);
  if(body.action==='checkout'){
   try{
    const payload={
     idempotency_key:randomUUID(),
     quick_pay:{name:itemName(book),price_money:{amount:book.priceCents,currency:'USD'},location_id:env('TMB_SQUARE_LOCATION_ID')},
     checkout_options:{redirect_url:DOMAIN+'/purchase-complete.html?id='+encodeURIComponent(book.id),allow_tipping:false,ask_for_shipping_address:false},
     description:'Optional publisher-supporting PDF purchase. Same PDF available free on Gravity through October 1, 2027.'
    };
    const result=await square('/online-checkout/payment-links',{method:'POST',body:JSON.stringify(payload)});
    const link=result.payment_link;
    if(!link?.url||!/^https:\/\/(?:square\.link|checkout\.square\.site)\//.test(link.url)||!goodOrderId(link.order_id))throw new Error('Unverified Square link');
    return reply({url:link.url,orderId:link.order_id});
   }catch{return reply({error:'Secure checkout is unavailable. No payment was taken.'},503)}
  }
  if(body.action==='verify'){
   if(!goodOrderId(body.orderId))return reply({error:'Invalid receipt'},400);
   try{
    if(!await verifyPaidOrder(body.orderId,book))return reply({error:'This order is not confirmed as fully paid. If you just checked out, retry shortly or contact support.'},403);
    const expires=Date.now()+12*60*1000;
    const params=new URLSearchParams({action:'download',id:book.id,orderId:body.orderId,expires:String(expires),signature:signature(book.id,body.orderId,expires)});
    return reply({ready:true,title:book.title,downloadUrl:'/api/tmb-book-store?'+params.toString(),expires});
   }catch{return reply({error:'Payment verification is temporarily unavailable. No second payment is required.'},503)}
  }
  return reply({error:'Unknown request'},400);
 }
 if(request.method==='GET'&&url.searchParams.get('action')==='download'){
  const id=url.searchParams.get('id'),orderId=url.searchParams.get('orderId');
  const expires=Number(url.searchParams.get('expires'));
  const sig=url.searchParams.get('signature'),book=goodId(id)&&BOOK_BY_ID.get(id);
  if(!book||!goodOrderId(orderId)||!checkSignature(id,orderId,expires,sig))return reply({error:'Download link has expired. Return to your confirmation page to verify the purchase again.'},403);
  try{
   if(!await verifyPaidOrder(orderId,book))return reply({error:'The purchase is not currently verified.'},403);
   const full=sourceFile(book);
   if(!full)return reply({error:'File delivery is temporarily unavailable. Contact support; do not pay again.'},503);
   const readable=Readable.toWeb(createReadStream(full));
   return new Response(readable,{status:200,headers:{
    'content-type':'application/pdf',
    'content-disposition':'attachment; filename="Thomas-Monroe-Books-'+book.id+'.pdf"',
    'content-length':String(statSync(full).size),
    'cache-control':'private, no-store, no-cache',
    'referrer-policy':'no-referrer',
    'x-content-type-options':'nosniff'
   }});
  }catch{return reply({error:'Download verification failed. Contact support; do not pay again.'},503)}
 }
 return reply({error:'Method not allowed'},405);
}
export const config={
 path:'/api/tmb-book-store',
 rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:40}
};
