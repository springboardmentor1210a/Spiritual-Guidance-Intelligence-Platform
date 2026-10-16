import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Compass,
  Lightbulb,
  Sparkles,
  TrendingUp,
  UserRound,
  WandSparkles,
} from "lucide-react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { apiRequest } from "../api/client";

function formatLabel(value) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

export default function Milestone3Dashboard() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  /*
   * Priority:
   *
   * 1. reading_session_id from URL
   * 2. Milestone 3 session stored in localStorage
   * 3. latest palm reading
   * 4. latest tarot reading
   */

  const querySessionId =
    params.get("reading_session_id");

  const [readingSessionId, setReadingSessionId] =
    useState(querySessionId || null);

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resolveReadingSession();
  }, [querySessionId]);

  async function resolveReadingSession() {
    try {
      setLoading(true);
      setError("");

      /*
       * ----------------------------------------------------
       * 1. URL SESSION
       * ----------------------------------------------------
       */

      if (querySessionId) {
        localStorage.setItem(
          "milestone3_reading_session_id",
          String(querySessionId)
        );

        setReadingSessionId(
          String(querySessionId)
        );

        await loadDashboard(querySessionId);
        return;
      }

      /*
       * ----------------------------------------------------
       * 2. EXISTING MILESTONE 3 SESSION
       * ----------------------------------------------------
       */

      const storedMilestone3Session =
        localStorage.getItem(
          "milestone3_reading_session_id"
        );

      if (storedMilestone3Session) {
        setReadingSessionId(
          storedMilestone3Session
        );

        await loadDashboard(
          storedMilestone3Session
        );

        return;
      }

      /*
       * ----------------------------------------------------
       * 3. FALLBACK TO LATEST PALM / TAROT
       * ----------------------------------------------------
       */

      const palmSessionId =
        localStorage.getItem(
          "latest_palm_reading_session_id"
        );

      const tarotSessionId =
        localStorage.getItem(
          "latest_tarot_reading_session_id"
        );

      /*
       * PALM + TAROT
       *
       * Create/reuse the combined Milestone 3
       * context.
       */

      if (palmSessionId && tarotSessionId) {
        const context = await apiRequest(
          "/api/v1/milestone3/context",
          {
            method: "POST",
            body: JSON.stringify({
              palm_reading_session_id:
                Number(palmSessionId),

              tarot_reading_session_id:
                Number(tarotSessionId),
            }),
          }
        );

        const combinedSessionId =
          context.reading_session_id;

        localStorage.setItem(
          "milestone3_reading_session_id",
          String(combinedSessionId)
        );

        setReadingSessionId(
          String(combinedSessionId)
        );

        await loadDashboard(
          combinedSessionId
        );

        return;
      }

      /*
       * PALM ONLY
       */

      if (palmSessionId) {
        localStorage.setItem(
          "milestone3_reading_session_id",
          String(palmSessionId)
        );

        setReadingSessionId(
          String(palmSessionId)
        );

        await loadDashboard(palmSessionId);

        return;
      }

      /*
       * TAROT ONLY
       */

      if (tarotSessionId) {
        localStorage.setItem(
          "milestone3_reading_session_id",
          String(tarotSessionId)
        );

        setReadingSessionId(
          String(tarotSessionId)
        );

        await loadDashboard(tarotSessionId);

        return;
      }

      /*
       * ----------------------------------------------------
       * NO READING AVAILABLE
       * ----------------------------------------------------
       */

      setError(
        "No reading is available yet. Complete a Palm Analysis or Tarot Reading first."
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to load personalized dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadDashboard(sessionId) {
    const result = await apiRequest(
      `/api/v1/milestone3/dashboard/${sessionId}`
    );

    setData(result);
  }

  const dashboard = data?.dashboard_data;

  /*
   * --------------------------------------------------------
   * DERIVED DASHBOARD DATA
   * --------------------------------------------------------
   */

  const trendEntries = useMemo(() => {
    if (!dashboard?.life_trends) {
      return [];
    }

    return Object.entries(
      dashboard.life_trends
    );
  }, [dashboard]);

  const averageTrendScore = useMemo(() => {
    if (!trendEntries.length) {
      return 0;
    }

    return Math.round(
      trendEntries.reduce(
        (total, [, trend]) =>
          total + Number(trend.score || 0),
        0
      ) / trendEntries.length
    );
  }, [trendEntries]);

  const strongestTrend = useMemo(() => {
    if (!trendEntries.length) {
      return null;
    }

    return [...trendEntries].sort(
      (a, b) =>
        Number(b[1].score) -
        Number(a[1].score)
    )[0];
  }, [trendEntries]);

  const personalityEntries = useMemo(() => {
  if (!dashboard?.personality?.dimensions) {
    return [];
  }

  const entries = Object.entries(
    dashboard.personality.dimensions
  );

  const overallGrowth =
    entries.length > 0
      ? Math.round(
          entries.reduce(
            (total, [, value]) =>
              total + Number(value || 0),
            0
          ) / entries.length
        )
      : 0;

  return [
    ...entries,
    ["overall_growth", overallGrowth],
  ];
}, [dashboard]);

  /*
   * --------------------------------------------------------
   * NAVIGATION
   * --------------------------------------------------------
   */

  function goToAIInterpretation() {
    if (!readingSessionId) return;

    navigate(
      `/ai-interpretation?reading_session_id=${readingSessionId}`
    );
  }

  function goToPersonality() {
    if (!readingSessionId) return;

    navigate(
      `/personality-intelligence?reading_session_id=${readingSessionId}`
    );
  }

  function goToRecommendations() {
    if (!readingSessionId) return;

    navigate(
      `/recommendations?reading_session_id=${readingSessionId}`
    );
  }

  function goToLifeTrends() {
    if (!readingSessionId) return;

    navigate(
      `/life-trends?reading_session_id=${readingSessionId}`
    );
  }

  /*
   * --------------------------------------------------------
   * LOADING
   * --------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="page-container milestone-dashboard-page">
        <div className="page-title dashboard-header">
          <div className="page-title-icon dashboard-ai-icon">
            <Sparkles />
          </div>

          <div>
            <span className="section-kicker">
              PERSONALIZED DASHBOARD
            </span>

            <h1>
              My Intelligence Dashboard
            </h1>

            <p>
              Bringing your Milestone 3 intelligence
              results together.
            </p>
          </div>
        </div>

        <section className="panel dashboard-loading">
          <div className="dashboard-loading-orb">
            <Sparkles size={22} />
          </div>

          <div>
            <span className="section-kicker">
              LOADING INTELLIGENCE
            </span>

            <h2>
              Preparing your personalized dashboard...
            </h2>

            <p>
              Connecting your interpretation,
              personality profile, recommendations
              and life trends.
            </p>
          </div>
        </section>
      </div>
    );
  }

  /*
   * --------------------------------------------------------
   * ERROR
   * --------------------------------------------------------
   */

  if (error || !dashboard) {
    return (
      <div className="page-container milestone-dashboard-page">
        <div className="page-title dashboard-header">
          <div className="page-title-icon dashboard-ai-icon">
            <Sparkles />
          </div>

          <div>
            <span className="section-kicker">
              PERSONALIZED DASHBOARD
            </span>

            <h1>
              My Intelligence Dashboard
            </h1>

            <p>
              Unified view of your Milestone 3
              intelligence results.
            </p>
          </div>
        </div>

        <section className="panel error-panel dashboard-error">
          <div className="dashboard-error-icon">
            <Sparkles size={21} />
          </div>

          <div>
            <strong>
              {error ||
                "Unable to load personalized dashboard."}
            </strong>

            <p>
              Complete a Palm Analysis or Tarot
              Reading to create your intelligence
              context.
            </p>
          </div>

          <div className="button-row">
            <button
              className="button primary"
              onClick={() =>
                navigate("/palm-analysis")
              }
            >
              Palm Analysis
              <ArrowRight size={17} />
            </button>

            <button
              className="button secondary"
              onClick={() =>
                navigate("/tarot-reading")
              }
            >
              Tarot Reading
              <ArrowRight size={17} />
            </button>
          </div>
        </section>
      </div>
    );
  }

  /*
   * --------------------------------------------------------
   * MAIN DASHBOARD
   * --------------------------------------------------------
   */

  return (
    <div className="page-container milestone-dashboard-page">
      {/* ====================================================
          HEADER
          ==================================================== */}

      <div className="page-title dashboard-header">
        <div className="page-title-icon dashboard-ai-icon">
          <Sparkles />
        </div>

        <div>
          <span className="section-kicker">
            PERSONALIZED DASHBOARD
          </span>

          <h1>
            My Intelligence Dashboard
          </h1>

          <p>
            A unified view of your interpretation,
            personality, recommendations and life
            trends.
          </p>
        </div>
      </div>

      {/* ====================================================
          PROFILE HERO
          ==================================================== */}

      <section className="panel dashboard-profile-hero dashboard-reveal">
        <div className="dashboard-profile-icon">
          <WandSparkles size={23} />
        </div>

        <div className="dashboard-profile-content">
          <span className="section-kicker">
            INTELLIGENCE PROFILE
          </span>

          <h2>
            {dashboard.profile_name}
          </h2>

          <p>{dashboard.overview}</p>

          <div className="dashboard-profile-meta">
            <span>
              <Sparkles size={13} />
              Milestone 3 Intelligence
            </span>

            <span>
              <CheckCircle2 size={13} />
              Personalized Context
            </span>
          </div>
        </div>
      </section>

      {/* ====================================================
          QUICK SNAPSHOT
          ==================================================== */}

      <section className="dashboard-summary-grid">
        <div
          className="dashboard-stat-card dashboard-reveal"
          style={{
            "--dashboard-delay": "70ms",
          }}
        >
          <div className="dashboard-stat-icon">
            <Brain size={18} />
          </div>

          <span className="section-kicker">
            PERSONALITY
          </span>

          <h3>
            {dashboard.personality.type}
          </h3>

          <p>
            {personalityEntries.length} behavioral
            dimensions tracked
          </p>
        </div>

        <div
          className="dashboard-stat-card dashboard-reveal"
          style={{
            "--dashboard-delay": "140ms",
          }}
        >
          <div className="dashboard-stat-icon">
            <TrendingUp size={18} />
          </div>

          <span className="section-kicker">
            TREND SIGNAL
          </span>

          <h3>{averageTrendScore}%</h3>

          <p>
            Overall life trend signal
          </p>
        </div>

        <div
          className="dashboard-stat-card dashboard-reveal"
          style={{
            "--dashboard-delay": "210ms",
          }}
        >
          <div className="dashboard-stat-icon">
            <Compass size={18} />
          </div>

          <span className="section-kicker">
            CURRENT PHASE
          </span>

          <h3>
            {dashboard.current_phase}
          </h3>

          <p>
            Current intelligence direction
          </p>
        </div>

        <div
          className="dashboard-stat-card dashboard-reveal"
          style={{
            "--dashboard-delay": "280ms",
          }}
        >
          <div className="dashboard-stat-icon">
            <Lightbulb size={18} />
          </div>

          <span className="section-kicker">
            RECOMMENDATIONS
          </span>

          <h3>
            {dashboard.top_recommendations
              ?.length || 0}
          </h3>

          <p>
            Priority actions available
          </p>
        </div>
      </section>

      {/* ====================================================
          PERSONALITY
          ==================================================== */}

      <section className="panel dashboard-section dashboard-reveal">
        <div className="dashboard-section-heading">
          <div className="dashboard-section-heading-icon">
            <Brain size={18} />
          </div>

          <div>
            <span className="section-kicker">
              PERSONALITY INTELLIGENCE
            </span>

            <h2>
              {dashboard.personality.type}
            </h2>

            <p>
              Your current behavioral dimensions
              and profile characteristics.
            </p>
          </div>
        </div>

        <div className="metrics-grid dashboard-metrics">
          {personalityEntries.map(
            ([key, value]) => (
              <div
                className="metric-card dashboard-metric-card"
                key={key}
              >
                <div className="metric-head">
                  <span className="section-kicker">
                    {formatLabel(key)}
                  </span>

                  <strong>{value}%</strong>
                </div>

                <div className="score-bar">
                  <i
                    style={{
                      width: `${value}%`,
                    }}
                  />
                </div>
              </div>
            )
          )}
        </div>

        <div className="dashboard-section-footer">
          <button
            className="button secondary"
            onClick={goToPersonality}
          >
            View Personality Intelligence
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ====================================================
          LIFE PHASE + STRONGEST TREND
          ==================================================== */}

      <section className="dashboard-two-column">
        <div className="panel dashboard-phase-card dashboard-reveal">
          <div className="dashboard-section-heading">
            <div className="dashboard-section-heading-icon">
              <Compass size={18} />
            </div>

            <div>
              <span className="section-kicker">
                CURRENT LIFE PHASE
              </span>

              <h2>
                {dashboard.current_phase}
              </h2>
            </div>
          </div>

          <p>
            {dashboard.trend_summary}
          </p>

          <button
            className="dashboard-text-button"
            onClick={goToLifeTrends}
          >
            Explore Life Trends
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="panel dashboard-phase-card dashboard-reveal">
          <div className="dashboard-section-heading">
            <div className="dashboard-section-heading-icon">
              <TrendingUp size={18} />
            </div>

            <div>
              <span className="section-kicker">
                STRONGEST TREND
              </span>

              <h2>
                {strongestTrend
                  ? formatLabel(
                      strongestTrend[0]
                    )
                  : "—"}
              </h2>
            </div>
          </div>

          {strongestTrend && (
            <>
              <div className="dashboard-strong-score">
                <strong>
                  {strongestTrend[1].score}%
                </strong>

                <span>
                  {strongestTrend[1].direction}
                </span>
              </div>

              <div className="score-bar">
                <i
                  style={{
                    width: `${strongestTrend[1].score}%`,
                  }}
                />
              </div>

              <p>
                {strongestTrend[1].path}
              </p>
            </>
          )}
        </div>
      </section>

      {/* ====================================================
          LIFE TRENDS
          ==================================================== */}

      <section className="panel dashboard-section dashboard-reveal">
        <div className="dashboard-section-heading">
          <div className="dashboard-section-heading-icon">
            <TrendingUp size={18} />
          </div>

          <div>
            <span className="section-kicker">
              LIFE TRENDS
            </span>

            <h2>
              Current direction signals
            </h2>

            <p>
              A consolidated view of the patterns
              identified by the intelligence engine.
            </p>
          </div>
        </div>

        <div
          className="insight-grid dashboard-trend-grid"
          style={{
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
          }}
        >
          {trendEntries.map(
            ([key, trend], index) => (
              <div
                className="insight-card dashboard-trend-card"
                key={key}
                style={{
                  "--dashboard-card-delay": `${
                    index * 80
                  }ms`,
                }}
              >
                <div className="dashboard-card-icon">
                  <Sparkles size={15} />
                </div>

                <span className="section-kicker">
                  {formatLabel(key)}
                </span>

                <h3>
                  {trend.direction}
                </h3>

                <div className="metric-head">
                  <span>Trend strength</span>

                  <strong>
                    {trend.score}%
                  </strong>
                </div>

                <div className="score-bar">
                  <i
                    style={{
                      width: `${trend.score}%`,
                    }}
                  />
                </div>

                <p>{trend.path}</p>
              </div>
            )
          )}
        </div>

        <div className="dashboard-section-footer">
          <button
            className="button secondary"
            onClick={goToLifeTrends}
          >
            Open Full Life Trends
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ====================================================
          RECOMMENDATIONS
          ==================================================== */}

      <section className="panel dashboard-section dashboard-reveal">
        <div className="dashboard-section-heading">
          <div className="dashboard-section-heading-icon">
            <Lightbulb size={18} />
          </div>

          <div>
            <span className="section-kicker">
              TOP RECOMMENDATIONS
            </span>

            <h2>
              Practical guidance for your profile
            </h2>

            <p>
              Your highest-priority actions from the
              recommendation engine.
            </p>
          </div>
        </div>

        <div className="insight-grid dashboard-recommendation-grid">
          {dashboard.top_recommendations.map(
            (recommendation, index) => (
              <div
                className="insight-card dashboard-recommendation-card"
                key={`${recommendation.title}-${index}`}
              >
                <div className="dashboard-card-icon">
                  <CheckCircle2 size={15} />
                </div>

                <span className="section-kicker">
                  {recommendation.area}
                </span>

                <h3>
                  {recommendation.title}
                </h3>

                <p>
                  {recommendation.description}
                </p>

                <div className="guidance">
                  <CheckCircle2 size={15} />

                  <span>
                    <strong>Action:</strong>{" "}
                    {recommendation.action}
                  </span>
                </div>
              </div>
            )
          )}
        </div>

        <div className="dashboard-section-footer">
          <button
            className="button secondary"
            onClick={goToRecommendations}
          >
            View All Recommendations
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ====================================================
          AI INTERPRETATION CTA
          ==================================================== */}

      <section className="panel dashboard-ai-panel dashboard-reveal">
        <div className="dashboard-ai-orb">
          <WandSparkles size={22} />
        </div>

        <div className="dashboard-ai-content">
          <span className="section-kicker">
            AI INTERPRETATION
          </span>

          <h2>
            Explore your personalized reading
          </h2>

          <p>
            Review the contextual interpretation
            generated from your current intelligence
            profile.
          </p>
        </div>

        <button
          className="button primary"
          onClick={goToAIInterpretation}
        >
          View AI Interpretation
          <ArrowRight size={17} />
        </button>
      </section>

      {/* ====================================================
          NAVIGATION
          ==================================================== */}

      <div className="button-row dashboard-navigation">
        <button
          className="button secondary"
          onClick={goToLifeTrends}
        >
          <ArrowLeft size={17} />
          Back: Life Trends
        </button>

        <button
          className="button primary"
          onClick={() =>
            navigate("/palm-analysis")
          }
        >
          New Reading
          <ArrowRight size={17} />
        </button>
      </div>
    </div>
  );
}