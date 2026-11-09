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
   const r=await fetch(url,{method:'HEAD',redirect:'follow',signal:AbortSignal.timeout(14000)});
   row.status=r.status;row.bytes=Number(r.headers.get('content-length')||0);row.contentType=r.headers.get('content-type')||'';
   row.ok=r.status===200&&(file.endsWith('.html')?row.contentType.startsWith('text/html'):(!row.bytes||row.bytes===row.localBytes)&&!row.contentType.startsWith('text/html'));
   row.redirected=r.redirected;
   // Be strict on known binary file sizes, but allow omitted Content-Length.
   if(r.status===200&&row.bytes&&row.bytes!==row.localBytes&&!file.endsWith('.html'))row.ok=false;
  }catch(e){row.ok=false;row.error=String(e?.name||e).slice(0,100)}
  output.push(row);
 }
}
await Promise.all(Array.from({length:8},worker));
const extCount={};
for(const x of output){const ext=path.extname(x.path).slice(1);extCount[ext]=(extCount[ext]||0)+1}
const failures=output.filter(x=>!x.ok);
const mismatches=[];
for(const x of failures.filter(v=>v.status===200&&!v.path.endsWith('.html'))){
 try{
  const {createHash}=await import('node:crypto');
  const live=Buffer.from(await(await fetch(base+'/'+encodeURI(x.path),{signal:AbortSignal.timeout(20000)})).arrayBuffer());
  const local=fs.readFileSync('site/'+x.path);
  const hash=b=>createHash('sha256').update(b).digest('hex');
  mismatches.push({path:x.path,localBytes:local.length,liveBytes:live.length,localSha256:hash(local),liveSha256:hash(live),same:hash(local)===hash(live)});
 }catch(e){mismatches.push({path:x.path,error:String(e?.message||e).slice(0,140)})}
}

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
console.log('GRAVITY_PUBLIC_DOWNLOAD_ASSET_AUDIT '+JSON.stringify({runAt:new Date().toISOString(),base,checked:output.length,passed,failed:failures.length,extensions:extCount,failures:failures.slice(0,100),mismatches,binarySamples:sampled}));
if(failures.length||sampled.some(x=>!x.ok))process.exitCode=1;
