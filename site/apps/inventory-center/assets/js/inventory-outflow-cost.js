/* Optional categorization and cost-at-posting estimates for Gravity Inventory Center.
   Outflow values are logged cost estimates, not proof of theft or an exact causal diagnosis. */
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.GravityInventoryOutflow=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  var lossTypes=Object.freeze(['waste','spill','spoilage','damage','comp']);
  var codes=Object.freeze(['EXP','OVER','PREP','DROP','MIST','TRAIN','QUALITY','VEND','OTHER']);
  function isLossType(type){return lossTypes.indexOf(String(type||''))>=0;}
  function normalizeReasonCode(code){
    var value=String(code||'').toUpperCase().trim();
    return codes.indexOf(value)>=0?value:'';
  }
  function movementOutflowValue(m){
    if(!m||!isLossType(m.type)||m.unitCost==null||m.unitCost==='')return null;
    var qty=Number(m.qty),cost=Number(m.unitCost);
    if(!Number.isFinite(qty)||qty<0||!Number.isFinite(cost)||cost<0)return null;
    return Math.round((qty*cost+Number.EPSILON)*100)/100;
  }
  return Object.freeze({isLossType:isLossType,normalizeReasonCode:normalizeReasonCode,movementOutflowValue:movementOutflowValue});
});
