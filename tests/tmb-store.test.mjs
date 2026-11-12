import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { BOOKS } from '../tmb-store/catalog.mjs';
import handle from '../tmb-functions/tmb-book-store.mjs';

const root=path.resolve(import.meta.dirname,'..');
test('all 15 TMB books have unique IDs and real controlled PDF files',()=>{
 assert.equal(BOOKS.length,15);
 assert.equal(new Set(BOOKS.map(x=>x.id)).size,BOOKS.length);
 for(const b of BOOKS){
  assert.match(b.id,/^[a-z0-9-]+$/);
  assert.ok(fs.existsSync(path.join(root,b.sourcePdf)),b.id+' missing PDF');
  assert.ok(b.priceCents>=900&&b.priceCents<=2500,b.id+' price');
  assert.ok(b.reader&&b.cover,b.id+' preview art');
 }
});
test('public catalog and samples contain no full paid PDF files',()=>{
 assert.ok(fs.existsSync(path.join(root,'tmb-site','books.html')));
 assert.equal(fs.readdirSync(path.join(root,'tmb-site')).filter(x=>x.endsWith('.pdf')).length,0);
 for(const b of BOOKS){
  const sample=fs.readFileSync(path.join(root,'tmb-site','samples',b.id+'.html'),'utf8');
  assert.match(sample,/Sample interior pages/);
  assert.ok(sample.includes(b.title.replace('’','’'))||sample.includes(b.title.replace('’','&rsquo;'))||sample.includes('&amp;'),b.id);
  assert.ok(!sample.includes('href="'+b.sourcePdf+'"'),b.id+' leaking PDF');
 }
 const page=fs.readFileSync(path.join(root,'tmb-site','books.html'),'utf8');
 assert.equal((page.match(/class="book-card tmb-sale-card"/g)||[]).length,BOOKS.length);
 assert.match(page,/same complete books/);
 assert.match(page,/buy digital pdf/i);
});
test('checkout stays disabled until fully configured with production Square',async()=>{
 const old=process.env.TMB_SALES_ENABLED;
 process.env.TMB_SALES_ENABLED='false';
 const status=await handle(new Request('https://thomasmonroebooks.com/api/tmb-book-store?action=status'));
 assert.equal((await status.json()).live,false);
 const blocked=await handle(new Request('https://thomasmonroebooks.com/api/tmb-book-store',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"action":"checkout","id":"quiet-gravity"}'}));
 assert.equal(blocked.status,503);
 if(old===undefined)delete process.env.TMB_SALES_ENABLED;else process.env.TMB_SALES_ENABLED=old;
});
test('Square checkout, entitlement, refunds and signed PDF link are enforced',async()=>{
 Object.assign(process.env,{
  TMB_SALES_ENABLED:'true',
  TMB_SQUARE_ENVIRONMENT:'production',
  TMB_SQUARE_ACCESS_TOKEN:'test-api-token-that-is-not-real',
  TMB_SQUARE_LOCATION_ID:'SQUARE_LOCATION_EXAMPLE',
  TMB_DOWNLOAD_SIGNING_SECRET:'unit-test-only-secret'
 });
 const book=BOOKS[0],orderId='exampleOrderId123456789',paymentId='examplePaymentId123456789';
 let paid=true,refunded=false;
 const original=globalThis.fetch;
 globalThis.fetch=async (url,opts={})=>{
  const endpoint=String(url);
  let response;
  if(endpoint.endsWith('/online-checkout/payment-links')) {
   const payload=JSON.parse(opts.body);
   assert.equal(payload.quick_pay.price_money.amount,book.priceCents);
   assert.match(payload.checkout_options.redirect_url,/thomasmonroebooks.com\/purchase-complete/);
   response={payment_link:{url:'https://square.link/u/example',order_id:orderId}};
  } else if(endpoint.endsWith('/orders/'+orderId)){
   response={order:{
    id:orderId,location_id:'SQUARE_LOCATION_EXAMPLE',state:paid?'COMPLETED':'OPEN',
    line_items:[{name:'Thomas Monroe Books digital PDF: '+book.id+' | '+book.title,quantity:'1',
                 base_price_money:{amount:book.priceCents,currency:'USD'}}],
    total_money:{amount:book.priceCents,currency:'USD'},
    tenders:[{id:paymentId}]
   }};
  } else if(endpoint.endsWith('/payments/'+paymentId)){
   response={payment:{id:paymentId,order_id:orderId,location_id:'SQUARE_LOCATION_EXAMPLE',
    status:'COMPLETED',amount_money:{amount:book.priceCents,currency:'USD'},
    refunded_money:{amount:refunded?book.priceCents:0}
   }};
  }else throw Error('Unexpected Square endpoint: '+endpoint);
  return new Response(JSON.stringify(response),{status:200,headers:{'Content-Type':'application/json'}});
 };
 const request=(body)=>new Request('https://thomasmonroebooks.com/api/tmb-book-store',{method:'POST',headers:{'Content-Type':'application/json','Origin':'https://thomasmonroebooks.com'},body:JSON.stringify(body)});
 try{
  assert.equal((await (await handle(new Request('https://thomasmonroebooks.com/api/tmb-book-store?action=status'))).json()).live,true);
  const checkout=await handle(request({action:'checkout',id:book.id,priceCents:1}));
  const paymentLink=await checkout.json();
  assert.equal(checkout.status,200);
  assert.match(paymentLink.url,/square.link/);
  const verified=await handle(request({action:'verify',id:book.id,orderId}));
  const unlocked=await verified.json();
  assert.equal(verified.status,200);
  assert.equal(unlocked.ready,true);
  const delivered=await handle(new Request('https://thomasmonroebooks.com'+unlocked.downloadUrl));
  assert.equal(delivered.status,200);
  assert.match(delivered.headers.get('content-type'),/application\/pdf/);
  const bytes=await delivered.arrayBuffer();
  assert.ok(bytes.byteLength>30000);
  const wrongBook=await handle(request({action:'verify',id:BOOKS[1].id,orderId}));
  assert.equal(wrongBook.status,403);
  const tamper=new URL('https://thomasmonroebooks.com'+unlocked.downloadUrl);
  tamper.searchParams.set('id',BOOKS[1].id);
  assert.equal((await handle(new Request(tamper.href))).status,403);
  const noSig=new URL('https://thomasmonroebooks.com'+unlocked.downloadUrl);
  noSig.searchParams.delete('signature');
  assert.equal((await handle(new Request(noSig.href))).status,403);
  refunded=true;
  assert.equal((await handle(request({action:'verify',id:book.id,orderId}))).status,403);
  assert.equal((await handle(new Request('https://thomasmonroebooks.com'+unlocked.downloadUrl))).status,403);
  refunded=false;paid=false;
  assert.equal((await handle(request({action:'verify',id:book.id,orderId}))).status,403);
  const invalidOrigin=await handle(new Request('https://thomasmonroebooks.com/api/tmb-book-store',{method:'POST',headers:{'Content-Type':'application/json','Origin':'https://evil.example'},body:JSON.stringify({action:'checkout',id:book.id})}));
  assert.equal(invalidOrigin.status,403);
 }finally{
  globalThis.fetch=original;
  for(const key of ['TMB_SALES_ENABLED','TMB_SQUARE_ENVIRONMENT','TMB_SQUARE_ACCESS_TOKEN','TMB_SQUARE_LOCATION_ID','TMB_DOWNLOAD_SIGNING_SECRET'])delete process.env[key];
 }
});
