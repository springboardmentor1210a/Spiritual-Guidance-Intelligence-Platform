import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { apiRequest } from "../api/client";

export default function Recommendations() {
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

  /* =========================================================
     LOAD DATA
     ========================================================= */

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
      `/api/v1/milestone3/recommendations/${readingSessionId}`
    )
      .then(setData)
      .catch((err) => {
        setError(
          err.message ||
            "Unable to load personalized recommendations."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [readingSessionId]);

  /* =========================================================
     DERIVED DATA
     ========================================================= */

  const recommendations =
    data?.recommendations || [];

  const focusAreas = useMemo(() => {
    return [
      ...new Set(
        recommendations.map(
          (item) => item.area
        )
      ),
    ];
  }, [recommendations]);

  const completionPercentage =
    recommendations.length > 0 ? 100 : 0;

  const primaryRecommendation =
    recommendations[0] || null;

  /* =========================================================
     NAVIGATION
     ========================================================= */

  function goNext() {
    if (!readingSessionId) return;

    navigate(
      `/life-trends?reading_session_id=${readingSessionId}`
    );
  }

  function goBack() {
    if (!readingSessionId) {
      navigate("/personality-intelligence");
      return;
    }

    navigate(
      `/personality-intelligence?reading_session_id=${readingSessionId}`
    );
  }

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <>
      {/* =====================================================
          PAGE ANIMATIONS
          ===================================================== */}

      <style>{`
        .recommendations-page {
          animation: recommendationsPageIn 0.55s ease both;
        }

        @keyframes recommendationsPageIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* -----------------------------------------------
           HERO ICON
        ----------------------------------------------- */

        .recommendations-hero-icon {
          position: relative;
          overflow: visible;
          animation:
            recommendationIconFloat
            3.8s
            ease-in-out
            infinite;
        }

        .recommendations-hero-icon::before,
        .recommendations-hero-icon::after {
          content: "";
          position: absolute;
          inset: -7px;
          border-radius: 15px;
          border: 1px solid
            rgba(185, 154, 104, 0.18);
          pointer-events: none;
        }

        .recommendations-hero-icon::before {
          animation:
            recommendationIconPulse
            2.8s
            ease-out
            infinite;
        }

        .recommendations-hero-icon::after {
          animation:
            recommendationIconPulse
            2.8s
            ease-out
            1.4s
            infinite;
        }

        @keyframes recommendationIconFloat {
          0%,
          100% {
            transform:
              translateY(0)
              rotate(0deg);
          }

          50% {
            transform:
              translateY(-4px)
              rotate(3deg);
          }
        }

        @keyframes recommendationIconPulse {
          0% {
            opacity: 0.5;
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

        /* -----------------------------------------------
           INTRO
        ----------------------------------------------- */

        .recommendation-intro {
          display: flex;
          gap: 18px;
          align-items: flex-start;
          animation:
            recommendationCardIn
            0.55s
            ease
            0.08s
            both;
        }

        .recommendation-intro-icon {
          width: 46px;
          height: 46px;
          min-width: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          color: var(--accent);
          background:
            linear-gradient(
              135deg,
              rgba(185, 154, 104, 0.12),
              rgba(139, 118, 216, 0.08)
            );
          border: 1px solid
            rgba(185, 154, 104, 0.18);
          box-shadow:
            0 8px 24px
            rgba(0, 0, 0, 0.16);
          animation:
            recommendationTargetPulse
            3s
            ease-in-out
            infinite;
        }

        @keyframes recommendationTargetPulse {
          0%,
          100% {
            box-shadow:
              0 8px 24px
              rgba(0, 0, 0, 0.16);
          }

          50% {
            box-shadow:
              0 8px 30px
              rgba(185, 154, 104, 0.12);
          }
        }

        /* -----------------------------------------------
           SUMMARY
        ----------------------------------------------- */

        .recommendation-summary {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin: 16px 0;
        }

        .recommendation-summary-item {
          position: relative;
          overflow: hidden;
          padding: 18px;
          border-radius: 13px;
          border: 1px solid
            rgba(255, 255, 255, 0.08);
          background:
            rgba(255, 255, 255, 0.018);
          animation:
            recommendationCardIn
            0.55s
            ease
            var(--recommendation-delay)
            both;
          transition:
            transform 0.25s ease,
            border-color 0.25s ease,
            background 0.25s ease;
        }

        .recommendation-summary-item:hover {
          transform: translateY(-3px);
          border-color:
            rgba(185, 154, 104, 0.28);
          background:
            rgba(185, 154, 104, 0.035);
        }

        .recommendation-summary-item::after {
          content: "";
          position: absolute;
          right: -25px;
          bottom: -30px;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background:
            rgba(185, 154, 104, 0.045);
          filter: blur(4px);
        }

        .recommendation-summary-value {
          display: block;
          margin-top: 6px;
          font-size: 26px;
          font-weight: 600;
          color: var(--text);
        }

        /* -----------------------------------------------
           FOCUS AREA STRIP
        ----------------------------------------------- */

        .recommendation-focus-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 18px 0 22px;
          animation:
            recommendationCardIn
            0.55s
            ease
            0.25s
            both;
        }

        .recommendation-focus-tag {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 11px;
          border-radius: 999px;
          border: 1px solid
            rgba(185, 154, 104, 0.16);
          background:
            rgba(185, 154, 104, 0.035);
          color: #c5b8a4;
          font-size: 12px;
          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            background 0.2s ease;
        }

        .recommendation-focus-tag:hover {
          transform: translateY(-2px);
          border-color:
            rgba(185, 154, 104, 0.30);
          background:
            rgba(185, 154, 104, 0.065);
        }

        .recommendation-focus-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow:
            0 0 8px
            rgba(185, 154, 104, 0.35);
        }

        /* -----------------------------------------------
           CARDS
        ----------------------------------------------- */

        .recommendation-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        /*
         * SIX-CARD LAYOUT
         *
         * Card 1     Card 2
         * Card 3     Card 4
         * Card 5     Card 6
         */

        .recommendation-card {
          position: relative;
          overflow: hidden;
          animation:
            recommendationCardIn
            0.65s
            cubic-bezier(0.22, 1, 0.36, 1)
            var(--recommendation-delay)
            both;
          transition:
            transform 0.28s ease,
            border-color 0.28s ease,
            box-shadow 0.28s ease,
            background 0.28s ease;
        }

        .recommendation-card:hover {
          transform: translateY(-6px);
          border-color:
            rgba(185, 154, 104, 0.32);
          box-shadow:
            0 18px 40px
            rgba(0, 0, 0, 0.24);
          background:
            linear-gradient(
              135deg,
              rgba(185, 154, 104, 0.035),
              rgba(139, 118, 216, 0.025)
            );
        }

        .recommendation-card::before {
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
              rgba(139, 118, 216, 0.65)
            );
          opacity: 0.45;
          transition:
            opacity 0.25s ease,
            width 0.25s ease;
        }

        .recommendation-card:hover::before {
          opacity: 0.9;
          width: 4px;
        }

        @keyframes recommendationCardIn {
          from {
            opacity: 0;
            transform:
              translateY(18px)
              scale(0.985);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
        }

        /* -----------------------------------------------
           CARD HEADER
        ----------------------------------------------- */

        .recommendation-card-top {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .recommendation-number {
          width: 35px;
          height: 35px;
          min-width: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
          color: var(--accent);
          background:
            rgba(185, 154, 104, 0.075);
          border: 1px solid
            rgba(185, 154, 104, 0.16);
          transition:
            transform 0.25s ease,
            background 0.25s ease;
        }

        .recommendation-card:hover
        .recommendation-number {
          transform: rotate(-4deg) scale(1.08);
          background:
            rgba(185, 154, 104, 0.12);
        }

        .recommendation-spark {
          margin-left: auto;
          color: var(--accent);
          opacity: 0.7;
          transition:
            transform 0.35s ease,
            opacity 0.25s ease;
        }

        .recommendation-card:hover
        .recommendation-spark {
          transform:
            rotate(18deg)
            scale(1.15);
          opacity: 1;
        }

        /* -----------------------------------------------
           DESCRIPTION
        ----------------------------------------------- */

        .recommendation-description {
          min-height: 58px;
          line-height: 1.65;
        }

        /* -----------------------------------------------
           ACTION AREA
        ----------------------------------------------- */

        .recommendation-action {
          margin-top: 20px;
          padding: 15px 16px;
          display: flex;
          gap: 11px;
          align-items: flex-start;
          border-radius: 12px;
          border: 1px solid
            rgba(185, 154, 104, 0.13);
          background:
            rgba(185, 154, 104, 0.035);
          transition:
            background 0.25s ease,
            border-color 0.25s ease,
            transform 0.25s ease;
        }

        .recommendation-card:hover
        .recommendation-action {
          background:
            rgba(185, 154, 104, 0.06);
          border-color:
            rgba(185, 154, 104, 0.22);
          transform: translateX(3px);
        }

        .recommendation-action-icon {
          width: 30px;
          height: 30px;
          min-width: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: var(--accent);
          background:
            rgba(185, 154, 104, 0.08);
        }

        .recommendation-action strong {
          display: block;
          margin-bottom: 4px;
        }

        .recommendation-action p {
          margin: 0;
          line-height: 1.55;
        }

        /* -----------------------------------------------
           WHY IT MATTERS
        ----------------------------------------------- */

        .recommendation-why {
          margin-top: 15px;
          padding: 13px 15px;
          border-left: 2px solid
            rgba(139, 118, 216, 0.55);
          background:
            rgba(139, 118, 216, 0.025);
          border-radius: 0 9px 9px 0;
        }

        .recommendation-why p {
          margin-top: 5px;
          line-height: 1.55;
        }

        /* -----------------------------------------------
           PRIMARY RECOMMENDATION
        ----------------------------------------------- */

        .recommendation-highlight {
          margin-top: 18px;
          animation:
            recommendationCardIn
            0.65s
            ease
            0.48s
            both;
        }

        .recommendation-highlight-inner {
          display: flex;
          gap: 15px;
          align-items: flex-start;
        }

        .recommendation-highlight-icon {
          width: 44px;
          height: 44px;
          min-width: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          color: var(--accent);
          background:
            linear-gradient(
              135deg,
              rgba(185, 154, 104, 0.12),
              rgba(139, 118, 216, 0.08)
            );
          border: 1px solid
            rgba(185, 154, 104, 0.17);
        }

        /* -----------------------------------------------
           RESPONSIVE
        ----------------------------------------------- */

        @media (max-width: 850px) {
          .recommendation-grid {
            grid-template-columns: 1fr;
          }

          .recommendation-summary {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .recommendation-intro {
            flex-direction: column;
          }
        }

        /* -----------------------------------------------
           REDUCED MOTION
        ----------------------------------------------- */

        @media (prefers-reduced-motion: reduce) {
          .recommendations-page,
          .recommendation-intro,
          .recommendation-summary-item,
          .recommendation-focus-strip,
          .recommendation-card,
          .recommendation-highlight,
          .recommendations-hero-icon,
          .recommendation-intro-icon {
            animation: none !important;
          }

          .recommendation-card,
          .recommendation-summary-item,
          .recommendation-focus-tag {
            transition: none !important;
          }
        }
      `}</style>

      <div className="page-container recommendations-page">

        {/* =================================================
            HEADER
            ================================================= */}

        <div className="page-title">
          <div className="page-title-icon recommendations-hero-icon">
            <Lightbulb />
          </div>

          <div>
            <span className="section-kicker">
              RECOMMENDATION ENGINE
            </span>

            <h1>Personalized Recommendations</h1>

            <p>
              Practical guidance generated from the
              selected intelligence profile.
            </p>
          </div>
        </div>

        {/* =================================================
            LOADING
            ================================================= */}

        {loading && (
          <section
            className="panel"
            style={{
              minHeight: "180px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              flexDirection: "column",
            }}
          >
            <Lightbulb
              size={34}
              style={{
                color: "var(--accent)",
                animation:
                  "recommendationIconFloat 2s ease-in-out infinite",
              }}
            />

            <span
              className="section-kicker"
              style={{ marginTop: "16px" }}
            >
              GENERATING GUIDANCE
            </span>

            <h2>
              Preparing personalized recommendations...
            </h2>

            <p>
              Connecting your profile insights with
              practical focus areas.
            </p>
          </section>
        )}

        {/* =================================================
            ERROR
            ================================================= */}

        {error && !loading && (
          <section className="panel error-panel">
            <strong>{error}</strong>

            <div className="button-row">
              <button
                className="button secondary"
                onClick={goBack}
              >
                <ArrowLeft size={17} />
                Back: Personality Intelligence
              </button>
            </div>
          </section>
        )}

        {/* =================================================
            CONTENT
            ================================================= */}

        {data && !loading && (
          <>
            {/* =============================================
                INTRO
                ============================================= */}

            <section className="panel recommendation-intro">
              <div className="recommendation-intro-icon">
                <Target size={21} />
              </div>

              <div>
                <span className="section-kicker">
                  PERSONALIZED ACTION PLAN
                </span>

                <h2>
                  Turn your insights into practical
                  next steps
                </h2>

                <p>
                  These recommendations connect your
                  current intelligence profile with
                  practical actions across important
                  focus areas.
                </p>
              </div>
            </section>

            {/* =============================================
                SUMMARY
                ============================================= */}

            <section className="recommendation-summary">

              <div
                className="recommendation-summary-item"
                style={{
                  "--recommendation-delay": "120ms",
                }}
              >
                <span className="section-kicker">
                  TOTAL RECOMMENDATIONS
                </span>

                <span className="recommendation-summary-value">
                  {recommendations.length}
                </span>
              </div>

              <div
                className="recommendation-summary-item"
                style={{
                  "--recommendation-delay": "180ms",
                }}
              >
                <span className="section-kicker">
                  FOCUS AREAS
                </span>

                <span className="recommendation-summary-value">
                  {focusAreas.length}
                </span>
              </div>

              <div
                className="recommendation-summary-item"
                style={{
                  "--recommendation-delay": "240ms",
                }}
              >
                <span className="section-kicker">
                  ACTIONABLE
                </span>

                <span className="recommendation-summary-value">
                  {completionPercentage}%
                </span>
              </div>
            </section>

            {/* =============================================
                FOCUS AREAS
                ============================================= */}

            <div className="recommendation-focus-strip">
              {focusAreas.map((area) => (
                <span
                  className="recommendation-focus-tag"
                  key={area}
                >
                  <span className="recommendation-focus-dot" />
                  {area}
                </span>
              ))}
            </div>

            {/* =============================================
                PRIMARY RECOMMENDATION
                ============================================= */}

            {primaryRecommendation && (
              <section className="panel recommendation-highlight">
                <div className="recommendation-highlight-inner">

                  <div className="recommendation-highlight-icon">
                    <TrendingUp size={21} />
                  </div>

                  <div>
                    <span className="section-kicker">
                      STARTING POINT
                    </span>

                    <h2>
                      Begin with{" "}
                      {primaryRecommendation.title}
                    </h2>

                    <p>
                      {primaryRecommendation.description}
                    </p>

                    <div className="recommendation-action">
                      <div className="recommendation-action-icon">
                        <CheckCircle2 size={16} />
                      </div>

                      <div>
                        <strong>
                          Recommended first action
                        </strong>

                        <p>
                          {primaryRecommendation.action}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </section>
            )}

            {/* =============================================
                RECOMMENDATION CARDS
                ============================================= */}

            <section
              style={{
                marginTop: "24px",
                marginBottom: "14px",
              }}
            >
              <span className="section-kicker">
                PERSONALIZED GUIDANCE
              </span>

              <h2 className="section-heading">
                Recommended actions
              </h2>

              <p>
                Each recommendation represents a
                practical direction derived from the
                current intelligence profile.
              </p>
            </section>

            <div className="recommendation-grid">

              {recommendations.map(
                (recommendation, index) => (
                  <section
                    className="panel recommendation-card"
                    key={`${recommendation.title}-${index}`}
                    style={{
                      "--recommendation-delay": `${
                        280 + index * 110
                      }ms`,
                    }}
                  >

                    {/* CARD HEADER */}

                    <div className="recommendation-card-top">

                      <div className="recommendation-number">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <span className="section-kicker">
                        {recommendation.area}
                      </span>

                      <Sparkles
                        size={17}
                        className="recommendation-spark"
                      />

                    </div>

                    {/* TITLE */}

                    <h2>
                      {recommendation.title}
                    </h2>

                    {/* DESCRIPTION */}

                    <p className="recommendation-description">
                      {recommendation.description}
                    </p>

                    {/* WHY IT MATTERS */}

                    <div className="recommendation-why">

                      <span className="section-kicker">
                        WHY IT MATTERS
                      </span>

                      <p>
                        This recommendation focuses
                        on{" "}
                        <strong>
                          {recommendation.area}
                        </strong>{" "}
                        and translates your current
                        profile into a practical
                        direction.
                      </p>

                    </div>

                    {/* ACTION */}

                    <div className="recommendation-action">

                      <div className="recommendation-action-icon">
                        <CheckCircle2 size={16} />
                      </div>

                      <div>
                        <strong>
                          Action
                        </strong>

                        <p>
                          {recommendation.action}
                        </p>
                      </div>

                    </div>

                  </section>
                )
              )}

              {/* =========================================
                  CARD 6
                  ========================================= */}

              <section
                className="panel recommendation-card"
                style={{
                  "--recommendation-delay": "830ms",
                }}
              >

                <div className="recommendation-card-top">

                  <div className="recommendation-number">
                    06
                  </div>

                  <span className="section-kicker">
                    SELF REFLECTION
                  </span>

                  <Sparkles
                    size={17}
                    className="recommendation-spark"
                  />

                </div>

                <h2>
                  Reflect and review your progress
                </h2>

                <p className="recommendation-description">
                  Take time to reflect on the
                  recommendations that feel most relevant
                  to your current personal growth journey.
                </p>

                <div className="recommendation-why">

                  <span className="section-kicker">
                    WHY IT MATTERS
                  </span>

                  <p>
                    Reflection helps you connect
                    personalized guidance with your
                    own experiences, priorities and
                    future direction.
                  </p>

                </div>

                <div className="recommendation-action">

                  <div className="recommendation-action-icon">
                    <CheckCircle2 size={16} />
                  </div>

                  <div>
                    <strong>
                      Action
                    </strong>

                    <p>
                      Choose one recommendation to
                      focus on and review your progress
                      regularly.
                    </p>
                  </div>

                </div>

              </section>

            </div>

            {/* =============================================
                ACTION SUMMARY
                ============================================= */}

            <section
              className="panel"
              style={{
                marginTop: "22px",
                animation:
                  "recommendationCardIn 0.65s ease 0.75s both",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                }}
              >

                <div className="recommendation-intro-icon">
                  <Target size={19} />
                </div>

                <div>
                  <span className="section-kicker">
                    NEXT STEP
                  </span>

                  <h2>
                    Move from recommendation to
                    reflection
                  </h2>

                  <p>
                    The next section will connect these
                    recommendations with your broader
                    life trend patterns, opportunities
                    and growth directions.
                  </p>
                </div>

              </div>
            </section>

            {/* =============================================
                NAVIGATION
                ============================================= */}

            <div className="button-row">

              <button
                className="button secondary"
                onClick={goBack}
              >
                <ArrowLeft size={17} />
                Back: Personality Intelligence
              </button>

              <button
                className="button primary"
                onClick={goNext}
              >
                Next: Life Trends
                <ArrowRight size={17} />
              </button>

            </div>
          </>
        )}
      </div>
    </>
  );
}