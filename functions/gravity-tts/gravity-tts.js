'use strict';
const allowedVoices=new Set(['cedar','marin']);
const allowedOrigins=new Set(['https://thomasmonroebooks.com','https://www.thomasmonroebooks.com','https://gravity-leadership-system.netlify.app','https://gravityleadershipsystem.com','https://www.gravityleadershipsystem.com']);
function json(status,obj){return {statusCode:status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},body:JSON.stringify(obj)}}
async function handle(event){
  if((event.httpMethod||'GET')==='GET') return json(200,{ok:true,function:'gravity-tts',configured:Boolean(process.env.OPENAI_API_KEY),voices:['cedar','marin']});
  if(event.httpMethod!=='POST') return json(405,{error:'POST required'});
  const key=process.env.OPENAI_API_KEY;if(!key)return json(503,{error:'Gravity neural voice is not configured.'});
  const origin=(event.headers&&((event.headers.origin)||(event.headers.Origin)))||'';if(origin&&!allowedOrigins.has(origin)&&!origin.endsWith('.netlify.app'))return json(403,{error:'Origin not allowed'});
  let body;try{body=JSON.parse(event.body||'{}')}catch{return json(400,{error:'Invalid request'})}
  const text=String(body.text||'').trim().slice(0,3800);if(!text)return json(400,{error:'Text required'});
  const voice=allowedVoices.has(body.voice)?body.voice:'cedar';const speed=Math.min(1.2,Math.max(.85,Number(body.speed)||.98));
  const r=await fetch('https://api.openai.com/v1/audio/speech',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-4o-mini-tts',voice,input:text,response_format:'mp3',speed,instructions:'Speak as the Gravity Guide: a warm, steady, natural adult male-presenting voice. Conversational, calm, clear, practical, unhurried, with natural pauses. Never sound like an announcer or synthetic navigation voice.'})});
  if(!r.ok){const err=await r.text();console.error('OpenAI TTS',r.status,err.slice(0,500));return json(r.status,{error:'Neural voice is temporarily unavailable.'});}
  const buf=Buffer.from(await r.arrayBuffer());
  return {statusCode:200,isBase64Encoded:true,headers:{'Content-Type':'audio/mpeg','Cache-Control':'private, max-age=86400','X-Gravity-Voice':voice},body:buf.toString('base64')};
};

exports.handler=async event=>{try{return await handle(event)}catch(error){console.error("Gravity TTS request failed",error.name);return json(502,{error:"Neural voice is temporarily unavailable."})}};
