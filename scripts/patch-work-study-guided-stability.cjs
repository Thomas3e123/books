'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const file=path.join(root,'site','gravity-work-study-lab.html');
const baseFile=path.join(root,'site','assets','js','gravity-work-study-v2.js');

let baseJs=fs.readFileSync(baseFile,'utf8');
const brokenNext="$('[data-next]').forEach(";
const fixedNext="$$('[data-next]').forEach(";
const brokenAction="$('[data-action]').forEach(";
const fixedAction="$$('[data-action]').forEach(";
if(baseJs.includes(brokenNext))baseJs=baseJs.replace(brokenNext,fixedNext);
if(baseJs.includes(brokenAction))baseJs=baseJs.replace(brokenAction,fixedAction);
if(baseJs.includes(brokenNext)||baseJs.includes(brokenAction))throw new Error('Work Study base binding repair did not fully apply.');
if(!baseJs.includes(fixedNext)||!baseJs.includes(fixedAction))throw new Error('Expected repaired Work Study base bindings were not found.');
fs.writeFileSync(baseFile,baseJs,'utf8');

let html=fs.readFileSync(file,'utf8');
const guard='<script src="/assets/js/gravity-work-study-mutation-guard-v62.js?v=20261017-guided-stability-v1"></script>';
const handoff='<script src="/assets/js/gravity-work-study-guided-entry-v63.js?v=20261017-guided-entry-v1"></script>';
html=html.replace(/<script src="\/assets\/js\/gravity-work-study-mutation-guard-v62\.js\?v=[^"]+"><\/script>/g,'');
html=html.replace(/<script src="\/assets\/js\/gravity-work-study-guided-entry-v63\.js\?v=[^"]+"><\/script>/g,'');
const base=/<script src="\/assets\/js\/gravity-work-study-v2\.js\?v=[^"]+"><\/script>/;
if(!base.test(html))throw new Error('Base Work Study v2 script tag not found.');
html=html.replace(base,m=>guard+m+handoff);
fs.writeFileSync(file,html,'utf8');
console.log('Repaired Work Study base click bindings and installed Guided stability layers in safe load order.');
