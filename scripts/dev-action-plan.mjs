// Local preview only. Production uses Netlify static hosting and the server function.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {Readable} from 'node:stream';
import {handle} from '../functions/gravity-action-plan/index.mjs';
const root=resolve('site');const portIndex=process.argv.indexOf('--port');const port=Number(portIndex>=0?process.argv[portIndex+1]:(process.env.PORT||5173));
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg'};
http.createServer(async(req,res)=>{try{
 const origin='http://'+req.headers.host;const url=new URL(req.url,origin);
 if(url.pathname==='/.netlify/functions/gravity-action-plan'){
  const r=await handle(new Request(url,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Readable.toWeb(req),duplex:'half'})}),{site:{url:origin}});res.writeHead(r.status,Object.fromEntries(r.headers));Readable.fromWeb(r.body).pipe(res);return;
 }
 let path=decodeURIComponent(url.pathname);if(path==='/')path='/index.html';else if(!extname(path))path+='.html';const file=resolve(root,'.'+path);if(!file.startsWith(root+'/')){res.writeHead(403);res.end();return}const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(data);
 }catch{res.writeHead(404);res.end('Not found')}}).listen(port,'0.0.0.0',()=>console.log('Local preview: http://0.0.0.0:'+port));
