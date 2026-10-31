'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const site=path.join(root,'site/apps/inventory-center');
const out=path.join(__dirname,'app');
if(!fs.existsSync(path.join(site,'index.html')))throw Error('Missing website Inventory Center source');
fs.rmSync(out,{recursive:true,force:true});
fs.cpSync(site,out,{recursive:true});
let html=fs.readFileSync(path.join(out,'index.html'),'utf8');
// Package the same application logic; adapt only web-specific links/labels for desktop.
html=html.replace('href="/assets/images/gravity-system-mark.svg"','href="assets/images/gravity-system-mark.svg"')
.replace('<strong>Web workspace</strong>','<strong>Windows workspace</strong>')
.replace('Your working inventory stays in this browser unless you export or restore a backup.','Your inventory is stored on this Windows computer. Use Create Backup regularly and keep a copy somewhere safe.')
.replace('href="/gravity-inventory-center"','href="https://gravityleadershipsystem.com/gravity-inventory-center"');
// Same-browser recovery snapshots are a web-only enhancement. The Windows
// candidate keeps its own persistent app data and explicit JSON backups.
html=html.replace(/<script src="\/assets\/js\/gravity-local-recovery-v1\.js[^"]*" defer><\/script>/g,'');
html=html.replace(/<script src="\/assets\/js\/gravity-cloud-vault-v1\.js[^"]*" defer><\/script>/g,'');
html=html.replace(/(href=["'])\/(?!\/)/g,'$1https://gravityleadershipsystem.com/');
fs.writeFileSync(path.join(out,'index.html'),html);
for(const p of ['assets/js/inventory-validation.js','assets/js/inventory-center.js','assets/css/inventory.css','web.css']){
 if(!fs.existsSync(path.join(out,p)))throw Error('Missing inventory website dependency: '+p);
}
const digest=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(site,p))).digest('hex');
fs.writeFileSync(path.join(out,'PARITY_MANIFEST.json'),JSON.stringify({
source:'site/apps/inventory-center',htmlSha256:digest('index.html'),
businessLogicSha256:digest('assets/js/inventory-center.js'),
validationSha256:digest('assets/js/inventory-validation.js'),
status:'Windows candidate - not a public release; physical printer/QR/device verification pending'
},null,2)+'\n');
console.log('Inventory Center Windows candidate synced from current website source.');
