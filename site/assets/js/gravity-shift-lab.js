(function(){
'use strict';

function $(id){ return document.getElementById(id); }
var body=$('lab-body'), coverage=$('coverage-strip'), sectionCoverage=$('section-coverage');
if(!body || !coverage) return;

var days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var PROFILE_KEY='gravityShiftLabProfileV3';
var LEGACY_PROFILE_KEY='gravityShiftLabProfileV2';
var SCHEDULE_KEY='gravityShiftLabSchedulesV3';
var LEGACY_SCHEDULE_KEY='gravityShiftLabSchedulesV2';
var currentRulesEmployeeId=null;
var deferredInstallPrompt=null;
var calendarMonth=null;
var calendarSelectedEmployeeId=null;
var calendarSelectedDate=null;
var payUnlocked=false;
var payDialogMode='setup';
var publishedEmployeeLink='';
var publishedEmployeeSnapshot=null;

function uid(prefix){ return (prefix||'e')+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7); }
function esc(v){ return String(v==null?'':v).replace(/[&<>\"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function loadJSON(k,fallback){ try{ var v=JSON.parse(localStorage.getItem(k)||'null'); return v==null?fallback:v; }catch(e){ return fallback; } }
function saveJSON(k,v){ try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){console.warn('Shift Lab local storage unavailable',e);return false;} }
function payLockConfigured(){ return !!String(profile&&profile.payLockHash||''); }
function payIsLocked(){ return payLockConfigured()&&!payUnlocked; }
function fallbackHash(str){ var h=2166136261;str=String(str||'');for(var i=0;i<str.length;i++){h^=str.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24);}return 'fallback-'+(h>>>0).toString(16); }
function hashSecret(secret){
  var text='GravityShiftLab|'+String(secret||'');
  if(window.crypto&&window.crypto.subtle&&window.TextEncoder){
    return window.crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)).then(function(buf){return Array.from(new Uint8Array(buf)).map(function(b){return b.toString(16).padStart(2,'0');}).join('');});
  }
  return Promise.resolve(fallbackHash(text));
}
function setManagerOnlyControls(){
  var locked=payIsLocked();
  ['lab-print-manager','lab-csv','lab-backup','lab-restore','lab-manager-settings'].forEach(function(id){var el=$(id);if(!el)return;el.disabled=locked;el.classList.toggle('manager-only-disabled',locked);el.title=locked?'Manager Pay Lock must be unlocked first.':'';});
}
function updatePayPrivacyUI(){
  var configured=payLockConfigured(),locked=payIsLocked(),button=$('lab-pay-lock'),change=$('lab-pay-change'),status=$('pay-lock-status'),copy=$('pay-lock-copy');
  if(button){button.textContent=!configured?'Set Manager Pay Lock':(locked?'Unlock Pay Rates':'Lock Pay Rates');}
  if(change){change.classList.toggle('hidden',!configured||locked);}
  if(status){status.className='pay-lock-status '+(locked?'locked':'unlocked');status.textContent=!configured?'Pay rates currently editable. Set a manager password/PIN before delegating scheduling.':(locked?'🔒 Pay rates hidden. Labor % still uses the saved rates.':'🔓 Manager pay view unlocked. Lock it before delegating scheduling.');}
  if(copy){copy.textContent=locked?'Pay rates and manager-only outputs are hidden. The saved rates still calculate labor % and overtime cost in the background.':(!configured?'Set a manager password/PIN before delegating the schedule. When locked, pay rates stay hidden while labor % continues using the saved rates in the background.':'Manager pay view is open. Enter or update rates, then lock them before handing scheduling to someone else.');}
  setManagerOnlyControls();
}
function openPayLockDialog(mode){
  payDialogMode=mode||'unlock';var setup=payDialogMode!=='unlock';
  $('pay-lock-dialog-title').textContent=payDialogMode==='unlock'?'Unlock Manager Pay Rates':(payDialogMode==='change'?'Change Manager Password / PIN':'Set Manager Pay Lock');
  $('pay-lock-dialog-help').textContent=payDialogMode==='unlock'?'Enter the manager password/PIN. The unlock is for this open Shift Lab session; lock it again before handing the schedule to someone else.':'Choose a password/PIN with at least 4 characters. It hides individual pay rates and manager-only outputs during normal delegated scheduling.';
  $('pay-lock-confirm-wrap').classList.toggle('hidden',!setup);
  $('pay-lock-submit').textContent=payDialogMode==='unlock'?'Unlock Pay Rates':'Save Pay Lock';
  $('pay-lock-secret').value='';$('pay-lock-confirm').value='';$('pay-lock-dialog-status').textContent='';$('pay-lock-dialog').showModal();
  setTimeout(function(){$('pay-lock-secret').focus();},20);
}
function lockPayRates(){
  syncProfileFromRows();saveCurrentWeek(true);payUnlocked=false;renderWeek();updatePayPrivacyUI();$('lab-status').textContent='Manager Pay Lock is on. Individual pay rates and manager-only outputs are hidden; labor % remains accurate.';
}
function submitPayLock(){
  var secret=$('pay-lock-secret').value||'',confirmValue=$('pay-lock-confirm').value||'';
  if(secret.length<4){$('pay-lock-dialog-status').textContent='Use at least 4 characters.';return;}
  if(payDialogMode!=='unlock'&&secret!==confirmValue){$('pay-lock-dialog-status').textContent='The two entries do not match.';return;}
  hashSecret(secret).then(function(hash){
    if(payDialogMode==='unlock'){
      if(hash!==profile.payLockHash){$('pay-lock-dialog-status').textContent='That password/PIN did not match.';return;}
      payUnlocked=true;$('pay-lock-dialog').close();renderWeek();updatePayPrivacyUI();$('lab-status').textContent='Manager pay view unlocked. Lock Pay Rates before delegating the schedule.';
    }else{
      profile.payLockHash=hash;payUnlocked=true;persistProfile();$('pay-lock-dialog').close();renderWeek();updatePayPrivacyUI();$('lab-status').textContent='Manager Pay Lock saved. Enter/update pay rates, then click Lock Pay Rates before delegating.';
    }
  });
}

function defaultSections(){ return ['Management','Dish Pit','Prep','Cook Line','Pizza','Salad','Expo','Servers','Hosts','Bar']; }
function defaultAvailability(){ return ['','','','','','','']; }
function defaultProfile(){
  return {
    restaurant:'',store:'',targetHours:'',targetPercent:'',conflictMode:'warn',payLockHash:'',managementLaborMode:'include',managerSalaryAllocation:'',hourlyBurdenPercent:'',contactVisibility:'scheduler',publishCycle:'1',lastViewedWeek:'',
    openTimes:['','','','','','',''],
    openAllowance:[0,0,0,0,0,0,0],
    closeTimes:['10p','10p','10p','10p','10p','11p','11p'],
    closeAllowance:[1.5,1.5,1.5,1.5,1.5,1.5,1.5],
    sections:defaultSections(),employees:[]
  };
}
function uniqueNames(list){
  var out=[], seen={};
  (list||[]).forEach(function(v){ var s=String(v||'').trim(); if(!s)return; var k=s.toLowerCase(); if(!seen[k]){seen[k]=1;out.push(s);} });
  return out;
}
function normalizeEmployee(e){
  e=e||{};
  return {
    id:e.id||uid('e'),name:e.name||'',role:e.role||'',wage:e.wage||'',phone:e.phone||'',maxWeeklyHours:e.maxWeeklyHours||'',minor:!!e.minor,noClosing:!!e.noClosing,certification:e.certification||'',certExpiry:e.certExpiry||'',
    homeSection:e.homeSection||e.section||'',
    qualifiedSections:uniqueNames(e.qualifiedSections||[]),
    availability:Array.isArray(e.availability)?e.availability.slice(0,7).concat(defaultAvailability()).slice(0,7):defaultAvailability(),
    recurringOff:Array.isArray(e.recurringOff)?e.recurringOff.slice(0,7).concat([false,false,false,false,false,false,false]).slice(0,7):[false,false,false,false,false,false,false],
    requests:Array.isArray(e.requests)?e.requests:[],
    calendarRules:Array.isArray(e.calendarRules)?e.calendarRules:[]
  };
}
function migrateData(){
  var p=loadJSON(PROFILE_KEY,null);
  if(!p){ p=loadJSON(LEGACY_PROFILE_KEY,null); if(p) saveJSON(PROFILE_KEY,p); }
  var s=loadJSON(SCHEDULE_KEY,null);
  if(!s){ s=loadJSON(LEGACY_SCHEDULE_KEY,null); if(s) saveJSON(SCHEDULE_KEY,s); }
  return {profile:p||defaultProfile(),schedules:s||{}};
}
var migrated=migrateData();
var profile=migrated.profile;
var schedules=migrated.schedules;
profile.sections=uniqueNames(profile.sections&&profile.sections.length?profile.sections:defaultSections());
profile.employees=(profile.employees||[]).map(normalizeEmployee);
profile.openTimes=(profile.openTimes||['','','','','','','']).slice(0,7);
profile.openAllowance=(profile.openAllowance||[0,0,0,0,0,0,0]).slice(0,7);
profile.closeTimes=(profile.closeTimes||['10p','10p','10p','10p','10p','11p','11p']).slice(0,7);
profile.closeAllowance=(profile.closeAllowance||[1.5,1.5,1.5,1.5,1.5,1.5,1.5]).slice(0,7);
profile.payLockHash=profile.payLockHash||'';
profile.managementLaborMode=profile.managementLaborMode||'include';
profile.managerSalaryAllocation=profile.managerSalaryAllocation||'';
profile.hourlyBurdenPercent=profile.hourlyBurdenPercent==null?'':String(profile.hourlyBurdenPercent);
profile.contactVisibility=profile.contactVisibility||'scheduler';
profile.publishCycle=String(profile.publishCycle||'1');
profile.lastViewedWeek=/^\d{4}-\d{2}-\d{2}$/.test(String(profile.lastViewedWeek||''))?String(profile.lastViewedWeek):'';
payUnlocked=!profile.payLockHash;

function sectionOptions(selected,homeLabel){
  var names=profile.sections.slice();
  if(selected && names.indexOf(selected)<0) names.push(selected);
  var html='<option value="">'+esc(homeLabel||'Use home section')+'</option>';
  names.forEach(function(s){ html+='<option value="'+esc(s)+'" '+(s===selected?'selected':'')+'>'+esc(s)+'</option>'; });
  return html;
}
function parseTime(s){
  s=String(s||'').trim().toLowerCase().replace(/\s/g,'');
  if(!s)return null;
  var m=s.match(/^(\d{1,2})(?::(\d{2}))?(a|p|am|pm)?$/);
  if(!m)return null;
  var h=+m[1],min=+(m[2]||0),ap=m[3];
  if(ap){
    if(h<1||h>12||min>59)return null;
    if(h===12)h=0;
    if(ap[0]==='p')h+=12;
  }else{
    if(h>23||min>59)return null;
  }
  return h+min/60;
}
function isOffShift(v){return /^off$/i.test(String(v||'').trim());}
function isOpenMarker(v){return /^open$/i.test(String(v||'').trim());}
function isCloseMarker(v){return /^close$/i.test(String(v||'').trim());}
function normalizeShiftEntry(v){
  var raw=String(v||'').trim(); if(!raw)return '';
  if(isOffShift(raw))return 'OFF'; if(isOpenMarker(raw))return 'OPEN'; if(isCloseMarker(raw))return 'CLOSE';
  var parts=raw.split(/[-–—]/);
  if(parts.length>=2){var a=parts[0].trim(),b=parts.slice(1).join('-').trim();if(/^open$/i.test(a))a='OPEN';if(/^close(?:\+\d+(?:\.\d+)?)?$/i.test(b))b=b.toUpperCase();return a+'-'+b;}
  return raw;
}
function openStart(dayIndex,token){
  var open=parseTime(profile.openTimes[dayIndex]); if(open==null)return null;
  var early=Number(profile.openAllowance[dayIndex]||0);
  var m=String(token||'').toLowerCase().replace(/\s/g,'').match(/^open(?:-(\d+(?:\.\d+)?))?$/);
  if(m&&m[1]!=null)early=Number(m[1]);
  return open-early;
}
function closeEnd(dayIndex,token){
  var close=parseTime(profile.closeTimes[dayIndex]); if(close==null)return null;
  var extra=Number(profile.closeAllowance[dayIndex]||0);
  var m=String(token||'').toLowerCase().replace(/\s/g,'').match(/^cl(?:ose)?(?:\+(\d+(?:\.\d+)?))?$/);
  if(m&&m[1]!=null)extra=Number(m[1]);
  return close+extra;
}
function parseEndpoint(token,dayIndex,isEnd){
  token=String(token||'').trim().toLowerCase();
  if(!isEnd&&/^open$/.test(token.replace(/\s/g,''))) return openStart(dayIndex,token);
  if(isEnd&&/^cl(?:ose)?(?:\+\d+(?:\.\d+)?)?$/.test(token.replace(/\s/g,''))) return closeEnd(dayIndex,token);
  return parseTime(token);
}
function ambiguousBareShift(v){
  var parts=String(v||'').trim().toLowerCase().split(/[-–—]/);if(parts.length!==2)return false;
  function bareHour(token){var m=String(token||'').replace(/\s/g,'').match(/^(\d{1,2})(?::\d{2})?$/);return m?Number(m[1]):null;}
  var a=bareHour(parts[0]),b=bareHour(parts[1]);
  return a!=null&&b!=null&&a>=1&&a<=12&&b>=1&&b<=12;
}
function parseShift(v,dayIndex){
  v=normalizeShiftEntry(v); if(!v||isOffShift(v)||isOpenMarker(v)||isCloseMarker(v))return null;
  if(ambiguousBareShift(v))return null;
  var parts=v.split(/[-–—]/); if(parts.length<2)return null;
  var a=parseEndpoint(parts[0],dayIndex,false),b=parseEndpoint(parts.slice(1).join('-'),dayIndex,true);
  if(a==null||b==null)return null; if(b<a)b+=24;
  var hours=Math.max(0,b-a);if(hours>16)return null;
  return {start:a,end:b,hours:hours};
}
function shiftHours(v,dayIndex){ if(isOffShift(v)||isOpenMarker(v)||isCloseMarker(v))return 0; var p=parseShift(v,dayIndex); return p?p.hours:0; }
function parseAvailability(v,dayIndex){
  v=String(v||'').trim().toLowerCase();
  if(!v||v==='any'||v==='open'||v==='available')return {any:true};
  if(v==='off'||v==='unavailable'||v==='na'||v==='n/a')return {off:true};
  var p=parseShift(v,dayIndex); return p||{invalid:true};
}
function money(n){ return '$'+Number(n||0).toLocaleString(undefined,{maximumFractionDigits:0}); }
function isoDate(d){ var y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0'); return y+'-'+m+'-'+day; }
function dateForDay(week,dayIndex){ if(!week)return null; var d=new Date(week+'T12:00:00'); if(isNaN(d))return null; d.setDate(d.getDate()+dayIndex); return isoDate(d); }
function previousWeekKey(week){ if(!week)return ''; var d=new Date(week+'T12:00:00'); if(isNaN(d))return ''; d.setDate(d.getDate()-7); return isoDate(d); }
function nextWeekKey(week){ if(!week)return ''; var d=new Date(week+'T12:00:00'); if(isNaN(d))return ''; d.setDate(d.getDate()+7); return isoDate(d); }
function getEmployee(id){ return profile.employees.find(function(e){return e.id===id;})||null; }
function effectiveSection(emp,override){ return String(override||emp.homeSection||'Unassigned').trim()||'Unassigned'; }
function isQualified(emp,section){ if(!section||section==='Unassigned')return true; return section===emp.homeSection || (emp.qualifiedSections||[]).indexOf(section)>=0; }

function activeRequestFor(emp,date,shift,dayIndex){
  if(!date)return null;
  var matches=(emp.requests||[]).filter(function(r){return r.date===date&&r.status!=='denied';});
  if(!matches.length)return null;
  for(var i=0;i<matches.length;i++){
    var r=matches[i]; if(r.fullDay||!shift)return r;
    var rs=parseEndpoint(r.start,dayIndex,false),re=parseEndpoint(r.end,dayIndex,true);
    if(rs==null||re==null)return r; if(re<rs)re+=24;
    if(shift.start<re&&shift.end>rs)return r;
  }
  return null;
}
function calendarRulesFor(emp,date){
  if(!date)return [];
  return (emp.calendarRules||[]).filter(function(r){return r.date===date;});
}
function calendarRuleLabel(rule){
  var kind=rule&&rule.kind||'';
  if(kind==='cannotWork')return 'Cannot work';
  if(kind==='availableAfter')return 'Available after '+(rule.time||'');
  if(kind==='availableUntil')return 'Available until '+(rule.time||'');
  return 'Availability rule';
}
function calendarRuleConflict(emp,date,shift){
  var messages=[],hard=false;
  calendarRulesFor(emp,date).forEach(function(r){
    if(r.kind==='cannotWork'){messages.push('Cannot work this date');hard=true;}
    else if(r.kind==='availableAfter'){
      var t=parseTime(r.time);if(t!=null&&shift.start<t){messages.push('Available after '+r.time);hard=true;}
    }else if(r.kind==='availableUntil'){
      var t2=parseTime(r.time);if(t2!=null&&shift.end>t2){messages.push('Available until '+r.time);hard=true;}
    }
  });
  return messages.length?{messages:messages,hard:hard}:null;
}

function conflictFor(emp,dayIndex,shiftText,sectionOverride){
  shiftText=normalizeShiftEntry(shiftText);
  if(!shiftText||isOffShift(shiftText))return null;
  if(isOpenMarker(shiftText))return {level:'soft',msg:'Opening assignment saved. Add an end time (for example OPEN-4p) to include labor hours.'};
  if(isCloseMarker(shiftText))return {level:'soft',msg:'Closing assignment saved. Add a start time (for example 4p-CLOSE) to include labor hours.'};
  var shift=parseShift(shiftText,dayIndex);
  if(!shift){
    if(/^open-/i.test(shiftText)&&parseTime(profile.openTimes[dayIndex])==null)return {level:'hard',msg:'Set the posted opening time in Opening / Closing Rules.'};
    if(/-close/i.test(shiftText)&&parseTime(profile.closeTimes[dayIndex])==null)return {level:'hard',msg:'Set the posted closing time in Opening / Closing Rules.'};
    return {level:'hard',msg:ambiguousBareShift(shiftText)?'Ambiguous shift time — use AM/PM (for example 9a-5p) or 24-hour time':'Invalid shift time'};
  }
  var date=dateForDay($('lab-week').value,dayIndex),messages=[],hard=false;
  var av=parseAvailability(emp.availability[dayIndex],dayIndex);
  if(av.off){messages.push('Outside normal availability');hard=true;}
  else if(!av.any&&!av.invalid&&(shift.start<av.start||shift.end>av.end)){messages.push('Outside normal availability');hard=true;}
  else if(av.invalid){messages.push('Check availability format');}
  if(emp.recurringOff[dayIndex])messages.push('Recurring day-off request');
  var req=activeRequestFor(emp,date,shift,dayIndex);
  if(req){ if(req.status==='approved'){messages.push('Approved time off');hard=true;} else messages.push('Time-off request pending'); }
  var cal=calendarRuleConflict(emp,date,shift);if(cal){messages=messages.concat(cal.messages);if(cal.hard)hard=true;}
  var sec=effectiveSection(emp,sectionOverride);
  if(sec!=='Unassigned'&&!isQualified(emp,sec))messages.push('Not marked qualified: '+sec);
  if(emp.noClosing&&/close/i.test(String(shiftText||''))){messages.push('Closing shifts disabled for this employee');hard=true;}
  if(emp.certification&&emp.certExpiry&&date&&date>emp.certExpiry){messages.push((emp.certification||'Required certification')+' expired');hard=true;}
  return messages.length?{level:hard?'hard':'soft',msg:messages.join(' • ')}:null;
}

function persistProfile(){ return saveJSON(PROFILE_KEY,profile); }
function persistSchedules(){ return saveJSON(SCHEDULE_KEY,schedules); }
function weekData(){ var wk=$('lab-week').value||'unspecified'; return schedules[wk]||{sales:'',shifts:{},sections:{},status:'draft',version:0,changeLog:[]}; }

function scheduleSignatureData(sales,shifts,sections){return JSON.stringify({sales:String(sales||''),shifts:shifts||{},sections:sections||{}});}
function scheduleSignatureForRecord(w){return scheduleSignatureData(w&&w.sales,w&&w.shifts,w&&w.sections);}
function addChangeLog(w,action,detail){w.changeLog=Array.isArray(w.changeLog)?w.changeLog:[];w.changeLog.unshift({at:new Date().toISOString(),action:action,detail:detail||''});w.changeLog=w.changeLog.slice(0,80);}
function scheduleStatusRecord(){var w=weekData();w.status=w.status||'draft';w.version=Number(w.version||0);w.changeLog=Array.isArray(w.changeLog)?w.changeLog:[];return w;}
function updateScheduleStatus(){var w=scheduleStatusRecord(),badge=$('schedule-status-badge'),ver=$('schedule-version');if(!badge||!ver)return;var status=w.status||'draft';badge.className='schedule-status-badge '+status;badge.textContent=status==='published'?'Published':(status==='revised'?'Revised':'Draft');ver.textContent=status==='published'?'v'+(w.version||1)+' • '+(w.publishedAt?new Date(w.publishedAt).toLocaleString():'published'):(status==='revised'?'Changed since published v'+(w.version||1):'Not published');}
function currentGridData(){var shifts={},sections={};body.querySelectorAll('tr[data-employee-id]').forEach(function(tr){var id=tr.dataset.employeeId;shifts[id]=Array.from(tr.querySelectorAll('.shift-input')).map(function(x){return x.value;});sections[id]=Array.from(tr.querySelectorAll('.shift-section')).map(function(x){return x.value;});});return {sales:$('lab-sales').value,shifts:shifts,sections:sections};}

function saveCurrentWeek(silent){
  var wk=$('lab-week').value;
  if(!wk){ if(!silent)$('lab-status').textContent='Choose a week starting date first.'; return false; }
  var grid=currentGridData(),prev=schedules[wk]||{},newSig=scheduleSignatureData(grid.sales,grid.shifts,grid.sections),oldSig=scheduleSignatureForRecord(prev);
  var rec={sales:grid.sales,shifts:grid.shifts,sections:grid.sections,savedAt:new Date().toISOString(),status:prev.status||'draft',version:Number(prev.version||0),publishedAt:prev.publishedAt||'',publishedSignature:prev.publishedSignature||'',publishedLink:prev.publishedLink||'',publishedCycle:prev.publishedCycle||'',changeLog:Array.isArray(prev.changeLog)?prev.changeLog.slice():[],lastSavedSignature:newSig};
  if(rec.publishedSignature && rec.publishedSignature!==newSig)rec.status='revised';
  else if(rec.publishedSignature && rec.publishedSignature===newSig)rec.status='published';
  else rec.status='draft';
  if(!silent && oldSig!==newSig)addChangeLog(rec,'Schedule saved',rec.status==='revised'?'Saved changes after the last published schedule.':'Saved current schedule.');
  var hadPrevious=Object.prototype.hasOwnProperty.call(schedules,wk),previousRecord=schedules[wk];
  schedules[wk]=rec;
  if(!persistSchedules()){
    if(hadPrevious)schedules[wk]=previousRecord;else delete schedules[wk];
    updateScheduleStatus();
    $('lab-status').textContent='Schedule could not be saved. Do not close Gravity Shift Lab until the storage problem is resolved or a workspace backup is created.';
    return false;
  }
  profile.lastViewedWeek=wk;
  if(!persistProfile())console.warn('Last-viewed week preference could not be saved; scheduled shifts were saved.');
  updateScheduleStatus();
  if(!silent)$('lab-status').textContent=rec.status==='revised'?'Week saved. This schedule changed after publishing and needs a new employee QR before posting.':'Week saved on this device.';
  return true;
}
function syncProfileFromRows(){
  body.querySelectorAll('tr[data-employee-id]').forEach(function(tr){
    var e=getEmployee(tr.dataset.employeeId); if(!e)return;
    e.name=tr.querySelector('.employee-name').value;
    e.role=tr.querySelector('.employee-role').value;
    e.homeSection=tr.querySelector('.employee-section').value;
    var wageInput=tr.querySelector('.employee-wage');
    if(payUnlocked&&wageInput)e.wage=wageInput.value;
  });
  profile.restaurant=$('lab-restaurant').value;
  profile.store=$('lab-store').value;
  profile.targetHours=$('lab-target-hours').value;
  profile.targetPercent=$('lab-target-percent').value;
  profile.conflictMode=$('lab-conflict-mode').value;
  persistProfile();
}
function refreshSectionSelects(){
  body.querySelectorAll('tr[data-employee-id]').forEach(function(tr){
    var emp=getEmployee(tr.dataset.employeeId); if(!emp)return;
    var home=tr.querySelector('.employee-section'),oldHome=home.value;
    home.innerHTML='<option value="">Unassigned</option>'+profile.sections.map(function(s){return '<option value="'+esc(s)+'">'+esc(s)+'</option>';}).join('');
    home.value=profile.sections.indexOf(oldHome)>=0?oldHome:(profile.sections.indexOf(emp.homeSection)>=0?emp.homeSection:'');
    tr.querySelectorAll('.shift-section').forEach(function(sel){
      var old=sel.value; sel.innerHTML=sectionOptions(old,'Home: '+(home.value||'Unassigned')); sel.value=old;
    });
  });
}
function addEmployee(data,shifts,shiftSections){
  var emp=normalizeEmployee(data);
  if(!getEmployee(emp.id)){profile.employees.push(emp);persistProfile();}
  var tr=document.createElement('tr'); tr.dataset.employeeId=emp.id;
  var homeOptions='<option value="">Unassigned</option>'+profile.sections.map(function(s){return '<option value="'+esc(s)+'" '+(s===emp.homeSection?'selected':'')+'>'+esc(s)+'</option>';}).join('');
  tr.innerHTML=
    '<td><input class="employee-name" aria-label="Employee name" placeholder="Employee" value="'+esc(emp.name)+'">'+((emp.minor||emp.maxWeeklyHours||emp.noClosing||emp.certification)?'<small class="employee-flag-note">'+esc([emp.minor?'Minor review':'',emp.maxWeeklyHours?'Max '+emp.maxWeeklyHours+'h':'',emp.noClosing?'No closing':'',emp.certification?(emp.certification+(emp.certExpiry?' exp '+emp.certExpiry:'')):''].filter(Boolean).join(' • '))+'</small>':'')+'</td>'+ 
    '<td><input class="employee-role" aria-label="Employee role" placeholder="Role" value="'+esc(emp.role)+'"></td>'+ 
    '<td><select class="employee-section" aria-label="Home section">'+homeOptions+'</select></td>'+ 
    '<td class="wage-col">'+(payIsLocked()?'<span class="wage-locked-display">🔒 Manager only</span>':'<input class="employee-wage" aria-label="Hourly wage" type="number" min="0" step="0.25" placeholder="15.00" value="'+esc(emp.wage)+'">')+'</td>'+ 
    days.map(function(d,i){
      var ov=(shiftSections||[])[i]||'';
      return '<td class="shift-cell"><input class="shift-input" data-day="'+i+'" aria-label="'+esc(days[i])+' shift" placeholder="5p-close" value="'+esc((shifts||[])[i]||'')+'">'+
        '<select class="shift-section" data-day="'+i+'" aria-label="'+d+' section">'+sectionOptions(ov,'Home: '+(emp.homeSection||'Unassigned'))+'</select>'+ 
        '<button type="button" class="schedule-rule-chip" data-day="'+i+'" aria-label="Edit availability or time off"></button><span class="lab-cell-hours">0h</span><span class="lab-cell-alert"></span></td>';
    }).join('')+
    '<td class="lab-total">0h</td><td class="row-actions"><button type="button" class="lab-mini-btn rules-row">Rules</button><button type="button" class="lab-mini-btn remove-row" aria-label="Remove employee">×</button></td>';
  body.appendChild(tr);

  tr.querySelectorAll('.employee-name,.employee-role').forEach(function(x){ x.addEventListener('input',function(){syncProfileFromRows();recalc();}); }); var wageInput=tr.querySelector('.employee-wage');if(wageInput)wageInput.addEventListener('input',function(){syncProfileFromRows();recalc();});
  tr.querySelector('.employee-section').addEventListener('change',function(){
    syncProfileFromRows();
    tr.querySelectorAll('.shift-section').forEach(function(sel){ var old=sel.value; sel.innerHTML=sectionOptions(old,'Home: '+(this.value||'Unassigned')); sel.value=old; }.bind(this));
    recalc(); saveCurrentWeek(true);
  });
  tr.querySelectorAll('.shift-input,.shift-section').forEach(function(x){x.addEventListener('input',function(){recalc();saveCurrentWeek(true);});x.addEventListener('change',function(){if(x.classList.contains('shift-input'))x.value=normalizeShiftEntry(x.value);recalc();saveCurrentWeek(true);});if(x.classList.contains('shift-input'))x.addEventListener('blur',function(){x.value=normalizeShiftEntry(x.value);recalc();saveCurrentWeek(true);});});
  tr.querySelectorAll('.schedule-rule-chip').forEach(function(chip){chip.addEventListener('click',function(){var dayIndex=+chip.dataset.day,date=dateForDay($('lab-week').value,dayIndex);openAvailabilityCalendar(emp.id,date);});});
  tr.querySelector('.rules-row').addEventListener('click',function(){openRules(emp.id);});
  tr.querySelector('.remove-row').addEventListener('click',function(){
    if(!confirm('Remove this employee profile and their saved shifts?'))return;
    profile.employees=profile.employees.filter(function(e){return e.id!==emp.id;});
    Object.keys(schedules).forEach(function(k){ if(schedules[k]&&schedules[k].shifts)delete schedules[k].shifts[emp.id]; if(schedules[k]&&schedules[k].sections)delete schedules[k].sections[emp.id]; });
    persistProfile();persistSchedules();tr.remove();recalc();
  });
  recalc();
}
function renderWeek(){
  updateDayHeaders();
  body.innerHTML='';
  var w=weekData(); $('lab-sales').value=w.sales||'';
  profile.employees.forEach(function(emp){addEmployee(emp,(w.shifts||{})[emp.id]||[],(w.sections||{})[emp.id]||[]);});
  if(!profile.employees.length){
    for(var i=0;i<3;i++){var e=normalizeEmployee({});profile.employees.push(e);addEmployee(e,[],[]);} persistProfile();
  }
  recalc();
}
function renderSectionCoverage(matrix){
  if(!sectionCoverage)return;
  var names=profile.sections.slice();
  if(matrix.Unassigned && matrix.Unassigned.some(function(n){return n>0;})) names.push('Unassigned');
  sectionCoverage.innerHTML='<table class="section-coverage-table"><thead><tr><th>Section</th>'+days.map(function(d){return '<th>'+d+'</th>';}).join('')+'</tr></thead><tbody>'+names.map(function(s){
    var row=matrix[s]||[0,0,0,0,0,0,0];
    return '<tr><td>'+esc(s)+'</td>'+row.map(function(n){return '<td class="'+(n===0?'section-zero':'')+'">'+n+'</td>';}).join('')+'</tr>';
  }).join('')+'</tbody></table>';
}
function updateDayHeaders(){
  var week=$('lab-week').value;
  document.querySelectorAll('.lab-day-head').forEach(function(th){
    var i=+th.dataset.dayIndex,date=dateForDay(week,i),small=th.querySelector('small');
    if(!small)return;
    if(!date){small.textContent='';return;}
    var d=new Date(date+'T12:00:00');small.textContent=(d.getMonth()+1)+'/'+d.getDate();
  });
}
function scheduleRuleSummary(emp,date,dayIndex){
  if(!emp||!date)return null;
  var hard=[],requested=[],avail=[];
  (emp.requests||[]).filter(function(r){return r.date===date&&r.status!=='denied';}).forEach(function(r){
    if(r.status==='approved')hard.push('Approved off'); else requested.push('Requested off');
  });
  (emp.calendarRules||[]).filter(function(r){return r.date===date;}).forEach(function(r){
    if(r.kind==='cannotWork')hard.push('Cannot work');
    else if(r.kind==='availableAfter')avail.push('After '+(r.time||''));
    else if(r.kind==='availableUntil')avail.push('Until '+(r.time||''));
  });
  if(emp.recurringOff&&emp.recurringOff[dayIndex])requested.push('Request off ↻');
  var av=String(emp.availability&&emp.availability[dayIndex]||'').trim();
  if(av){
    if(/^(off|unavailable|na|n\/a)$/i.test(av))hard.push('Unavailable ↻');
    else if(!/^(any|open|available)$/i.test(av))avail.push('Avail '+av+' ↻');
  }
  var list=hard.length?hard:(requested.length?requested:avail),kind=hard.length?'hard':(requested.length?'requested':'availability');
  if(!list.length)return null;
  return {kind:kind,text:list.slice(0,2).join(' • ')+(list.length>2?' • +'+(list.length-2):'')};
}
function recalc(){
  syncProfileFromRows();
  var totalH=0,totalD=0,hourlyWageCost=0,ot=0,counts=[0,0,0,0,0,0,0],hoursList=[],hardConflicts=0,softConflicts=0,sectionMatrix={};
  profile.sections.forEach(function(s){sectionMatrix[s]=[0,0,0,0,0,0,0];}); sectionMatrix.Unassigned=[0,0,0,0,0,0,0];
  body.querySelectorAll('tr[data-employee-id]').forEach(function(tr){
    var emp=getEmployee(tr.dataset.employeeId),wage=parseFloat(emp&&emp.wage)||0,rowH=0;
    var shiftInputs=tr.querySelectorAll('.shift-input'),sectionInputs=tr.querySelectorAll('.shift-section');
    shiftInputs.forEach(function(inp,i){
      var normalized=normalizeShiftEntry(inp.value); if(inp.value!==normalized)inp.value=normalized;
      var h=shiftHours(inp.value,i); rowH+=h; if(h>0)counts[i]++;
      var cell=inp.closest('.shift-cell'),hours=cell.querySelector('.lab-cell-hours'),alert=cell.querySelector('.lab-cell-alert'),override=sectionInputs[i].value,chip=cell.querySelector('.schedule-rule-chip');
      var cellDate=dateForDay($('lab-week').value,i),ruleSummary=scheduleRuleSummary(emp,cellDate,i);
      cell.classList.toggle('has-rule',!!ruleSummary);cell.classList.toggle('shift-off',isOffShift(inp.value));cell.classList.toggle('shift-marker',isOpenMarker(inp.value)||isCloseMarker(inp.value));
      if(chip){chip.className='schedule-rule-chip'+(ruleSummary?' visible '+ruleSummary.kind:'');chip.textContent=ruleSummary?ruleSummary.text:'';chip.title=ruleSummary?'Tap to edit availability/time off for this date':'';}
      hours.textContent=h?h.toFixed(1)+'h':'0h';
      var sec=effectiveSection(emp,override); if(h>0){if(!sectionMatrix[sec])sectionMatrix[sec]=[0,0,0,0,0,0,0];sectionMatrix[sec][i]++;}
      var c=emp?conflictFor(emp,i,inp.value,override):null;
      cell.classList.remove('conflict-hard','conflict-soft');alert.textContent='';
      if(c){cell.classList.add(c.level==='hard'?'conflict-hard':'conflict-soft');alert.textContent=c.msg;if(c.level==='hard')hardConflicts++;else softConflicts++;}
    });
    tr.querySelector('.lab-total').textContent=rowH.toFixed(1)+'h';tr.querySelector('.lab-total').classList.toggle('lab-warn',rowH>40);
    var rowCost=(Math.min(rowH,40)*wage)+(Math.max(0,rowH-40)*wage*1.5);var isMgmt=String(emp&&emp.homeSection||'').toLowerCase()==='management';if(!(isMgmt&&(profile.managementLaborMode==='exclude'||profile.managementLaborMode==='salary-only')))hourlyWageCost+=rowCost;totalH+=rowH;if(rowH>40)ot++;if(emp&&emp.maxWeeklyHours&&rowH>Number(emp.maxWeeklyHours)){hardConflicts++;tr.querySelector('.lab-total').title='Over employee custom maximum of '+emp.maxWeeklyHours+' hours';}if(rowH>0)hoursList.push(rowH);
  });
  var salaryAllocation=profile.managementLaborMode==='exclude'?0:Math.max(0,Number(profile.managerSalaryAllocation||0));
  var sales=parseFloat($('lab-sales').value)||0;
  var targetP=parseFloat($('lab-target-percent').value)||0;
  var laborProjection=GravityLaborCostEngine.projected({hourlyWages:hourlyWageCost,salaryAllocation:salaryAllocation,
    hourlyBurdenPercent:profile.hourlyBurdenPercent,forecastSales:sales||null,targetPercent:targetP>100?null:(targetP||null)});
  var totalD=laborProjection.total;
  $('g-hours').textContent=totalH.toFixed(1);if(payIsLocked()){$('g-dollars').textContent='🔒 Locked';$('g-dollars').classList.add('locked-value');if($('g-dollars-lock-note'))$('g-dollars-lock-note').textContent='• manager only';}else{$('g-dollars').textContent=money(totalD);$('g-dollars').classList.remove('locked-value');if($('g-dollars-lock-note'))$('g-dollars-lock-note').textContent='';}$('g-ot').textContent=ot;
  $('g-percent').textContent=laborProjection.laborPercent!==null?laborProjection.laborPercent.toFixed(1)+'%':'—';
  var targetH=parseFloat($('lab-target-hours').value)||0,msgs=[];
  if(targetP>100)msgs.push('Labor target must be 0–100%');
  var basisText=laborProjection.burdenConfigured?'Includes manager-set estimated burden on hourly wages; salary allocation is not burdened again.':'Employer payroll taxes and benefits NOT included. Unlock Manager Settings to enter an optional hourly burden estimate.';
  $('lab-cost-basis').textContent=basisText+' Scheduled shift times do not automatically deduct unpaid breaks. Estimates are not actual payroll.';
  var budgetText=laborProjection.budgetDollars!==null?'Target labor dollars: '+money(laborProjection.budgetDollars)+' • Estimated cost: '+money(totalD)+' • Variance: '+money(laborProjection.budgetVariance):'Enter forecast sales and labor target % to compare an estimated dollar budget.';
  $('lab-private-budget').textContent=payIsLocked()?'Labor budget dollars and manager wage details are protected.':budgetText;

  if(targetH&&totalH>targetH)msgs.push('Hours '+(totalH-targetH).toFixed(1)+' over target');
  if(laborProjection.budgetVariance!==null&&laborProjection.budgetVariance>0)msgs.push('Estimated labor dollars over target');
  if(hoursList.length>1){var max=Math.max.apply(null,hoursList),min=Math.min.apply(null,hoursList);if(max-min>20)msgs.push('Wide hours spread');}
  if(hardConflicts)msgs.push(hardConflicts+' hard conflict'+(hardConflicts>1?'s':''));
  if(softConflicts)msgs.push(softConflicts+' review item'+(softConflicts>1?'s':''));
  var emptyCritical=[];
  profile.sections.forEach(function(s){for(var i=0;i<7;i++){if(sectionMatrix[s][i]===0)emptyCritical.push(s+' '+days[i]);}});
  var fairness=$('lab-fairness');fairness.textContent=msgs.length?msgs.join(' • '):profile.employees.length?'Coverage/labor review clear.':'Add employees to begin.';fairness.className=msgs.length?'lab-warn':'lab-ok';
  coverage.innerHTML=days.map(function(d,i){return '<div class="coverage-day"><strong>'+counts[i]+'</strong><span>'+d+' scheduled</span></div>';}).join('');
  renderSectionCoverage(sectionMatrix);
  var restaurant=$('lab-restaurant').value||'Employee Schedule',week=$('lab-week').value;$('lab-title').textContent=restaurant+(week?' • Week of '+week:'');
  if($('lab-print-summary')){
    var managementBasis=profile.managementLaborMode==='exclude'?'excluded':profile.managementLaborMode==='salary-only'?'salaried only (Management section hourly excluded)':'included'+(Number(profile.managerSalaryAllocation||0)?' + protected salary allocation':'');
    var managerSummary=payIsLocked()
      ? ' • Manager pay details locked • Management labor: '+managementBasis
      : ' • '+totalH.toFixed(1)+' scheduled hours • '+money(totalD)+' estimated labor'+(sales?' • '+((totalD/sales)*100).toFixed(1)+'% of forecast sales':'')+' • Employer hourly burden: '+(laborProjection.burdenConfigured?'included (estimated)':'excluded')+' • Management labor: '+managementBasis;
    $('lab-print-summary').innerHTML='<strong>'+esc(restaurant)+'</strong>'+(profile.store?' • '+esc(profile.store):'')+(week?' • Week of '+esc(week):'')+'<span class="manager-private">'+managerSummary+'</span>';
  }
  updateScheduleStatus();
  return {hard:hardConflicts,soft:softConflicts,totalHours:totalH,totalDollars:totalD};
}

function openRules(id){
  currentRulesEmployeeId=id;var emp=getEmployee(id);if(!emp)return;
  $('rules-employee-name').textContent=emp.name||'Unnamed employee';
  $('rules-phone').value=emp.phone||'';$('rules-max-hours').value=emp.maxWeeklyHours||'';$('rules-minor').checked=!!emp.minor;$('rules-no-closing').checked=!!emp.noClosing;$('rules-certification').value=emp.certification||'';$('rules-cert-expiry').value=emp.certExpiry||'';
  var phoneEditable=!payIsLocked();$('rules-phone').disabled=!phoneEditable;$('rules-phone-privacy-note').textContent=phoneEditable?'Phone is manager-maintained. Visibility in Find Coverage follows the protected privacy setting.':'Phone number editing is locked. Find Coverage visibility follows the manager privacy setting.';
  $('rules-home-section').innerHTML='<option value="">Unassigned</option>'+profile.sections.map(function(s){return '<option value="'+esc(s)+'" '+(s===emp.homeSection?'selected':'')+'>'+esc(s)+'</option>';}).join('');
  $('rules-qualified-sections').innerHTML=profile.sections.map(function(s){var checked=(emp.qualifiedSections||[]).indexOf(s)>=0||s===emp.homeSection;return '<label><input class="qualified-section-input" type="checkbox" value="'+esc(s)+'" '+(checked?'checked':'')+'> '+esc(s)+'</label>';}).join('');
  var tbody=$('availability-body');tbody.innerHTML=days.map(function(d,i){return '<tr><th>'+d+'</th><td><input class="availability-input" data-day="'+i+'" aria-label="'+esc(d)+' availability" placeholder="Any / Off / 4p-close" value="'+esc(emp.availability[i]||'')+'"></td><td><label class="checkline"><input class="recurring-off-input" data-day="'+i+'" type="checkbox" '+(emp.recurringOff[i]?'checked':'')+'> Always request '+d+' off</label></td></tr>';}).join('');
  renderRequests(emp);$('employee-rules-dialog').showModal();
}
function renderRequests(emp){
  var list=$('request-list'),today=isoDate(new Date()),active=[],history=[];
  (emp.requests||[]).slice().sort(function(a,b){return String(a.date).localeCompare(String(b.date));}).forEach(function(r){(r.date>=today?active:history).push(r);});
  function row(r){return '<div class="request-card"><div><strong>'+esc(r.date)+'</strong> • '+(r.fullDay?'All day':esc((r.start||'')+'-'+(r.end||'')))+' • <span class="request-status '+esc(r.status)+'">'+esc(r.status)+'</span>'+(r.note?'<small>'+esc(r.note)+'</small>':'')+'</div><button class="lab-mini-btn request-delete" data-id="'+esc(r.id)+'" type="button">Remove</button></div>';}
  list.innerHTML='<h4>Active / upcoming</h4>'+(active.length?active.map(row).join(''):'<p class="muted-small">No active date-specific requests.</p>')+'<details><summary>Expired/history ('+history.length+')</summary>'+(history.length?history.map(row).join(''):'<p class="muted-small">No history yet.</p>')+'</details>';
  list.querySelectorAll('.request-delete').forEach(function(btn){btn.addEventListener('click',function(){emp.requests=emp.requests.filter(function(r){return r.id!==btn.dataset.id;});persistProfile();renderRequests(emp);recalc();});});
}
function saveRules(){
  var emp=getEmployee(currentRulesEmployeeId);if(!emp)return;
  if(!payIsLocked())emp.phone=$('rules-phone').value.trim();emp.maxWeeklyHours=$('rules-max-hours').value;emp.minor=$('rules-minor').checked;emp.noClosing=$('rules-no-closing').checked;emp.certification=$('rules-certification').value.trim();emp.certExpiry=$('rules-cert-expiry').value;
  emp.homeSection=$('rules-home-section').value;
  emp.qualifiedSections=Array.from(document.querySelectorAll('.qualified-section-input:checked')).map(function(x){return x.value;});
  if(emp.homeSection&&emp.qualifiedSections.indexOf(emp.homeSection)<0)emp.qualifiedSections.push(emp.homeSection);
  document.querySelectorAll('.availability-input').forEach(function(x){emp.availability[+x.dataset.day]=x.value;});
  document.querySelectorAll('.recurring-off-input').forEach(function(x){emp.recurringOff[+x.dataset.day]=x.checked;});
  persistProfile();$('employee-rules-dialog').close();renderWeek();saveCurrentWeek(true);
}
function addRequest(){
  var emp=getEmployee(currentRulesEmployeeId);if(!emp)return;var date=$('request-date').value;
  if(!date){$('rules-status').textContent='Choose a date first.';return;}
  var full=$('request-full-day').checked,start=$('request-start').value,end=$('request-end').value;
  if(!full&&(!start||!end)){$('rules-status').textContent='Enter start and end times, or choose All day.';return;}
  emp.requests.push({id:uid('r'),date:date,fullDay:full,start:full?'':start,end:full?'':end,status:$('request-status').value,note:$('request-note').value});
  persistProfile();$('request-date').value='';$('request-start').value='';$('request-end').value='';$('request-note').value='';$('rules-status').textContent='Request added.';renderRequests(emp);recalc();
}
function calendarMonthBase(){
  var wk=$('lab-week').value;
  var d=wk?new Date(wk+'T12:00:00'):new Date();
  if(isNaN(d))d=new Date();
  return new Date(d.getFullYear(),d.getMonth(),1,12,0,0);
}
function employeeDisplayName(emp){
  var n=String(emp&&emp.name||'').trim();
  return n||'Unnamed employee';
}
function shortEmployeeName(emp){
  var n=employeeDisplayName(emp).split(/\s+/)[0];
  return n.length>12?n.slice(0,11)+'…':n;
}
function recurringRuleForDate(emp,date){
  var d=new Date(date+'T12:00:00');if(isNaN(d))return [];
  var dow=d.getDay(),out=[],av=String(emp.availability[dow]||'').trim();
  if(emp.recurringOff[dow])out.push({source:'repeat-request',kind:'requestedOff',label:'Request off',repeat:true});
  if(/^off$|^unavailable$|^na$|^n\/a$/i.test(av))out.push({source:'repeat-availability',kind:'cannotWork',label:'Cannot work',repeat:true});
  else if(av&& !/^(any|open|available)$/i.test(av))out.push({source:'repeat-availability',kind:'availability',label:av,repeat:true});
  return out;
}
function rulesForCalendarDate(emp,date){
  var out=[];
  (emp.requests||[]).filter(function(r){return r.date===date&&r.status!=='denied';}).forEach(function(r){
    out.push({source:'request',id:r.id,kind:r.status==='approved'?'approvedOff':'requestedOff',label:r.status==='approved'?'Approved off':'Requested off',repeat:false,note:r.note||''});
  });
  (emp.calendarRules||[]).filter(function(r){return r.date===date;}).forEach(function(r){
    out.push({source:'calendar',id:r.id,kind:r.kind,label:calendarRuleLabel(r),repeat:false,note:r.note||''});
  });
  return out.concat(recurringRuleForDate(emp,date));
}
function ruleBadgeClass(rule){
  if(rule.kind==='requestedOff')return 'requested';
  if(rule.kind==='approvedOff')return 'approved';
  if(rule.kind==='cannotWork')return 'unavailable';
  return 'availability';
}
function renderCalendarEmployees(){
  var list=$('calendar-employee-list');
  if(!list)return;
  if(!profile.employees.length){list.innerHTML='<div class="calendar-empty-note">Add employees to Shift Lab first.</div>';return;}
  list.innerHTML=profile.employees.map(function(emp){
    return '<button class="calendar-employee-chip '+(emp.id===calendarSelectedEmployeeId?'selected':'')+'" draggable="true" data-employee-id="'+esc(emp.id)+'" type="button"><strong>'+esc(employeeDisplayName(emp))+'</strong>'+(emp.homeSection?'<small style="display:block;color:#9dc1c0;margin-top:2px">'+esc(emp.homeSection)+'</small>':'')+'</button>';
  }).join('');
  list.querySelectorAll('.calendar-employee-chip').forEach(function(btn){
    btn.addEventListener('click',function(){calendarSelectedEmployeeId=btn.dataset.employeeId;renderCalendarEmployees();$('calendar-status').textContent='Selected '+employeeDisplayName(getEmployee(calendarSelectedEmployeeId))+'. Now tap a date.';});
    btn.addEventListener('dragstart',function(e){calendarSelectedEmployeeId=btn.dataset.employeeId;e.dataTransfer.setData('text/plain',calendarSelectedEmployeeId);e.dataTransfer.effectAllowed='copy';});
  });
}
function renderCalendarAlert(){
  var strip=$('calendar-alert-strip');if(!strip)return;
  var wk=$('lab-week').value,count=0,people={};
  if(wk){
    for(var i=0;i<7;i++){
      var date=dateForDay(wk,i);
      profile.employees.forEach(function(emp){var rules=rulesForCalendarDate(emp,date);if(rules.length){count+=rules.length;people[emp.id]=1;}});
    }
  }
  strip.innerHTML='<strong>Before you schedule:</strong> '+(count?count+' availability/time-off rule'+(count===1?'':'s')+' affect the selected week across '+Object.keys(people).length+' employee'+(Object.keys(people).length===1?'':'s')+'. ':'No saved availability/time-off rules affect the selected week yet. ')+'<strong>Easy method:</strong> tap an employee, tap the date, choose the rule, choose One Time or Repeat, and save. <strong>Desktop shortcut:</strong> drag the employee onto the date.';
}
function renderCalendar(){
  if(!calendarMonth)calendarMonth=calendarMonthBase();
  renderCalendarEmployees();renderCalendarAlert();
  var title=$('calendar-month-title'),grid=$('calendar-grid');if(!title||!grid)return;
  title.textContent=calendarMonth.toLocaleDateString(undefined,{month:'long',year:'numeric'});
  var first=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth(),1,12,0,0),start=new Date(first);start.setDate(1-first.getDay());
  var today=isoDate(new Date()),html='';
  for(var cell=0;cell<42;cell++){
    var d=new Date(start);d.setDate(start.getDate()+cell);var date=isoDate(d),inMonth=d.getMonth()===calendarMonth.getMonth(),badges=[];
    profile.employees.forEach(function(emp){
      rulesForCalendarDate(emp,date).forEach(function(rule){badges.push({emp:emp,rule:rule});});
    });
    var shown=badges.slice(0,4).map(function(x){return '<span class="calendar-rule-badge '+ruleBadgeClass(x.rule)+(x.rule.repeat?' repeat':'')+'" title="'+esc(employeeDisplayName(x.emp)+' — '+x.rule.label)+'">'+esc(shortEmployeeName(x.emp))+' • '+esc(x.rule.label)+'</span>';}).join('');
    if(badges.length>4)shown+='<span class="calendar-rule-badge availability">+'+(badges.length-4)+' more</span>';
    html+='<button class="calendar-day '+(!inMonth?'other-month ':'')+(date===today?'today ':'')+'" data-calendar-date="'+date+'" type="button"><span class="calendar-date-number"><span>'+d.getDate()+'</span>'+(date===today?'<small>Today</small>':'')+'</span><span class="calendar-badges">'+shown+'</span></button>';
  }
  grid.innerHTML=html;
  grid.querySelectorAll('.calendar-day').forEach(function(day){
    day.addEventListener('dragover',function(e){e.preventDefault();day.classList.add('drop-target');});
    day.addEventListener('dragleave',function(){day.classList.remove('drop-target');});
    day.addEventListener('drop',function(e){e.preventDefault();day.classList.remove('drop-target');var empId=e.dataTransfer.getData('text/plain')||calendarSelectedEmployeeId;if(empId)openCalendarEditor(empId,day.dataset.calendarDate);});
    day.addEventListener('click',function(){if(!calendarSelectedEmployeeId){$('calendar-status').textContent='Select an employee first, then choose the date.';return;}openCalendarEditor(calendarSelectedEmployeeId,day.dataset.calendarDate);});
  });
}
function openAvailabilityCalendar(empId,date){
  syncProfileFromRows();
  if(!profile.employees.length){$('lab-status').textContent='Add an employee first, then open the Availability Calendar.';return;}
  var chosen=empId&&getEmployee(empId)?empId:profile.employees[0].id;
  if(date){var d=new Date(date+'T12:00:00');calendarMonth=new Date(d.getFullYear(),d.getMonth(),1,12,0,0);}else calendarMonth=calendarMonthBase();
  calendarSelectedEmployeeId=chosen;calendarSelectedDate=null;
  $('calendar-editor').hidden=true;$('calendar-status').textContent='';renderCalendar();$('availability-calendar-dialog').showModal();
  if(date)setTimeout(function(){openCalendarEditor(chosen,date);},20);
}
function updateCalendarTimeField(){
  var k=$('calendar-rule-kind').value,needs=k==='availableAfter'||k==='availableUntil';
  $('calendar-time-field').style.display=needs?'grid':'none';
}
function openCalendarEditor(empId,date){
  var emp=getEmployee(empId);if(!emp)return;
  calendarSelectedEmployeeId=empId;calendarSelectedDate=date;
  var d=new Date(date+'T12:00:00');
  $('calendar-editor-title').textContent=employeeDisplayName(emp)+' • '+d.toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'});
  $('calendar-editor-subtitle').textContent='Choose what applies, then choose One Time or Repeat every '+d.toLocaleDateString(undefined,{weekday:'long'})+'.';
  $('calendar-repeat-day').textContent=d.toLocaleDateString(undefined,{weekday:'long'});
  $('calendar-rule-kind').value='requestedOff';$('calendar-rule-time').value='';$('calendar-rule-note').value='';
  document.querySelectorAll('input[name="calendar-frequency"]').forEach(function(x){x.checked=false;});
  $('calendar-status').textContent='';$('calendar-editor').hidden=false;updateCalendarTimeField();renderCalendarExistingRules(emp,date);renderCalendarEmployees();
  $('calendar-editor').scrollIntoView({behavior:'smooth',block:'nearest'});
}
function renderCalendarExistingRules(emp,date){
  var box=$('calendar-existing-rules');if(!box)return;
  var d=new Date(date+'T12:00:00'),dow=d.getDay(),rows=[];
  (emp.requests||[]).filter(function(r){return r.date===date&&r.status!=='denied';}).forEach(function(r){rows.push('<div class="request-card"><div><strong>One Time</strong> • '+esc(r.status==='approved'?'Approved off':'Requested off')+(r.note?'<small>'+esc(r.note)+'</small>':'')+'</div><button class="lab-mini-btn calendar-remove-rule" data-source="request" data-id="'+esc(r.id)+'" type="button">Remove</button></div>');});
  (emp.calendarRules||[]).filter(function(r){return r.date===date;}).forEach(function(r){rows.push('<div class="request-card"><div><strong>One Time</strong> • '+esc(calendarRuleLabel(r))+(r.note?'<small>'+esc(r.note)+'</small>':'')+'</div><button class="lab-mini-btn calendar-remove-rule" data-source="calendar" data-id="'+esc(r.id)+'" type="button">Remove</button></div>');});
  if(emp.recurringOff[dow])rows.push('<div class="request-card"><div><strong>Repeat every '+esc(days[dow])+'</strong> • Request off</div><button class="lab-mini-btn calendar-remove-rule" data-source="repeat-request" type="button">Remove</button></div>');
  var av=String(emp.availability[dow]||'').trim();if(av&& !/^(any|open|available)$/i.test(av))rows.push('<div class="request-card"><div><strong>Repeat every '+esc(days[dow])+'</strong> • '+esc(/^off$|^unavailable$|^na$|^n\/a$/i.test(av)?'Cannot work':av)+'</div><button class="lab-mini-btn calendar-remove-rule" data-source="repeat-availability" type="button">Remove</button></div>');
  box.innerHTML=rows.length?'<h4 style="margin:14px 0 7px">Rules already affecting this date</h4>'+rows.join(''):'';
  box.querySelectorAll('.calendar-remove-rule').forEach(function(btn){btn.addEventListener('click',function(){
    var source=btn.dataset.source;
    if(source==='request')emp.requests=(emp.requests||[]).filter(function(r){return r.id!==btn.dataset.id;});
    else if(source==='calendar')emp.calendarRules=(emp.calendarRules||[]).filter(function(r){return r.id!==btn.dataset.id;});
    else if(source==='repeat-request')emp.recurringOff[dow]=false;
    else if(source==='repeat-availability')emp.availability[dow]='';
    persistProfile();renderCalendarExistingRules(emp,date);renderCalendar();recalc();saveCurrentWeek(true);$('calendar-status').textContent='Rule removed.';
  });});
}
function saveCalendarRule(){
  var emp=getEmployee(calendarSelectedEmployeeId),date=calendarSelectedDate;if(!emp||!date)return;
  var kind=$('calendar-rule-kind').value,time=String($('calendar-rule-time').value||'').trim(),note=$('calendar-rule-note').value||'';
  var freqEl=document.querySelector('input[name="calendar-frequency"]:checked');
  if(!freqEl){$('calendar-status').textContent='Choose One Time or Repeat before saving.';return;}
  if((kind==='availableAfter'||kind==='availableUntil')&&parseTime(time)==null){$('calendar-status').textContent='Enter a valid time such as 4p or 10:30a.';return;}
  var frequency=freqEl.value,d=new Date(date+'T12:00:00'),dow=d.getDay();
  if(frequency==='once'){
    if(kind==='requestedOff'||kind==='approvedOff')emp.requests.push({id:uid('r'),date:date,fullDay:true,start:'',end:'',status:kind==='approvedOff'?'approved':'requested',note:note,source:'calendar'});
    else emp.calendarRules.push({id:uid('c'),date:date,kind:kind,time:time,note:note,createdAt:new Date().toISOString()});
  }else{
    if(kind==='requestedOff')emp.recurringOff[dow]=true;
    else if(kind==='approvedOff'||kind==='cannotWork')emp.availability[dow]='Off';
    else if(kind==='availableAfter')emp.availability[dow]=time+'-close';
    else if(kind==='availableUntil')emp.availability[dow]='12a-'+time;
  }
  persistProfile();renderCalendar();renderCalendarExistingRules(emp,date);recalc();saveCurrentWeek(true);
  $('calendar-status').textContent=(frequency==='once'?'One-time':'Repeating')+' rule saved for '+employeeDisplayName(emp)+'.';
  $('calendar-rule-note').value='';document.querySelectorAll('input[name="calendar-frequency"]').forEach(function(x){x.checked=false;});
}

function openSections(){ $('sections-text').value=profile.sections.join('\n'); $('sections-dialog').showModal(); }
function saveSections(){
  var names=uniqueNames($('sections-text').value.split(/\r?\n|,/));
  if(!names.length){alert('Keep at least one section or station.');return;}
  profile.sections=names;persistProfile();$('sections-dialog').close();refreshSectionSelects();recalc();saveCurrentWeek(true);$('lab-status').textContent='Sections / stations saved and carried forward.';
}
function openCloseSettings(){
  var body=$('close-settings-body');
  body.innerHTML=days.map(function(d,i){return '<tr><th>'+d+'</th><td><input class="open-time-input" data-day="'+i+'" aria-label="'+esc(d)+' opening time" placeholder="11a" value="'+esc(profile.openTimes[i]||'')+'"></td><td><input class="open-allowance-input" data-day="'+i+'" aria-label="'+esc(d)+' setup allowance hours" type="number" min="0" step="0.25" placeholder="0" value="'+esc(profile.openAllowance[i]||0)+'"></td><td><input class="close-time-input" data-day="'+i+'" aria-label="'+esc(d)+' closing time" placeholder="10p" value="'+esc(profile.closeTimes[i]||'')+'"></td><td><input class="close-allowance-input" data-day="'+i+'" aria-label="'+esc(d)+' closing-work allowance hours" type="number" min="0" step="0.25" placeholder="1.5" value="'+esc(profile.closeAllowance[i]||0)+'"></td></tr>';}).join('');
  $('close-settings-dialog').showModal();
}
function saveCloseSettings(){
  document.querySelectorAll('.open-time-input').forEach(function(x){profile.openTimes[+x.dataset.day]=x.value.trim();});
  document.querySelectorAll('.open-allowance-input').forEach(function(x){profile.openAllowance[+x.dataset.day]=Math.max(0,Number(x.value||0));});
  document.querySelectorAll('.close-time-input').forEach(function(x){profile.closeTimes[+x.dataset.day]=x.value.trim();});
  document.querySelectorAll('.close-allowance-input').forEach(function(x){profile.closeAllowance[+x.dataset.day]=Math.max(0,Number(x.value||0));});
  persistProfile();$('close-settings-dialog').close();recalc();saveCurrentWeek(true);$('lab-status').textContent='Opening and closing rules saved. OFF, OPEN-end, and start-CLOSE entries now calculate consistently.';
}
function copyPreviousWeek(){
  var wk=$('lab-week').value;if(!wk){$('lab-status').textContent='Choose the new week first.';return;}
  var prev=previousWeekKey(wk),src=schedules[prev];if(!src){$('lab-status').textContent='No saved schedule found for '+prev+'.';return;}
  var copy={sales:'',shifts:{},sections:{},savedAt:new Date().toISOString()};
  Object.keys(src.shifts||{}).forEach(function(id){copy.shifts[id]=(src.shifts[id]||[]).slice();});
  Object.keys(src.sections||{}).forEach(function(id){copy.sections[id]=(src.sections[id]||[]).slice();});
  schedules[wk]=copy;persistSchedules();renderWeek();$('lab-status').textContent='Previous week copied. Review availability, time-off and section coverage before posting.';
}
function newNextWeek(){
  saveCurrentWeek(true);var wk=$('lab-week').value||isoDate(new Date()),next=nextWeekKey(wk);$('lab-week').value=next;renderWeek();$('lab-status').textContent='New week opened. Employee profiles, sections, availability and recurring rules carried forward.';
}
function downloadBackup(){
  if(payIsLocked()){openPayLockDialog('unlock');$('lab-status').textContent='Unlock Manager Pay Lock before downloading a workspace backup because it contains private wage data.';return;}
  syncProfileFromRows();saveCurrentWeek(true);var payload={version:5,exportedAt:new Date().toISOString(),profile:profile,schedules:schedules};
  var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.download='gravity-shift-lab-backup.json';a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},1000);
}
function restoreBackup(file){
  if(payIsLocked()){openPayLockDialog('unlock');$('lab-status').textContent='Unlock Manager Pay Lock before restoring a workspace backup.';return;}
  if(!file)return;var r=new FileReader();r.onload=function(){try{var x=JSON.parse(r.result);if(!x.profile||!x.schedules)throw new Error('Invalid backup');profile=x.profile;profile.sections=uniqueNames(profile.sections&&profile.sections.length?profile.sections:defaultSections());profile.employees=(profile.employees||[]).map(normalizeEmployee);schedules=x.schedules||{};persistProfile();persistSchedules();applyProfile();renderWeek();$('lab-status').textContent='Backup restored.';}catch(e){$('lab-status').textContent='Could not restore that backup file.';}};r.readAsText(file);
}
function downloadCSV(){
  if(payIsLocked()){openPayLockDialog('unlock');$('lab-status').textContent='Unlock Manager Pay Lock before exporting manager schedule data.';return;}
  var rows=[['Employee','Role','Home Section','Wage'].concat(days.map(function(d){return d+' Shift';})).concat(days.map(function(d){return d+' Section';})).concat(['Total Hours'])];
  body.querySelectorAll('tr[data-employee-id]').forEach(function(tr){
    var emp=getEmployee(tr.dataset.employeeId);var r=[tr.querySelector('.employee-name').value,tr.querySelector('.employee-role').value,tr.querySelector('.employee-section').value,emp?emp.wage:''],tot=0,sh=[],secs=[];tr.querySelectorAll('.shift-input').forEach(function(x,i){sh.push(x.value);tot+=shiftHours(x.value,i);secs.push(effectiveSection(emp,tr.querySelectorAll('.shift-section')[i].value));});
    r=r.concat(sh).concat(secs);r.push(tot.toFixed(1));rows.push(r);
  });
  var csv=rows.map(function(r){return r.map(function(v){return '"'+String(v||'').replace(/"/g,'""')+'"';}).join(',');}).join('\n');
  var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='gravity-shift-lab-manager-schedule.csv';a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},1000);
}
async function printSchedule(mode){
  if(mode==='manager'&&payIsLocked()){openPayLockDialog('unlock');$('lab-status').textContent='Unlock Manager Pay Lock before printing the Manager Labor Schedule.';return;}
  document.body.classList.toggle('print-manager',mode==='manager');
  syncProfileFromRows();var check=recalc();saveCurrentWeek(true);
  if(mode==='employee'&&profile.conflictMode==='strict'&&check.hard){document.body.classList.remove('print-manager');$('lab-status').textContent='Employee schedule not printed: resolve '+check.hard+' hard scheduling conflict'+(check.hard===1?'':'s')+' first, or change Conflict Mode to Warn Clearly.';return;}
  if(mode==='employee'){var pub=await ensurePublishedForPrint();if(!pub){document.body.classList.remove('print-manager');return;}}
  setTimeout(function(){window.print();setTimeout(function(){document.body.classList.remove('print-manager');},250);},40);
}

function requireManagerUnlock(message){if(!payLockConfigured()){openPayLockDialog('setup');$('lab-status').textContent=message||'Set Manager Pay Lock first.';return false;}if(payIsLocked()){openPayLockDialog('unlock');$('lab-status').textContent=message||'Unlock Manager Pay Lock first.';return false;}return true;}
function openManagerSettings(){if(!requireManagerUnlock('Unlock Manager Pay Lock to change labor-basis or contact-privacy settings.'))return;$('manager-labor-mode').value=profile.managementLaborMode||'include';$('manager-salary-allocation').value=profile.managerSalaryAllocation||'';$('manager-hourly-burden').value=profile.hourlyBurdenPercent||'';$('contact-visibility').value=profile.contactVisibility||'scheduler';$('manager-settings-status').textContent='';$('manager-settings-dialog').showModal();}
function saveManagerSettings(){
  var rawBurden=$('manager-hourly-burden').value.trim(),rawSalary=$('manager-salary-allocation').value.trim();
  var burden=rawBurden===''?null:Number(rawBurden),salary=rawSalary===''?0:Number(rawSalary);
  if((burden!==null&&(!Number.isFinite(burden)||burden<0||burden>100))||!Number.isFinite(salary)||salary<0){
    $('manager-settings-status').textContent='Enter a valid weekly salary of zero or more and an hourly burden between 0 and 100%, or leave burden blank.';
    return;
  }
  profile.managementLaborMode=$('manager-labor-mode').value||'include';
  profile.managerSalaryAllocation=rawSalary;
  profile.hourlyBurdenPercent=rawBurden;
  profile.contactVisibility=$('contact-visibility').value||'scheduler';
  persistProfile();$('manager-settings-dialog').close();recalc();
  $('lab-status').textContent='Protected labor cost-basis and contact privacy settings saved.';
}
function phoneCanShow(){return profile.contactVisibility==='scheduler'||(profile.contactVisibility==='manager'&&!payIsLocked());}
function phoneHTML(emp){if(profile.contactVisibility==='hidden')return '<span class="contact-hidden">Phone hidden by restaurant setting</span>';if(profile.contactVisibility==='manager'&&payIsLocked())return '<span class="contact-hidden">Phone manager-only</span>';if(!emp.phone)return '<span class="contact-hidden">No phone saved</span>';var clean=String(emp.phone).replace(/[^0-9+]/g,'');return '<span class="coverage-phone"><a href="tel:'+esc(clean)+'">Call '+esc(emp.phone)+'</a> • <a href="sms:'+esc(clean)+'">Text</a></span>';}
function hoursForEmployeeInWeek(empId,wk){var w=schedules[wk]||weekData(),arr=(w.shifts&&w.shifts[empId])||[],sum=0;arr.forEach(function(v,i){sum+=shiftHours(v,i);});return sum;}
function rangesOverlap(a,b){if(!a||!b)return false;return a.start<b.end&&b.start<a.end;}
function openFindCoverage(){saveCurrentWeek(true);var wk=$('lab-week').value;var daySel=$('coverage-day');daySel.innerHTML=days.map(function(d,i){var date=dateForDay(wk,i);return '<option value="'+i+'">'+d+(date?' • '+date:'')+'</option>';}).join('');var secSel=$('coverage-section');secSel.innerHTML=profile.sections.map(function(s){return '<option>'+esc(s)+'</option>';}).join('');$('coverage-shift').value='';$('coverage-reason').value='';$('coverage-results').innerHTML='';$('coverage-status').textContent='';$('coverage-dialog').showModal();}
function findCoverage(){saveCurrentWeek(true);var day=+$('coverage-day').value,shiftText=$('coverage-shift').value.trim(),section=$('coverage-section').value,wk=$('lab-week').value,date=dateForDay(wk,day),shift=parseShift(shiftText,day);if(!shift){$('coverage-status').textContent='Enter a valid shift such as 5p-close.';return;}var w=schedules[wk]||weekData(),candidates=[];profile.employees.forEach(function(emp){if(!isQualified(emp,section))return;var existing=String((w.shifts&&w.shifts[emp.id]||[])[day]||'').trim();if(existing)return;var c=conflictFor(emp,day,shiftText,section);if(c&&c.level==='hard')return;var currentHours=hoursForEmployeeInWeek(emp.id,wk),newHours=currentHours+shift.hours,ot=newHours>40,maxRisk=emp.maxWeeklyHours&&newHours>Number(emp.maxWeeklyHours);candidates.push({emp:emp,currentHours:currentHours,newHours:newHours,ot:ot,maxRisk:maxRisk,soft:c&&c.msg||'',home:emp.homeSection===section?0:1});});candidates.sort(function(a,b){return a.home-b.home||(a.ot?1:0)-(b.ot?1:0)||(a.maxRisk?1:0)-(b.maxRisk?1:0)||a.newHours-b.newHours||String(a.emp.name).localeCompare(String(b.emp.name));});var out=$('coverage-results');if(!candidates.length){out.innerHTML='';$('coverage-status').textContent='No qualified available prospects found for this shift under the current rules.';return;}$('coverage-status').textContent=candidates.length+' qualified available prospect'+(candidates.length===1?'':'s')+' found. Pay rates remain private.';out.innerHTML=candidates.map(function(x,i){var risk=[];if(x.ot)risk.push('would exceed 40 scheduled hours');if(x.maxRisk)risk.push('over custom max '+x.emp.maxWeeklyHours+'h');if(x.soft)risk.push(x.soft);return '<div class="coverage-candidate"><div><span class="coverage-rank">#'+(i+1)+'</span> <strong>'+esc(x.emp.name||'Unnamed employee')+'</strong><small>'+esc(x.emp.role||'')+(x.emp.homeSection?' • home: '+esc(x.emp.homeSection):'')+' • '+x.currentHours.toFixed(1)+'h currently → '+x.newHours.toFixed(1)+'h with coverage</small>'+(risk.length?'<small class="coverage-warning">'+esc(risk.join(' • '))+'</small>':'<small>Availability and qualification checks clear.</small>')+'<small>'+phoneHTML(x.emp)+'</small></div><div class="coverage-actions"><button class="lab-mini-btn coverage-assign" data-id="'+esc(x.emp.id)+'" type="button">Assign Shift</button></div></div>';}).join('');out.querySelectorAll('.coverage-assign').forEach(function(btn){btn.addEventListener('click',function(){assignCoverage(btn.dataset.id,day,shiftText,section);});});}
function assignCoverage(empId,day,shiftText,section){var tr=body.querySelector('tr[data-employee-id="'+CSS.escape(empId)+'"]');if(!tr)return;var inputs=tr.querySelectorAll('.shift-input'),secs=tr.querySelectorAll('.shift-section');inputs[day].value=shiftText;secs[day].value=section;recalc();saveCurrentWeek(false);$('coverage-status').textContent='Shift assigned to '+employeeDisplayName(getEmployee(empId))+'. Review and publish the revised employee schedule when ready.';findCoverage();}
function renderChangeLog(){var w=scheduleStatusRecord(),list=$('change-log-list');list.innerHTML=w.changeLog&&w.changeLog.length?w.changeLog.map(function(x){return '<div class="change-log-item"><strong>'+esc(x.action||'Change')+'</strong><small>'+esc(x.at?new Date(x.at).toLocaleString():'')+(x.detail?' • '+esc(x.detail):'')+'</small></div>';}).join(''):'<p class="muted-small">No saved or published changes recorded for this week yet.</p>';}
function openChangeLog(){renderChangeLog();$('change-log-dialog').showModal();}
function compactScheduleWeek(wk){var w=schedules[wk]||{},rows=[];profile.employees.forEach(function(emp){var sh=(w.shifts&&w.shifts[emp.id])||[],secs=(w.sections&&w.sections[emp.id])||[];if(!sh.some(function(x){return String(x||'').trim();}))return;rows.push([emp.name||'',emp.role||'',emp.homeSection||'',sh.slice(0,7),secs.slice(0,7)]);});return [wk,rows];}
function buildEmployeeSnapshot(cycle){saveCurrentWeek(true);var wk=$('lab-week').value,cycles=Math.max(1,Math.min(2,Number(cycle||1))),weeks=[];for(var i=0;i<cycles;i++){var key=i?nextWeekKey(wk):wk;if(i&& !schedules[key])continue;weeks.push(compactScheduleWeek(key));}return {v:1,r:profile.restaurant||'Restaurant',s:profile.store||'',p:new Date().toISOString(),w:weeks};}
function bytesToBase64Url(bytes){var bin='',chunk=0x8000;for(var i=0;i<bytes.length;i+=chunk)bin+=String.fromCharCode.apply(null,bytes.subarray(i,Math.min(i+chunk,bytes.length)));return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function base64UrlToBytes(s){s=String(s||'').replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';var bin=atob(s),a=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return a;}
async function encodeSnapshot(snapshot){var raw=new TextEncoder().encode(JSON.stringify(snapshot));if(window.CompressionStream){try{var cs=new CompressionStream('deflate-raw'),writer=cs.writable.getWriter();writer.write(raw);writer.close();var ab=await new Response(cs.readable).arrayBuffer();return 'd.'+bytesToBase64Url(new Uint8Array(ab));}catch(e){}}return 'r.'+bytesToBase64Url(raw);}
async function decodeSnapshot(payload){var parts=String(payload||'').split('.',2),bytes=base64UrlToBytes(parts.length===2?parts[1]:parts[0]);if(parts[0]==='d'&&window.DecompressionStream){var ds=new DecompressionStream('deflate-raw'),writer=ds.writable.getWriter();writer.write(bytes);writer.close();bytes=new Uint8Array(await new Response(ds.readable).arrayBuffer());}return JSON.parse(new TextDecoder().decode(bytes));}
function employeeScheduleHTML(snapshot,forPrint){var html='';(snapshot.w||[]).forEach(function(week){var wk=week[0],rows=week[1]||[];html+='<div class="employee-week-label">Week of '+esc(wk)+'</div><table class="employee-week-table"><thead><tr><th>Employee</th><th>Role / Section</th>'+days.map(function(d,i){var dt=dateForDay(wk,i);return '<th>'+d+(dt?'<br>'+esc(dt.slice(5)):'')+'</th>';}).join('')+'</tr></thead><tbody>'+rows.map(function(r){var name=r[0],role=r[1],home=r[2],sh=r[3]||[],secs=r[4]||[];return '<tr><td data-label="Employee">'+esc(name)+'</td><td data-label="Role / Section">'+esc(role)+(home?'<br><small>'+esc(home)+'</small>':'')+'</td>'+days.map(function(d,i){var shift=sh[i]||'',sec=secs[i]||home||'';return '<td data-label="'+esc(d)+'">'+(shift?'<strong>'+esc(shift)+'</strong>'+(sec?'<br><small>'+esc(sec)+'</small>':''):'—')+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table>';});return html||'<p>No scheduled shifts were included in this published snapshot.</p>';}
async function generatePublishedSchedule(cycle,showDialog){if(!saveCurrentWeek(true))return null;var check=recalc();if(profile.conflictMode==='strict'&&check.hard){$('lab-status').textContent='Schedule not published: resolve '+check.hard+' hard scheduling conflict'+(check.hard===1?'':'s')+' first, or change Conflict Mode to Warn Clearly.';return null;}var snap=buildEmployeeSnapshot(cycle||profile.publishCycle||'1'),payload=await encodeSnapshot(snap),link='https://thomasmonroebooks.com/gravity-shift-lab?employee=1#s='+payload;if(link.length>2800){$('lab-status').textContent='This QR snapshot is too large for dependable scanning. Publish one week at a time or reduce unused schedule text.';if($('publish-status'))$('publish-status').textContent=$('lab-status').textContent;return null;}if(!window.GravityQR){$('lab-status').textContent='QR encoder did not load. Refresh Shift Lab and try again.';return null;}try{window.GravityQR.renderCanvas($('publish-qr-canvas'),link,{level:'L',size:900,dark:'#000000',light:'#ffffff',quiet:4});}catch(e){$('lab-status').textContent='The schedule data is too large for this QR. Publish one week at a time.';return null;}publishedEmployeeLink=link;publishedEmployeeSnapshot=snap;profile.publishCycle=String(cycle||'1');persistProfile();var wk=$('lab-week').value,rec=schedules[wk]||weekData(),sig=scheduleSignatureForRecord(rec);var previousVersion=Number(rec.version||0),wasSame=rec.status==='published'&&rec.publishedSignature===sig&&String(rec.publishedCycle||'')===profile.publishCycle;rec.status='published';rec.version=wasSame?Math.max(1,previousVersion):previousVersion+1;rec.publishedAt=new Date().toISOString();rec.publishedSignature=sig;rec.publishedLink=link;rec.publishedCycle=profile.publishCycle;addChangeLog(rec,wasSame?'Published schedule reopened':'Employee schedule published','v'+rec.version+' • '+(profile.publishCycle==='2'?'two-week':'one-week')+' employee QR snapshot');schedules[wk]=rec;persistSchedules();updateScheduleStatus();renderEmployeePrintSnapshot(snap,link,rec.version);if($('publish-week-label'))$('publish-week-label').value=(profile.publishCycle==='2'?'Two-week cycle starting ':'Week of ')+wk;if($('publish-link'))$('publish-link').textContent=link;if($('publish-status'))$('publish-status').textContent='Published employee-safe snapshot v'+rec.version+'. This QR matches the posted schedule.';$('lab-status').textContent='Employee schedule published v'+rec.version+'. QR is ready for the posted schedule.';if(showDialog&&!$('publish-dialog').open)$('publish-dialog').showModal();return {snapshot:snap,link:link,version:rec.version};}
function renderEmployeePrintSnapshot(snapshot,link,version){var box=$('employee-print-snapshot');if(!box)return;box.innerHTML='<div class="employee-print-sheet"><div class="employee-print-head"><div class="employee-print-title"><h1>'+esc(snapshot.r||'Employee Schedule')+'</h1><p>'+(snapshot.s?'Store / Unit: '+esc(snapshot.s)+' • ':'')+'Published employee schedule • v'+esc(version||'')+'</p><p>Scan the QR to open this exact employee-facing schedule on your phone and download it instead of photographing the paper schedule.</p></div><div class="employee-print-qr"><canvas id="employee-print-qr-canvas" width="600" height="600"></canvas><div class="employee-print-qr-copy"><strong>Scan for the schedule</strong>No wages, labor dollars, phone numbers or manager notes are included.</div></div></div>'+employeeScheduleHTML(snapshot,true)+'</div>';var c=$('employee-print-qr-canvas');if(c&&window.GravityQR)window.GravityQR.renderCanvas(c,link,{level:'L',size:600,dark:'#000000',light:'#ffffff',quiet:4});}
async function ensurePublishedForPrint(){if(!saveCurrentWeek(true))return null;var w=weekData(),sig=scheduleSignatureForRecord(w),cycle=profile.publishCycle||'1';if(w.status==='published'&&w.publishedSignature===sig&&w.publishedLink&&String(w.publishedCycle||'1')===cycle){publishedEmployeeLink=w.publishedLink;try{var hash=w.publishedLink.split('#s=')[1];publishedEmployeeSnapshot=hash?await decodeSnapshot(hash):buildEmployeeSnapshot(cycle);}catch(e){publishedEmployeeSnapshot=buildEmployeeSnapshot(cycle);}renderEmployeePrintSnapshot(publishedEmployeeSnapshot,publishedEmployeeLink,w.version);return {snapshot:publishedEmployeeSnapshot,link:publishedEmployeeLink,version:w.version};}return await generatePublishedSchedule(cycle,false);}
function downloadPublishedQR(){var c=$('publish-qr-canvas');if(!publishedEmployeeLink||!c){$('publish-status').textContent='Generate the QR first.';return;}var a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='gravity-employee-schedule-qr.png';a.click();}
function openPublishedLink(){if(!publishedEmployeeLink){$('publish-status').textContent='Generate the QR first.';return;}window.open(publishedEmployeeLink,'_blank','noopener');}
async function copyPublishedLink(){if(!publishedEmployeeLink){$('publish-status').textContent='Generate the QR first.';return;}try{await navigator.clipboard.writeText(publishedEmployeeLink);$('publish-status').textContent='Employee schedule link copied.';}catch(e){$('publish-status').textContent='Could not access the clipboard. Use the displayed link.';}}
function standaloneEmployeeHTML(snapshot){return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(snapshot.r||'Employee Schedule')+'</title><style>*{box-sizing:border-box}html,body{max-width:100%;overflow-x:hidden}body{font-family:Arial,sans-serif;margin:20px;color:#111}h1{margin-bottom:4px}.employee-week-table{width:100%;max-width:100%;table-layout:fixed;border-collapse:collapse;margin:12px 0 24px;font-size:clamp(8px,1.05vw,12px)}.employee-week-table th,.employee-week-table td{border:1px solid #777;padding:5px 3px;vertical-align:top;overflow-wrap:anywhere;word-break:normal}.employee-week-table th{background:#eee}.employee-week-table th:first-child{width:13%}.employee-week-table th:nth-child(2){width:15%}.employee-week-label{font-weight:700;font-size:16px;margin-top:18px}@media(max-width:700px){body{margin:10px}.employee-week-table,.employee-week-table tbody,.employee-week-table tr,.employee-week-table td{display:block;width:100%}.employee-week-table thead{display:none}.employee-week-table{border:0;font-size:13px;table-layout:auto}.employee-week-table tr{border:1px solid #999;margin:0 0 12px;background:#fff}.employee-week-table td{display:grid;grid-template-columns:110px minmax(0,1fr);gap:8px;border:0;border-bottom:1px solid #ddd;padding:7px 9px;overflow-wrap:anywhere}.employee-week-table td:last-child{border-bottom:0}.employee-week-table td:before{content:attr(data-label);font-weight:700;color:#444}.employee-week-table td[data-label="Employee"]{font-size:14px;background:#f3f3f3}.employee-week-table td[data-label="Employee"]:before{color:#111}}</style></head><body><h1>'+esc(snapshot.r||'Employee Schedule')+'</h1><p>'+(snapshot.s?'Store / Unit: '+esc(snapshot.s):'')+'</p>'+employeeScheduleHTML(snapshot,false)+'<p>Published through Gravity Shift Lab • Thomas Monroe Books</p></body></html>';}
function downloadEmployeeView(){if(!publishedEmployeeSnapshot)return;var blob=new Blob([standaloneEmployeeHTML(publishedEmployeeSnapshot)],{type:'text/html'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='employee-schedule.html';a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},1000);}
async function maybeOpenEmployeeSnapshot(){var params=new URLSearchParams(location.search);if(!params.has('employee'))return false;document.body.classList.add('employee-view-mode');var payload=(location.hash||'').replace(/^#s=/,'');var title=$('employee-view-title'),meta=$('employee-view-meta'),content=$('employee-view-content');try{publishedEmployeeSnapshot=await decodeSnapshot(payload);title.textContent=publishedEmployeeSnapshot.r||'Employee Schedule';meta.textContent=(publishedEmployeeSnapshot.s?'Store / Unit '+publishedEmployeeSnapshot.s+' • ':'')+'Published '+new Date(publishedEmployeeSnapshot.p).toLocaleString();content.innerHTML=employeeScheduleHTML(publishedEmployeeSnapshot,false);}catch(e){title.textContent='Schedule could not be opened';meta.textContent='This QR or link may be incomplete.';content.innerHTML='<p>Ask the manager or scheduling lead for the newly posted schedule QR.</p>';}return true;}

function applyProfile(){
  $('lab-restaurant').value=profile.restaurant||'';$('lab-store').value=profile.store||'';$('lab-target-hours').value=profile.targetHours||'';$('lab-target-percent').value=profile.targetPercent||'';$('lab-conflict-mode').value=profile.conflictMode||'warn';
  if(!$('lab-week').value){var now=new Date(),sun=new Date(now);sun.setDate(now.getDate()-now.getDay());$('lab-week').value=profile.lastViewedWeek||isoDate(sun);}
  updatePayPrivacyUI();if($('publish-cycle'))$('publish-cycle').value=profile.publishCycle||'1';updateScheduleStatus();
}

['lab-restaurant','lab-store','lab-target-hours','lab-target-percent','lab-conflict-mode'].forEach(function(id){$(id).addEventListener('input',function(){syncProfileFromRows();recalc();});});
$('lab-sales').addEventListener('input',function(){recalc();saveCurrentWeek(true);});
$('lab-week').addEventListener('change',function(){profile.lastViewedWeek=$('lab-week').value;persistProfile();renderWeek();$('lab-status').textContent=schedules[$('lab-week').value]?'Saved week loaded.':'New week. Employee profiles and recurring rules carried forward.';});
$('lab-add').addEventListener('click',function(){var e=normalizeEmployee({});profile.employees.push(e);persistProfile();addEmployee(e,[],[]);saveCurrentWeek(true);});
$('lab-save').addEventListener('click',function(){syncProfileFromRows();var c=recalc();saveCurrentWeek(false);if(c.hard)$('lab-status').textContent+=' Warning: '+c.hard+' hard availability/time-off conflict'+(c.hard>1?'s':'')+' remain.';});
$('lab-print').addEventListener('click',function(){printSchedule('employee');});
$('lab-print-manager').addEventListener('click',function(){printSchedule('manager');});
$('lab-csv').addEventListener('click',downloadCSV);
$('lab-rules').addEventListener('click',function(){var first=profile.employees[0];if(first)openRules(first.id);else $('lab-status').textContent='Add an employee first.';});
$('lab-calendar').addEventListener('click',openAvailabilityCalendar);
$('calendar-close').addEventListener('click',function(){$('availability-calendar-dialog').close();});
$('calendar-prev').addEventListener('click',function(){calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()-1,1,12,0,0);renderCalendar();});
$('calendar-next').addEventListener('click',function(){calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+1,1,12,0,0);renderCalendar();});
$('calendar-today').addEventListener('click',function(){var d=new Date();calendarMonth=new Date(d.getFullYear(),d.getMonth(),1,12,0,0);renderCalendar();});
$('calendar-editor-close').addEventListener('click',function(){$('calendar-editor').hidden=true;});
$('calendar-rule-kind').addEventListener('change',updateCalendarTimeField);
$('calendar-rule-save').addEventListener('click',saveCalendarRule);
$('lab-sections').addEventListener('click',openSections);$('sections-save').addEventListener('click',saveSections);$('sections-cancel').addEventListener('click',function(){$('sections-dialog').close();});
$('lab-close-settings').addEventListener('click',openCloseSettings);$('close-save').addEventListener('click',saveCloseSettings);$('close-cancel').addEventListener('click',function(){$('close-settings-dialog').close();});
$('lab-copy-prev').addEventListener('click',copyPreviousWeek);$('lab-next-week').addEventListener('click',newNextWeek);
$('lab-backup').addEventListener('click',downloadBackup);$('lab-restore').addEventListener('click',function(){$('lab-restore-file').click();});$('lab-restore-file').addEventListener('change',function(){restoreBackup(this.files&&this.files[0]);this.value='';});
$('rules-save').addEventListener('click',saveRules);$('rules-cancel').addEventListener('click',function(){$('employee-rules-dialog').close();});$('request-add').addEventListener('click',addRequest);
$('request-full-day').addEventListener('change',function(){var dis=this.checked;$('request-start').disabled=dis;$('request-end').disabled=dis;});

$('lab-manager-settings').addEventListener('click',openManagerSettings);$('manager-settings-cancel').addEventListener('click',function(){$('manager-settings-dialog').close();});$('manager-settings-save').addEventListener('click',saveManagerSettings);
$('lab-find-coverage').addEventListener('click',openFindCoverage);$('coverage-search').addEventListener('click',findCoverage);$('coverage-close').addEventListener('click',function(){$('coverage-dialog').close();});
$('lab-publish').addEventListener('click',function(){var wk=$('lab-week').value;profile.publishCycle=String(profile.publishCycle||'1');$('publish-cycle').value=profile.publishCycle;$('publish-week-label').value=(profile.publishCycle==='2'?'Two-week cycle starting ':'Week of ')+wk;$('publish-status').textContent='Generate the employee schedule to preview the QR.';$('publish-link').textContent='';$('publish-dialog').showModal();});
$('publish-cycle').addEventListener('change',function(){profile.publishCycle=this.value;persistProfile();});$('publish-generate').addEventListener('click',function(){generatePublishedSchedule($('publish-cycle').value,true);});$('publish-close').addEventListener('click',function(){$('publish-dialog').close();});$('publish-copy').addEventListener('click',copyPublishedLink);$('publish-download-qr').addEventListener('click',downloadPublishedQR);$('publish-open').addEventListener('click',openPublishedLink);
$('lab-change-log').addEventListener('click',openChangeLog);$('change-log-close').addEventListener('click',function(){$('change-log-dialog').close();});
$('employee-view-download').addEventListener('click',downloadEmployeeView);$('employee-view-print').addEventListener('click',function(){window.print();});

$('lab-pay-lock').addEventListener('click',function(){if(!payLockConfigured())openPayLockDialog('setup');else if(payIsLocked())openPayLockDialog('unlock');else lockPayRates();});
$('lab-pay-change').addEventListener('click',function(){if(!payIsLocked())openPayLockDialog('change');});
$('pay-lock-cancel').addEventListener('click',function(){$('pay-lock-dialog').close();});
$('pay-lock-submit').addEventListener('click',submitPayLock);
$('pay-lock-secret').addEventListener('keydown',function(e){if(e.key==='Enter'&&payDialogMode==='unlock'){e.preventDefault();submitPayLock();}});
function shiftLabInstalled(){return window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;}
function syncInstallButton(){var b=$('lab-install');if(!b)return;if(shiftLabInstalled()){b.textContent='Gravity Shift Lab Is Installed';b.disabled=true;b.setAttribute('aria-disabled','true');}}
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferredInstallPrompt=e;syncInstallButton();});
$('lab-install').addEventListener('click',function(){if(shiftLabInstalled()){return;}if(deferredInstallPrompt){deferredInstallPrompt.prompt();deferredInstallPrompt.userChoice.then(function(choice){if(choice&&choice.outcome==='accepted'){$('lab-status').textContent='Gravity Shift Lab installed. Open it from your desktop, Start menu, app launcher or Home Screen.';}deferredInstallPrompt=null;syncInstallButton();});}else{alert('To install the FULL Gravity Shift Lab interface: on iPhone/iPad use Share → Add to Home Screen. On supported desktop/Android browsers use the browser menu and choose Install app or Add to Home Screen. Do not use Export Schedule Data (.CSV)—that is only a plain spreadsheet export.');}});
window.addEventListener('appinstalled',function(){$('lab-status').textContent='Gravity Shift Lab installed. It will open with the same full interface.';deferredInstallPrompt=null;syncInstallButton();});
syncInstallButton();
if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/gravity-shift-lab-sw.js',{scope:'/gravity-shift-lab'}).catch(function(){});});}


// Gravity Shift Lab mobile/keyboard scroll control — 2026-09-19
function shiftLabRevealField(el){
  if(!el)return;
  var board=el.closest&&el.closest('.lab-board');
  try{
    if(board){
      var er=el.getBoundingClientRect(), br=board.getBoundingClientRect();
      if(er.left<br.left+12) board.scrollLeft-=Math.max(0,(br.left+12)-er.left);
      else if(er.right>br.right-12) board.scrollLeft+=Math.max(0,er.right-(br.right-12));
    }
    requestAnimationFrame(function(){
      var r=el.getBoundingClientRect();
      var topPad=96, bottomPad=120;
      if(r.top<topPad || r.bottom>window.innerHeight-bottomPad){
        el.scrollIntoView({behavior:'smooth',block:'center',inline:'nearest'});
      }
    });
  }catch(e){}
}
function shiftLabNextEditable(current){
  var fields=Array.prototype.slice.call(document.querySelectorAll('#lab-table input:not([type="hidden"]):not([disabled]), #lab-table select:not([disabled])'));
  var i=fields.indexOf(current);
  return i>=0&&i<fields.length-1?fields[i+1]:null;
}
document.addEventListener('keydown',function(e){
  if(e.key!=='Enter'||e.shiftKey||e.ctrlKey||e.altKey||e.metaKey)return;
  var t=e.target;
  if(!t||!t.closest||!t.closest('#lab-table'))return;
  if(t.tagName==='TEXTAREA'||t.type==='button'||t.type==='submit')return;
  e.preventDefault();
  var next=shiftLabNextEditable(t);
  if(next){
    next.focus({preventScroll:true});
    shiftLabRevealField(next);
  }else{
    t.blur();
    shiftLabRevealField(t);
  }
});
document.addEventListener('focusin',function(e){
  var t=e.target;
  if(t&&t.closest&&t.closest('#lab-table')) setTimeout(function(){shiftLabRevealField(t);},80);
});

applyProfile();renderWeek();recalc();updatePayPrivacyUI();maybeOpenEmployeeSnapshot();
})();
