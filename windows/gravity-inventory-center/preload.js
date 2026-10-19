'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('GravityDesktop',Object.freeze({
 saveTextFile:options=>ipcRenderer.invoke('inventory:save-text-file',options),
 loadTextFile:options=>ipcRenderer.invoke('inventory:load-text-file',options)
}));
