from pathlib import Path
import fitz,collections,subprocess,re,zipfile,io,hashlib,sys
from xml.etree import ElementTree
old=['https://www.cdc.gov/niosh/blogs/2021/supportive-','https://www.fda.gov/food/fda-food-code']
new=[old[0].replace('blogs','bulletin'),old[1].replace('/food/','/food/retail-food-protection/')]
def pdf(before,after,name):
 pre=fitz.open(stream=before,filetype='pdf');post=fitz.open(stream=after,filetype='pdf');assert len(pre)==len(post)
 for a,b in zip(pre,post):
  assert a.rect==b.rect
  def words(p,convert):
   out=[]
   for w in p.get_text('words'):
    t=w[4]
    if convert:t=dict(zip(old,new)).get(t,t)
    if convert and name.endswith('one-page-ad.pdf'):t={'13':'15','215':'350'}.get(t,t)
    out.append(t)
   return collections.Counter(out)
  w,v=words(a,True),words(b,False)
  if w!=v:print(name,a.number+1,w-v,v-w);raise ValueError('Text mismatch')
  la=[l.get('uri','') for l in a.get_links()];lb=[l.get('uri','') for l in b.get_links()]
  assert all(t in lb for t in la if not any(t==o or t==o+'leaders.html' for o in old)),(name,a.number+1)
  assert not any(t in lb for t in [old[0]+'leaders.html',old[1]])
def inspect(a,b,n):
 if n.endswith('.pdf'):pdf(a,b,n)
 elif n.endswith(('.zip','.docx','.pptx','.xlsx')):
  with zipfile.ZipFile(io.BytesIO(a)) as x,zipfile.ZipFile(io.BytesIO(b)) as y:
   assert x.namelist()==y.namelist() and y.testzip() is None
   for f in x.namelist():
    u,v=x.read(f),y.read(f)
    if u==v:continue
    if f.lower().endswith(('.xml','.rels')):ElementTree.fromstring(v)
    elif 'sha256_manifest' in f.lower():
     for line in v.decode().splitlines():
      m=re.match(r'([0-9a-f]{64})\s+(.+)',line)
      if m and m[2] in y.namelist():assert hashlib.sha256(y.read(m[2])).hexdigest()==m[1]
    else:inspect(u,v,n+'/'+f)
paths=subprocess.check_output(['git','diff','--name-only','HEAD']).decode().splitlines()
for p in paths:
 if p.endswith(('.zip','.pdf')):inspect(subprocess.check_output(['git','show','HEAD:'+p]),Path(p).read_bytes(),p)
print('Validated PDF words, existing unrelated links, page dimensions, ZIP integrity, member names, updated Office XML and package checksums')
