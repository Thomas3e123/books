(()=>{'use strict';
const endpoint='/api/tmb-book-store';
const status=document.getElementById('tmb-store-status');
const buttons=[...document.querySelectorAll('button.tmb-purchase')];
async function call(payload){
 const resp=await fetch(endpoint,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),cache:'no-store'});
 let data={};try{data=await resp.json()}catch{}
 if(!resp.ok)throw new Error(data.error||'The checkout service is unavailable. No payment has been taken.');
 return data;
}
async function boot(){
 if(!buttons.length)return;
 try{
   const result=await fetch(endpoint+'?action=status',{cache:'no-store',credentials:'same-origin'});
   const data=await result.json();
   if(!data.live){status.textContent='Paid purchasing is not yet enabled. You can read samples here and download full editions free on Gravity.';return}
   buttons.forEach(btn=>btn.disabled=false);
   status.textContent='Secure Square checkout is available. Files are unlocked only after payment verification. The identical PDFs remain free on Gravity during the Founding Year.';
 }catch{status.textContent='Paid purchasing is temporarily unavailable. Samples remain available, and full books are free on Gravity.'}
}
for(const btn of buttons)btn.addEventListener('click',async()=>{
 if(btn.disabled)return;
 btn.disabled=true;
 const original=btn.textContent;
 btn.textContent='Opening secure checkout…';
 try{
   const result=await call({action:'checkout',id:btn.dataset.book});
   if(!/^https:\/\/(?:square\.link|checkout\.square\.site)\//.test(result.url))throw new Error('The payment link could not be verified.');
   try{sessionStorage.setItem('tmb-checkout-'+btn.dataset.book,result.orderId||'')}catch{}
   location.assign(result.url);
 }catch(err){
   btn.disabled=false;
   btn.textContent=original;
   status.textContent=err.message;
 }
});
boot();
})();
