'use strict';
// Offline compatibility smoke test for the exact security-upgraded PDF library.
// Creates a temporary in-memory PDF only; no customer content or network calls.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs');
const lock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));
test('jsPDF 4.2.1 or newer is locked and creates valid PDF output',()=>{
  const version=lock.packages?.['node_modules/jspdf']?.version||'0.0.0';
  const [major,minor,patch]=version.split('.').map(Number);
  assert.ok(major>4||(major===4&&(minor>2||(minor===2&&patch>=1))),
    'Security hold: vulnerable jsPDF version is still pinned');
  const {jsPDF}=require('jspdf');
  const document=new jsPDF({unit:'pt',format:'letter'});
  document.setFontSize(16);
  document.text('Gravity Employee Handbook Test',35,48);
  document.setFontSize(11);
  document.text('Procedure: Test PDF creation with an in-memory sample.',35,78);
  document.addPage();
  document.text('Page 2: Training and SOP proof.',35,50);
  const bytes=new Uint8Array(document.output('arraybuffer'));
  assert.ok(bytes.byteLength>500);
  assert.equal(String.fromCharCode(...bytes.slice(0,5)),'%PDF-');
  const end=String.fromCharCode(...bytes.slice(-30));
  assert.match(end,/%%EOF/);
  assert.equal(document.getNumberOfPages(),2);
});
