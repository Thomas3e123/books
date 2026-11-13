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

function installUsageTelemetry(win, productSlug) {
  if (!app.isPackaged || process.env.GRAVITY_DISABLE_USAGE_ANALYTICS === '1') return;
  const fs = require('node:fs');
  const crypto = require('node:crypto');
  const idFile = path.join(app.getPath('userData'), 'gravity-usage-install-id');
  let clientId;
  try {
    fs.mkdirSync(path.dirname(idFile), { recursive: true });
    clientId = fs.readFileSync(idFile, 'utf8').trim();
    if (!/^[0-9a-f-]{36}$/i.test(clientId)) throw new Error('Invalid usage identifier');
  } catch (_) {
    clientId = crypto.randomUUID();
    try { fs.writeFileSync(idFile, clientId, { encoding: 'utf8', flag: 'wx' }); }
    catch (_) { try { clientId = fs.readFileSync(idFile, 'utf8').trim(); } catch (_) {} }
  }
  if (!/^[0-9a-f-]{36}$/i.test(clientId)) return;
  const version = app.getVersion();
  const script = `(()=> {
    if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;
    const measurementId = 'G-M98MZFED33';
    const product = ${JSON.stringify(productSlug)};
    const clientId = ${JSON.stringify(clientId)};
    const version = ${JSON.stringify(version)};
    const pageLocation = 'https://gravityleadershipsystem.com/windows-programs/' + product;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      send_page_view: false,
      client_id: clientId,
      page_location: pageLocation,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    const send = (name, type) => window.gtag('event', name, {
      product_slug: product,
      product_surface: 'windows',
      app_version: version,
      interaction_type: type
    });
    send('gravity_product_open', 'open');
    document.addEventListener('click', event => {
      if (event.target && event.target.closest && event.target.closest('button,[role="button"]')) {
        send('gravity_product_interaction', 'button');
        lastActivity = Date.now();
      }
    }, true);
    document.addEventListener('submit', () => {
      send('gravity_product_interaction', 'form_submit');
      lastActivity = Date.now();
    }, true);
    let lastActivity = Date.now();
    ['pointerdown', 'keydown', 'input'].forEach(type =>
      document.addEventListener(type, () => { lastActivity = Date.now(); }, { capture: true, passive: true })
    );
    setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - lastActivity < 15 * 60 * 1000) {
        send('gravity_product_active', 'recent_activity');
      }
    }, 5 * 60 * 1000);
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    document.head.appendChild(tag);
  })();`;
  win.webContents.once('did-finish-load', () => {
    win.webContents.executeJavaScript(script).catch(() => {});
  });
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
  installUsageTelemetry(window, 'sop-foundry-windows');
  window.loadURL(baseURL+'/apps/sop-foundry/access.html');
}
app.whenReady().then(async()=>{
  if(SMOKE)app.setPath('userData',path.join(app.getPath('temp'),'gravity-sop-foundry-smoke-'+process.pid));
  protocol.handle(SCHEME,route);
  launch();
  if(!SMOKE)app.on('activate',()=>{if(!BrowserWindow.getAllWindows().length)launch()});
}).catch(err=>{console.error(err);app.exit(1)});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
