'use strict';
const {app,BrowserWindow,shell}=require('electron');
const path=require('node:path');
function launch(){
 const win=new BrowserWindow({width:1440,height:940,minWidth:850,minHeight:620,autoHideMenuBar:true,webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true}});
 win.webContents.setWindowOpenHandler(({url})=>{if(/^https:\/\//.test(url))shell.openExternal(url);return{action:'deny'}});
 win.loadFile(path.join(__dirname,'app','gravity-shift-lab.html'));
}
app.whenReady().then(()=>{launch();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)launch()})});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
