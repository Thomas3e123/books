'use strict';
const {app,BrowserWindow,shell}=require('electron');
const path=require('node:path');
const SMOKE=process.env.GRAVITY_SHIFT_SMOKE==='1';
function launch(){
 const win=new BrowserWindow({width:1440,height:940,minWidth:850,minHeight:620,show:!SMOKE,autoHideMenuBar:true,webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true}});
 win.webContents.setWindowOpenHandler(({url})=>{if(/^https:\/\//.test(url))shell.openExternal(url);return{action:'deny'}});
 if(SMOKE){
  const timer=setTimeout(()=>{console.error('Windows Shift Lab smoke timed out.');app.exit(1)},65000);
  win.webContents.once('did-finish-load',async()=>{
   try{
    const report=await require('./smoke.cjs').run(win);
    clearTimeout(timer);console.log('WINDOWS SHIFT LAB SMOKE PASSED',JSON.stringify(report));app.exit(0);
   }catch(err){clearTimeout(timer);console.error('WINDOWS SHIFT LAB SMOKE FAILED',err.stack||err);app.exit(1)}
  });
  win.webContents.on('did-fail-load',(_event,code,description,url)=>console.error('Shift Lab page load failed',code,description,url));
 }
 win.loadFile(path.join(__dirname,'app','gravity-shift-lab.html'));
}
app.whenReady().then(()=>{if(SMOKE)app.setPath('userData',path.join(app.getPath('temp'),'gravity-shift-lab-smoke-'+process.pid));launch();if(!SMOKE)app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)launch()})});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
