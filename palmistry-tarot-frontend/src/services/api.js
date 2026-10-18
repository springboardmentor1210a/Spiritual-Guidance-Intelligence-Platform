import { FALLBACK_TAROT_DECK, TAROT_SPREADS } from "../data/tarotDataset";
import { auth, db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const recentTarotSaves = new Map();
const recentPalmSaves = new Map();

function asArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

function interpretationParagraphs(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeLine(line = {}) {
  const id = line.id || String(line.name || "line").toLowerCase().replace(/\s+/g, "-");
  return {
    id,
    name: line.name || "Palm Line",
    color: line.color,
    path: line.path,
    coordinates: line.coordinates || line.points || [],
    confidence: Number(line.confidence ?? line.score ?? 0),
    detected: line.detected !== false && line.status !== "not_detected" && Number(line.confidence ?? line.score ?? 0) > 0,
    status: line.status || (Number(line.confidence ?? line.score ?? 0) > 0 ? "detected" : "not_detected"),
    meaning: line.meaning || line.description || "",
    attributes: {
      length: line.attributes?.length ?? line.length,
      curvature: line.attributes?.curvature ?? line.curvature,
      depth: line.attributes?.depth ?? line.depth,
      orientation: line.attributes?.orientation ?? line.orientation,
      ...line.attributes,
    },
  };
}

function composeFromLines(lines) {
  const byId = Object.fromEntries(lines.map((l) => [l.id, l]));
  const heart = byId.heart;
  const head = byId.head;
  const life = byId.life;
  const fate = byId.fate;
  const sun = byId.sun;
  const shape = byId.shape;
  const fingers = byId.fingers;

  const detectedLines = lines.filter((line) => line.detected);
  const avg =
    detectedLines.reduce((sum, l) => sum + (l.confidence || 0), 0) / Math.max(detectedLines.length, 1);
  const dominant = [...detectedLines].sort((a, b) => b.confidence - a.confidence)[0];

  const paragraphs = [];
  paragraphs.push(
    `Line extraction on this image found ${detectedLines.length} primary creases, with average detection confidence of ${Math.round(avg)}%. ${dominant
      ? `The ${dominant.name} registered most clearly (${dominant.confidence}%), so that theme is weighted more strongly in this reading.`
      : "Overall crease contrast was moderate."
    }`
  );

  if (heart?.detected) {
    const curve = heart.attributes?.curvature ?? 0;
    paragraphs.push(
      `Heart Line (${heart.confidence}% confidence, curvature ${curve}%): ${curve >= 12
        ? "a more arched path often associated with open emotional expression and a strong need for connection."
        : "a steadier path often associated with measured feelings and loyalty that builds over time."
      } ${heart.meaning}`
    );
  }

  if (head?.detected) {
    const curve = head.attributes?.curvature ?? 0;
    paragraphs.push(
      `Head Line (${head.confidence}% confidence, curvature ${curve}%): ${curve < 10
        ? "a relatively direct trace, suggesting a practical, sequential thinking style."
        : "a more undulating trace, suggesting imaginative or lateral problem-solving."
      } ${head.meaning}`
    );
  }

  if (life?.detected) {
    const length = life.attributes?.length ?? 0;
    paragraphs.push(
      `Life Line (${life.confidence}% confidence, relative length ${length}): ${length >= 55
        ? "a longer arc around the thumb mound, commonly read as endurance and recovery capacity."
        : "a more compact arc, commonly read as focused energy and a preference for sustainable pacing."
      } ${life.meaning}`
    );
  }

  if (fate?.detected) {
    paragraphs.push(
      `Fate Line (${fate.confidence}% confidence): ${fate.confidence >= 75
        ? "a distinct vertical crease, often linked to a clearer sense of direction or vocation."
        : "a lighter vertical crease, often linked to a path that is still taking shape or changing."
      } ${fate.meaning}`
    );
  }

  if (sun?.detected) {
    paragraphs.push(
      `Sun Line (${sun.confidence}% confidence): ${sun.confidence >= 70
        ? "a clear line, often associated with recognition, creativity, and success."
        : "a subtle line, suggesting talents that are developing or appreciated in private."
      } ${sun.meaning}`
    );
  }

  if (shape?.detected) {
    paragraphs.push(
      `Palm Shape (${shape.confidence}% confidence): ${shape.meaning || "The general shape of your palm offers foundational insights into your elemental nature."}`
    );
  }

  if (fingers?.detected) {
    paragraphs.push(
      `Finger Structure (${fingers.confidence}% confidence): ${fingers.meaning || "Proportions of the fingers suggest how you channel your energy into the world."}`
    );
  }

  paragraphs.push(
    "These notes are generated from extracted crease geometry and contrast in the uploaded image. Treat them as reflective prompts, not medical, legal, or destiny claims."
  );

  const extraTraits = [
    {
      name: "Line Clarity",
      confidence: Math.round(avg),
      description:
        avg >= 78
          ? "Creases contrast well against the palm, which improves extraction reliability."
          : "Some creases are faint or interrupted; lighting or focus may have limited extraction.",
    },
    {
      name: "Dominant Theme",
      confidence: dominant?.confidence ?? Math.round(avg),
      description: dominant
        ? `${dominant.name} is the strongest detected feature in this image.`
        : "No dominant crease stood out.",
    },
  ];

  const personalityInsights = {
    strengths: [
      (head?.attributes?.curvature ?? 0) < 10 ? "Clear, structured thinking" : "Flexible, imaginative thinking",
      (heart?.attributes?.curvature ?? 0) >= 12 ? "Emotional attunement" : "Steady loyalty in relationships",
      (life?.confidence ?? 0) >= 70 ? "Resilience under strain" : "Careful energy management",
    ],
    growthAreas: [
      (fate?.confidence ?? 0) < 75 ? "Clarifying long-term direction" : "Leaving room for unplanned turns",
      (heart?.attributes?.curvature ?? 0) >= 12
        ? "Holding boundaries while staying open"
        : "Naming feelings earlier in important conversations",
    ],
  };

  const lifeAreas = [
    {
      label: "Career",
      value:
        (fate?.confidence ?? 0) >= 75
          ? "A relatively clear vocation signal — consistent effort is likely to compound."
          : "Direction still looks fluid; experiments may reveal the better path.",
    },
    {
      label: "Relationships",
      value:
        (heart?.attributes?.curvature ?? 0) >= 12
          ? "Connection and emotional honesty are highlighted in this palm."
          : "Trust built slowly, through reliability, is the recurring theme.",
    },
    {
      label: "Personal Growth",
      value:
        (head?.attributes?.curvature ?? 0) < 10
          ? "Structured reflection (lists, reviews, study) may fit this thinking style."
          : "Creative practice and journaling may unlock insight more readily than rigid plans.",
    },
    {
      label: "Opportunities",
      value:
        (life?.attributes?.length ?? 0) >= 55
          ? "Stamina is a resource — longer projects are more likely to pay off."
          : "Shorter, well-paced commitments may yield better follow-through.",
    },
  ];

  const recommendations = [
    dominant
      ? `Give extra attention this week to themes tied to your ${dominant.name.toLowerCase()}.`
      : "Revisit the extracted lines after another photo in better light.",
    "Capture a second palm photo in even lighting if any confidence score is below 70%.",
    "Use the interpretation as a prompt for journaling, not as a fixed prediction.",
  ];

  return {
    lines,
    features: extraTraits,
    interpretation: paragraphs,
    personalityInsights,
    lifeAreas,
    recommendations,
    guidanceScore: Math.max(55, Math.min(96, Math.round(avg))),
  };
}

export function normalizePalmAnalysis(raw) {
  if (!raw) return null;
  const payload = raw.data || raw.result || raw.analysis || raw;
  const lines = asArray(payload.lines || payload.palmLines || payload.extracted_lines).map(normalizeLine);
  const features = asArray(payload.features || payload.handTraits || payload.traits).map((f) => ({
    name: f.name || f.label || "Feature",
    confidence: Number(f.confidence ?? f.score ?? 0),
    description: f.description || f.meaning || f.detail || "",
  }));
  const paragraphs = interpretationParagraphs(
    payload.interpretation || payload.interpretation_paragraphs || payload.aiInterpretation
  );

  // The existing interpretation formatter receives only measurements from the
  // uploaded-image detector. It never invents line coordinates or scores.
  if (payload.engine === "uploaded-image-cv") {
    const composed = composeFromLines(lines);
    return {
      ...composed,
      features: features.length ? features : composed.features,
      interpretation: paragraphs.length ? paragraphs : composed.interpretation,
      personalityInsights: payload.personalityInsights || composed.personalityInsights,
      lifeAreas: payload.lifeAreas || composed.lifeAreas,
      recommendations: payload.recommendations || composed.recommendations,
      guidanceScore: payload.guidanceScore ?? composed.guidanceScore,
    };
  }

  return {
    lines,
    features,
    interpretation: paragraphs,
    personalityInsights: payload.personalityInsights || { strengths: [], growthAreas: [] },
    lifeAreas: asArray(payload.lifeAreas),
    recommendations: asArray(payload.recommendations),
    guidanceScore: Number(payload.guidanceScore ?? payload.score ?? 0),
  };
}

/**
 * Upload a palm image for line extraction and AI interpretation.
 * Palm analysis is intentionally server-only.  Returning a browser-generated
 * tracing result when inference is down mixed legacy/mock output with trained
 * model output and made identical uploads inconsistent.
 */
export async function uploadPalmImage(formData, userOrUid) {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;
  const targetUid = typeof userOrUid === "string" ? userOrUid : userOrUid?.uid || user?.uid;
  const res = await fetch(`${API_BASE}/api/palm/analyze`, {
    method: "POST",
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    let message = `Palm analysis failed (${res.status})`;
    try { message = (await res.json()).error || message; } catch { /* retain status message */ }
    throw new Error(message);
  }
  const analysis = normalizePalmAnalysis(await res.json());

  // Persist to backend DB (Firestore & SQLite sync) with rapid deduplication guard
  try {
    if (targetUid) {
      const palmSaveKey = `${targetUid}_${analysis.guidanceScore}_${(analysis.lines || []).length}`;
      const now = Date.now();
      const lastSave = recentPalmSaves.get(palmSaveKey);
      if (!lastSave || now - lastSave > 5000) {
        recentPalmSaves.set(palmSaveKey, now);
        const palmDoc = {
          userId: targetUid,
          userName: user?.displayName || user?.email || "User",
          type: "palm",
          data: analysis,
          guidanceScore: analysis.guidanceScore || 0,
          createdAt: new Date().toISOString()
        };
        await addDoc(collection(db, "users", targetUid, "palm_readings"), palmDoc);
        try { await addDoc(collection(db, "readings"), palmDoc); } catch (e) { }
        // Also save to SQLite backend so dashboards update
        const token = await user.getIdToken();
        await fetch(`${API_BASE}/api/readings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ type: "palm", data: analysis, guidanceScore: analysis.guidanceScore || 0 })
        });
      }
    }
  } catch (e) {
    console.warn("Could not save palm reading to backend:", e.message);
  }

  return analysis;
}

function fetchWithTimeout(url, options = {}, timeoutMs = 3500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sacredImage(nameShort) {
  if (!nameShort) return "";
  return `https://www.sacred-texts.com/tarot/pkt/img/${nameShort}.jpg`;
}

export function normalizeTarotCard(card = {}, index = 0) {
  const id = card.id || card.name_short || slug(card.name) || `card-${index}`;
  return {
    id,
    name: card.name || "Unknown Card",
    meaning: card.meaning || card.meaning_up || card.meaningUpright || card.desc || "",
    meaningReversed: card.meaningReversed || card.meaning_rev || card.meaningReversedText || "",
    image: card.image || card.image_url || card.img || sacredImage(card.name_short || id),
    arcana: card.arcana || card.type || "",
    suit: card.suit || "",
  };
}

export function normalizeTarotDeck(raw) {
  const list = Array.isArray(raw) ? raw : raw?.cards || raw?.deck || raw?.data || [];
  return list.map(normalizeTarotCard).filter((c) => c.name);
}

function findSpread(spreadType) {
  return TAROT_SPREADS.find((s) => s.id === spreadType || s.name === spreadType) || null;
}

function meaningFor(card) {
  if (card.reversed && card.meaningReversed) return card.meaningReversed;
  return card.meaning || "";
}

function hashScore(seed, min = 58, max = 94) {
  let n = 0;
  const text = String(seed);
  for (let i = 0; i < text.length; i++) n = (n * 31 + text.charCodeAt(i)) % 1000;
  return min + (n % (max - min + 1));
}

export function composeTarotReading({ cards = [], spreadType }) {
  const spread = findSpread(spreadType);
  const positions = (spread?.positions || cards.map((_, i) => `Card ${i + 1}`)).slice(0, cards.length);

  const positionReadings = cards.map((card, i) => {
    const label = card.position || positions[i] || `Card ${i + 1}`;
    const orientation = card.reversed ? "reversed" : "upright";
    const base = meaningFor(card);
    return {
      index: i,
      label,
      card,
      interpretation: `${label}: ${card.name} (${orientation}). ${base} In this position, the card asks you to weigh how that theme is showing up right now, rather than treating it as a fixed outcome.`,
    };
  });

  const names = cards.map((c) => `${c.name}${c.reversed ? " reversed" : ""}`).join(", ");
  const synthesis = [
    `This ${spread?.name || "spread"} reading draws ${cards.length} card${cards.length === 1 ? "" : "s"}: ${names}.`,
    positionReadings[0]
      ? `The opening position (${positionReadings[0].label}) sets the tone through ${positionReadings[0].card.name}.`
      : "",
    cards.some((c) => c.reversed)
      ? "One or more reversed cards suggest an inner or delayed expression of their usual meaning — a cue to look at resistance, timing, or what is not yet ready."
      : "The upright majority of the spread leans toward direct, outward expression of these themes.",
    "Use the position notes as a structured reflection, not a prediction of events you cannot choose.",
  ].filter(Boolean);

  const seed = `${spreadType}:${cards.map((c) => `${c.id}:${c.reversed ? 1 : 0}`).join("|")}`;
  const scores = {
    guidance: hashScore(seed),
    clarity: hashScore(`${seed}:clarity`),
    challenge: hashScore(`${seed}:challenge`, 40, 88),
    opportunity: hashScore(`${seed}:opportunity`),
  };

  const categories = [
    { label: "Focus", value: positionReadings[0]?.interpretation || "No cards were drawn." },
    {
      label: spread?.name === "Relationship" ? "Connection" : "Tension",
      value: positionReadings[1]?.interpretation || "A single-card focus — look closely at that one message.",
    },
    {
      label: "Direction",
      value: positionReadings[positionReadings.length - 1]?.interpretation || "",
    },
  ];

  const recommendations = [
    `Journal one sentence for each position, starting with ${positions[0] || "the first card"}.`,
    cards.find((c) => c.reversed)
      ? `Sit with ${cards.find((c) => c.reversed).name} reversed: what feels blocked or inverted in that area?`
      : "Notice which card you resist — that is often the working edge of the reading.",
    "Return to this spread in a week and note what shifted in how the positions feel.",
  ];

  return {
    spreadType: spread?.id || spreadType,
    spreadName: spread?.name || "Tarot Reading",
    positions: positionReadings,
    synthesis,
    categories,
    recommendations,
    scores,
    guidanceScore: scores.guidance,
  };
}

export function normalizeTarotSpread(raw, request) {
  const payload = raw?.data || raw?.result || raw?.reading || raw;
  if (!payload) return composeTarotReading(request);

  const positions = asArray(payload.positions || payload.cards || payload.cardInterpretations).map((item, i) => ({
    index: i,
    label: item.label || item.position || item.name || `Card ${i + 1}`,
    card: item.card || request.cards?.[i],
    interpretation: item.interpretation || item.meaning || item.text || item.reading || "",
  }));

  const synthesis = interpretationParagraphs(
    payload.synthesis || payload.interpretation || payload.overall || payload.summary
  );

  const scores = payload.scores || {
    guidance: Number(payload.guidanceScore ?? payload.score ?? 0),
    clarity: Number(payload.clarityScore ?? 0),
    challenge: Number(payload.challengeScore ?? 0),
    opportunity: Number(payload.opportunityScore ?? 0),
  };

  if (!positions.length || !synthesis.length) {
    const composed = composeTarotReading(request);
    return {
      ...composed,
      positions: positions.length ? positions : composed.positions,
      synthesis: synthesis.length ? synthesis : composed.synthesis,
      categories: payload.categories || composed.categories,
      recommendations: asArray(payload.recommendations).length
        ? asArray(payload.recommendations)
        : composed.recommendations,
      scores: payload.scores || composed.scores,
      guidanceScore: payload.guidanceScore ?? composed.guidanceScore,
    };
  }

  return {
    spreadType: payload.spreadType || request.spreadType,
    spreadName: payload.spreadName || findSpread(request.spreadType)?.name,
    positions,
    synthesis,
    categories: asArray(payload.categories),
    recommendations: asArray(payload.recommendations),
    scores,
    guidanceScore: Number(payload.guidanceScore ?? scores.guidance ?? 0),
  };
}

export async function getTarotDeck() {
  try {
    const res = await fetchWithTimeout("https://tarotapi.dev/api/v1/cards");
    if (!res.ok) throw new Error("Public tarot dataset unavailable");
    const deck = normalizeTarotDeck(await res.json());
    if (!deck.length) throw new Error("Empty public tarot dataset");
    return deck;
  } catch (fallbackErr) {
    console.warn("Fallback tarot dataset also unavailable:", fallbackErr.message);
    return FALLBACK_TAROT_DECK.map(normalizeTarotCard);
  }
}

/**
 * Generate an AI interpretation for a drawn spread.
 * `cards` may be id strings or card objects; `spreadType` is the spread id.
 */
export async function generateTarotSpread({ cards: selectedCards, spreadType, uid }) {
  const cards = asArray(selectedCards).map((c, i) =>
    typeof c === "string" || typeof c === "number" ? { id: c, name: String(c) } : { ...c, id: c.id || c.name || i }
  );

  // The backend /api/tarot/spread endpoint does not generate AI interpretations, 
  // it was incorrectly configured as a DB save endpoint.
  // We use the client-side generator instead to get the full reading.
  const reading = composeTarotReading({ cards, spreadType });

  // Save to backend DB (Firestore & SQLite sync) with rapid deduplication guard
  try {
    const user = auth.currentUser;
    const targetUid = uid || user?.uid;
    if (targetUid) {
      const tarotSaveKey = `${targetUid}_${spreadType}_${cards.map((c) => `${c.id}:${c.reversed ? 1 : 0}`).join(",")}`;
      const now = Date.now();
      const lastSave = recentTarotSaves.get(tarotSaveKey);
      if (!lastSave || now - lastSave > 5000) {
        recentTarotSaves.set(tarotSaveKey, now);
        const tarotDoc = {
          userId: targetUid,
          userName: user?.displayName || user?.email || "User",
          type: "tarot",
          data: reading,
          guidanceScore: reading.guidanceScore || 0,
          createdAt: new Date().toISOString()
        };
        await addDoc(collection(db, "users", targetUid, "tarot_readings"), tarotDoc);
        try { await addDoc(collection(db, "readings"), tarotDoc); } catch (e) { }
        // Also save to SQLite backend so dashboards update
        const token = user ? await user.getIdToken() : null;
        if (token) {
          await fetch(`${API_BASE}/api/readings`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ type: "tarot", data: reading, guidanceScore: reading.guidanceScore || 0 })
          });
        }
      }
    }
  } catch (e) {
    console.warn("Could not save tarot reading to backend:", e.message);
  }

  return reading;
}
