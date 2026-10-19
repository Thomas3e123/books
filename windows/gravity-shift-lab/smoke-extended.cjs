'use strict';
// End-to-end Windows verification using test-only data in the isolated Electron profile.
const assert=require('node:assert/strict');
async function run(win) {
  const result=await win.webContents.executeJavaScript(`(async()=>{
    const get=id=>document.getElementById(id);
    const fail=s=>{throw new Error(s)};
    const wait=ms=>new Promise(done=>setTimeout(done,ms));
    const set=(el,val,event='input')=>{if(!el)fail('Missing field');el.value=val;el.dispatchEvent(new Event(event,{bubbles:true}));};
    // Manager pay lock must persist after a full application reload.
    if(document.querySelector('#lab-body .employee-wage'))fail('Manager wage inputs unlocked themselves after reload');
    if(!get('lab-backup').disabled||!get('lab-restore').disabled||!get('lab-print-manager').disabled)fail('Sensitive actions not protected after reload');
    if(Math.abs(parseFloat(get('g-percent').textContent)-15.4)>0.05)fail('Protected management labor basis lost after reload');
    get('lab-pay-lock').click();
    if(!get('pay-lock-dialog').open)fail('Manager unlock prompt missing after restart');
    set(get('pay-lock-secret'),'incorrect-pin');
    get('pay-lock-submit').click();
    for(let i=0;i<35&&!get('pay-lock-dialog-status').textContent;i++)await wait(80);
    if(!get('pay-lock-dialog').open||!/not match/i.test(get('pay-lock-dialog-status').textContent))fail('Incorrect PIN was not rejected');
    set(get('pay-lock-secret'),'test-4826');
    get('pay-lock-submit').click();
    for(let i=0;i<35&&get('pay-lock-dialog').open;i++)await wait(80);
    if(get('pay-lock-dialog').open||!document.querySelector('#lab-body .employee-wage'))fail('Correct PIN did not unlock wages');
    // Intercept the normal backup download only within this test runner.
    const nativeCreateURL=URL.createObjectURL;
    const nativeClick=HTMLAnchorElement.prototype.click;
    let backupBlob=null;
    URL.createObjectURL=function(blob){backupBlob=blob;return nativeCreateURL.call(URL,blob);};
    HTMLAnchorElement.prototype.click=function(){if(this.download==='gravity-shift-lab-backup.json')return;return nativeClick.call(this);};
    try{get('lab-backup').click();}finally{
      URL.createObjectURL=nativeCreateURL;HTMLAnchorElement.prototype.click=nativeClick;
    }
    if(!backupBlob)fail('Workspace Backup did not generate a file');
    const backupText=await backupBlob.text(),backup=JSON.parse(backupText);
    if(backup.version!==5||!backup.profile?.employees||!backup.schedules)fail('Backup missing expected contents');
    if(backupText.includes('test-4826'))fail('Manager PIN exposed in backup');
    const saved=backup.profile.employees.find(e=>e.name==='Windows Smoke Tester');
    if(!saved||Number(saved.wage)!==20)fail('Backup omitted the employee or salary data');
    const weeks=Object.values(backup.schedules);
    if(!weeks.length||!weeks.some(w=>Object.values(w.shifts||{}).some(sh=>sh.filter(x=>x==='10a-6p').length===6)))fail('Weekly schedule absent from backup');
    // Destructively edit only the temporary test profile, then restore the saved backup.
    const row=[...document.querySelectorAll('#lab-body tr[data-employee-id]')].find(x=>x.querySelector('.employee-name')?.value==='Windows Smoke Tester');
    set(row.querySelector('.employee-name'),'Temporarily Modified Employee');
    get('lab-save').click();
    const file=new File([backupText],'gravity-shift-lab-backup.json',{type:'application/json'});
    const input=get('lab-restore-file');
    const items=new DataTransfer();items.items.add(file);
    input.files=items.files;input.dispatchEvent(new Event('change',{bubbles:true}));
    for(let i=0;i<40&&!get('lab-status').textContent.includes('Backup restored');i++)await wait(100);
    if(!get('lab-status').textContent.includes('Backup restored'))fail('Backup restore did not complete: '+get('lab-status').textContent);
    const restored=[...document.querySelectorAll('#lab-body tr[data-employee-id]')].find(x=>x.querySelector('.employee-name')?.value==='Windows Smoke Tester');
    if(!restored||Number(restored.querySelector('.employee-wage')?.value)!==20)fail('Employee/wage missing after backup restore');
    if(Math.abs(parseFloat(get('g-hours').textContent)-56)>0.01)fail('Schedule hours incorrect after backup restore');
    // Exercise print buttons, printed employee snapshot and QR canvas without opening OS print dialogs.
    const captures=[];
    const originalPrint=window.print;
    window.print=function(){
      const qr=get('employee-print-qr-canvas');
      captures.push({mode:document.body.classList.contains('print-manager')?'manager':'employee',
        snapshot:get('employee-print-snapshot').innerHTML,
        qrDataLength:qr?qr.toDataURL('image/png').length:0,
        total: get('lab-print-summary').textContent});
    };
    try{
      get('lab-print').click();
      for(let i=0;i<50&&!captures.length;i++)await wait(100);
      if(captures.length!==1||captures[0].mode!=='employee')fail('Employee print action did not run');
      const snap=captures[0].snapshot;
      if(!snap.includes('Windows Smoke Tester')||!snap.includes('Published employee schedule'))fail('Employee print missing actual schedule');
      if(captures[0].qrDataLength<3000)fail('Employee print QR canvas blank or missing');
      if(/\\$\\s*1[,.]?0?4?0|\\$\\s*25(\\.00)?|\\$\\s*20(\\.00)?/.test(snap))fail('Wage values leaked into employee-facing printed schedule');
      get('lab-print-manager').click();
      for(let i=0;i<25&&captures.length<2;i++)await wait(100);
      if(captures.length!==2||captures[1].mode!=='manager')fail('Manager print action did not run');
      if(!captures[1].total.includes('$'))fail('Manager print lacks labor cost');
    }finally{window.print=originalPrint;}
    // Independently parse the compressed employee QR payload and check payroll privacy.
    get('lab-publish').click();get('publish-generate').click();
    for(let i=0;i<35&&!get('publish-link').textContent.startsWith('https:');i++)await wait(100);
    const published=get('publish-link').textContent;
    if(!published.includes('#s='))fail('Published QR link missing encoded snapshot');
    const payload=published.split('#s=')[1]; const parts=payload.split('.',2);
    let b64=(parts.length===2?parts[1]:parts[0]).replace(/-/g,'+').replace(/_/g,'/');
    while(b64.length%4)b64+='=';
    const raw=atob(b64),bytes=Uint8Array.from(raw,x=>x.charCodeAt(0));
    let unpacked=bytes;
    if(parts[0]==='d'){
      const ds=new DecompressionStream('deflate-raw');
      const writer=ds.writable.getWriter();await writer.write(bytes);await writer.close();
      unpacked=new Uint8Array(await new Response(ds.readable).arrayBuffer());
    }
    const plain=new TextDecoder().decode(unpacked);
    const employeeData=JSON.parse(plain);
    if(!Array.isArray(employeeData.w)||!employeeData.w.length)fail('QR payload missing scheduled week');
    if(/wage|salary|payLockHash|managerSalaryAllocation|phone|\\btest-4826\\b/i.test(plain))fail('Private manager information found in decoded QR payload');
    get('publish-close').click();
    return {payLockAfterReload:true,wrongPinRejected:true,backupDownloaded:true,restoreVerified:true,
      employeePrint:true,managerPrint:true,printedQR:true,decodedEmployeeQRPrivate:true};
  })()`,true);
  for(const key of Object.keys(result))assert.equal(result[key],true,key);
  console.log('[SHIFT-LAB EXTENDED SMOKE]',JSON.stringify(result));
  return result;
}
module.exports={run};
