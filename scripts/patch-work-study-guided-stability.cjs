'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const file=path.join(root,'site','gravity-work-study-lab.html');
const baseFile=path.join(root,'site','assets','js','gravity-work-study-v2.js');

let baseJs=fs.readFileSync(baseFile,'utf8');
const repairs=[
 ["$('#element-list .ws2-row').forEach(","$$('#element-list .ws2-row').forEach("],
 ["$('[data-next]').forEach(","$$('[data-next]').forEach("],
 ["$('[data-action]').forEach(","$$('[data-action]').forEach("]
];
for(const [broken,fixed] of repairs){
 if(baseJs.includes(broken))baseJs=baseJs.replaceAll(broken,fixed);
 if(baseJs.includes(broken))throw new Error('Work Study base binding repair did not fully apply: '+broken);
 if(!baseJs.includes(fixed))throw new Error('Expected repaired Work Study base binding was not found: '+fixed);
}
fs.writeFileSync(baseFile,baseJs,'utf8');
// Keep the repaired base engine staged so the later verified commit includes the code whose hash is written to the manifest.
cp.execFileSync('git',['add','site/assets/js/gravity-work-study-v2.js'],{cwd:root,stdio:'inherit'});

let html=fs.readFileSync(file,'utf8');
const guard='<script src="/assets/js/gravity-work-study-mutation-guard-v62.js?v=20261017-guided-stability-v1"></script>';
const handoff='<script src="/assets/js/gravity-work-study-guided-entry-v63.js?v=20261017-guided-entry-v1"></script>';
html=html.replace(/<script src="\/assets\/js\/gravity-work-study-mutation-guard-v62\.js\?v=[^"]+"><\/script>/g,'');
html=html.replace(/<script src="\/assets\/js\/gravity-work-study-guided-entry-v63\.js\?v=[^"]+"><\/script>/g,'');
const base=/<script src="\/assets\/js\/gravity-work-study-v2\.js\?v=[^"]+"><\/script>/;
if(!base.test(html))throw new Error('Base Work Study v2 script tag not found.');
html=html.replace(base,m=>guard+m+handoff);
fs.writeFileSync(file,html,'utf8');
console.log('Repaired all Work Study base selector bindings and installed Guided stability layers in safe load order.');
