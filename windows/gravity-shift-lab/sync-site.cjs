'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),out=path.join(__dirname,'app');
const website=path.join(root,'site');
function cp(src,dst){fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(src,dst)}
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const src=fs.readFileSync(path.join(website,'gravity-shift-lab.html'),'utf8');
// Netlify absolute /assets/ paths do not resolve from an Electron file:// page.
// Rebase only packaged asset URLs; external/public links remain unchanged.
const rebased=src.replace(/(\\b(?:src|href)=["'])\\/assets\\//g,'$1assets/');
fs.writeFileSync(path.join(out,'gravity-shift-lab.html'),rebased,'utf8');
for(const sub of ['assets/js','assets/css','assets/images']){const from=path.join(website,sub);if(fs.existsSync(from))fs.cpSync(from,path.join(out,sub),{recursive:true})}
const html=fs.readFileSync(path.join(out,'gravity-shift-lab.html'),'utf8');
if(!html.includes('gravity-shift-first-schedule-tour-v1.js'))throw Error('First-schedule walkthrough missing from packaged Shift Lab page');
for(const p of ['gravity-shift-lab.js','gravity-shift-first-schedule-tour-v1.js'])if(!fs.existsSync(path.join(out,'assets/js',p)))throw Error('Missing packaged '+p);
const digest=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(website,p))).digest('hex');
const manifest={websiteSourceSha256:digest('gravity-shift-lab.html'),sharedSchedulingSha256:digest('assets/js/gravity-shift-lab.js'),firstScheduleWalkthroughSha256:digest('assets/js/gravity-shift-first-schedule-tour-v1.js'),builtFrom:'local repository source',status:'Windows candidate - real installation, QR, print, save/reopen testing required'};
fs.writeFileSync(path.join(out,'PARITY_MANIFEST.json'),JSON.stringify(manifest,null,2));
console.log('Packaged Shift Lab and its current website scripts into Windows candidate.');
