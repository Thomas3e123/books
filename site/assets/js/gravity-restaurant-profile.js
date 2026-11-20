(()=>{
 'use strict';
 const KEY='gravityAssistRestaurantProfileV1';
 const $=id=>document.getElementById(id);
 let profile={name:'',store:'',city:'',state:''};
 try{profile=Object.assign(profile,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){}
 function textLoc(){return [profile.city,profile.state].filter(Boolean).join(', ')}
 function status(){let bits=[profile.name,profile.store?('Store '+profile.store):'',textLoc()].filter(Boolean);$('ga-profile-status').textContent=bits.length?('Active: '+bits.join(' · ')):'Set it once. Gravity Assist can carry the restaurant and location into supported workspaces.'}
 function load(){if(!$('ga-prof-name'))return;$('ga-prof-name').value=profile.name||'';$('ga-prof-store').value=profile.store||'';$('ga-prof-city').value=profile.city||'';$('ga-prof-state').value=profile.state||'';status()}
 let statusTimer;
 function save(){
   const next={name:$('ga-prof-name').value.trim(),store:$('ga-prof-store').value.trim(),city:$('ga-prof-city').value.trim(),state:$('ga-prof-state').value.trim()};
   clearTimeout(statusTimer);
   try{
     const value=JSON.stringify(next);
     localStorage.setItem(KEY,value);
     if(localStorage.getItem(KEY)!==value)throw Error();
   }catch(e){
     $('ga-profile-status').textContent='Could not save the profile in this browser. Your entries are still here. Try Save profile again.';
     return;
   }
   profile=next;apply(true);$('ga-profile-fields').classList.add('ga-hidden');
 }
 function setIf(id,val,force){let el=$(id);if(el&&val&&(force||!String(el.value||'').trim())){el.value=val;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}}
 function apply(force){let loc=[profile.city,profile.state].filter(Boolean).join(', ');let storeLoc=profile.store?('Store '+profile.store):'';
   setIf('cust-restaurant',profile.name,force); setIf('cust-location',[storeLoc,loc].filter(Boolean).join(' · '),force);
   setIf('studio-restaurant',profile.name,force); setIf('studio-location',storeLoc,force); if(loc)setIf('studio-address',loc,false);
   setIf('lab-restaurant',profile.name,force); setIf('lab-store',storeLoc||profile.store,force);
   setIf('ws-restaurant',profile.name,force); setIf('ws-store',storeLoc||profile.store,force);
   setIf('pf-restaurantName',profile.name,force); setIf('pf-storeNumber',profile.store,force); setIf('pf-location',loc,force);
   if(force && $('ga-profile-status')){$('ga-profile-status').textContent=(profile.name||profile.store||loc)?('Applied to this workspace · '+[profile.name,storeLoc,loc].filter(Boolean).join(' · ')):'Profile is blank.';statusTimer=setTimeout(status,1800)}
 }
 $('ga-profile-edit')?.addEventListener('click',()=>{$('ga-profile-fields').classList.toggle('ga-hidden')});
 $('ga-profile-save')?.addEventListener('click',save); $('ga-profile-apply')?.addEventListener('click',()=>apply(true));
 $('ga-profile-clear')?.addEventListener('click',()=>{
   clearTimeout(statusTimer);
   try{
     localStorage.removeItem(KEY);
     if(localStorage.getItem(KEY)!==null)throw Error();
   }catch(e){$('ga-profile-status').textContent='Could not confirm that this browser cleared the profile. Try Clear again.';return}
   profile={name:'',store:'',city:'',state:''};load();
   $('ga-profile-status').textContent='Profile cleared from this browser.';
 });
 load(); apply(false);
})();
