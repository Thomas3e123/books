/* Gravity Report: practical reading controls and an accessible article catalog.
   No tracking, no external libraries, and no future-article links before release. */
(function(){
'use strict';
function $(s,root){return (root||document).querySelector(s)}
function all(s,root){return Array.from((root||document).querySelectorAll(s))}
function node(tag,cls,txt){var el=document.createElement(tag);if(cls)el.className=cls;if(txt!=null)el.textContent=txt;return el}
function socialPost(title,summary,url){
 var plain=String(summary||'').replace(/\s+/g,' ').trim();
 if(plain.length>360){plain=plain.slice(0,356);plain=plain.slice(0,Math.max(240,plain.lastIndexOf(' ')))+'…'}
 return 'A restaurant management question worth examining:\n\n'+title+'\n\n'+plain+'\n\nRead the full article on Gravity:\n'+url+'\n\nThe Gravity Report · By Thomas Butler · Published by Thomas Monroe Books';
}
function fullArticleText(title,url){
 var body=$('.report-content .report-body');if(!body)return '';
 var date=$('.report-byline time');
 var parts=[title,'By Thomas Butler · Published and edited by Thomas Monroe Books'+(date?' · '+date.textContent:''),''];
 all('h2,p,li,blockquote',body).forEach(function(el){var t=el.textContent.trim();if(t)parts.push(t,'')});
 parts.push('Original article: '+url,'The Gravity Report | gravityleadershipsystem.com');
 return parts.join('\n').trim();
}
async function clipboardText(txt){
 if(navigator.clipboard&&navigator.clipboard.writeText){
  try{await navigator.clipboard.writeText(txt);return true}catch(_){}
 }
 var t=document.createElement('textarea');
 t.value=txt;t.setAttribute('readonly','');t.style.position='fixed';t.style.top='-3000px';t.style.left='-3000px';
 document.body.appendChild(t);t.focus();t.select();
 var ok=false;try{ok=document.execCommand('copy')}catch(_){}
 t.remove();return ok;
}
function shareActions(){
 if(typeof navigator.share==='function')all('[data-report-share="native"]').forEach(function(el){el.hidden=false});
 document.addEventListener('click',async function(event){
  var btn=event.target.closest('[data-report-share]');if(!btn)return;
  var root=btn.closest('[data-report-url]');if(!root)return;
  var kind=btn.getAttribute('data-report-share');
  var title=root.getAttribute('data-report-title')||'The Gravity Report';
  var summary=root.getAttribute('data-report-summary')||'';
  var url=root.getAttribute('data-report-url')||location.href;
  var status=$('.report-share-status',root);
  function say(message){if(status)status.textContent=message}
  if(kind==='native'){
   if(typeof navigator.share!=='function')return;
   try{await navigator.share({title:title,text:summary,url:url});say('Share sheet opened.')}catch(e){if(e.name!=='AbortError')say('Sharing unavailable. Use Copy link or Copy social post instead.')}
   return;
  }
  var value=kind==='post'?socialPost(title,summary,url):kind==='full'?fullArticleText(title,url):kind==='link'?url:'';
  if(!value)return;
  var original=btn.textContent;btn.disabled=true;
  try{
   if(await clipboardText(value)){
    say(kind==='post'?'Social post copied. Paste into Facebook, Instagram, Threads, LinkedIn, X or another platform and edit as you like.':kind==='full'?'Article text copied with attribution and the original Gravity link.':'Gravity article link copied.');
    btn.textContent='Copied ✓';
    setTimeout(function(){btn.textContent=original},1900);
   }else{
    window.prompt('Select and copy this text:',value);
    say('Automatic copying is unavailable. Select and copy the text in the dialog.');
   }
  }finally{btn.disabled=false}
 });
}
function article(){
 var body=$('.report-content .report-body'),content=$('.report-content');if(!body||!content)return;
 var controls=$('.report-reader-controls'),size=19,base=window.matchMedia('(max-width:600px)').matches?18:19;
 try{var saved=Number(localStorage.getItem('gravityReportTextSize'));if(Number.isFinite(saved)&&saved>=16&&saved<=26)size=saved;else size=base}catch(_){size=base}
 function apply(){content.style.setProperty('--gr-text-size',size+'px');if(controls){var label=$('.report-size-status',controls);if(label)label.textContent='Text '+size+'px'}}
 apply();
 if(controls){
  var buttons=all('button[data-report-font]',controls);
  buttons.forEach(function(btn){btn.addEventListener('click',function(){
   var mode=btn.getAttribute('data-report-font');
   size=mode==='reset'?base:Math.max(16,Math.min(26,size+(mode==='increase'?2:-2)));
   apply();try{localStorage.setItem('gravityReportTextSize',String(size))}catch(_){}
  })});
  var print=$('.report-print',controls);if(print)print.addEventListener('click',function(){window.print()});
 }
 var headings=all('h2',body),toc=$('.report-toc'),tocList=$('ol',toc);
 if(toc&&tocList&&headings.length){
  headings.forEach(function(h,i){
   var id='report-section-'+(i+1);
   h.id=id;
   var li=node('li'),a=node('a',null,h.textContent);
   a.href='#'+id;li.appendChild(a);tocList.appendChild(li);
  });
 }else if(toc){toc.hidden=true}
 var progress=$('.report-reading-progress');
 if(progress){
  var scheduled=false;
  function update(){scheduled=false;var top=body.getBoundingClientRect().top+window.scrollY;var length=Math.max(1,body.scrollHeight-window.innerHeight*.55);var val=Math.max(0,Math.min(100,((window.scrollY-top)/length)*100));progress.style.width=val+'%';}
  function queue(){if(!scheduled){scheduled=true;requestAnimationFrame(update)}}
  window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue);queue();
 }
}
function catalog(){
 var host=$('[data-report-cards]');if(!host)return;
 var cards=all('.report-card[data-report-issue]',host);
 var availability=$('#report-availability'),input=$('#report-search'),count=$('#report-search-count');
 var liveHeading=$('.report-available-heading'),future=$('.report-upcoming-group'),futureList=$('[data-report-upcoming]');
 var futureSummary=$('.report-upcoming-count'),empty=$('.report-search-empty');
 if(!future||!futureList)return;
 function addLink(card,a){
 var action=$('[data-report-action]',card);if(!action)return;action.textContent='';
 var href='/gravity-report/'+encodeURIComponent(a.slug),url='https://gravityleadershipsystem.com'+href;
 action.setAttribute('data-report-url',url);
 action.setAttribute('data-report-title',a.title);
 action.setAttribute('data-report-summary',a.summary||'');
 var link=node('a',null,'Read full article →');link.href=href;action.appendChild(link);
 var tools=node('div','report-card-share');
 var copy=node('button',null,'Copy social post');copy.type='button';copy.setAttribute('data-report-share','post');
 tools.appendChild(copy);
 function shareAnchor(label,target){
  var buttonLink=node('a',null,label);buttonLink.href=target;
  if(target.slice(0,7)!=='mailto:'){buttonLink.target='_blank';buttonLink.rel='noopener noreferrer'}
  buttonLink.setAttribute('aria-label','Share '+a.title+' on '+label.replace(' ↗','')+(buttonLink.target?' (opens new tab)':''));
  tools.appendChild(buttonLink);
 }
 shareAnchor('Facebook ↗','https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url));
 shareAnchor('X ↗','https://x.com/intent/tweet?text='+encodeURIComponent(a.title+' — The Gravity Report')+'&url='+encodeURIComponent(url));
 shareAnchor('LinkedIn ↗','https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent(url));
 var more=node('details','report-card-more'),sum=node('summary',null,'More');
 more.appendChild(sum);
 var links=node('div','report-card-more-links');
 function secondary(label,url){var a=node('a',null,label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label','Share on '+label+' (opens new tab)');links.appendChild(a)}
 secondary('WhatsApp','https://api.whatsapp.com/send?text='+encodeURIComponent(a.title+'\n'+url));
 secondary('Reddit','https://www.reddit.com/submit?url='+encodeURIComponent(url)+'&title='+encodeURIComponent(a.title));
 var email=node('a',null,'Email');
 email.href='mailto:?subject='+encodeURIComponent(a.title+' | The Gravity Report')+'&body='+encodeURIComponent('Read this article from Gravity:\n'+url);
 links.appendChild(email);more.appendChild(links);tools.appendChild(more);
 action.appendChild(tools);
 var status=node('span','report-share-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');action.appendChild(status);
}
 function setCard(card,a){
  var state=$('[data-report-state]',card);
  if(a.released){if(state)state.textContent='Published '+a.release_date;addLink(card,a);host.appendChild(card)}
  else{if(state)state.textContent='Scheduled for '+a.release_date;var action=$('[data-report-action]',card);if(action)action.textContent='';futureList.appendChild(card)}
 }
 function filter(){
  var q=(input&&input.value||'').trim().toLowerCase();var shown=0,hiddenFuture=0;
  cards.forEach(function(card){var found=card.textContent.toLowerCase().includes(q);card.hidden=!found;if(found){shown++;if(card.parentNode===futureList)hiddenFuture++}});
  if(future){future.hidden=Boolean(q)&&hiddenFuture===0;if(q&&hiddenFuture>0)future.open=true}
  if(empty){empty.hidden=shown!==0}
  if(count)count.textContent=shown+' issue'+(shown===1?'':'s')+(q?' match your search.':' in the series.');
 }
 function group(schedule){
  var byIssue=new Map(schedule.map(function(a){return [Number(a.issue),a]}));
  cards.forEach(function(card){var id=Number(card.getAttribute('data-report-issue')),a=byIssue.get(id);if(a)setCard(card,a)});
  var released=schedule.filter(function(a){return a.released}).length;
  var forthcoming=schedule.length-released;
  if(liveHeading)liveHeading.textContent='Read now · '+released+' published article'+(released===1?'':'s');
  if(futureSummary)futureSummary.textContent='Upcoming issues · '+forthcoming+' scheduled';
  future.hidden=forthcoming===0;
  if(availability)availability.textContent=released+' published article'+(released===1?'':'s')+' available. New issues open on their scheduled release dates.';
  filter();
 }
 // Render five prelinked articles without JS; fetch controls the actual publication gate.
 fetch('/gravity-report/articles.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw Error('Issue list unavailable');return r.json()}).then(function(d){
  if(!Array.isArray(d.articles)||d.articles.length!==cards.length)throw Error('Issue list incomplete');
  group(d.articles);
 }).catch(function(){
  if(availability)availability.textContent='Current issue schedule could not be loaded. Published articles remain linked below; try again shortly.';
  if(liveHeading)liveHeading.textContent='Browse all issues';
  if(future)future.hidden=true;
  if(count)count.textContent='Search the available issue titles.';
  cards.forEach(function(c){c.hidden=false});
 });
 if(input)input.addEventListener('input',filter);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
function start(){shareActions();article();catalog()}
})();
