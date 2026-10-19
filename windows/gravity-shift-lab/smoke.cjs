'use strict';
// Runs inside Electron's Windows runner against the packaged file:// Shift Lab.
// Uses a temporary userData directory, never real employee data.
const assert=require('node:assert/strict');
async function run(win) {
  const initial=await win.webContents.executeJavaScript(`(async()=>{
    const get=id=>document.getElementById(id);
    const fail=s=>{throw new Error(s)};
    const set=(el,value,type='input')=>{if(!el)fail('Missing input');el.value=value;el.dispatchEvent(new Event(type,{bubbles:true}));};
    const sleep=ms=>new Promise(done=>setTimeout(done,ms));
    for(let i=0;i<60&&!document.querySelector('#lab-body tr[data-employee-id]');i++)await sleep(150);
    if(!get('shift-lab')||!document.querySelector('#lab-body tr[data-employee-id]'))fail('Shift Lab did not initialize');
    if(!get('gravity-shift-first-tour'))fail('First-schedule walkthrough not mounted');
    const box=get('gravity-shift-first-tour');
    box.querySelector('#gsft-start').click();
    if(box.querySelector('.gsft-panel').hidden||!box.querySelector('.gsft-heading').textContent)fail('Walkthrough failed to open');
    box.querySelector('.gsft-close').click();
    if(!box.querySelector('.gsft-panel').hidden)fail('Walkthrough failed to close');
    set(get('lab-week'),'2026-10-18','change');
    set(get('lab-sales'),'10000');
    const row=document.querySelector('#lab-body tr[data-employee-id]');
    set(row.querySelector('.employee-name'),'Windows Smoke Tester');
    set(row.querySelector('.employee-role'),'Cook');
    set(row.querySelector('.employee-wage'),'20');
    const shifts=row.querySelectorAll('.shift-input');
    if(shifts.length!==7)fail('Expected seven schedule day columns');
    set(shifts[0],'10a-6p');
    if(Math.abs(parseFloat(get('g-hours').textContent)-8)>0.01)fail('8-hour scheduling calculation failed: '+get('g-hours').textContent);
    if(Math.abs(parseFloat(get('g-percent').textContent)-1.6)>0.1)fail('Labor percent incorrect: '+get('g-percent').textContent);
    for(let i=1;i<6;i++)set(shifts[i],'10a-6p');
    if(Math.abs(parseFloat(get('g-hours').textContent)-48)>0.01)fail('48-hour scheduling calculation failed: '+get('g-hours').textContent);
    if(Number(get('g-ot').textContent)<1)fail('Overtime warning did not trigger at 48h: '+get('g-ot').textContent);
    get('lab-save').click();
    if(!/saved|schedule/i.test(get('lab-status').textContent))fail('Save action did not report success: '+get('lab-status').textContent);
    if(!window.GravityQR)fail('QR generator absent');
    get('lab-publish').click();
    if(!get('publish-dialog').open)fail('Employee QR publish dialog did not open');
    get('publish-generate').click();
    for(let i=0;i<35&&!get('publish-link').textContent.includes('thomasmonroebooks.com');i++)await sleep(250);
    if(!get('publish-link').textContent.includes('thomasmonroebooks.com'))fail('Employee QR link was not generated: '+get('publish-status').textContent);
    const url=get('publish-link').textContent;
    if(url.includes('Windows Smoke Tester')&&url.includes('20'))fail('Employee link appears to expose payroll information');
    return {hours:get('g-hours').textContent,ot:get('g-ot').textContent,percent:get('g-percent').textContent,qr:true,tour:true};
  })()`,true);
  console.log('[SHIFT-LAB SMOKE] first run:',JSON.stringify(initial));
  assert.equal(initial.qr,true);
  const reload=await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(new Error('Page reload timed out')),20000);
    win.webContents.once('did-finish-load',()=>{
      clearTimeout(timeout);
      win.webContents.executeJavaScript(`(async()=>{
        const sleep=ms=>new Promise(done=>setTimeout(done,ms));
        for(let i=0;i<50&&!document.querySelector('#lab-body tr[data-employee-id]');i++)await sleep(150);
        const row=[...document.querySelectorAll('#lab-body tr[data-employee-id]')].find(x=>x.querySelector('.employee-name')?.value==='Windows Smoke Tester');
        if(!row)throw Error('Saved employee missing after reload');
        const hours=document.getElementById('g-hours')?.textContent||'';
        if(Math.abs(parseFloat(hours)-48)>0.01)throw Error('Saved 48 hours missing after reload: '+hours);
        return {savedName:true,hours};
      })()`,true).then(resolve,reject);
    });
    win.webContents.reload();
  });
  console.log('[SHIFT-LAB SMOKE] saved data after reload:',JSON.stringify(reload));
  return {initial,reload};
}
module.exports={run};
