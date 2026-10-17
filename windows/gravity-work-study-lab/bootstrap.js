'use strict';
const fs=require('node:fs');
const nativeFsyncSync=fs.fsyncSync.bind(fs);
fs.fsyncSync=function(fd){
 try{return nativeFsyncSync(fd)}
 catch(err){
  if(err&&['EPERM','EINVAL','ENOTSUP'].includes(err.code))return;
  throw err;
 }
};
require('./device-link-main.js');
require('./main.js');
