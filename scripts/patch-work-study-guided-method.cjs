'use strict';
const fs=require('node:fs');
const path=require('node:path');
const file=path.join(__dirname,'..','site','assets','js','gravity-work-study-v2.js');
let js=fs.readFileSync(file,'utf8');
const from="function screenMethod(){if(!s.method)s.method=recommendMethod();return shell(`";
const to="function screenMethod(){if(s.mode==='guided')s.method=recommendMethod();else if(!s.method)s.method=recommendMethod();return shell(`";
if(js.includes(to)){
  console.log('Guided method selection is already aligned.');
}else if(js.includes(from)){
  js=js.replace(from,to);
  fs.writeFileSync(file,js);
  console.log('Aligned Guided method selection with Gravity recommendation.');
}else{
  throw new Error('Could not locate Work Study method-selection source.');
}
