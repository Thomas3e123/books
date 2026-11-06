'use strict';
// Isolated localhost Chromium user-journey checks. No production endpoints,
// no real customer records, and no form submissions.
const {test,expect}=require('@playwright/test');
const fs=require('node:fs');

test('Work Study evidence panel does not rebuild itself on unrelated DOM mutations',async({page})=>{
  await page.goto('/gravity-work-study-lab.html',{waitUntil:'domcontentloaded'});
  await page.locator('[data-action="save"]').first().click();
  const panel=page.locator('[data-ws56-box]');
  await expect(panel).toHaveCount(1);
  await expect(panel.getByRole('button',{name:'Export complete study package'})).toBeVisible();
  const stable=await page.evaluate(async()=>{
    const first=document.querySelector('[data-ws56-box]');
    if(!first)throw Error('Panel was not mounted');
    let removals=0;
    const observer=new MutationObserver(list=>{
      for(const change of list)for(const node of change.removedNodes)
        if(node===first)removals++;
    });
    observer.observe(document.body,{childList:true,subtree:true});
    for(let i=0;i<8;i++){
      const e=document.createElement('span');e.textContent='Unrelated DOM update '+i;
      document.body.appendChild(e);e.remove();
    }
    await new Promise(resolve=>setTimeout(resolve,100));
    observer.disconnect();
    return{same:document.querySelector('[data-ws56-box]')===first,removals,panelCount:document.querySelectorAll('[data-ws56-box]').length};
  });
  expect(stable).toEqual({same:true,removals:0,panelCount:1});
});

test('Work Study exported evidence imports through the actual file picker and preserves prior study history',async({page})=>{
  await page.goto('/gravity-work-study-lab.html',{waitUntil:'domcontentloaded'});
  await page.locator('[data-action="save"]').first().click();
  const box=page.locator('[data-ws56-box]');
  await expect(box).toBeVisible();
  const [download]=await Promise.all([
    page.waitForEvent('download'),
    box.getByRole('button',{name:'Export complete study package'}).click()
  ]);
  const exported=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
  expect(exported.packageType).toBe('gravity-work-study-evidence-package');
  expect(exported.study.id).toBeTruthy();
  const incoming=JSON.parse(JSON.stringify(exported));
  incoming.studyId='browser-restore-second-study';
  incoming.study={...incoming.study,id:incoming.studyId,screen:'start',version:2};
  incoming.historyRecord={...incoming.study};
  incoming.sidecars={gravityWorkStudyBrowserEvidence:{mode:'keyed-by-study',value:{proof:'synthetic'}}};
  await page.evaluate(()=>window.__workStudyTestIncoming='browser-restore-second-study');
  page.on('dialog',dialog=>dialog.accept());
  const [chooser]=await Promise.all([
    page.waitForEvent('filechooser'),
    box.getByRole('button',{name:'Import complete study package'}).click()
  ]);
  await chooser.setFiles({name:'synthetic.gravity-study.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(incoming))});
  await expect.poll(async()=>page.evaluate(()=>{
    const s=JSON.parse(localStorage.getItem('gravityWorkStudyV2')||'null');
    return s?.id;
  })).toBe(incoming.studyId);
  const saved=await page.evaluate(()=>({
    history:JSON.parse(localStorage.getItem('gravityWorkStudyV2History')||'[]').map(x=>x.id),
    evidence:JSON.parse(localStorage.getItem('gravityWorkStudyBrowserEvidence')||'{}')
  }));
  expect(saved.history).toContain(exported.study.id);
  expect(saved.history).toContain(incoming.studyId);
  expect(saved.evidence[incoming.studyId].proof).toBe('synthetic');
});

test('Shift Lab downloads verified backup without exposing locked controls',async({page})=>{
  await page.goto('/gravity-shift-lab.html',{waitUntil:'domcontentloaded'});
  const save=page.locator('#lab-backup');
  await expect(save).toBeVisible();
  await expect(save).toBeEnabled();
  const [download]=await Promise.all([page.waitForEvent('download'),save.click()]);
  expect(download.suggestedFilename()).toBe('gravity-shift-lab-backup.json');
  const backup=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
  expect(backup.version).toBe(5);
  expect(backup.profile.employees).toBeInstanceOf(Array);
  expect(backup.schedules).toBeTruthy();
});

test('Shift Lab restore cancellation leaves both previously saved records unchanged',async({page})=>{
  await page.goto('/gravity-shift-lab.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#lab-restore-file')).toHaveCount(1);
  const before=await page.evaluate(()=>{
    const profile=localStorage.getItem('gravityShiftLabProfileV3');
    const schedules=localStorage.getItem('gravityShiftLabSchedulesV3');
    const p=JSON.parse(profile||'{}');
    return{profile,schedules,p};
  });
  const restored={
    version:5,profile:{...before.p,restaurant:'RESTORE-SHOULD-NOT-BE-SAVED',
      employees:Array.isArray(before.p.employees)?before.p.employees:[],sections:['Pizza'],payLockHash:''},
    schedules:{'2026-11-08':{sales:'700',shifts:{},sections:{}}}
  };
  page.on('dialog',dialog=>dialog.dismiss());
  await page.locator('#lab-restore-file').setInputFiles({
    name:'synthetic-cancel.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(restored))
  });
  await expect(page.locator('#lab-status')).toContainText('Restore canceled.');
  const after=await page.evaluate(()=>({
    profile:localStorage.getItem('gravityShiftLabProfileV3'),
    schedules:localStorage.getItem('gravityShiftLabSchedulesV3')
  }));
  expect(after).toEqual({profile:before.profile,schedules:before.schedules});
});

test('Shift Lab browser-storage write failure restores original profile and schedules',async({page})=>{
  await page.goto('/gravity-shift-lab.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#lab-restore-file')).toHaveCount(1);
  const prior=await page.evaluate(()=>{
    const p=localStorage.getItem('gravityShiftLabProfileV3');
    const s=localStorage.getItem('gravityShiftLabSchedulesV3');
    return{profile:p,schedules:s,parsed:JSON.parse(p||'{}')};
  });
  // Fail the SECOND write once to exercise the browser's actual rollback logic.
  await page.evaluate(()=>{
    const original=Storage.prototype.setItem;
    let failed=false;
    Storage.prototype.setItem=function(k,v){
      if(k==='gravityShiftLabSchedulesV3'&&!failed){
        failed=true;throw new DOMException('Simulated write failure','QuotaExceededError');
      }
      return original.call(this,k,v);
    };
  });
  const restored={
    version:5,
    profile:{...prior.parsed,restaurant:'NEVER-COMMIT-THIS',employees:prior.parsed.employees||[],sections:['Pizza'],payLockHash:''},
    schedules:{'2026-11-08':{sales:'500',shifts:{},sections:{}}}
  };
  page.on('dialog',dialog=>dialog.accept());
  await page.locator('#lab-restore-file').setInputFiles({
    name:'synthetic-rollback.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(restored))
  });
  await expect(page.locator('#lab-status')).toContainText('Restore failed.');
  const after=await page.evaluate(()=>({
    profile:localStorage.getItem('gravityShiftLabProfileV3'),
    schedules:localStorage.getItem('gravityShiftLabSchedulesV3')
  }));
  expect(after).toEqual({profile:prior.profile,schedules:prior.schedules});
});
