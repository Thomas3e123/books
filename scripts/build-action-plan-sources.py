"""Snapshot public guidance for the assistant; regenerate after reviewing source changes."""
from html.parser import HTMLParser
from pathlib import Path
import hashlib,json
ROOT=Path(__file__).resolve().parent.parent
class MainText(HTMLParser):
 def __init__(self): super().__init__();self.active=False;self.parts=[];self.title=False;self.name=[]
 def handle_starttag(self,tag,attrs):
  if tag=='main':self.active=True
  if tag=='title':self.title=True
 def handle_endtag(self,tag):
  if tag=='main':self.active=False
  if tag=='title':self.title=False
 def handle_data(self,data):
  if self.active and data.strip(): self.parts.append(data.strip())
  if self.title:self.name.append(data)
names=['start-here','restaurant-closing-checklist','restaurant-shift-handoff-checklist','restaurant-sop-training-retraining-guide','restaurant-inventory-count-variance-backup-guide','restaurant-labor-cost-control']
sources=[]
for name in names:
 raw=(ROOT/'site'/f'{name}.html').read_bytes(); p=MainText();p.feed(raw.decode())
 sources.append(dict(id=name,title=''.join(p.name).split('|')[0].strip(),url='/'+name,sha256=hashlib.sha256(raw).hexdigest(),text=' '.join(p.parts)))
(ROOT/'functions/gravity-action-plan/sources.mjs').write_text('// Generated from reviewed repository pages by scripts/build-action-plan-sources.py.\nexport const sources = '+json.dumps(sources,ensure_ascii=False,indent=2)+';\n')
print(f'Snapshotted {len(sources)} public guidance pages.')
