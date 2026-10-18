import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

const MARGIN = 15;
const LINE_HEIGHT = 6;
const PAGE_HEIGHT = 297;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function newDoc() {
  return new jsPDF("p", "mm", "a4");
}

function ensureSpace(doc, y, needed = LINE_HEIGHT) {
  if (y + needed > PAGE_HEIGHT - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function addHeading(doc, text, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(43, 33, 64);
  doc.text(text, MARGIN, y);
  return y + LINE_HEIGHT + 2;
}

function addSubheading(doc, text, y) {
  y = ensureSpace(doc, y, 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(169, 125, 62);
  doc.text(text, MARGIN, y);
  return y + LINE_HEIGHT;
}

function addParagraph(doc, text, y) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(50, 45, 65);
  const lines = doc.splitTextToSize(text || "", CONTENT_WIDTH);
  lines.forEach((line) => {
    y = ensureSpace(doc, y);
    doc.text(line, MARGIN, y);
    y += LINE_HEIGHT - 1;
  });
  return y + 2;
}

function addBulletList(doc, items, y) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(50, 45, 65);
  (items || []).forEach((item) => {
    const lines = doc.splitTextToSize(`•  ${item}`, CONTENT_WIDTH - 4);
    lines.forEach((line) => {
      y = ensureSpace(doc, y);
      doc.text(line, MARGIN + 2, y);
      y += LINE_HEIGHT - 1;
    });
  });
  return y + 2;
}

function addDivider(doc, y) {
  doc.setDrawColor(220, 210, 230);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  return y + 6;
}

export async function exportPalmReportPDF({
  imageElementId,
  palmLines = [],
  extraFeatures = [],
  interpretation,
  guidanceScore,
  personalityInsights,
  lifeAreas = [],
  recommendations = [],
  filename = "palm-analysis-report.pdf",
}) {
  const doc = newDoc();
  let y = MARGIN;

  y = addHeading(doc, "Palm Analysis Report", y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 112, 145);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, MARGIN, y);
  y += 8;
  y = addDivider(doc, y);




  y = addSubheading(doc, "Detected Palm Lines", y);
  palmLines.forEach((line) => {
    y = ensureSpace(doc, y, 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(50, 45, 65);
    doc.text(`${line.name} — ${line.confidence}% confidence`, MARGIN, y);
    y += LINE_HEIGHT - 1;
    y = addParagraph(doc, line.meaning, y);
  });

  if (extraFeatures.length) {
    y = addSubheading(doc, "Additional Features", y);
    extraFeatures.forEach((f) => {
      y = addParagraph(doc, `${f.name} (${f.confidence}%): ${f.description}`, y);
    });
  }

  y = addSubheading(doc, "AI Interpretation", y);
  y = addParagraph(doc, interpretation, y);

  if (personalityInsights) {
    y = addSubheading(doc, "Personality Insights", y);
    y = addParagraph(doc, `Strengths: ${personalityInsights.strengths.join(", ")}`, y);
    y = addParagraph(doc, `Growth Areas: ${personalityInsights.growthAreas.join(", ")}`, y);
  }

  if (lifeAreas.length) {
    y = addSubheading(doc, "Life Areas", y);
    lifeAreas.forEach((a) => {
      y = addParagraph(doc, `${a.label}: ${a.value}`, y);
    });
  }

  y = addSubheading(doc, "Recommendations", y);
  y = addBulletList(doc, recommendations, y);

  y = addSubheading(doc, "Guidance Score", y);
  y = addParagraph(doc, `${guidanceScore} / 100`, y);

  doc.save(filename);
}

export function exportTarotReportPDF({
  spreadName,
  cards = [],
  interpretation,
  categories = [],
  recommendations = [],
  guidanceScore,
  filename = "tarot-reading-report.pdf",
}) {
  const doc = newDoc();
  let y = MARGIN;

  y = addHeading(doc, "Tarot Reading Report", y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 112, 145);
  doc.text(`${spreadName || "Reading"} — Generated ${new Date().toLocaleDateString()}`, MARGIN, y);
  y += 8;
  y = addDivider(doc, y);

  y = addSubheading(doc, "Selected Cards", y);
  cards.forEach((card, i) => {
    y = ensureSpace(doc, y, 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(50, 45, 65);
    doc.text(`${i + 1}. ${card.name}${card.reversed ? " (Reversed)" : ""}`, MARGIN, y);
    y += LINE_HEIGHT - 1;
    y = addParagraph(doc, card.meaning, y);
  });

  y = addSubheading(doc, "AI Interpretation", y);
  y = addParagraph(doc, interpretation, y);

  if (categories.length) {
    y = addSubheading(doc, "Categories", y);
    categories.forEach((c) => {
      y = addParagraph(doc, `${c.label}: ${c.value}`, y);
    });
  }

  y = addSubheading(doc, "Recommendations", y);
  y = addBulletList(doc, recommendations, y);

  y = addSubheading(doc, "Guidance Score", y);
  y = addParagraph(doc, `${guidanceScore} / 100`, y);

  doc.save(filename);
}

export function exportDataAsExcel(rows, filename = "report.xlsx", sheetName = "Report") {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}