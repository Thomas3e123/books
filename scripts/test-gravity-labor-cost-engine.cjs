'use strict';
const assert=require('node:assert/strict');
const cost=require('../site/assets/js/gravity-labor-cost-engine.js');
const approx=(a,b)=>assert(Math.abs(a-b)<0.00001,String(a)+' vs '+String(b));
function checks(){
  let a=cost.projected({hourlyWages:1500,salaryAllocation:400,forecastSales:10000,targetPercent:25});
  approx(a.total,1900);approx(a.laborPercent,19);approx(a.budgetDollars,2500);
  assert.equal(a.burdenConfigured,false);approx(a.employerBurden,0);
  let b=cost.projected({hourlyWages:1500,salaryAllocation:400,hourlyBurdenPercent:'15',
     forecastSales:10000,targetPercent:25});
  approx(b.employerBurden,225);approx(b.total,2125);approx(b.laborPercent,21.25);
  approx(b.budgetVariance,-375);
  approx(cost.projected({hourlyWages:1000,salaryAllocation:0,hourlyBurdenPercent:'0'}).total,1000);
  approx(cost.illustrativeHours({forecastSales:35000,targetPercent:30,salaryAllocation:2000,baseHourlyRate:15,hourlyBurdenPercent:15}),8500/17.25);
  assert.equal(cost.illustrativeHours({forecastSales:35000,targetPercent:30,salaryAllocation:2000,baseHourlyRate:15}),null);
  for(const value of ['-1','101','foo','Infinity'])assert.throws(()=>cost.projected({hourlyWages:1,hourlyBurdenPercent:value}));
  assert.throws(()=>cost.projected({hourlyWages:-1}));
  assert.throws(()=>cost.projected({hourlyWages:1,targetPercent:120}));
  // Salary doesn't receive optional hourly-only burden a second time.
  approx(cost.projected({hourlyWages:0,salaryAllocation:2000,hourlyBurdenPercent:15}).total,2000);
  console.log('PASS: 13 Gravity labor math scenarios — default backward compatibility, burden, salary, target and validation');
}
checks();
