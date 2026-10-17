(()=>{'use strict';
// Work Study has many expert panels watching the same application DOM. A single user
// action can replace the Work Study screen, which wakes many observers at once. If those
// observers render independently, their own markup can wake other observers and create a
// redraw storm. This wrapper batches every observer awakened by the same DOM change into
// one delivery window. The complete cohort is disconnected while expert callbacks render,
// so expert markup cannot recursively trigger another expert pass.
const Native=window.MutationObserver;
if(!Native||window.__gravityWorkStudySafeMutationObserver)return;

const registry=new Set();
const pending=new Map();
const state={delivering:false,callbackCount:0,batchCount:0,skippedCallbacks:0,lastDeliveryAt:0};
let flushTimer=null;

function queue(observer,records){
 if(!records||!records.length)return;
 const prior=pending.get(observer)||[];
 prior.push(...records);
 pending.set(observer,prior);
 if(flushTimer===null)flushTimer=setTimeout(flush,0);
}

function flush(){
 flushTimer=null;
 if(state.delivering){
  if(pending.size&&flushTimer===null)flushTimer=setTimeout(flush,0);
  return;
 }
 if(!pending.size)return;
 const deliveries=Array.from(pending.entries());
 pending.clear();
 const cohort=Array.from(registry);
 state.delivering=true;
 state.batchCount++;
 state.lastDeliveryAt=Date.now();
 for(const observer of cohort)observer.suspend();
 try{
  for(const [observer,records] of deliveries){
   if(!registry.has(observer)||!records.length)continue;
   state.callbackCount++;
   try{observer.callback(records,observer)}catch(err){setTimeout(()=>{throw err},0)}
  }
 }finally{
  // Expert callbacks may replace or add large DOM sections. Those mutations happened
  // while the native observers were disconnected, so they do not create another pass.
  for(const observer of cohort)observer.native.takeRecords();
  state.delivering=false;
  for(const observer of cohort)observer.resume();
  if(pending.size&&flushTimer===null)flushTimer=setTimeout(flush,0);
 }
}

class SafeMutationObserver{
 constructor(callback){
  if(typeof callback!=='function')throw new TypeError('MutationObserver callback must be a function');
  this.callback=callback;
  this.targets=new Map();
  this.suspended=false;
  this.native=new Native(records=>queue(this,records));
  registry.add(this);
 }
 observe(target,options){
  this.targets.set(target,options);
  if(!this.suspended)this.native.observe(target,options);
 }
 disconnect(){
  this.native.disconnect();
  this.targets.clear();
  pending.delete(this);
  registry.delete(this);
 }
 takeRecords(){
  const queued=pending.get(this)||[];
  pending.delete(this);
  return queued.concat(this.native.takeRecords());
 }
 suspend(){
  const records=this.native.takeRecords();
  if(records.length)queue(this,records);
  this.native.disconnect();
  this.suspended=true;
 }
 resume(){
  if(!this.suspended)return;
  this.suspended=false;
  for(const [target,options] of this.targets)this.native.observe(target,options);
 }
 deliver(records){queue(this,records)}
}

window.MutationObserver=SafeMutationObserver;
window.__gravityWorkStudySafeMutationObserver=true;
window.__gravityWorkStudyMutationGuardState=state;
document.documentElement.dataset.gravityGuidedMutationGuard='v62-global-cohort';
})();
