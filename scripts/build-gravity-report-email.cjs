#!/usr/bin/env node
'use strict';
// Compiles a review-only MailerLite-compatible Gravity Report email pack.
// NO recipients are read, no email is sent, and no API/network calls occur.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..');
const source=path.join(ROOT,'functions','gravity-report');
const ORIGIN='https://gravityleadershipsystem.com';
const FROM='The Gravity Report <thomas.butler@gravityleadershipsystem.com>';
const REPLY='thomas.butler@gravityleadershipsystem.com';
const UNSUB='{$unsubscribe}'; // MailerLite recipient-specific unsubscribe link.
const ADDRESS='[[ADD BUSINESS MAILING ADDRESS BEFORE SENDING]]';
const slug=t=>t.toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json=n=>JSON.parse(fs.readFileSync(path.join(source,n),'utf8'));
function future(d){
  const i=d.issue-11;
  const date=new Date(Date.UTC(2026,10,13+Math.floor(i/2)*7+(i%2)*4)).toISOString().slice(0,10);
  return {issue:d.issue,title:d.title,slug:slug(d.title),category:d.category,release_date:date,release_time:'09:00',summary:d.lead};
}
const articles=[...json('articles.json').articles,...['issues-11-15.json','issues-16-20.json','issues-21-25.json','issues-26-30.json'].flatMap(n=>json(n).map(future))];
assert.equal(articles.length,30);
assert.equal(new Set(articles.map(a=>a.slug)).size,30);
const params=Object.fromEntries(process.argv.slice(2).filter(a=>a.startsWith('--')).map(a=>a.slice(2).split('=',2)));
const week=params.week||'2026-10-26';
assert(/^\d{4}-\d{2}-\d{2}$/.test(week),'Use --week=YYYY-MM-DD (Monday)');
const dt=new Date(week+'T00:00:00Z');
assert.equal(dt.toISOString().slice(0,10),week);
assert.equal(dt.getUTCDay(),1,'Week start must be Monday');
const weekEnd=new Date(dt.getTime()+6*86400000).toISOString().slice(0,10);
const selected=articles.filter(a=>a.release_date>=week&&a.release_date<=weekEnd).sort((a,b)=>a.release_date.localeCompare(b.release_date));
assert(selected.length>0&&selected.length<=2,'Expect one or two original editorial releases per weekly issue');
const lastRelease=selected[selected.length-1].release_date+' '+selected[selected.length-1].release_time+' America/Chicago';
const display=dt.toLocaleDateString('en-US',{timeZone:'UTC',month:'long',day:'numeric',year:'numeric'});
const subject='The Gravity Report | '+selected.map(a=>a.title.replace(/[?]+$/,'')).join(' + ');
const preheader='Practical restaurant operating questions, evidence to examine, and corrections to verify.';
const preamble='Each week, The Gravity Report examines the operating problems behind restaurant results. Read the complete articles on Gravity and use the questions to test what is happening in your own restaurant.';
const cards=selected.map(a=>({
 issue:a.issue, title:a.title,category:a.category,summary:a.summary,
 url:ORIGIN+'/gravity-report/'+a.slug,date:a.release_date,time:a.release_time
}));
const paragraphs=cards.map(x=>
  '<tr><td style="padding:24px 30px;border-top:1px solid #dcd5ca">'+
  '<div style="font-size:12px;letter-spacing:1.5px;color:#83612e;font-weight:700">'+esc('ISSUE '+String(x.issue).padStart(2,'0')+' · '+x.category)+'</div>'+
  '<h2 style="font:700 23px/1.32 Georgia,serif;color:#142e29;margin:12px 0 10px">'+esc(x.title)+'</h2>'+
  '<p style="font:16px/1.7 Arial,sans-serif;color:#34443f;margin:0 0 15px">'+esc(x.summary)+'</p>'+
  '<a style="font:bold 15px Arial,sans-serif;color:#1b513f;text-decoration:underline" href="'+esc(x.url)+'">Read the complete article →</a>'+
  '</td></tr>'
).join('\n');
const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(subject)+'</title></head>'+
  '<body style="margin:0;padding:0;background:#f2f0eb">'+
  '<div style="display:none;max-height:0;overflow:hidden;color:transparent">'+esc(preheader)+'</div>'+
  '<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#f2f0eb"><tr><td align="center" style="padding:28px 12px">'+
  '<table role="presentation" width="600" style="max-width:600px;width:100%;background:#fffdf8;border:1px solid #dfd6c7" cellpadding="0" cellspacing="0" border="0">'+
  '<tr><td style="background:#132f28;padding:28px 30px;color:#e7dfca">'+
  '<div style="font:bold 12px Arial,sans-serif;letter-spacing:2px;color:#d5bc8b">THE GRAVITY RESTAURANT LEADERSHIP SYSTEM</div>'+
  '<h1 style="font:700 33px/1.18 Georgia,serif;color:#fff;margin:14px 0 6px">The Gravity Report</h1>'+
  '<div style="font:14px Arial,sans-serif;color:#e8e1d2">Weekly briefing · '+esc(display)+' · Written by Thomas Butler</div></td></tr>'+
  '<tr><td style="padding:26px 30px"><p style="font:16px/1.65 Arial,sans-serif;color:#34443f;margin:0">'+esc(preamble)+'</p></td></tr>'+
  paragraphs+
  '<tr><td style="padding:25px 30px;background:#e9e7dd">'+
  '<p style="font:16px/1.55 Georgia,serif;color:#1b342c;margin:0 0 12px"><b>Find the problem. Prove the cause. Correct it. Verify it holds.</b></p>'+
  '<p style="font:14px/1.55 Arial,sans-serif;margin:0"><a href="'+ORIGIN+'/gravity-report" style="color:#1b513f">All Gravity Report articles</a> · <a href="'+ORIGIN+'/start-here" style="color:#1b513f">Explore the Gravity System</a></p></td></tr>'+
  '<tr><td style="padding:25px 30px"><p style="font:12px/1.55 Arial,sans-serif;color:#5b665f;margin:0 0 11px">Sent by The Gravity Report, Thomas Butler · '+REPLY+'. You received this because you requested email updates.</p>'+
  '<p style="font:12px/1.55 Arial,sans-serif;color:#5b665f;margin:0 0 11px">Thomas Monroe Books · '+esc(ADDRESS)+'</p>'+
  '<p style="font:12px Arial,sans-serif;margin:0"><a href="'+UNSUB+'" style="color:#1b513f;text-decoration:underline">Unsubscribe</a></p></td></tr>'+
  '</table></td></tr></table></body></html>';
const plaintext=[
 'THE GRAVITY REPORT','Week of '+display,'From: '+FROM,'Reply-To: '+REPLY,'',
 preamble,'',
 ...cards.flatMap(a=>['ISSUE '+a.issue+' — '+a.category,a.title,a.summary,'Read: '+a.url,'']),
 'Find the problem. Prove the cause. Correct it. Verify it holds.','',
 'More: '+ORIGIN+'/gravity-report',
 'Sender: Thomas Butler, The Gravity Report ('+REPLY+')',
 'Mailing address: '+ADDRESS,
 'Unsubscribe: '+UNSUB
].join('\n');
const out=path.join(ROOT,'build','gravity-report-email',week);
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'weekly.html'),html);
fs.writeFileSync(path.join(out,'weekly.txt'),plaintext);
const manifest={
 kind:'REVIEW DRAFT — NOT SENT',providerTarget:'MailerLite',weekStart:week,weekEnd,sendNotBefore:lastRelease,
 sendFrom:FROM,replyTo:REPLY,subject,preheader,articles:cards,
 requirements:[
  'Use only contacts who specifically opted in to The Gravity Report; verify their addresses and preserve consent proof.',
  'Set up MailerLite sender domain authentication without breaking Google Workspace MX/SPF/DKIM.',
  'Replace physical business mailing address placeholder in content and configure required sender address in provider.',
  'Confirm MailerLite renders {$unsubscribe} as a real per-recipient unsubscribe link and retains one-click unsubscribe headers.',
  'Test delivery in inbox and spam folder before any real recipients are added.',
  'Never send before the final article publication date/time; no automatic sending exists in these files.'
 ],
 messageStatus:'DRAFT ONLY'
};
fs.writeFileSync(path.join(out,'campaign.json'),JSON.stringify(manifest,null,2));
console.log('GRAVITY_REPORT_EMAIL_DRAFT '+JSON.stringify({week,articles:cards.map(x=>x.issue),out,hasUnsubscribe:html.includes(UNSUB),requiresAddress:true,sender:REPLY,subject,status:'NOT SENT'}));
