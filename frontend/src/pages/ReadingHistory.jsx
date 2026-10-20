import { useEffect, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import {
  CalendarDays,
  Clock3,
  Download,
  Hand,
  Layers3,
  LoaderCircle,
  Sparkles,
  Trash2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import api from "../api/client";
import { tarotDeck } from "../data/tarotDeck";

const PALM_FEATURE_ORDER = ["heart", "head", "life", "fate", "sun"];
const PALM_FEATURE_META = {
  heart: { label: "Heart Line", symbol: "♡" },
  head: { label: "Head Line", symbol: "◌" },
  life: { label: "Life Line", symbol: "◡" },
  fate: { label: "Fate Line", symbol: "│" },
  sun: { label: "Sun Line", symbol: "✦" },
};



function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}
function formatTime(value) {
  if (!value) return "Time unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Time unavailable" : date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}
function formatDateTime(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function cleanInsightText(value) {
  return String(value || "")
    .replace(/\r/g, "")
    .replace(/```(?:markdown|md|text)?/gi, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^\s*[-•]\s*/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
function shortText(value, max = 260) {
  const text = cleanInsightText(value);
  if (!text) return "No saved interpretation is available for this session.";
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const sentenceEnd = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  return `${(sentenceEnd > max * 0.55 ? cut.slice(0, sentenceEnd + 1) : cut).trim()}…`;
}
function parseTarot(item) {
  let parsed = null;
  try { parsed = JSON.parse(item?.input_summary || ""); } catch { /* legacy summary format */ }
  if (parsed && Array.isArray(parsed.cards)) {
    return {
      cards: parsed.cards.map((entry) => typeof entry === "string"
        ? { card: entry, orientation: "upright" }
        : { card: entry.card || entry.name || "Tarot card", orientation: entry.orientation || (entry.reversed ? "reversed" : "upright") }),
      question: parsed.question || "General reflection",
      spread: parsed.spread || "Tarot spread",
    };
  }
  const summary = String(item?.input_summary || "");
  const cardsMatch = summary.match(/Cards:\s*(.+)$/im);
  const cards = cardsMatch ? cardsMatch[1].split(",").map((name) => name.trim()).filter(Boolean).map((card) => ({ card, orientation: "upright" })) : [];
  return {
    cards,
    question: summary.match(/Question:\s*([^;\n]+)/i)?.[1]?.trim() || "General reflection",
    spread: summary.match(/Spread:\s*([^;\n]+)/i)?.[1]?.trim() || "Tarot spread",
  };
}
function getTarotCard(name) {
  const target = String(name || "").trim().toLowerCase();
  return tarotDeck.find((card) => String(card.name).trim().toLowerCase() === target || String(card.id).trim().toLowerCase() === target);
}
function extractPalmFeatures(item) {
  if (!Array.isArray(item?.palm_insights)) return [];
  const byKey = new Map(item.palm_insights.filter((feature) => feature?.key).map((feature) => [feature.key, feature]));
  return PALM_FEATURE_ORDER.map((key) => byKey.get(key)).filter(Boolean);
}
function getPalmSummary(item) {
  const features = extractPalmFeatures(item);
  if (!features.length) return "Your saved palm interpretation is ready to review.";
  const observed = features.filter((f) => ["visible", "detected", "clear"].includes(String(f.status || "").toLowerCase())).length;
  return `${observed} of ${features.length} traditional palm features have saved observations`;
}
function normalizedPoints(feature) {
  const raw = feature?.normalized_points || feature?.points || [];
  if (!Array.isArray(raw)) return [];
  return raw.filter((p) => Array.isArray(p) && p.length >= 2).map(([x0, y0]) => {
    const x = Number(x0); const y = Number(y0);
    return [Math.max(0, Math.min(1, Math.abs(x) > 1 ? x / 100 : x)), Math.max(0, Math.min(1, Math.abs(y) > 1 ? y / 100 : y))];
  });
}
function getDetectedPalmLines(item) {
  return (Array.isArray(item?.detected_lines) ? item.detected_lines : [])
    .map((line) => ({ key: line.key || line.name || "feature", name: line.name || PALM_FEATURE_META[line.key]?.label || "Palm feature", points: normalizedPoints(line), color: line.color || "#9b5d38" }))
    .filter((line) => line.points.length >= 2);
}
function pdfHeader(doc, title, subtitle) {
  const width = doc.internal.pageSize.getWidth();
  doc.setFillColor(250, 245, 237);
  doc.rect(0, 0, width, 30, "F");
  doc.setTextColor(78, 51, 34);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("PALMISTRY & TAROT", 17, 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(143, 108, 81);
  doc.text("PERSONAL READING REPORT", 17, 18);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(61, 40, 27);
  doc.text(title, 17, 41);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(119, 87, 64);
  doc.text(subtitle, 17, 48);
  doc.setDrawColor(224, 211, 195);
  doc.line(17, 53, width - 17, 53);
}
function addPdfFooter(doc) {
  const count = doc.getNumberOfPages();
  for (let page = 1; page <= count; page += 1) {
    doc.setPage(page);
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    doc.setDrawColor(224, 211, 195);
    doc.line(17, h - 16, w - 17, h - 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(145, 121, 103);
    doc.text("For reflection only · Not a scientific prediction or professional advice", 17, h - 9);
    doc.text(`${page} / ${count}`, w - 25, h - 9);
  }
}
function ensurePdfSpace(doc, y, required, title, subtitle) {
  if (y + required > doc.internal.pageSize.getHeight() - 23) {
    doc.addPage();
    const width = doc.internal.pageSize.getWidth();
    doc.setFillColor(250, 245, 237);
    doc.rect(0, 0, width, 18, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(78, 51, 34);
    doc.text("PALMISTRY & TAROT  /  PERSONAL READING REPORT", 17, 11);
    doc.setDrawColor(224, 211, 195);
    doc.line(17, 21, width - 17, 21);
    return 28;
  }
  return y;
}
function addPdfSection(doc, title, body, y, reportTitle, subtitle) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxTextWidth = pageWidth - 34;
  const text = cleanInsightText(body) || "No additional details were saved for this section.";
  const ensurePage = (required = 8) => {
    if (y + required <= pageHeight - 22) return;
    doc.addPage();
    doc.setFillColor(250, 245, 237);
    doc.rect(0, 0, pageWidth, 18, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(78, 51, 34);
    doc.text("PALMISTRY & TAROT  /  PERSONAL READING REPORT", 17, 11);
    doc.setDrawColor(224, 211, 195);
    doc.line(17, 21, pageWidth - 17, 21);
    y = 29;
  };

  ensurePage(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(88, 57, 39);
  doc.text(title, 17, y + 4);
  doc.setDrawColor(226, 211, 193);
  doc.line(17, y + 7, pageWidth - 17, y + 7);
  y += 13;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(72, 55, 44);
  const lines = doc.splitTextToSize(text, maxTextWidth);
  lines.forEach((line) => {
    ensurePage(5.2);
    doc.text(line, 17, y);
    y += 4.3;
  });
  return y + 5;
}

function downloadPalmPdf(item) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const subtitle = `${formatDateTime(item.created_at)} · Reading ID ${item.id}`;
  pdfHeader(doc, "Palm Reading Report", subtitle);
  let y = 62;

  y = addPdfSection(
    doc,
    "Analysis overview",
    getPalmSummary(item),
    y,
    "Palm Reading Report",
    subtitle,
    { maxLines: 5 }
  );

  const features = extractPalmFeatures(item);
  if (features.length) {
    y = addPdfSection(doc, "Palm observations saved during analysis", "The following details are reproduced from this saved analysis.", y, "Palm Reading Report", subtitle, { maxLines: 3 });
    features.forEach((feature) => {
      const meta = PALM_FEATURE_META[feature.key] || { label: feature.name || "Palm feature" };
      const body = [
        feature.observation ? `Observation: ${feature.observation}` : "",
        feature.traditional_meaning ? `Traditional association: ${feature.traditional_meaning}` : "",
        feature.reflection ? `Reflection: ${feature.reflection}` : "",
      ].filter(Boolean).join("\n");
      if (body.trim()) {
        y = addPdfSection(doc, meta.label, body, y, "Palm Reading Report", subtitle, { maxLines: 8 });
      }
    });
  }

  y = addPdfSection(
    doc,
    "Analysis generated at reading time",
    item.result_text || "No interpretation text was saved for this analysis.",
    y,
    "Palm Reading Report",
    subtitle,
    { maxLines: 120 }
  );

  addPdfSection(
    doc,
    "Interpretation note",
    "This report contains saved analysis text and observations from this reading. Palmistry is a reflective tradition, not a scientifically validated prediction or a substitute for qualified professional advice.",
    y,
    "Palm Reading Report",
    subtitle,
    { maxLines: 5 }
  );
  addPdfFooter(doc);
  doc.save(`palm-reading-report-${item.id}.pdf`);
}

function downloadTarotPdf(item) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const tarot = parseTarot(item);
  const subtitle = `${formatDateTime(item.created_at)} · ${tarot.spread} · Reading ID ${item.id}`;
  pdfHeader(doc, "Tarot Reading Report", subtitle);
  let y = 62;
  y = addPdfSection(doc, "Question", tarot.question, y, "Tarot Reading Report", subtitle, { maxLines: 6 });
  y = addPdfSection(doc, "Spread", tarot.spread || "Not recorded", y, "Tarot Reading Report", subtitle, { maxLines: 3 });
  const cardDetails = tarot.cards.length
    ? tarot.cards.map((entry, index) => `${index + 1}. ${entry.card || "Tarot card"} — ${(entry.orientation || "upright").toLowerCase()}`).join("\n")
    : "No card details were saved for this session.";
  y = addPdfSection(doc, "Cards drawn", cardDetails, y, "Tarot Reading Report", subtitle, { maxLines: 18 });
  y = addPdfSection(
    doc,
    "Interpretation generated at reading time",
    item.result_text || "No interpretation text was saved for this analysis.",
    y,
    "Tarot Reading Report",
    subtitle,
    { maxLines: 120 }
  );
  addPdfSection(
    doc,
    "Interpretation note",
    "This report reproduces the interpretation saved for this reading. Tarot is a reflective practice, not a guaranteed prediction or a substitute for qualified professional advice.",
    y,
    "Tarot Reading Report",
    subtitle,
    { maxLines: 5 }
  );
  addPdfFooter(doc);
  doc.save(`tarot-reading-report-${item.id}.pdf`);
}

function downloadExcel(item) {
  const workbook = XLSX.utils.book_new();
  const summaryRows = [
    ["Palmistry & Tarot Intelligence Platform — Reading Report"],
    ["Reading ID", item.id],
    ["Reading Type", item.reading_type === "palm" ? "Palm Reading" : "Tarot Reading"],
    ["Title", item.title || "Reading"],
    ["Date and Time", formatDateTime(item.created_at)],
    ["Saved Input", item.input_summary || ""],
    ["Interpretation", cleanInsightText(item.result_text) || "No saved interpretation is available."],
  ];
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summaryRows), "Reading Summary");

  if (item.reading_type === "palm") {
    const featureRows = [["Feature", "Status", "Observation", "Traditional Association", "Reflection", "Confidence"]];
    extractPalmFeatures(item).forEach((feature) => {
      featureRows.push([
        PALM_FEATURE_META[feature.key]?.label || feature.name || feature.key || "Palm feature",
        feature.status || "Not recorded",
        feature.observation || "",
        feature.traditional_meaning || "",
        feature.reflection || "",
        feature.confidence == null ? "" : feature.confidence,
      ]);
    });
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(featureRows), "Palm Observations");
    const lineRows = [["Line", "Color", "Normalized Points"]];
    getDetectedPalmLines(item).forEach((line) => lineRows.push([line.name, line.color, JSON.stringify(line.points)]));
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(lineRows), "Palm Line Paths");
  } else {
    const tarot = parseTarot(item);
    const cardRows = [["Spread", tarot.spread], ["Question", tarot.question], [], ["Position", "Card", "Orientation"]];
    tarot.cards.forEach((card, index) => cardRows.push([index + 1, card.card, card.orientation || "upright"]));
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(cardRows), "Tarot Cards");
  }

  // Make columns readable when the workbook opens in Excel or LibreOffice.
  workbook.SheetNames.forEach((name) => {
    const sheet = workbook.Sheets[name];
    const range = XLSX.utils.decode_range(sheet["!ref"] || "A1:A1");
    const widths = [];
    for (let col = range.s.c; col <= range.e.c; col += 1) {
      let max = 14;
      for (let row = range.s.r; row <= range.e.r; row += 1) {
        const cell = sheet[XLSX.utils.encode_cell({ r: row, c: col })];
        if (cell && cell.v != null) max = Math.max(max, Math.min(String(cell.v).length, 55));
      }
      widths.push({ wch: max + 2 });
    }
    sheet["!cols"] = widths;
    sheet["!autofilter"] = { ref: sheet["!ref"] || "A1:A1" };
  });

  XLSX.writeFile(workbook, `${item.reading_type === "palm" ? "palm" : "tarot"}-reading-report-${item.id}.xlsx`);
}

function PalmImagePreview({ item }) {
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState("");
  const lines = useMemo(() => getDetectedPalmLines(item), [item]);
  useEffect(() => {
    let active = true; let objectUrl = "";
    setImageUrl(""); setImageError("");
    if (item.has_palm_image) {
      api.get(`/api/readings/${item.id}/palm-image`, { responseType: "blob" })
        .then((response) => {
          objectUrl = URL.createObjectURL(response.data);
          if (active) setImageUrl(objectUrl);
        })
        .catch(() => { if (active) setImageError("Saved palm image could not be loaded."); });
    } else setImageError("No palm image was saved for this session.");
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [item.id, item.has_palm_image]);
  return (
    <div className="rh-palm-visual">
      <div className="rh-visual-label"><span><Hand size={15} /> Analysed palm</span>{lines.length > 0 && <small>{lines.length} paths saved</small>}</div>
      {imageUrl ? (
        <div className="rh-palm-stage">
          <img src={imageUrl} alt="Saved palm for this reading" />
          {lines.length > 0 && <svg className="rh-palm-overlay" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
            {lines.map((line) => <polyline key={line.key} points={line.points.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke={line.color} strokeWidth="0.009" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />)}
          </svg>}
        </div>
      ) : <div className="rh-palm-placeholder"><Hand size={30} /><span>{imageError || "Loading saved palm…"}</span></div>}
      <div className="rh-analysis-note">{lines.length ? "Saved analysis paths are overlaid on the original palm image." : "No saved line coordinates are available for an overlay."}</div>
    </div>
  );
}

function ReadingActions({ item, onDelete, onDownloadPdf }) {
  const [busy, setBusy] = useState("");
  async function runDownload(kind, action) {
    setBusy(kind);
    try { await action(item); }
    catch (error) { window.alert(`The ${kind.toUpperCase()} report could not be created. Please try again.`); console.error(error); }
    finally { setBusy(""); }
  }
  return <div className="rh-card-actions">
    <button className="rh-action-button" onClick={() => runDownload("pdf", onDownloadPdf)} disabled={Boolean(busy)}>
      {busy === "pdf" ? <LoaderCircle size={15} className="rh-spin" /> : <Download size={15} />}
      {busy === "pdf" ? "Preparing PDF…" : "Download PDF"}
    </button>
    <button className="rh-action-button" onClick={() => runDownload("excel", downloadExcel)} disabled={Boolean(busy)}>
      {busy === "excel" ? <LoaderCircle size={15} className="rh-spin" /> : <FileSpreadsheet size={15} />}
      {busy === "excel" ? "Preparing Excel…" : "Download Excel"}
    </button>
    <button className="rh-icon-button danger" onClick={() => onDelete(item)} title="Delete this reading" aria-label="Delete this reading" disabled={Boolean(busy)}><Trash2 size={16} /></button>
  </div>;
}

function PalmHistoryCard({ item, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const features = extractPalmFeatures(item);
  return <article className="rh-reading-card">
    <div className="rh-card-top">
      <div className="rh-type"><span className="rh-type-icon"><Hand size={18} /></span><div><span className="rh-type-label">PALM READING</span><h3>{item.title || "Palm reading"}</h3></div></div>
      <ReadingActions item={item} onDelete={onDelete} onDownloadPdf={downloadPalmPdf} />
    </div>
    <div className="rh-meta"><span><CalendarDays size={13} />{formatDate(item.created_at)}</span><span><Clock3 size={13} />{formatTime(item.created_at)}</span><span className="rh-status"><ShieldCheck size={13} />Saved session</span></div>
    <div className="rh-palm-layout">
      <PalmImagePreview item={item} />
      <div className="rh-reading-copy"><span className="rh-kicker">READING SUMMARY</span><h4>{getPalmSummary(item)}</h4><p>{shortText(item.result_text, 310)}</p>
        <button className="rh-expand" onClick={() => setExpanded((value) => !value)}>{expanded ? "Hide details" : "View reading details"}{expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</button>
      </div>
    </div>
    {expanded && <div className="rh-details">
      <div className="rh-result-block"><div className="rh-detail-heading"><Sparkles size={16} /><span>Saved interpretation</span></div>
        {cleanInsightText(item.result_text) ? cleanInsightText(item.result_text).split(/\n{2,}/).filter(Boolean).map((paragraph, index) => <p key={`${item.id}-p-${index}`}>{paragraph}</p>) : <p>No interpretation text was saved for this reading.</p>}
      </div>
      {features.length > 0 && <div className="rh-feature-grid">{features.map((feature) => {
        const meta = PALM_FEATURE_META[feature.key] || { label: feature.name || "Palm feature", symbol: "•" };
        return <article className="rh-palm-feature" key={`${item.id}-${feature.key}`}><div className="rh-feature-heading"><span className="rh-feature-symbol">{meta.symbol}</span><strong>{meta.label}</strong></div>
          {feature.observation && <p><b>Observation</b>{feature.observation}</p>}
          {feature.traditional_meaning && <p><b>Traditional association</b>{feature.traditional_meaning}</p>}
          {feature.reflection && <p><b>Reflection</b>{feature.reflection}</p>}
        </article>;
      })}</div>}
    </div>}
  </article>;
}

function TarotHistoryCard({ item, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const tarot = parseTarot(item);
  return <article className="rh-reading-card">
    <div className="rh-card-top">
      <div className="rh-type"><span className="rh-type-icon tarot"><Layers3 size={18} /></span><div><span className="rh-type-label">TAROT READING</span><h3>{item.title || "Tarot reading"}</h3></div></div>
      <ReadingActions item={item} onDelete={onDelete} onDownloadPdf={downloadTarotPdf} />
    </div>
    <div className="rh-meta"><span><CalendarDays size={13} />{formatDate(item.created_at)}</span><span><Clock3 size={13} />{formatTime(item.created_at)}</span><span className="rh-status"><ShieldCheck size={13} />Saved session</span></div>
    <div className="rh-tarot-block">
      <div className="rh-tarot-heading"><div><span className="rh-kicker">SAVED CARD DRAW</span><h4>{tarot.spread}</h4></div><span className="rh-card-count">{tarot.cards.length} {tarot.cards.length === 1 ? "card" : "cards"}</span></div>
      {tarot.cards.length ? <div className="rh-tarot-grid">{tarot.cards.map((entry, index) => {
        const card = getTarotCard(entry.card);
        return <div className="rh-tarot-history-card" key={`${item.id}-${index}`}><span className="rh-position">{String(index + 1).padStart(2, "0")}</span>
          {card?.image ? <img src={card.image} alt={`${entry.card} tarot card`} className="rh-tarot-image" loading="lazy" /> : <div className="rh-tarot-missing"><Sparkles size={25} /></div>}
          <strong>{entry.card || "Tarot card"}</strong><span>{entry.orientation || "upright"}</span>
        </div>;
      })}</div> : <div className="rh-no-cards">Card details were not included in this saved session.</div>}
    </div>
    <div className="rh-tarot-summary"><div><span className="rh-kicker">QUESTION</span><p>{tarot.question}</p></div><div><span className="rh-kicker">KEY INSIGHT</span><p>{shortText(item.result_text, 250)}</p></div></div>
    <button className="rh-expand wide" onClick={() => setExpanded((value) => !value)}>{expanded ? "Hide full interpretation" : "Read full interpretation"}{expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</button>
    {expanded && <div className="rh-details"><div className="rh-result-block"><div className="rh-detail-heading"><Sparkles size={16} /><span>Saved tarot interpretation</span></div>
      {cleanInsightText(item.result_text) ? cleanInsightText(item.result_text).split(/\n{2,}/).filter(Boolean).map((paragraph, index) => <p key={`${item.id}-p-${index}`}>{paragraph}</p>) : <p>No interpretation text was saved for this reading.</p>}
    </div></div>}
  </article>;
}

function EmptySection({ type }) {
  const palm = type === "palm";
  return <div className="rh-empty"><span>{palm ? <Hand size={26} /> : <Layers3 size={26} />}</span><h3>No {palm ? "palm" : "tarot"} readings yet</h3><p>Your saved {palm ? "palm images and interpretations" : "card draws and interpretations"} will appear here after you complete a reading.</p></div>;
}



export function ReadingHistory() {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("palm");
  const [busy, setBusy] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadHistory(showSpinner = true) {
    if (showSpinner) setBusy(true);
    setError("");
    try {
      const response = await api.get("/api/readings/me");
      setItems(Array.isArray(response.data?.items) ? response.data.items : []);
    } catch (err) {
      setError(err?.response?.data?.detail || "Reading history could not be loaded. Please try again.");
    } finally {
      setBusy(false);
      setRefreshing(false);
    }
  }
  useEffect(() => { loadHistory(); }, []);

  const grouped = useMemo(() => ({
    palm: items.filter((item) => item.reading_type === "palm").sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)),
    tarot: items.filter((item) => item.reading_type === "tarot").sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)),
  }), [items]);

  async function handleDelete(item) {
    const label = item.reading_type === "palm" ? "this palm reading" : "this tarot reading";
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/readings/${item.id}`);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (err) {
      window.alert(err?.response?.data?.detail || "The reading could not be deleted. Please try again.");
    }
  }

  const visibleItems = activeTab === "palm" ? grouped.palm : grouped.tarot;
  if (busy) return <section className="rh-page"><div className="rh-loading"><LoaderCircle size={20} className="rh-spin" />Loading your reading history…</div></section>;

  return <>
    <style>{`
      .rh-page,.rh-page *{box-sizing:border-box}
      .rh-page{width:min(1160px,calc(100% - 34px));margin:28px auto 70px;color:#493326;font-family:inherit}
      .rh-page button,.rh-page select{font:inherit}
      .rh-hero{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding:8px 0 25px}
      .rh-eyebrow{margin:0 0 9px;color:#a16b43;font-size:10px;font-weight:800;letter-spacing:.2em;text-transform:uppercase}
      .rh-hero h1{margin:0;color:#3e281c;font-family:Georgia,"Times New Roman",serif;font-size:clamp(36px,4vw,50px);line-height:1.05;font-weight:400;letter-spacing:normal}
      .rh-hero p{max-width:680px;margin:11px 0 0;color:#7b5d48;font-size:13px;line-height:1.7}
      .rh-hero-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
      .rh-count{min-width:108px;padding:12px 16px;border:1px solid #dfcdb5;border-radius:15px;background:#fffaf3;text-align:center}
      .rh-count strong{display:block;color:#4b3020;font-family:Georgia,"Times New Roman",serif;font-size:26px;font-weight:400;line-height:1.2}
      .rh-count span{display:block;margin-top:4px;color:#97775d;font-size:9px;letter-spacing:.1em;text-transform:uppercase}
      .rh-refresh{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:11px 13px;border:1px solid #dbc7af;border-radius:11px;background:#fffaf3;color:#674630;font-size:11px;font-weight:700;cursor:pointer}
      .rh-refresh:disabled{opacity:.6;cursor:wait}
      .rh-error{margin:0 0 18px;padding:12px 15px;border:1px solid #dfb8ad;border-radius:12px;background:#fff4f0;color:#8b4d42;font-size:12px}
      .rh-switch{display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:6px;margin:0 0 22px;border:1px solid #ddc9b0;border-radius:15px;background:#eee2d2}
      .rh-switch button{display:flex;align-items:center;justify-content:center;gap:9px;min-height:46px;border:0;border-radius:10px;background:transparent;color:#795a43;cursor:pointer;font-size:12px;font-weight:750;transition:background .18s ease}
      .rh-switch button.active{background:#fffaf3;color:#4d3020;box-shadow:0 4px 12px #4f331f12}
      .switch-count{display:grid;place-items:center;min-width:22px;height:22px;padding:0 6px;border-radius:999px;background:#eadbc8;color:#79563b;font-size:10px}
      .rh-section-head{display:flex;align-items:center;gap:13px;margin:0 0 14px}
      .rh-section-title{display:flex;align-items:center;gap:10px}
      .rh-section-title .mark{display:grid;place-items:center;width:37px;height:37px;border:1px solid #dcc6aa;border-radius:11px;background:#f3e6d5;color:#765038}
      .rh-section-title h2{margin:0;color:#4a2e20;font-family:Georgia,"Times New Roman",serif;font-size:25px;font-weight:400;letter-spacing:normal}
      .rh-section-title p{margin:3px 0 0;color:#94745b;font-size:11px}
      .rh-section-line{flex:1;height:1px;background:#e2d2be}
      .rh-list{display:grid;gap:16px}
      .rh-reading-card{overflow:hidden;border:1px solid #dfcdb5;border-radius:18px;background:#fffaf3;box-shadow:0 10px 28px #5034200b}
      .rh-card-top{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 19px 10px}
      .rh-type{display:flex;align-items:center;gap:11px;min-width:0}
      .rh-type-icon{display:grid;place-items:center;flex:none;width:40px;height:40px;border-radius:12px;background:#e9dfcf;color:#715038}
      .rh-type-icon.tarot{background:#e6dccd;color:#78533a}
      .rh-type-label,.rh-kicker{display:block;color:#a06c44;font-size:9px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}
      .rh-type h3{margin:4px 0 0;color:#4b3021;font-family:Georgia,"Times New Roman",serif;font-size:20px;font-weight:400;line-height:1.3}
      .rh-card-actions{display:flex;align-items:center;justify-content:flex-end;gap:7px;flex:none;flex-wrap:wrap}
      .rh-action-button,.rh-icon-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid #dbc7af;background:#fffdf9;color:#674630;cursor:pointer;transition:.18s ease}
      .rh-action-button{padding:9px 11px;border-radius:10px;font-size:11px;font-weight:750;white-space:nowrap}
      .rh-action-button:hover,.rh-icon-button:hover{border-color:#b99169;box-shadow:0 4px 12px #5b3b2610}
      .rh-action-button:disabled{opacity:.6;cursor:wait}
      .rh-icon-button{width:35px;height:35px;border-radius:10px}
      .rh-icon-button.danger{color:#95544a;border-color:#e2c9c1}
      .rh-meta{display:flex;align-items:center;flex-wrap:wrap;gap:7px;padding:0 19px 15px;color:#8e7059;font-size:10px}
      .rh-meta span{display:inline-flex;align-items:center;gap:5px;padding:6px 9px;border:1px solid #eadcca;border-radius:999px;background:#fcf5eb}
      .rh-meta .rh-status{color:#66704d}
      .rh-palm-layout{display:grid;grid-template-columns:minmax(240px,34%) minmax(0,1fr);gap:20px;padding:0 19px 19px}
      .rh-palm-visual{overflow:hidden;border:1px solid #dfcfbb;border-radius:14px;background:#f5ecdf}
      .rh-visual-label{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;border-bottom:1px solid #e5d6c3;background:#fbf4e9;color:#725038;font-size:10px;font-weight:750}
      .rh-visual-label span{display:flex;align-items:center;gap:6px}
      .rh-visual-label small{color:#a07e61;font-size:9px}
      .rh-palm-stage{position:relative;display:grid;place-items:center;min-height:245px;padding:10px;background:radial-gradient(circle at 50% 40%,#b98e641f,transparent 52%),#f5ecdf}
      .rh-palm-stage img{display:block;width:100%;height:230px;object-fit:contain}
      .rh-palm-overlay{position:absolute;inset:10px;width:calc(100% - 20px);height:230px;pointer-events:none}
      .rh-palm-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;min-height:245px;color:#a18772;font-size:11px;text-align:center;padding:14px}
      .rh-analysis-note{padding:9px 12px;border-top:1px solid #e5d6c3;color:#98785e;background:#fbf4e9;font-size:9px;line-height:1.5}
      .rh-reading-copy{align-self:center;padding:5px 4px}
      .rh-reading-copy h4{margin:8px 0 10px;color:#4a3022;font-family:Georgia,"Times New Roman",serif;font-size:23px;line-height:1.35;font-weight:400;letter-spacing:normal}
      .rh-reading-copy p{margin:0;color:#745945;font-size:12px;line-height:1.75;overflow-wrap:anywhere}
      .rh-expand{display:inline-flex;align-items:center;gap:7px;margin-top:12px;padding:0;border:0;background:transparent;color:#875b39;cursor:pointer;font-size:11px;font-weight:750}
      .rh-expand:hover{color:#5f3d28}
      .rh-expand.wide{width:100%;justify-content:center;padding:13px 19px 15px;border-top:1px solid #e8dac8;margin-top:0}
      .rh-tarot-block{margin:0 19px;padding:16px;border:1px solid #e2d1bd;border-radius:14px;background:#f8efe3}
      .rh-tarot-heading{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-bottom:13px}
      .rh-tarot-heading h4{margin:5px 0 0;color:#4f3323;font-family:Georgia,"Times New Roman",serif;font-size:20px;font-weight:400}
      .rh-card-count{padding:6px 9px;border:1px solid #dcc8ae;border-radius:999px;background:#fffaf4;color:#8b6b52;font-size:10px;font-weight:750}
      .rh-tarot-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:11px}
      .rh-tarot-history-card{position:relative;min-width:0;padding:10px;border:1px solid #dcc8ae;border-radius:12px;background:#fffaf3;text-align:center}
      .rh-position{position:absolute;top:8px;left:9px;z-index:2;color:#a38366;font-size:9px;font-weight:800}
      .rh-tarot-image{display:block;width:100%;height:165px;object-fit:contain;margin:3px auto 8px;border-radius:6px}
      .rh-tarot-history-card strong{display:block;color:#5a3b29;font-family:Georgia,"Times New Roman",serif;font-size:13px;font-weight:400;line-height:1.35}
      .rh-tarot-history-card>span:last-child{display:block;margin-top:5px;color:#98775c;font-size:9px;font-weight:750;letter-spacing:.1em;text-transform:uppercase}
      .rh-tarot-missing{display:grid;place-items:center;height:165px;margin-bottom:8px;color:#b38a61}
      .rh-no-cards{padding:18px;color:#98785e;font-size:12px;text-align:center}
      .rh-tarot-summary{display:grid;grid-template-columns:minmax(180px,.7fr) minmax(0,1.3fr);gap:10px;padding:14px 19px}
      .rh-tarot-summary>div{min-width:0;padding:13px;border:1px solid #e5d7c5;border-radius:12px;background:#fffdf9}
      .rh-tarot-summary p{margin:7px 0 0;color:#725846;font-size:11px;line-height:1.65;overflow-wrap:anywhere}
      .rh-details{border-top:1px solid #e8dac8;padding:18px;background:#fcf6ee}
      .rh-result-block{padding:17px;border:1px solid #e5d6c4;border-radius:13px;background:#fffdf9}
      .rh-detail-heading{display:flex;align-items:center;gap:8px;margin-bottom:11px;color:#70492f;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}
      .rh-result-block p{margin:0 0 10px;color:#654d3b;font-size:12px;line-height:1.75;overflow-wrap:anywhere}
      .rh-result-block p:last-child{margin-bottom:0}
      .rh-feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:9px;margin-top:11px}
      .rh-palm-feature{padding:13px;border:1px solid #e4d4c1;border-radius:12px;background:#fffaf4}
      .rh-feature-heading{display:flex;align-items:center;gap:8px;margin-bottom:10px;color:#5d3c28;font-size:12px}
      .rh-feature-symbol{display:grid;place-items:center;width:26px;height:26px;border-radius:8px;background:#efe1ce;color:#8b5e3b;font-size:15px}
      .rh-palm-feature p{margin:8px 0 0;color:#765b46;font-size:11px;line-height:1.6;overflow-wrap:anywhere}
      .rh-palm-feature p b{display:block;margin-bottom:3px;color:#9a6c47;font-size:9px;text-transform:uppercase;letter-spacing:.07em}
      .rh-empty{padding:42px 20px;border:1px dashed #d9c4aa;border-radius:17px;background:#fffaf3;text-align:center}
      .rh-empty>span{display:grid;place-items:center;width:54px;height:54px;margin:0 auto 13px;border-radius:16px;background:#f0e2d0;color:#7d5538}
      .rh-empty h3{margin:0;color:#553727;font-family:Georgia,"Times New Roman",serif;font-size:21px;font-weight:400}
      .rh-empty p{max-width:400px;margin:8px auto 0;color:#8a6b53;font-size:12px;line-height:1.7}
      .rh-loading{display:flex;align-items:center;justify-content:center;gap:10px;min-height:240px;color:#795a43;font-size:13px}
      .rh-disclaimer{display:flex;align-items:flex-start;gap:7px;margin:18px 2px 0;color:#90745d;font-size:10px;line-height:1.6}
      .rh-disclaimer svg{flex:none;margin-top:1px}
      .rh-spin{animation:rh-spin 1s linear infinite}
      @keyframes rh-spin{to{transform:rotate(360deg)}}
      @media(max-width:760px){.rh-hero{align-items:flex-start;flex-direction:column}.rh-hero-actions{width:100%;justify-content:flex-start;flex-wrap:wrap}.rh-card-top{align-items:flex-start;flex-direction:column}.rh-card-actions{width:100%;justify-content:flex-end}.rh-palm-layout{grid-template-columns:1fr}.rh-palm-stage img,.rh-palm-overlay{height:250px}.rh-tarot-summary{grid-template-columns:1fr}.rh-tarot-grid{grid-template-columns:repeat(auto-fit,minmax(120px,1fr))}}
      @media(max-width:430px){.rh-page{width:calc(100% - 22px);margin-top:18px}.rh-hero h1{font-size:36px}.rh-card-top{padding:14px 13px 10px}.rh-meta{padding:0 13px 13px}.rh-palm-layout{padding:0 13px 14px}.rh-tarot-block{margin:0 13px;padding:12px}.rh-tarot-summary{padding:12px 13px}.rh-tarot-image,.rh-tarot-missing{height:145px}.rh-switch button{font-size:11px}}
    `}</style>
    <main className="rh-page">
      <header className="rh-hero">
        <div><p className="rh-eyebrow">YOUR PERSONAL ARCHIVE</p><h1>Reading History</h1><p>Review past palm and tarot sessions, revisit the key interpretation, and download a neatly organised report whenever you need it.</p></div>
        <div className="rh-hero-actions"><div className="rh-count"><strong>{items.length}</strong><span>Total readings</span></div><button className="rh-refresh" onClick={() => { setRefreshing(true); loadHistory(false); }} disabled={refreshing}><RefreshCw size={14} className={refreshing ? "rh-spin" : ""} />{refreshing ? "Refreshing…" : "Refresh history"}</button></div>
      </header>
      {error && <div className="rh-error" role="alert">{error}</div>}
      <div className="rh-switch" role="tablist" aria-label="Reading type">
        <button role="tab" aria-selected={activeTab === "palm"} className={activeTab === "palm" ? "active" : ""} onClick={() => setActiveTab("palm")}><Hand size={16} />Palm readings<span className="switch-count">{grouped.palm.length}</span></button>
        <button role="tab" aria-selected={activeTab === "tarot"} className={activeTab === "tarot" ? "active" : ""} onClick={() => setActiveTab("tarot")}><Layers3 size={16} />Tarot readings<span className="switch-count">{grouped.tarot.length}</span></button>
      </div>
      <div className="rh-section-head"><div className="rh-section-title"><span className="mark">{activeTab === "palm" ? <Hand size={18} /> : <Layers3 size={18} />}</span><div><h2>{activeTab === "palm" ? "Palm reading archive" : "Tarot reading archive"}</h2><p>{visibleItems.length} saved {visibleItems.length === 1 ? "session" : "sessions"} · newest first</p></div></div><div className="rh-section-line" /></div>
      {visibleItems.length ? <div className="rh-list">{visibleItems.map((item) => activeTab === "palm" ? <PalmHistoryCard key={`${item.id}-${item.created_at}`} item={item} onDelete={handleDelete} /> : <TarotHistoryCard key={`${item.id}-${item.created_at}`} item={item} onDelete={handleDelete} />)}</div> : <EmptySection type={activeTab} />}
      <p className="rh-disclaimer"><FileText size={13} /> Reports are based on the interpretation saved with each reading. Palmistry and tarot are reflective traditions, not scientifically validated predictions.</p>
    </main>
  </>;
}

export default ReadingHistory;
