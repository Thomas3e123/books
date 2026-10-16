'use strict';
const fs=require('node:fs');
const src=fs.readFileSync('site/assets/js/gravity-work-study-v2.js','utf8');
if(src.includes("function setScreen(x){stopTimer(false)")){console.error('Timer integrity failure: screen navigation still discards active elapsed time.');process.exit(1)}
if(!src.includes("function setScreen(x){if(s.timer?.running)stopTimer(true);s.screen=x;save('');render()}")){console.error('Timer integrity behavior missing.');process.exit(1)}
if(!src.includes("$$('[data-mode]').forEach(b=>b.onclick=()=>{capture();s.mode=b.dataset.mode;save('Mode changed');render()})")){console.error('Mode-change timer preservation behavior changed unexpectedly.');process.exit(1)}
console.log('Timer integrity suite passed: screen changes record active elapsed time and mode changes preserve the active timer.');
