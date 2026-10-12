export function parseCSV(text){
  const rows=[];let row=[],field='',quoted=false,closed=false;
  text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else{quoted=false;closed=true;}}else field+=c;}else if(c===','||c==='\n'||c==='\r'){row.push(field);field='';closed=false;if(c!==','){if(c==='\r'&&text[i+1]==='\n')i++;if(row.some(x=>x.trim()))rows.push(row);row=[];}}else if(c==='"'){if(field||closed)throw Error('CSV has an unexpected quote. Use the template or export as CSV.');quoted=true;}else{if(closed&&!/\s/.test(c))throw Error('Unexpected text after a quoted CSV field.');if(!closed)field+=c;}}
  if(quoted)throw Error('CSV has an unclosed quoted field.');row.push(field);if(row.some(x=>x.trim()))rows.push(row);
  if(rows.length<2)throw Error('CSV needs headers and at least one recipe row.');
  const headers=rows.shift().map(s=>s.trim().toLowerCase());if(new Set(headers).size!==headers.length)throw Error('CSV has duplicate column names.');
  for(const k of ['title','type','ingredients','steps'])if(!headers.includes(k))throw Error(`CSV is missing the ${k} column.`);
  return rows.map((r,i)=>{if(r.length!==headers.length)throw Error(`CSV row ${i+2} has ${r.length} columns; expected ${headers.length}.`);return Object.fromEntries(headers.map((h,j)=>[h,r[j]]));});
}
export function prepareRecipes(value){
  const rows=Array.isArray(value)?value:Array.isArray(value?.recipes)?value.recipes:[value];
  if(!rows.length||rows.length>100)throw Error('Choose 1–100 recipes per import.');
  const keys=new Set(),ids=new Set();return rows.map((r,i)=>{
    if(!r||typeof r!=='object'||Array.isArray(r))throw Error(`Recipe ${i+1} must be a record.`);
    const out={};for(const k of ['id','title','type','yield','category','allergens','glassware','ice','buildtype','garnish','notes','revision']){if(r[k]!=null&&typeof r[k]!=='string')throw Error(`Recipe ${i+1}: ${k} must be text.`);out[k]=(r[k]||'').trim();}
    if(out.buildtype&&!out.buildType)out.buildType=out.buildtype;delete out.buildtype;out.type=out.type.toLowerCase();if(!out.title||!['food','bar'].includes(out.type))throw Error(`Recipe ${i+1} needs a title and type food or bar.`);
    for(const k of ['ingredients','steps']){out[k]=typeof r[k]==='string'?r[k].split(/\r?\n|\s*\|\s*/):r[k];if(!Array.isArray(out[k])||!out[k].length||out[k].some(x=>typeof x!=='string'||!x.trim()))throw Error(`Recipe ${i+1}: ${k} needs nonempty lines.`);out[k]=out[k].map(x=>x.trim());}
    const key=out.type+':'+out.title.toLowerCase();if(keys.has(key)||(out.id&&ids.has(out.id)))throw Error(`Duplicate recipe in import: ${out.title}. Keep one version.`);keys.add(key);if(out.id)ids.add(out.id);return out;
  });
}
