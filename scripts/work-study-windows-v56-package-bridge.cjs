'use strict';
const fs=require('node:fs');
const path=require('node:path');
const file=path.resolve(__dirname,'..','windows','gravity-work-study-lab','renderer.js');
let src=fs.readFileSync(file,'utf8');
const oldImport="document.getElementById('import').onclick=async()=>{const s=await gravityDesktop.importStudy();if(s){current={...blankStudy(),...s,id:uid(),updatedAt:now()};await save();renderSetup();}};";
const newImport="document.getElementById('import').onclick=async()=>{const imported=await gravityDesktop.importStudy();if(imported){const isPackage=imported?.packageType==='gravity-work-study-evidence-package'&&imported?.packageVersion===1&&imported?.study?.id;const s=isPackage?imported.study:imported;current={...blankStudy(),...s,id:isPackage?s.id:uid(),updatedAt:now()};if(isPackage){current._gravityEvidencePackage={packageVersion:1,historyRecord:imported.historyRecord||null,sidecars:imported.sidecars||{},sidecarCount:Object.keys(imported.sidecars||{}).length,sourceStudyId:imported.studyId||s.id};}await save();renderSetup();}};";
if(src.includes(oldImport))src=src.replace(oldImport,newImport);
if(!src.includes("packageType==='gravity-work-study-evidence-package'"))throw new Error('Windows v56 package import bridge was not installed.');
const anchor='async function save(){if(!current)return;current=await gravityDesktop.saveStudy(current);say(\'Study saved locally.\');}';
const helper="function portableExport(study){const meta=study?._gravityEvidencePackage;if(!meta)return study;const base=JSON.parse(JSON.stringify(study));delete base._gravityEvidencePackage;const sidecars=meta.sidecars||{};return{packageType:'gravity-work-study-evidence-package',packageVersion:1,studyId:base.id,exportedAt:now(),source:'Gravity Work Study Lab Windows',study:base,historyRecord:meta.historyRecord||base,sidecars,sidecarCount:Object.keys(sidecars).length,integrityNote:'Windows preserved the imported website expert evidence sidecars unchanged. The Windows edition does not claim full website expert parity.'};}\n"+anchor;
if(!src.includes('function portableExport(study)')){
 if(!src.includes(anchor))throw new Error('Windows save anchor not found.');
 src=src.replace(anchor,helper);
}
src=src.replace("document.getElementById('export').onclick=()=>gravityDesktop.exportStudy(current);","document.getElementById('export').onclick=()=>gravityDesktop.exportStudy(portableExport(current));");
if(!src.includes('gravityDesktop.exportStudy(portableExport(current))'))throw new Error('Windows v56 package export bridge was not installed.');
fs.writeFileSync(file,src);
console.log('Windows Work Study v56 package bridge installed: complete website evidence packages can enter Windows and return without dropping expert sidecars.');