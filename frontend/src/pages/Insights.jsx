import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Heart,
  Lightbulb,
  RefreshCw,
  Sparkles,
  UserRound,
  WalletCards,
  Activity,
  Leaf,
} from "lucide-react";
import api from "../api/client";

/*
  INSIGHTS PAGE
  ============================================================
  The Insight Categories are intentionally based on the project
  architecture:

    1. Personality
    2. Relationships
    3. Career
    4. Finance
    5. Health & Wellness
    6. Personal Growth
    7. Life Opportunities

  IMPORTANT:
  - This page NEVER renders raw palm JSON.
  - It NEVER renders normalized_points.
  - It NEVER invents a Tarot card.
  - Palm insights come from the saved Palm AI analysis.
  - Tarot insights come from the saved Tarot AI reading.
  - Each category has a DIFFERENT Palm insight and a DIFFERENT
    Tarot insight.
  - If a reading does not contain a direct category message,
    the UI clearly says that instead of pretending it does.
*/

const CATEGORIES = [
  {
    key: "personality",
    label: "Personality",
    subtitle: "Who you are & how you approach life",
    icon: UserRound,
    colorClass: "personality",
    description:
      "A simple reflection on your natural style, thinking patterns, strengths and the way you tend to approach situations.",
    palmKeys: ["head"],
    palmFields: ["personality_reflection", "overall_reflection"],
    tarotSection: "overall",
    tarotWords: [
      "personality",
      "character",
      "nature",
      "temperament",
      "confidence",
      "intuition",
      "wisdom",
      "strength",
      "independent",
      "leader",
      "emotional",
      "practical",
      "creative",
    ],
    fallbackPalm:
      "Your Palm analysis does not contain a separate personality reflection yet.",
    fallbackTarot:
      "Your Tarot reading does not contain a separate personality message yet.",
  },
  {
    key: "relationships",
    label: "Relationships",
    subtitle: "Love, connection & communication",
    icon: Heart,
    colorClass: "relationships",
    description:
      "A reflection on emotional connection, communication, loyalty and the way you approach close relationships.",
    palmKeys: ["heart"],
    palmFields: ["relationship_reflection"],
    tarotSection: "relationship",
    tarotWords: [
      "relationship",
      "love",
      "partner",
      "romance",
      "connection",
      "emotion",
      "trust",
      "communication",
      "commitment",
      "family",
      "friend",
      "heart",
    ],
    fallbackPalm:
      "Your latest Palm analysis does not contain a clear relationship reflection.",
    fallbackTarot:
      "Your latest Tarot reading does not contain a clear relationship reflection.",
  },
  {
    key: "career",
    label: "Career",
    subtitle: "Work, goals & professional direction",
    icon: BriefcaseBusiness,
    colorClass: "career",
    description:
      "A reflection on work, ambition, direction, persistence and the goals you are trying to move forward.",
    palmKeys: ["fate", "sun"],
    palmFields: ["career_reflection"],
    tarotSection: "career",
    tarotWords: [
      "career",
      "work",
      "job",
      "business",
      "professional",
      "goal",
      "success",
      "achievement",
      "leadership",
      "project",
      "study",
      "education",
      "ambition",
      "recognition",
      "direction",
      "stability",
    ],
    fallbackPalm:
      "Your Palm analysis does not contain a separate career reflection yet.",
    fallbackTarot:
      "Your Tarot reading does not contain a separate career reflection yet.",
  },
  {
    key: "finance",
    label: "Finance",
    subtitle: "Money, resources & material priorities",
    icon: WalletCards,
    colorClass: "finance",
    description:
      "A symbolic reflection on stability, resources, practical priorities and material decisions. It is not financial advice.",
    palmKeys: ["fate", "sun"],
    palmFields: ["career_reflection", "overall_reflection"],
    tarotSection: "opportunities",
    tarotWords: [
      "money",
      "finance",
      "financial",
      "wealth",
      "income",
      "saving",
      "investment",
      "budget",
      "resources",
      "security",
      "abundance",
      "prosperity",
      "material",
      "pentacles",
      "property",
    ],
    fallbackPalm:
      "Palmistry does not provide a direct financial prediction here. Your Fate Line is traditionally associated with work, direction and goals rather than guaranteed money.",
    fallbackTarot:
      "Your Tarot reading does not contain a direct finance section. The Opportunities section can be read as a general reflection on practical priorities, not financial advice.",
  },
  {
    key: "wellness",
    label: "Health & Wellness",
    subtitle: "Balance, rest & self-care",
    icon: Activity,
    colorClass: "wellness",
    description:
      "A gentle reflection on balance, energy, rest and self-care themes. This section does not diagnose health conditions.",
    palmKeys: ["life"],
    palmFields: ["overall_reflection"],
    tarotSection: "mindful",
    tarotWords: [
      "health",
      "wellness",
      "wellbeing",
      "well-being",
      "energy",
      "rest",
      "sleep",
      "stress",
      "calm",
      "balance",
      "body",
      "mind",
      "peace",
      "recovery",
      "routine",
      "self-care",
      "vitality",
    ],
    fallbackPalm:
      "Your Palm reading offers symbolic reflection only. The Life Line is traditionally associated with vitality, but it does not measure lifespan or diagnose health.",
    fallbackTarot:
      "Your Tarot reading does not contain a dedicated health section. Its Things to be Mindful Of section is used here for gentle self-care reflection only.",
  },
  {
    key: "growth",
    label: "Personal Growth",
    subtitle: "Learning, confidence & self-development",
    icon: Leaf,
    colorClass: "growth",
    description:
      "A reflection on what you can learn, strengthen, change and practice as you continue developing.",
    palmKeys: ["head"],
    palmFields: ["growth_opportunities", "practical_next_steps"],
    tarotSection: "growth",
    tarotWords: [
      "growth",
      "personal",
      "development",
      "learning",
      "healing",
      "transformation",
      "wisdom",
      "reflection",
      "mindset",
      "potential",
      "intuition",
      "courage",
      "change",
      "discipline",
      "self-discovery",
      "self discovery",
    ],
    fallbackPalm:
      "Your Palm analysis does not contain separate growth recommendations yet.",
    fallbackTarot:
      "Your Tarot reading does not contain a separate personal-growth section yet.",
  },
  {
    key: "opportunities",
    label: "Life Opportunities",
    subtitle: "Possibilities, next steps & new directions",
    icon: Lightbulb,
    colorClass: "opportunities",
    description:
      "A reflection on possibilities, practical next steps and areas where you may want to stay open and curious.",
    palmKeys: ["fate", "sun", "life"],
    palmFields: ["growth_opportunities", "practical_next_steps", "closing_reflection"],
    tarotSection: "opportunities",
    tarotWords: [
      "opportunity",
      "opportunities",
      "possibility",
      "possibilities",
      "chance",
      "opening",
      "new",
      "future",
      "path",
      "direction",
      "choice",
      "potential",
      "success",
      "change",
      "transition",
    ],
    fallbackPalm:
      "Your Palm analysis does not contain separate opportunity guidance yet.",
    fallbackTarot:
      "Your Tarot reading does not contain a separate Opportunities section yet.",
  },
];

const PALM_LABELS = {
  heart: "Heart Line",
  head: "Head Line",
  life: "Life Line",
  fate: "Fate Line",
  sun: "Sun Line",
};

const MAJOR_ARCANA = [
  "The Fool",
  "The Magician",
  "The High Priestess",
  "The Empress",
  "The Emperor",
  "The Hierophant",
  "The Lovers",
  "The Chariot",
  "Strength",
  "The Hermit",
  "Wheel of Fortune",
  "Justice",
  "The Hanged Man",
  "Death",
  "Temperance",
  "The Devil",
  "The Tower",
  "The Star",
  "The Moon",
  "The Sun",
  "Judgement",
  "The World",
];

function clean(value) {
  return String(value || "")
    .replace(/[*_#`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function safeJson(value, fallback = null) {
  if (!value) return fallback;
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function shorten(value, max = 420) {
  const text = clean(value);

  if (!text) return "";

  if (text.length <= max) return text;

  const cut = text.slice(0, max);
  const boundary = Math.max(
    cut.lastIndexOf(". "),
    cut.lastIndexOf("; "),
    cut.lastIndexOf(", ")
  );

  return (
    boundary > max * 0.55
      ? cut.slice(0, boundary + 1)
      : cut
  ).trim();
}

function isPalm(reading) {
  return String(reading?.reading_type || "").toLowerCase() === "palm";
}

function isTarot(reading) {
  return String(reading?.reading_type || "").toLowerCase() === "tarot";
}

function dateText(reading) {
  if (!reading?.created_at) return "";

  try {
    return new Date(reading.created_at).toLocaleString();
  } catch {
    return "";
  }
}

/* ============================================================
   PALM
   ============================================================ */

function palmData(reading) {
  if (!reading) return {};

  const raw =
    reading.palm_insights &&
    typeof reading.palm_insights === "object"
      ? reading.palm_insights
      : safeJson(reading.palm_insights, {});

  const features =
    raw?.features && typeof raw.features === "object"
      ? raw.features
      : {};

  return {
    ...raw,
    features,
  };
}

function palmFeature(reading, key) {
  const feature = palmData(reading)?.features?.[key];

  return feature && typeof feature === "object"
    ? feature
    : null;
}

function palmFeatureText(reading, key) {
  const feature = palmFeature(reading, key);

  if (!feature) return "";

  return clean(
    feature.reflection ||
      feature.observation ||
      ""
  );
}

function palmConfidence(reading, key) {
  const feature = palmFeature(reading, key);

  if (!feature) return null;

  const number = Number(feature.confidence);

  if (!Number.isFinite(number)) return null;

  return Math.round(
    Math.max(0, Math.min(1, number)) * 100
  );
}

function palmField(reading, field) {
  const data = palmData(reading);
  const value = data?.[field];

  if (Array.isArray(value)) {
    return value
      .map((item) => clean(item))
      .filter(Boolean);
  }

  return clean(value || "");
}

function palmList(reading, field) {
  const data = palmData(reading);
  const value = data?.[field];

  if (!Array.isArray(value)) return [];

  return value
    .map((item) => clean(item))
    .filter(Boolean);
}

function palmPartsForCategory(category, reading) {
  if (!reading) return [];

  const parts = [];

  for (const key of category.palmKeys || []) {
    const text = palmFeatureText(reading, key);

    if (text) {
      parts.push({
        key,
        label: PALM_LABELS[key] || key,
        text,
        confidence: palmConfidence(reading, key),
      });
    }
  }

  return parts;
}

function palmCategoryInsight(category, reading) {
  if (!reading) {
    return {
      text: category.fallbackPalm,
      evidence: [],
    };
  }

  const featureParts = palmPartsForCategory(
    category,
    reading
  );

  /*
    Category-specific Palm fields from the AI analysis.
    These are deliberately different for every category.
  */
  const fieldParts = [];

  for (const field of category.palmFields || []) {
    if (
      field === "growth_opportunities" ||
      field === "practical_next_steps"
    ) {
      const values = palmList(
        reading,
        field
      );

      if (values.length) {
        fieldParts.push(
          `${field === "growth_opportunities" ? "Growth opportunities" : "Practical next steps"}: ${values.join(" ")}`
        );
      }
    } else {
      const value = palmField(
        reading,
        field
      );

      if (value) {
        fieldParts.push(value);
      }
    }
  }

  const evidence = [
    ...featureParts.map((item) => ({
      label: item.label,
      text: item.text,
      confidence: item.confidence,
    })),
    ...fieldParts.map((text, index) => ({
      label:
        category.palmFields[index] ===
        "growth_opportunities"
          ? "Growth opportunities"
          : category.palmFields[index] ===
              "practical_next_steps"
            ? "Practical next steps"
            : "AI Palm reflection",
      text,
      confidence: null,
    })),
  ];

  /*
    Remove duplicate wording while preserving the actual AI output.
  */
  const uniqueTexts = [];
  const seen = new Set();

  for (const item of evidence) {
    const normalized = clean(item.text).toLowerCase();

    if (!normalized || seen.has(normalized)) continue;

    seen.add(normalized);
    uniqueTexts.push(item.text);
  }

  let text = "";

  if (uniqueTexts.length) {
    text = shorten(
      uniqueTexts.join(" "),
      560
    );
  }

  if (!text) {
    text = category.fallbackPalm;
  }

  return {
    text,
    evidence,
  };
}

/* ============================================================
   TAROT
   ============================================================ */

function tarotData(reading) {
  if (!reading) return {};

  return {
    input:
      typeof reading.input_summary === "object"
        ? reading.input_summary
        : safeJson(
            reading.input_summary,
            {}
          ),
    result: clean(
      reading.result_text || ""
    ),
  };
}

function tarotCards(reading) {
  const data = tarotData(reading);
  const input = data.input;

  if (
    Array.isArray(input?.cards) &&
    input.cards.length
  ) {
    return input.cards.map(
      (item, index) => ({
        position:
          item?.position || index + 1,
        card:
          typeof item === "string"
            ? item
            : item?.card || "Selected card",
        orientation:
          typeof item === "string"
            ? "upright"
            : item?.orientation ||
              "upright",
      })
    );
  }

  const result = data.result;
  const found = [];

  const allCardNames = [
    ...MAJOR_ARCANA,
  ];

  for (const rank of [
    "Ace",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Page",
    "Knight",
    "Queen",
    "King",
  ]) {
    for (const suit of [
      "Wands",
      "Cups",
      "Swords",
      "Pentacles",
    ]) {
      allCardNames.push(
        `${rank} of ${suit}`
      );
    }
  }

  for (const cardName of allCardNames) {
    const match = result.match(
      new RegExp(
        `${escapeRegExp(
          cardName
        )}\\s*\\((upright|reversed)\\)`,
        "i"
      )
    );

    if (match) {
      found.push({
        position:
          found.length + 1,
        card: cardName,
        orientation:
          match[1].toLowerCase(),
      });
    }
  }

  return found;
}

function escapeRegExp(value) {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

function tarotSectionText(
  reading,
  section
) {
  const result = tarotData(reading).result;

  if (!result) return "";

  const patterns = {
    overall: [
      /Overall reading\s*:?\s*(.*?)(?=\s+(?:Card-by-card interpretation|Relationship and emotional themes|Career and work themes|Personal growth|Opportunities|Things to be mindful of|Practical next steps|Closing reflection)\b|$)/is,
    ],
    relationship: [
      /Relationship and emotional themes\s*:?\s*(.*?)(?=\s+(?:Career and work themes|Personal growth|Opportunities|Things to be mindful of|Practical next steps|Closing reflection)\b|$)/is,
    ],
    career: [
      /Career and work themes\s*:?\s*(.*?)(?=\s+(?:Personal growth|Opportunities|Things to be mindful of|Practical next steps|Closing reflection)\b|$)/is,
    ],
    growth: [
      /Personal growth\s*:?\s*(.*?)(?=\s+(?:Opportunities|Things to be mindful of|Practical next steps|Closing reflection)\b|$)/is,
    ],
    opportunities: [
      /Opportunities\s*:?\s*(.*?)(?=\s+(?:Things to be mindful of|Practical next steps|Closing reflection)\b|$)/is,
    ],
    mindful: [
      /Things to be mindful of\s*:?\s*(.*?)(?=\s+(?:Practical next steps|Closing reflection)\b|$)/is,
    ],
    next: [
      /Practical next steps\s*:?\s*(.*?)(?=\s+Closing reflection\b|$)/is,
    ],
    closing: [
      /Closing reflection\s*:?\s*(.*?)$/is,
    ],
  };

  for (const pattern of patterns[section] || []) {
    const match = result.match(pattern);

    if (match?.[1]) {
      return clean(
        match[1]
          .replace(
            /^[-–—:]\s*/,
            ""
          )
      );
    }
  }

  return "";
}

function cardInterpretation(
  reading,
  card
) {
  const result = tarotData(reading).result;

  if (!result || !card?.card) return "";

  const orientation =
    card.orientation || "upright";

  const pattern = new RegExp(
    `${escapeRegExp(
      card.card
    )}\\s*\\(${escapeRegExp(
      orientation
    )}\\)\\s*:\\s*(.*?)(?=\\s+(?:The Fool|The Magician|The High Priestess|The Empress|The Emperor|The Hierophant|The Lovers|The Chariot|Strength|The Hermit|Wheel of Fortune|Justice|The Hanged Man|Death|Temperance|The Devil|The Tower|The Star|The Moon|The Sun|Judgement|The World|Ace|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Page|Knight|Queen|King)\\s+of?\\s*[A-Za-z ]*\\s*\\((?:upright|reversed)\\)\\s*:|\\s+(?:Reflection prompt|Relationship and emotional themes|Career and work themes|Personal growth|Opportunities|Things to be mindful of|Practical next steps|Closing reflection)\\b|$)`,
    "i"
  );

  const match = result.match(
    pattern
  );

  if (match?.[1]) {
    return clean(match[1]);
  }

  const lines = result
    .split(/\n+/)
    .map((line) => clean(line))
    .filter(Boolean);

  const line = lines.find((item) =>
    item
      .toLowerCase()
      .startsWith(
        `${card.card.toLowerCase()} (${orientation.toLowerCase()})`
      )
  );

  if (line) {
    return clean(
      line
        .replace(
          new RegExp(
            `^${escapeRegExp(
              card.card
            )}\\s*\\(${escapeRegExp(
              orientation
            )}\\)\\s*:\\s*`,
            "i"
          ),
          ""
        )
    );
  }

  return "";
}

function tarotCardsWithText(
  reading
) {
  return tarotCards(reading).map(
    (card) => ({
      ...card,
      interpretation:
        cardInterpretation(
          reading,
          card
        ),
    })
  );
}

function categoryCardEvidence(
  category,
  reading
) {
  if (!reading) return [];

  const cards =
    tarotCardsWithText(reading);

  if (!cards.length) return [];

  const scored = cards.map(
    (card) => {
      const text = clean(
        `${card.card} ${card.orientation} ${card.interpretation}`
      ).toLowerCase();

      const score =
        (category.tarotWords || []).reduce(
          (total, word) =>
            total +
            (text.includes(
              word.toLowerCase()
            )
              ? 1
              : 0),
          0
        );

      return {
        ...card,
        score,
      };
    }
  );

  const direct = scored
    .filter(
      (card) => card.score > 0
    )
    .sort(
      (a, b) => b.score - a.score
    );

  /*
    We always show actual selected cards.
    If there is no direct keyword match,
    we do NOT pretend that a card means a category.
    We simply use the category's actual Tarot section.
  */
  return (
    direct.length
      ? direct.slice(0, 2)
      : scored.slice(0, 2)
  );
}

function tarotCategoryInsight(
  category,
  reading
) {
  if (!reading) {
    return {
      text: category.fallbackTarot,
      evidence: [],
      section: "",
    };
  }

  const section =
    tarotSectionText(
      reading,
      category.tarotSection
    );

  const cards =
    categoryCardEvidence(
      category,
      reading
    );

  /*
    Category-specific Tarot section is the primary source.
    Card interpretations are supporting evidence only.
  */
  let text = section;

  if (!text) {
    const cardTexts = cards
      .map(
        (card) =>
          card.interpretation
      )
      .filter(Boolean);

    if (cardTexts.length) {
      text = shorten(
        cardTexts.join(" "),
        520
      );
    }
  }

  if (!text) {
    text = category.fallbackTarot;
  }

  return {
    text: shorten(text, 560),
    evidence: cards,
    section,
  };
}

/* ============================================================
   CATEGORY SYNTHESIS
   ============================================================ */

function buildCategory(
  category,
  palm,
  tarot
) {
  const palmInsight =
    palmCategoryInsight(
      category,
      palm
    );

  const tarotInsight =
    tarotCategoryInsight(
      category,
      tarot
    );

  const hasPalm =
    Boolean(palm) &&
    Boolean(
      palmInsight.text
    );

  const hasTarot =
    Boolean(tarot) &&
    Boolean(
      tarotInsight.text
    );

  let summary = "";

  if (hasPalm && hasTarot) {
    summary =
      `${palmInsight.text} ${tarotInsight.text}`;
  } else if (hasPalm) {
    summary =
      palmInsight.text;
  } else if (hasTarot) {
    summary =
      tarotInsight.text;
  } else {
    summary =
      "Complete a Palm analysis or Tarot reading to build this insight.";
  }

  return {
    ...category,
    palmInsight,
    tarotInsight,
    summary: shorten(
      summary,
      650
    ),
    hasPalm,
    hasTarot,
  };
}

/* ============================================================
   UI
   ============================================================ */

function SourcePill({
  type,
}) {
  return (
    <span
      className={`ins-source-pill ${
        type === "palm"
          ? "is-palm"
          : "is-tarot"
      }`}
    >
      {type === "palm"
        ? "Palm"
        : "Tarot"}
    </span>
  );
}

function CategoryCard({
  item,
  active,
  onClick,
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      className={`ins-category-card ${
        active
          ? "is-active"
          : ""
      }`}
      onClick={onClick}
    >
      <div
        className={`ins-category-icon ${item.colorClass}`}
      >
        <Icon size={20} />
      </div>

      <div className="ins-category-content">
        <div className="ins-category-title">
          <div>
            <h3>
              {item.label}
            </h3>
            <span>
              {item.subtitle}
            </span>
          </div>

          <ArrowRight
            size={16}
          />
        </div>

        <p>
          {item.summary}
        </p>

        <div className="ins-category-sources">
          {item.hasPalm && (
            <SourcePill type="palm" />
          )}

          {item.hasTarot && (
            <SourcePill type="tarot" />
          )}
        </div>
      </div>
    </button>
  );
}

function SourceInsight({
  type,
  title,
  text,
  evidence,
}) {
  return (
    <article
      className={`ins-source-insight ${
        type === "palm"
          ? "palm"
          : "tarot"
      }`}
    >
      <div className="ins-source-heading">
        <SourcePill type={type} />

        <div>
          <h3>
            {title}
          </h3>

          <span>
            {type === "palm"
              ? "From your Palm analysis"
              : "From your Tarot reading"}
          </span>
        </div>
      </div>

      <p className="ins-source-main">
        {text}
      </p>

      {evidence?.length > 0 && (
        <div className="ins-evidence-list">
          {evidence.map(
            (item, index) => (
              <div
                className="ins-evidence"
                key={`${item.label || item.card}-${index}`}
              >
                <div className="ins-evidence-top">
                  <strong>
                    {item.label ||
                      item.card}
                  </strong>

                  {item.confidence != null && (
                    <span>
                      {item.confidence}%
                      visual confidence
                    </span>
                  )}

                  {item.orientation && (
                    <span className="ins-orientation">
                      {item.orientation}
                    </span>
                  )}
                </div>

                <p>
                  {shorten(
                    item.text ||
                      item.interpretation ||
                      "",
                    330
                  )}
                </p>
              </div>
            )
          )}
        </div>
      )}
    </article>
  );
}

function ReadingBadge({
  type,
  reading,
}) {
  if (!reading) return null;

  return (
    <div className="ins-reading-badge">
      <SourcePill type={type} />

      <span>
        Latest reading ·{" "}
        {dateText(reading)}
      </span>
    </div>
  );
}

export default function Insights() {
  const [readings, setReadings] = useState([]);
  const [activeKey, setActiveKey] = useState("personality");
  const [selectedPalmId, setSelectedPalmId] = useState("");
  const [selectedTarotId, setSelectedTarotId] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const readingId = (reading, index) =>
    String(reading?.id ?? reading?.reading_id ?? `${reading?.reading_type || "reading"}-${reading?.created_at || index}`);

  async function loadReadings() {
    setError("");
    setRefreshing(true);
    try {
      const response = await api.get("/api/readings/me");
      const items = Array.isArray(response.data?.items)
        ? response.data.items
        : Array.isArray(response.data) ? response.data : [];
      const previousPalm = readings.find(isPalm);
      const previousTarot = readings.find(isTarot);
      const previousPalmId = previousPalm ? readingId(previousPalm, readings.indexOf(previousPalm)) : "";
      const previousTarotId = previousTarot ? readingId(previousTarot, readings.indexOf(previousTarot)) : "";
      const sorted = items.slice().sort((a, b) =>
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
      setReadings(sorted);
      const palms = sorted.filter(isPalm);
      const tarots = sorted.filter(isTarot);
      const newestPalmId = palms.length ? readingId(palms[0], sorted.indexOf(palms[0])) : "";
      const newestTarotId = tarots.length ? readingId(tarots[0], sorted.indexOf(tarots[0])) : "";
      setSelectedPalmId(current => newestPalmId && newestPalmId !== previousPalmId
        ? newestPalmId
        : palms.some((item) => readingId(item, sorted.indexOf(item)) === current)
          ? current : newestPalmId);
      setSelectedTarotId(current => newestTarotId && newestTarotId !== previousTarotId
        ? newestTarotId
        : tarots.some((item) => readingId(item, sorted.indexOf(item)) === current)
          ? current : newestTarotId);
    } catch (err) {
      setError(err.response?.data?.detail || "We couldn't load your readings. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { loadReadings(); }, []);

  const palmReadings = useMemo(() => readings.filter(isPalm), [readings]);
  const tarotReadings = useMemo(() => readings.filter(isTarot), [readings]);
  const latestPalm = palmReadings.find((item) => readingId(item, readings.indexOf(item)) === selectedPalmId) || palmReadings[0] || null;
  const latestTarot = tarotReadings.find((item) => readingId(item, readings.indexOf(item)) === selectedTarotId) || tarotReadings[0] || null;

  const categories = useMemo(
    () => CATEGORIES.map((category) => buildCategory(category, latestPalm, latestTarot)),
    [latestPalm, latestTarot]
  );
  const active = categories.find((item) => item.key === activeKey) || categories[0];
  const ActiveIcon = active?.icon || Sparkles;

  if (loading) {
    return <div className="page-container"><style>{INSIGHTS_CSS}</style><div className="ins-loading"><Sparkles size={20} /> Preparing your insights…</div></div>;
  }

  if (error) {
    return (
      <div className="page-container"><style>{INSIGHTS_CSS}</style>
        <main className="ins-shell"><section className="ins-error"><Sparkles size={22} />
          <div><h2>We couldn't load your insights.</h2><p>{error}</p>
            <button type="button" onClick={loadReadings}><RefreshCw size={15} /> Try again</button>
          </div>
        </section></main>
      </div>
    );
  }

  return (
    <div className="page-container">
      <style>{INSIGHTS_CSS}</style>
      <main className="ins-shell">
        <header className="ins-hero">
          <div>
            <div className="ins-kicker"><span /> YOUR PERSONAL INSIGHTS</div>
            <h1>Every reading tells a different story.</h1>
            <p>Pick a Palm or Tarot reading, then explore seven topics in clear, simple words.</p>
            <div className="ins-hero-source-row">
              <span className="ins-reading-badge"><strong>{readings.length}</strong> saved readings</span>
              <ReadingBadge type="palm" reading={latestPalm} />
              <ReadingBadge type="tarot" reading={latestTarot} />
            </div>
          </div>
          <button className="ins-refresh" type="button" onClick={loadReadings} disabled={refreshing}>
            <RefreshCw size={15} className={refreshing ? "ins-spin" : ""} /> {refreshing ? "Updating…" : "Refresh"}
          </button>
        </header>

        {!palmReadings.length && !tarotReadings.length ? (
          <section className="ins-empty">
            <div className="ins-empty-icon"><Sparkles size={28} /></div>
            <div><div className="ins-kicker">START HERE</div><h2>Your insights will appear here.</h2>
              <p>Save a Palm analysis or Tarot reading to explore your personal insight categories.</p>
              <div className="ins-actions"><Link to="/palm-reading">Analyse Palm <ArrowRight size={15} /></Link><Link to="/tarot-reading">Read Tarot <ArrowRight size={15} /></Link></div>
            </div>
          </section>
        ) : (
          <>
            <section className="ins-reading-picker">
              <div className="ins-picker-title"><Sparkles size={19} /><div><h2>Choose your reading</h2><p>Switch readings to see insights update for that reading.</p></div></div>
              <div className="ins-picker-grid">
                <label className="ins-select-wrap"><span>PALM ANALYSIS</span>
                  <select value={selectedPalmId} onChange={(event) => setSelectedPalmId(event.target.value)} disabled={!palmReadings.length}>
                    {!palmReadings.length && <option value="">No Palm readings yet</option>}
                    {palmReadings.map((item) => <option key={readingId(item, readings.indexOf(item))} value={readingId(item, readings.indexOf(item))}>
                      {dateText(item) || "Saved Palm reading"}{item?.title ? ` · ${item.title}` : ""}
                    </option>)}
                  </select>
                </label>
                <label className="ins-select-wrap"><span>TAROT READING</span>
                  <select value={selectedTarotId} onChange={(event) => setSelectedTarotId(event.target.value)} disabled={!tarotReadings.length}>
                    {!tarotReadings.length && <option value="">No Tarot readings yet</option>}
                    {tarotReadings.map((item) => <option key={readingId(item, readings.indexOf(item))} value={readingId(item, readings.indexOf(item))}>
                      {dateText(item) || "Saved Tarot reading"}{item?.title ? ` · ${item.title}` : ""}
                    </option>)}
                  </select>
                </label>
              </div>
              <div className="ins-picker-note">Insights use the saved result of each selected reading. Create a new reading and press Refresh to load it here.</div>
            </section>

            <section className="ins-category-section">
              <div className="ins-section-head"><div><div className="ins-kicker">7 INSIGHT CATEGORIES</div><h2>What would you like to explore?</h2><p>Tap a topic. The visual meter shows how much topic-related wording appears in your selected reading.</p></div><div className="ins-category-count">7 topics</div></div>
              <div className="ins-category-grid">
                {categories.map((item) => <CategoryCard key={item.key} item={item} active={active?.key === item.key} onClick={() => setActiveKey(item.key)} />)}
              </div>
            </section>

            {active && (
              <section className="ins-detail" key={`${active.key}-${selectedPalmId}-${selectedTarotId}`}>
                <div className="ins-detail-head">
                  <div className={`ins-detail-icon ${active.colorClass}`}><ActiveIcon size={24} /></div>
                  <div><div className="ins-kicker">{active.label.toUpperCase()}</div><h2>{active.subtitle}</h2><p>{active.description}</p></div>
                </div>
                <div className="ins-combined"><span>YOUR MAIN TAKEAWAY</span><p>{active.summary}</p></div>
                <div className="ins-visual">
                  <div className="ins-visual-heading"><div><div className="ins-kicker">READING SNAPSHOT</div><h3>Topic overview</h3></div><span>Based on selected results</span></div>
                  <div className="ins-meter-row"><span>Palm insight</span><div className="ins-meter"><span style={{ width: `${active.hasPalm ? 100 : 0}%` }} /></div><strong>{active.hasPalm ? "Available" : "Not available"}</strong></div>
                  <div className="ins-meter-row"><span>Tarot insight</span><div className="ins-meter tarot-meter"><span style={{ width: `${active.hasTarot ? 100 : 0}%` }} /></div><strong>{active.hasTarot ? "Available" : "Not available"}</strong></div>
                </div>
                <div className="ins-source-grid">
                  <SourceInsight type="palm" title={`Palm · ${active.label}`} text={active.palmInsight.text} evidence={active.palmInsight.evidence} />
                  <SourceInsight type="tarot" title={`Tarot · ${active.label}`} text={active.tarotInsight.text} evidence={active.tarotInsight.evidence} />
                </div>
                <div className="ins-understand"><div><div className="ins-kicker">IN SIMPLE WORDS</div><h3>One thing to remember</h3></div><p>{active.summary}</p></div>
              </section>
            )}

            <section className="ins-reading-strip"><div><div className="ins-kicker">YOUR READINGS</div><h2>Insights change when you change the reading.</h2><p>Each topic is built from the saved Palm analysis and/or Tarot interpretation you selected above. Missing category details are labelled honestly rather than made up.</p></div>
              <div className="ins-reading-links">{latestPalm && <Link to="/palm-reading">View Palm reading <ArrowRight size={14} /></Link>}{latestTarot && <Link to="/tarot-reading">View Tarot reading <ArrowRight size={14} /></Link>}</div>
            </section>
            <p className="ins-disclaimer">Palmistry and Tarot are symbolic reflection practices, not scientifically proven predictions. Health insights are not medical advice; finance insights are not financial advice.</p>
          </>
        )}
      </main>
    </div>
  );
}

const INSIGHTS_CSS = `
.ins-shell{
  width:min(1180px,calc(100% - 42px));
  margin:30px auto 64px;
  color:#382a21;
  font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
}
.ins-hero{
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
  gap:28px;
  padding:38px 40px;
  border:1px solid #ddcdbd;
  border-radius:18px;
  background:#fffdf9;
  box-shadow:0 12px 34px rgba(66,45,32,.055);
}
.ins-hero h1{
  max-width:820px;
  margin:11px 0 0;
  color:#38281e;
  font-family:Georgia,"Times New Roman",serif;
  font-size:39px;
  line-height:1.12;
  font-weight:500;
  letter-spacing:-.025em;
}
.ins-hero p{
  max-width:820px;
  margin:13px 0 0;
  color:#705c4c;
  font-size:11px;
  line-height:1.85;
}
.ins-kicker{
  display:flex;
  align-items:center;
  gap:8px;
  color:#956f54;
  font-size:8px;
  font-weight:900;
  letter-spacing:.19em;
}
.ins-kicker>span{
  width:22px;
  height:1px;
  background:#a77d5d;
}
.ins-hero-source-row{
  display:flex;
  flex-wrap:wrap;
  gap:8px;
  margin-top:17px;
}
.ins-reading-badge{
  display:flex;
  align-items:center;
  gap:8px;
  padding:6px 8px;
  border:1px solid #ded0c3;
  border-radius:7px;
  background:#fff;
  color:#876c58;
  font-size:7.5px;
}
.ins-refresh{
  display:inline-flex;
  align-items:center;
  gap:7px;
  flex:none;
  border:1px solid #c9b09a;
  border-radius:8px;
  padding:10px 13px;
  background:#fff;
  color:#5f4635;
  font-size:8.5px;
  font-weight:850;
  cursor:pointer;
}
.ins-source-pill{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-width:44px;
  padding:4px 7px;
  border-radius:6px;
  font-size:7px;
  line-height:1;
  font-weight:900;
  letter-spacing:.05em;
}
.ins-source-pill.is-palm{
  background:#543b2c;
  color:#fff8f0;
}
.ins-source-pill.is-tarot{
  background:#7e5d46;
  color:#fff8f0;
}
.ins-category-section{
  margin-top:30px;
}
.ins-section-head{
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
  gap:20px;
}
.ins-section-head h2{
  margin:7px 0 0;
  color:#3c2c22;
  font-family:Georgia,serif;
  font-size:27px;
  font-weight:500;
}
.ins-section-head p{
  max-width:760px;
  margin:8px 0 0;
  color:#776354;
  font-size:10.5px;
  line-height:1.75;
}
.ins-category-count{
  padding:7px 10px;
  border:1px solid #d5bea9;
  border-radius:7px;
  background:#fff;
  color:#886d59;
  font-size:8px;
  font-weight:800;
  white-space:nowrap;
}
.ins-category-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:12px;
  margin-top:16px;
}
.ins-category-card{
  display:flex;
  align-items:flex-start;
  gap:13px;
  min-height:190px;
  padding:19px;
  border:1px solid #ddd0c4;
  border-radius:13px;
  background:#fff;
  color:inherit;
  text-align:left;
  cursor:pointer;
  transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;
}
.ins-category-card:hover{
  transform:translateY(-2px);
  border-color:#c7aa90;
  box-shadow:0 10px 24px rgba(66,45,32,.065);
}
.ins-category-card.is-active{
  border-color:#a77c5d;
  background:#fffaf5;
  box-shadow:0 8px 22px rgba(66,45,32,.065);
}
.ins-category-icon{
  display:flex;
  align-items:center;
  justify-content:center;
  width:42px;
  height:42px;
  flex:none;
  border-radius:10px;
  background:#f6ece3;
  color:#74523d;
}
.ins-category-icon.personality{
  background:#eee5de;
}
.ins-category-icon.relationships{
  background:#f4e5e1;
}
.ins-category-icon.career{
  background:#eee9df;
}
.ins-category-icon.finance{
  background:#eee8dc;
}
.ins-category-icon.wellness{
  background:#e9eee5;
}
.ins-category-icon.growth{
  background:#e8eee4;
}
.ins-category-icon.opportunities{
  background:#f2eadc;
}
.ins-category-content{
  min-width:0;
  flex:1;
}
.ins-category-title{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:10px;
}
.ins-category-title h3{
  margin:0;
  color:#4a3528;
  font-family:Georgia,serif;
  font-size:17px;
  font-weight:500;
}
.ins-category-title span{
  display:block;
  margin-top:4px;
  color:#9a806d;
  font-size:7.5px;
  line-height:1.4;
}
.ins-category-title svg{
  color:#a17d64;
  flex:none;
  margin-top:1px;
}
.ins-category-content>p{
  margin:11px 0 0;
  color:#665346;
  font-size:9.5px;
  line-height:1.8;
}
.ins-category-sources{
  display:flex;
  gap:5px;
  flex-wrap:wrap;
  margin-top:12px;
}
.ins-detail{
  margin-top:18px;
  padding:29px;
  border:1px solid #ccb39b;
  border-radius:16px;
  background:linear-gradient(135deg,#f7eee5 0%,#fffdf9 72%);
}
.ins-detail-head{
  display:flex;
  align-items:flex-start;
  gap:16px;
}
.ins-detail-icon{
  display:flex;
  align-items:center;
  justify-content:center;
  width:54px;
  height:54px;
  flex:none;
  border-radius:12px;
  background:#51382a;
  color:#fff8f0;
}
.ins-detail-icon.relationships{
  background:#684237;
}
.ins-detail-icon.career{
  background:#584637;
}
.ins-detail-icon.finance{
  background:#5d4a32;
}
.ins-detail-icon.wellness{
  background:#45523f;
}
.ins-detail-icon.growth{
  background:#4d5a3e;
}
.ins-detail-icon.opportunities{
  background:#69502f;
}
.ins-detail h2{
  margin:6px 0 0;
  color:#3d2c22;
  font-family:Georgia,serif;
  font-size:28px;
  font-weight:500;
}
.ins-detail-head p{
  max-width:820px;
  margin:7px 0 0;
  color:#6f5b4c;
  font-size:10.5px;
  line-height:1.75;
}
.ins-combined{
  margin-top:20px;
  padding:20px 22px;
  border:1px solid #dac7b5;
  border-radius:11px;
  background:#fff;
}
.ins-combined>span{
  color:#946d52;
  font-size:8px;
  font-weight:900;
  letter-spacing:.17em;
}
.ins-combined p{
  margin:8px 0 0;
  color:#4e392d;
  font-family:Georgia,serif;
  font-size:16px;
  line-height:1.7;
}
.ins-source-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px;
  margin-top:12px;
}
.ins-source-insight{
  padding:20px;
  border:1px solid #dfd1c4;
  border-radius:12px;
  background:#fff;
}
.ins-source-insight.palm{
  border-top:3px solid #62432f;
}
.ins-source-insight.tarot{
  border-top:3px solid #85654c;
}
.ins-source-heading{
  display:flex;
  align-items:center;
  gap:10px;
}
.ins-source-heading h3{
  margin:0;
  color:#4b3528;
  font-family:Georgia,serif;
  font-size:16px;
  font-weight:500;
}
.ins-source-heading span{
  display:block;
  margin-top:3px;
  color:#a08775;
  font-size:7.5px;
}
.ins-source-main{
  margin:14px 0 0;
  color:#655144;
  font-size:10px;
  line-height:1.85;
}
.ins-evidence-list{
  margin-top:13px;
}
.ins-evidence{
  padding:11px 0;
  border-top:1px solid #eee6df;
}
.ins-evidence:first-child{
  border-top:0;
}
.ins-evidence-top{
  display:flex;
  align-items:center;
  flex-wrap:wrap;
  gap:7px;
}
.ins-evidence-top strong{
  color:#513b2d;
  font-size:8.5px;
}
.ins-evidence-top span{
  color:#a08774;
  font-size:7px;
}
.ins-evidence-top .ins-orientation{
  text-transform:capitalize;
}
.ins-evidence p{
  margin:6px 0 0;
  color:#756052;
  font-size:8.5px;
  line-height:1.7;
}
.ins-understand{
  display:grid;
  grid-template-columns:250px 1fr;
  gap:22px;
  align-items:start;
  margin-top:12px;
  padding:19px 21px;
  border:1px solid #ddcbbb;
  border-radius:11px;
  background:#fbf5ef;
}
.ins-understand h3{
  margin:7px 0 0;
  color:#4a3428;
  font-family:Georgia,serif;
  font-size:18px;
  font-weight:500;
}
.ins-understand>p{
  margin:0;
  color:#604a3b;
  font-size:10px;
  line-height:1.85;
}
.ins-reading-strip{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:24px;
  margin-top:29px;
  padding:25px 27px;
  border:1px solid #ddd0c2;
  border-radius:13px;
  background:#fffdf9;
}
.ins-reading-strip h2{
  margin:7px 0 0;
  color:#3e2e24;
  font-family:Georgia,serif;
  font-size:22px;
  font-weight:500;
}
.ins-reading-strip p{
  max-width:760px;
  margin:7px 0 0;
  color:#766254;
  font-size:9.5px;
  line-height:1.75;
}
.ins-reading-links{
  display:flex;
  flex-wrap:wrap;
  gap:7px;
}
.ins-reading-links a,
.ins-actions a{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  padding:9px 12px;
  border:1px solid #c8aa91;
  border-radius:8px;
  background:#fff;
  color:#604735;
  font-size:8px;
  font-weight:850;
  text-decoration:none;
  white-space:nowrap;
}
.ins-actions{
  display:flex;
  flex-wrap:wrap;
  gap:8px;
  margin-top:15px;
}
.ins-empty{
  display:flex;
  align-items:center;
  gap:23px;
  margin-top:22px;
  padding:38px;
  border:1px solid #ddd0c4;
  border-radius:15px;
  background:#fff;
}
.ins-empty-icon{
  display:flex;
  align-items:center;
  justify-content:center;
  width:65px;
  height:65px;
  flex:none;
  border-radius:50%;
  background:#f5ece4;
  color:#73523e;
}
.ins-empty h2{
  margin:6px 0 0;
  color:#3d2d23;
  font-family:Georgia,serif;
  font-size:25px;
  font-weight:500;
}
.ins-empty p{
  max-width:700px;
  margin:8px 0 0;
  color:#705d4e;
  font-size:10.5px;
  line-height:1.8;
}
.ins-loading{
  min-height:500px;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:10px;
  color:#765945;
  font-size:11px;
}
.ins-error{
  display:flex;
  align-items:flex-start;
  gap:15px;
  margin-top:30px;
  padding:25px;
  border:1px solid #ddc9b9;
  border-radius:13px;
  background:#fff;
  color:#765945;
}
.ins-error h2{
  margin:0;
  color:#433126;
  font-family:Georgia,serif;
  font-size:20px;
  font-weight:500;
}
.ins-error p{
  color:#705d4e;
  font-size:10px;
}
.ins-error button{
  display:inline-flex;
  align-items:center;
  gap:7px;
  border:1px solid #c8ad96;
  border-radius:7px;
  padding:8px 11px;
  background:#fff;
  color:#5e4433;
  font-size:8px;
  font-weight:800;
  cursor:pointer;
}
.ins-disclaimer{
  max-width:900px;
  margin:16px auto 0;
  color:#9a8677;
  font-size:7.5px;
  line-height:1.7;
  text-align:center;
}

.ins-reading-picker{
  margin-top:18px;padding:21px 23px;border:1px solid #ddcbbb;border-radius:13px;background:#fffdf9;
}
.ins-picker-title{display:flex;align-items:center;gap:11px;color:#7b5941}
.ins-picker-title h2{margin:0;color:#493528;font:500 20px Georgia,serif}
.ins-picker-title p{margin:4px 0 0;color:#816b5a;font-size:10px}
.ins-picker-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}
.ins-select-wrap{display:flex;flex-direction:column;gap:7px;color:#967458;font-size:8px;font-weight:900;letter-spacing:.12em}
.ins-select-wrap select{width:100%;min-width:0;padding:11px 12px;border:1px solid #d8c6b6;border-radius:8px;background:#fff;color:#4f3a2d;font:500 12px Inter,system-ui,sans-serif;outline:none}
.ins-select-wrap select:focus{border-color:#987252;box-shadow:0 0 0 3px #eaddcf}
.ins-picker-note{margin-top:10px;color:#8b7767;font-size:9px;line-height:1.6}
.ins-visual{margin-top:13px;padding:18px 20px;border:1px solid #e0d1c3;border-radius:11px;background:#fff}
.ins-visual-heading{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:15px}
.ins-visual-heading h3{margin:5px 0 0;color:#4a3528;font:500 18px Georgia,serif}
.ins-visual-heading>span{color:#998271;font-size:8px}
.ins-meter-row{display:grid;grid-template-columns:110px minmax(40px,1fr) 100px;align-items:center;gap:12px;margin-top:11px;color:#6f5948;font-size:9px}
.ins-meter-row strong{text-align:right;color:#80644e;font-size:8px;font-weight:800}
.ins-meter{height:8px;overflow:hidden;border-radius:99px;background:#eee5dc}
.ins-meter>span{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#745039,#c9a17d);transition:width .3s ease}
.ins-meter.tarot-meter>span{background:linear-gradient(90deg,#8a6a51,#d8b99a)}
.ins-spin{animation:ins-spin .8s linear infinite}
@keyframes ins-spin{to{transform:rotate(360deg)}}
.ins-refresh:disabled{opacity:.7;cursor:wait}
.ins-category-content>p{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
@media(max-width:760px){.ins-picker-grid{grid-template-columns:1fr}.ins-meter-row{grid-template-columns:82px minmax(30px,1fr);gap:8px}.ins-meter-row strong{grid-column:2;text-align:left}.ins-visual-heading{align-items:flex-start;flex-direction:column}}

@media(max-width:980px){
  .ins-category-grid{
    grid-template-columns:1fr 1fr;
  }
}
@media(max-width:760px){
  .ins-shell{
    width:min(100% - 20px,1180px);
    margin-top:16px;
  }
  .ins-hero{
    align-items:flex-start;
    flex-direction:column;
    padding:27px 22px;
  }
  .ins-hero h1{
    font-size:31px;
  }
  .ins-category-grid,
  .ins-source-grid{
    grid-template-columns:1fr;
  }
  .ins-section-head{
    align-items:flex-start;
    flex-direction:column;
  }
  .ins-detail{
    padding:21px;
  }
  .ins-understand{
    grid-template-columns:1fr;
  }
  .ins-reading-strip{
    align-items:flex-start;
    flex-direction:column;
  }
  .ins-empty{
    align-items:flex-start;
    flex-direction:column;
    padding:28px 21px;
  }
}
`;

