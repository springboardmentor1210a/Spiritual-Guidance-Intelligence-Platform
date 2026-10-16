import { BookOpen, Fingerprint, History as HistoryIcon, Trash2 } from "lucide-react";
import { useState } from "react";

function load() {
  try { return JSON.parse(localStorage.getItem("reading_history") || "[]"); } catch { return []; }
}

export default function History() {
  const [items, setItems] = useState(load);

  function clear() {
    if (!confirm("Clear all locally saved reading history?")) return;
    localStorage.removeItem("reading_history");
    setItems([]);
  }

  return (
    <div className="page-container narrow">
      <div className="page-title"><div className="page-title-icon"><HistoryIcon /></div><div><span className="section-kicker">YOUR JOURNEY</span><h1>Reading history</h1><p>Completed demonstration readings saved in this browser.</p></div></div>
      <section className="panel">
        <div className="panel-heading"><div><span className="section-kicker">ARCHIVE</span><h2>{items.length} reading{items.length === 1 ? "" : "s"}</h2></div>{items.length > 0 && <button className="button danger small" onClick={clear}><Trash2 size={15} /> Clear</button>}</div>
        {items.length === 0 ? <div className="empty-state large"><HistoryIcon size={35} /><h3>Your archive is empty</h3><p>Complete a palm or tarot reading and it will appear here.</p></div> : items.map(item => <div className="history-card" key={item.id}><div className={`history-symbol large ${item.type}`}>{item.type === "tarot" ? <BookOpen size={21} /> : <Fingerprint size={21} />}</div><div><strong>{item.title}</strong><p>{item.summary || item.cards?.join(" · ") || "Completed reading"}</p><span>{new Date(item.createdAt).toLocaleString()}</span></div><span className="history-type">{item.type}</span></div>)}
      </section>
    </div>
  );
}