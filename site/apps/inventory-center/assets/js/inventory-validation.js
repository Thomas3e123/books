/* Shared by the application and the reproducible backup-validation tests. */
(function(root){
'use strict';
function validateState(s){
 const fail=(p)=>{throw new Error('Invalid inventory data: '+p)};
 const obj=(v,p)=>{if(!v||typeof v!=='object'||Array.isArray(v))fail(p+' must be an object')};
 const text=(v,p,required=false)=>{if(typeof v!=='string'||v.length>10000||(required&&!v.trim()))fail(p+' must be valid text')};
 const number=(v,p,min=0,max=1e9)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)fail(p+' is outside its numeric limits')};
 const date=(v,p)=>{if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)fail(p+' must be a real date')};
 const stamp=(v,p)=>{if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(v)||!Number.isFinite(Date.parse(v)))fail(p+' must be a timestamp');date(v.slice(0,10),p)};
 obj(s,'state');if(s.schemaVersion!==1)fail('unsupported schema version');
 obj(s.profile,'profile');for(const k of ['restaurant','store','city','state'])text(s.profile[k],'profile.'+k);
 stamp(s.createdAt,'createdAt');stamp(s.updatedAt,'updatedAt');
 const all=new Set();
 if(s.sales===undefined)s.sales=[];for(const k of ['locations','items','movements','costHistory','counts','sales']){
  if(!Array.isArray(s[k])||s[k].length>100000)fail(k+' must be a bounded array');
  for(const v of s[k]){obj(v,k);if(typeof v.id!=='string'||! /^[A-Za-z0-9_-]{1,100}$/.test(v.id)||all.has(v.id))fail(k+' has an unsafe or duplicate ID');all.add(v.id)}
 }
 const locs=new Set(s.locations.map(l=>l.id)),items=new Set(s.items.map(i=>i.id));
 const ref=(v,set,p,optional=false)=>{if(optional&&v==='')return;if(!set.has(v))fail(p+' references a missing record')};
 const names=new Set(),barcodes=new Set();
 for(const l of s.locations){text(l.name,'location name',true);const n=l.name.trim().toLowerCase();if(names.has(n))fail('duplicate location name');names.add(n);number(l.routeOrder,'route order',1);if(!Number.isInteger(l.routeOrder))fail('route order must be a whole number');text(l.area,'location area');text(l.notes,'location notes')}
 for(const i of s.items){for(const k of ['name','category','vendor','sku','barcode','unit'])text(i[k],'item '+k,['name','unit'].includes(k));
  if(typeof i.active!=='boolean')fail('active must be boolean');
  for(const k of ['casePack','cost','par','reorder'])number(i[k],k);number(i.yieldPct,'yield',0,100);
  if(i.barcode){const b=i.barcode.toUpperCase();if(!/^[0-9A-Z.\- $/+%]+$/.test(b)||barcodes.has(b))fail('invalid or duplicate barcode');barcodes.add(b)}
  ref(i.primaryLocation,locs,'primary location',true);obj(i.balances,'balances');for(const [id,v] of Object.entries(i.balances)){ref(id,locs,'balance location');number(v,'balance')}
 }
 const types=['opening-balance','receiving','transfer','waste','spill','comp','spoilage','damage','adjustment-plus','adjustment-minus','count-adjustment'];
 for(const m of s.movements){if(!types.includes(m.type))fail('unknown movement type');ref(m.itemId,items,'movement item');date(m.date,'movement date');stamp(m.at,'movement timestamp');number(m.qty,'movement quantity',m.type==='count-adjustment'?-1e9:0);number(m.unitCost,'movement cost');text(m.reference,'movement reference');if(m.reasonCode!==undefined && !['','EXP','OVER','PREP','DROP','MIST','TRAIN','QUALITY','VEND','OTHER'].includes(m.reasonCode))fail('invalid optional movement reason category');ref(m.fromLocation,locs,'source',true);ref(m.toLocation,locs,'destination',true);if(!m.fromLocation&&!m.toLocation)fail('movement has no location');if(m.type==='transfer'&&(!m.fromLocation||!m.toLocation||m.fromLocation===m.toLocation))fail('invalid transfer locations')}
 for(const c of s.costHistory){if(c.type!=='cost-change')fail('unknown cost event');ref(c.itemId,items,'cost item');date(c.date,'cost date');stamp(c.at,'cost timestamp');number(c.oldCost,'old cost');number(c.newCost,'new cost');text(c.reference,'cost reference')}
 for(const sale of s.sales){date(sale.date,'sales date');number(sale.netSales,'net sales');text(sale.note,'sales note');if(sale.createdAt)stamp(sale.createdAt,'sales createdAt')}
 for(const c of s.counts){date(c.date,'count date');stamp(c.postedAt,'count timestamp');if(!['cycle','full'].includes(c.type))fail('count type');if(c.scope!=='all')ref(c.scope,locs,'count scope');text(c.countedBy,'counted by');if(!Array.isArray(c.rows)||!c.rows.length)fail('count rows');const pairs=new Set();for(const row of c.rows){obj(row,'count row');ref(row.itemId,items,'count item');ref(row.locationId,locs,'count location');if(c.scope!=='all'&&row.locationId!==c.scope)fail('count scope mismatch');const key=row.itemId+'|'+row.locationId;if(pairs.has(key))fail('duplicate count row');pairs.add(key);number(row.expected,'expected count');number(row.counted,'counted quantity')}}
 return JSON.parse(JSON.stringify(s));
}
function validateBackup(value){
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Invalid backup object.');
 // Legacy raw-state backups remain accepted, but receive the same full validation.
 if(!Object.prototype.hasOwnProperty.call(value,'state'))return validateState(value);
 if(value.product!=='Gravity Inventory Center'||!['1.0.0','1.0.0-rc.5','1.0.0-rc.6','1.0.0-rc.7','1.0.0-rc.8','1.0.0-rc.9','1.0.0-rc.10','1.0.0-rc.11'].includes(value.version))throw new Error('Unsupported backup product or version.');
 if(typeof value.exportedAt!=='string'||!Number.isFinite(Date.parse(value.exportedAt)))throw new Error('Invalid backup export date.');
 return validateState(value.state);
}
const api={validateState,validateBackup};if(typeof module==='object'&&module.exports)module.exports=api;else root.InventoryValidation=api;
})(globalThis);
