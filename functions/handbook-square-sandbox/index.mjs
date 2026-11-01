// Server-to-server Square SANDBOX bridge. No production payments are supported.
import { timingSafeEqual } from 'node:crypto';
const BASE='https://connect.squareupsandbox.com';
const VERSION='2026-09-16';
const RETURN='https://gravity-handbook-private-test.thomas3e.chatgpt.site/sandbox.html';
const money={amount:2900,currency:'USD'};
function same(a,b){return typeof a==='string'&&typeof b==='string'&&a.length===b.length&&timingSafeEqual(Buffer.from(a),Buffer.from(b));}
export async function handle(request,{secret,token,fetchImpl=fetch}){
 const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
 if(request.method!=='POST')return json({error:'POST required'},405);
 if(!secret||!same(request.headers.get('Authorization'),`Bearer ${secret}`))return json({error:'Unauthorized'},401);
 if(!token)return json({error:'Square sandbox token is missing'},503);
 let b;try{const raw=await request.text();if(raw.length>12000)return json({error:'Request too large'},413);b=JSON.parse(raw);}catch{return json({error:'Invalid JSON'},400);}
 async function square(path,body){const r=await fetchImpl(BASE+path,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${token}`,'Square-Version':VERSION,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const d=await r.json();if(!r.ok||d.errors?.length){const e=Error('Square sandbox request failed');e.code=d.errors?.[0]?.code||'SQUARE_ERROR';e.status=r.status;throw e;}return d;}
 const id=s=>typeof s==='string'&&/^[\w-]{12,192}$/.test(s);
 try{
 if(b.action==='locations'){const d=await square('/v2/locations');return json({locations:(d.locations||[]).filter(l=>l.status==='ACTIVE'&&l.currency==='USD').map(l=>({id:l.id,merchantId:l.merchant_id,name:l.name,currency:l.currency}))});}
 if(b.action==='checkout'){
 if(!id(b.purchaseId)||!id(b.locationId))return json({error:'Invalid purchase'},400);
 const d=await square('/v2/online-checkout/payment-links',{idempotency_key:b.purchaseId,order:{location_id:b.locationId,reference_id:b.purchaseId,line_items:[{name:'Gravity Handbook Creator — unlimited handbook unlock (SANDBOX)',quantity:'1',base_price_money:money}]},checkout_options:{redirect_url:RETURN,allow_tipping:false,ask_for_shipping_address:false}});
 return json({orderId:d.payment_link.order_id,checkoutId:d.payment_link.id,url:d.payment_link.url});
 }
 if(!id(b.orderId))return json({error:'Invalid order'},400);
 if(b.action==='pay-test'){
 if(!id(b.purchaseId)||!id(b.locationId)||!['approved','declined','pending'].includes(b.scenario))return json({error:'Invalid test'},400);
 const order=(await square('/v2/orders/'+encodeURIComponent(b.orderId))).order;
 if(order.reference_id!==b.purchaseId||order.location_id!==b.locationId||order.total_money?.amount!==2900||order.total_money?.currency!=='USD')return json({error:'Order binding mismatch'},409);
 const d=await square('/v2/payments',{idempotency_key:b.purchaseId+'-'+b.scenario,source_id:b.scenario==='declined'?'cnon:card-nonce-declined':'cnon:card-nonce-ok',amount_money:money,order_id:b.orderId,location_id:b.locationId,autocomplete:b.scenario!=='pending'});
 return json({paymentId:d.payment.id,status:d.payment.status});
 }
 if(b.action==='verify'){
 const order=(await square('/v2/orders/'+encodeURIComponent(b.orderId))).order;
 const paymentId=order.tenders?.find(t=>t.payment_id)?.payment_id||b.paymentId;
 const payment=paymentId&&id(paymentId)?(await square('/v2/payments/'+encodeURIComponent(paymentId))).payment:null;
 // Return only validation fields. Never transmit buyer/card details.
 return json({order:{id:order.id,state:order.state,reference_id:order.reference_id,location_id:order.location_id,total_money:order.total_money,line_items:order.line_items?.map(i=>({quantity:i.quantity,base_price_money:i.base_price_money}))},payment:payment?{id:payment.id,status:payment.status,order_id:payment.order_id,location_id:payment.location_id,amount_money:payment.amount_money,refunded_money:payment.refunded_money}:null});
 }
 return json({error:'Unknown action'},400);
 }catch(e){return json({error:'Square sandbox request failed',code:e.code||'UPSTREAM_ERROR'},e.status>=400&&e.status<500?422:502);}
}
export default request=>handle(request,{secret:Netlify.env.get('GRAVITY_HANDBOOK_BRIDGE_SECRET'),token:Netlify.env.get('SQUARE_SANDBOX_ACCESS_TOKEN')});
