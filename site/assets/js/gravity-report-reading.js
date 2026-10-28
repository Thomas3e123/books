/* Gravity Report: practical reading controls and an accessible article catalog.
   No tracking, no external libraries, and no future-article links before release. */
(function(){
'use strict';
function $(s,root){return (root||document).querySelector(s)}
function all(s,root){return Array.from((root||document).querySelectorAll(s))}
function node(tag,cls,txt){var el=document.createElement(tag);if(cls)el.className=cls;if(txt!=null)el.textContent=txt;return el}
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
 function addLink(card,a){var action=$('[data-report-action]',card);if(!action)return;action.textContent='';var link=node('a',null,'Read full article →');link.href='/gravity-report/'+encodeURIComponent(a.slug);action.appendChild(link)}
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
function start(){article();catalog()}
})();
