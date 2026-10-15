const cleanPdfText = (value) => String(value ?? '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^\x20-\x7e]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const escapePdfText = (value) => cleanPdfText(value)
  .replace(/\\/g, '\\\\')
  .replace(/\(/g, '\\(')
  .replace(/\)/g, '\\)');

const wrapPdfText = (value, maxLength = 88) => {
  const words = cleanPdfText(value).split(' ').filter(Boolean);
  const lines = [];
  let current = '';
  words.forEach((word) => {
    if (word.length > maxLength) {
      if (current) lines.push(current);
      current = '';
      for (let offset = 0; offset < word.length; offset += maxLength) {
        lines.push(word.slice(offset, offset + maxLength));
      }
      return;
    }
    if (current && `${current} ${word}`.length > maxLength) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  });
  if (current) lines.push(current);
  return lines.length ? lines : [''];
};

export const downloadPdfReport = (title, sections, filename = 'lunara-report.pdf') => {
  const reportLines = [];
  sections.forEach((section) => {
    reportLines.push({ text: section.heading, heading: true });
    (section.lines || []).forEach((line) => {
      wrapPdfText(line).forEach((wrapped) => reportLines.push({ text: wrapped }));
    });
    reportLines.push({ text: '' });
  });

  const pages = [];
  let pageLines = [];
  let lineCount = 0;
  reportLines.forEach((line) => {
    if (lineCount >= 46) {
      pages.push(pageLines);
      pageLines = [];
      lineCount = 0;
    }
    pageLines.push(line);
    lineCount += line.heading ? 2 : 1;
  });
  if (pageLines.length || pages.length === 0) pages.push(pageLines);

  const objects = [];
  const addObject = (value) => { objects.push(value); return objects.length; };
  const catalogId = addObject('');
  const pagesId = addObject('');
  const regularFontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const boldFontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const pageIds = [];

  pages.forEach((lines, pageIndex) => {
    let stream = 'q 0.98 0.95 0.86 rg 0 0 595 842 re f Q\n';
    stream += 'q 0.42 0.20 0.08 RG 1.2 w 30 30 535 782 re S Q\n';
    stream += `BT /F2 9 Tf 46 811 Td (LUNARA  /  ${escapePdfText(title).slice(0, 60)}) Tj ET\n`;
    stream += `BT /F1 8 Tf 46 795 Td (Generated ${escapePdfText(new Date().toLocaleString())}) Tj ET\n`;
    stream += '0.42 0.20 0.08 RG 0.7 w 46 784 m 549 784 l S\n';
    let y = 765;
    lines.forEach((line) => {
      if (!line.text) { y -= 7; return; }
      const font = line.heading ? 'F2' : 'F1';
      const size = line.heading ? 11 : 9;
      const color = line.heading ? '0.42 0.20 0.08' : '0.20 0.15 0.12';
      stream += `${color} rg BT /${font} ${size} Tf 48 ${y} Td (${escapePdfText(line.text)}) Tj ET\n`;
      y -= line.heading ? 18 : 14;
    });
    stream += `BT /F1 8 Tf 500 42 Td (Page ${pageIndex + 1} of ${pages.length}) Tj ET\n`;
    const streamId = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`);
    const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${regularFontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${streamId} 0 R >>`);
    pageIds.push(pageId);
  });

  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
  let pdf = '%PDF-1.4\n%Lunara\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
