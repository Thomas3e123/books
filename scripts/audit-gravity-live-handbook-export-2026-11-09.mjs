// One-time live Gravity Handbook Creator export QA.
// Uses only synthetic policy text. No customer account, PII, purchases, or persistent site writes.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const BASE='https://gravityleadershipsystem.com';
const ENDPOINT=BASE+'/.netlify/functions/handbook-creator?action=';
const checks=[], temp=mkdtempSync(join(tmpdir(),'gravity-handbook-live-qa-'));
const project={
 formatVersion:'0.2.0',
 projectId:randomUUID(),
 title:'Gravity Synthetic QA Handbook',
 interviewLevel:'basic',
 applicability:{tips:'no',alcohol:'no',youth:'no',specialty:'no'},
 answers:{
  'welcome.name':'Gravity Synthetic QA Restaurant',
  'welcome.mission':'This fictional restaurant is used only to verify downloads.',
  'welcome.values':'Clear standards and respectful communication.',
  'workplace.respect':'Treat coworkers and customers respectfully.',
  'safety.handwashing':'Follow approved handwashing procedures.',
  'separation.handbook_receipt':'This is test acknowledgment text; not an approved policy.'
 },
 skips:{},
 archivedAnswers:{},
 palette:'executive',
 revisions:[],
 sectionStatus:{},
 edition:{date:'2026-11-09',label:'Synthetic audit test only'},
 createdAt:new Date().toISOString(),
 updatedAt:new Date().toISOString(),
 cursor:0
};
async function request(action,body){
 const options={method:body===undefined?'GET':'POST',
  headers:{'Accept':'application/json,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
   'Origin':BASE,...body!==undefined?{'Content-Type':'application/json'}:{}},
  cache:'no-store',
  signal:AbortSignal.timeout(35000),
  ...body!==undefined?{body:JSON.stringify(body)}:{}};
 return fetch(ENDPOINT+action,options);
}
const record=(name,result)=>{checks.push({name,...result});};
try{
 const statusRes=await request('status');
 assert.equal(statusRes.status,200);
 const offer=await statusRes.json();
 assert.equal(offer.free,true,'Test must only run during free access');
 assert.equal(offer.price,2900);
 assert.equal(offer.freeThrough,'October 1, 2027');
 record('Live status reflects current free access',{passed:true,status:statusRes.status,free:offer.free,price:offer.price});

 const previewRes=await request('preview',{project});
 assert.equal(previewRes.status,200);
 const preview=await previewRes.json();
 assert(Array.isArray(preview.pages)&&preview.pages.length>=3);
 record('Live preview builds complete handbook pages',{passed:true,status:previewRes.status,pageCount:preview.pages.length});

 for(const format of ['pdf','docx']){
  const response=await request('export',{project,format});
  const buffer=Buffer.from(await response.arrayBuffer());
  assert.equal(response.status,200,format+' should export while free');
  assert(buffer.length>3000,format+' download empty');
  assert.equal(response.headers.get('cache-control')?.includes('no-store'),true,format+' should not cache private data');
  assert.equal(response.headers.get('content-disposition')?.includes('Gravity-Handbook.'+format),true,format+' filename mismatch');
  const out=join(temp,'Gravity-Handbook.'+format);
  writeFileSync(out,buffer);
  if(format==='pdf'){
   assert.equal(buffer.subarray(0,4).toString('ascii'),'%PDF');
   assert(buffer.lastIndexOf(Buffer.from('%%EOF'))>buffer.length-100,'PDF lacks EOF marker');
  }else{
   assert.equal(buffer.subarray(0,2).toString('ascii'),'PK');
   const py=`import zipfile,sys,xml.etree.ElementTree as ET,json
p=sys.argv[1]
with zipfile.ZipFile(p) as z:
 assert z.testzip() is None
 names=set(z.namelist())
 assert '[Content_Types].xml' in names
 assert 'word/document.xml' in names
 root=ET.fromstring(z.read('word/document.xml'))
 alltext=' '.join(t for t in root.itertext())
 assert 'Gravity Synthetic QA Restaurant' in alltext
 assert 'fictional restaurant' in alltext
 print(json.dumps({'zipFiles':len(names),'hasTestText':True}))
`;
   const result=JSON.parse(execFileSync('python3',['-c',py,out],{encoding:'utf8',timeout:15000}));
   record('Word DOCX is a valid archive with expected editable text',{passed:true,...result});
  }
  record('Live '+format.toUpperCase()+' export',{passed:true,status:response.status,bytes:buffer.length,contentType:response.headers.get('content-type')});
 }

 const checkout=await request('checkout',{requestId:randomUUID()});
 assert.equal(checkout.status,409,'Free period must block charging checkout');
 const noPay=await checkout.json();
 assert.equal(noPay.free,true);
 record('Live checkout remains disabled during Founding Year',{passed:true,status:checkout.status,noPayment:true});

 const bad=await request('export',{project,format:'exe'});
 assert.equal(bad.status,400);
 record('Unsupported download format fails closed',{passed:true,status:bad.status});

 const malformed=await request('export',{project:{foo:'bad'},format:'pdf'});
 assert.equal(malformed.status,400);
 record('Invalid handbook payload rejected',{passed:true,status:malformed.status});

 console.log('GRAVITY_LIVE_HANDBOOK_EXPORT_QA '+JSON.stringify({passed:checks.length,failed:0,syntheticOnly:true,noPurchase:true,noCustomerData:true,runAt:new Date().toISOString(),checks}));
}catch(error){
 console.error('GRAVITY_LIVE_HANDBOOK_EXPORT_QA_FAILED '+JSON.stringify({passed:checks.length,error:String(error.message||error),checks}));
 process.exitCode=1;
}finally{
 rmSync(temp,{recursive:true,force:true});
}
