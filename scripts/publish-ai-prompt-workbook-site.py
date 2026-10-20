#!/usr/bin/env python3
"""Update only the customer-facing references to the regenerated 325-prompt
book. The historical 250 index and 215-download assets stay archived.
This runs in the same CI commit as the new PDF, Word, JSON and reader text.
"""
from pathlib import Path
import json
import re

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'site'
NEW='RESTAURANT_AI_PROMPTS_AND_SYSTEMS_WORKBOOK_325_PROMPTS_2026-10-20'
OLD='RESTAURANT_AI_PROMPTS_AND_SYSTEMS_WORKBOOK_215_PROMPTS_2026-09-16'
INDEX='restaurant-ai-prompts-325.json'
INDEX_OLD='restaurant-ai-prompts-250.json'
BOOKS=('books.html','toolkit.html','free-resources.html')
PAGES=('restaurant-ai-prompt-search.html','book-reader.html')+BOOKS
rows=json.loads((SITE/'assets/data'/INDEX).read_text(encoding='utf-8'))
assert len(rows)==325
reader=(SITE/'assets/reader/ai-prompts.txt').read_text(encoding='utf-8')
assert 'GRV-AI-325' in reader
for suffix in ('pdf','docx'):
    f=SITE/'assets/free-resources/ai'/f'{NEW}.{suffix}'
    assert f.exists() and f.stat().st_size>45000, f'Missing/empty current book: {f}'

edited=[]
def write(path,before,after):
    if before==after:
        return
    path.write_text(after,encoding='utf-8')
    edited.append(str(path.relative_to(ROOT)))

for name in PAGES:
    f=SITE/name
    old=f.read_text(encoding='utf-8')
    s=old.replace(OLD,NEW)
    s=s.replace('Search 250 Prompts','Search 325 Prompts')
    s=s.replace('250 practical prompts','325 practical prompts')
    s=s.replace('215 practical prompts','325 practical prompts')
    s=s.replace('250 prompts','325 prompts')
    s=s.replace('250 Prompts (digital text)','325 Prompts (complete edition)')
    if name=='restaurant-ai-prompt-search.html':
        # Update SEO, descriptions, dynamic search-intro and live count together.
        # Only this page can use broad 250-to-325 count replacement; elsewhere
        # "first 250 preserved" is historical information and must stay.
        s=s.replace('250-prompt','325-prompt')
        s=s.replace('250-Prompt','325-Prompt')
        s=s.replace('250 Restaurant AI Prompts','325 Restaurant AI Prompts')
        s=s.replace('250 Gravity restaurant AI prompts','325 Gravity restaurant AI prompts')
        s=s.replace('Search all 250','Search all 325')
        s=s.replace('<strong>250</strong><span>controlled prompts','<strong>325</strong><span>controlled prompts')
        s=s.replace('Loading the 250-prompt index','Loading the 325-prompt index')
        s=s.replace('GRV-AI-250</strong>','GRV-AI-325</strong>')
        s=s.replace('ai-prompt-search.js?v=20261020-250','ai-prompt-search.js?v=20261020-325')
        s=re.sub(r'(ai-prompt-search\.js)(?:\?v=[^"\']*)?',r'\1?v=20261020-325',s)
    if name=='free-resources.html':
        s=s.replace('215 practical copy-and-paste prompts', '325 practical copy-and-paste prompts')
    # Book search page should explain the new topics rather than imply old content.
    if name in BOOKS:
        s=s.replace('The updated digital Gravity workbook includes 325 practical prompts organized for restaurant management, operations, problem solving, and connected Gravity workflows.',
        'The complete 325-prompt digital edition preserves the first 250 and adds 75 practical prompts for Work Study Lab, SOP Foundry, scheduling, inventory, customer testing, Windows releases, owner–GM governance, and Gravity communication.')
    write(f,old,s)

f=SITE/'assets/js/ai-prompt-search.js'
old=f.read_text(encoding='utf-8')
s=old.replace(INDEX_OLD,INDEX)
write(f,old,s)

f=SITE/'assets/reader/catalog.json'
old=f.read_text(encoding='utf-8')
book=json.loads(old)
for record in book['books']:
    if record.get('id')=='ai-prompts':
        record['title']='Restaurant AI Prompts & Systems Workbook — 325 Prompts'
        record['pdf']='/assets/free-resources/ai/'+NEW+'.pdf'
        record['characters']=len(reader)
        break
else:
    raise RuntimeError('AI Prompt entry not in book reader catalog')
s=json.dumps(book,ensure_ascii=False,indent=2)+'\n'
write(f,old,s)

f=SITE/'assets/js/book-reader.js'
old=f.read_text(encoding='utf-8')
s=old.replace('Restaurant AI Prompts & Systems Workbook — 250 Prompts (digital text)',
              'Restaurant AI Prompts & Systems Workbook — 325 Prompts')
s=s.replace(OLD+'.pdf',NEW+'.pdf')
# Keep the Book Reader's embedded fallback catalog synchronized with the
# source catalog even when the new text length changes in future editions.
pattern = r'("id":\s*"ai-prompts"[^{}]*?"characters":\s*)\d+'
s, updated = re.subn(pattern, lambda match: match.group(1) + str(len(reader)), s, count=1)
assert updated == 1, 'AI prompt entry missing from embedded Book Reader catalog'
write(f,old,s)

# Fail the build rather than publish references pointing at 215-prompt downloads.
for f in (SITE/n for n in PAGES):
    assert OLD not in f.read_text(encoding='utf-8'), f'Old PDF or Word link remains in {f}'
assert INDEX in (SITE/'assets/js/ai-prompt-search.js').read_text(encoding='utf-8')
print('AI_BOOK_SITE_PAGES_UPDATED='+str(len(edited)))
for n in edited: print('UPDATED '+n)
