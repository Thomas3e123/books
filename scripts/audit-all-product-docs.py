#!/usr/bin/env python3
"""Read-only, evidence-based inventory of Gravity public documentation.

Does not edit customer records, PDF/DOCX files, website pages or releases.
Run after checkout from the Gravity production branch. Review content findings
against the ACTUAL executable/web features before making any claims of parity.
"""
from __future__ import annotations
import json, pathlib, re, sys, zipfile
from urllib.parse import urlparse
from collections import Counter
from bs4 import BeautifulSoup
from pypdf import PdfReader
from docx import Document
ROOT=pathlib.Path(__file__).resolve().parents[1]
SITE=ROOT/'site'
REPORT=ROOT/'gravity-all-product-docs-audit.json'
PUBLIC='https://gravityleadershipsystem.com'
APP_NAMES=('SOP Foundry','Shift Lab','Inventory Center','Work Study Lab','Handbook Creator',
           'Forms Personalizer','Document Studio','Numbers Lab','Recipe Works','Quick Tools')
BETA_MANUAL_DIR='assets/downloads/windows/manuals/'
OLD_SITE=re.compile(r'(?:https?://)?(?:www\.)?thomasmonroebooks\.com',re.I)
SOURCE_MISDIRECTION=re.compile(r'(?:only use the download linked directly from|download(?:s|ed|ing)?\s+(?:the\s+)?(?:software|program|installer)\s+from)\s+Thomas Monroe Books',re.I)
CURRENT_MANUAL=re.compile(r'Current Windows preview manual',re.I)
MISLEADING_INSTALLER=re.compile(r'Download corrected Windows installer',re.I)
TEXT_FORMATS={'.html','.txt','.md'}
out={'scope':'all site HTML, published PDF, DOCX, customer text/markdown; compare against product functionality separately',
     'counts':{},'warnings':[],'binary_review':[],'product_pages':[],'failures':[],'generated_candidate_only':True}
def alert(path,kind,sample='',level='review'):
    out['warnings'].append({'path':str(path).replace(str(ROOT)+'/',''),
                            'kind':kind,'level':level,'evidence':str(sample)[:260]})
def analyze_text(path,text,html=False):
    rel=path.relative_to(ROOT).as_posix()
    if html:
        soup=BeautifulSoup(text,'html.parser')
        for x in soup(['script','style','noscript']): x.decompose()
        content=soup.get_text(' ',strip=True)
        links=[a.get('href','') for a in soup.find_all('a',href=True)]
        title=(soup.title.get_text(' ',strip=True) if soup.title else '')
        desc=soup.find('meta',attrs={'name':'description'})
        desc=desc.get('content','') if desc else ''
        if rel.startswith('site/') and len(out['product_pages'])<300:
            out['product_pages'].append({'path':rel,'title':title,'description':desc})
        for link in links:
            if OLD_SITE.search(link):
                alert(rel,'customer navigation points at publisher site',link,'high')
    else:
        content=text
    if SOURCE_MISDIRECTION.search(content):
        alert(rel,'manual incorrectly directs software downloads to publisher',SOURCE_MISDIRECTION.search(content).group(0),'critical')
    if CURRENT_MANUAL.search(content) and 'windows' in rel.lower() or (html and 'current windows preview manual' in content.lower()):
        alert(rel,'October manuals described as current despite unreleased November corrections',CURRENT_MANUAL.search(content).group(0),'review')
    if MISLEADING_INSTALLER.search(content):
        alert(rel,'installer described as corrected without qualifying correction scope',MISLEADING_INSTALLER.search(content).group(0),'high')
    if rel.startswith('site/assets/downloads/windows/manuals/') and OLD_SITE.search(content):
        alert(rel,'Windows manual still contains legacy publisher domain',OLD_SITE.search(content).group(0),'high')
    if html and rel.startswith('site/'):
        legacy_current_patterns=[
            r'(?:currently contains|current controlled edition now contains)\s+(?:250|325)\s+prompts',
            r'(?:250|325)\s+prompts\s+connect the systems',
            r'(?:250|325)\s+practical copy-and-paste prompts',
            r'(?:Search|Open the)\s+(?:250|325)(?:-prompt|\s+Prompts)',
            r'contains\s+(?:250|325)\s+prompts\s+covering'
        ]
        for expr in legacy_current_patterns:
            m=re.search(expr,text,re.I)
            if m:
                alert(rel,'current AI workbook description disagrees with published 350-prompt edition',
                      m.group(0),'high')
    if html and rel.startswith('site/') and re.search(r'\b(19|29)\b',content) and ('handbook' in rel):
        out.setdefault('price_review',[]).append(rel)
    return content
docs=[]
for p in sorted(SITE.rglob('*')):
    if not p.is_file(): continue
    ext=p.suffix.lower()
    rel=p.relative_to(ROOT).as_posix()
    if ext in TEXT_FORMATS:
        try:
            raw=p.read_text(encoding='utf-8',errors='replace')
            analyze_text(p,raw,html=(ext=='.html'))
            out['counts'][ext]=out['counts'].get(ext,0)+1
        except Exception as e:out['failures'].append({'path':rel,'error':str(e)})
    elif ext=='.docx':
        try:
            doc=Document(str(p))
            parts=[x.text for x in doc.paragraphs]
            for table in doc.tables:
                for row in table.rows:
                    parts.extend(cell.text for cell in row.cells)
            with zipfile.ZipFile(p) as arc:
                relations=' '.join(arc.read(n).decode('utf-8','replace') for n in arc.namelist() if n.startswith('word/_rels/') and n.endswith('.rels'))
            content=' '.join(parts)
            analyze_text(p,content+' '+relations)
            out['counts'][ext]=out['counts'].get(ext,0)+1
            docs.append({'path':rel,'format':'docx','characters':len(content)})
        except Exception as e:out['failures'].append({'path':rel,'error':str(e)})
    elif ext=='.pdf':
        try:
            reader=PdfReader(str(p),strict=False)
            pages=len(reader.pages)
            texts=[]
            errors=0
            for page in reader.pages:
                try:texts.append(page.extract_text() or '')
                except Exception:errors+=1
            full=' '.join(texts)
            analyze_text(p,full)
            urls=[]
            for page in reader.pages:
                try:
                    for entry in (page.get('/Annots') or []):
                        obj=entry.get_object();act=obj.get('/A') or {}
                        if act.get('/URI'):urls.append(str(act.get('/URI')))
                except Exception:pass
            if ('windows/manuals' in rel) and any(OLD_SITE.search(url) for url in urls):
                alert(rel,'clickable PDF hyperlink points to publisher',next(url for url in urls if OLD_SITE.search(url)),'critical')
            out['counts'][ext]=out['counts'].get(ext,0)+1
            docinfo={'path':rel,'format':'pdf','pages':pages,'characters':len(full),'annotation_urls':len(urls),'unreadable_pages':errors}
            docs.append(docinfo)
            if errors or (pages>0 and len(full)<20):
                alert(rel,'PDF has pages whose text cannot be reliably extracted',f'pages={pages} unreadable={errors} characters={len(full)}','review')
        except Exception as e:out['failures'].append({'path':rel,'error':str(e)})
# Also audit manuals bundled inside downloadable ZIP packages rather than assuming
# the loose public PDF/Word copies cover the complete customer experience.
import io
archive_reports=[]
for zpath in sorted(SITE.rglob('*.zip')):
    rel=zpath.relative_to(ROOT).as_posix()
    entry_report={'path':rel,'total_members':0,'documentation_members':0,'text_verified':0,'skipped':[]}
    try:
        with zipfile.ZipFile(zpath) as archive:
            members=[m for m in archive.infolist() if not m.is_dir()]
            entry_report['total_members']=len(members)
            for entry in members:
                ext=pathlib.PurePosixPath(entry.filename).suffix.lower()
                if ext not in ('.pdf','.docx','.txt','.md','.html'):continue
                entry_report['documentation_members']+=1
                label=rel+'!'+entry.filename
                if entry.file_size>25_000_000:
                    entry_report['skipped'].append(label+' (over 25MB)')
                    continue
                try:
                    raw=archive.read(entry)
                    if ext in ('.txt','.md','.html'):
                        txt=raw.decode('utf-8','replace')
                        if ext=='.html':
                            soup=BeautifulSoup(txt,'html.parser')
                            for node in soup(['script','style']): node.decompose()
                            txt=soup.get_text(' ',strip=True)
                    elif ext=='.docx':
                        d=Document(io.BytesIO(raw))
                        txt=' '.join(p.text for p in d.paragraphs)+' '+' '.join(c.text for t in d.tables for r in t.rows for c in r.cells)
                    else:
                        reader=PdfReader(io.BytesIO(raw),strict=False)
                        txt=' '.join((page.extract_text() or '') for page in reader.pages)
                    entry_report['text_verified']+=1
                    m=SOURCE_MISDIRECTION.search(txt)
                    if m:alert(label,'bundled instructions direct software downloads to publisher',m.group(0),'critical')
                    m=OLD_SITE.search(txt)
                    if m and ('manual' in label.lower() or 'quick_start' in label.lower() or 'guide' in label.lower()):
                        alert(label,'bundled guide references old publisher web address',m.group(0),'review')
                except Exception as e:
                    out['failures'].append({'path':label,'error':str(e)})
    except Exception as e:
        out['failures'].append({'path':rel,'error':str(e)})
    archive_reports.append(entry_report)
out['archives']=archive_reports
out['counts']['site_download_zips']=len(archive_reports)
out['counts']['embedded_documentation_items']=sum(x['documentation_members'] for x in archive_reports)
out['counts']['embedded_documents_text_verified']=sum(x['text_verified'] for x in archive_reports)
out['binary_review']=docs
out['counts']['site_html_pages']=sum(1 for v in out['product_pages'] if v['path'].endswith('.html'))
out['counts']['site_pdf_documentation']=sum(d['format']=='pdf' for d in docs)
out['counts']['site_docx_documentation']=sum(d['format']=='docx' for d in docs)
out['counts']['high_or_critical_findings']=sum(x['level'] in ('high','critical') for x in out['warnings'])
out['counts']['review_findings']=sum(x['level']=='review' for x in out['warnings'])
REPORT.write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8')
print('GRAVITY ALL-PRODUCT DOCUMENTATION INVENTORY (READ ONLY)')
print('Counts:',json.dumps(out['counts'],sort_keys=True))
print('Warnings:',len(out['warnings']),'Extraction failures:',len(out['failures']))
for x in out['warnings'][:100]:
    print('[',x['level'].upper(),']',x['kind'],'|',x['path'],'|',x['evidence'])
for x in out['failures'][:30]:print('[UNREADABLE]',x['path'],x['error'][:150])
print('Full evidence JSON:',REPORT)
print('Scope limit: semantic feature parity, accessibility layout, and physical app workflows require additional review.')
if out['failures']:sys.exit(1)
