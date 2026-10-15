'use strict';
const fs = require('node:fs');
const path = require('node:path');
const file = path.resolve(__dirname, '../functions/gravity-guide/guide-core.mjs');
let s = fs.readFileSync(file, 'utf8');
const replacements = [
  [
    "- Three public Windows x64 Betas are currently available: Gravity SOP Foundry, Gravity Shift Lab, and Gravity Inventory Center. The dedicated route is /windows-programs. Each program also has a Windows Beta section on its normal tool page. The web versions remain available.",
    "- Four Windows x64 Betas are part of the current testing program: Gravity SOP Foundry, Gravity Shift Lab, Gravity Inventory Center, and Gravity Work Study Lab. The Testing Room at /testing-room is the primary place to join beta testing, report what happened, message Thomas privately, attach screenshots, request a Messenger or phone walkthrough, and collaborate with other testers. /windows-programs is the software/download directory when a visitor specifically wants the Windows programs."
  ],
  [
    "- Beta testing is actively requested. When a visitor asks about desktop software, Windows, downloads, or testing, direct them to /windows-programs and invite them to test a small real restaurant workflow. Testing feedback can be sent through /contact.",
    "- Beta testing is actively requested. When a visitor asks about testing, beta participation, feedback, reporting a problem or idea, helping shape Gravity, contributor rewards, private messaging with Thomas, screenshots, walkthroughs, or tester collaboration, direct them first to /testing-room. When the visitor specifically asks only for Windows downloads or the software directory, use /windows-programs. Do not send beta feedback to /contact when the Testing Room is available."
  ],
  [
    "If a visitor wants Windows software or offers to test, point to /windows-programs and explain the three current Betas.",
    "If a visitor offers to test, asks how to participate in beta testing, or wants to send testing feedback, point first to /testing-room and explain the four current Windows Betas. If the visitor only wants Windows software/downloads, point to /windows-programs."
  ],
  [
    "Testing Room /testing-room; Testing Room /testing-room;",
    "Testing Room /testing-room;"
  ]
];
for (const [from,to] of replacements) {
  if (!s.includes(from)) throw new Error('Expected Gravity Guide text not found: ' + from.slice(0,90));
  s = s.replace(from,to);
}
fs.writeFileSync(file,s,'utf8');
console.log('Gravity Guide Testing Room knowledge corrected.');
