import io, re, runpy, zipfile
from pathlib import Path
import fitz
helpers=runpy.run_path("scripts/repair-gravity-printed-domain-copy.py")
root=Path("site")
a="https://www.cdc.gov/niosh/blogs/2021/supportive-leaders.html"
b="https://www.fda.gov/food/fda-food-code"
mapping={a:a.replace("/blogs/","/bulletin/"),b:b.replace("/food/","/food/retail-food-protection/")}
def spans(page):
 return [s for block in page.get_text("dict")["blocks"] for line in block.get("lines",[]) for s in line["spans"]]
def fixpdf(raw):
 doc=fitz.open(stream=raw,filetype="pdf")
 changed=False
 for p in doc:
  ss=spans(p); edits=[]
  for s in ss:
   t=s["text"].strip()
   if t==b: edits.append((s,mapping[b],mapping[b]))
   if t==a[:-len("leaders.html")]:
    edits.append((s,mapping[a][:-len("leaders.html")],mapping[a]))
    n=next(v for v in ss if v["text"].strip()=="leaders.html" and abs(v["bbox"][0]-s["bbox"][0])<1 and 0<v["origin"][1]-s["origin"][1]<18)
    edits.append((n,"leaders.html",mapping[a]))
  oldlinks=[l for l in p.get_links() if l.get("uri") in mapping]
  for l in oldlinks:p.delete_link(l)
  if edits:
   for s,_,_ in edits:
    r=fitz.Rect(s["bbox"]); y=s["origin"][1];p.add_redact_annot((r.x0,y-s["size"]*.58,r.x1,y-s["size"]*.12),fill=False,cross_out=False)
   p.apply_redactions(images=0,graphics=0,text=0)
   for s,txt,uri in edits:
    r=fitz.Rect(s["bbox"]);pt=fitz.Point(s["origin"]);size=s["size"];w=fitz.get_text_length(txt,fontname="helv",fontsize=size)
    scale=min(1,r.width/w)
    p.insert_text(pt,txt,fontname="helv",fontsize=size,color=helpers['color_tuple'](s["color"]),morph=(pt,fitz.Matrix(scale,1)))
    p.insert_link({"kind":fitz.LINK_URI,"from":r,"uri":uri})
  for l in oldlinks:
   if not any(fitz.Rect(s["bbox"]).intersects(l["from"]) for s,_,_ in edits):p.insert_link({"kind":fitz.LINK_URI,"from":l["from"],"uri":mapping[l["uri"]]})
  changed|=bool(edits or oldlinks)
 return doc.tobytes(garbage=4,deflate=True) if changed else raw
def archive(raw):
 with zipfile.ZipFile(io.BytesIO(raw)) as z:
  members=[];changed=False
  for info in z.infolist():
   data=z.read(info);new=data;n=info.filename.lower()
   if n.endswith(".pdf"):new=fixpdf(data)
   elif n.endswith((".docx",".pptx",".xlsx")): new=archive(data)
   elif n.endswith((".xml",".rels",".txt",".md",".html")):
    for old,dest in mapping.items():new=re.sub(re.escape(old.encode())+rb'(?=[<"\s]|$)',dest.encode(),new)
   changed|=new!=data;members.append((info,new))
  if not changed:return raw
  members,_=helpers['update_zip_manifest'](members)
  out=io.BytesIO()
  with zipfile.ZipFile(out,'w') as dest:
   dest.comment=z.comment
   for info,data in members:dest.writestr(info,data)
  return out.getvalue()
for f in (root/'assets/system-previews').glob('*-manual.pdf'):
 if f.stem in ['manager-development-manual','standards-intelligence-manual','risk-continuity-manual']:
  f.write_bytes(fixpdf(f.read_bytes()))
for f in (root/'assets/free-resources/packages/current').glob('*.zip'):
 if f.name.startswith(('GRV-M_','GRV-I_','GRV-RC_')):f.write_bytes(archive(f.read_bytes()))
f=root/helpers['ONE_PAGE_AD'];doc=fitz.open(f);p=doc[0]
for s in spans(p):
 t=s['text']; new={'13':'15','215':'350'}.get(t,t.replace('215 PROMPTS','350 PROMPTS'))
 if new!=t:
  if t.isdigit(): psize=fitz.Rect(s['bbox']);helpers['replace_span'](p,s,new,centered_at=(psize.x0+psize.x1)/2)
  else:
   r=next(r for r in p.search_for('215') if fitz.Rect(s['bbox']).contains(r))
   x,y=r.x0,s['origin'][1]
   p.add_redact_annot((x,y-4,r.x1,y-1),fill=False,cross_out=False)
   p.apply_redactions(images=0,graphics=0,text=0)
   p.insert_text((x,y),'350',fontname='helv',fontsize=s['size'],color=helpers['color_tuple'](s['color']))
rect=p.search_for("GRAVITYLEADERSHIPSYSTEM.COM")[0]
p.insert_link({'kind':fitz.LINK_URI,'from':rect,'uri':'https://gravityleadershipsystem.com/'})
raw=doc.tobytes(garbage=4,deflate=True);doc.close();f.write_bytes(raw)
