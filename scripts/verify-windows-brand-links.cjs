'use strict';
// Fail closed if a generated Windows program still refers to the old publisher
// domain. Legal publishing credits without a web address remain permitted.
const fs=require('node:fs'),path=require('node:path');
const TEXT=/\.(?:html?|c?m?js|jsx|json|css|svg|xml|txt|md)$/i;
const SKIP=new Set(['node_modules','dist','.git','coverage','.next','test-results']);
const OLD=/\b(?:www\.)?thomasmonroebooks\.com\b/i;
const PRODUCTS={
 inventory:{folder:'app',required:['index.html']},
 shift:{folder:'app',required:['gravity-shift-lab.html']},
 foundry:{folder:'app',required:['site/apps/sop-foundry/workroom.html']},
 'work-study':{folder:'.',required:['index.html','main.js','device-link-main.js','expert/windows-expert-manifest.json']}
};
function scan(folder){
 if(!fs.existsSync(folder))throw Error('Missing generated Windows package: '+folder);
 const found=[];let checked=0;
 function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
   if(SKIP.has(entry.name))continue;
   const file=path.join(dir,entry.name);
   if(entry.isDirectory()){walk(file);continue}
   if(!entry.isFile()||!TEXT.test(entry.name))continue;
   checked++;
   const lines=fs.readFileSync(file,'utf8').split(/\r?\n/);
   lines.forEach((line,i)=>{
    // Ignore regex-based compatibility normalization, not customer-facing URLs.
    const normalized=line.replace(/thomasmonroebooks\\\\\.com/g,'');
    if(OLD.test(normalized))found.push(path.relative(folder,file)+':'+(i+1));
   });
  }
 }
 walk(folder);
 return {checked,found};
}
function verifyProduct(product,root=process.cwd()){
 const config=PRODUCTS[product];if(!config)throw Error('Unknown Windows product '+product);
 const folder=path.join(root,config.folder);
 for(const name of config.required)
  if(!fs.existsSync(path.join(folder,name)))throw Error('Missing packaged '+name);
 const result=scan(folder);
 if(result.checked<1)throw Error('No Windows package text assets scanned');
 if(result.found.length)throw Error('BLOCK WINDOWS RELEASE: old TMB destination in '+result.found.join(', '));
 return {product,checked:result.checked};
}
if(require.main===module){
 try{console.log('Windows package brand gate OK',JSON.stringify(verifyProduct(process.argv[2])))}
 catch(e){console.error(e.message);process.exitCode=1;}
}
module.exports={scan,verifyProduct};
