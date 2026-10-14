'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,s)=>fs.writeFileSync(path.join(root,p),s,'utf8');

let site=read('site/assets/js/site.js');
if(!site.includes("return 'Testing Room';")){
  site=site.replace("function pageCategory() {\n    var p = (location.pathname || '').toLowerCase();", "function pageCategory() {\n    var p = (location.pathname || '').toLowerCase();\n    if (p.indexOf('testing-room') >= 0) return 'Testing Room';");
}
if(!site.includes('window.gravityAnalyticsEvent')){
  site=site.replace(/(function send\(name, params\) \{[\s\S]*?\n  \})\n\n  if \(analyticsEnabled\)/, "$1\n\n  // Safe public hook for first-party pages that need to report non-PII product events.\n  window.gravityAnalyticsEvent = function (name, params) { send(name, params || {}); };\n\n  if (analyticsEnabled)");
}
write('site/assets/js/site.js',site);

let room=read('site/testing-room.html');
if(!room.includes('testing_room_join')){
  const old="(function(){const API='/testing-room/';const KEY='gravity_testing_room_token_v1';let token=localStorage.getItem(KEY)||new URLSearchParams(location.search).get('t')||'';let kind='problem';const $=id=>document.getElementById(id);const req=async(path,opt={})=>{opt.headers={...(opt.headers||{}),'Content-Type':'application/json'};if(token)opt.headers['x-gravity-tester-token']=token;const r=await fetch(API+path,opt);const j=await r.json().catch(()=>({}));if(!r.ok)throw Error(j.error||'Something went wrong.');return j};";
  const neu="(function(){const API='/testing-room/';const KEY='gravity_testing_room_token_v1';let token=localStorage.getItem(KEY)||new URLSearchParams(location.search).get('t')||'';let kind='problem';const $=id=>document.getElementById(id);const track=(name,params={})=>{try{if(typeof window.gravityAnalyticsEvent==='function')window.gravityAnalyticsEvent(name,params)}catch(_){}};track('testing_room_view',{entry_state:token?'returning':'new'});document.addEventListener('click',e=>{const a=e.target&&e.target.closest?e.target.closest('.tr-tool a'):null;if(!a)return;let p='';try{p=new URL(a.href,location.href).pathname}catch(_){}track('testing_program_open',{destination_path:p||'unknown'})});const req=async(path,opt={})=>{opt.headers={...(opt.headers||{}),'Content-Type':'application/json'};if(token)opt.headers['x-gravity-tester-token']=token;const r=await fetch(API+path,opt);const j=await r.json().catch(()=>({}));if(!r.ok)throw Error(j.error||'Something went wrong.');if(String(opt.method||'GET').toUpperCase()==='POST'){const map={join:'testing_room_join',message:'testing_feedback_sent',schedule:'testing_chat_requested','group/create':'testing_group_created','group/join':'testing_group_joined','group/message':'testing_group_message_sent'};const eventName=map[path];if(eventName){let b={};try{b=JSON.parse(opt.body||'{}')}catch(_){}const p={};if(path==='join')p.interest_count=Array.isArray(b.interests)?b.interests.length:0;if(path==='message'){p.feedback_kind=['problem','idea','confusing','worked','other'].includes(b.kind)?b.kind:'other';p.has_screenshot=b.screenshotData?'yes':'no'}if(path==='schedule')p.chat_method=b.method==='phone'?'phone':'messenger';track(eventName,p)}}return j};";
  if(!room.includes(old)) throw new Error('Testing Room request wrapper anchor not found; refusing partial analytics patch.');
  room=room.replace(old,neu);
}
write('site/testing-room.html',room);

console.log('Testing Room analytics added without sending tester PII, message text, phone numbers, email addresses, or screenshots to GA4.');
