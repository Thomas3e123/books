'use strict';
const allowed=new Set(['https://thomasmonroebooks.com','https://www.thomasmonroebooks.com','https://gravity-leadership-system.netlify.app','https://gravityleadershipsystem.com','https://www.gravityleadershipsystem.com']);
const reply=(statusCode,body)=>({statusCode,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'},body:JSON.stringify(body)});
exports.handler=async event=>{
 try{
  if(event.httpMethod!=='POST')return reply(405,{error:'POST required'});
  const origin=event.headers?.origin||event.headers?.Origin||'';
  if(origin&&!allowed.has(origin)&&!/^https:\/\/[a-z0-9-]+\.netlify\.app$/.test(origin))return reply(403,{error:'Origin not allowed'});
  const key=process.env.OPENAI_API_KEY;if(!key)return reply(503,{error:'Audio analysis is not configured.'});
  if(!event.isBase64Encoded)return reply(400,{error:'Audio must be binary'});
  const type=String(event.headers?.['content-type']||event.headers?.['Content-Type']||'audio/webm').split(';')[0].toLowerCase();
  const ext={'audio/webm':'webm','audio/mp4':'m4a','audio/mpeg':'mp3','audio/wav':'wav','audio/x-wav':'wav','audio/ogg':'ogg'}[type];
  if(!ext)return reply(415,{error:'Unsupported audio type'});
  const bytes=Buffer.from(event.body||'','base64');if(!bytes.length||bytes.length>8*1024*1024)return reply(413,{error:'Recordings must be between 1 byte and 8 MB for this preview. Save longer audio locally.'});
  const form=new FormData();form.append('file',new Blob([bytes],{type}), 'observation.'+ext);form.append('model','whisper-1');form.append('response_format','verbose_json');form.append('timestamp_granularities[]','segment');form.append('language','en');
  const response=await fetch('https://api.openai.com/v1/audio/transcriptions',{method:'POST',headers:{Authorization:'Bearer '+key},body:form,signal:AbortSignal.timeout(50000)});
  if(!response.ok){console.error('Gravity transcription HTTP',response.status);return reply(502,{error:'Audio transcription failed. Your original recording remains on the device.'})}
  const transcript=await response.json();
  const segments=(transcript.segments||[]).slice(0,1500).map(s=>({start:Number(s.start)||0,end:Number(s.end)||0,text:String(s.text||'').trim()})).filter(s=>s.text);
  return reply(200,{source:'audio-transcription',disclosure:'Transcribed using a cloud audio service. Review all words and timestamps before accepting.',text:String(transcript.text||''),segments,confidence:'unverified'});
 }catch(e){console.error('work-study-transcribe',e?.name||'error');return reply(500,{error:'Transcription unavailable. Your recording remains on this device.'})}
};
