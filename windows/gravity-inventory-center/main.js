'use strict';
const {app,BrowserWindow,ipcMain,dialog,shell}=require('electron');
const fs=require('node:fs'),path=require('node:path');
const SMOKE=process.env.GRAVITY_INVENTORY_SMOKE==='1';
let smokeBackupPath='';
function validExtensions(filters){
 return (Array.isArray(filters)?filters:[]).map(f=>({
 name:String(f.name||'File').slice(0,60),
 extensions:(Array.isArray(f.extensions)?f.extensions:[]).map(x=>String(x).replace(/[^A-Za-z0-9]/g,'').slice(0,8)).filter(Boolean)
 })).filter(f=>f.extensions.length);
}
function registerFiles(){
 ipcMain.handle('inventory:save-text-file',async(event,options)=>{
  const source=event.sender.getURL();if(!source.startsWith('file://'))throw Error('Inventory file actions require the installed app');
  const text=String(options?.content??'');
  if(text.length>80_000_000)throw Error('Export exceeds maximum supported size');
  const filename=path.basename(String(options?.defaultName||'gravity-inventory-export.json')).replace(/[^A-Za-z0-9._ -]/g,'_').slice(0,120);
  const file=SMOKE?path.join(app.getPath('userData'),filename):
   (await dialog.showSaveDialog(BrowserWindow.fromWebContents(event.sender),{
    title:'Save Gravity Inventory Center file',
    defaultPath:path.join(app.getPath('documents'),filename),
    filters:validExtensions(options?.filters)
   })).filePath;
  if(!file)return {canceled:true};
  fs.writeFileSync(file,text,'utf8');
  if(SMOKE&&filename.toLowerCase().includes('backup'))smokeBackupPath=file;
  return {canceled:false};
 });
 ipcMain.handle('inventory:load-text-file',async(event,options)=>{
  if(!event.sender.getURL().startsWith('file://'))throw Error('Inventory file actions require the installed app');
  const file=SMOKE?smokeBackupPath:(await dialog.showOpenDialog(BrowserWindow.fromWebContents(event.sender),{
   title:'Restore Gravity Inventory Center backup',
   properties:['openFile'],
   filters:validExtensions(options?.filters)
  })).filePaths[0];
  if(!file)return {canceled:true};
  const stat=fs.statSync(file);if(stat.size>80_000_000)throw Error('Selected inventory file exceeds supported size');
  return {canceled:false,content:fs.readFileSync(file,'utf8')};
 });
}

function showUsageStatus(win, message) {
  const script = `(()=> {
    const menu = document.querySelector('#gravity-manual-top-menu > div');
    if (!menu) return;
    let status = document.getElementById('gravity-usage-status');
    if (!status) {
      status = document.createElement('p');
      status.id = 'gravity-usage-status';
      status.style.cssText = 'margin:4px 0 0;padding:8px;border-top:1px solid #e2d8c2;color:#394852;font:12px/1.4 system-ui,sans-serif';
      menu.appendChild(status);
    }
    status.textContent = ${JSON.stringify(message)};
  })();`;
  if (!win.isDestroyed()) win.webContents.executeJavaScript(script).catch(() => {});
}

function installUsageTelemetry(win, productSlug) {
  const smokeRun = Object.keys(process.env).some(key => /^GRAVITY_.*_SMOKE$/.test(key) && process.env[key] === '1');
  if (!app.isPackaged || process.env.CI === 'true' || smokeRun || process.env.GRAVITY_DISABLE_USAGE_ANALYTICS === '1') return;
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
  if (!/^[0-9a-f-]{36}$/i.test(clientId)) {
    showUsageStatus(win, 'Usage measurement could not start: local anonymous ID unavailable.');
    return;
  }

  const version = app.getVersion();
  const requestFilter = { urls: ['https://*.google-analytics.com/g/collect*'] };
  const webRequest = win.webContents.session.webRequest;
  webRequest.onCompleted(requestFilter, details => {
    if (details.webContentsId && details.webContentsId !== win.webContents.id) return;
    if (details.statusCode >= 200 && details.statusCode < 300) {
      showUsageStatus(win, 'Usage measurement: Google Analytics acknowledged an event.');
    } else {
      showUsageStatus(win, `Usage measurement: Google Analytics returned HTTP ${details.statusCode}.`);
    }
  });
  webRequest.onErrorOccurred(requestFilter, details => {
    if (details.webContentsId && details.webContentsId !== win.webContents.id) return;
    showUsageStatus(win, `Usage measurement: network request failed (${details.error}).`);
  });

  const script = `(()=> {
    const setStatus = message => {
      const menu = document.querySelector('#gravity-manual-top-menu > div');
      if (!menu) return;
      let status = document.getElementById('gravity-usage-status');
      if (!status) {
        status = document.createElement('p');
        status.id = 'gravity-usage-status';
        status.style.cssText = 'margin:4px 0 0;padding:8px;border-top:1px solid #e2d8c2;color:#394852;font:12px/1.4 system-ui,sans-serif';
        menu.appendChild(status);
      }
      status.textContent = message;
    };
    if (navigator.doNotTrack === '1' || window.doNotTrack === '1') {
      setStatus('Usage measurement is paused because Do Not Track is enabled.');
      return;
    }
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
    let tagReady = false;
    const send = (name, type) => {
      if (!tagReady) return;
      window.gtag('event', name, {
        product_slug: product,
        product_surface: 'windows',
        app_version: version,
        interaction_type: type
      });
    };
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    tag.onload = () => {
      tagReady = true;
      setStatus('Usage measurement: Google tag loaded; checking the app-open event.');
      send('gravity_product_open', 'open');
    };
    tag.onerror = () => setStatus('Usage measurement could not load Google Tag. Check internet or privacy settings.');
    document.head.appendChild(tag);
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
  })();`;
  win.webContents.once('did-finish-load', () => {
    showUsageStatus(win, 'Usage measurement: checking connection.');
    win.webContents.executeJavaScript(script).catch(error => {
      showUsageStatus(win, `Usage measurement could not start (${String(error).slice(0, 120)}).`);
    });
  });
}
function launch(){
 const win=new BrowserWindow({width:1450,height:950,minWidth:900,minHeight:650,show:!SMOKE,
  autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'preload.js'),sandbox:true,contextIsolation:true,nodeIntegration:false}});
 win.webContents.setWindowOpenHandler(({url})=>{
  if(/^https:\/\//.test(url))shell.openExternal(url).catch(console.warn);
  return {action:'deny'};
 });
 win.webContents.on('will-navigate',(event,url)=>{
  if(/^https:\/\//.test(url)){event.preventDefault();shell.openExternal(url).catch(console.warn)}
  else if(!url.startsWith('file://'))event.preventDefault();
 });
 if(SMOKE){
  const timer=setTimeout(()=>{console.error('Inventory Center Windows smoke timed out.');app.exit(1)},95000);
  win.webContents.once('did-finish-load',async()=>{
   try{
    const result=await require('./smoke.cjs').run(win);
    clearTimeout(timer);console.log('INVENTORY CENTER WINDOWS SMOKE PASSED',JSON.stringify(result));app.exit(0);
   }catch(e){clearTimeout(timer);console.error('INVENTORY CENTER WINDOWS SMOKE FAILED',e.stack||e);app.exit(1)}
  });
 }
 installUsageTelemetry(win, 'inventory-center-windows');
 win.loadFile(path.join(__dirname,'app','index.html'));
}
app.whenReady().then(()=>{
 if(SMOKE)app.setPath('userData',path.join(app.getPath('temp'),'gravity-inventory-smoke-'+process.pid));
 registerFiles();launch();if(!SMOKE)app.on('activate',()=>{if(!BrowserWindow.getAllWindows().length)launch()});
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
