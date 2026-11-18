'use strict';
/*
 * Windows app identity continuity audit.
 * Keeps legacy reverse-DNS appIds where required to preserve profile and upgrade lookup.
 * No destructive data manipulation and no installer publication.
 */
const fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const BASELINE=JSON.parse(fs.readFileSync(path.join(ROOT,'windows/release-acceptance/october-2026-preview-identity.json'),'utf8'));

function parseVersion(v){
 const m=String(v||'').match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/);
 if(!m)throw Error('Unsupported version format: '+String(v));
 return {parts:m.slice(1,4).map(Number),prerelease:m[4]?m[4].split('.'):[]};
}
function compareVersions(a,b){
 const x=parseVersion(a),y=parseVersion(b);
 for(let i=0;i<3;i++)if(x.parts[i]!==y.parts[i])return Math.sign(x.parts[i]-y.parts[i]);
 if(!x.prerelease.length)return y.prerelease.length?1:0;
 if(!y.prerelease.length)return -1;
 for(let i=0;i<Math.max(x.prerelease.length,y.prerelease.length);i++){
  if(x.prerelease[i]===undefined)return -1;
  if(y.prerelease[i]===undefined)return 1;
  const ai=x.prerelease[i],bi=y.prerelease[i],an=/^\d+$/.test(ai),bn=/^\d+$/.test(bi);
  if(an&&bn){if(Number(ai)!==Number(bi))return Math.sign(Number(ai)-Number(bi));continue}
  if(an!==bn)return an?-1:1;
  if(ai!==bi)return ai<bi?-1:1;
 }
 return 0;
}
function auditOne(baseline,current){
 const sourceBlockers=[],releaseHolds=[];
 if(current?.build?.appId!==baseline.appId)sourceBlockers.push('App ID changed: risks installer and user profile continuity');
 if(current?.build?.productName!==baseline.productName)sourceBlockers.push('Product name changed: risks default Electron userData directory');
 if(current?.build?.nsis?.deleteAppDataOnUninstall===true)sourceBlockers.push('NSIS deleteAppDataOnUninstall=true would risk user data loss');
 if(current?.build?.nsis?.oneClick!==false)sourceBlockers.push('Installer interaction mode changed from reviewed October preview');
 if(!Array.isArray(current?.build?.win?.target)||!current.build.win.target.some(x=>x.target==='nsis')||!current.build.win.target.some(x=>x.target==='zip')){
  sourceBlockers.push('Expected both NSIS installer and portable ZIP targets');
 }
 try{
  const cmp=compareVersions(current?.version,baseline.version);
  if(cmp<=0)releaseHolds.push('New corrected installer must use version greater than published preview '+baseline.version);
 }catch(e){releaseHolds.push(e.message)}
 return {name:baseline.name,oldVersion:baseline.version,currentVersion:current?.version,
  appId:current?.build?.appId,productName:current?.build?.productName,sourceBlockers,releaseHolds};
}
function auditAll(root=ROOT,baseline=BASELINE){
 const products=baseline.projects.map(b=>{
  const filename=path.join(root,b.path);
  const current=JSON.parse(fs.readFileSync(filename,'utf8'));
  return auditOne(b,current);
 });
 return {scope:baseline.scope,sourceIdentityPassed:products.every(p=>!p.sourceBlockers.length),
   newerVersionReady:products.every(p=>!p.releaseHolds.length),products};
}
if(require.main===module){
 const report=auditAll();
 console.log(JSON.stringify(report,null,2));
 const wantRelease=process.argv.includes('--require-new-release-version');
 if(!report.sourceIdentityPassed||(wantRelease&&!report.newerVersionReady)){
  console.error(wantRelease?'HOLD: release identity/version gate failed':'FAIL: source identity continuity failure');
  process.exitCode=1;
 }else if(!report.newerVersionReady){
  console.log('HOLD: unchanged October version numbers. Candidate source identity passes, customer release is NOT authorized.');
 }
}
module.exports={auditOne,auditAll,compareVersions,parseVersion};
