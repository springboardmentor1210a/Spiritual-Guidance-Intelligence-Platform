import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Compass,
  MessageCircle,
  Sparkles,
  Target,
  TrendingUp,
  Workflow,
} from "lucide-react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { apiRequest } from "../api/client";

/* =========================================================
   PROFILE HELPERS
   ========================================================= */

function formatLabel(value) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function getBehavioralInsights(data) {
  const dimensions = data?.dimensions || {};

  const intuition = dimensions.intuition || 0;
  const practicalThinking =
    dimensions.practical_thinking || 0;
  const communication =
    dimensions.communication || 0;
  const emotionalAwareness =
    dimensions.emotional_awareness || 0;
  const adaptability =
    dimensions.adaptability || 0;
  const consistency = dimensions.consistency || 0;
  const selfReflection =
    dimensions.self_reflection || 0;

  return {
    decisionMaking:
      intuition >= practicalThinking
        ? "You tend to combine instinct with pattern recognition when making decisions. Giving important choices a short evidence-check can make this intuitive strength even more reliable."
        : "You tend to evaluate situations through practical reasoning before committing. Leaving room for intuition can help when decisions involve uncertainty or incomplete information.",

    interactionStyle:
      communication >= 80 && emotionalAwareness >= 80
        ? "You show a strong combination of communication and emotional awareness. You may naturally notice both what people say and the emotional context behind it."
        : communication >= 80
        ? "You tend to express ideas clearly and directly. Pairing that communication strength with deliberate listening can make interactions even more effective."
        : emotionalAwareness >= 80
        ? "You appear sensitive to emotional context and interpersonal signals. Making your own expectations explicit can help turn that awareness into clearer communication."
        : "Your interaction style can benefit from balancing clear expression with active attention to emotional and contextual signals.",

    workStyle:
      adaptability >= 85 && consistency < 75
        ? "You appear comfortable exploring changing situations and new approaches. A lightweight planning system can help convert that flexibility into consistent execution."
        : adaptability >= 80
        ? "You appear comfortable adapting when priorities or circumstances change. Maintaining a clear outcome while changing the route can help preserve focus."
        : consistency >= 80
        ? "You show a strong preference for structured and repeatable execution. Allowing occasional experimentation can create room for new approaches."
        : "Your work style appears to benefit from a balance between structure, experimentation and deliberate follow-through.",

    growthStyle:
      selfReflection >= 85
        ? "Self-reflection is a strong part of your profile. Turning reflection into small experiments can help convert insight into measurable personal growth."
        : adaptability >= 85
        ? "You may grow particularly well through experimentation and exposure to new situations. Keeping a simple reflection loop can help identify what actually works."
        : "Your growth can benefit from combining reflection with small, repeatable actions rather than relying only on insight.",
  };
}

function getProfileSummary(data) {
  const strongest = data?.dimensions
    ? Object.entries(data.dimensions).sort(
        (a, b) => b[1] - a[1]
      )[0]
    : null;

  if (!strongest) {
    return "Your personality profile combines multiple behavioral dimensions that can be explored through strengths, development areas and practical reflection.";
  }

  return `Your strongest signal is ${formatLabel(
    strongest[0]
  )} at ${strongest[1]}%. This dimension provides an important lens for understanding how your current profile approaches decisions, relationships, work and personal growth.`;
}

function getDominantTraits(data) {
  if (!data?.dimensions) return [];

  return Object.entries(data.dimensions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([key, value]) => ({
      name: formatLabel(key),
      value,
    }));
}

function getDevelopmentFocus(data) {
  const dimensions = data?.dimensions || {};

  const lowest = Object.entries(dimensions).sort(
    (a, b) => a[1] - b[1]
  )[0];

  if (!lowest) {
    return {
      current:
        "Your profile currently shows a balanced set of behavioral signals.",
      direction:
        "Continue strengthening the areas that support your long-term goals.",
      reflection:
        "Which part of your current behavior would you most like to improve?",
    };
  }

  const label = formatLabel(lowest[0]);

  return {
    current: `${label} is currently the least prominent measured dimension in this profile at ${lowest[1]}%. This does not indicate a weakness; it identifies an area that may benefit from deliberate attention.`,

    direction: `A useful growth direction is to strengthen ${label.toLowerCase()} through small, repeatable actions while continuing to use your stronger traits as support.`,

    reflection: `Where could improving your ${label.toLowerCase()} make the biggest practical difference in your current goals?`,
  };
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function PersonalityIntelligence() {
  const [params] = useSearchParams();

  const querySessionId =
    params.get("reading_session_id");

  const readingSessionId =
    querySessionId ||
    localStorage.getItem(
      "milestone3_reading_session_id"
    );

  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!readingSessionId) {
      setError(
        "No Milestone 3 reading context is available."
      );
      setLoading(false);
      return;
    }

    localStorage.setItem(
      "milestone3_reading_session_id",
      String(readingSessionId)
    );

    apiRequest(
      `/api/v1/milestone3/personality/${readingSessionId}`
    )
      .then(setData)
      .catch((err) => {
        setError(
          err.message ||
            "Unable to load personality intelligence."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [readingSessionId]);

  const strongestDimension = useMemo(() => {
    if (!data?.dimensions) return null;

    return Object.entries(data.dimensions).sort(
      (a, b) => b[1] - a[1]
    )[0];
  }, [data]);

  const developmentDimension = useMemo(() => {
    if (!data?.dimensions) return null;

    return Object.entries(data.dimensions).sort(
      (a, b) => a[1] - b[1]
    )[0];
  }, [data]);

  /* =========================================================
     OVERALL PROFILE SIGNAL
     Derived from the existing personality dimensions.
     This is NOT treated as a new personality dimension.
     ========================================================= */

  const overallProfileSignal = useMemo(() => {
    if (!data?.dimensions) return null;

    const values = Object.values(data.dimensions);

    if (!values.length) return null;

    const total = values.reduce(
      (sum, value) => sum + Number(value || 0),
      0
    );

    return Math.round(total / values.length);
  }, [data]);

  const dominantTraits = useMemo(
    () => getDominantTraits(data),
    [data]
  );

  const behavioralInsights = useMemo(
    () => getBehavioralInsights(data),
    [data]
  );

  const developmentFocus = useMemo(
    () => getDevelopmentFocus(data),
    [data]
  );

  function goNext() {
    if (!readingSessionId) return;

    navigate(
      `/recommendations?reading_session_id=${readingSessionId}`
    );
  }

  function goBack() {
    if (!readingSessionId) {
      navigate("/ai-interpretation");
      return;
    }

    navigate(
      `/ai-interpretation?reading_session_id=${readingSessionId}`
    );
  }

  return (
    <>
      {/* =====================================================
          PAGE-SPECIFIC ANIMATION STYLES
          ===================================================== */}

      <style>{`
        .pi-page {
          animation: piPageEnter 0.55s ease both;
        }

        @keyframes piPageEnter {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .pi-hero-icon {
          position: relative;
          overflow: visible;
          animation: piIconFloat 4s ease-in-out infinite;
        }

        .pi-hero-icon::before,
        .pi-hero-icon::after {
          content: "";
          position: absolute;
          inset: -6px;
          border-radius: 14px;
          border: 1px solid rgba(185, 154, 104, 0.20);
          pointer-events: none;
        }

        .pi-hero-icon::before {
          animation: piPulse 2.8s ease-out infinite;
        }

        .pi-hero-icon::after {
          animation: piPulse 2.8s ease-out 1.4s infinite;
        }

        @keyframes piIconFloat {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }

          50% {
            transform: translateY(-3px) rotate(2deg);
          }
        }

        @keyframes piPulse {
          0% {
            opacity: 0.55;
            transform: scale(0.95);
          }

          70% {
            opacity: 0;
            transform: scale(1.3);
          }

          100% {
            opacity: 0;
            transform: scale(1.3);
          }
        }

        .pi-profile-panel {
          animation: piCardEnter 0.55s ease 0.08s both;
        }

        .pi-snapshot-card {
          animation: piCardEnter 0.55s ease both;
          transition:
            transform 0.25s ease,
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .pi-snapshot-card:nth-child(1) {
          animation-delay: 0.14s;
        }

        .pi-snapshot-card:nth-child(2) {
          animation-delay: 0.20s;
        }

        .pi-snapshot-card:nth-child(3) {
          animation-delay: 0.26s;
        }

        .pi-snapshot-card:hover {
          transform: translateY(-4px);
          border-color: rgba(185, 154, 104, 0.34);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.20);
        }

        @keyframes piCardEnter {
          from {
            opacity: 0;
            transform: translateY(15px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .pi-section {
          animation: piCardEnter 0.55s ease both;
        }

        /* =====================================================
           PERSONALITY DIMENSIONS
           Forced 2-column balanced layout
           ===================================================== */

        .pi-dimensions-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-top: 18px;
        }

        .pi-dimension-card {
          min-width: 0;
          animation: piDimensionEnter 0.55s ease
            var(--pi-delay) both;
          transition:
            transform 0.25s ease,
            border-color 0.25s ease,
            background 0.25s ease;
        }

        .pi-dimension-card:hover {
          transform: translateY(-3px);
          border-color: rgba(185, 154, 104, 0.30);
          background:
            linear-gradient(
              135deg,
              rgba(185, 154, 104, 0.055),
              rgba(139, 118, 216, 0.035)
            );
        }

        .pi-overall-card {
          position: relative;
          overflow: hidden;
        }

        .pi-overall-card::after {
          content: "";
          position: absolute;
          width: 80px;
          height: 80px;
          right: -28px;
          bottom: -28px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              rgba(185, 154, 104, 0.14),
              transparent 68%
            );
          pointer-events: none;
        }

        @keyframes piDimensionEnter {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .pi-score-fill {
          transform-origin: left center;
          animation: piScoreFill 1.15s
            cubic-bezier(0.22, 1, 0.36, 1)
            var(--pi-delay) both;
        }

        @keyframes piScoreFill {
          from {
            transform: scaleX(0);
          }

          to {
            transform: scaleX(1);
          }
        }

        .pi-trait {
          animation: piTraitEnter 0.45s ease
            var(--pi-delay) both;
          transition:
            transform 0.22s ease,
            background 0.22s ease;
        }

        .pi-trait:hover {
          transform: translateX(4px);
          background: rgba(185, 154, 104, 0.045);
        }

        @keyframes piTraitEnter {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* =====================================================
           BEHAVIORAL INSIGHTS
           2 × 2 balanced layout
           ===================================================== */

        .pi-behavioral-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .pi-insight-card {
          min-width: 0;
          animation: piCardEnter 0.55s ease
            var(--pi-delay) both;
          transition:
            transform 0.25s ease,
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .pi-insight-card:hover {
          transform: translateY(-4px);
          border-color: rgba(185, 154, 104, 0.30);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
        }

        .pi-insight-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          color: var(--accent);
          background:
            linear-gradient(
              135deg,
              rgba(185, 154, 104, 0.11),
              rgba(139, 118, 216, 0.08)
            );
          border: 1px solid
            rgba(185, 154, 104, 0.16);
          margin-bottom: 14px;
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .pi-insight-card:hover .pi-insight-icon {
          transform: rotate(-5deg) scale(1.06);
          box-shadow:
            0 0 18px
            rgba(185, 154, 104, 0.12);
        }

        .pi-focus-card {
          position: relative;
          overflow: hidden;
          animation: piCardEnter 0.55s ease both;
        }

        .pi-focus-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 3px;
          height: 100%;
          background:
            linear-gradient(
              180deg,
              var(--accent),
              rgba(139, 118, 216, 0.7)
            );
          opacity: 0.75;
        }

        .pi-reflection {
          margin-top: 16px;
          padding: 16px 18px;
          border-radius: 12px;
          border: 1px solid
            rgba(185, 154, 104, 0.14);
          background:
            rgba(185, 154, 104, 0.035);
        }

        .pi-reflection strong {
          display: block;
          margin-top: 7px;
          line-height: 1.55;
        }

        .pi-loading {
          min-height: 180px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .pi-loading-icon {
          animation: piLoadingSpin 2s linear infinite;
        }

        @keyframes piLoadingSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 760px) {
          .pi-dimensions-grid,
          .pi-behavioral-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pi-page,
          .pi-profile-panel,
          .pi-snapshot-card,
          .pi-section,
          .pi-dimension-card,
          .pi-score-fill,
          .pi-trait,
          .pi-insight-card,
          .pi-focus-card,
          .pi-hero-icon,
          .pi-loading-icon {
            animation: none !important;
          }

          .pi-snapshot-card,
          .pi-dimension-card,
          .pi-insight-card,
          .pi-trait {
            transition: none !important;
          }
        }
      `}</style>

      <div className="page-container pi-page">

        {/* ===================================================
            HEADER
            =================================================== */}

        <div className="page-title">
          <div className="page-title-icon pi-hero-icon">
            <Brain />
          </div>

          <div>
            <span className="section-kicker">
              PERSONALITY INTELLIGENCE
            </span>

            <h1>Personality Profile</h1>

            <p>
              Explore behavioral dimensions, strengths,
              patterns and development areas derived from
              the intelligence profile.
            </p>
          </div>
        </div>

        {/* ===================================================
            LOADING
            =================================================== */}

        {loading && (
          <section className="panel pi-loading">
            <Brain
              className="pi-loading-icon"
              size={34}
            />

            <span
              className="section-kicker"
              style={{ marginTop: "16px" }}
            >
              ANALYZING PROFILE
            </span>

            <h2>
              Preparing personality intelligence...
            </h2>

            <p>
              Mapping behavioral dimensions and
              development signals.
            </p>
          </section>
        )}

        {/* ===================================================
            ERROR
            =================================================== */}

        {error && !loading && (
          <section className="panel error-panel">
            <strong>{error}</strong>

            <div className="button-row">
              <button
                className="button secondary"
                onClick={goBack}
              >
                <ArrowLeft size={17} />
                Back to AI Interpretation
              </button>
            </div>
          </section>
        )}

        {/* ===================================================
            MAIN CONTENT
            =================================================== */}

        {data && !loading && (
          <>
            {/* ===============================================
                PROFILE OVERVIEW
                =============================================== */}

            <section className="panel pi-profile-panel">
              <span className="section-kicker">
                PROFILE TYPE
              </span>

              <div className="profile-type-row">
                <div>
                  <h2>{data.profile_type}</h2>

                  <p>{data.summary}</p>

                  <p
                    style={{
                      marginTop: "12px",
                    }}
                  >
                    {getProfileSummary(data)}
                  </p>
                </div>

                <div className="profile-type-icon pi-hero-icon">
                  <Brain size={30} />
                </div>
              </div>
            </section>

            {/* ===============================================
                SNAPSHOT
                =============================================== */}

            <section className="personality-snapshot-grid">
              <div className="snapshot-card pi-snapshot-card">
                <div className="snapshot-icon">
                  <TrendingUp size={18} />
                </div>

                <span className="section-kicker">
                  STRONGEST SIGNAL
                </span>

                <h3>
                  {strongestDimension
                    ? formatLabel(
                        strongestDimension[0]
                      )
                    : "—"}
                </h3>

                <strong>
                  {strongestDimension
                    ? `${strongestDimension[1]}%`
                    : "—"}
                </strong>
              </div>

              <div className="snapshot-card pi-snapshot-card">
                <div className="snapshot-icon">
                  <Target size={18} />
                </div>

                <span className="section-kicker">
                  DEVELOPMENT FOCUS
                </span>

                <h3>
                  {developmentDimension
                    ? formatLabel(
                        developmentDimension[0]
                      )
                    : "—"}
                </h3>

                <strong>
                  {developmentDimension
                    ? `${developmentDimension[1]}%`
                    : "—"}
                </strong>
              </div>

              <div className="snapshot-card pi-snapshot-card">
                <div className="snapshot-icon">
                  <Sparkles size={18} />
                </div>

                <span className="section-kicker">
                  PROFILE SIGNALS
                </span>

                <h3>
                  {data.dimensions
                    ? Object.keys(data.dimensions)
                        .length
                    : 0}{" "}
                  Dimensions
                </h3>

                <strong>
                  {data.strengths?.length || 0}{" "}
                  Strengths
                </strong>
              </div>
            </section>

            {/* ===============================================
                DIMENSIONS
                =============================================== */}

            <section className="panel pi-section">
              <span className="section-kicker">
                PERSONALITY DIMENSIONS
              </span>

              <h2 className="section-heading">
                Behavioral signal map
              </h2>

              <p>
                These scores represent the relative
                signals available in the current
                intelligence profile.
              </p>

              <div className="pi-dimensions-grid">

                {/* Existing personality dimensions */}

                {Object.entries(
                  data.dimensions || {}
                ).map(([key, value], index) => (
                  <div
                    className="metric-card personality-metric-card pi-dimension-card"
                    key={key}
                    style={{
                      "--pi-delay": `${index * 70}ms`,
                    }}
                  >
                    <div className="metric-head">
                      <span className="section-kicker">
                        {formatLabel(key)}
                      </span>

                      <strong>{value}%</strong>
                    </div>

                    <div className="score-bar">
                      <i
                        className="pi-score-fill"
                        style={{
                          width: `${value}%`,
                          "--pi-delay": `${
                            index * 70 + 180
                          }ms`,
                        }}
                      />
                    </div>
                  </div>
                ))}

                {/* =================================================
                    DERIVED 8TH CARD
                    Keeps the grid visually balanced without
                    inventing a new personality dimension.
                    ================================================= */}

                <div
                  className="metric-card personality-metric-card pi-dimension-card pi-overall-card"
                  style={{
                    "--pi-delay": `${
                      Object.keys(
                        data.dimensions || {}
                      ).length * 70
                    }ms`,
                  }}
                >
                  <div className="metric-head">
                    <span className="section-kicker">
                      OVERALL PROFILE SIGNAL
                    </span>

                    <strong>
                      {overallProfileSignal !== null
                        ? `${overallProfileSignal}%`
                        : "—"}
                    </strong>
                  </div>

                  <div className="score-bar">
                    <i
                      className="pi-score-fill"
                      style={{
                        width: `${
                          overallProfileSignal || 0
                        }%`,
                        "--pi-delay": `${
                          Object.keys(
                            data.dimensions || {}
                          ).length * 70 +
                          180
                        }ms`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ===============================================
                DOMINANT TRAITS
                =============================================== */}

            <section className="panel pi-section">
              <span className="section-kicker">
                DOMINANT TRAITS
              </span>

              <h2 className="section-heading">
                Your strongest behavioral signals
              </h2>

              <p>
                These are the highest-scoring dimensions
                in the current profile and provide the
                clearest behavioral signals.
              </p>

              <div
                style={{
                  display: "grid",
                  gap: "6px",
                  marginTop: "18px",
                }}
              >
                {dominantTraits.map(
                  (trait, index) => (
                    <div
                      className="pi-trait"
                      key={trait.name}
                      style={{
                        "--pi-delay": `${
                          index * 80
                        }ms`,
                        display: "grid",
                        gridTemplateColumns:
                          "minmax(150px, 1fr) 80px",
                        gap: "20px",
                        alignItems: "center",
                        padding: "11px 12px",
                        borderRadius: "9px",
                      }}
                    >
                      <span>
                        {trait.name}
                      </span>

                      <strong
                        style={{
                          textAlign: "right",
                          color: "var(--accent)",
                        }}
                      >
                        {trait.value}%
                      </strong>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* ===============================================
                BEHAVIORAL INSIGHTS
                =============================================== */}

            <section className="pi-section">
              <div
                style={{
                  marginBottom: "18px",
                }}
              >
                <span className="section-kicker">
                  BEHAVIORAL INSIGHTS
                </span>

                <h2 className="section-heading">
                  How this profile may express itself
                </h2>

                <p>
                  These interpretations connect your
                  measured dimensions with practical
                  behavioral patterns.
                </p>
              </div>

              <div className="pi-behavioral-grid">
                <section
                  className="panel pi-insight-card"
                  style={{
                    "--pi-delay": "80ms",
                  }}
                >
                  <div className="pi-insight-icon">
                    <Compass size={19} />
                  </div>

                  <span className="section-kicker">
                    DECISION MAKING
                  </span>

                  <h3>
                    Intuition & reasoning
                  </h3>

                  <p>
                    {behavioralInsights.decisionMaking}
                  </p>
                </section>

                <section
                  className="panel pi-insight-card"
                  style={{
                    "--pi-delay": "140ms",
                  }}
                >
                  <div className="pi-insight-icon">
                    <MessageCircle size={19} />
                  </div>

                  <span className="section-kicker">
                    INTERACTION STYLE
                  </span>

                  <h3>
                    Communication & connection
                  </h3>

                  <p>
                    {behavioralInsights.interactionStyle}
                  </p>
                </section>

                <section
                  className="panel pi-insight-card"
                  style={{
                    "--pi-delay": "200ms",
                  }}
                >
                  <div className="pi-insight-icon">
                    <Workflow size={19} />
                  </div>

                  <span className="section-kicker">
                    WORK STYLE
                  </span>

                  <h3>
                    Structure & adaptability
                  </h3>

                  <p>
                    {behavioralInsights.workStyle}
                  </p>
                </section>

                <section
                  className="panel pi-insight-card"
                  style={{
                    "--pi-delay": "260ms",
                  }}
                >
                  <div className="pi-insight-icon">
                    <TrendingUp size={19} />
                  </div>

                  <span className="section-kicker">
                    GROWTH STYLE
                  </span>

                  <h3>
                    Reflection & development
                  </h3>

                  <p>
                    {behavioralInsights.growthStyle}
                  </p>
                </section>
              </div>
            </section>

            {/* ===============================================
                STRENGTHS + DEVELOPMENT
                =============================================== */}

            <div className="personality-insight-grid">
              <section
                className="panel personality-list-panel pi-section"
              >
                <div className="list-heading">
                  <Sparkles size={18} />

                  <span className="section-kicker">
                    CORE STRENGTHS
                  </span>
                </div>

                <p>
                  Behavioral qualities that currently
                  stand out most strongly in your profile.
                </p>

                <ul>
                  {(data.strengths || []).map(
                    (item) => (
                      <li key={item}>
                        <CheckCircle2
                          size={15}
                        />
                        <span>{item}</span>
                      </li>
                    )
                  )}
                </ul>
              </section>

              <section
                className="panel personality-list-panel pi-section"
              >
                <div className="list-heading">
                  <Target size={18} />

                  <span className="section-kicker">
                    DEVELOPMENT AREAS
                  </span>
                </div>

                <p>
                  Areas where deliberate practice may
                  help convert potential into stronger
                  outcomes.
                </p>

                <ul>
                  {(
                    data.development_areas || []
                  ).map((item) => (
                    <li key={item}>
                      <Target size={15} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* ===============================================
                DEVELOPMENT FOCUS
                =============================================== */}

            <section className="panel pi-focus-card">
              <span className="section-kicker">
                DEVELOPMENT FOCUS
              </span>

              <h2 className="section-heading">
                From current tendency to growth direction
              </h2>

              <div
                className="insight-grid"
                style={{
                  marginTop: "20px",
                }}
              >
                <div>
                  <span className="section-kicker">
                    CURRENT TENDENCY
                  </span>

                  <p>
                    {developmentFocus.current}
                  </p>
                </div>

                <div>
                  <span className="section-kicker">
                    GROWTH DIRECTION
                  </span>

                  <p>
                    {developmentFocus.direction}
                  </p>
                </div>
              </div>

              <div className="pi-reflection">
                <span className="section-kicker">
                  REFLECTION QUESTION
                </span>

                <strong>
                  {developmentFocus.reflection}
                </strong>
              </div>
            </section>

            {/* ===============================================
                NAVIGATION
                =============================================== */}

            <div className="button-row">
              <button
                className="button secondary"
                onClick={goBack}
              >
                <ArrowLeft size={17} />
                Back: AI Interpretation
              </button>

              <button
                className="button primary"
                onClick={goNext}
              >
                Next: Recommendations
                <ArrowRight size={17} />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}