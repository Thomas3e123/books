'use strict';
const {chromium}=require('playwright');

const URL=process.env.WORK_STUDY_SMOKE_URL||'http://127.0.0.1:4173/gravity-work-study-lab.html';
const EXACT='Click Guided once, then wait for Gravity to join you before clicking anything else.';

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const pageErrors=[];
 page.on('pageerror',err=>pageErrors.push(String(err?.stack||err?.message||err)));
 try{
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('[data-start="guided"]',{state:'visible',timeout:30000});
  await page.waitForSelector('[data-ws63-note]',{state:'attached',timeout:15000});
  const note=await page.locator('[data-ws63-note]').innerText();
  if(!note.includes(EXACT))throw new Error('Exact Guided click-once instruction is missing from the website.');
  const guard=await page.evaluate(()=>document.documentElement.dataset.gravityGuidedMutationGuard||'');
  if(guard!=='v62-global-cohort')throw new Error(`Expected global mutation guard before Guided; found ${guard||'none'}.`);

  const result=await Promise.race([
   page.evaluate(async()=>{
    const button=document.querySelector('[data-start="guided"]');
    if(!button)throw new Error('Guided button disappeared before click.');
    let ticks=0;
    const heartbeat=setInterval(()=>ticks++,25);
    button.click();
    await new Promise(resolve=>setTimeout(resolve,2500));
    clearInterval(heartbeat);
    let state=null;
    try{state=JSON.parse(localStorage.getItem('gravityWorkStudyV2')||'null')}catch{}
    return{ticks,mode:state?.mode||'',screen:state?.screen||'',guard:document.documentElement.dataset.gravityGuidedMutationGuard||''};
   }),
   new Promise((_,reject)=>setTimeout(()=>reject(new Error('Website renderer stalled after Guided click.')),15000))
  ]);
  if(result.ticks<40)throw new Error(`Website heartbeat stalled after Guided click (${result.ticks} ticks).`);
  if(result.mode!=='guided')throw new Error(`Website did not enter Guided mode (mode=${result.mode||'empty'}).`);
  if(pageErrors.length)throw new Error('Website page errors during Guided smoke:\n'+pageErrors.join('\n---\n'));
  console.log('WORK_STUDY_SITE_GUIDED_SMOKE_PASS',JSON.stringify(result));
 }finally{
  await browser.close();
 }
})().catch(err=>{console.error('WORK_STUDY_SITE_GUIDED_SMOKE_FAIL',err);process.exit(1)});
