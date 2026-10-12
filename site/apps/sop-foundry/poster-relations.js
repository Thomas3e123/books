(()=>{'use strict';
const STOP=new Set('the a an and or of to for with on in at by from as is are be use using used current approved restaurant procedure procedures sop poster station all your this that when before after into it its if any per every'.split(' '));
const CONCEPTS=[
 ['allergen',['allergen','allergy','cross contact','sesame','gluten','peanut','tree nut','milk','egg','soy','wheat','fish','shellfish']],
 ['knife',['knife','knives','cut','cutting','blade','slicer']],
 ['portion',['portion','scoop','disher','ladle','spoodle','ounce','oz','yield','measure','measured','jigger']],
 ['temperature',['temperature','thermometer','temp','hot hold','cold hold','cooling','reheat','cook','thaw']],
 ['handwash',['handwash','hand washing','hands','glove','bare hand']],
 ['label',['label','date mark','date marking','fifo','rotate','rotation','shelf life']],
 ['sanitation',['clean','cleaning','sanitize','sanitizer','chemical','dish','three compartment','wiping cloth']],
 ['fryer',['fryer','fry','oil','grease']],
 ['burn',['burn','hot surface','steam','scald']],
 ['slip',['slip','trip','fall','floor','spill']],
 ['lifting',['lift','lifting','carry','cart','strain','sprain']],
 ['equipment',['equipment','machine','guard','lockout','maintenance','repair']],
 ['opening',['opening','open station','readiness','startup','start up']],
 ['closing',['closing','close station','shutdown','shut down']],
 ['handoff',['handoff','shift change','communication','pass down']],
 ['waste',['waste','discard','spoilage','overproduction']],
 ['receiving',['receiving','delivery','vendor','invoice','shipment']],
 ['storage',['storage','walk in','walk-in','dry storage','freezer','cooler','shelving']],
 ['bar',['bar','alcohol','drink','cocktail','beer','wine','id check','responsible service']],
 ['service',['guest','server','host','expo','service','table','order accuracy','complaint']],
 ['emergency',['emergency','fire','power outage','weather','tornado','injury','choking','gas','water outage','evacuation']],
 ['training',['training','trainer','cross train','cross-training','certification','sign off','knowledge check']],
 ['qr',['qr','scan','employee app','employee library','revision']],
 ['pizza',['pizza','dough','topping']],
 ['salad',['salad','garde manger','cold prep']],
 ['prep',['prep','preparation','batch']],
 ['dish',['dish','warewash','warewashing','dish pit']],
 ['line',['line','grill','flat top','flattop','broiler','saute','sauté']],
 ['drive thru',['drive thru','drive-thru','window service']],
 ['sharps',['broken glass','glass','sharps','needle']],
 ['illness',['illness','sick','vomit','diarrhea','symptom','employee health']],
 ['pest',['pest','insect','rodent']],
 ['security',['robbery','violence','security','cash','threat']],
];
function textOf(o){return [o?.title,o?.category,o?.station,o?.purpose,o?.role,o?.frequency,o?.checks,o?.correction,o?.records,o?.safety,...(o?.steps||[]),o?.lines,o?.note].filter(Boolean).join(' ').toLowerCase()}
function tokens(s){return new Set(String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').split(/\s+/).filter(w=>w.length>2&&!STOP.has(w)))}
function concepts(s){const t=String(s||'').toLowerCase();return new Set(CONCEPTS.filter(([,terms])=>terms.some(x=>t.includes(x))).map(([name])=>name))}
function stationWords(s){return tokens(String(s||'').replace(/front of house/ig,'foh').replace(/back of house/ig,'boh'))}
function score(a,b){const at=tokens(textOf(a)),bt=tokens(textOf(b));let n=0;for(const w of at)if(bt.has(w))n+=1;const ac=concepts(textOf(a)),bc=concepts(textOf(b));for(const c of ac)if(bc.has(c))n+=5;const as=stationWords(a?.station),bs=stationWords(b?.station);for(const w of as)if(bs.has(w))n+=3;if(String(b?.station||'').toLowerCase().includes('all station'))n+=.5;return n}
function rank(source,items,limit=6){return (items||[]).map(item=>({item,score:score(source,item)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||String(a.item.title).localeCompare(String(b.item.title))).slice(0,limit).map(x=>({...x.item,_matchScore:x.score}))}
window.GravityPosterRelations={
 suggestPostersForSop:(sop,templates,limit=6)=>rank(sop,templates,limit),
 suggestSopsForPoster:(poster,sops,limit=8)=>rank(poster,sops,limit),
 score
};
})();
