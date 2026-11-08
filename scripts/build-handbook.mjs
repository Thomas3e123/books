import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {build} from 'esbuild';
let source=readFileSync('handbook/source/app.mjs','utf8');
source=source.replace("import {createPDF,createWord} from './export.mjs';",`
async function requestHandbook(action,body){const r=await fetch('/.netlify/functions/handbook-creator?action='+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,license:localStorage.getItem('gravity.handbook.license')||''})});if(!r.ok){let d;try{d=await r.json()}catch{d={error:'Connection interrupted. Please retry.'}}if(r.status===402){notice(d.error+' ');const a=document.createElement('a');a.href='/gravity-handbook-creator';a.textContent='Open access and downloads';document.getElementById('message').append(a);return null;}throw Error(d.error);}return r;}
async function protectedDownload(format,mono=false){await queue;notice('Preparing your download…');const r=await requestHandbook('export',{format,mono,project});if(r)download(await r.blob(),filename(format));}
`);
source=source.replaceAll("'gravity.handbook.private.v2'","'gravity.handbook.web.v1'").replaceAll("'gravity.handbook.active'","'gravity.handbook.web.active'").replaceAll("'gravity-handbook-private'","'gravity-handbook-web'");
source=source.replace("preview(root,mode==='previewOnly');","preview(root,mode==='previewOnly').catch(e=>notice(e.message));").replace('function preview(root,only=false)','async function preview(root,only=false)');
source=source.replace("await queue;download(createPDF(project).doc.output('blob'),filename('pdf'));","await protectedDownload('pdf');").replace("await queue;download(await createWord(project),filename('docx'));","await protectedDownload('docx');");
source=source.replace("button('Print-ready PDF',()=>{download(createPDF(project).doc.output('blob'),filename('pdf'));notice('Open the downloaded PDF and choose Print. Use Actual size for US Letter paper.');},'light')","button('Print-ready PDF',async()=>{await protectedDownload('pdf');},'light')");
source=source.replace('const {pages}=createPDF(project);',"const loading=el('p','Preparing your preview…','notice');root.append(loading);const previewId=project.projectId;const r=await requestHandbook('preview',{project});if(!r||!['preview','previewOnly'].includes(mode)||previewId!==project.projectId)return;const {pages}=await r.json();loading.remove();");
source += `
fetch('/.netlify/functions/handbook-creator?action=status',{cache:'no-store'})
.then(r=>{if(!r.ok)throw Error('Access service unavailable');return r.json();})
.then(s=>{
 if(typeof s.free!=='boolean')throw Error('Invalid access response');
 const banner=document.querySelector('.founding-banner'),badge=document.getElementById('creator-access-status');
 if(banner){
  banner.replaceChildren();
  const link=document.createElement('a');link.href='/gravity-handbook-creator';
  link.textContent=s.free?'Handbook Creator · Free during the Founding Year — through October 1, 2027. No card required.':'Handbook Creator · $29 for unlimited handbooks. Open access and downloads.';
  banner.append(link);
 }
 if(badge)badge.textContent=s.free?'FREE · FOUNDING YEAR':'$29 · UNLIMITED';
})
.catch(()=>{
 const banner=document.querySelector('.founding-banner'),badge=document.getElementById('creator-access-status');
 if(banner){
  banner.replaceChildren();
  const link=document.createElement('a');link.href='/gravity-handbook-creator';
  link.textContent='Current access offer unavailable — check details before downloading.';
  banner.append(link);
 }
 if(badge)badge.textContent='CHECK ACCESS';
});
`;
if(source.includes('createPDF')||source.includes('createWord'))throw Error('Unprotected document generation remains.');
mkdirSync('site/handbook-creator',{recursive:true});
await build({stdin:{contents:source,resolveDir:process.cwd()+'/handbook/source',sourcefile:'web-app.mjs'},bundle:true,outfile:'site/handbook-creator/app.js',format:'iife'});
const fonts=JSON.parse(readFileSync('handbook/source/fonts.json','utf8'));
const css=readFileSync('handbook/style.css','utf8').replace(/@font-face\{[^}]*\}/g,'');
const faces=Object.entries(fonts).map(([name,data])=>`@font-face{font-family:${name==='Script'?'HandbookScript':name.startsWith('Book')?'HandbookBook':'HandbookUI'};font-weight:${name.endsWith('Bold')?'700':'400'};src:url(data:font/ttf;base64,${data}) format('truetype');font-display:swap}`).join('\n');
writeFileSync('site/handbook-creator/app.css',css+'\n'+faces+'\n.founding-banner{padding:12px 20px;background:#7a201d;color:white;text-align:center}.founding-banner a{color:inherit}');
console.log('Handbook Creator built with server-controlled free access and protected exports.');
