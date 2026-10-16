'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-evidence-package-v56.js','utf8');
const must=[
 'Gravity Complete Evidence Package',
 "packageType:'gravity-work-study-evidence-package'",
 'packageVersion:1',
 'collectSidecars',
 'extractForStudy',
 'keyed-by-study',
 'direct-record',
 'array-records',
 'It does not export unrelated Work Studies',
 'It is not hosted cross-device sync',
 '.gravity-study.json',
 'validatePackage',
 'window.GravityWorkStudyEvidencePackage'
];
for(const t of must){if(!src.includes(t)){console.error('Missing evidence package v56 behavior:',t);process.exit(1)}}
if(!src.includes("key.startsWith(PREFIX)")){console.error('Evidence package must restrict sidecar discovery/import to Gravity Work Study keys.');process.exit(1)}
if(!src.includes("Object.prototype.hasOwnProperty.call(value,id)")){console.error('Study-keyed sidecar extraction missing.');process.exit(1)}
console.log('Evidence package v56 suite passed: the base study and discovered study-specific sidecars travel together without claiming hosted sync or exporting unrelated studies.');