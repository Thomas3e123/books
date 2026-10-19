'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const source=path.join(root,'site/apps/sop-foundry');
const output=path.join(__dirname,'app/site');
if(!fs.existsSync(path.join(source,'workroom.html')))throw Error('SOP Foundry website source missing');
fs.rmSync(output,{force:true,recursive:true});
const dest=path.join(output,'apps/sop-foundry');
fs.mkdirSync(path.dirname(dest),{recursive:true});
fs.cpSync(source,dest,{recursive:true});
// A homepage link is a website link, not a local Windows-app route.
for(const name of fs.readdirSync(dest).filter(x=>x.endsWith('.html'))){
 const file=path.join(dest,name),html=fs.readFileSync(file,'utf8');
 fs.writeFileSync(file,html.replace(/href=(["'])\/\1/g,(_match,q)=>'href='+q+'https://thomasmonroebooks.com/'+q),'utf8');
}
const image=path.join(root,'site/assets/images/gravity-system-mark.svg');
const target=path.join(output,'assets/images/gravity-system-mark.svg');
fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(image,target);
function patch(rel,find,replacement){
  const file=path.join(dest,rel);let text=fs.readFileSync(file,'utf8');
  if(!text.includes(find))throw Error('Expected Windows adaptation anchor missing: '+rel+' '+find.slice(0,90));
  fs.writeFileSync(file,text.replace(find,replacement),'utf8');
}
patch('employee-connection.js',"location.origin+'/e/'","'https://thomasmonroebooks.com/e/'");
patch('web-api-shim.js',"employeeBase:location.origin+APP.replace(/\\/$/,'')","employeeBase:''");
patch('web-api-shim.js',"dataLocation:'Browser-local storage for this website'","dataLocation:'Private storage on this Windows computer'");
patch('desktop-settings.html','Gravity SOP Foundry · Web Workspace','Gravity SOP Foundry · Windows Workspace');
patch('desktop-settings.html','This website edition uses the current hosted Foundry address for employee-library QR links. Test each printed QR before posting it.','Phone QR links require a connected Hosted Employee workspace. A local Windows-only library address cannot be opened from a phone.');
patch('access.html',"This browser's manager/employee test rooms","This Windows app's manager/employee rooms");
patch('access.html','Manager working data stays in this browser unless you export a backup.','Manager working data stays on this Windows computer unless you export a backup.');
const entries=[];
function walk(folder){
  for(const item of fs.readdirSync(folder,{withFileTypes:true})){
    const full=path.join(folder,item.name);
    if(item.isDirectory())walk(full);
    else if(item.isFile()){
      const relative=path.relative(root,full).split(path.sep).join('/');
      entries.push({source:relative,sha256:crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex')});
    }
  }
}
walk(source);
entries.sort((a,b)=>a.source.localeCompare(b.source));
const manifest={schema:1,application:'Gravity SOP Foundry Windows Candidate',source:'The same site/apps/sop-foundry assets used by TMB website',sourceCount:entries.length,siteFiles:entries,platformAdaptations:['Real hosted employee links use https://thomasmonroebooks.com/e/','Windows storage is on this computer','Windows local page QR URLs are not shared to mobile devices','Hosted operations require internet'],releaseStatus:'candidate; actual installer tests and phone/printing QA required'};
fs.writeFileSync(path.join(output,'SOURCE_PARITY_MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('Synchronized',entries.length,'SOP Foundry website source files into Windows candidate.');
