import { useEffect, useMemo, useRef, useState } from "react";

import {

  Shuffle,

  Sparkles

} from "lucide-react";



import api from "../api/client";

import { tarotDeck } from "../data/tarotDeck";

import { PageHeading } from "./FeatureShared";




const TAROT_LAYOUT_CSS = `



.tarot-pro-root{width:100%;}



.tarot-pro-root .tarot-controls,.tarot-pro-root .deck-library{position:relative;z-index:1;}



.tarot-pro-root .tarot-shuffle-toolbar{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin:18px 0 14px;padding:12px 14px;background:#f8f0e4;border:1px solid #ead9c2;border-radius:12px;}



.tarot-pro-root .tarot-shuffle-actions{display:flex;align-items:center;gap:10px;}



.tarot-pro-root .secondary-button{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;border:1px solid #b99773!important;border-radius:9px!important;padding:9px 13px!important;background:#eadbc6!important;color:#5c402b!important;font-size:12px!important;font-weight:700!important;cursor:pointer!important;}



.tarot-pro-root .secondary-button:hover{background:#dfc8aa!important;}



.tarot-pro-root .secondary-button:disabled,.tarot-pro-root .text-button:disabled{opacity:.45;cursor:not-allowed;}



.tarot-pro-root .deck-filters{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:16px 0;}



.tarot-pro-root .filter-tabs{display:flex;gap:8px;flex-wrap:wrap;}



.tarot-pro-root .filter-tabs button{border:1px solid #dfcbb2;border-radius:999px;background:#fffdf8;color:#79543a;padding:8px 13px;font-size:11px;font-weight:700;cursor:pointer;}



.tarot-pro-root .filter-tabs button.filter-active{background:#79543a;color:#fff;border-color:#79543a;}



.tarot-pro-root .deck-grid{display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:14px!important;align-items:start!important;width:100%!important;}



.tarot-pro-root .deck-card{box-sizing:border-box!important;width:100%!important;min-width:0!important;min-height:178px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;gap:7px!important;padding:10px 7px!important;border:1px solid #e0ccb4!important;border-radius:12px!important;background:#fffaf1!important;color:#4b3024!important;cursor:pointer!important;box-shadow:0 5px 16px rgba(75,48,36,.07)!important;transition:transform .18s,box-shadow .18s,border-color .18s,background .18s!important;}



.tarot-pro-root .deck-card:hover{transform:translateY(-3px)!important;background:#f8efdf!important;box-shadow:0 10px 22px rgba(75,48,36,.12)!important;}



.tarot-pro-root .deck-card.deck-card-selected{border:2px solid #79543a!important;background:#efe0ca!important;box-shadow:0 8px 22px rgba(75,48,36,.14)!important;}



.tarot-pro-root .tarot-back{box-sizing:border-box!important;position:relative!important;inset:auto!important;display:flex!important;align-items:center!important;justify-content:center!important;width:82px!important;min-width:82px!important;max-width:82px!important;height:132px!important;aspect-ratio:auto!important;overflow:hidden!important;border:4px solid #765039!important;border-radius:8px!important;background:repeating-linear-gradient(45deg,#dfc5a1 0,#dfc5a1 5px,#ead9bd 5px,#ead9bd 10px)!important;box-shadow:0 4px 10px rgba(75,48,36,.18)!important;}



.tarot-pro-root .tarot-back::before{content:""!important;position:absolute!important;inset:5px!important;border:1px solid #936d4c!important;border-radius:4px!important;}



.tarot-pro-root .tarot-back::after{content:"✦"!important;display:flex!important;align-items:center!important;justify-content:center!important;width:50%!important;height:auto!important;aspect-ratio:1!important;border:2px solid #896342!important;border-radius:50%!important;color:#765039!important;font-family:Georgia,serif!important;font-size:24px!important;background:#ead8bd!important;box-shadow:0 0 0 5px #ead8bd,0 0 0 6px #896342!important;z-index:1!important;}



.tarot-pro-root .deck-card .back-caption{font-family:'Playfair Display',Georgia,serif!important;font-size:11px!important;font-weight:700!important;line-height:1.2!important;color:#79583e!important;}



.tarot-pro-root .deck-card .tiny-note{font-size:9px!important;line-height:1.2!important;text-align:center!important;}



.tarot-pro-root .selected-back-grid{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(150px,1fr))!important;gap:14px!important;margin-top:16px!important;}



.tarot-pro-root .selected-back-card{box-sizing:border-box!important;position:relative!important;display:flex!important;flex-direction:column!important;align-items:center!important;gap:8px!important;padding:14px 10px!important;border:1px solid #eadbc6!important;border-radius:12px!important;background:#fffaf1!important;min-height:235px!important;}



.tarot-pro-root .selected-back-card .tarot-back{width:78px!important;min-width:78px!important;max-width:78px!important;height:126px!important;}



.tarot-pro-root .selected-back-card strong{font-size:12px!important;color:#79583e!important;}



.tarot-pro-root .revealed-grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:16px!important;margin-top:16px!important;align-items:start!important;}



.tarot-pro-root .revealed-grid.count-1{grid-template-columns:minmax(170px,230px)!important;justify-content:center!important;}



.tarot-pro-root .revealed-grid.count-5,.tarot-pro-root .revealed-grid.count-10{grid-template-columns:repeat(5,minmax(0,1fr))!important;}



.tarot-pro-root .revealed-card{box-sizing:border-box!important;padding:12px!important;background:#fffaf1!important;border:1px solid #eadbc6!important;border-radius:12px!important;text-align:center!important;min-width:0!important;}



.tarot-pro-root .selected-tarot-image{display:block!important;width:100%!important;max-width:150px!important;max-height:250px!important;height:auto!important;aspect-ratio:3/5!important;object-fit:contain!important;margin:7px auto 12px!important;border-radius:7px!important;box-shadow:0 6px 18px rgba(75,48,36,.15)!important;}



.tarot-pro-root .revealed-card .card-position{min-height:0!important;margin:0 0 8px!important;font-size:11px!important;font-weight:800!important;color:#8a6748!important;}



.tarot-pro-root .revealed-card .card-reading{margin-top:8px!important;padding:11px!important;background:#f9f0e3!important;border-radius:10px!important;text-align:left!important;}
.tarot-pro-root .card-insight-lines{display:grid;gap:5px;margin-top:8px;}
.tarot-pro-root .card-insight-line{font-size:11px;line-height:1.55;color:#634832;}
.tarot-pro-root .card-insight-line strong{color:#5c402b;font-weight:800;}



.tarot-pro-root .revealed-card .card-reading p{font-size:11px!important;line-height:1.6!important;color:#634832!important;}



.tarot-pro-root .revealed-card select{width:100%!important;max-width:150px!important;margin:5px auto 8px!important;}



.tarot-pro-root .spread-summary{margin-top:18px!important;padding:16px!important;border-radius:11px!important;background:#f8f0e4!important;border:1px solid #ead9c2!important;}



.tarot-pro-root .spread-summary p{line-height:1.7!important;}



.tarot-pro-root .tarot-submit{margin-top:16px!important;max-width:330px!important;}



.tarot-pro-root .tarot-art-credit{margin-top:8px!important;}



.tarot-pro-root .deck-grid.is-shuffling .deck-card{pointer-events:none!important;animation:tarotShuffle .65s ease-in-out infinite alternate!important;}



.tarot-pro-root .deck-grid.is-shuffling .deck-card:nth-child(3n){animation-delay:.08s!important;}



.tarot-pro-root .deck-grid.is-shuffling .deck-card:nth-child(3n+1){animation-delay:.16s!important;}



.tarot-pro-root .deck-grid.is-shuffling .deck-card:nth-child(3n+2){animation-delay:.24s!important;}



@keyframes tarotShuffle{0%{transform:translate(-5px,3px) rotate(-5deg)}50%{transform:translate(5px,-5px) rotate(5deg)}100%{transform:translate(0,2px) rotate(-2deg)}}



@media(max-width:950px){.tarot-pro-root .deck-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important}.tarot-pro-root .revealed-grid.count-5,.tarot-pro-root .revealed-grid.count-10{grid-template-columns:repeat(3,minmax(0,1fr))!important}}



@media(max-width:650px){.tarot-pro-root .deck-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:9px!important}.tarot-pro-root .deck-card{min-height:160px!important}.tarot-pro-root .tarot-back{width:68px!important;min-width:68px!important;max-width:68px!important;height:110px!important}.tarot-pro-root .revealed-grid,.tarot-pro-root .revealed-grid.count-5,.tarot-pro-root .revealed-grid.count-10{grid-template-columns:repeat(2,minmax(0,1fr))!important}.tarot-pro-root .selected-back-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}



.tarot-pro-root .result-card{margin-top:20px;padding:24px;background:linear-gradient(145deg,#fffdf8,#f8efe2);border:1px solid #dfc5a5;border-radius:18px;box-shadow:0 12px 32px rgba(75,48,36,.07);}
.tarot-pro-root .result-title{display:flex;align-items:center;gap:12px;margin-bottom:10px;color:#68452f;}
.tarot-pro-root .result-title h2{margin:0;font-family:'Playfair Display',Georgia,serif;font-size:25px;line-height:1.25;color:#4b3024;}
.tarot-pro-root .result-card>.muted{font-size:13px;line-height:1.6;color:#9a704d;margin:0 0 20px;}
.tarot-pro-root .result-text{color:#523a2b;font-size:15px;line-height:1.85;overflow-wrap:anywhere;}
.tarot-pro-root .professional-insight-content>h3{font-family:'Playfair Display',Georgia,serif;font-size:21px;line-height:1.35;color:#4b3024;margin:25px 0 10px;padding-bottom:8px;border-bottom:1px solid #ead8c2;}
.tarot-pro-root .professional-insight-content>h3:first-child{margin-top:0;}
.tarot-pro-root .professional-insight-content>h4{font-size:15px;line-height:1.5;color:#68452f;margin:18px 0 7px;font-weight:800;}
.tarot-pro-root .professional-insight-content p{margin:8px 0 13px;line-height:1.85;color:#5e4737;}
.tarot-pro-root .professional-insight-content strong{font-weight:750;color:#493022;}
.tarot-pro-root .professional-insight-content ul,.tarot-pro-root .professional-insight-content ol{padding-left:24px;margin:8px 0 17px;}
.tarot-pro-root .professional-insight-content li{padding-left:4px;margin:7px 0;line-height:1.75;color:#5e4737;}
.tarot-pro-root .professional-insight-content li::marker{color:#a77b53;font-weight:700;}
.tarot-pro-root .result-card .tiny-note{margin-top:18px;padding-top:12px;border-top:1px solid #ead8c2;line-height:1.6;}
@media(max-width:650px){.tarot-pro-root .result-card{padding:17px}.tarot-pro-root .result-title h2{font-size:22px}.tarot-pro-root .result-text{font-size:14px}.tarot-pro-root .professional-insight-content>h3{font-size:19px}}

`;



































/* -------------------------------------------------------















   TAROT SPREADS















\\\\------------------------------------------------------- */
































function formatInline(text) {
  const normalized = String(text || "")
    .replace(/\\\*\*/g, "**")
    .replace(/\\\*/g, "*")
    .replace(/\\_/g, "_");
  return normalized.split(/(\*\*.*?\*\*|\*.*?\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return <span key={index}>{part}</span>;
  });
}

function getCardInsightLines(card) {
  const name = String(card?.name || "This card").trim();
  const rawMeaning = String(card?.meaning || "").replace(/\s+/g, " ").trim();
  const cleanedMeaning = rawMeaning
    .replace(/^(upright|reversed)\s*[:—-]?\s*/i, "")
    .replace(/\btraditionally relates to\b/ig, "is associated with")
    .replace(/\bReflect on how this theme connects with your present situation and choices\.?/ig, "")
    .replace(/\bReflect on how this theme connects to your present situation and choices\.?/ig, "")
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/, "")
    .trim();

  const coreMeaning = cleanedMeaning || `${name} invites you to reflect on the choices, patterns, and possibilities present in your situation`;

  return [{ label: "Core meaning", text: `${coreMeaning.charAt(0).toUpperCase()}${coreMeaning.slice(1)}.` }];
}

function makeInsightConcise(source) {
  const lines = String(source || "").replace(/\r\n/g, "\n").split("\n");
  const sections = [];
  let current = { title: "", lines: [] };
  for (const raw of lines) {
    const line = raw.trim();
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      if (current.title || current.lines.length) sections.push(current);
      current = { title: heading[1].replace(/\*\*/g, ""), lines: [] };
    } else {
      current.lines.push(raw);
    }
  }
  if (current.title || current.lines.length) sections.push(current);

  const get = (name) => sections.find((section) => section.title.toLowerCase() === name.toLowerCase());
  const output = [];
  const overall = get("Overall Reading");
  if (overall) output.push(`### Overall Reading\n${overall.lines.join(" ").replace(/\s+/g, " ").trim()}`);

  const cards = get("Card-by-Card Interpretation");
  if (cards) {
    const cardLines = cards.lines;
    const positions = [];
    let active = null;
    for (const raw of cardLines) {
      const line = raw.trim();
      const heading = line.match(/^#{1,4}\s+(.+)$/);
      if (heading) {
        if (active) positions.push(active);
        active = { title: heading[1].replace(/\*\*/g, ""), lines: [] };
      } else if (active) {
        // Keep the card identity and interpretation, but omit repetitive textbook symbolism.
        if (/^[-*]\s*\*\*Traditional Symbolism/i.test(line)) continue;
        if (/^[-*]\s*\*\*Position & Orientation/i.test(line)) {
          active.lines.push(line.replace(/^[-*]\s*/, "").replace(/\*\*/g, ""));
        } else if (/^[-*]\s*\*\*Card:/i.test(line)) {
          active.lines.push(line.replace(/^[-*]\s*/, "").replace(/\*\*/g, ""));
        } else if (!/^[-*]\s*\*\*Traditional Symbolism/i.test(line) && line && !/^[-*]\s*\*\*/.test(line)) {
          active.lines.push(line);
        }
      }
    }
    if (active) positions.push(active);
    const compactPositions = positions.map((position) => {
      const body = position.lines.join(" ").replace(/\s+/g, " ").trim();
      const words = body.split(/\s+/);
      const shortened = words.length > 70 ? `${words.slice(0, 70).join(" ")}…` : body;
      return `#### ${position.title}\n${shortened}`;
    }).filter((item) => !item.endsWith("\n"));
    if (compactPositions.length) output.push(`### Card-by-Card Interpretation\n${compactPositions.join("\n\n")}`);
  }

  const themes = sections.find((section) => /themes$/i.test(section.title) && !/career/i.test(section.title));
  if (themes) {
    const bullets = themes.lines.filter((line) => /^\s*[-*•]\s+/.test(line)).slice(0, 3);
    if (bullets.length) output.push(`### Key Themes\n${bullets.join("\n")}`);
  }
  const steps = get("Practical Next Steps");
  if (steps) {
    const bullets = steps.lines.filter((line) => /^\s*\d+[.)]\s+/.test(line)).slice(0, 3);
    if (bullets.length) output.push(`### Practical Next Steps\n${bullets.join("\n")}`);
  }
  if (!output.length) {
    return String(source || "").split(/\n\s*\n/).filter(Boolean).slice(0, 7).join("\n\n");
  }
  return output.join("\n\n");
}

function ProfessionalInsight({ text }) {
  text = makeInsightConcise(text);
  const normalized = String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\\\*\*/g, "**")
    .replace(/\\\*/g, "*")
    .replace(/\\#/g, "#");
  const lines = normalized.split("\n");
  const blocks = [];
  let paragraph = [];
  let list = [];
  let listType = "";

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push({ type: listType, items: list });
      list = [];
      listType = "";
    }
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line || /^[-*_]{3,}$/.test(line)) {
      flushParagraph();
      flushList();
      return;
    }
    const heading = line.match(/^#{1,4}\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", text: heading[1].replace(/\*\*/g, "") });
      return;
    }
    const bullet = line.match(/^(?:[-*•])\s+(.+)$/);
    const numbered = line.match(/^\d+[.)]\s+(.+)$/);
    if (bullet || numbered) {
      flushParagraph();
      const nextType = numbered ? "ordered" : "unordered";
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      list.push((bullet || numbered)[1]);
      return;
    }
    flushList();
    const inlineHeading = line.match(/^\*\*(.+?)\*\*\s*(.*)$/);
    if (inlineHeading && (!inlineHeading[2] || inlineHeading[1].length < 70)) {
      flushParagraph();
      blocks.push({ type: "subheading", text: inlineHeading[1] });
      if (inlineHeading[2]) paragraph.push(inlineHeading[2]);
      return;
    }
    paragraph.push(line.replace(/^\s*---+\s*$/, ""));
  });
  flushParagraph();
  flushList();

  return (
    <div className="professional-insight-content">
      {blocks.map((block, index) => {
        if (block.type === "heading") return <h3 key={index}>{block.text}</h3>;
        if (block.type === "subheading") return <h4 key={index}>{block.text}</h4>;
        if (block.type === "ordered") return <ol key={index}>{block.items.map((item, i) => <li key={i}>{formatInline(item)}</li>)}</ol>;
        if (block.type === "unordered") return <ul key={index}>{block.items.map((item, i) => <li key={i}>{formatInline(item)}</li>)}</ul>;
        return <p key={index}>{formatInline(block.text.replace(/\*\*/g, ""))}</p>;
      })}
    </div>
  );
}

const spreads = [
  {
    id: "single",
    name: "Single Card Reading",
    count: 1,
    positions: ["Your focus"]
  },
  {
    id: "three",
    name: "Three Card Reading",
    count: 3,
    positions: ["Past", "Present", "Possible direction"]
  },
  {
    id: "relationship",
    name: "Relationship Spread",
    count: 6,
    positions: [
      "Your perspective",
      "Their perspective",
      "What connects you",
      "Current challenge",
      "What needs understanding",
      "Possible next step"
    ]
  },
  {
    id: "career",
    name: "Career Spread",
    count: 5,
    positions: [
      "Current position",
      "Your strength",
      "The challenge",
      "An opportunity",
      "Recommended direction"
    ]
  },
  {
    id: "celtic",
    name: "Celtic Cross Spread",
    count: 10,
    positions: [
      "Present",
      "Challenge",
      "Foundation",
      "Recent past",
      "Possible direction",
      "Near future",
      "Your approach",
      "External influences",
      "Hopes and concerns",
      "Reflection"
    ]
  },
  {
    id: "life-path",
    name: "Life Path Spread",
    count: 7,
    positions: [
      "Where you are now",
      "Your foundation",
      "A lesson to learn",
      "A strength to use",
      "An obstacle to consider",
      "A path to explore",
      "Your next step"
    ]
  }
];































/* -------------------------------------------------------















   TAROT READING















\\\\------------------------------------------------------- */































export function TarotReading() {



  const [spread, setSpread] = useState("three");



  const [question, setQuestion] = useState("General reflection");



  const [selected, setSelected] = useState([]);



  const [revealed, setRevealed] = useState(false);



  const [busy, setBusy] = useState(false);



  const [error, setError] = useState("");



  const [result, setResult] = useState(null);



  const [filter, setFilter] = useState("All cards");



  const [orientations, setOrientations] = useState({});



  const [deckOrder, setDeckOrder] = useState(tarotDeck);



  const [shuffleCount, setShuffleCount] = useState(0);



  const [isShuffling, setIsShuffling] = useState(false);



  const shuffleTimerRef = useRef(null);







  const activeSpread = spreads.find((item) => item.id === spread) || spreads[1];



  const visible = useMemo(() => deckOrder.filter((card) => filter === "All cards" || card.arcana === filter), [deckOrder, filter]);



  const selectedCards = selected.map((id, index) => {



    const card = tarotDeck.find((item) => String(item.id) === String(id));



    return card ? { ...card, position: activeSpread.positions[index], reversed: orientations[id] === "reversed" } : null;



  }).filter(Boolean);







  useEffect(() => () => { if (shuffleTimerRef.current) clearTimeout(shuffleTimerRef.current); }, []);







  function toggleCard(card) {



    if (isShuffling || revealed || busy) return;



    const id = String(card.id);



    setError("");



    setResult(null);



    if (selected.includes(id)) {



      setSelected((current) => current.filter((item) => item !== id));



      return;



    }



    if (selected.length >= activeSpread.count) {



      setError(`You can select only ${activeSpread.count} card${activeSpread.count === 1 ? "" : "s"} for this spread. Remove a card first if you want to change your selection.`);



      return;



    }



    setSelected((current) => [...current, id]);



  }







  function clearSelection() {



    setSelected([]);



    setRevealed(false);



    setResult(null);



    setOrientations({});



    setError("");



  }







  function shuffleDeck() {



    if (isShuffling || busy) return;



    setIsShuffling(true);



    setRevealed(false);



    setResult(null);



    setError("");



    shuffleTimerRef.current = setTimeout(() => {



      const next = [...deckOrder];



      for (let i = next.length - 1; i > 0; i -= 1) {



        const j = Math.floor(Math.random() * (i + 1));



        [next[i], next[j]] = [next[j], next[i]];



      }



      setDeckOrder(next);



      setShuffleCount((count) => count + 1);



      setIsShuffling(false);



    }, 700);



  }







  function resetDeckOrder() {



    if (busy) return;



    setDeckOrder(tarotDeck);



    setShuffleCount(0);



    setRevealed(false);



    setResult(null);



  }







  async function analyseTarot() {



    if (selectedCards.length !== activeSpread.count) {



      setError(`Please select exactly ${activeSpread.count} card${activeSpread.count === 1 ? "" : "s"} from the deck first.`);



      return;



    }



    setBusy(true);



    setError("");



    setResult(null);



    try {



      const response = await api.post("/api/readings/tarot", {



        cards: selectedCards.map((card) => card.name),



        question,



        spread: activeSpread.name,



        orientations: selectedCards.map((card) => card.reversed ? "reversed" : "upright")



      });



      setResult(response.data);



      setRevealed(true);



    } catch (err) {



      setError(err.response?.data?.detail || "Unable to generate the AI tarot interpretation. Check that the backend is running.");



    } finally {



      setBusy(false);



    }



  }







  return (



    <div className="page-container feature-page tarot-reading-page tarot-pro-root">



      <style>{TAROT_LAYOUT_CSS}</style>



      <PageHeading eyebrow="THE 78-CARD TAROT LIBRARY" title="Tarot reading" subtitle="Shuffle the deck, personally select your cards and reveal your reading only when you are ready." />







      <section className="feature-panel tarot-controls">



        <label className="field-label" htmlFor="tarot-question">What would you like to reflect on?</label>



        <input id="tarot-question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={500} placeholder="A question, intention or general reflection" disabled={busy} />



        <div className="section-heading compact"><div><h2>Choose your spread</h2><p className="muted">Select how many cards you want to choose yourself.</p></div></div>



        <div className="spread-grid">



          {spreads.map((item) => (



            <button type="button" key={item.id} className={`spread-option ${spread === item.id ? "spread-selected" : ""}`} onClick={() => { setSpread(item.id); clearSelection(); }} disabled={busy}>



              <span className="spread-count">{item.count} {item.count === 1 ? "CARD" : "CARDS"}</span>



              <strong>{item.name}</strong>



              <small>{item.positions.join(" · ")}</small>



            </button>



          ))}



        </div>



        <div className="model-status"><Sparkles size={18} /><span><strong>Your choice controls the reading</strong><br />Select {activeSpread.count} different face-down cards below. The system will not automatically choose cards for you.</span></div>



      </section>







      <section className="feature-panel deck-library">



        <div className="section-heading compact">



          <div><p className="eyebrow">PICK YOUR OWN CARDS</p><h2>All 78 tarot cards</h2><p className="muted">Shuffle the deck and choose your cards. All cards stay face-down until you analyse your selection.</p></div>



          <span className="deck-total">{selected.length} / {activeSpread.count} SELECTED</span>



        </div>







        <div className="tarot-shuffle-toolbar">



          <div className="tarot-shuffle-actions">



            <button type="button" className="secondary-button" onClick={shuffleDeck} disabled={isShuffling || busy}><Shuffle size={16} />{isShuffling ? "Shuffling..." : "Shuffle deck"}</button>



            <button type="button" className="text-button" onClick={resetDeckOrder} disabled={shuffleCount === 0 || isShuffling || busy}>Reset order</button>



          </div>



          <span className="tiny-note">{isShuffling ? "The cards are being shuffled..." : shuffleCount ? `Deck shuffled ${shuffleCount} time${shuffleCount === 1 ? "" : "s"}` : "Deck in original order"}</span>



        </div>







        <div className="deck-filters">



          <div className="filter-tabs">



            {["All cards", "Major Arcana", "Minor Arcana"].map((item) => (



              <button type="button" key={item} className={filter === item ? "filter-active" : ""} onClick={() => setFilter(item)} disabled={isShuffling || busy}>{item}</button>



            ))}



          </div>



        </div>







        <div className={`deck-grid ${isShuffling ? "is-shuffling" : ""}`}>



          {visible.map((card, index) => {



            const chosen = selected.includes(String(card.id));



            const order = selected.indexOf(String(card.id));



            return (



              <button type="button" className={`deck-card ${chosen ? "deck-card-selected" : ""}`} key={card.id} onClick={() => toggleCard(card)} aria-pressed={chosen} aria-label={`Face-down card ${index + 1}`} disabled={isShuffling || revealed || busy}>



                <span className="tarot-back" aria-hidden="true" />



                <span className="back-caption">{chosen ? `Selected · ${order + 1}` : "Face-down card"}</span>



                <span className="tiny-note">{chosen ? "Tap to remove" : "Tap to select"}</span>



              </button>



            );



          })}



        </div>







        <div className="section-heading compact">



          <div><h3>Your selected cards</h3><p className="muted">Your selection order determines the spread positions. Card identities remain hidden until AI analysis.</p></div>



          <button type="button" className="text-button" onClick={clearSelection} disabled={!selected.length || isShuffling || busy}>Clear selection</button>



        </div>







        {selectedCards.length > 0 ? (



          <div className={revealed ? `revealed-grid count-${selectedCards.length}` : "selected-back-grid"}>



            {selectedCards.map((card, index) => (



              <article className={revealed ? "revealed-card" : "selected-back-card"} key={card.id}>



                <p className="card-position">{index + 1}. {card.position}</p>



                {!revealed ? (



                  <>



                    <div className="tarot-back" aria-label="Selected card face down" />



                    <strong>Selected card {index + 1}</strong>



                    <label className="field-label" htmlFor={`orientation-${card.id}`}>Card orientation</label>



                    <select id={`orientation-${card.id}`} value={orientations[card.id] || "upright"} onChange={(event) => setOrientations((old) => ({ ...old, [card.id]: event.target.value }))} disabled={busy}>



                      <option value="upright">Upright</option><option value="reversed">Reversed</option>



                    </select>



                    <button type="button" className="text-button" onClick={() => toggleCard(card)} disabled={busy}>Remove card</button>



                  </>



                ) : (



                  <>



                    <img src={card.image} alt={`${card.name} tarot card`} className="selected-tarot-image" />



                    <div className="card-reading">
                      <strong>{card.name}{card.reversed ? " · Reversed" : " · Upright"}</strong>
                      <div className="card-insight-lines">
                        {getCardInsightLines(card).map((line) => (
                          <div className="card-insight-line" key={line.label}>
                            <strong>{line.label}: </strong>{line.text}
                          </div>
                        ))}
                      </div>
                    </div>



                  </>



                )}



              </article>



            ))}



          </div>



        ) : <p className="muted">No cards selected yet. Choose from the 78 face-down cards above.</p>}







        {error && <div className="alert">{error}</div>}







        {!revealed && <button type="button" className="primary-button tarot-submit" onClick={analyseTarot} disabled={selected.length !== activeSpread.count || isShuffling || busy}><Sparkles size={17} />{busy ? "Generating AI insights..." : "Analyse with AI"}</button>}







        {revealed && (



          <>



            <div className="spread-summary"><h3>Your combined reflection</h3><p>{selectedCards.map((card) => `${card.position}: ${card.name}${card.reversed ? " (reversed)" : ""}`).join(" • ")}. Consider how these themes connect to your question: “{question}”. This is a reflective interpretation, not a fixed prediction.</p></div>



            {result && <section className="result-card"><div className="result-title"><Sparkles size={20} /><h2>AI tarot insights</h2></div><p className="muted">{result.title}</p><div className="result-text"><ProfessionalInsight text={result.result_text} /></div><p className="tiny-note">Saved on {new Date(result.created_at).toLocaleString()} · AI interpretation generated from your selected cards, spread, question and orientations.</p></section>}






          </>



        )}



      </section>







      <p className="tiny-note">Your reading uses only the cards you selected. Tarot meanings are traditional symbolic interpretations for reflection and entertainment, not guaranteed predictions or professional advice.</p>



      <p className="tiny-note tarot-art-credit">Card artwork: traditional Rider–Waite–Smith deck, illustrated by Pamela Colman Smith. Images are loaded from your local public/tarot-real folder.</p>



    </div>



  );



}