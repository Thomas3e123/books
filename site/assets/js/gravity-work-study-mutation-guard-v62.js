(()=>{'use strict';
// Work Study expert panels are intentionally reactive. This guard prevents an expert panel
// from immediately re-triggering its own MutationObserver while it redraws itself.
const Native=window.MutationObserver;if(!Native||window.__gravityWorkStudySafeMutationObserver)return;
class SafeMutationObserver{
 constructor(callback){this.callback=callback;this.targets=[];this.running=false;this.pending=false;this.native=new Native((records,observer)=>this.deliver(records,observer))}
 observe(target,options){this.targets.push([target,options]);this.native.observe(target,options)}
 disconnect(){this.native.disconnect();this.targets=[]}
 takeRecords(){return this.native.takeRecords()}
 reconnect(){for(const [target,options] of this.targets)this.native.observe(target,options)}
 deliver(records,observer){if(this.running){this.pending=true;return}this.running=true;const targets=[...this.targets];this.native.disconnect();try{this.callback(records,this)}finally{this.running=false;this.targets=targets;this.reconnect();if(this.pending){this.pending=false;queueMicrotask(()=>{const next=this.native.takeRecords();if(next.length)this.deliver(next,this)})}}}
}
window.MutationObserver=SafeMutationObserver;window.__gravityWorkStudySafeMutationObserver=true;
})();
