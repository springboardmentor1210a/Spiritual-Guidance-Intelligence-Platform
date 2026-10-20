import { useEffect, useMemo, useState } from "react";
import { Activity, CalendarDays, FileSpreadsheet, FileText, Hand, Layers3, RefreshCw, Sparkles, TrendingUp } from "lucide-react";
import { jsPDF } from "jspdf";
import api from "../api/client";

const TYPES = [
  { id: "all", label: "All reports" },
  { id: "palm", label: "Palmistry reports" },
  { id: "tarot", label: "Tarot reports" },
  { id: "personality", label: "Personality reports" },
  { id: "guidance", label: "Spiritual guidance reports" },
  { id: "trends", label: "Insight trend reports" },
];

function safeText(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  try { return JSON.stringify(value, null, 2); } catch { return String(value); }
}
function dateValue(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
function formatDate(value) {
  const date = dateValue(value);
  return date ? date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "Date unavailable";
}
function parseInput(item) {
  try { return JSON.parse(item?.input_summary || "{}"); } catch { return {}; }
}
function reportType(item) {
  return String(item?.reading_type || "").toLowerCase().includes("palm") ? "palm" : "tarot";
}
function cardsText(item) {
  const data = parseInput(item);
  if (Array.isArray(data.cards)) return data.cards.map(c => typeof c === "string" ? c : `${c.card || c.name || "Card"} (${c.orientation || (c.reversed ? "reversed" : "upright")})`).join(", ");
  return String(item?.input_summary || "").match(/Cards:\s*(.+)$/i)?.[1] || "";
}
function rowFor(item) {
  const kind = reportType(item);
  return {
    "Reading ID": item.id,
    "Reading type": kind === "palm" ? "Palmistry" : "Tarot",
    "Title": item.title || (kind === "palm" ? "Palm Reading" : "Tarot Reading"),
    "Date": formatDate(item.created_at),
    "Timestamp": item.created_at || "",
    "Input / question": kind === "tarot" ? (parseInput(item).question || item.input_summary || "") : (item.input_summary || ""),
    "Spread / cards": kind === "tarot" ? `${parseInput(item).spread || ""} ${cardsText(item)}`.trim() : "",
    "Interpretation": item.result_text || "",
    "Palm features": kind === "palm" ? safeText(item.palm_insights || item.palm_insights_json || "") : "",
    "Detection status": item.detection_status || "",
  };
}
function monthKey(value) {
  const date = dateValue(value);
  return date ? `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}` : "Unknown";
}
function getThemes(text) {
  const source = String(text || "").toLowerCase();
  const themes = [
    ["Relationships", /relationship|love|partner|emotion|heart|connection|communication/],
    ["Career & purpose", /career|work|purpose|profession|leadership|ambition|project/],
    ["Personal growth", /growth|learn|confidence|habit|boundary|self-awareness|develop/],
    ["Spiritual reflection", /spiritual|intuition|mindful|reflection|inner|purpose|balance/],
    ["Challenges & choices", /challenge|obstacle|choice|decision|patience|uncertainty|risk/],
  ];
  return themes.filter(([, pattern]) => pattern.test(source)).map(([name]) => name);
}
function makeTrendRows(items) {
  const buckets = new Map();
  items.forEach(item => {
    const key = monthKey(item.created_at);
    if (!buckets.has(key)) buckets.set(key, { Month: key, "Palm readings": 0, "Tarot readings": 0, "Total readings": 0 });
    const row = buckets.get(key);
    row[reportType(item) === "palm" ? "Palm readings" : "Tarot readings"] += 1;
    row["Total readings"] += 1;
  });
  return [...buckets.values()].sort((a,b) => a.Month.localeCompare(b.Month));
}
function xmlEscape(value) {
  return safeText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function spreadsheetCell(value) {
  const isNumber = typeof value === "number" && Number.isFinite(value);
  return `<Cell><Data ss:Type="${isNumber ? "Number" : "String"}">${xmlEscape(value)}</Data></Cell>`;
}

function spreadsheetSheet(name, rows) {
  const safeRows = rows.length ? rows : [{ Note: "No data available for this sheet." }];
  const headers = [...new Set(safeRows.flatMap(row => Object.keys(row)))];
  const headerRow = `<Row>${headers.map(spreadsheetCell).join("")}</Row>`;
  const dataRows = safeRows.map(row => `<Row>${headers.map(header => spreadsheetCell(row[header] ?? "")).join("")}</Row>`).join("");
  return `<Worksheet ss:Name="${xmlEscape(name)}"><Table>${headerRow}${dataRows}</Table></Worksheet>`;
}

function exportWorkbook(items, selectedType) {
  const records = items.map(rowFor);
  const trends = makeTrendRows(items);
  const themes = new Map();
  items.forEach(item => getThemes(item.result_text).forEach(theme => themes.set(theme, (themes.get(theme) || 0) + 1)));
  const themeRows = [...themes.entries()].map(([theme, count]) => ({ Theme: theme, "Matched saved readings": count }));
  const infoRows = [
    { "Report type": selectedType, "Generated at": new Date().toISOString(), "Saved readings included": items.length },
    { Note: "Themes are keyword matches in saved interpretations, not validated psychological traits or predictions." },
    { Note: "This is an Excel-compatible XML workbook. Open it in Excel and use Save As to convert it to .xlsx if needed." },
  ];
  const xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>` +
    `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">` +
    spreadsheetSheet("Reading Reports", records.length ? records : [{ Note: "No saved reading records match this report filter." }]) +
    spreadsheetSheet("Insight Trends", trends.length ? trends : [{ Month: "No data" }]) +
    spreadsheetSheet("Insight Themes", themeRows.length ? themeRows : [{ Theme: "No keyword matches in saved interpretations", "Matched saved readings": 0 }]) +
    spreadsheetSheet("Report Info", infoRows) +
    `</Workbook>`;
  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `palmistry-tarot-${selectedType}-reports.xml`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportPdf(items, selectedType) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 18;
  const addPageIfNeeded = (height = 12) => {
    if (y + height > pageHeight - 18) { doc.addPage(); y = 18; }
  };
  const write = (value, size = 9, bold = false) => {
    const text = safeText(value).trim();
    if (!text) return;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, pageWidth - 32);
    lines.forEach(line => {
      addPageIfNeeded(5);
      doc.text(line, 16, y);
      y += size * 0.42 + 1.2;
    });
    y += 2;
  };
  doc.setFillColor(250, 245, 237);
  doc.rect(0, 0, pageWidth, 31, "F");
  doc.setTextColor(78, 51, 34); doc.setFont("helvetica", "bold"); doc.setFontSize(18);
  doc.text("Palmistry & Tarot", 16, 13);
  doc.setFontSize(11); doc.text(`${selectedType === "all" ? "Personal Reports" : TYPES.find(t => t.id === selectedType)?.label || "Personal Reports"}`, 16, 23);
  doc.setTextColor(70, 52, 40); y = 41;
  write(`Generated: ${new Date().toLocaleString()}`, 8);
  write(`Saved readings included: ${items.length}`, 8);
  if (selectedType === "trends" || selectedType === "all") {
    write("INSIGHT TRENDS", 12, true);
    makeTrendRows(items).forEach(row => write(`${row.Month}: ${row["Palm readings"]} palm · ${row["Tarot readings"]} tarot · ${row["Total readings"]} total`, 9));
    const themes = new Map();
    items.forEach(item => getThemes(item.result_text).forEach(theme => themes.set(theme, (themes.get(theme) || 0) + 1)));
    write("Themes matched in saved interpretations", 10, true);
    [...themes.entries()].forEach(([theme,count]) => write(`${theme}: appears in ${count} saved reading(s)`, 9));
  }
  const included = selectedType === "palm" ? items.filter(i => reportType(i) === "palm")
    : selectedType === "tarot" ? items.filter(i => reportType(i) === "tarot")
    : selectedType === "personality" ? items.filter(i => getThemes(i.result_text).some(theme => ["Personal growth", "Relationships", "Career & purpose"].includes(theme)))
    : selectedType === "guidance" ? items.filter(i => getThemes(i.result_text).some(theme => ["Spiritual reflection", "Personal growth", "Challenges & choices"].includes(theme)))
    : selectedType === "trends" ? [] : items;
  included.forEach((item, index) => {
    addPageIfNeeded(30);
    write(`${index + 1}. ${item.title || (reportType(item) === "palm" ? "Palmistry Report" : "Tarot Report")}`, 12, true);
    write(`Reading ID: ${item.id} · ${reportType(item) === "palm" ? "Palmistry" : "Tarot"} · ${formatDate(item.created_at)}`, 8);
    const input = parseInput(item);
    if (reportType(item) === "tarot") {
      write(`Question: ${input.question || item.input_summary || "Not recorded"}`, 9);
      write(`Spread: ${input.spread || "Not recorded"}`, 9);
      write(`Cards: ${cardsText(item) || "Not recorded"}`, 9);
    } else {
      write(`Palm observations: ${safeText(item.palm_insights || item.palm_insights_json || "No separate feature observations saved.")}`, 8);
      write(`Detection status: ${item.detection_status || "Not recorded"}`, 8);
    }
    write("Saved interpretation", 10, true);
    write(item.result_text || "No interpretation text was saved.", 9);
    y += 2;
  });
  if (!items.length) write("No saved readings were found for this report. Create a palm or tarot reading first, then refresh reports.", 10);
  write("Reflective and cultural interpretation only. Reports do not provide scientifically validated predictions or medical, legal, or financial advice.", 7);
  doc.save(`palmistry-tarot-${selectedType}-reports.pdf`);
}

export default function Reports() {
  const [readings, setReadings] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState("");

  const loadReadings = async () => {
    setLoading(true); setError("");
    try {
      const response = await api.get("/api/readings/me");
      const rows = Array.isArray(response.data) ? response.data : Array.isArray(response.data?.items) ? response.data.items : [];
      setReadings(rows.slice().sort((a,b) => (dateValue(b.created_at)?.getTime() || 0) - (dateValue(a.created_at)?.getTime() || 0)));
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not load your saved readings. Please check that the reading-history API is available.");
    } finally { setLoading(false); }
  };
  useEffect(() => { loadReadings(); }, []);

  const filtered = useMemo(() => readings.filter(item => {
    const type = reportType(item);
    if (selectedType === "palm" && type !== "palm") return false;
    if (selectedType === "tarot" && type !== "tarot") return false;
    const date = dateValue(item.created_at);
    if (dateFrom && (!date || date < new Date(`${dateFrom}T00:00:00`))) return false;
    if (dateTo && (!date || date > new Date(`${dateTo}T23:59:59.999`))) return false;
    return true;
  }), [readings, selectedType, dateFrom, dateTo]);

  const trendRows = useMemo(() => makeTrendRows(filtered), [filtered]);
  const themeCounts = useMemo(() => {
    const counts = new Map();
    filtered.forEach(item => getThemes(item.result_text).forEach(theme => counts.set(theme, (counts.get(theme) || 0) + 1)));
    return [...counts.entries()].sort((a,b) => b[1]-a[1]);
  }, [filtered]);
  const palmCount = filtered.filter(i => reportType(i) === "palm").length;
  const tarotCount = filtered.length - palmCount;

  const runExport = async (format) => {
    setExporting(format);
    try {
      if (format === "pdf") exportPdf(filtered, selectedType);
      else exportWorkbook(filtered, selectedType);
    } catch (err) {
      setError(`Unable to create ${format.toUpperCase()} export. ${err?.message || "Please try again."}`);
    } finally { setExporting(""); }
  };

  return <div className="reports-page">
    <style>{`
      .reports-page{max-width:1240px;margin:0 auto;padding:26px 22px 46px;color:#493526}
      .reports-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;padding:26px;border:1px solid #e4d4c1;border-radius:22px;background:linear-gradient(135deg,#fbf6ee,#f2e5d4);margin-bottom:20px}
      .reports-eyebrow{font-size:11px;letter-spacing:.15em;font-weight:800;text-transform:uppercase;color:#986c48}
      .reports-hero h1{font-size:clamp(26px,3vw,36px);margin:8px 0;color:#503723}
      .reports-hero p{max-width:700px;line-height:1.65;color:#80634c;margin:0}
      .reports-actions{display:flex;gap:9px;flex-wrap:wrap}
      .reports-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid #d4bda2;border-radius:12px;padding:11px 14px;background:#fffaf3;color:#68472f;font-weight:750;cursor:pointer}
      .reports-btn.primary{background:#765036;color:#fffaf2;border-color:#765036}.reports-btn:disabled{opacity:.55;cursor:wait}
      .reports-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px;margin:18px 0}
      .reports-stat,.reports-panel{background:#fffdf9;border:1px solid #e9ddce;border-radius:17px;padding:17px}
      .reports-stat small{display:block;color:#8b725e;font-size:12px}.reports-stat strong{display:block;font-size:27px;color:#543923;margin-top:8px}
      .reports-controls{display:flex;gap:12px;align-items:end;flex-wrap:wrap}
      .reports-field{display:flex;flex-direction:column;gap:6px;color:#7c5e45;font-size:12px;font-weight:750}
      .reports-field select,.reports-field input{min-height:42px;border:1px solid #dfcdb9;border-radius:10px;background:#fffaf4;padding:8px 11px;color:#4b3525;font:inherit}
      .reports-field select{min-width:220px}
      .reports-panels{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:16px;margin-top:16px}
      .reports-panel h2{font-size:17px;margin:0 0 12px;color:#553b28}
      .reports-table-wrap{overflow:auto}.reports-table{width:100%;border-collapse:collapse;font-size:13px}.reports-table th,.reports-table td{text-align:left;padding:11px 9px;border-bottom:1px solid #eee3d7;white-space:nowrap}.reports-table th{color:#88684d;font-size:11px;text-transform:uppercase;letter-spacing:.06em}
      .reports-theme{display:flex;align-items:center;gap:10px;margin:13px 0}.reports-theme-label{width:145px;font-size:13px;color:#6b4e38}.reports-theme-track{height:8px;border-radius:999px;background:#f0e6da;flex:1;overflow:hidden}.reports-theme-fill{height:100%;border-radius:999px;background:#a47a53}.reports-theme-count{font-size:12px;color:#8a6a4e;min-width:20px;text-align:right}
      .reports-note,.reports-error,.reports-empty{padding:13px 15px;border-radius:12px;background:#f7efe4;color:#7b5a3e;font-size:13px;line-height:1.55;margin-top:13px}.reports-error{background:#fff0ed;color:#9a3f32}
      .reports-record{padding:14px 0;border-bottom:1px solid #eee3d7}.reports-record:last-child{border-bottom:0}.reports-record-title{font-weight:800;color:#523a28}.reports-record-meta{font-size:12px;color:#96795f;margin:5px 0}.reports-record p{font-size:13px;line-height:1.55;color:#725840;margin:6px 0 0}
      @media(max-width:800px){.reports-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.reports-panels{grid-template-columns:1fr}.reports-hero{flex-direction:column}.reports-page{padding:18px 13px 35px}}
    `}</style>
    <section className="reports-hero">
      <div><div className="reports-eyebrow">Milestone 4 · Reporting & analytics</div><h1>Reports & Export</h1><p>Explore your saved palmistry and Tarot sessions, review insight trends, and export reports for your personal archive.</p></div>
      <div className="reports-actions">
        <button className="reports-btn" onClick={loadReadings} disabled={loading}><RefreshCw size={16}/> Refresh</button>
        <button className="reports-btn" onClick={() => runExport("pdf")} disabled={loading || !!exporting}><FileText size={16}/>{exporting === "pdf" ? "Preparing PDF…" : "Export PDF"}</button>
        <button className="reports-btn primary" onClick={() => runExport("xlsx")} disabled={loading || !!exporting}><FileSpreadsheet size={16}/>{exporting === "xlsx" ? "Preparing Excel…" : "Export Excel"}</button>
      </div>
    </section>

    {error && <div className="reports-error" role="alert">{error}</div>}
    <section className="reports-stats">
      <div className="reports-stat"><small><Activity size={14} style={{verticalAlign:"-2px"}}/> Saved reports</small><strong>{filtered.length}</strong></div>
      <div className="reports-stat"><small><Hand size={14} style={{verticalAlign:"-2px"}}/> Palmistry</small><strong>{palmCount}</strong></div>
      <div className="reports-stat"><small><Layers3 size={14} style={{verticalAlign:"-2px"}}/> Tarot</small><strong>{tarotCount}</strong></div>
      <div className="reports-stat"><small><CalendarDays size={14} style={{verticalAlign:"-2px"}}/> Months represented</small><strong>{trendRows.filter(row => row.Month !== "Unknown").length}</strong></div>
    </section>

    <section className="reports-panel">
      <div className="reports-controls">
        <label className="reports-field">Report category
          <select value={selectedType} onChange={e => setSelectedType(e.target.value)}>{TYPES.map(type => <option key={type.id} value={type.id}>{type.label}</option>)}</select>
        </label>
        <label className="reports-field">From date<input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></label>
        <label className="reports-field">To date<input type="date" value={dateTo} min={dateFrom || undefined} onChange={e => setDateTo(e.target.value)} /></label>
        {(dateFrom || dateTo) && <button className="reports-btn" onClick={() => {setDateFrom("");setDateTo("");}}>Clear dates</button>}
      </div>
      <div className="reports-note">PDF and Excel exports use the saved reading records in the selected date range. Personality and guidance sections are derived only from the text available in those saved interpretations; they are reflective summaries, not clinical assessments or guaranteed predictions.</div>
    </section>

    <div className="reports-panels">
      <section className="reports-panel">
        <h2><TrendingUp size={18} style={{verticalAlign:"-4px",marginRight:7}}/>Insight trend report</h2>
        {loading ? <div className="reports-empty">Loading saved reading history…</div> : trendRows.length ? <div className="reports-table-wrap"><table className="reports-table"><thead><tr><th>Month</th><th>Palm</th><th>Tarot</th><th>Total</th></tr></thead><tbody>{trendRows.map(row => <tr key={row.Month}><td>{row.Month}</td><td>{row["Palm readings"]}</td><td>{row["Tarot readings"]}</td><td><strong>{row["Total readings"]}</strong></td></tr>)}</tbody></table></div> : <div className="reports-empty">No saved reading activity matches these filters yet.</div>}
        <div className="reports-note">Trends reflect saved reading dates and counts. They do not imply future outcomes.</div>
      </section>
      <section className="reports-panel">
        <h2><Sparkles size={18} style={{verticalAlign:"-4px",marginRight:7}}/>Insight themes in saved text</h2>
        {themeCounts.length ? themeCounts.map(([theme,count]) => <div className="reports-theme" key={theme}><span className="reports-theme-label">{theme}</span><span className="reports-theme-track"><span className="reports-theme-fill" style={{display:"block",width:`${Math.max(5,count/Math.max(...themeCounts.map(x=>x[1]))*100)}%`}}/></span><span className="reports-theme-count">{count}</span></div>) : <div className="reports-empty">No matching theme keywords were found in the saved interpretations for this range.</div>}
        <div className="reports-note">Theme counts are keyword matches, not validated personality traits or AI-generated scores.</div>
      </section>
    </div>

    <section className="reports-panel" style={{marginTop:16}}>
      <h2><FileText size={18} style={{verticalAlign:"-4px",marginRight:7}}/>Report records</h2>
      {loading ? <div className="reports-empty">Loading reports…</div> : !filtered.length ? <div className="reports-empty">No saved readings match this report type or date range. Complete a palm or Tarot reading, then select Refresh.</div> : filtered.slice(0,30).map(item => <article className="reports-record" key={item.id}>
        <div className="reports-record-title">{item.title || (reportType(item) === "palm" ? "Palmistry Report" : "Tarot Report")}</div>
        <div className="reports-record-meta">#{item.id} · {reportType(item) === "palm" ? "Palmistry" : "Tarot"} · {formatDate(item.created_at)}{reportType(item) === "tarot" && cardsText(item) ? ` · ${cardsText(item)}` : ""}</div>
        <p>{String(item.result_text || "No saved interpretation text.").replace(/[#*_`]/g,"").slice(0,260)}{String(item.result_text || "").length > 260 ? "…" : ""}</p>
      </article>)}
      {filtered.length > 30 && <div className="reports-note">Showing the latest 30 report records here. All {filtered.length} matching records are included in exports.</div>}
    </section>
  </div>;
}
