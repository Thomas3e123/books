import {jsPDF} from 'jspdf';

export function renderFieldSheet(article, sheet, origin) {
 const pdf = new jsPDF({unit:'pt', format:'letter', compress:true});
 const margin = 48, width = 516;
 const edition = article.issue ? 'Issue ' + String(article.issue).padStart(2,'0') : 'Gravity News';
 pdf.setProperties({title:sheet.title, subject:article.title, author:'The Gravity Report'});
 pdf.setLanguage('en-US');
 let y = 54;
 function block(text, size, bold=false, color='#233533') {
  pdf.setFont('helvetica',bold ? 'bold' : 'normal');
  pdf.setFontSize(size);
  pdf.setTextColor(color);
  const lines = pdf.splitTextToSize(text, width);
  pdf.text(lines,margin,y,{lineHeightFactor:1.25});
  y += lines.length * size * 1.25 + 5;
 }
 function heading(text) { y += 8; block(text,13,true,'#17564d'); }
 block('THE GRAVITY REPORT   /   FIELD SHEET',12,true,'#17564d');
 block(edition,11);
 block(sheet.title,23,true);
 block(article.title,12);
 heading('Try this on shift');
 sheet.steps.forEach((step,i) => block((i + 1) + '.  ' + step,12));
 heading('What to watch for');
 block(sheet.watch,12);
 heading('How to tell if it helped');
 block(sheet.proof,12);
 heading('Shift notes');
 for (const label of sheet.records) {
  block(label,11);
  y += 8;
  pdf.setDrawColor('#71817e');
  pdf.line(margin,y,margin + width,y);
  y += 19;
 }
 if (y > 737) throw Error('Field Sheet exceeds one page: ' + article.slug);
 pdf.setFont('helvetica','normal');
 pdf.setFontSize(11);
 pdf.setTextColor('#17564d');
 pdf.textWithLink('Read the companion article',margin,747,{url:origin+'/gravity-report/'+article.slug});
 pdf.textWithLink('gravityleadershipsystem.com',365,747,{url:origin+'/'});
 return pdf.output('arraybuffer');
}
