(()=>{'use strict';
// Work Study expert panels are intentionally reactive. Guided startup can cause several
// independent expert layers to redraw the same DOM in response to one click. Suspending
// only the observer currently delivering is not enough: observer A can wake observer B,
// which can wake A again indefinitely. This guard creates one delivery window for the
// complete Work Study observer cohort. While any observer callback redraws the page, every
// wrapped observer is disconnected; records caused by that redraw are discarded, then the
// observers are reattached to their requested targets. User/browser mutations that happen
// after the redraw continue to be observed normally.
const Native=window.MutationObserver;
if(!Native||window.__gravityWorkStudySafeMutationObserver)return;

const registry=new Set();
const state={delivering:false,callbackCount:0,skippedCallbacks:0,lastDeliveryAt:0};

class SafeMutationObserver{
 constructor(callback){
  if(typeof callback!=='function')throw new TypeError('MutationObserver callback must be a function');
  this.callback=callback;
  this.targets=new Map();
  this.suspended=false;
  this.native=new Native((records)=>this.deliver(records));
  registry.add(this);
 }
 observe(target,options){
  this.targets.set(target,options);
  if(!this.suspended)this.native.observe(target,options);
 }
 disconnect(){
  this.native.disconnect();
  this.targets.clear();
 }
 takeRecords(){return this.native.takeRecords();}
 suspend(){
  this.native.takeRecords();
  this.native.disconnect();
  this.suspended=true;
 }
 resume(){
  if(!this.suspended)return;
  this.suspended=false;
  for(const [target,options] of this.targets)this.native.observe(target,options);
 }
 deliver(records){
  if(!records||!records.length)return;
  if(state.delivering){
   state.skippedCallbacks++;
   this.native.takeRecords();
   return;
  }
  state.delivering=true;
  state.callbackCount++;
  state.lastDeliveryAt=Date.now();
  const cohort=Array.from(registry);
  for(const observer of cohort)observer.suspend();
  try{
   this.callback(records,this);
  }finally{
   // Drop mutations caused by expert redraws before observers are made live again.
   for(const observer of cohort)observer.native.takeRecords();
   state.delivering=false;
   for(const observer of cohort)observer.resume();
  }
 }
}

window.MutationObserver=SafeMutationObserver;
window.__gravityWorkStudySafeMutationObserver=true;
window.__gravityWorkStudyMutationGuardState=state;
document.documentElement.dataset.gravityGuidedMutationGuard='v62-global-cohort';
})();
