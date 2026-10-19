(()=>{'use strict';
// Shared web + Windows Build Room binder. The Print dialog is manager-only.
// Prints at most 25 SOPs per batch, avoiding huge Chromium print jobs.
const API='/api/',MAX=25;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
let working=[],publishedSops=[],index=0,filter='published',station='all',dialog,summary,selectStatus,selectStation,selectedBatch=null;
const toast=s=>{if(summary)summary.textContent=s};
async function fetchJson(path){
 const response=await fetch(API+path,{cache:'no-store'});
 if(!response.ok)throw Error('Manager Build Room access is required ('+response.status+').');
 return response.json();
}
async function load(){
 const [work,published]=await Promise.all([fetchJson('workroom'),fetchJson('published-sops')]);
 const all=Array.isArray(work?.data?.sops)?work.data.sops:[];
 const publicSops=Array.isArray(published?.data?.sops)?published.data.sops:[];
 // The published library is an approved snapshot, not the editable manager copy.
 // Editing a published SOP must not replace the employee version in printed binders.
 working=all.map(s=>({...s,_isPublished:false}));
 publishedSops=publicSops.map(s=>({...s,_isPublished:true}));
 let names=[...new Set([...working,...publishedSops].map(s=>String(s.station||s.stationName||s.category||'General').trim()||'General'))].sort();
 selectStation.innerHTML='<option value="all">All stations</option>'+names.map(s=>'<option value="'+esc(s)+'">'+esc(s)+'</option>').join('');
 station='all';selectStation.value='all';index=0;update();
}
function included(){
 return (filter==='published'?publishedSops:working).filter(s=>{
   if(station!=='all'&&String(s.station||s.stationName||s.category||'General').trim()!==station)return false;
   if(filter==='approved')return s.status==='Approved'&&s.isSample===false;
   return true;
 }).sort((a,b)=>String(a.station||'').localeCompare(String(b.station||''))||String(a.title||'').localeCompare(String(b.title||'')));
}
function update(){
 const set=included(),pages=Math.max(1,Math.ceil(set.length/MAX));
 index=Math.max(0,Math.min(index,pages-1));
 const a=index*MAX,b=Math.min(set.length,a+MAX);
 toast(set.length?'Showing SOPs '+(a+1)+'–'+b+' of '+set.length+' · Batch '+(index+1)+' of '+pages:'No SOPs match this filter. Choose another status or station.');
 dialog.querySelector('#gravity-binder-prev').disabled=index<=0;
 dialog.querySelector('#gravity-binder-next').disabled=index>=pages-1;
 dialog.querySelector('#gravity-binder-print').disabled=!set.length;
 dialog.querySelector('#gravity-binder-preview-list').innerHTML=set.slice(a,b).map(s=>'<li>'+esc(s.title||'Untitled')+' <small>('+esc(s.revision||'1.0')+', '+esc(s.status||'Draft')+(s.isSample?' — sample':'')+')</small></li>').join('');
}
function sopHtml(s){
 const state=s.isSample?'SAMPLE — customize and approve before use':s._isPublished?'PUBLISHED SOP':'MANAGER WORKING COPY — NOT PUBLISHED';
 const link=typeof window.foundrySopUrl==='function'?window.foundrySopUrl(String(s.id)):'';
 const safeLink=s._isPublished&&/^https:\/\/thomasmonroebooks\.com\/e\/[A-Z0-9]+/i.test(link)?link:'';
 const lines=(Array.isArray(s.steps)?s.steps:[]).filter(Boolean);
 const block=(title,value)=>'<section class="gravity-binder-block"><h3>'+esc(title)+'</h3><p>'+esc(value||'Not documented')+'</p></section>';
 return '<section class="gravity-binder-sop"><header><div class="gravity-binder-eyebrow">'+esc(state)+'</div><h2>'+esc(s.title||'Untitled SOP')+'</h2><p>'+esc(s.station||s.stationName||s.category||'General')+' · Revision '+esc(s.revision||'1.0')+' · Effective '+esc(s.effectiveDate||'Not set')+'</p></header>'+
 block('Purpose',s.purpose)+block('Responsible role',s.role)+block('When used',s.frequency)+
 '<section class="gravity-binder-block"><h3>Approved procedure steps</h3><ol>'+lines.map(step=>'<li>'+esc(step)+'</li>').join('')+'</ol></section>'+
 block('Success checks',s.checks)+block('Required records',s.records)+block('Corrective action',s.correction)+block('Safety notes',s.safety)+
 '<footer><p><strong>Approved by:</strong> '+esc(s.approvedBy||'Not yet approved')+' · <strong>Change summary:</strong> '+esc(s.changeSummary||'None recorded')+'</p>'+
 (safeLink?'<p><strong>Hosted employee link:</strong> '+esc(safeLink)+'</p>':'<p>Employee phone QR unavailable until a hosted workspace is connected and this SOP is published.</p>')+'</footer></section>';
}
function print(){
 const selected=included().slice(index*MAX,(index+1)*MAX);if(!selected.length)return;
 // Clear finished one-SOP print sources before preparing a binder batch.
 document.querySelectorAll('.print-target').forEach(node=>node.remove());
 const style='<style>.gravity-binder-cover{border-bottom:3px solid #c59b35;padding:8mm 0 12mm}.gravity-binder-cover h1{font-size:28pt;color:#171e2a}.gravity-binder-cover p{font-size:10pt}.gravity-binder-sop{break-before:page;page-break-before:always;color:#111;font:10pt/1.5 Arial,sans-serif}.gravity-binder-sop header{border-bottom:2px solid #c59b35;padding:6mm 0}.gravity-binder-sop h2{font:23pt Georgia,serif;margin:3mm 0}.gravity-binder-sop h3{font:700 11pt Arial,sans-serif;margin:4mm 0 2mm}.gravity-binder-block{break-inside:avoid}.gravity-binder-sop ol{padding-left:7mm}.gravity-binder-sop li{margin:0 0 3mm}.gravity-binder-sop footer{border-top:1px solid #ccc;font-size:8pt;margin-top:7mm;padding-top:3mm;overflow-wrap:anywhere}.gravity-binder-eyebrow{font-weight:bold;letter-spacing:.04em;color:#6e4b00}.gravity-binder-toc{column-count:2;font-size:9pt}.gravity-binder-toc li{break-inside:avoid;margin-bottom:2mm}@media print{.gravity-binder-sop{break-before:page;page-break-before:always}.gravity-binder-cover{break-after:page;page-break-after:always}}<\/style>';
 const item=document.createElement('article');item.id='gravity-binder-print-source';item.className='print-target';
 item.style.cssText='position:fixed;left:-20000px;top:0;width:195mm;background:#fff;color:#111;padding:8mm';
 item.innerHTML=style+'<div class="gravity-binder-cover"><h1>Gravity SOP Binder</h1><p>Restaurant: '+esc(window.foundryBrand?.name||'Your Restaurant')+'</p><p>Selection: '+esc(selectStatus.selectedOptions[0]?.textContent||'')+' · '+esc(station==='all'?'All stations':station)+' · Batch '+(index+1)+'</p><p>Generated '+esc(new Date().toLocaleString())+'. Manager control copy. Verify approval and effective dates before use.</p><h2>Contents</h2><ol class="gravity-binder-toc">'+selected.map(s=>'<li>'+esc(s.title||'Untitled')+'</li>').join('')+'</ol></div>'+selected.map(sopHtml).join('');
 document.body.append(item);
 if(dialog.open)dialog.close();
 window.print();
 setTimeout(()=>item.remove(),1200);
}
function init(){
 const nav=document.querySelector('#nav');if(!nav)return;
 const button=document.createElement('button');button.type='button';button.id='gravity-binder-open';button.textContent='▤ Print SOP Binder';button.title='Print manager-controlled station SOP binders in batches of up to 25';
 nav.append(button);
 dialog=document.createElement('dialog');dialog.id='gravity-binder-dialog';dialog.style.cssText='max-width:min(900px,95vw);width:100%;max-height:90vh;overflow:auto;border-radius:16px;padding:24px;border:2px solid #c59b35;background:white;color:#102938;box-shadow:0 16px 45px #0007';
 dialog.innerHTML='<h2 style="margin:0 0 10px">Print SOP Binder</h2><p>Manager-only print control. Select what to include, review the batch, then Print / Save as PDF. Each batch contains up to 25 SOPs. Sample or draft procedures are clearly labeled and must not be mistaken for approved procedures.</p>'+
 '<div style="display:flex;gap:14px;flex-wrap:wrap"><label>Status <select id="gravity-binder-status"><option value="published">Published employee SOP snapshots only (recommended)</option><option value="approved">Approved working SOPs</option><option value="all">All SOPs, including samples and drafts — manager review</option></select></label><label>Station <select id="gravity-binder-station"><option>All stations</option></select></label></div>'+
 '<p id="gravity-binder-status-text" role="status"></p><ol id="gravity-binder-preview-list" style="max-height:250px;overflow:auto;columns:2"></ol>'+
 '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px"><button type="button" id="gravity-binder-prev">← Previous 25</button><button type="button" id="gravity-binder-next">Next 25 →</button><button type="button" id="gravity-binder-print">Preview print batch</button><button type="button" id="gravity-binder-close">Close</button></div>';
 document.body.append(dialog);
 summary=dialog.querySelector('#gravity-binder-status-text');
 selectStatus=dialog.querySelector('#gravity-binder-status');
 selectStation=dialog.querySelector('#gravity-binder-station');
 selectStatus.onchange=()=>{filter=selectStatus.value;index=0;update()};
 selectStation.onchange=()=>{station=selectStation.value;index=0;update()};
 dialog.querySelector('#gravity-binder-prev').onclick=()=>{index--;update()};
 dialog.querySelector('#gravity-binder-next').onclick=()=>{index++;update()};
 dialog.querySelector('#gravity-binder-print').onclick=()=>print();
 dialog.querySelector('#gravity-binder-close').onclick=()=>dialog.close();
 button.onclick=async()=>{button.disabled=true;try{if(!dialog.open)dialog.showModal();toast('Loading SOPs...');await load()}catch(e){toast(e.message)}finally{button.disabled=false}};
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();