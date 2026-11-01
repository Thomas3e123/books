"use strict";
const {app,BrowserWindow,ipcMain,shell,clipboard,dialog}=require("electron");
const fs=require("node:fs/promises");
const path=require("node:path");
const crypto=require("node:crypto");
const PRICE_CENTS=2999;
// IMPORTANT: configure a separate Square product checkout URL; do NOT reuse the voluntary donation link.
const SQUARE_PRODUCT_CHECKOUT_URL=process.env.GRAVITY_HANDBOOK_SQUARE_PRODUCT_URL||"";
const LICENSE_VERIFY_URL=process.env.GRAVITY_HANDBOOK_LICENSE_VERIFY_URL||"";
let win;
let unlocked=false;
async function verifyLicense(licenseKey){
 if(!LICENSE_VERIFY_URL) return {ok:false,error:"License verification service is not configured."};
 if(!/^https:\/\//.test(LICENSE_VERIFY_URL))return {ok:false,error:"Verification endpoint must use HTTPS."};
 try{
  const response=await fetch(LICENSE_VERIFY_URL,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({licenseKey,product:"gravity-handbook-creator",priceCents:PRICE_CENTS}),signal:AbortSignal.timeout(12000)});
  if(!response.ok)return {ok:false,error:"License could not be verified."};
  const result=await response.json();
  // The verification service MUST independently confirm completed Square payment,
  // correct product/amount, and valid license status. Never trust client-supplied claims.
  if(result.valid===true&&result.product==="gravity-handbook-creator"){unlocked=true;return {ok:true}}
  return {ok:false,error:"No valid purchase found for this license."};
 }catch{return {ok:false,error:"Verification unavailable. Please try again."}}
}
function createWindow(){
 win=new BrowserWindow({width:1100,height:780,minWidth:780,minHeight:560,webPreferences:{preload:path.join(__dirname,"preload.js"),contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true}});
 win.removeMenu();win.loadFile("index.html");
 win.webContents.setWindowOpenHandler(()=>({action:"deny"}));
 win.webContents.on("will-navigate",e=>e.preventDefault());
 win.webContents.on("before-input-event",(event,input)=>{if(!unlocked&&(input.control||input.meta)&&["c","x","p","s"].includes(input.key.toLowerCase()))event.preventDefault()});
 win.webContents.on("context-menu",e=>{if(!unlocked)e.preventDefault()});
}
app.whenReady().then(()=>{createWindow();app.on("activate",()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()})});
app.on("window-all-closed",()=>{if(process.platform!=="darwin")app.quit()});
ipcMain.handle("product:info",()=>({price:"$29.99",checkoutConfigured:!!SQUARE_PRODUCT_CHECKOUT_URL,verificationConfigured:!!LICENSE_VERIFY_URL,unlocked}));
ipcMain.handle("product:purchase",async()=>{if(!/^https:\/\//.test(SQUARE_PRODUCT_CHECKOUT_URL))return {ok:false,error:"Square product checkout has not been configured."};await shell.openExternal(SQUARE_PRODUCT_CHECKOUT_URL);return {ok:true}});
ipcMain.handle("product:activate",(_,key)=>verifyLicense(String(key||"").trim()));
ipcMain.handle("project:save",async(_,payload)=>{if(typeof payload!=="string"||payload.length>5e6)return {ok:false,error:"Invalid project size"};let parsed;try{parsed=JSON.parse(payload)}catch{return {ok:false,error:"Invalid project"}};if(!parsed||typeof parsed!=="object"||!parsed.answers)return {ok:false,error:"Invalid project"};const {canceled,filePath}=await dialog.showSaveDialog(win,{defaultPath:"restaurant.gravityhandbook",filters:[{name:"Gravity Handbook Project",extensions:["gravityhandbook"]}]});if(canceled||!filePath)return {ok:false,canceled:true};await fs.writeFile(filePath,payload,"utf8");return {ok:true}});
ipcMain.handle("project:open",async()=>{const {canceled,filePaths}=await dialog.showOpenDialog(win,{properties:["openFile"],filters:[{name:"Gravity Handbook Project",extensions:["gravityhandbook"]}]});if(canceled||!filePaths[0])return {ok:false,canceled:true};const content=await fs.readFile(filePaths[0],"utf8");if(content.length>5e6)return {ok:false,error:"Project too large"};return {ok:true,content}});
ipcMain.handle("handbook:copy",(_,text)=>{if(!unlocked)return {ok:false,error:"Purchase required"};clipboard.writeText(String(text).slice(0,2e6));return {ok:true}});
ipcMain.handle("handbook:exportText",async(_,text)=>{if(!unlocked)return {ok:false,error:"Purchase required"};const {canceled,filePath}=await dialog.showSaveDialog(win,{defaultPath:"employee-handbook.txt",filters:[{name:"Text",extensions:["txt"]}]});if(canceled||!filePath)return {ok:false,canceled:true};await fs.writeFile(filePath,String(text),"utf8");return {ok:true}});
