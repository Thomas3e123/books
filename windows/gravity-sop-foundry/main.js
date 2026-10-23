'use strict';
const {app,BrowserWindow,protocol,net,shell}=require('electron');
const fs=require('node:fs'),path=require('node:path');
const SCHEME='gravityfoundry',HOST='app',HOSTED='https://gravityleadershipsystem.com';
const SMOKE=process.env.GRAVITY_FOUNDRY_SMOKE==='1';
protocol.registerSchemesAsPrivileged([{scheme:SCHEME,privileges:{standard:true,secure:true,supportFetchAPI:true,stream:true,corsEnabled:true,codeCache:true}}]);
const baseURL=SCHEME+'://'+HOST;
const root=path.join(__dirname,'app/site');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.ico':'image/x-icon','.woff':'font/woff','.woff2':'font/woff2','.webp':'image/webp'};
const reply=(value,status=200,type='text/plain; charset=utf-8')=>new Response(value,{status,headers:{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function hostedProxy(req,url){
  if(!url.pathname.startsWith('/foundry-hosted/'))return reply('Not permitted',403);
  try{
    const headers=new Headers(req.headers);
    headers.delete('host');headers.delete('origin');headers.delete('referer');headers.delete('cookie');
    const opts={method:req.method,headers,redirect:'follow'};
    if(!['GET','HEAD'].includes(req.method))opts.body=Buffer.from(await req.arrayBuffer());
    const upstream=await net.fetch(HOSTED+url.pathname+url.search,opts);
    const data=await upstream.arrayBuffer();
    const responseHeaders=new Headers();
    for(const key of ['content-type','cache-control'])if(upstream.headers.has(key))responseHeaders.set(key,upstream.headers.get(key));
    responseHeaders.set('cache-control','no-store');
    return new Response(data,{status:upstream.status,headers:responseHeaders});
  }catch(e){return reply('Hosted employee connection unavailable. Check internet access and try again.',503);}
}
async function route(req){
  let url;try{url=new URL(req.url)}catch{return reply('Bad request',400)}
  if(url.hostname!==HOST)return reply('Unknown workspace',404);
  if(url.pathname.startsWith('/foundry-hosted/'))return hostedProxy(req,url);
  if(url.pathname.startsWith('/e/'))return Response.redirect(HOSTED+url.pathname+url.search,302);
  if(!['GET','HEAD'].includes(req.method))return reply('Not supported',405);
  let requested;
  try{requested=decodeURIComponent(url.pathname)}catch{return reply('Invalid pathname',400)}
  if(requested==='/'||requested==='/apps/sop-foundry'||requested==='/apps/sop-foundry/')requested='/apps/sop-foundry/access.html';
  if(!path.posix.extname(requested))requested+='.html';
  const file=path.resolve(root,'.'+requested),relative=path.relative(root,file);
  if(relative.startsWith('..')||path.isAbsolute(relative))return reply('Forbidden path',403);
  if(!fs.existsSync(file)||!fs.statSync(file).isFile())return reply('Asset not found',404);
  return reply(fs.readFileSync(file),200,mime[path.extname(file).toLowerCase()]||'application/octet-stream');
}
function launch(){
  const window=new BrowserWindow({width:1500,height:940,minWidth:840,minHeight:600,show:!SMOKE,autoHideMenuBar:true,webPreferences:{sandbox:true,nodeIntegration:false,contextIsolation:true,webSecurity:true}});
  window.webContents.setWindowOpenHandler(({url})=>{if(url.startsWith('https://'))shell.openExternal(url).catch(()=>{});return{action:'deny'}});
  window.webContents.on('will-navigate',(event,url)=>{
    if(url.startsWith('https://')){event.preventDefault();shell.openExternal(url).catch(()=>{});}
    else if(!url.startsWith(baseURL+'/'))event.preventDefault();
  });
  if(SMOKE){
    const timer=setTimeout(()=>{console.error('SOP Foundry Windows smoke timed out');app.exit(1)},100000);
    window.webContents.once('did-finish-load',async()=>{
      try{const result=await require('./smoke.cjs').run(window,baseURL);clearTimeout(timer);console.log('SOP FOUNDRY WINDOWS SMOKE PASSED',JSON.stringify(result));app.exit(0);}
      catch(e){clearTimeout(timer);console.error('SOP FOUNDRY WINDOWS SMOKE FAILED',e.stack||e);app.exit(1)}
    });
    window.webContents.on('console-message',(_event,details)=>{if(String(details?.message||'').startsWith('[FOUNDRY-SMOKE]'))console.log(details.message)});
    window.webContents.on('did-fail-load',(_e,code,desc,url)=>console.error('SOP Foundry load error',code,desc,url));
  }
  window.loadURL(baseURL+'/apps/sop-foundry/access.html');
}
app.whenReady().then(async()=>{
  if(SMOKE)app.setPath('userData',path.join(app.getPath('temp'),'gravity-sop-foundry-smoke-'+process.pid));
  protocol.handle(SCHEME,route);
  launch();
  if(!SMOKE)app.on('activate',()=>{if(!BrowserWindow.getAllWindows().length)launch()});
}).catch(err=>{console.error(err);app.exit(1)});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
