#!/usr/bin/env python3
"""Read-only verification of four generated PDF/DOCX Windows manuals.

Runs on the isolated candidate build. Never publishes, updates source, or
touches customer data. Reports hashes for post-review artifact comparison.
"""
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile

from bs4 import BeautifulSoup
from docx import Document
from docx.opc.constants import RELATIONSHIP_TYPE as RT
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
DIR=ROOT/'site/assets/downloads/windows/manuals/current'
SLUGS=['SOP_Foundry','Shift_Lab','Inventory_Center','Work_Study_Lab']
SITE='https://gravityleadershipsystem.com'
EXPECTED={SITE+'/windows-programs',SITE+'/gravity-assist',SITE+'/contact'}
OLD='thomasmonroebooks.com'

def require(condition,message):
    if not condition: raise ValueError(message)

def file_sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def pdf_urls(reader):
    found=set()
    for page in reader.pages:
        for ref in page.get('/Annots') or []:
            action=ref.get_object().get('/A')
            if action:
                uri=action.get('/URI')
                if uri: found.add(str(uri))
    return found

def verify_one(slug):
    name='Gravity_'+slug+'_Windows_User_Manual'
    html,pdf,docx=[DIR/(name+'.'+extension) for extension in ('html','pdf','docx')]
    for p in (html,pdf,docx): require(p.is_file(),f'Missing {p}')
    soup=BeautifulSoup(html.read_text('utf8'),'html.parser')
    headings=[h.get_text(' ',strip=True) for h in soup.select('#guide-content > section > h2')]
    require(len(headings)>=15,f'{name}: incomplete source headings')
    source_urls={a.get('href','') for a in soup.select('a[href]')}
    require(not any(OLD in x.lower() for x in source_urls),f'{name}: TMB source hyperlink')
    require(EXPECTED <= source_urls,f'{name}: missing source Gravity links')
    reader=PdfReader(str(pdf))
    text='\n'.join((p.extract_text() or '') for p in reader.pages)
    require(len(reader.pages)>=3 and all(h in text for h in headings),f'{name}: PDF content/heading mismatch')
    require('Official Gravity links' in text,f'{name}: PDF has no resource section')
    pdf_targets=pdf_urls(reader)
    require(EXPECTED <= pdf_targets,f'{name}: PDF missing clickable targets {sorted(EXPECTED-pdf_targets)}')
    require(not any(OLD in x.lower() for x in pdf_targets),f'{name}: PDF TMB URL')
    require(OLD not in text.lower(),f'{name}: PDF TMB text')
    with ZipFile(docx) as archive:
        require(archive.testzip() is None,f'{name}: damaged DOCX archive')
        relationships=archive.read('word/_rels/document.xml.rels').decode('utf8')
        require(OLD not in relationships.lower(),f'{name}: DOCX relationship to TMB')
    word=Document(str(docx))
    targets={rel.target_ref for rel in word.part.rels.values() if rel.reltype==RT.HYPERLINK}
    require(EXPECTED <= targets,f'{name}: DOCX missing clickable targets {sorted(EXPECTED-targets)}')
    require(not any(OLD in x.lower() for x in targets),f'{name}: DOCX TMB URL')
    doc_text='\n'.join(p.text for p in word.paragraphs)
    require(OLD not in doc_text.lower(),f'{name}: DOCX TMB text')
    require(all(any(h==p.text for p in word.paragraphs) for h in headings),f'{name}: DOCX headings incomplete')
    return {'name':name,'source_headings':len(headings),'pdf_pages':len(reader.pages),
            'pdf_clickable_urls':sorted(pdf_targets),'docx_clickable_urls':sorted(targets),
            'files':{p.suffix.lstrip('.'): {'bytes':p.stat().st_size,'sha256':file_sha256(p)}
                     for p in (pdf,docx)}}

def main():
    report={'status':'PASS','scope':'Generated PDF and DOCX manuals; isolated candidate only',
            'production_release_approved':False,'manuals':[verify_one(s) for s in SLUGS]}
    outfile=ROOT/'windows-manual-candidate-qa.json'
    outfile.write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
    print('Verified four PDF and DOCX manuals. SHA-256 report:',outfile)
    for item in report['manuals']:
        print(item['name'],item['pdf_pages'],'PDF pages;',
              len(item['pdf_clickable_urls']),'PDF resource targets;',
              len(item['docx_clickable_urls']),'DOCX resource targets')
if __name__=='__main__': main()
