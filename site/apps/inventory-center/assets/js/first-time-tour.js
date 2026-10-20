/* Gravity Inventory Center: first-time guided operation. Source shared by website and Windows. */
(()=>{'use strict';
const STORAGE='gravityInventoryFirstTour.v1';
const steps=[
{view:'dashboard',target:'.process-roadmap',title:'See the complete inventory process',body:'Begin with the roadmap. A dependable inventory starts with the restaurant, then locations and items, followed by starting stock. Every later change must be recorded and checked against physical stock.',verify:'You can name all eight stages and understand that nothing in the tour posts an inventory transaction for you.'},
{view:'dashboard',target:'#edit-profile',title:'Open Restaurant Profile',body:'Select Restaurant Profile. Identify the restaurant before creating items, receiving stock or counting. The identity should match the location that actually owns these inventory numbers.',verify:'The restaurant name will appear above the inventory dashboard. Do not enter real restaurant data into another location’s profile.'},
{view:'dashboard',target:'#profile-name',title:'Confirm restaurant and store identity',body:'Save a restaurant name. Add store/location identifiers if you operate more than one restaurant. Use the top Restaurant Profile button again whenever the identifying information changes.',verify:'The heading no longer says “Restaurant not set”.'},
{view:'locations',target:'#location-form',title:'Map physical storage areas',body:'Open Locations. Add one actual place for each area where a person can find and count stock: for example Walk-in Cooler, Freezer, Dry Storage, Bar Cage and Line Cooler. Do not use “Food” or “Beverages” as a physical location.',verify:'Each physical storage area has its own saved location.'},
{view:'locations',target:'#loc-order',title:'Set a walking count route',body:'Enter a different route order for each location, reflecting the path employees walk during inventory. Leave the order blank to append. Save the location, then repeat for all areas.',verify:'The Locations in count order list follows a practical walking path.'},
{view:'items',target:'#add-item',title:'Start the Item Master',body:'After locations exist, select Add Item. One item represents a single controlled stocked product, even if you buy it from different stores. Use a clear name and place it in the correct primary storage location.',verify:'You can search the Item Master to find every stocked product.'},
{view:'items',target:'#items-table',title:'Set units, cost and location consistently',body:'Inside Add Item, enter the count unit you really count (such as each, lb, bottle or case), its current cost per count unit, and its location. Record vendor, SKU, case pack and yield where useful. Mixing “each” and “case” creates incorrect totals.',verify:'Every item has a count unit, nonnegative unit cost and valid location.'},
{view:'items',target:'#items-table',title:'Choose a barcode strategy',body:'A barcode is optional. Existing supplier or product barcodes may be scanned or typed into the item. For unlabeled/local items use Create Inventory Barcode in the item dialog, save the item, then choose its Barcode action and Print Label. Test a scan before printing labels in bulk.',verify:'A barcode identifies exactly one inventory item; no barcode is required to begin counting.'},
{view:'items',target:'#items-table',title:'Enter actual opening stock',body:'For a new item use Opening On Hand to establish the amount physically present in count units. Do not estimate. If stock already exists in the program, use a documented count or adjustment instead of entering duplicate opening stock.',verify:'Your on-hand figure agrees with a real shelf count, not a guessed amount.'},
{view:'import',target:'#download-import-template',title:'Optional: import your item list',body:'Use Download CSV Template, fill in actual item names, count units, costs, locations, pars and opening quantities, then Choose CSV File. The preview shows invalid rows and possible duplicates. Review and correct before Import Previewed Items.',verify:'No item is imported until you approve the preview. Back up before replacing matching items.'},
{view:'items',target:'#metric-items',title:'Check your initial item setup',body:'Return to Item Master and clear any search/category filters. Check for missing items and duplicate names or barcodes. Check opening stock against real shelves. Importing a list is not proof the physical stock is accurate.',verify:'The active item count and item details match your actual restaurant.'},
{view:'receiving',target:'#receiving-form',title:'Post a real delivery',body:'Choose an item and the location it arrived at. Enter the delivered quantity in the item’s count units, unit cost, actual date, and invoice/vendor reference. Select Post Receiving once, then verify it in History or Item Master.',verify:'The receiving record and increased location quantity match the delivery receipt.'},
{view:'receiving',target:'#receive-reference',title:'Handle purchases from local stores',body:'Items bought from Walmart, grocery stores, clubs or emergency suppliers are normal receiving. Use the same controlled item and enter the actual purchase source plus receipt number in Vendor / invoice. Do not create a duplicate item solely because the supplier changed.',verify:'You can later explain exactly where an unexpected local purchase came from.'},
{view:'movements',target:'#move-action',title:'Transfer stock between locations',body:'Choose Transfer, the item, original location and a DIFFERENT destination, then enter the amount, date and meaningful reason. Transfers move stock between locations without increasing total company stock. Post once after verifying fields.',verify:'The source went down, the destination went up, and total stock did not change.'},
{view:'movements',target:'#movement-form',title:'Record waste, spill, damage or adjustments',body:'Choose the actual movement type (Waste, Spill, Comp, Spoilage, Damage, Positive adjustment or Negative adjustment). Supply item, location, quantity, date and reason. Use an adjustment for corrections, not to hide an unexplained loss.',verify:'Every movement in History has an honest event type and reason.'},
{view:'counts',target:'#count-type',title:'Choose the kind of physical count',body:'Use Cycle count for selected items/one location; Full inventory for all locations and items. Choose an actual count date and counted-by name. Full inventory requires All locations and every line before posting.',verify:'The type and count scope match the physical work you intend to complete.'},
{view:'counts',target:'#build-count',title:'Build and complete a count sheet',body:'Select Build Count Sheet. Enter measured quantities in each item’s count unit: zero means the shelf is empty; blank means not counted. Do not enter estimates. Cycle counts may leave uncounted lines blank; full counts may not.',verify:'The sheet records actual observed stock, including explicit zeros.'},
{view:'counts',target:'#post-count',title:'Review variances and post the count',body:'Compare expected quantities with actual amounts. Investigate large or surprising differences before selecting Post Count. Posting changes stock balances. Do not rebuild, switch work or close with an unfinished sheet unless you intend to discard it.',verify:'The saved Count Register records the date, items and variances you reviewed.'},
{view:'items',target:'#items-table',title:'Set realistic par and reorder points',body:'Edit each important item in Item Master to set Par (desired target) and Reorder Point (when to review buying). Use your real usage and delivery times; do not copy someone else’s numbers. A case pack is reference information; suggested quantities stay in count units.',verify:'Each par/reorder value has an operational reason and correct unit.'},
{view:'reorder',target:'#reorder-table',title:'Review purchasing suggestions',body:'Items appear when on hand is at or below reorder point AND below par. Compare Suggested order with vendor case packs, upcoming sales and current stock. Print Current View if needed; this worksheet does not place supplier orders.',verify:'A manager reviewed every proposed purchase instead of treating it as an automatic order.'},
{view:'history',target:'#history-table',title:'Trace every change in History',body:'Find the receiving, transfer, adjustment and posted count records you created. Search or filter when investigating a discrepancy. Export History captures the full history even if your current view is filtered.',verify:'Every material change is explainable by date, item, location, quantity and source/reason.'},
{view:'sales',target:'#sales-form',title:'Optional: add daily net sales',body:'Enter a date, actual net sales and a note if you want sales beside inventory movements. This is a reference only; it does not replace Toast/POS reporting or your accounting system.',verify:'Any recorded sales are real numbers for the correct date.'},
{view:'dashboard',target:'#print-view',title:'Print the current worksheet safely',body:'Print Current View prints the selected tab. Preview it first; barcodes use their own Item Master Barcode / Print Label function. Confirm your printer’s layout and scan a sample barcode on actual equipment.',verify:'Printed output is readable and agrees with the screen.'},
{view:'dashboard',target:'#export-items',title:'Export items and history as needed',body:'Export Items and Export History create reviewable CSV files. Exports are separate from a full restore backup. Treat store costs, vendors and staff notes as private restaurant information.',verify:'CSV exports open correctly and show the records you expect.'},
{view:'dashboard',target:'#backup-json',title:'Create a recoverable backup',body:'Select Create Backup and save the JSON in a secure location other than just this computer. Keep dated copies. A backup contains posted data; unposted count-sheet edits are not included. Do this regularly and especially before a restore or major import.',verify:'You know where the new backup file is and can identify its date.'},
{view:'dashboard',target:'#restore-json',title:'Know how restoration works BEFORE you need it',body:'Restore Backup replaces current inventory after confirmation. Never use Restore as a routine import. First create a current backup, confirm the target restaurant/location, and test restoring a SAMPLE backup on a separate test profile/device—not in a live working restaurant.',verify:'You can explain the difference between a CSV import and restoring an entire JSON backup.'},
{view:'help',target:'#view-help',title:'Find detailed help inside the program',body:'Use Help for barcodes, local suppliers, printing, correcting mistakes, recovery, locations, count handling and other processes. Every operational screen also includes “Finished correctly” guidance.',verify:'You can locate troubleshooting answers without leaving Inventory Center.'},
{view:'glossary',target:'#inventory-glossary',title:'Review plain-language inventory terms',body:'Use Glossary if Unit cost, On hand, Par, Reorder Point, Yield or Count unit is unfamiliar. Get the unit right before posting quantities or calculating inventory value.',verify:'You can explain your restaurant’s meaning for each important field.'},
{view:'dashboard',target:'.process-roadmap',title:'Confirm you are ready for a real inventory',body:'Finish by checking: correct restaurant identity; every location listed; every item and unit correct; opening stock verified; posted transactions visible in History; counts reviewed; reorder levels justified; dated backup saved somewhere safe. Return to this walkthrough whenever you need it.',verify:'The physical restaurant, the inventory screens and the recovery file tell the same story.'}
];
let index=-1,host=null,focused=null;
const viewFor=(v)=>document.querySelector('.view-tabs .tab[data-view="'+v+'"]');
const pref=()=>{try{return JSON.parse(localStorage.getItem(STORAGE)||'{}')}catch{return{}}};
const save=(v)=>{try{localStorage.setItem(STORAGE,JSON.stringify(v))}catch{}};
function mount(){
 if(document.getElementById('gravity-inventory-first-tour'))return;
 const bar=document.querySelector('.utility-actions'),shell=document.querySelector('.app-shell');if(!bar||!shell)return;
 const launch=document.createElement('button');launch.id='inventory-start-guided';launch.type='button';launch.textContent='First Inventory? Walk Me Through It';launch.title='Step-by-step guidance for your first Inventory Center setup and complete inventory cycle.';bar.prepend(launch);
 host=document.createElement('aside');host.id='gravity-inventory-first-tour';host.setAttribute('aria-label','First inventory walkthrough');
 host.innerHTML='<div class="gif-launch"><strong>Your first inventory, from setup to backup</strong><span>Use 29 guided steps alongside your real work. No data is entered or posted for you.</span><button type="button" id="gif-begin">Start First Inventory Walkthrough</button></div><section class="gif-panel" hidden aria-live="polite" aria-atomic="true"><div class="gif-top"><span id="gif-progress"></span><button type="button" id="gif-hide" aria-label="Close walkthrough">✕</button></div><h2 id="gif-title"></h2><p id="gif-text"></p><p class="gif-check"><strong>Check before advancing:</strong> <span id="gif-verify"></span></p><p id="gif-location"></p><div class="gif-actions"><button id="gif-back" type="button">Back</button><button id="gif-show" type="button">Show This Screen</button><button id="gif-next" type="button">Next Step</button></div><div class="gif-foot"><button id="gif-exit" type="button">End / Save My Place</button><button id="gif-restart" type="button">Start Over</button></div></section>';
 shell.insertBefore(host,shell.firstChild);
 const style=document.createElement('style');style.id='gravity-inventory-first-tour-css';
 style.textContent='#inventory-start-guided,#gif-begin{border:2px solid #a67b22!important;background:#173741!important;color:#fff!important;font-weight:800!important}#gravity-inventory-first-tour{margin:12px 0}#gravity-inventory-first-tour .gif-launch{border:2px solid #b88e42;background:#102b34;color:#fff;border-radius:14px;padding:15px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}#gravity-inventory-first-tour .gif-launch span{flex:1 1 230px;line-height:1.5}#gravity-inventory-first-tour button{min-height:42px;padding:8px 12px;border:1px solid #b88e42;border-radius:8px;cursor:pointer}#gravity-inventory-first-tour .gif-panel{position:fixed;z-index:2147483600;right:14px;bottom:14px;width:min(450px,calc(100vw - 28px));max-height:min(78vh,660px);overflow:auto;box-shadow:0 18px 55px #0009;background:#122b35;color:#f6f1e8;border:2px solid #c79c4b;border-radius:17px;padding:18px;text-align:left}#gravity-inventory-first-tour .gif-panel[hidden]{display:none!important}#gravity-inventory-first-tour .gif-panel h2{color:white;font:700 23px/1.2 Georgia,serif;margin:12px 0}#gravity-inventory-first-tour .gif-panel p{line-height:1.55;margin:10px 0}#gravity-inventory-first-tour .gif-top{display:flex;justify-content:space-between;align-items:center;color:#f3cc78;font-size:13px;font-weight:800}#gravity-inventory-first-tour .gif-panel button{color:#161f23;background:#ecc877;font-weight:800}#gravity-inventory-first-tour #gif-hide{color:white;background:transparent;min-height:30px;border:0;font-size:20px}#gravity-inventory-first-tour .gif-check{border-left:4px solid #f3cc78;background:#183d49;padding:10px 12px}#gravity-inventory-first-tour .gif-actions{display:flex;flex-wrap:wrap;gap:8px}#gravity-inventory-first-tour .gif-foot{display:flex;gap:12px;justify-content:space-between;margin-top:10px}#gravity-inventory-first-tour .gif-foot button{color:#f1e8d7;background:transparent;border:1px solid #597481;font-size:12px}#gravity-inventory-first-tour button:disabled{opacity:.45;cursor:default}.gif-focus{outline:4px solid #d39b2e!important;outline-offset:3px!important;scroll-margin-top:105px}@media(max-width:700px){#gravity-inventory-first-tour .gif-launch{display:block}#gravity-inventory-first-tour .gif-launch span{display:block;margin:8px 0}#gravity-inventory-first-tour .gif-panel{bottom:8px;right:8px;max-height:70vh}}@media(prefers-reduced-motion:reduce){.gif-focus{scroll-behavior:auto}}';
 document.head.append(style);
 const open=()=>show(Number.isInteger(pref().step)&&pref().step>=0&&pref().step<steps.length?pref().step:0);
 launch.addEventListener('click',open);host.querySelector('#gif-begin').addEventListener('click',open);
 host.querySelector('#gif-back').addEventListener('click',()=>show(index-1));
 host.querySelector('#gif-next').addEventListener('click',()=>index===steps.length-1?end(true):show(index+1));
 host.querySelector('#gif-show').addEventListener('click',()=>goToView());
 host.querySelector('#gif-exit').addEventListener('click',()=>end(false));
 host.querySelector('#gif-hide').addEventListener('click',()=>end(false));
 host.querySelector('#gif-restart').addEventListener('click',()=>show(0));
 const p=pref();if(!p.seen){save({seen:true,step:0});} // Offer the tour prominently; never interrupt or change existing data.
}
function highlight(){
 focused?.classList.remove('gif-focus');focused=null;
 const step=steps[index];if(!step)return;
 let el=document.querySelector(step.target);
 if(el&&(!el.getClientRects().length||el.closest('dialog:not([open])')))el=null;
 if(!el&&step.view)el=viewFor(step.view);
 focused=el;if(el){el.classList.add('gif-focus');el.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
}
function goToView(){
 const step=steps[index];if(!step?.view){highlight();return}
 // An initial modal prevented the entire walkthrough from receiving mouse clicks.
 // Open Profile only when the customer chooses it, temporarily suspending the panel
 // while the native dialog has focus; resume safely on Save or Cancel.
 if(step.target==='#edit-profile'){
  const dlg=document.getElementById('profile-dialog'),button=document.getElementById('edit-profile');
  if(!dlg||!button)return;
  if(dlg.open)return;
  const panel=host.querySelector('.gif-panel');panel.hidden=true;
  dlg.addEventListener('close',()=>{if(index>=0){panel.hidden=false;highlight()}},{once:true});
  button.click();return;
 }
 if(document.querySelector('dialog[open]')){host.querySelector('#gif-location').textContent='Finish or cancel the open form first, then choose Show This Screen.';return}
 const nav=viewFor(step.view);
 if(!nav){host.querySelector('#gif-location').textContent='This screen is not available. Use the program’s Help section.';return}
 // Never silently leave an unfinished count sheet or dismiss unposted entries.
 if(document.querySelector('#view-counts.active #post-count:not(.hidden)')&&step.view!=='counts'){
  if(!window.confirm('You may have unposted count entries. Leave this screen? Confirm that your count work is complete or intentionally discarded.'))return;
 }
 nav.click();highlight();
}
function show(i){
 if(i<0||i>=steps.length)return;index=i;save({seen:true,step:i});
 const step=steps[i],panel=host.querySelector('.gif-panel');panel.hidden=false;
 host.querySelector('#gif-progress').textContent='First Inventory Walkthrough · Step '+(i+1)+' of '+steps.length;
 host.querySelector('#gif-title').textContent=step.title;host.querySelector('#gif-text').textContent=step.body;host.querySelector('#gif-verify').textContent=step.verify;
 host.querySelector('#gif-back').disabled=i===0;host.querySelector('#gif-next').textContent=i===steps.length-1?'Finish Walkthrough':'Next Step';
 const nav=viewFor(step.view),active=nav?.classList.contains('active');
 host.querySelector('#gif-show').hidden=!step.view||(Boolean(active)&&step.target!=='#edit-profile');
 host.querySelector('#gif-show').textContent=step.target==='#edit-profile'?'Open Restaurant Profile':'Show This Screen';
 host.querySelector('#gif-location').textContent=step.target==='#edit-profile'?'Select Open Restaurant Profile above, enter your restaurant name and save. The walkthrough resumes after the form closes.':step.view&&!active?'Select Show This Screen to move to '+nav?.textContent+'. Your work is not entered or saved by the tour.':'Complete the work in Inventory Center, then select Next Step. This tour never submits an item or posts a transaction.';
 highlight();
}
function end(done){
 focused?.classList.remove('gif-focus');focused=null;index=-1;
 host.querySelector('.gif-panel').hidden=true;if(done)save({seen:true,step:steps.length-1,completed:true});
 document.getElementById('inventory-start-guided')?.focus();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();