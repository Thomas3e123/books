/* Gravity Shift Lab: scenario-based LABOR COST estimate. Does not calculate legal payroll or guarantee staffing budgets. */
(function(root,factory){
  var api=factory();
  if(typeof module==='object' && module.exports) module.exports=api;
  else root.GravityLaborCostEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function nonNegative(n,label){
    var v=Number(n);
    if(!Number.isFinite(v)||v<0)throw Error(label+' must be a non-negative finite number');
    return v;
  }
  function burdenPercent(raw){
    if(raw==null||String(raw).trim()==='')return null;
    var n=nonNegative(raw,'Employer burden percentage');
    if(n>100)throw Error('Employer burden percentage must be between 0 and 100');
    return n;
  }
  function projected(input){
    input=input||{};
    var hourlyWages=nonNegative(input.hourlyWages||0,'Scheduled hourly wages');
    var salaryAllocation=nonNegative(input.salaryAllocation||0,'Salaried allocation');
    var configured=burdenPercent(input.hourlyBurdenPercent);
    // Blank input preserves existing base-wages behavior, never invents an assumed payroll burden.
    var burden=hourlyWages*((configured==null?0:configured)/100);
    var total=hourlyWages+burden+salaryAllocation;
    var sales=input.forecastSales==null||input.forecastSales===''?null:nonNegative(input.forecastSales,'Sales forecast');
    var target=input.targetPercent==null||input.targetPercent===''?null:nonNegative(input.targetPercent,'Labor target');
    if(target!==null&&target>100)throw Error('Labor target must be between 0 and 100 percent');
    var budget=(sales!==null&&target!==null)?sales*target/100:null;
    return {
      hourlyWages:hourlyWages,employerBurden:burden,salaryAllocation:salaryAllocation,
      total:total,burdenPercent:configured,burdenConfigured:configured!==null,
      salesForecast:sales,targetPercent:target,
      laborPercent:sales>0?total/sales*100:null,
      budgetDollars:budget,budgetVariance:budget===null?null:total-budget
    };
  }
  function illustrativeHours(input){
    // Illustration only: all planned hourly work at ONE blended loaded rate,
    // no weekly OT / unpaid breaks / actual wage mix / coverage constraints.
    input=input||{};
    var rate=nonNegative(input.baseHourlyRate||0,'Blended hourly wage');
    var burden=burdenPercent(input.hourlyBurdenPercent);
    var base=projected({salaryAllocation:input.salaryAllocation,
      forecastSales:input.forecastSales,targetPercent:input.targetPercent,hourlyBurdenPercent:input.hourlyBurdenPercent});
    if(rate<=0||base.budgetDollars===null||burden===null)return null;
    return Math.max(0,base.budgetDollars-base.salaryAllocation)/(rate*(1+burden/100));
  }
  return Object.freeze({projected:projected,illustrativeHours:illustrativeHours});
});
