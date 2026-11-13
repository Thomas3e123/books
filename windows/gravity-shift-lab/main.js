'use strict';
const {app,BrowserWindow,shell}=require('electron');
const path=require('node:path');
const SMOKE=process.env.GRAVITY_SHIFT_SMOKE==='1';

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
 const win=new BrowserWindow({width:1440,height:940,minWidth:850,minHeight:620,show:!SMOKE,autoHideMenuBar:true,webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true}});
 win.webContents.setWindowOpenHandler(({url})=>{if(/^https:\/\//.test(url))shell.openExternal(url);return{action:'deny'}});
 // Website navigation must not replace the local Windows scheduling application.
 win.webContents.on('will-navigate',(event,url)=>{
  if(/^https:\/\//i.test(url)){
   event.preventDefault();shell.openExternal(url).catch(err=>console.warn('Could not open website:',err.message));
  }else if(!url.startsWith('file://')){
   event.preventDefault();
  }
 });
 if(SMOKE){
  win.webContents.on('console-message',(event,details)=>{const message=details?.message||event?.message||'';if(String(message).startsWith('[SHIFT-SMOKE]'))console.log(message);});
  const timer=setTimeout(()=>{console.error('Windows Shift Lab smoke timed out.');app.exit(1)},65000);
  win.webContents.once('did-finish-load',async()=>{
   try{
    const report=await require('./smoke.cjs').run(win);
    clearTimeout(timer);console.log('WINDOWS SHIFT LAB SMOKE PASSED',JSON.stringify(report));app.exit(0);
   }catch(err){clearTimeout(timer);console.error('WINDOWS SHIFT LAB SMOKE FAILED',err.stack||err);app.exit(1)}
  });
  win.webContents.on('did-fail-load',(_event,code,description,url)=>console.error('Shift Lab page load failed',code,description,url));
 }
 installUsageTelemetry(win, 'shift-lab-windows');
 win.loadFile(path.join(__dirname,'app','gravity-shift-lab.html'));
}
app.whenReady().then(()=>{if(SMOKE)app.setPath('userData',path.join(app.getPath('temp'),'gravity-shift-lab-smoke-'+process.pid));launch();if(!SMOKE)app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)launch()})});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
