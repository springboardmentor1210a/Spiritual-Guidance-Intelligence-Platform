import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import {

  ArrowRight,

  ArrowUpRight,

  Brain,
  UserRound,
  ShieldCheck,
  Activity,

  Send,

  MessageCircle,

  Compass,

  Heart,

  Leaf,

  RefreshCw,

  Sparkles,

  Target,

  Waves,

} from "lucide-react";

import api from "../api/client";

import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

/*

 * Guidance is intentionally different from Recommendations.

 *

 * Recommendations answers: "What could I try?"

 * Guidance answers: "What is changing in my reading story, and how should

 * I respond to it?"

 *

 * This file uses the user's saved Palm + Tarot history. It does not pretend

 * that a fixed advice library is an AI model. The guidance engine compares

 * recurring themes, emerging themes, source overlap, reading recency and

 * reading language to create a changing response after new readings.

 */

const THEME_RULES = [

  {

    key: "career",

    label: "Career & direction",

    short: "direction",

    words: [

      "career",

      "work",

      "profession",

      "job",

      "success",

      "ambition",

      "leadership",

      "business",

      "opportunity",

      "study",

      "education",

      "project",

      "achievement",

    ],

  },

  {

    key: "relationships",

    label: "Relationships & connection",

    short: "connection",

    words: [

      "relationship",

      "relationships",

      "love",

      "partner",

      "connection",

      "heart",

      "romance",

      "trust",

      "emotion",

      "family",

      "friendship",

      "communication",

    ],

  },

  {

    key: "confidence",

    label: "Confidence & self-belief",

    short: "self-belief",

    words: [

      "confidence",

      "courage",

      "strength",

      "self-belief",

      "independence",

      "bravery",

      "assertive",

      "determination",

      "resilience",

      "belief",

    ],

  },

  {

    key: "change",

    label: "Change & transition",

    short: "change",

    words: [

      "change",

      "transition",

      "new",

      "movement",

      "turning point",

      "transformation",

      "beginning",

      "ending",

      "shift",

      "move",

      "moving",

      "fresh start",

    ],

  },

  {

    key: "growth",

    label: "Personal growth",

    short: "growth",

    words: [

      "growth",

      "learning",

      "reflection",

      "healing",

      "development",

      "awareness",

      "wisdom",

      "self-discovery",

      "maturity",

      "lesson",

    ],

  },

  {

    key: "balance",

    label: "Balance & wellbeing",

    short: "balance",

    words: [

      "balance",

      "calm",

      "peace",

      "rest",

      "wellbeing",

      "stress",

      "grounded",

      "patience",

      "clarity",

      "overwhelm",

      "steady",

    ],

  },

];

const ROLE_CONFIG = [

  {

    key: "continuity",

    label: "What is staying with you",

    icon: Waves,

  },

  {

    key: "emerging",

    label: "What is newly entering",

    icon: Sparkles,

  },

  {

    key: "connection",

    label: "Where the readings meet",

    icon: Brain,

  },

  {

    key: "response",

    label: "How to respond",

    icon: Compass,

  },

  {

    key: "next",

    label: "One thing to carry forward",

    icon: Target,

  },

];

const ACTION_VARIANTS = {

  career: [

    "Name the one outcome you want from your current work or study direction, then choose the next visible step that would prove you moved toward it.",

    "Take one unfinished career or study decision and write two columns: what is genuinely uncertain and what you already know. Act only on the second column.",

    "Choose one opportunity you keep thinking about and define the evidence you need before saying yes, rather than waiting for complete certainty.",

  ],

  relationships: [

    "Choose one relationship that matters and make one clear, low-pressure gesture that communicates what you value instead of assuming it is already understood.",

    "Before your next important conversation, write the point you want understood and the point you are willing to listen to. Let both shape the conversation.",

    "Notice where you are protecting harmony by leaving something unsaid. Decide whether a calm, honest sentence would create more clarity than silence.",

  ],

  confidence: [

    "Pick one decision you are capable of making now and make it without asking for another layer of reassurance. Review the result, not the fear that came before it.",

    "Write down one ability you have already demonstrated and use it as evidence when approaching the next situation that makes you hesitate.",

    "Move one small task from 'I should' to 'I will' today. Let completed action build the confidence that waiting for certainty cannot provide.",

  ],

  change: [

    "Separate the part of your situation that needs movement from the part that deserves protection. Make one deliberate change without dismantling everything around it.",

    "Identify the transition you are already experiencing, even if it has not been formally named. Decide what you want to carry with you into the next phase.",

    "Choose one small experiment that lets you test the new direction safely. Learn from the result instead of demanding a final answer first.",

  ],

  growth: [

    "Choose one recurring pattern from your recent readings and observe it in real life for a week before trying to change it. Understanding comes before correction.",

    "Turn one insight into a repeatable practice rather than another note in your journal. Keep it small enough that you can actually see whether it changes anything.",

    "Write one sentence beginning with 'I understand this differently now because…' and use it to identify the next part of your growth that deserves attention.",

  ],

  balance: [

    "Protect one short period of uninterrupted space before your next important decision. Use it to distinguish urgency from what genuinely deserves your attention.",

    "Look at the commitments competing for your energy and remove, delay or simplify one that is not aligned with your current priority.",

    "Create a deliberate pause between an emotional reaction and your next action. Record what becomes clearer when you do not respond immediately.",

  ],

};

const PAIR_ACTIONS = {

  "career|confidence": [

    "Choose one career decision where the direction is clearer than your confidence makes it feel. Define the smallest evidence-based step that would move it forward.",

    "Take one professional goal you already care about and replace self-doubt with a measurable test: decide what you can complete or learn within the next seven days.",

  ],

  "career|change": [

    "Identify the career direction that is changing and test it with one concrete move—an application, conversation, project step or research task—rather than only thinking about it.",

    "Write down what you want to leave behind professionally and what you want to build next. Use the difference to choose your next practical experiment.",

  ],

  "career|growth": [

    "Choose the professional skill that would make your next step easier and give it one focused practice session this week.",

    "Look at a recent career lesson and convert it into one new working rule you can apply to your next project or decision.",

  ],

  "career|balance": [

    "Review whether your current ambition is being supported by a sustainable pace. Change one habit that consumes energy without moving your priority forward.",

    "Choose one work priority and one thing you will deliberately not carry after the day ends. Let focus and boundaries support the same direction.",

  ],

  "relationships|confidence": [

    "Notice where confidence affects how openly you communicate. In one important relationship, say what you actually need without over-explaining it.",

    "Choose one relationship where you tend to seek reassurance and practice offering yourself clarity first before asking someone else to provide it.",

  ],

  "relationships|change": [

    "Ask which relationship is adapting to a new phase and make one intentional adjustment instead of expecting the old pattern to continue unchanged.",

    "Notice whether a recent change is altering what you need from connection. Name one expectation that should be updated rather than silently carried forward.",

  ],

  "relationships|growth": [

    "Take one relationship lesson from the recent reading pattern and turn it into a communication habit you can practice this week.",

    "Choose one connection that supports your growth and invest in it deliberately, while noticing which older relationship patterns no longer fit.",

  ],

  "relationships|balance": [

    "Protect the difference between being available and being overextended. Choose one relationship boundary that would make your current emotional space healthier.",

    "Before solving someone else's problem, ask whether they need your action, your attention or simply your presence. Respond to the actual need.",

  ],

  "confidence|change": [

    "Treat the new direction as something you can learn into, not something you must already feel ready for. Take one reversible step today.",

    "Write down what the changing situation is asking you to become more confident about. Practice that exact behavior once rather than trying to feel confident first.",

  ],

  "confidence|growth": [

    "Use one recent lesson as evidence of capability. Record what you handled better than before and let that become the basis for your next challenge.",

    "Choose one area where you want stronger self-belief and track behavior rather than feelings for the next week.",

  ],

  "confidence|balance": [

    "Notice whether you are using confidence as pressure to perform. Replace one 'I must prove myself' thought with a specific standard you can realistically meet.",

    "Give yourself enough quiet to hear your own judgment. Make one decision from clarity rather than from the need to appear certain.",

  ],

  "change|growth": [

    "Name the lesson the current transition is teaching you and decide what behavior you want to carry into the next phase.",

    "Instead of asking whether the change is good or bad, ask what capability it is requiring you to develop. Practice that capability in one small situation.",

  ],

  "change|balance": [

    "Choose what must move and what must remain stable. Build your next step around that distinction so change does not become unnecessary disruption.",

    "Give the transition one protected period of reflection before making the next major move. Use it to identify what is truly changing.",

  ],

  "growth|balance": [

    "Let growth include rest. Choose one practice that develops you and one practice that restores you, then give both equal importance this week.",

    "Notice whether constant self-improvement is making it harder to feel settled. Keep one growth goal and deliberately release the pressure to optimize everything else.",

  ],

};

const ROLE_LABELS = {

  continuity: "keep",

  emerging: "explore",

  connection: "understand",

  response: "respond",

  next: "carry forward",

};

function clean(value) {

  return String(value || "")

    .replace(/\s+/g, " ")

    .replace(/[#\*\_`]/g, "")

    .trim();

}

function readingText(reading) {

  if (!reading) return "";

  const values = [

    reading.title,

    reading.input_summary,

    reading.result_text,

    reading.palm_insights_json,

    reading.detected_lines_json,

  ];

  return clean(values.filter(Boolean).join(" "));

}

function readingType(reading) {

  return String(reading?.reading_type || "").toLowerCase();

}

function latestByType(readings, type) {

  return readings.find((item) => readingType(item) === type) || null;

}

function sortNewest(readings) {

  return [...readings].sort((a, b) => {

    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();

  });

}

function scoreThemeText(text) {

  const source = clean(text).toLowerCase();

  return THEME_RULES

    .map((theme) => {

      const hits = theme.words.filter((word) => source.includes(word.toLowerCase()));

      return {

        ...theme,

        score: hits.length,

        hits,

      };

    })

    .filter((theme) => theme.score > 0)

    .sort((a, b) => b.score - a.score);

}

function themesForReading(reading) {

  return scoreThemeText(readingText(reading));

}

function themeKeys(readings) {

  const scores = new Map();

  readings.forEach((reading, index) => {

    const weight = Math.max(0.35, 1 - index * 0.06);

    themesForReading(reading).forEach((theme) => {

      scores.set(theme.key, (scores.get(theme.key) || 0) + theme.score * weight);

    });

  });

  return [...scores.entries()]

    .sort((a, b) => b[1] - a[1])

    .map(([key, score]) => ({

      ...THEME_RULES.find((theme) => theme.key === key),

      historyScore: Number(score.toFixed(2)),

    }));

}

function themesFromRecent(readings) {

  return scoreThemeText(readings.map(readingText).join(" "));

}

function uniqueThemeList(themes) {

  const result = [];

  themes.forEach((theme) => {

    if (theme && !result.some((item) => item.key === theme.key)) result.push(theme);

  });

  return result;

}

function sourceThemeMap(readings, type) {

  const sourceReadings = readings.filter((reading) => readingType(reading) === type);

  const scores = new Map();

  sourceReadings.forEach((reading, index) => {

    const weight = Math.max(0.4, 1 - index * 0.08);

    themesForReading(reading).forEach((theme) => {

      scores.set(theme.key, (scores.get(theme.key) || 0) + theme.score * weight);

    });

  });

  return [...scores.entries()]

    .sort((a, b) => b[1] - a[1])

    .map(([key, score]) => ({

      ...THEME_RULES.find((theme) => theme.key === key),

      score: Number(score.toFixed(2)),

    }));

}

function hashString(value) {

  let hash = 2166136261;

  const source = String(value || "");

  for (let index = 0; index < source.length; index += 1) {

    hash ^= source.charCodeAt(index);

    hash = Math.imul(hash, 16777619);

  }

  return Math.abs(hash >>> 0);

}

function pick(list, signature) {

  if (!list?.length) return "";

  return list[hashString(signature) % list.length];

}

function pairKey(a, b) {

  return [a, b].sort().join("|");

}

function extractSignalPhrase(reading) {

  if (!reading) return "";

  const source = readingText(reading)

    .replace(/AI Tarot Reading/gi, "")

    .replace(/Overall Reading/gi, "")

    .replace(/Card-by-Card Interpretation/gi, "")

    .replace(/Practical Next Steps/gi, "")

    .trim();

  const sentences = source

    .split(/(?<=[.!?])\s+/)

    .map((sentence) => clean(sentence))

    .filter((sentence) => sentence.length >= 55 && sentence.length <= 180);

  const useful = sentences.find((sentence) => {

    const lower = sentence.toLowerCase();

    return (

      lower.includes("suggest") ||

      lower.includes("focus") ||

      lower.includes("indicat") ||

      lower.includes("encourag") ||

      lower.includes("may be") ||

      lower.includes("theme") ||

      lower.includes("direction")

    );

  });

  return useful || sentences[0] || "";

}

function readingLabel(reading, fallback) {

  if (!reading) return fallback;

  return clean(reading.title) || fallback;

}

function describeHistory(historyThemes, latestThemes) {

  const recurring = historyThemes.filter((theme) => theme.historyScore >= 1.45);

  const latestKeys = new Set(latestThemes.map((theme) => theme.key));

  const emerging = latestThemes.filter(

    (theme) => !recurring.some((item) => item.key === theme.key)

  );

  const repeated = uniqueThemeList([

    ...recurring,

    ...historyThemes.filter((theme) => latestKeys.has(theme.key)),

  ]);

  return {

    recurring: repeated.slice(0, 3),

    emerging: emerging.slice(0, 3),

  };

}

function buildNarrative({

  readings,

  palm,

  tarot,

  historyThemes,

  latestThemes,

  palmThemes,

  tarotThemes,

}) {

  const latestTwo = readings.slice(0, 2);

  const previousReadings = readings.slice(2);

  const previousThemes = themesFromRecent(previousReadings);

  const latestKeys = new Set(latestThemes.map((theme) => theme.key));

  const previousKeys = new Set(previousThemes.map((theme) => theme.key));

  const recurring = historyThemes.filter((theme) => theme.historyScore >= 1.45);

  const emerging = latestThemes.filter((theme) => !previousKeys.has(theme.key));

  const fading = previousThemes.filter((theme) => !latestKeys.has(theme.key));

  const overlap = uniqueThemeList([

    ...palmThemes.filter((theme) => tarotThemes.some((item) => item.key === theme.key)),

  ]);

  let lead = "";

  if (!palm || !tarot) {

    lead = palm

      ? "Your current guidance is anchored in the Palm reading. A Tarot reading will add the present-moment layer needed for a fuller response."

      : tarot

        ? "Your current guidance is anchored in the Tarot reading. A Palm reading will add the longer-pattern layer needed for a fuller response."

        : "Your guidance story begins when both a Palm and Tarot reading are available."

    ;

  } else if (overlap[0]) {

    lead = `Your Palm and Tarot readings are meeting around ${overlap[0].short}. That shared theme is more useful as a direction for reflection than as a prediction.`;

  } else if (emerging[0] && recurring[0]) {

    lead = `The older pattern around ${recurring[0].short} is still present, while ${emerging[0].short} is becoming more visible. The story is expanding rather than simply replacing one theme with another.`;

  } else if (emerging[0]) {

    lead = `A newer layer around ${emerging[0].short} is entering the reading history. It is worth exploring without assuming that it cancels the themes that came before it.`;

  } else if (recurring[0]) {

    lead = `Your saved readings continue to return to ${recurring[0].short}. Repetition here is best treated as a reflective pattern to examine more closely, not as a fixed outcome.`;

  } else {

    lead = "Your recent readings offer a mixed set of signals. The most useful response is to notice which theme becomes clearer through your own decisions and experience.";

  }

  const continuity = recurring[0]

    ? `The strongest continuing thread is ${recurring[0].short}. It appears across your saved reading history, so this is the part of the story worth keeping in view while you respond to newer signals.`

    : latestTwo.length > 1

      ? "There is not yet a strong repeated theme across the saved history. For now, treat the latest pattern as something to observe rather than something to lock into."

      : "This is an early reading pattern, so the most useful guidance is to observe what resonates before treating anything as recurring."

  ;

  const emergingText = emerging[0]

    ? `${emerging[0].label} is more visible in the latest reading pattern than in the earlier history. Give it room to be explored, but let your real-world choices determine whether it becomes a lasting priority.`

    : fading[0]

      ? `${fading[0].label} was more visible earlier and is quieter in the newest pattern. That does not mean it has disappeared; it may simply be receiving less attention right now.`

      : "The latest readings do not show a sharply separate new theme. The change is more about emphasis than a complete shift in direction."

  ;

  const connectionText = overlap[0]

    ? `Both sources currently point toward ${overlap[0].short}. Use the Palm reading as the longer reflective backdrop and the Tarot reading as the immediate prompt for what deserves attention now.`

    : palmThemes[0] && tarotThemes[0]

      ? `The Palm pattern is strongest around ${palmThemes[0].short}, while Tarot is currently stronger around ${tarotThemes[0].short}. The useful question is how those two priorities can coexist rather than which one is supposed to win.`

      : "The two sources are not yet strong enough to create a clear overlap. More reading history will make the comparison more meaningful."

  ;

  return {

    lead,

    continuity,

    emergingText,

    connectionText,

    recurring,

    emerging,

    fading,

    overlap,

    latestTwo,

  };

}

function buildAction(primary, secondary, role, signature) {

  if (!primary) {

    return "Complete both a Palm and Tarot reading first; the next guidance cycle will use their combined history instead of a generic advice list.";

  }

  if (secondary && primary.key !== secondary.key) {

    const pair = PAIR_ACTIONS[pairKey(primary.key, secondary.key)];

    if (pair?.length) return pick(pair, `${signature}|${role}|pair`);

  }

  return pick(ACTION_VARIANTS[primary.key], `${signature}|${role}|single`);

}

function buildCards({

  readings,

  palm,

  tarot,

  historyThemes,

  latestThemes,

  palmThemes,

  tarotThemes,

  narrative,

}) {

  const primary = latestThemes[0] || historyThemes[0] || null;

  const secondary = latestThemes[1] || historyThemes[1] || null;

  const recurring = narrative.recurring[0] || historyThemes[0] || primary;

  const emerging = narrative.emerging[0] || latestThemes[0] || secondary || primary;

  const overlap = narrative.overlap[0] || null;

  const signature = [

    readings.slice(0, 8).map((reading) => `${reading.id || ""}:${reading.created_at || ""}:${reading.title || ""}`).join("|"),

    latestThemes.map((theme) => theme.key).join(","),

    historyThemes.map((theme) => theme.key).join(","),

  ].join("::");

  const roleCards = [];

  roleCards.push({

    ...ROLE_CONFIG[0],

    theme: recurring,

    title: recurring ? `Keep ${recurring.short}` : "Keep observing",

    body: narrative.continuity,

    action: buildAction(recurring, secondary, "continuity", signature),

  });

  roleCards.push({

    ...ROLE_CONFIG[1],

    theme: emerging,

    title: emerging ? `Explore ${emerging.short}` : "Explore what is new",

    body: narrative.emergingText,

    action: buildAction(emerging, recurring, "emerging", signature),

  });

  roleCards.push({

    ...ROLE_CONFIG[2],

    theme: overlap || primary,

    title: overlap

      ? `Notice the ${overlap.short} signal`

      : primary

        ? `Hold ${primary.short} and ${secondary?.short || "the wider picture"}`

        : "Compare the two sources",

    body: narrative.connectionText,

    action: buildAction(overlap || primary, secondary, "connection", signature),

  });

  const responsePrimary = emerging || primary || recurring;

  roleCards.push({

    ...ROLE_CONFIG[3],

    theme: responsePrimary,

    title: responsePrimary ? `Respond to ${responsePrimary.short}` : "Respond deliberately",

    body: responsePrimary

      ? `Do not turn the reading into a prediction. Turn it into a question you can answer through your own behavior: what would a thoughtful response to ${responsePrimary.short} look like in your actual week?`

      : "Use the next reading as a prompt for one real-world reflection rather than a fixed conclusion.",

    action: buildAction(responsePrimary, primary, "response", signature),

  });

  const nextPrimary = secondary || primary || recurring;

  roleCards.push({

    ...ROLE_CONFIG[4],

    theme: nextPrimary,

    title: nextPrimary ? `Carry ${nextPrimary.short} forward` : "Carry the question forward",

    body: nextPrimary

      ? `Let ${nextPrimary.short} stay open long enough to produce evidence. Revisit this after your next meaningful decision instead of forcing an immediate answer.`

      : "Keep the current question open and use your next meaningful decision as evidence about what matters most.",

    action: buildAction(nextPrimary, emerging, "next", signature),

  });

  return roleCards.map((card, index) => ({

    ...card,

    number: String(index + 1).padStart(2, "0"),

    roleLabel: ROLE_LABELS[card.key],

    source:

      index === 0

        ? "History"

        : index === 1

          ? "Latest shift"

          : index === 2

            ? "Palm + Tarot"

            : index === 3

              ? "Response"

              : "Next cycle",

  }));

}

function buildGuidance(readings) {

  const sorted = sortNewest(readings);

  const palm = latestByType(sorted, "palm");

  const tarot = latestByType(sorted, "tarot");

  const historyThemes = themeKeys(sorted);

  const latestSourceReadings = sorted.slice(0, 4);

  const latestThemes = uniqueThemeList([

    ...themesFromRecent(latestSourceReadings),

    ...themesForReading(palm),

    ...themesForReading(tarot),

  ]).slice(0, 5);

  const palmThemes = themesForReading(palm);

  const tarotThemes = themesForReading(tarot);

  const narrative = buildNarrative({

    readings: sorted,

    palm,

    tarot,

    historyThemes,

    latestThemes,

    palmThemes,

    tarotThemes,

  });

  const cards = buildCards({

    readings: sorted,

    palm,

    tarot,

    historyThemes,

    latestThemes,

    palmThemes,

    tarotThemes,

    narrative,

  });

  const palmSignal = extractSignalPhrase(palm);

  const tarotSignal = extractSignalPhrase(tarot);

  return {

    palm,

    tarot,

    readings: sorted,

    historyThemes,

    latestThemes,

    palmThemes,

    tarotThemes,

    narrative,

    cards,

    palmSignal,

    tarotSignal,

  };

}


function buildPersonalityModule(model) {
  const currentText = [readingText(model.palm), readingText(model.tarot)].filter(Boolean).join(" ");
  const allText = [currentText, ...model.readings.slice(0, 4).map(readingText)].join(" ");
  const themes = scoreThemeText(allText);
  const currentThemes = scoreThemeText(currentText);
  const signature = `${model.palm?.id || model.palm?.created_at || "no-palm"}|${model.tarot?.id || model.tarot?.created_at || "no-tarot"}|${currentText}`;
  const primary = currentThemes[0] || themes[0] || THEME_RULES[4];
  const secondary = currentThemes[1] || themes[1] || THEME_RULES[5];
  const choose = (items, salt) => pick(items, `${signature}|${salt}`);
  const score = (key, base = 58) => {
    const hit = themes.find((item) => item.key === key)?.score || 0;
    return Math.min(94, Math.max(34, base + hit * 7 + (hashString(`${signature}|${key}`) % 13) - 6));
  };
  const profile = choose([
    `A reflective ${primary.short}-focused profile: you may be working out what matters most before choosing your next step.`,
    `A growth-minded profile with attention on ${primary.short}; notice where your values and daily choices line up.`,
    `A connection between ${primary.short} and ${secondary.short} stands out in these readings. Use it as a prompt to understand your current priorities.`
  ], "profile");
  const strengths = [
    `Awareness: you are giving attention to ${primary.short}, which can help you make more deliberate choices.`,
    `Adaptability: the readings bring ${secondary.short} into view, inviting you to consider more than one way forward.`,
    choose([
      "Reflection: pausing to notice patterns can help you respond rather than react.",
      "Persistence: returning to a question can help you turn it into a clearer next step.",
      "Curiosity: being willing to explore a new angle can support learning."
    ], "strength")
  ];
  const weaknesses = [
    choose([
      `Possible blind spot: thinking about ${primary.short} for too long without testing one small action.`,
      `Possible blind spot: expecting complete certainty about ${primary.short} before moving forward.`,
      `Possible blind spot: letting ${primary.short} take up so much attention that other needs are missed.`
    ], "weakness-a"),
    choose([
      "Watch for reading a symbolic message as a fixed outcome instead of one perspective to reflect on.",
      "Watch for revisiting the same question without checking what real-life experience is showing you.",
      "Watch for being hard on yourself when progress is slower or less clear than expected."
    ], "weakness-b")
  ];
  const behavior = choose([
    `Your current reading language puts emphasis on ${primary.short}. Notice whether you respond by planning, talking it through, or delaying a decision.`,
    `The combination of ${primary.short} and ${secondary.short} suggests a useful behavior to observe: how you balance your own needs with outside expectations.`,
    `Across the selected reading themes, ${primary.short} is worth observing in everyday choices. Track what you do when the situation feels uncertain.`
  ], "behavior");
  const recommendations = [
    `Choose one small action connected to ${primary.short} and complete it within the next seven days.`,
    `Write down one strength you used recently, one pattern you want to adjust, and one practical step you will try next.`,
    choose([
      "Review the result after a week; keep what helped and change what did not.",
      "Ask someone you trust for specific feedback, then compare it with your own observations.",
      "Set one realistic boundary or priority and notice how it affects your energy and focus."
    ], "recommendation")
  ];
  return {
    profile,
    strengths,
    weaknesses,
    behavior,
    recommendations,
    meters: [
      { label: "Self-awareness", value: score("growth", 62) },
      { label: "Communication", value: score("relationships", 57) },
      { label: "Direction", value: score("career", 60) },
      { label: "Adaptability", value: score("change", 59) }
    ],
    readingCount: [model.palm, model.tarot].filter(Boolean).length,
    signature
  };
}

function SourceCard({ type, reading, signal }) {

  const isPalm = type === "palm";

  return (

    <div className="guidance-source-card">

      <div className="guidance-source-top">

        <span className="guidance-source-mark">

          {isPalm ? <Leaf size={16} /> : <Sparkles size={16} />}

        </span>

        <span className="guidance-source-type">{isPalm ? "PALM" : "TAROT"}</span>

      </div>

      <strong>{reading ? readingLabel(reading, `Latest ${type} reading`) : `No ${type} reading yet`}</strong>

      <span className="guidance-source-date">

        {reading

          ? new Date(reading.created_at).toLocaleString()

          : `Complete a ${type} reading to add this layer`}

      </span>

      {signal && <p>“{signal}”</p>}

    </div>

  );

}

function ThemeChip({ theme, emphasis = false }) {

  if (!theme) return null;

  return (

    <span className={`guidance-theme-chip ${emphasis ? "is-emphasis" : ""}`}>

      <span className="guidance-theme-dot" />

      {theme.label}

    </span>

  );

}

export function Guidance() {

  const [readings, setReadings] = useState([]);

  const [busy, setBusy] = useState(true);

  const [error, setError] = useState("");

  const [guideQuestion, setGuideQuestion] = useState("");

  const [guideMessages, setGuideMessages] = useState([

    { role: "assistant", content: "Hello! I’m here to help you reflect on your Palm and Tarot readings. Ask me about a theme you noticed, a question on your mind, or how a reading connects to your life." },

  ]);

  const [guideBusy, setGuideBusy] = useState(false);

  const [guideError, setGuideError] = useState("");

  async function loadGuidance(showLoading = true) {

    if (showLoading) setBusy(true);

    setError("");

    try {

      const response = await api.get("/api/readings/me");

      const items = Array.isArray(response.data)

        ? response.data

        : response.data?.items || [];

      setReadings(items);

    } catch (err) {

      if (showLoading) {

        setError(

          err?.response?.data?.detail ||

            "Personalized guidance could not be loaded right now."

        );

      }

    } finally {

      if (showLoading) setBusy(false);

    }

  }

  async function askGuide(event) {

    event?.preventDefault();

    const question = guideQuestion.trim();

    if (!question || guideBusy) return;

    const nextMessages = [...guideMessages, { role: "user", content: question }];

    setGuideMessages(nextMessages);

    setGuideQuestion("");

    setGuideBusy(true);

    setGuideError("");

    try {

      const response = await api.post("/api/guidance/ask", {

        question,

        conversation: nextMessages.slice(-12).map(({ role, content }) => ({ role, content })),

        reading_context: readings.slice(0, 8).map((reading) => ({

          reading_type: reading.reading_type,

          title: reading.title,

          created_at: reading.created_at,

          input_summary: reading.input_summary,

          result_text: reading.result_text,

          palm_insights: reading.palm_insights,

          detected_lines: reading.detected_lines,

        })),

      });

      const answer = response.data?.answer || response.data?.reply || response.data?.message ||

        "I couldn’t form a reply just now. Please try asking in a different way.";

      setGuideMessages((current) => [...current, { role: "assistant", content: answer }]);

    } catch (err) {

      setGuideError(

        err?.response?.data?.detail ||

          "The Ask Your Guide service is not connected yet. The chat interface is ready, but the backend needs the /api/guidance/ask endpoint to generate replies."

      );

    } finally {

      setGuideBusy(false);

    }

  }

  useEffect(() => {

    loadGuidance(true);

    // Refresh the saved-reading pattern when the user returns from Palm/Tarot,

    // and periodically while this page stays open.

    const refreshQuietly = () => {

      if (document.visibilityState === "visible") loadGuidance(false);

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

  const model = useMemo(() => buildGuidance(readings), [readings]);

  const personality = useMemo(() => buildPersonalityModule(model), [model]);

  if (busy) {

    return (

      <section className="guidance-page">

        <div className="guidance-loading">

          <RefreshCw size={18} className="guidance-spin" />

          Reading your saved Palm + Tarot pattern...

        </div>

      </section>

    );

  }

  return (

    <>

      <style>{`

        .guidance-page{

          width:min(1160px,calc(100% - 34px));

          margin:28px auto 48px;

          color:#493226;

        }

        .guidance-hero{

          position:relative;

          overflow:hidden;

          padding:38px 42px 34px;

          border:1px solid #d9c0a0;

          border-radius:26px;

          background:

            radial-gradient(circle at 92% 12%,rgba(184,139,95,.18),transparent 29%),

            radial-gradient(circle at 8% 92%,rgba(213,174,130,.12),transparent 25%),

            linear-gradient(135deg,#fffdf8 0%,#f6ead9 100%);

          box-shadow:0 18px 48px rgba(83,54,35,.08);

        }

        .guidance-hero:after{

          content:"";

          position:absolute;

          right:-80px;

          bottom:-110px;

          width:250px;

          height:250px;

          border:1px solid rgba(157,111,72,.12);

          border-radius:50%;

          box-shadow:0 0 0 32px rgba(157,111,72,.035),0 0 0 64px rgba(157,111,72,.025);

          pointer-events:none;

        }

        .guidance-eyebrow{

          display:inline-flex;

          align-items:center;

          gap:8px;

          color:#8b674b;

          font-size:10px;

          font-weight:900;

          letter-spacing:.17em;

          text-transform:uppercase;

        }

        .guidance-eyebrow span{

          width:22px;

          height:1px;

          background:#ad8058;

        }

        .guidance-hero h1{

          position:relative;

          z-index:1;

          margin:12px 0 8px;

          color:#3f2a20;

          font-family:Georgia,serif;

          font-size:38px;

          font-weight:500;

          letter-spacing:-.025em;

        }

        .guidance-hero-intro{

          position:relative;

          z-index:1;

          max-width:790px;

          margin:0;

          color:#745b48;

          font-size:13px;

          line-height:1.8;

        }

        .guidance-source-grid{

          position:relative;

          z-index:1;

          display:grid;

          grid-template-columns:1fr 1fr;

          gap:12px;

          margin-top:24px;

        }

        .guidance-source-card{

          min-width:0;

          padding:15px 16px;

          border:1px solid #dec8ac;

          border-radius:16px;

          background:rgba(255,253,248,.78);

          backdrop-filter:blur(5px);

        }

        .guidance-source-top{

          display:flex;

          align-items:center;

          gap:8px;

          margin-bottom:10px;

        }

        .guidance-source-mark{

          display:flex;

          align-items:center;

          justify-content:center;

          width:31px;

          height:31px;

          border-radius:9px;

          background:#ead7bd;

          color:#704b32;

        }

        .guidance-source-type{

          color:#9a7354;

          font-size:9px;

          font-weight:900;

          letter-spacing:.14em;

        }

        .guidance-source-card strong{

          display:block;

          overflow:hidden;

          color:#503528;

          font-size:12px;

          text-overflow:ellipsis;

          white-space:nowrap;

        }

        .guidance-source-date{

          display:block;

          margin-top:4px;

          color:#a0836b;

          font-size:9px;

        }

        .guidance-source-card p{

          margin:11px 0 0;

          padding-top:10px;

          border-top:1px solid #eadbc9;

          color:#725744;

          font-family:Georgia,serif;

          font-size:11px;

          line-height:1.65;

        }

        .guidance-story{

          position:relative;

          z-index:1;

          display:grid;

          grid-template-columns:minmax(0,1fr) auto;

          gap:22px;

          align-items:center;

          margin-top:16px;

          padding:18px 20px;

          border-left:3px solid #a97850;

          border-radius:0 16px 16px 0;

          background:#fffaf2;

        }

        .guidance-story-label{

          margin-bottom:6px;

          color:#98704f;

          font-size:9px;

          font-weight:900;

          letter-spacing:.13em;

          text-transform:uppercase;

        }

        .guidance-story p{

          margin:0;

          color:#50362a;

          font-family:Georgia,serif;

          font-size:16px;

          line-height:1.6;

        }

        .guidance-story-count{

          min-width:84px;

          padding:9px 11px;

          border:1px solid #dec8ac;

          border-radius:12px;

          background:#fffdf9;

          text-align:center;

        }

        .guidance-story-count strong{

          display:block;

          color:#60432f;

          font-family:Georgia,serif;

          font-size:21px;

          font-weight:500;

        }

        .guidance-story-count span{

          display:block;

          margin-top:2px;

          color:#a08269;

          font-size:8px;

          font-weight:800;

          letter-spacing:.08em;

          text-transform:uppercase;

        }

        .guidance-error{

          margin-top:24px;

          padding:28px;

          border:1px solid #dfc9ae;

          border-radius:18px;

          background:#fffdf9;

          color:#735744;

        }

        .guidance-error strong{

          display:block;

          color:#4c3225;

          font-family:Georgia,serif;

          font-size:19px;

        }

        .guidance-error p{

          margin:8px 0 16px;

          font-size:12px;

          line-height:1.7;

        }

        .guidance-section{

          margin-top:28px;

        }

        .guidance-section-head{

          display:flex;

          align-items:end;

          justify-content:space-between;

          gap:20px;

          margin-bottom:14px;

        }

        .guidance-section-head h2{

          margin:0;

          color:#432d21;

          font-family:Georgia,serif;

          font-size:23px;

          font-weight:700;

        }

        .guidance-section .guidance-action-card h3,

        .guidance-section .guidance-response-card h3,

        .guidance-section h3{

          font-weight:700 !important;

        }

        .guidance-section-head p{

          max-width:620px;

          margin:5px 0 0;

          color:#8a6d56;

          font-size:11px;

          line-height:1.6;

        }

        .guidance-history-strip{

          display:flex;

          align-items:center;

          flex-wrap:wrap;

          gap:8px;

          margin-bottom:14px;

        }

        .guidance-history-label{

          color:#94735a;

          font-size:9px;

          font-weight:900;

          letter-spacing:.12em;

          text-transform:uppercase;

          margin-right:2px;

        }

        .guidance-theme-chip{

          display:inline-flex;

          align-items:center;

          gap:6px;

          padding:7px 10px;

          border:1px solid #dfcbb2;

          border-radius:999px;

          background:#fbf3e8;

          color:#72513b;

          font-size:9px;

          font-weight:800;

        }

        .guidance-theme-chip.is-emphasis{

          border-color:#c9a37d;

          background:#f5e5d1;

        }

        .guidance-theme-dot{

          width:5px;

          height:5px;

          border-radius:50%;

          background:#a97850;

        }

        .guidance-grid{

          display:grid;

          grid-template-columns:repeat(2,minmax(0,1fr));

          gap:14px;

        }

        .guidance-card{

          position:relative;

          overflow:hidden;

          min-height:270px;

          padding:23px 23px 20px;

          border:1px solid #ddc7aa;

          border-radius:19px;

          background:#fffdf9;

          box-shadow:0 8px 25px rgba(83,54,35,.045);

          transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease;

        }

        .guidance-card:nth-child(3){

          grid-column:1 / -1;

          min-height:238px;

          background:linear-gradient(135deg,#fffdf9 0%,#fbf1e3 100%);

        }

        .guidance-card:hover{

          transform:translateY(-2px);

          border-color:#cba57b;

          box-shadow:0 14px 31px rgba(83,54,35,.085);

        }

        .guidance-card:before{

          content:"";

          position:absolute;

          right:-44px;

          top:-44px;

          width:118px;

          height:118px;

          border:1px solid rgba(169,120,80,.1);

          border-radius:50%;

        }

        .guidance-card-top{

          display:flex;

          align-items:center;

          justify-content:space-between;

          gap:12px;

        }

        .guidance-card-meta{

          display:flex;

          align-items:center;

          gap:9px;

        }

        .guidance-card-number{

          color:#b28a66;

          font-size:9px;

          font-weight:900;

          letter-spacing:.12em;

        }

        .guidance-card-source{

          padding:5px 8px;

          border:1px solid #e5d4be;

          border-radius:999px;

          color:#9a785d;

          background:#fdf7ef;

          font-size:8px;

          font-weight:900;

          letter-spacing:.07em;

          text-transform:uppercase;

        }

        .guidance-card-icon{

          display:flex;

          align-items:center;

          justify-content:center;

          width:38px;

          height:38px;

          border-radius:11px;

          background:#f0e1ce;

          color:#775036;

        }

        .guidance-card h3{

          max-width:650px;

          margin:15px 0 8px;

          color:#493025;

          font-family:Georgia,serif;

          font-size:19px;

          font-weight:500;

          letter-spacing:-.01em;

        }

        .guidance-card p{

          max-width:760px;

          margin:0;

          color:#6f5644;

          font-size:12px;

          line-height:1.78;

        }

        .guidance-action{

          display:flex;

          align-items:flex-start;

          gap:9px;

          margin-top:17px;

          padding:13px 14px;

          border:1px solid #eadac6;

          border-radius:12px;

          background:#fbf4e9;

          color:#6f4f38;

          font-size:11px;

          line-height:1.65;

        }

        .guidance-action-mark{

          display:flex;

          align-items:center;

          justify-content:center;

          flex:0 0 23px;

          width:23px;

          height:23px;

          margin-top:1px;

          border-radius:7px;

          background:#ead7bd;

          color:#724b31;

        }

        .guidance-action strong{

          display:block;

          margin-bottom:2px;

          color:#503528;

          font-size:10px;

        }

        .guidance-role{

          margin-top:15px;

          color:#a08066;

          font-size:9px;

          font-weight:800;

          letter-spacing:.08em;

          text-transform:uppercase;

        }

        .guidance-role strong{

          color:#7c5c45;

        }

        .guidance-insight-row{

          display:grid;

          grid-template-columns:1fr 1fr;

          gap:14px;

          margin-top:24px;

        }

        .guidance-mini-panel{

          padding:19px 20px;

          border:1px solid #dfccb4;

          border-radius:17px;

          background:#fffdf9;

        }

        .guidance-mini-panel-label{

          display:flex;

          align-items:center;

          gap:7px;

          margin-bottom:8px;

          color:#957154;

          font-size:9px;

          font-weight:900;

          letter-spacing:.12em;

          text-transform:uppercase;

        }

        .guidance-mini-panel p{

          margin:0;

          color:#6d5442;

          font-size:11px;

          line-height:1.7;

        }

        .guidance-mini-panel p em{

          color:#52372a;

          font-family:Georgia,serif;

        }

        .guidance-footer{

          display:flex;

          align-items:center;

          justify-content:space-between;

          gap:18px;

          margin-top:24px;

          padding:17px 19px;

          border:1px solid #e1ccb1;

          border-radius:15px;

          background:#f9eee0;

        }

        .guidance-footer p{

          margin:0;

          color:#80634e;

          font-size:10px;

          line-height:1.6;

        }

        .guidance-link{

          display:inline-flex;

          align-items:center;

          justify-content:center;

          gap:7px;

          flex:none;

          padding:10px 13px;

          border:1px solid #bd936a;

          border-radius:10px;

          background:#fffaf3;

          color:#67462f;

          font-size:11px;

          font-weight:800;

          text-decoration:none;

          cursor:pointer;

        }

        .guidance-link:hover{background:#f1dfc8;}

        .guidance-ask-guide{margin-top:24px;padding:24px;border:1px solid #dcc4a5;border-radius:20px;background:linear-gradient(135deg,#fffdf8 0%,#f7ecdd 100%);box-shadow:0 12px 32px rgba(83,54,35,.055);}

        .guidance-ask-head{display:flex;align-items:flex-start;gap:12px;margin-bottom:18px;}

        .guidance-ask-icon{display:grid;place-items:center;flex:0 0 auto;width:42px;height:42px;border-radius:13px;background:#ead7bd;color:#704b32;}

        .guidance-ask-head h2{margin:0;color:#432d21;font-family:Georgia,serif;font-size:25px;font-weight:700;}

        .guidance-ask-head p{margin:6px 0 0;color:#80644d;font-size:12px;line-height:1.7;}

        .guidance-chat-window{display:grid;gap:12px;max-height:420px;overflow-y:auto;padding:15px;border:1px solid #e7d6c1;border-radius:15px;background:rgba(255,250,242,.78);}

        .guidance-chat-message{width:fit-content;max-width:min(88%,760px);padding:12px 15px;border:1px solid #e5d2b9;border-radius:14px 14px 14px 4px;background:#fffdf9;color:#604633;font-size:13px;line-height:1.75;overflow-wrap:anywhere;}

        .guidance-chat-message p{margin:0 0 12px;line-height:1.8;}

        .guidance-chat-message p:last-child{margin-bottom:0;}

        .guidance-chat-message h1,.guidance-chat-message h2,.guidance-chat-message h3{margin:18px 0 9px;color:#563a2a;font-family:Georgia,serif;font-weight:700;line-height:1.4;}

        .guidance-chat-message h1{font-size:23px;}

        .guidance-chat-message h2{font-size:20px;}

        .guidance-chat-message h3{font-size:17px;}

        .guidance-chat-message ul,.guidance-chat-message ol{margin:8px 0 14px;padding-left:24px;line-height:1.8;}

        .guidance-chat-message li{margin-bottom:6px;}

        .guidance-chat-message strong{color:#563a2a;font-weight:750;}

        .guidance-chat-message blockquote{margin:12px 0;padding:10px 15px;border-left:3px solid #b68b65;background:#f7ecdd;border-radius:0 8px 8px 0;}

        .guidance-chat-message a{color:#805637;text-decoration:underline;}

        .guidance-chat-message.is-user{justify-self:end;border-color:#d7b998;border-radius:14px 14px 4px 14px;background:#ead8c1;color:#4e3424;}

        .guidance-chat-message.is-assistant{justify-self:start;}

        .guidance-chat-status{color:#96765a;font-size:11px;padding:2px 4px;}

        .guidance-chat-error{margin-top:10px;padding:11px 13px;border:1px solid #e5c4b8;border-radius:10px;background:#fff3ee;color:#8a4c3b;font-size:12px;line-height:1.6;}

        .guidance-chat-form{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;margin-top:13px;}

        .guidance-chat-input{width:100%;min-height:48px;resize:vertical;padding:13px 14px;border:1px solid #d9c0a0;border-radius:12px;outline:none;background:#fffdf9;color:#493226;font:inherit;font-size:13px;}

        .guidance-chat-input:focus{border-color:#a97850;box-shadow:0 0 0 3px rgba(169,120,80,.13);}

        .guidance-chat-send{display:inline-flex;align-items:center;justify-content:center;gap:8px;align-self:stretch;padding:0 18px;border:1px solid #68462f;border-radius:12px;background:#68462f;color:#fffaf2;font-size:12px;font-weight:800;cursor:pointer;}

        .guidance-chat-send:disabled{opacity:.55;cursor:wait;}

        .guidance-chat-note{margin:10px 0 0;color:#987b61;font-size:10px;line-height:1.6;}

        .guidance-loading{

          min-height:420px;

          display:flex;

          align-items:center;

          justify-content:center;

          gap:9px;

          color:#765943;

          font-size:13px;

        }

        .guidance-spin{animation:guidanceSpin 1s linear infinite;}

        @keyframes guidanceSpin{to{transform:rotate(360deg);}}

        @media(max-width:850px){

          .guidance-grid{grid-template-columns:1fr;}

          .guidance-card:nth-child(3){grid-column:auto;}

          .guidance-insight-row{grid-template-columns:1fr;}

        }

        @media(max-width:760px){

          .guidance-page{width:min(100% - 20px,1160px);margin-top:16px;}

          .guidance-hero{padding:27px 21px;}

          .guidance-hero h1{font-size:29px;}

          .guidance-source-grid{grid-template-columns:1fr;}

          .guidance-story{grid-template-columns:1fr;}

          .guidance-story-count{display:none;}

          .guidance-footer{align-items:flex-start;flex-direction:column;}

          .guidance-ask-guide{padding:17px;}

          .guidance-chat-form{grid-template-columns:1fr;}

          .guidance-chat-send{min-height:46px;}

          .guidance-chat-message{max-width:96%;}

        }

        .personality-module{margin-top:28px;padding:25px;border:1px solid #dcc4a5;border-radius:22px;background:linear-gradient(135deg,#fffdf8 0%,#f7ecdd 100%);box-shadow:0 12px 32px rgba(83,54,35,.05)}
        .personality-head{display:flex;align-items:flex-start;gap:13px;margin-bottom:19px}
        .personality-head-icon{display:grid;place-items:center;flex:0 0 44px;height:44px;border-radius:14px;background:#ead7bd;color:#704b32}
        .personality-head h2{margin:0;color:#432d21;font-family:Georgia,serif;font-size:25px}
        .personality-head p{margin:6px 0 0;color:#80644d;font-size:12px;line-height:1.7}
        .personality-layout{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:14px}
        .personality-panel{padding:18px;border:1px solid #e2ceb6;border-radius:16px;background:rgba(255,253,249,.86);min-width:0}
        .personality-panel h3{display:flex;align-items:center;gap:8px;margin:0 0 10px;color:#52372a;font-family:Georgia,serif;font-size:17px}
        .personality-panel p{margin:0;color:#725744;font-size:12px;line-height:1.75}
        .personality-list{display:grid;gap:10px;margin:0;padding:0;list-style:none}
        .personality-list li{display:flex;gap:9px;color:#725744;font-size:12px;line-height:1.65}
        .personality-bullet{display:grid;place-items:center;flex:0 0 22px;height:22px;border-radius:7px;background:#f0e1ce;color:#775036;font-weight:800;font-size:10px}
        .personality-meters{display:grid;gap:14px;margin-top:14px}
        .personality-meter-top{display:flex;justify-content:space-between;gap:10px;margin-bottom:6px;color:#72513b;font-size:11px;font-weight:750}
        .personality-meter-track{height:8px;overflow:hidden;border-radius:99px;background:#eadbc9}
        .personality-meter-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#b88d65,#765038);transition:width .35s ease}
        .personality-recommendations{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:14px}
        .personality-step{padding:14px;border:1px solid #e2ceb6;border-radius:13px;background:#fbf4e9;color:#6f4f38;font-size:11px;line-height:1.7}
        .personality-step strong{display:block;margin-bottom:5px;color:#503528;font-size:10px;text-transform:uppercase;letter-spacing:.06em}
        .personality-note{margin:14px 0 0;color:#987b61;font-size:10px;line-height:1.6}
        @media(max-width:760px){.personality-layout{grid-template-columns:1fr}.personality-recommendations{grid-template-columns:1fr}.personality-module{padding:17px}.personality-head h2{font-size:22px}}

      `}</style>

      <main className="guidance-page">

        <section className="guidance-hero">

          <div className="guidance-eyebrow">

            <span />

            READING → RESPONSE

          </div>

          <h1>Personal guidance that evolves with you</h1>

          <p className="guidance-hero-intro">

            This is not a second Recommendations page. Guidance compares your

            saved Palm and Tarot readings, keeps recurring patterns in view,

            notices what is newly entering the story, and turns that change

            into a response that can evolve after every new reading.

          </p>

          <div className="guidance-source-grid">

            <SourceCard type="palm" reading={model.palm} signal={model.palmSignal} />

            <SourceCard type="tarot" reading={model.tarot} signal={model.tarotSignal} />

          </div>

          <div className="guidance-story">

            <div>

              <div className="guidance-story-label">Current reading story</div>

              <p>{model.narrative.lead}</p>

            </div>

            <div className="guidance-story-count">

              <strong>{model.readings.length}</strong>

              <span>saved readings</span>

            </div>

          </div>

        </section>

        {error ? (

          <section className="guidance-error">

            <strong>Guidance is temporarily unavailable</strong>

            <p>{error}</p>

            <button type="button" className="guidance-link" onClick={loadGuidance}>

              <RefreshCw size={14} />

              Try again

            </button>

          </section>

        ) : (

          <>

            <section className="personality-module" aria-labelledby="personality-title">
              <div className="personality-head">
                <span className="personality-head-icon"><UserRound size={21} /></span>
                <div>
                  <h2 id="personality-title">Personality Intelligence</h2>
                  <p>A simple, reading-linked reflection on your possible strengths, blind spots, behavior, and next steps. It refreshes from your newest saved Palm and Tarot readings.</p>
                </div>
              </div>
              <div className="personality-layout">
                <article className="personality-panel">
                  <h3><Brain size={17} /> Personality profile</h3>
                  <p>{personality.profile}</p>
                  <div className="personality-meters" aria-label="Reflective self-check">
                    {personality.meters.map((meter) => (
                      <div key={meter.label}>
                        <div className="personality-meter-top"><span>{meter.label}</span><span>{meter.value}%</span></div>
                        <div className="personality-meter-track" role="img" aria-label={`${meter.label}: reflective indicator ${meter.value} percent`}>
                          <div className="personality-meter-fill" style={{ width: `${meter.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
                <article className="personality-panel">
                  <h3><ShieldCheck size={17} /> Strength analysis</h3>
                  <ul className="personality-list">
                    {personality.strengths.map((item, index) => <li key={index}><span className="personality-bullet">+</span><span>{item}</span></li>)}
                  </ul>
                </article>
                <article className="personality-panel">
                  <h3><Activity size={17} /> Weakness analysis</h3>
                  <ul className="personality-list">
                    {personality.weaknesses.map((item, index) => <li key={index}><span className="personality-bullet">!</span><span>{item}</span></li>)}
                  </ul>
                </article>
                <article className="personality-panel">
                  <h3><Compass size={17} /> Behavioral insights</h3>
                  <p>{personality.behavior}</p>
                </article>
              </div>
              <div className="personality-panel" style={{ marginTop: 14 }}>
                <h3><Target size={17} /> Personal development recommendations</h3>
                <div className="personality-recommendations">
                  {personality.recommendations.map((item, index) => (
                    <div className="personality-step" key={index}><strong>Step {index + 1}</strong>{item}</div>
                  ))}
                </div>
              </div>
              <p className="personality-note">The meters are illustrative reflection prompts, not psychological test scores or clinical assessments. Palmistry and Tarot are interpretive tools, not scientifically validated personality tests or predictions.</p>
            </section>

            <section className="guidance-section">

              <div className="guidance-section-head">

                <div>

                  <h2>Your evolving response</h2>

                  <p>

                    Five different roles keep this guidance interpretive rather

                    than turning it into another generic list of recommendations.

                  </p>

                </div>

              </div>

              {model.historyThemes.length > 0 && (

                <div className="guidance-history-strip">

                  <span className="guidance-history-label">Patterns in your history</span>

                  {model.historyThemes.slice(0, 5).map((theme, index) => (

                    <ThemeChip key={theme.key} theme={theme} emphasis={index === 0} />

                  ))}

                </div>

              )}

              <div className="guidance-grid">

                {model.cards.map((item) => {

                  const Icon = item.icon;

                  return (

                    <article className="guidance-card" key={item.key}>

                      <div className="guidance-card-top">

                        <div className="guidance-card-meta">

                          <span className="guidance-card-number">{item.number}</span>

                          <span className="guidance-card-source">{item.source}</span>

                        </div>

                        <span className="guidance-card-icon">

                          <Icon size={18} />

                        </span>

                      </div>

                      <h3>{item.title}</h3>

                      <p>{item.body}</p>

                      <div className="guidance-action">

                        <span className="guidance-action-mark">

                          <ArrowUpRight size={13} />

                        </span>

                        <div>

                          <strong>Suggested response</strong>

                          {item.action}

                        </div>

                      </div>

                      <div className="guidance-role">

                        Role · <strong>{item.roleLabel}</strong>

                      </div>

                    </article>

                  );

                })}

              </div>

            </section>

            <section className="guidance-ask-guide" aria-labelledby="ask-guide-title">

              <div className="guidance-ask-head">

                <span className="guidance-ask-icon"><MessageCircle size={20} /></span>

                <div>

                  <h2 id="ask-guide-title">Ask Your Guide</h2>

                  <p>Ask a follow-up question and explore it alongside your saved Palm and Tarot readings.</p>

                </div>

              </div>

              <div className="guidance-chat-window" aria-live="polite">

                {guideMessages.map((message, index) => (

                  <div className={`guidance-chat-message ${message.role === "user" ? "is-user" : "is-assistant"}`} key={`${message.role}-${index}`}>

                    {message.role === "assistant" ? (

                      <ReactMarkdown remarkPlugins={[remarkGfm]}>

                        {message.content}

                      </ReactMarkdown>

                    ) : (

                      message.content

                    )}

                  </div>

                ))}

                {guideBusy && <div className="guidance-chat-status">Your guide is preparing a reply…</div>}

              </div>

              {guideError && <div className="guidance-chat-error" role="alert">{guideError}</div>}

              <form className="guidance-chat-form" onSubmit={askGuide}>

                <textarea

                  className="guidance-chat-input"

                  value={guideQuestion}

                  onChange={(event) => setGuideQuestion(event.target.value)}

                  placeholder="Ask about career, relationships, personal growth, or a reading..."

                  aria-label="Ask your guide a question"

                  rows={2}

                  maxLength={2000}

                  required

                />

                <button className="guidance-chat-send" type="submit" disabled={guideBusy || !guideQuestion.trim()}>

                  <Send size={15} /> {guideBusy ? "Replying…" : "Ask guide"}

                </button>

              </form>

              <p className="guidance-chat-note">Guidance is for reflection, not guaranteed predictions or professional medical, legal, or financial advice.</p>

            </section>

            <section className="guidance-insight-row">

              <div className="guidance-mini-panel">

                <div className="guidance-mini-panel-label">

                  <Leaf size={13} />

                  Palm perspective

                </div>

                <p>

                  {model.palm

                    ? model.palmSignal

                      ? <>The latest Palm reading adds this signal: <em>{model.palmSignal}</em></>

                      : "Your Palm reading supplies the longer-pattern layer used in the guidance synthesis."

                    : "Add a Palm reading to introduce the longer-pattern layer."}

                </p>

              </div>

              <div className="guidance-mini-panel">

                <div className="guidance-mini-panel-label">

                  <Sparkles size={13} />

                  Tarot perspective

                </div>

                <p>

                  {model.tarot

                    ? model.tarotSignal

                      ? <>The latest Tarot reading adds this signal: <em>{model.tarotSignal}</em></>

                      : "Your Tarot reading supplies the current prompt used in the guidance synthesis."

                    : "Add a Tarot reading to introduce the current-moment layer."}

                </p>

              </div>

            </section>

            {(model.narrative.emerging.length > 0 || model.narrative.fading.length > 0) && (

              <section className="guidance-section">

                <div className="guidance-section-head">

                  <div>

                    <h2>What changed in the story</h2>

                    <p>

                      This comparison is what makes a new reading matter. A new

                      theme can be added to the story without erasing what came before.

                    </p>

                  </div>

                </div>

                <div className="guidance-history-strip">

                  {model.narrative.emerging.map((theme) => (

                    <ThemeChip key={`new-${theme.key}`} theme={theme} emphasis />

                  ))}

                  {model.narrative.fading.map((theme) => (

                    <ThemeChip key={`quiet-${theme.key}`} theme={theme} />

                  ))}

                </div>

              </section>

            )}

            <div className="guidance-footer">

              <p>

                Guidance is reflective and supportive. Palmistry and Tarot are

                not scientifically validated methods of prediction and should

                not replace professional, medical, financial or legal advice.

              </p>

              <Link className="guidance-link" to="/profile">

                Update my profile <ArrowRight size={14} />

              </Link>

            </div>

          </>

        )}

      </main>

    </>

  );

}
