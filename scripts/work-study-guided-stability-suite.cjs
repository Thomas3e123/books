'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function read(p){return fs.readFileSync(path.join(root,p),'utf8')}
const guard=read('site/assets/js/gravity-work-study-mutation-guard-v62.js');
const handoff=read('site/assets/js/gravity-work-study-guided-entry-v63.js');
const page=read('site/gravity-work-study-lab.html');
const sync=read('windows/gravity-work-study-lab/sync-expert-stack.cjs');
const desktop=read('windows/gravity-work-study-lab/desktop-bridge.js');
const main=read('windows/gravity-work-study-lab/main.js');
function must(cond,msg){if(!cond)throw new Error(msg)}
must(guard.includes('this.native.disconnect()'),'Mutation guard must disconnect during observer callback.');
must(guard.includes('this.reconnect()'),'Mutation guard must reconnect after callback.');
must(handoff.includes('Click <b>Start a Guided Study</b> once'),'Guided entry must tell the user to click once.');
must(handoff.includes('Wait for Gravity to be right with you'),'Guided entry must tell the user to wait for Gravity.');
must(handoff.includes('Do not click anything else yet.'),'Guided joining overlay must block repeated actions.');
const iGuard=page.indexOf('gravity-work-study-mutation-guard-v62.js'),iBase=page.indexOf('gravity-work-study-v2.js'),iHandoff=page.indexOf('gravity-work-study-guided-entry-v63.js');
must(iGuard>=0&&iBase>=0&&iHandoff>=0,'Generated page must contain guard, base, and handoff scripts.');
must(iGuard<iBase&&iBase<iHandoff,'Mutation guard must load before base/expert observers and Guided handoff immediately after base.');
must(sync.includes("'gravity-work-study-mutation-guard-v62.js','gravity-work-study-v2.js','gravity-work-study-guided-entry-v63.js'"),'Windows sync order must put the guard first.');
must(desktop.includes('saveEvidencePackage'),'Windows bridge must save complete evidence packages.');
must(desktop.includes('loadLatestEvidencePackage'),'Windows bridge must restore latest local evidence package.');
must(main.includes("ipcMain.handle('evidence:save'"),'Windows main process must persist evidence packages.');
must(main.includes("ipcMain.handle('evidence:latest'"),'Windows main process must restore latest evidence package.');
console.log('Work Study Guided stability suite PASS');
