import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BOOKS } from '../tmb-store/catalog.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dest=path.join(root,'tmb-site');
const bookPage=path.join(dest,'books.html');
const source=fs.readFileSync(bookPage,'utf8');
const html=(v)=>String(v??'').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=(cents)=>'$'+(cents/100).toFixed(2);
function mkdir(p){fs.mkdirSync(p,{recursive:true});}
function copySiteImage(src,dst){
 const start=path.resolve(root,src);
 if(!start.startsWith(path.join(root,'site','assets','images')+path.sep))throw Error('Untrusted source image');
 if(!fs.existsSync(start))throw Error('Missing source image '+src);
 const end=path.resolve(dest,dst.replace(/^\//,''));
 if(!end.startsWith(path.join(dest,'assets','images')+path.sep))throw Error('Untrusted output image');
 mkdir(path.dirname(end));fs.copyFileSync(start,end);
}
const list=[];
const sampleDir=path.join(dest,'samples');mkdir(sampleDir);
const header=(source.match(/<header class="site-header">[\s\S]*?<\/header>/)||[])[0];
const footer=(source.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)||[])[0];
if(!header||!footer)throw Error('Publisher header or footer missing');
for(const book of BOOKS){
 if(!/^[a-z0-9-]+$/.test(book.id))throw Error('Bad product id');
 const fullPath=path.resolve(root,book.sourcePdf);
 if(!fullPath.startsWith(path.join(root,'site','assets')+path.sep)||!fs.existsSync(fullPath))throw Error('Missing controlled full edition '+book.id);
 if(book.sourceCover)copySiteImage('site/assets/images/'+book.sourceCover,book.cover);
 else if(!fs.existsSync(path.join(dest,book.cover.slice(1))))throw Error('Missing TMB cover '+book.id);
 const txtPath=path.join(root,'site','assets','reader',book.reader+'.txt');
 if(!fs.existsSync(txtPath))throw Error('Missing book sample text '+book.id);
 const sampleText=fs.readFileSync(txtPath,'utf8').replace(/\r/g,'').replace(/\n{4,}/g,'\n\n').trim().slice(0,5600);
 if(sampleText.length<350)throw Error('Unusable sample excerpt '+book.id);
 const scanFolder=path.join(root,'site','assets','images','book-previews',book.previews||'');
 const scans=book.previews&&fs.existsSync(scanFolder)?fs.readdirSync(scanFolder).filter(x=>/\.webp$/i.test(x)).sort().slice(0,4):[];
 for(const pic of scans)copySiteImage('site/assets/images/book-previews/'+book.previews+'/'+pic,'/assets/images/book-samples/'+book.id+'/'+pic);
 const pageTitle=html(book.title),description=html(book.description),category=html(book.category);
 const sampleScans=scans.length?'<div class="tmb-preview-grid">'+scans.map(pic=>'<a href="/assets/images/book-samples/'+book.id+'/'+pic+'" target="_blank" rel="noopener" aria-label="Open a sample page from '+pageTitle+'"><img src="/assets/images/book-samples/'+book.id+'/'+pic+'" loading="lazy" alt="Sample interior page from '+pageTitle+'"></a>').join('')+'</div>':'';
 const sample=html(sampleText);
 const samplePage='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Read a Sample: '+pageTitle+' | Thomas Monroe Books</title><meta name="description" content="Read interior preview pages and a short excerpt from '+pageTitle+' by Thomas Butler."><link rel="canonical" href="https://thomasmonroebooks.com/samples/'+book.id+'"><link rel="icon" type="image/svg+xml" href="/assets/images/tmb-mark.svg"><link rel="stylesheet" href="/assets/css/publisher.css"></head><body class="publisher-site"><a class="skip" href="#main">Skip to content</a><div class="site-note">The same complete digital editions are available free through Gravity during the Founding Year.</div>'+header+'<main id="main"><section class="page-intro"><div class="wrap"><p class="breadcrumb"><a href="/books#'+book.id+'">Books</a> / Sample</p><span class="eyebrow">Inside the book</span><h1>'+pageTitle+'</h1><p class="lede">'+description+'</p><a class="button ghost" href="/books#'+book.id+'">Return to catalog and editions</a></div></section><section class="section"><div class="wrap tmb-sample"><h2>Sample interior pages</h2>'+ (sampleScans || '<p>Sample text from the actual digital edition appears below.</p>')+'<h2>Read an excerpt</h2><div class="tmb-excerpt">'+sample.replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br>')+'</div><p class="small-note">This is a limited preview. Page and line breaks may differ from the original PDF.</p><a class="button" href="/books#'+book.id+'">View digital edition</a></div></section></main>'+footer+'</body></html>';
 fs.writeFileSync(path.join(sampleDir,book.id+'.html'),samplePage);
 const crop=book.id==='employee-training'?' class="front-cover-crop"':'';
 list.push('<article class="book-card tmb-sale-card" id="'+book.id+'"><div class="book-cover-frame"><img'+crop+' src="'+html(book.cover)+'" alt="Front cover of '+pageTitle+'" loading="lazy" width="480" height="660"></div><div class="book-kicker">'+category+'</div><h2>'+pageTitle+'</h2><p>'+description+'</p><p class="tmb-price">Publisher PDF · '+money(book.priceCents)+'</p><div class="tmb-book-actions"><a class="text-link" href="/samples/'+book.id+'">Read a sample →</a><button class="button tmb-purchase" type="button" data-book="'+book.id+'" disabled>Buy digital PDF · '+money(book.priceCents)+'</button></div><p class="small-note">This same PDF is also available free on Gravity through October 1, 2027.</p></article>');
}
const start='<div class="catalog-grid">',end='<div class="meta-row">';
const a=source.indexOf(start),b=source.indexOf(end,a+start.length);
if(a<0||b<0)throw Error('Catalog publishing anchor changed');
let updated=source.slice(0,a)
 + '<div class="tmb-offer-notice" role="note"><strong>Choose the way you want to support the work.</strong> Thomas Monroe Books offers optional paid PDF purchases. The <strong>same complete books</strong> remain available free at <a href="https://gravityleadershipsystem.com/books" rel="noopener">Gravity</a> through October 1, 2027. Buying here supports future writing and publishing; you do not have to pay to read them.</div>'
 + '<p class="tmb-store-status" id="tmb-store-status" role="status" aria-live="polite">Checking digital checkout availability…</p>'
 + '<div class="catalog-grid">'+list.join('')+'</div>'
 + source.slice(b);
updated=updated.replace('</head>','<script defer src="/assets/js/tmb-store.js"></script></head>');
fs.writeFileSync(bookPage,updated);
const sitemap=['<?xml version="1.0" encoding="utf-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
for(const page of ['','books','about','publishing','contact','privacy','terms','purchase-complete']){
 sitemap.push('<url><loc>https://thomasmonroebooks.com/'+page+'</loc></url>');
}
for(const book of BOOKS)sitemap.push('<url><loc>https://thomasmonroebooks.com/samples/'+book.id+'</loc></url>');
sitemap.push('</urlset>');
fs.writeFileSync(path.join(dest,'sitemap.xml'),sitemap.join('\n')+'\n');
console.log(JSON.stringify({publisher:'Thomas Monroe Books',catalogTitles:BOOKS.length,previewPages:BOOKS.length,programFilesPublished:0,pdfFilesPublished:0}));
