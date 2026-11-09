// Checks public static download assets (read-only) against the actual deployed Gravity site.
// This audit never registers, submits forms, downloads private records, or initiates purchases.
import fs from 'node:fs';
import path from 'node:path';
const base='https://gravityleadershipsystem.com';
const root='site/assets/downloads';
const suffixes=new Set(['.pdf','.docx','.xlsx','.zip','.html']);
function visit(dir){
 const arr=[];
 for(const d of fs.readdirSync(dir,{withFileTypes:true})){
  const p=path.join(dir,d.name);
  if(d.isDirectory())arr.push(...visit(p));
  else if(d.isFile()&&suffixes.has(path.extname(p).toLowerCase()))arr.push(p.replaceAll(path.sep,'/'));
 }
 return arr;
}
const paths=visit(root).sort();
const output=[];let cursor=0;
async function worker(){
 while(cursor<paths.length){
  const file=paths[cursor++];
  const url=base+'/'+encodeURI(file.slice('site/'.length));
  let row={path:file.slice('site/'.length),localBytes:fs.statSync(file).size};
  try{
   const r=await fetch(url,{method:'HEAD',redirect:'manual',signal:AbortSignal.timeout(14000)});
   row.status=r.status;row.bytes=Number(r.headers.get('content-length')||0);row.contentType=r.headers.get('content-type')||'';
   row.ok=r.status===200&&(!row.bytes||row.bytes===row.localBytes)&&!row.contentType.startsWith('text/html')||r.status===200&&file.endsWith('.html');
   // Be strict on known binary file sizes, but allow omitted Content-Length.
   if(r.status===200&&row.bytes&&row.bytes!==row.localBytes)row.ok=false;
  }catch(e){row.ok=false;row.error=String(e?.name||e).slice(0,100)}
  output.push(row);
 }
}
await Promise.all(Array.from({length:8},worker));
const extCount={};
for(const x of output){const ext=path.extname(x.path).slice(1);extCount[ext]=(extCount[ext]||0)+1}
const failures=output.filter(x=>!x.ok);
const sample=output.filter(x=>/\.(pdf|docx|zip|xlsx)$/i.test(x.path)).sort((a,b)=>b.localBytes-a.localBytes);
const chosen=new Map();
for(const x of sample){const ext=path.extname(x.path);if(!chosen.has(ext))chosen.set(ext,x)}
const signatures={'.pdf':'25504446','.docx':'504b','.zip':'504b','.xlsx':'504b'};
const sampled=[];
for(const [ext,x] of chosen){
 const url=base+'/'+encodeURI(x.path);
 try{
  const r=await fetch(url,{method:'GET',headers:{Range:'bytes=0-7'},signal:AbortSignal.timeout(18000)});
  const b=new Uint8Array(await r.arrayBuffer()),magic=Array.from(b.slice(0,4)).map(a=>a.toString(16).padStart(2,'0')).join('');
  const ok=(r.status===206||r.status===200)&&magic.startsWith(signatures[ext])&&b.length>=4;
  sampled.push({path:x.path,status:r.status,firstBytes:magic,returnedBytes:b.length,ok});
 }catch(e){sampled.push({path:x.path,ok:false,error:String(e?.name||e)})}
}
const passed=output.filter(x=>x.ok).length;
console.log('GRAVITY_PUBLIC_DOWNLOAD_ASSET_AUDIT '+JSON.stringify({runAt:new Date().toISOString(),base,checked:output.length,passed,failed:failures.length,extensions:extCount,failures:failures.slice(0,100),binarySamples:sampled}));
if(failures.length||sampled.some(x=>!x.ok))process.exitCode=1;
