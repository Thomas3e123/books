'use strict';
const fs=require('node:fs');const path=require('node:path');
const file=path.join(__dirname,'..','site','testing-room.html');let html=fs.readFileSync(file,'utf8');
if(html.includes('gravity-founder-shortcut')){console.log('Founder shortcut already installed.');process.exit(0)}
const marker='<script src="/assets/js/site.js"></script>';
const code=`<script id="gravity-founder-shortcut">(function(){let c=0,t=0;document.addEventListener('click',function(e){const brand=e.target&&e.target.closest?e.target.closest('a.brand'):null;if(!brand)return;const n=Date.now();if(n-t>1800)c=0;t=n;c++;if(c>=3){e.preventDefault();c=0;location.href='/testing-room-manager';}},true);})();</script>`;
if(!html.includes(marker))throw new Error('Testing Room site.js marker not found.');
html=html.replace(marker,marker+code);fs.writeFileSync(file,html);console.log('Installed hidden triple-click Founder’s Booth shortcut on Testing Room brand.');
