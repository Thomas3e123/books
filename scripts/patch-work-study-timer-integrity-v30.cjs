'use strict';
const fs=require('node:fs');
const file='site/assets/js/gravity-work-study-v2.js';
let src=fs.readFileSync(file,'utf8');
const old="function setScreen(x){stopTimer(false);s.screen=x;save('');render()}";
const neu="function setScreen(x){if(s.timer?.running)stopTimer(true);s.screen=x;save('');render()}";
if(src.includes(old)){src=src.replace(old,neu);fs.writeFileSync(file,src);console.log('Timer integrity installed: active elapsed time is recorded before screen navigation.');}
else if(src.includes(neu)){console.log('Timer integrity already current.');}
else{throw new Error('Expected setScreen timer behavior not found; refusing unsafe patch.');}
