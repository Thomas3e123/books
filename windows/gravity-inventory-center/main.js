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
 win.loadFile(path.join(__dirname,'app','index.html'));
}
app.whenReady().then(()=>{
 if(SMOKE)app.setPath('userData',path.join(app.getPath('temp'),'gravity-inventory-smoke-'+process.pid));
 registerFiles();launch();if(!SMOKE)app.on('activate',()=>{if(!BrowserWindow.getAllWindows().length)launch()});
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
