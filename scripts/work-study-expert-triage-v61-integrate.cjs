'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),p=path.join(root,'scripts','upgrade-work-study-lab-v2.cjs');let s=fs.readFileSync(p,'utf8');
const anchor="['gravity-work-study-evidence-package-v56.js','20261016-evidence-package-v1']";
if(!s.includes(anchor))throw Error('Installer evidence-package anchor not found.');
if(!s.includes('gravity-work-study-expert-triage-v61.js'))s=s.replace(anchor,"['gravity-work-study-expert-triage-v61.js','20261016-expert-triage-v1'],"+anchor);
s=s.replace('sustainable-pace validation that separates fastest cycles from defensible labor expectations, a complete local-first','sustainable-pace validation that separates fastest cycles from defensible labor expectations, blocker-first expert triage that identifies the single highest-value unresolved issue without hiding or waiving evidence checks, a complete local-first');
s=s.replace('human-factor and operating-sustainability expert stack v60.','human-factor, operating-sustainability, and expert-triage stack v61.');
fs.writeFileSync(p,s);console.log('Integrated Work Study expert triage v61 into the installer.');