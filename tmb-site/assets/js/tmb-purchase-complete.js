(()=>{'use strict';
const output=document.getElementById('tmb-confirmation'),link=document.getElementById('tmb-download-link'),retry=document.getElementById('tmb-verify-again');
const url=new URL(location.href),book=url.searchParams.get('id');
const orderId=url.searchParams.get('orderId')||url.searchParams.get('order_id')||url.searchParams.get('order_id')||url.searchParams.get('referenceId')||(()=>{try{return sessionStorage.getItem('tmb-checkout-'+book)}catch{return null}})();
if(!/^[a-z0-9-]{4,60}$/.test(book||'')||!orderId||!/^[A-Za-z0-9_-]{12,120}$/.test(orderId)){
 output.textContent='No valid checkout receipt was found. Return to the catalog or contact us with your Square receipt. Do not make another payment.';
 retry.hidden=true;
 return;
}
let pending=false;
async function verify(){
 if(pending)return;
 pending=true;retry.disabled=true;
 output.textContent='Verifying payment directly with Square. Please do not pay again.';
 link.hidden=true;
 try{
  const response=await fetch('/api/tmb-book-store',{method:'POST',cache:'no-store',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'verify',id:book,orderId})});
  const data=await response.json();
  if(!response.ok||!data.ready)throw new Error(data.error||'The payment was not confirmed.');
  output.textContent='Payment verified. Your PDF download is ready. Keep your Square receipt for your records.';
  link.href=data.downloadUrl;
  link.download='';
  link.textContent='Download '+data.title+' — complete PDF';
  link.hidden=false;
  retry.hidden=true;
 }catch(err){
  output.textContent=(err.message||'Payment verification failed.')+' You can retry verification here without paying again.';
  retry.hidden=false;
 }finally{pending=false;retry.disabled=false}
}
retry.addEventListener('click',verify);
verify();
})();
