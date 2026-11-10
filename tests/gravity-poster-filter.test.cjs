'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const script=fs.readFileSync('site/apps/sop-foundry/staff-posters.js','utf8');
const posters=[
 {id:'qa-pizza',title:'Pizza Station Safety',station:'Pizza',category:'Safety',lines:'Wash hands before touching food',revision:'1'},
 {id:'qa-dish',title:'Dish Pit Closing',station:'Dish',category:'Closing',lines:'Wash rinse sanitize',revision:'1'},
 {id:'qa-bar',title:'Bar Opening Reminder',station:'Bar',category:'Opening',lines:'Count drawer and supplies',revision:'1'},
];

async function runClient({hash='',homeStation=''}={}){
 const elems=new Map(),events={};
 const $=id=>{
  if(!elems.has(id))elems.set(id,{
   value:id==='station'?'All stations':'',innerHTML:'',textContent:'',hidden:true,
   append(){},querySelectorAll(){return[]},onclick:null,oninput:null,onchange:null
  });
  return elems.get(id);
 };
 const location={hash,search:'',href:'/apps/sop-foundry/staff-posters.html'};
 const track=[];
 const window={
  gravityEmployee:{getProfile(){return{homeStation}},track(...args){track.push(args)}},
  addEventListener(name,fn){events[name]=fn},
  print(){}
 };
 const fetch=async url=>({
  ok:true,status:200,
  json:async()=>url.includes('published-posters')?{posters,canBuild:false}:{data:{sops:[]}}
 });
 vm.runInNewContext(script,{
  document:{getElementById:$},window,location,fetch,URLSearchParams,
  Option:function(name,value){return{name,value}},
  setTimeout(){return 1},clearTimeout(){},console:{log(){},warn(){},error(){}}
 },{timeout:2000});
 // The source calls loadPosters asynchronously. Flush its fetch promises.
 await new Promise(resolve=>setImmediate(resolve));
 return {$,events,location,track};
}

test('Search updates displayed instructions and clears them when there is no matching poster',async()=>{
 const c=await runClient();
 assert.match(c.$('detail').innerHTML,/Pizza Station Safety/);
 c.$('search').value='Dish';
 c.$('search').oninput();
 assert.match(c.$('list').innerHTML,/Dish Pit Closing/);
 assert.match(c.$('detail').innerHTML,/Dish Pit Closing/);
 assert.doesNotMatch(c.$('detail').innerHTML,/Wash hands before touching food/);
 c.$('search').value='no-matching-poster-qa';
 c.$('search').oninput();
 assert.match(c.$('list').innerHTML,/No active posters match/);
 assert.match(c.$('detail').innerHTML,/No poster selected/);
 assert.doesNotMatch(c.$('detail').innerHTML,/Dish Pit Closing/);
 c.$('search').value='';
 c.$('search').oninput();
 assert.match(c.$('detail').innerHTML,/Pizza Station Safety/);
});

test('Station changes do not leave instructions from the previous station visible',async()=>{
 const c=await runClient();
 c.$('station').value='Bar';
 c.$('station').onchange();
 assert.match(c.$('detail').innerHTML,/Bar Opening Reminder/);
 assert.doesNotMatch(c.$('detail').innerHTML,/Pizza Station Safety/);
 c.$('station').value='Dish';
 c.$('station').onchange();
 assert.match(c.$('detail').innerHTML,/Dish Pit Closing/);
 c.$('search').value='Pizza';
 c.$('search').oninput();
 assert.match(c.$('detail').innerHTML,/No poster selected/);
 c.$('station').value='All stations';
 c.$('station').onchange();
 assert.match(c.$('detail').innerHTML,/Pizza Station Safety/);
 assert.equal(c.$('buildLink').hidden,true,'Employee must not see Build Room navigation');
});

test('Poster deep links remain supported, but a conflicting station filter takes precedence',async()=>{
 const c=await runClient({hash:'#qa-dish'});
 assert.match(c.$('detail').innerHTML,/Dish Pit Closing/);
 c.$('station').value='Bar';
 c.$('station').onchange();
 assert.match(c.$('detail').innerHTML,/Bar Opening Reminder/);
 assert.doesNotMatch(c.$('detail').innerHTML,/Dish Pit Closing/);
 c.location.hash='#qa-pizza';
 c.$('station').value='All stations';
 c.events.hashchange();
 assert.match(c.$('detail').innerHTML,/Pizza Station Safety/);
});
