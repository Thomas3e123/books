'use strict';
const fs=require('node:fs'),path=require('node:path');
const out=path.resolve('build/gravity-static-audit');
fs.rmSync(out,{recursive:true,force:true});fs.cpSync('site',out,{recursive:true});
fs.writeFileSync(path.join(out,'robots.txt'),'User-agent: *\nDisallow: /\n');
fs.writeFileSync(path.join(out,'_headers'),"/*\n  X-Robots-Tag: noindex, nofollow\n  Cache-Control: no-store\n  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; form-action 'self'; object-src 'none'; frame-src 'self' blob:;\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n");
fs.writeFileSync(path.join(out,'audit-isolation.json'),JSON.stringify({auditOnly:true,customerDatabase:false,email:false,payments:false,functions:['handbook-creator: status, preview, export only']}));
console.log('Isolated test build: no customer database, email, payment or cloud functions.');
