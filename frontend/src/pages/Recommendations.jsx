import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import {

  ArrowRight,

  BriefcaseBusiness,

  Heart,

  Leaf,

  UserRound,

  Target,

  ShieldCheck,

  Sparkles,

  Compass,

  MessageCircle,

  RefreshCw,

  Clock3,

  TrendingUp,

  CircleCheck,

  CircleAlert,

  Lightbulb,

} from "lucide-react";

import api from "../api/client";



const CATEGORY_META = {

  career: {

    label: "Career & Direction",

    short: "Career",

    icon: BriefcaseBusiness,

    keywords: [

      "career", "work", "job", "profession", "business", "money",

      "success", "leadership", "opportunity", "direction", "ambition",

      "project", "skill", "recognition", "stability"

    ],

  },

  relationship: {

    label: "Relationships & Connection",

    short: "Relationships",

    icon: Heart,

    keywords: [

      "relationship", "relationships", "love", "partner", "connection",

      "emotion", "emotional", "romance", "family", "trust", "communication",

      "friendship", "boundaries", "compassion", "vulnerability"

    ],

  },

  life: {

    label: "Life & Balance",

    short: "Life & Balance",

    icon: Leaf,

    keywords: [

      "change", "balance", "transition", "journey", "life", "future",

      "decision", "stability", "wellbeing", "energy", "home", "adapt",

      "movement", "timing", "cycle"

    ],

  },

  personal: {

    label: "Personal Development",

    short: "Personal Growth",

    icon: UserRound,

    keywords: [

      "growth", "confidence", "learning", "self", "personal", "strength",

      "clarity", "healing", "independence", "discipline", "potential",

      "development", "mindset", "focus", "wisdom", "resilience"

    ],

  },

  goals: {
    label: "Goal Alignment",
    short: "Goal Alignment",
    icon: Target,
    keywords: [
      "goal", "goals", "purpose", "priority", "priorities", "plan", "planning",
      "intention", "commitment", "milestone", "progress", "achievement",
      "aligned", "alignment", "next step", "long-term", "long term"
    ],
  },
  spiritual: {
    label: "Spiritual Development",
    short: "Spiritual Growth",
    icon: Sparkles,
    keywords: [
      "spiritual", "spirit", "intuition", "inner wisdom", "mindfulness",
      "meditation", "reflection", "meaning", "values", "purpose", "gratitude",
      "awareness", "inner peace", "grounded", "connection", "soul"
    ],
  },

};



const CATEGORY_KEYS = ["career", "relationship", "personal", "goals", "spiritual"];



const SIGNALS = [

  ["clarity", ["clarity", "clear", "focus", "understand", "wisdom"]],

  ["change", ["change", "transition", "shift", "new", "movement", "transform"]],

  ["confidence", ["confidence", "confident", "self-belief", "courage", "strength"]],

  ["communication", ["communication", "conversation", "express", "speak", "message"]],

  ["patience", ["patience", "slow", "wait", "timing", "pause"]],

  ["boundaries", ["boundary", "boundaries", "limits", "protect"]],

  ["opportunity", ["opportunity", "opening", "possibility", "potential"]],

  ["balance", ["balance", "steady", "stability", "harmony"]],

  ["growth", ["growth", "learning", "develop", "improve", "practice"]],

  ["decision", ["decision", "choice", "choose", "direction"]],
  ["goal alignment", ["goal", "priority", "plan", "purpose", "milestone", "intention"]],
  ["spiritual reflection", ["spiritual", "intuition", "mindfulness", "meditation", "gratitude", "inner wisdom"]],

];



function cleanText(value) {

  return String(value || "")

    .replace(/[*#\_`]/g, " ")

    .replace(/\s+/g, " ")

    .trim();

}



function getReadingText(reading) {

  return cleanText(

    [

      reading?.title,

      reading?.input_summary,

      reading?.result_text,

      reading?.interpretation,

      reading?.palm_insights

        ? JSON.stringify(reading.palm_insights)

        : "",

    ].join(" ")

  );

}



function scoreCategory(text, category) {

  const source = text.toLowerCase();

  return category.keywords.reduce(

    (total, keyword) =>

      total + (source.includes(keyword.toLowerCase()) ? 1 : 0),

    0

  );

}



function getCategoryScores(readings) {

  const text = readings.map(getReadingText).join(" ");

  return CATEGORY_KEYS

    .map((key) => ({

      key,

      score: scoreCategory(text, CATEGORY_META[key]),

    }))

    .sort((a, b) => b.score - a.score);

}



function getRecentCategoryScores(readings) {

  const text = readings.slice(0, 2).map(getReadingText).join(" ");

  return CATEGORY_KEYS

    .map((key) => ({

      key,

      score: scoreCategory(text, CATEGORY_META[key]),

    }))

    .sort((a, b) => b.score - a.score);

}



function getSignals(readings) {

  const source = readings.map(getReadingText).join(" ").toLowerCase();



  return SIGNALS

    .map(([name, words]) => ({

      name,

      score: words.reduce(

        (total, word) => total + (source.includes(word) ? 1 : 0),

        0

      ),

    }))

    .filter((item) => item.score > 0)

    .sort((a, b) => b.score - a.score)

    .map((item) => item.name);

}



function getRecentSignals(readings) {

  const source = readings

    .slice(0, 2)

    .map(getReadingText)

    .join(" ")

    .toLowerCase();



  return SIGNALS

    .map(([name, words]) => ({

      name,

      score: words.reduce(

        (total, word) => total + (source.includes(word) ? 1 : 0),

        0

      ),

    }))

    .filter((item) => item.score > 0)

    .sort((a, b) => b.score - a.score)

    .map((item) => item.name);

}



function firstUsefulSentence(reading) {

  let text = getReadingText(reading);

  if (!text) return "";



  // Never expose backend JSON in the presentation layer.

  text = text

    .replace(/\{\s*["']?cards["']?\s*:\s*\[.*$/is, "")

    .replace(/\{\s*["']?cards["']?\s*:\s*\[.*$/is, "")

    .replace(/AI\s+Tarot\s+Reading\s*$/i, "")

    .trim();



  if (!text) {

    return "Your latest reading has been added to the current recommendation pattern.";

  }



  const sentences = text

    .split(/(?<=[.!?])\s+/)

    .map((sentence) => sentence.trim())

    .filter((sentence) => sentence.length > 35);



  return sentences[0]?.slice(0, 220) || text.slice(0, 220);

}



function latestReading(readings) {

  return [...readings].sort(

    (a, b) =>

      new Date(b.created_at || 0).getTime() -

      new Date(a.created_at || 0).getTime()

  )[0];

}



function previousReading(readings) {

  return [...readings]

    .sort(

      (a, b) =>

        new Date(b.created_at || 0).getTime() -

        new Date(a.created_at || 0).getTime()

    )[1];

}



function extractTarotCards(reading) {

  if (!reading) return [];



  const type = String(reading.reading_type || "").toLowerCase();

  const raw = String(

    reading.result_text || reading.input_summary || reading.title || ""

  );



  const looksLikeTarot =

    type.includes("tarot") ||

    raw.toLowerCase().includes("tarot") ||

    raw.includes('"cards"') ||

    raw.includes("'cards'");



  if (!looksLikeTarot) return [];



  const cards = [];



  // The backend can return:

  // AI Tarot Reading {"cards":[{"position":1,"card":"Justice","orientation":"upright"}]}

  // or a normal JSON object. We deliberately extract only the card objects.

  const objectPattern =

    /[{"']\s*position\s*[}"']?\s*:\s*(\d+)\s*,\s*[}"']?\s*card\s*[}"']?\s*:\s*["']([^"']+)["']\s*,\s*[}"']?\s*orientation\s*[}"']?\s*:\s*["']([^"']+)["']/gi;



  let match;

  while ((match = objectPattern.exec(raw)) !== null && cards.length < 10) {

    cards.push({

      position: Number(match[1]),

      card: cleanText(match[2]),

      orientation: cleanText(match[3]),

    });

  }



  if (cards.length) return cards;



  // Handle JSON where spacing/order differs.

  const flexiblePattern =

    /position\s*["']?\s*:\s*(\d+).*?card\s*["']?\s*:\s*["']([^"']+)["'].*?orientation\s*["']?\s*:\s*["']([^"']+)["']/gis;



  while ((match = flexiblePattern.exec(raw)) !== null && cards.length < 10) {

    cards.push({

      position: Number(match[1]),

      card: cleanText(match[2]),

      orientation: cleanText(match[3]),

    });

  }



  return cards;

}



function tarotReadingSummary(cards) {

  if (!cards.length) return "";



  const names = cards.slice(0, 5).map((item) => item.card);

  const reversed = cards.filter(

    (item) => item.orientation?.toLowerCase() === "reversed"

  ).length;



  const cardText =

    names.length === 1

      ? names[0]

      : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;



  return `${cardText}${reversed ? ` · ${reversed} reversed` : " · all upright"}`;

}



function getReadingFingerprint(readings) {

  return readings

    .slice(0, 10)

    .map(

      (reading) =>

        `${reading.id || ""}-${reading.created_at || ""}-${reading.title || ""}-${getReadingText(reading).slice(0, 180)}`

    )

    .join("|");

}



function buildRecommendations(readings) {

  const sorted = [...readings].sort(

    (a, b) =>

      new Date(b.created_at || 0).getTime() -

      new Date(a.created_at || 0).getTime()

  );



  const latest = sorted[0];

  const previous = sorted[1];

  const allScores = getCategoryScores(sorted);

  const recentScores = getRecentCategoryScores(sorted);

  const allSignals = getSignals(sorted);

  const recentSignals = getRecentSignals(sorted);



  const latestScores = CATEGORY_KEYS

    .map((key) => ({ key, score: scoreCategory(getReadingText(latest), CATEGORY_META[key]) }))

    .sort((a, b) => b.score - a.score);



  const primary =

    latestScores.find((item) => item.score > 0)?.key ||

    recentScores.find((item) => item.score > 0)?.key ||

    allScores[0]?.key ||

    "personal";



  const secondary =

    allScores.find(

      (item) => item.key !== primary && item.score > 0

    )?.key || "personal";



  const latestText = getReadingText(latest).toLowerCase();

  const latestTarotCards = extractTarotCards(latest);

  const latestIsPalm = String(latest?.reading_type || "").toLowerCase().includes("palm");

  const latestIsTarot = String(latest?.reading_type || "").toLowerCase().includes("tarot") || latestTarotCards.length > 0;



  const latestSignals = getRecentSignals(latest ? [latest] : []);

  const signalA = latestSignals[0] || recentSignals[0] || allSignals[0] || "clarity";

  const signalB = latestSignals[1] || recentSignals[1] || allSignals[1] || "growth";

  const signalC = latestSignals[2] || recentSignals[2] || allSignals[2] || "balance";



  const previousText = getReadingText(previous).toLowerCase();



  const newTheme = CATEGORY_KEYS.find(

    (key) =>

      scoreCategory(latestText, CATEGORY_META[key]) > 0 &&

      scoreCategory(previousText, CATEGORY_META[key]) === 0

  );



  const continuingTheme =

    CATEGORY_KEYS.find(

      (key) =>

        scoreCategory(latestText, CATEGORY_META[key]) > 0 &&

        scoreCategory(previousText, CATEGORY_META[key]) > 0

    ) || primary;



  const newSignal =

    SIGNALS.find(

      ([name, words]) =>

        words.some((word) => latestText.includes(word)) &&

        !words.some((word) => previousText.includes(word))

    )?.[0] || signalA;



  const sourceLabel = latestIsPalm

    ? "Latest Palm reading"

    : latestIsTarot

      ? "Latest Tarot reading"

      : "Latest saved reading";



  const latestTitle =

    latest?.title || (latestIsPalm ? "Palm reflection" : "Tarot reflection");



  const latestInsight = firstUsefulSentence(latest);

  const latestTarotSummary = tarotReadingSummary(latestTarotCards);



  const cards = [

    {

      id: `do-${latest?.id}-${signalA}-${primary}`,

      kind: "DO",

      label: "DO",

      icon: CircleCheck,

      category: primary,

      title: "Make one move",

      text: buildDo(primary, signalA, signalB, latestIsPalm, latestIsTarot),

    },

    {

      id: `avoid-${latest?.id}-${signalB}-${secondary}`,

      kind: "AVOID",

      label: "AVOID",

      icon: ShieldCheck,

      category: secondary,

      title: "Protect your attention",

      text: buildAvoid(secondary, signalB, signalC),

    },

    {

      id: `try-${latest?.id}-${newSignal}`,

      kind: "TRY",

      label: "TRY",

      icon: Lightbulb,

      category: recentScores[0]?.key || primary,

      title: "Test a new response",

      text: buildTry(primary, newSignal, signalB),

    },

    {

      id: `dont-${latest?.id}-${signalC}`,

      kind: "DON'T",

      label: "DON'T",

      icon: CircleAlert,

      category: primary,

      title: "Don't over-read it",

      text: buildDont(primary, signalC),

    },

    {

      id: `career-${latest?.id}-${primary}-${secondary}`,

      kind: "CAREER",

      label: "CAREER",

      icon: BriefcaseBusiness,

      category: "career",

      title: "Career & direction",

      text: buildCareer(primary, secondary, signalA, signalB),

    },

    {

      id: `relationship-${latest?.id}-${signalA}-${signalB}`,

      kind: "RELATIONSHIPS",

      label: "RELATIONSHIPS",

      icon: Heart,

      category: "relationship",

      title: "Relationships",

      text: buildRelationship(primary, secondary, signalA, signalB),

    },

    {

      id: `personal-${latest?.id}-${signalA}-${continuingTheme}`,

      kind: "PERSONAL",

      label: "PERSONAL GROWTH",

      icon: UserRound,

      category: "personal",

      title: "Personal development",

      text: buildPersonal(signalA, signalB, continuingTheme, newSignal),

    },

    {

      id: `goals-${latest?.id}-${signalA}-${newTheme}`,
      kind: "GOALS",
      label: "GOAL ALIGNMENT",
      icon: Target,
      category: "goals",
      title: "Align your next step",
      text: buildGoalAlignment(primary, secondary, signalA, signalB, newTheme),
    },

    {
      id: `spiritual-${latest?.id}-${signalB}-${signalC}`,
      kind: "SPIRITUAL",
      label: "SPIRITUAL GROWTH",
      icon: Sparkles,
      category: "spiritual",
      title: "Make space for reflection",
      text: buildSpiritual(primary, signalA, signalC),
    },


  ];



  return {

    cards,

    primary,

    secondary,

    signalA,

    signalB,

    signalC,

    newSignal,

    newTheme,

    continuingTheme,

    latest,

    previous,

    latestTitle,

    latestInsight,

    latestTarotCards,

    latestTarotSummary,

    sourceLabel,

    allScores,

    recentScores,

    allSignals,

    recentSignals,

  };

}



function buildDo(primary, signalA, signalB, palm, tarot) {

  if (primary === "career") {

    return `Turn the current ${signalA} theme into one concrete career action. Pick one task, conversation, application, skill or decision that can be moved forward this week. ${tarot ? "Use the Tarot reflection to frame the question, then use practical evidence to decide." : ""} ${palm ? "Let the Palm reading remain a reflective pattern rather than a fixed outcome." : ""}`;

  }



  if (primary === "relationship") {

    return `Take one relationship step that improves ${signalA}: have a clear conversation, express a need, appreciate someone or define a boundary. Do not wait for the situation to explain itself.`;

  }



  if (primary === "life") {

    return `Create one small change around ${signalA}. Change one routine, priority or decision point and observe what happens for seven days before making another major adjustment.`;

  }



  if (primary === "goals") return `Choose one goal that matters now, connect it to ${signalA}, and define a small action you can complete this week. Check that the step fits your time, energy and real priorities.`;
  if (primary === "spiritual") return `Make a little space for ${signalA}: try five quiet minutes of reflection, gratitude or mindful breathing. Notice what feels meaningful without treating a reading as a fixed instruction.`;

  return `Choose one repeatable action that develops ${signalA}. Keep it small enough to practise and specific enough to notice. Let ${signalB} support the process instead of trying to change everything at once.`;

}



function buildAvoid(category, signalB, signalC) {

  if (category === "career") {

    return `Avoid making a career decision only because it feels urgent. Separate pressure from evidence, especially when ${signalB} is active. Give yourself a clear reason before committing.`;

  }



  if (category === "relationship") {

    return `Avoid filling gaps with assumptions. If ${signalB} is affecting a connection, ask for clarity rather than interpreting silence, tone or uncertainty as an answer. Protect ${signalC} too.`;

  }



  if (category === "life") {

    return `Avoid changing several parts of life at the same time. When ${signalB} and ${signalC} appear together, one controlled change will tell you more than a complete reset.`;

  }



  if (category === "goals") return `Avoid chasing every opportunity at once. Compare new commitments with your main goal, available time and current responsibilities before saying yes.`;
  if (category === "spiritual") return `Avoid judging your spiritual progress or forcing a meaning onto every symbol. Keep what supports calm reflection and leave the rest open to interpretation.`;

  return `Avoid turning reflection into self-criticism. If ${signalB} is the current lesson, measure progress against your own recent behaviour rather than someone else's pace.`;

}



function buildTry(primary, newSignal, signalB) {

  if (primary === "career") {

    return `Try a two-column check: "What I know" and "What I still need to know." Put ${newSignal} in the first column and ${signalB} in the second. This turns a broad career feeling into evidence you can act on.`;

  }



  if (primary === "relationship") {

    return `Try replacing one assumption with one direct question. Write the question without blame, then decide whether the conversation needs an answer now or simply more time.`;

  }



  if (primary === "life") {

    return `Try a seven-day experiment instead of a permanent decision. Adjust one routine connected to ${newSignal}, record the effect, and use that result as your next piece of evidence.`;

  }



  if (primary === "goals") return `Try a weekly goal check: write your main goal, the next step, and one obstacle. Use ${newSignal} as a reflection prompt, then adjust the plan based on what is practical.`;
  if (primary === "spiritual") return `Try a short reflection ritual: note one thing you are grateful for, one value you want to act on, and one question you want to sit with. Keep it simple and personal.`;

  return `Try a short daily check-in: "What did I respond to differently today?" Look specifically for ${newSignal} and ${signalB}. This makes personal growth observable.`;

}



function buildDont(primary, signalC) {

  if (primary === "career") {

    return `Don't treat a strong career theme as a guarantee about one outcome. Keep practical factors—skills, timing, finances, responsibilities and real opportunities—in the decision.`;

  }



  if (primary === "relationship") {

    return `Don't use a symbolic reading as proof of what another person thinks or will do. Your relationship decisions should come from communication, boundaries, consent and observed behaviour.`;

  }



  if (primary === "life") {

    return `Don't let every new reading erase everything that came before it. Let the new ${signalC} signal update the story instead of forcing a complete change of direction.`;

  }



  if (primary === "goals") return `Don't use a reading to decide your goals for you. Your goals should reflect your own values, needs and circumstances; use the reading only as a prompt to reflect.`;
  if (primary === "spiritual") return `Don't treat spiritual symbols as proof or certainty. Keep your own judgment, lived experience and wellbeing at the centre of your choices.`;

  return `Don't turn ${signalC} into another standard you have to perfect. Development includes action, observation and rest.`;

}



function buildCareer(primary, secondary, signalA, signalB) {

  if (primary === "career") {

    return `Career is currently one of the stronger signals in your reading pattern. Work with ${signalA} first: identify the professional choice that would benefit most from greater clarity. Keep ${CATEGORY_META[secondary].short.toLowerCase()} in the picture so progress does not become one-dimensional.`;

  }



  return `Career is a supporting theme rather than the loudest one right now. Ask whether your next professional move actually supports your ${CATEGORY_META[primary].short.toLowerCase()} priorities. ${signalB} may be more useful as a decision filter than chasing a bigger outcome.`;

}



function buildRelationship(primary, secondary, signalA, signalB) {

  if (primary === "relationship" || secondary === "relationship") {

    return `Relationship themes deserve attention around ${signalA}. Focus on what can be communicated or observed. If ${signalB} keeps appearing, slow down before deciding what another person means.`;

  }



  return `Relationships are present without dominating the current story. Keep connection in balance with ${CATEGORY_META[primary].short.toLowerCase()}. A healthy next step should leave room for honesty, mutual respect and your own boundaries.`;

}



function buildLife(primary, secondary, signalC, newTheme) {

  const changeText = newTheme

    ? ` A newer ${CATEGORY_META[newTheme].short.toLowerCase()} signal is also entering the picture.`

    : "";



  return `Your wider life recommendation is to protect ${signalC}. The strongest theme is ${CATEGORY_META[primary].short.toLowerCase()}, while ${CATEGORY_META[secondary].short.toLowerCase()} remains part of the broader pattern.${changeText} Aim for a decision that is sustainable across more than one area of life.`;

}



function buildPersonal(signalA, signalB, continuingTheme, newSignal) {

  return `Personal development is most useful when it responds to what is actually changing. Your broader pattern continues to include ${CATEGORY_META[continuingTheme].short.toLowerCase()}, while the newest signal points toward ${newSignal}. Build ${signalA} through one repeatable behaviour instead of trying to transform everything at once.`;

}



function buildWatch(newTheme, continuingTheme, newSignal, signalA) {

  if (newTheme) {

    return `A newer ${CATEGORY_META[newTheme].short.toLowerCase()} layer is entering a story that still carries ${CATEGORY_META[continuingTheme].short.toLowerCase()}. Watch whether ${newSignal} continues in your next reading rather than treating one new signal as a complete change of direction.`;

  }



  return `No completely new category is dominating the latest pattern yet. Watch whether ${signalA} keeps recurring in future readings. Consistency across readings is more useful than reacting strongly to one session.`;

}



function buildQuestion(primary, secondary, signalA, signalB) {

  return `If ${CATEGORY_META[primary].short.toLowerCase()} is asking for attention while ${CATEGORY_META[secondary].short.toLowerCase()} remains active, what would a decision based on ${signalA} look like? What evidence would you need before acting on ${signalB}?`;

}



function buildGoalAlignment(primary, secondary, signalA, signalB, newTheme) {
  const primaryLabel = CATEGORY_META[primary]?.short?.toLowerCase() || "personal growth";
  const secondaryLabel = CATEGORY_META[secondary]?.short?.toLowerCase() || "your wider priorities";
  const shift = newTheme ? ` A newer ${CATEGORY_META[newTheme].short.toLowerCase()} theme may be worth checking against this goal.` : "";
  return `Start with the goal that matters most to you. Your current reading themes lean toward ${primaryLabel}, while ${secondaryLabel} also deserves room. Use ${signalA} to choose one realistic next step and ${signalB} as a check-in—not as a prediction.${shift}`;
}

function buildSpiritual(primary, signalA, signalC) {
  const focus = primary === "spiritual" ? "inner reflection" : CATEGORY_META[primary]?.short?.toLowerCase() || "personal growth";
  return `Use the reading as a gentle prompt to reflect on ${focus}. Set aside a few quiet minutes to notice what feels aligned with your values, what needs more care, and where ${signalA} or ${signalC} could guide a thoughtful everyday choice. Keep the meaning personal and open-ended.`;
}

function DirectRecommendationCard({ card }) {

  const Icon = card.icon;



  return (

    <article className={`recommendation-direct-card recommendation-${card.kind.toLowerCase().replace(/[^a-z0-9-]/g, "")}`}>

      <div className="recommendation-direct-top">

        <span className="recommendation-kind">{card.label}</span>

        <span className="recommendation-icon">

          <Icon size={20} />

        </span>

      </div>



      <div className="recommendation-direct-title-row">

        <Icon size={24} strokeWidth={1.6} />

        <h3>{card.title}</h3>

      </div>



      <p>{card.text}</p>



      <div className="recommendation-direct-footer">

        <span>Personalized from your reading pattern</span>

        <Sparkles size={13} />

      </div>

    </article>

  );

}



function FlipRecommendationCard({ card, flipped, onFlip }) {

  const Icon = card.icon;



  return (

    <article

      className={`recommendation-flip-card recommendation-${card.kind.toLowerCase().replace(/[^a-z0-9-]/g, "")} ${flipped ? "is-flipped" : ""}`}

      onClick={onFlip}

      onKeyDown={(event) => {

        if (event.key === "Enter" || event.key === " ") {

          event.preventDefault();

          onFlip();

        }

      }}

      role="button"

      tabIndex={0}

      aria-label={`${card.label} recommendation. Click to ${flipped ? "hide" : "reveal"} details.`}

    >

      <div className="recommendation-flip-inner">

        <div className="recommendation-flip-face recommendation-flip-front">

          <div className="flip-card-top">

            <span>{card.label}</span>

            <Icon size={20} />

          </div>



          <div className="flip-symbol">

            <Icon size={31} strokeWidth={1.45} />

          </div>



          <h3>{card.title}</h3>

          <p>{card.text.split(". ")[0]}.</p>



          <div className="flip-card-hint">

            <span>Click to reveal</span>

            <ArrowRight size={13} />

          </div>

        </div>



        <div className="recommendation-flip-face recommendation-flip-back">

          <div className="flip-card-top">

            <span>PERSONAL RESPONSE</span>

            <Sparkles size={18} />

          </div>



          <h3>{card.label}</h3>

          <p>{card.text}</p>



          <div className="flip-card-hint">

            <span>Click to return</span>

            <ArrowRight size={13} />

          </div>

        </div>

      </div>

    </article>

  );

}



export function Recommendations() {

  const [readings, setReadings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [lastLoaded, setLastLoaded] = useState(null);

  const [flippedCards, setFlippedCards] = useState({});



  async function loadReadings(showLoading = true) {

    if (showLoading) {

      setLoading(true);

      setError("");

    }



    try {

      const response = await api.get("/api/readings/me");

      const items = Array.isArray(response.data)

        ? response.data

        : response.data?.items || [];



      setReadings(items);

      setLastLoaded(new Date());

    } catch (err) {

      if (showLoading) {

        setError(

          err?.response?.data?.detail ||

            "Your saved readings could not be loaded right now."

        );

      }

    } finally {

      if (showLoading) setLoading(false);

    }

  }



  useEffect(() => {

    loadReadings(true);



    const refreshQuietly = () => {

      if (document.visibilityState === "visible") loadReadings(false);

    };

    const intervalId = window.setInterval(refreshQuietly, 15000);

    window.addEventListener("focus", refreshQuietly);

    document.addEventListener("visibilitychange", refreshQuietly);



    return () => {

      window.clearInterval(intervalId);

      window.removeEventListener("focus", refreshQuietly);

      document.removeEventListener("visibilitychange", refreshQuietly);

    };

  }, []);



  const recommendationData = useMemo(

    () => buildRecommendations(readings),

    [readings]

  );



  const fingerprint = useMemo(

    () => getReadingFingerprint(readings),

    [readings]

  );



  useEffect(() => {

    setFlippedCards({});

  }, [fingerprint]);



  function toggleFlip(id) {

    setFlippedCards((current) => ({

      ...current,

      [id]: !current[id],

    }));

  }



  if (loading) {

    return (

      <section className="feature-page">

        <div className="feature-hero">

          <span className="eyebrow">PERSONAL RESPONSE ENGINE</span>

          <h1

            style={{

              fontFamily: 'Georgia, "Times New Roman", serif',

              fontSize: "48px",

              fontWeight: 700,

              letterSpacing: "-1.5px",

              lineHeight: 1.05,

            }}

          >

            Recommendations

          </h1>

          <p>Reading your latest Palm + Tarot patterns...</p>

        </div>

        <section className="feature-panel insight-panel">

          <div className="loading-screen">

            Building your personalized recommendations...

          </div>

        </section>

      </section>

    );

  }



  if (error) {

    return (

      <section className="feature-page">

        <div className="feature-hero">

          <span className="eyebrow">PERSONAL RESPONSE ENGINE</span>

          <h1

            style={{

              fontFamily: 'Georgia, "Times New Roman", serif',

              fontSize: "48px",

              fontWeight: 700,

              letterSpacing: "-1.5px",

              lineHeight: 1.05,

            }}

          >

            Recommendations

          </h1>

          <p>We could not load your saved reading pattern.</p>

        </div>

        <section className="feature-panel insight-panel">

          <p>{error}</p>

          <button className="primary-button" type="button" onClick={loadReadings}>

            <RefreshCw size={15} /> Try again

          </button>

        </section>

      </section>

    );

  }



  if (!readings.length) {

    return (

      <section className="feature-page">

        <div className="feature-hero">

          <span className="eyebrow">PERSONAL RESPONSE ENGINE</span>

          <h1

            style={{

              fontFamily: 'Georgia, "Times New Roman", serif',

              fontSize: "48px",

              fontWeight: 700,

              letterSpacing: "-1.5px",

              lineHeight: 1.05,

            }}

          >

            Recommendations

          </h1>

          <p>

            Recommendations will be created from your saved Palm and Tarot

            reading pattern.

          </p>

        </div>



        <section className="feature-panel insight-panel">

          <div className="empty-state">

            <Sparkles size={32} />

            <h2>Your recommendation engine is ready.</h2>

            <p>

              Save a Palm or Tarot reading first. Then this page will show

              direct Do, Avoid, Try, Don't, Career, Relationships, Life and

              Personal Growth recommendations.

            </p>

            <div className="empty-actions">

              <Link className="inline-link" to="/palm-reading">

                Start Palm reading <ArrowRight size={15} />

              </Link>

              <Link className="inline-link" to="/tarot-reading">

                Start Tarot reading <ArrowRight size={15} />

              </Link>

            </div>

          </div>

        </section>

      </section>

    );

  }



  return (

    <section className="feature-page recommendations-page">

      <style>{`

        .recommendations-page {

          font-family: Georgia, "Times New Roman", serif !important;

          width: 100% !important;

          max-width: 1200px !important;

          box-sizing: border-box;

          padding: 0 0 46px !important;

          margin: 0 auto !important;

        }



        .recommendations-page .feature-hero {

          width: 100%;

          max-width: 1200px;

          margin: 0 auto 22px;

          box-sizing: border-box;

        }



        .recommendations-page .recommendation-overview,

        .recommendations-page .recommendation-section {

          width: 100%;

          max-width: 1200px;

          margin-left: auto;

          margin-right: auto;

          box-sizing: border-box;

        }



        .recommendation-overview {

          display: grid;

          grid-template-columns: minmax(0, 1.55fr) minmax(280px, .75fr);

          gap: 16px;

          margin-bottom: 18px;

        }



        .recommendation-story,

        .recommendation-latest {

          background: rgba(255, 250, 241, .88);

          border: 1px solid rgba(99, 65, 39, .15);

          border-radius: 18px;

          padding: 22px;

          box-shadow: 0 12px 30px rgba(77, 47, 27, .055);

        }



        .recommendation-story h2,

        .recommendation-latest h2 {

          margin: 0 0 8px;

          color: #4b3020;

          font-size: 19px;

        }



        .recommendation-story p,

        .recommendation-latest p {

          color: #705846;

          line-height: 1.7;

          margin: 0;

        }



        .recommendation-theme-row {

          display: flex;

          flex-wrap: wrap;

          gap: 8px;

          margin-top: 15px;

        }



        .recommendation-theme {

          display: inline-flex;

          align-items: center;

          gap: 6px;

          border-radius: 999px;

          padding: 7px 11px;

          background: #f2e6d5;

          border: 1px solid rgba(99,65,39,.1);

          color: #65442c;

          font-size: 11px;

          font-weight: 750;

        }



        .recommendation-latest {

          position: relative;

          overflow: hidden;

        }



        .recommendation-latest::before {

          content: "";

          position: absolute;

          left: 0;

          top: 0;

          bottom: 0;

          width: 5px;

          background: #805733;

        }



        .latest-label {

          display: flex;

          align-items: center;

          gap: 7px;

          color: #8a6548;

          font-size: 10px;

          font-weight: 800;

          letter-spacing: .13em;

          text-transform: uppercase;

          margin-bottom: 9px;

        }



        .latest-title {

          font-weight: 800;

          color: #4b3020;

          margin-bottom: 8px !important;

        }



        .latest-excerpt {

          font-size: 13px;

        }



        .latest-readable-summary {

          padding: 10px 0 2px;

        }



        .latest-readable-summary .latest-summary-label {

          margin-bottom: 6px;

        }



        .latest-tarot-summary {

          margin-top: 5px;

        }



        .latest-summary-label {

          display: block;

          margin-bottom: 9px;

          color: #8a6548;

          font-size: 9px;

          font-weight: 800;

          letter-spacing: .12em;

          text-transform: uppercase;

        }



        .latest-card-row {

          display: grid;

          grid-template-columns: repeat(2, minmax(0, 1fr));

          gap: 7px;

        }



        .latest-card-chip {

          display: flex;

          align-items: center;

          gap: 6px;

          padding: 7px 9px;

          border-radius: 10px;

          background: #f5eadb;

          border: 1px solid rgba(99,65,39,.11);

          color: #5e422d;

          font-size: 10px;

          line-height: 1.2;

        }



        .latest-card-chip strong {

          display: grid;

          place-items: center;

          width: 18px;

          height: 18px;

          border-radius: 50%;

          background: #7b5537;

          color: #fffaf2;

          font-size: 9px;

        }



        .latest-card-chip small {

          color: #967962;

          text-transform: capitalize;

          font-size: 8px;

        }



        .recommendation-change {

          margin-top: 13px;

          padding-top: 13px;

          border-top: 1px solid rgba(99,65,39,.1);

          font-size: 12px !important;

        }



        .recommendation-change strong {

          color: #4b3020;

        }



        .recommendation-section {

          background: rgba(255, 250, 241, .84);

          border: 1px solid rgba(99, 65, 39, .14);

          border-radius: 20px;

          padding: 25px;

          box-shadow: 0 15px 35px rgba(77, 47, 27, .055);

        }



        .recommendation-section-header {

          display: flex;

          justify-content: space-between;

          align-items: flex-end;

          gap: 18px;

          margin-bottom: 18px;

        }



        .recommendation-section-header h2 {

          margin: 4px 0 0;

          color: #4b3020;

          font-family: Georgia, "Times New Roman", serif;

          font-size: 25px;

        }



        .recommendation-section-header p {

          margin: 0;

          color: #806852;

          font-size: 12px;

          text-align: right;

        }



        .recommendation-action-grid {

          display: grid;

          grid-template-columns: repeat(4, minmax(0, 1fr));

          gap: 18px;

          margin-bottom: 20px;

        }



        .recommendation-direct-grid {

          display: grid;

          grid-template-columns: repeat(3, minmax(0, 1fr));

          gap: 16px;

        }



        .recommendation-direct-grid .recommendation-direct-card {

          min-height: 220px;

        }



        .recommendation-flip-card {

          height: 285px;

          min-width: 0;

          perspective: 1200px;

          cursor: pointer;

          outline: none;

        }



        .recommendation-flip-card:focus-visible {

          box-shadow: 0 0 0 3px rgba(112, 78, 50, .22);

          border-radius: 19px;

        }



        .recommendation-flip-inner {

          position: relative;

          width: 100%;

          height: 100%;

          transform-style: preserve-3d;

          transition: transform .65s cubic-bezier(.2,.75,.2,1);

        }



        .recommendation-flip-card.is-flipped .recommendation-flip-inner {

          transform: rotateY(180deg);

        }



        .recommendation-flip-face {

          position: absolute;

          inset: 0;

          display: flex;

          flex-direction: column;

          padding: 22px;

          border-radius: 19px;

          border: 1px solid rgba(99,65,39,.17);

          backface-visibility: hidden;

          -webkit-backface-visibility: hidden;

          overflow: hidden;

          box-sizing: border-box;

          box-shadow: 0 14px 32px rgba(77,47,27,.08);

        }



        .recommendation-flip-front {

          background:

            radial-gradient(circle at 85% 15%, rgba(255,255,255,.72), transparent 28%),

            linear-gradient(145deg, #fffaf2, #eadbc7);

        }



        .recommendation-flip-front::after {

          content: "";

          position: absolute;

          inset: 9px;

          border: 1px solid rgba(99,65,39,.11);

          border-radius: 13px;

          pointer-events: none;

        }



        .recommendation-flip-back {

          transform: rotateY(180deg);

          background: #fffaf2;

          border-top: 5px solid #755238;

        }



        .recommendation-do .recommendation-flip-back { border-top-color: #68754f; }

        .recommendation-avoid .recommendation-flip-back { border-top-color: #9a7656; }

        .recommendation-try .recommendation-flip-back { border-top-color: #79634b; }

        .recommendation-dont .recommendation-flip-back { border-top-color: #8d5e51; }



        .flip-card-top {

          position: relative;

          z-index: 2;

          display: flex;

          align-items: center;

          justify-content: space-between;

          color: #76563b;

          font-size: 10px;

          font-weight: 850;

          letter-spacing: .13em;

        }



        .flip-symbol {

          position: relative;

          z-index: 2;

          width: 72px;

          height: 72px;

          display: grid;

          place-items: center;

          border-radius: 50%;

          background: rgba(255,255,255,.63);

          border: 1px solid rgba(99,65,39,.16);

          color: #6b4a31;

          margin: 25px auto 8px;

        }



        .recommendation-flip-front h3,

        .recommendation-flip-back h3 {

          position: relative;

          z-index: 2;

          margin: 8px 0 8px;

          color: #4b3020;

          font-family: Georgia, "Times New Roman", serif;

          font-size: 22px;

        }



        .recommendation-flip-front p,

        .recommendation-flip-back p {

          position: relative;

          z-index: 2;

          margin: 0;

          color: #6d5542;

          font-size: 13px;

          line-height: 1.7;

        }



        .recommendation-flip-back p {

          margin-top: 8px;

          flex: 1;

        }



        .flip-card-hint {

          position: relative;

          z-index: 2;

          display: flex;

          align-items: center;

          gap: 6px;

          margin-top: auto;

          padding-top: 14px;

          color: #947761;

          font-size: 10px;

          border-top: 1px solid rgba(99,65,39,.1);

        }



        .recommendation-direct-card {

          min-height: 245px;

          position: relative;

          display: flex;

          flex-direction: column;

          padding: 19px;

          border-radius: 17px;

          border: 1px solid rgba(99,65,39,.15);

          background: #fffaf2;

          overflow: hidden;

          transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;

        }



        .recommendation-direct-card:hover {

          transform: translateY(-3px);

          box-shadow: 0 14px 28px rgba(77,47,27,.1);

          border-color: rgba(99,65,39,.28);

        }



        .recommendation-direct-card::before {

          content: "";

          position: absolute;

          top: 0;

          left: 0;

          right: 0;

          height: 4px;

          background: #7b5334;

        }



        .recommendation-do::before { background: #65704e; }

        .recommendation-avoid::before { background: #916c4e; }

        .recommendation-try::before { background: #7c6249; }

        .recommendation-dont::before { background: #8b5a4c; }

        .recommendation-career::before { background: #795335; }

        .recommendation-relationships::before { background: #8b5a55; }

        .recommendation-life::before { background: #68724d; }

        .recommendation-personal::before { background: #6c5a48; }
        .recommendation-goals::before { background: #8a7048; }
        .recommendation-spiritual::before { background: #79664f; }

        .recommendation-watch::before { background: #6c634e; }

        .recommendation-question::before { background: #735d48; }



        .recommendation-direct-top {

          display: flex;

          justify-content: space-between;

          align-items: center;

          gap: 10px;

          color: #795b42;

        }



        .recommendation-kind {

          font-size: 10px;

          font-weight: 850;

          letter-spacing: .12em;

        }



        .recommendation-icon {

          width: 34px;

          height: 34px;

          display: grid;

          place-items: center;

          border-radius: 50%;

          background: #f1e5d4;

          color: #6d4b31 !important;

        }



        .recommendation-direct-title-row {

          display: flex;

          align-items: center;

          gap: 9px;

          margin-top: 22px;

          color: #5f432e;

        }



        .recommendation-direct-title-row h3 {

          margin: 0;

          color: #4b3020;

          font-family: Georgia, "Times New Roman", serif;

          font-size: 19px;

          line-height: 1.15;

        }



        .recommendation-direct-card > p {

          margin: 13px 0 18px;

          color: #6e5541;

          font-size: 13px;

          line-height: 1.7;

        }



        .recommendation-direct-footer {

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 8px;

          margin-top: auto;

          padding-top: 12px;

          border-top: 1px solid rgba(99,65,39,.09);

          color: #947b66;

          font-size: 9px;

          letter-spacing: .02em;

        }



        .recommendation-direct-footer svg {

          flex: 0 0 auto;

        }



        .recommendation-insight-strip {

          display: grid;

          grid-template-columns: repeat(3, minmax(0, 1fr));

          gap: 14px;

          margin-top: 16px;

        }



        .recommendation-mini {

          border: 1px solid rgba(99,65,39,.12);

          border-radius: 16px;

          background: rgba(247, 237, 223, .72);

          padding: 17px;

        }



        .recommendation-mini-label {

          display: flex;

          align-items: center;

          gap: 7px;

          color: #89694e;

          font-size: 10px;

          font-weight: 850;

          letter-spacing: .1em;

          text-transform: uppercase;

        }



        .recommendation-mini strong {

          display: block;

          margin-top: 8px;

          color: #4b3020;

          font-size: 14px;

        }



        .recommendation-mini p {

          margin: 6px 0 0;

          color: #735a46;

          font-size: 12px;

          line-height: 1.55;

        }



        .recommendation-refresh {

          display: inline-flex;

          align-items: center;

          gap: 7px;

          border: 1px solid rgba(99,65,39,.15);

          border-radius: 999px;

          background: #fffaf2;

          color: #66472f;

          padding: 8px 12px;

          font-size: 11px;

          font-weight: 750;

          cursor: pointer;

        }



        .recommendation-refresh:hover {

          background: #f3e5d3;

        }



        .recommendation-source-note {

          display: flex;

          align-items: center;

          gap: 8px;

          margin-top: 17px;

          padding: 13px 15px;

          border-radius: 13px;

          background: #f3e6d5;

          color: #765b45;

          font-size: 11px;

          line-height: 1.55;

        }



        .recommendation-source-note strong {

          color: #4b3020;

        }



        .recommendation-disclaimer {

          margin-top: 16px;

          color: #8a725e;

          font-size: 11px;

          line-height: 1.6;

        }



        .recommendations-page .inline-link {

          margin-top: 17px;

        }



                .recommendation-focus-visual {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
          margin: 0 0 20px;
          padding: 18px;
          border: 1px solid rgba(99,65,39,.14);
          border-radius: 18px;
          background: linear-gradient(135deg, #fffaf2, #f2e5d3);
        }
        .recommendation-focus-item { min-width: 0; }
        .recommendation-focus-label {
          display: flex; align-items: center; gap: 6px; min-height: 30px;
          color: #76563b; font-size: 11px; font-weight: 700;
        }
        .recommendation-focus-track {
          height: 7px; margin-top: 8px; overflow: hidden; border-radius: 999px;
          background: #e4d1b9;
        }
        .recommendation-focus-fill {
          height: 100%; border-radius: inherit;
          background: linear-gradient(90deg, #9a7855, #6e5037);
          transition: width .35s ease;
        }
        .recommendation-focus-score { display: block; margin-top: 5px; color: #94765c; font-size: 10px; }
        .recommendations-page, .recommendations-page button, .recommendations-page p,
        .recommendations-page span, .recommendations-page strong, .recommendations-page a {
          font-family: Georgia, "Times New Roman", serif;
        }
        @media (max-width: 900px) {
          .recommendation-focus-visual { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (max-width: 560px) {
          .recommendation-focus-visual { grid-template-columns: repeat(2, minmax(0, 1fr)); padding: 14px; }
        }

@media (max-width: 1120px) {

          .recommendation-action-grid {

            grid-template-columns: repeat(2, minmax(0, 1fr));

          }



          .recommendation-direct-grid {

            grid-template-columns: repeat(2, minmax(0, 1fr));

          }

        }



        @media (max-width: 800px) {

          .recommendation-overview {

            grid-template-columns: 1fr;

          }



          .recommendation-section-header {

            align-items: flex-start;

            flex-direction: column;

          }



          .recommendation-section-header p {

            text-align: left;

          }



          .recommendation-insight-strip {

            grid-template-columns: 1fr;

          }

        }



        @media (max-width: 1240px) {

          .recommendations-page {

            padding-left: 18px !important;

            padding-right: 18px !important;

          }

        }



        @media (max-width: 560px) {

          .recommendations-page {

            padding-left: 14px !important;

            padding-right: 14px !important;

          }



          .recommendation-action-grid,

          .recommendation-direct-grid {

            grid-template-columns: 1fr;

          }



          .recommendation-section {

            padding: 17px;

          }



          .recommendation-flip-card {

            height: 265px;

          }

        }

      `}</style>



      <div className="feature-hero">

        <span className="eyebrow">PERSONAL RESPONSE ENGINE</span>

        <h1

            style={{

              fontFamily: 'Georgia, "Times New Roman", serif',

              fontSize: "48px",

              fontWeight: 700,

              letterSpacing: "-1.5px",

              lineHeight: 1.05,

            }}

          >

            Recommendations

          </h1>

        <p>

          Direct recommendations built from the newest changes in your Palm +

          Tarot reading history.

        </p>

      </div>



      <div className="recommendation-overview">

        <section className="recommendation-story">

          <h2>Your current reading pattern</h2>

          <p>

            This page uses <strong>{readings.length} saved reading(s)</strong>.

            The newest reading is given more weight while recurring themes are

            kept in the background, so recommendations can evolve instead of

            repeating the same advice.

          </p>



          <div className="recommendation-theme-row">

            {recommendationData.recentScores

              .filter((item) => item.score > 0)

              .slice(0, 3)

              .map((item) => (

                <span className="recommendation-theme" key={item.key}>

                  {CATEGORY_META[item.key].short}

                </span>

              ))}



            {recommendationData.recentSignals.slice(0, 3).map((signal) => (

              <span className="recommendation-theme" key={signal}>

                {signal}

              </span>

            ))}

          </div>

        </section>



        <section className="recommendation-latest">

          <div className="latest-label">

            <Clock3 size={14} />

            {recommendationData.sourceLabel}

          </div>



          <p className="latest-title">{recommendationData.latestTitle}</p>



          {recommendationData.latestTarotSummary ? (

            <div className="latest-tarot-summary">

              <span className="latest-summary-label">Cards in this reading</span>

              <div className="latest-card-row">

                {recommendationData.latestTarotCards.map((item) => (

                  <span className="latest-card-chip" key={`${item.position}-${item.card}`}>

                    <strong>{item.position}</strong>

                    {item.card}

                    <small>{item.orientation}</small>

                  </span>

                ))}

              </div>

            </div>

          ) : (

            <div className="latest-readable-summary">

              <span className="latest-summary-label">Latest reading signal</span>

              <p className="latest-excerpt">

                {recommendationData.latestInsight ||

                  "Your latest saved reading is now shaping this recommendation set."}

              </p>

            </div>

          )}



          {recommendationData.newTheme ? (

            <p className="recommendation-change">

              <strong>New layer:</strong>{" "}

              {CATEGORY_META[recommendationData.newTheme].short} is appearing

              more recently.

            </p>

          ) : (

            <p className="recommendation-change">

              <strong>Continuity:</strong>{" "}

              {CATEGORY_META[recommendationData.continuingTheme].short} remains

              part of the current pattern.

            </p>

          )}

        </section>

      </div>



      <section className="recommendation-focus-visual" aria-label="Recommendation focus visual">
        {CATEGORY_KEYS.map((key) => {
          const score = recommendationData.recentScores.find((item) => item.key === key)?.score || 0;
          const Icon = CATEGORY_META[key].icon;
          const level = Math.max(12, Math.min(100, score * 22));
          return (
            <div className="recommendation-focus-item" key={key}>
              <div className="recommendation-focus-label"><Icon size={14} />{CATEGORY_META[key].short}</div>
              <div className="recommendation-focus-track" role="img" aria-label={`${CATEGORY_META[key].short} keyword signal, illustrative`}>
                <div className="recommendation-focus-fill" style={{ width: `${level}%` }} />
              </div>
              <span className="recommendation-focus-score">{score ? "Theme found in recent reading" : "Open for reflection"}</span>
            </div>
          );
        })}
      </section>

      <section className="recommendation-section">

        <div className="recommendation-section-header">

          <div>

            <span className="eyebrow">YOUR CURRENT RECOMMENDATIONS</span>

            <h2>What to do, avoid, try and focus on</h2>

          </div>



          <button

            type="button"

            className="recommendation-refresh"

            onClick={loadReadings}

            title="Refresh recommendations from your saved readings"

          >

            <RefreshCw size={14} />

            Refresh from readings

          </button>

        </div>



        <div className="recommendation-action-grid">

          {recommendationData.cards.slice(0, 4).map((card) => (

            <FlipRecommendationCard

              key={card.id}

              card={card}

              flipped={Boolean(flippedCards[card.id])}

              onFlip={() => toggleFlip(card.id)}

            />

          ))}

        </div>



        <div className="recommendation-direct-grid">

          {recommendationData.cards.slice(4).map((card) => (

            <DirectRecommendationCard key={card.id} card={card} />

          ))}

        </div>



        <div className="recommendation-insight-strip">

          <article className="recommendation-mini">

            <span className="recommendation-mini-label">

              <TrendingUp size={14} />

              Strongest now

            </span>

            <strong>

              {CATEGORY_META[recommendationData.primary].label}

            </strong>

            <p>

              This is the strongest category in the newest part of your saved

              reading pattern.

            </p>

          </article>



          <article className="recommendation-mini">

            <span className="recommendation-mini-label">

              <RefreshCw size={14} />

              Emerging

            </span>

            <strong>

              {recommendationData.newTheme

                ? CATEGORY_META[recommendationData.newTheme].label

                : "No completely new category yet"}

            </strong>

            <p>

              {recommendationData.newTheme

                ? "A newer theme is entering the story. Watch whether it continues in your next reading."

                : "The latest reading is reinforcing themes already present rather than replacing them."}

            </p>

          </article>



          <article className="recommendation-mini">

            <span className="recommendation-mini-label">

              <Target size={14} />

              Next focus

            </span>

            <strong>{recommendationData.signalA}</strong>

            <p>

              Use this as a reflection focus for your next practical decision,

              conversation or personal action.

            </p>

          </article>

        </div>



        <div className="recommendation-source-note">

          <Sparkles size={16} />

          <span>

            <strong>Why this changes:</strong> every recommendation is tied to

            the current reading fingerprint, recent themes and recurring

            signals. When a new Palm or Tarot reading is saved, the latest

            reading, emerging theme, focus signals and recommendation wording

            are recalculated.

          </span>

        </div>



        <p className="recommendation-disclaimer">

          Recommendations are reflective prompts based on your saved reading

          content. Palmistry and Tarot are not scientifically validated

          prediction systems, so these suggestions should not be treated as

          guaranteed outcomes or professional advice.

        </p>

      </section>



      <Link className="inline-link" to="/dashboard">

        Back to dashboard <ArrowRight size={15} />

      </Link>

    </section>

  );

}



export default Recommendations;
