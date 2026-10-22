'use strict';
const fs=require('node:fs');
const old='https://thomasmonroebooks.com',fresh='https://gravity-leadership-system.netlify.app';
const paths=['/foundry-hosted/health','/work-study-link/health','/.netlify/functions/gravity-guide','/.netlify/functions/gravity-tts','/gravity-report/articles.json'];
const manualNames=['Gravity_SOP_Foundry','Gravity_Shift_Lab','Gravity_Inventory_Center','Gravity_Work_Study_Lab'];
const checks=[];
for(const p of paths)for(const [site,base] of [['TMB',old],['Gravity',fresh]])checks.push({site,url:base+p,method:'GET',name:p});
for(const n of manualNames)for(const ext of ['pdf','docx','html'])checks.push({site:'Gravity',url:fresh+'/assets/downloads/windows/manuals/current/'+n+'_Windows_User_Manual.'+ext,method:'HEAD',name:n+'.'+ext});
const results=[];
(async()=>{
  for(const batch of Array.from({length:Math.ceil(checks.length/5)},(_,i)=>checks.slice(i*5,i*5+5))){
    const rs=await Promise.all(batch.map(async q=>{
      try {
        const res=await fetch(q.url,{method:q.method,redirect:'follow',headers:{'User-Agent':'GravityReadOnlyHealthCheck/1.0'},signal:AbortSignal.timeout(13000)});
        const contentType=res.headers.get('content-type')||'';
        let publicStatus=null;
        if(q.method==='GET'&&/json/.test(contentType)){
          const data=await res.json();
          publicStatus={ok:typeof data.ok==='boolean'?data.ok:null,service:data.service||data.function||null,configured:typeof data.configured==='boolean'?data.configured:null,articles:Array.isArray(data)?data.length:(Array.isArray(data.articles)?data.articles.length:null)};
        }
        return {site:q.site,name:q.name,status:res.status,ok:res.ok,contentType,publicStatus};
      }catch(e){return {site:q.site,name:q.name,ok:false,error:String(e).slice(0,160)}}
    }));
    results.push(...rs);
  }
  const failures=results.filter(q=>!q.ok),comparisons=[];
  for(const name of paths){
    const a=results.find(x=>x.name===name&&x.site==='TMB'),b=results.find(x=>x.name===name&&x.site==='Gravity');
    comparisons.push({endpoint:name,tmbStatus:a?.status,gravityStatus:b?.status,tmbConfigured:a?.publicStatus?.configured,gravityConfigured:b?.publicStatus?.configured});
  }
  const report={checkedAt:new Date().toISOString(),mode:'GET and HEAD only; no customer data, no POST, no deployments',checks:results,comparisons,failures};
  fs.writeFileSync('gravity-public-services-health.json',JSON.stringify(report,null,2));
  console.log('GRAVITY_PUBLIC_HEALTH_SUMMARY '+JSON.stringify({checks:results.length,failures,comparisons,manuals:results.filter(x=>x.site==='Gravity'&&/User_Manual|\.pdf|\.docx|\.html/.test(x.name))}));
  if(failures.length)process.exitCode=2;
})().catch(e=>{console.error(e);process.exitCode=1});
