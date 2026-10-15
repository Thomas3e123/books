'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('gravityDesktop',{
 info:()=>ipcRenderer.invoke('app:info'),
 listStudies:()=>ipcRenderer.invoke('study:list'),
 loadStudy:id=>ipcRenderer.invoke('study:load',id),
 saveStudy:study=>ipcRenderer.invoke('study:save',study),
 deleteStudy:id=>ipcRenderer.invoke('study:delete',id),
 loadSettings:()=>ipcRenderer.invoke('settings:load'),
 saveSettings:value=>ipcRenderer.invoke('settings:save',value),
 exportStudy:study=>ipcRenderer.invoke('study:export-json',study),
 importStudy:()=>ipcRenderer.invoke('study:import-json'),
 savePdf:name=>ipcRenderer.invoke('report:pdf',name),
 print:()=>ipcRenderer.invoke('report:print'),
 openDataFolder:()=>ipcRenderer.invoke('system:open-data')
});
