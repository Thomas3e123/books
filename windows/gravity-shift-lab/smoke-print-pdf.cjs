'use strict';
// Native Electron PDF engine test. No printer or restaurant data is required.
// This test runs in the GitHub-hosted Windows renderer, never on customer files.
const assert=require('node:assert/strict');
function validPdf(data,name) {
  const b=Buffer.from(data);
  assert(b.length>7000,name+' generated a suspiciously small PDF: '+b.length);
  assert.equal(b.subarray(0,5).toString('ascii'),'%PDF-',name+' is not a PDF');
  assert(b.includes(Buffer.from('%%EOF')),name+' PDF lacks EOF marker');
  return b;
}
async function run(win) {
  const sheet=await win.webContents.executeJavaScript(`(()=>{
    const el=document.getElementById('employee-print-snapshot');
    const qr=document.getElementById('employee-print-qr-canvas');
    if(!el||!el.textContent.includes('Windows Smoke Tester'))throw Error('Printable employee schedule unavailable');
    if(!qr||qr.toDataURL('image/png').length<3000)throw Error('Printable QR missing');
    if(document.querySelector('#lab-body .employee-wage')?.value!== '20')throw Error('Manager pay must be unlocked for PDF smoke');
    document.body.classList.remove('print-manager');
    return {employeeSchedule:true,qr:true};
  })()`,true);
  const employee=validPdf(await win.webContents.printToPDF({printBackground:true,pageSize:'A4'}),'Employee schedule');
  await win.webContents.executeJavaScript("document.body.classList.add('print-manager')",true);
  let manager;
  try {manager=validPdf(await win.webContents.printToPDF({printBackground:true,pageSize:'A4'}),'Manager labor schedule');}
  finally{await win.webContents.executeJavaScript("document.body.classList.remove('print-manager')",true);}
  assert(!employee.equals(manager),'Employee and manager PDF output is unexpectedly identical');
  console.log('[SHIFT-LAB PRINT PDF]',JSON.stringify({employeePdfBytes:employee.length,managerPdfBytes:manager.length,validPdfHeaders:true,distinctLayouts:true}));
  return {employeePdfBytes:employee.length,managerPdfBytes:manager.length};
}
module.exports={run};
