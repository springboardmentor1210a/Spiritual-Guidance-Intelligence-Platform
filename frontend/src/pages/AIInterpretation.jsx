import { useEffect, useState } from "react";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { apiRequest } from "../api/client";

const fields = [
  ["Personality", "personality"],
  ["Relationships", "relationships"],
  ["Career", "career"],
  ["Finance", "finance"],
  ["Health & Wellness", "health_wellness"],
  ["Personal Growth", "personal_growth"],
];

function getStoredSessionId(key) {
  return localStorage.getItem(key);
}

export default function AIInterpretation() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [sourceMode, setSourceMode] = useState("");
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    loadInterpretation();
  }, []);

  async function loadInterpretation() {
    try {
      setLoading(true);
      setError("");

      const palmSessionId = getStoredSessionId(
        "latest_palm_reading_session_id"
      );

      const tarotSessionId = getStoredSessionId(
        "latest_tarot_reading_session_id"
      );

      if (!palmSessionId && !tarotSessionId) {
        setError(
          "No Palm or Tarot reading is available yet. Complete a Palm Analysis or Tarot Reading first."
        );
        return;
      }

      let currentSessionId;

      if (palmSessionId && tarotSessionId) {
        const context = await apiRequest(
          "/api/v1/milestone3/context",
          {
            method: "POST",
            body: JSON.stringify({
              palm_reading_session_id: Number(palmSessionId),
              tarot_reading_session_id: Number(tarotSessionId),
            }),
          }
        );

        currentSessionId = context.reading_session_id;
        setSourceMode("Palm + Tarot");
      } else if (palmSessionId) {
        currentSessionId = Number(palmSessionId);
        setSourceMode("Palm Analysis");
      } else {
        currentSessionId = Number(tarotSessionId);
        setSourceMode("Tarot Reading");
      }

      setSessionId(currentSessionId);

      const interpretation = await apiRequest(
        `/api/v1/milestone3/ai-interpretation/${currentSessionId}`
      );

      setData(interpretation);

      localStorage.setItem(
        "milestone3_reading_session_id",
        String(currentSessionId)
      );
    } catch (err) {
      setError(
        err.message || "Unable to load AI interpretation."
      );
    } finally {
      setLoading(false);
    }
  }

  function goToNextPage() {
    if (!sessionId) return;

    navigate(
      `/personality-intelligence?reading_session_id=${sessionId}`
    );
  }

  return (
    <div className="page-container">

      {/* ============================================================
          PAGE HEADER
      ============================================================ */}

      <div className="page-title">
        <div className="page-title-icon ai-main-icon">
          <Sparkles />
        </div>

        <div>
          <span className="section-kicker">
            AI INTERPRETATION ENGINE
          </span>

          <h1>Personalized Interpretation</h1>

          <p>
            Explore the patterns, themes and insights generated
            from your reading context.
          </p>
        </div>
      </div>

      {/* ============================================================
          LOADING
      ============================================================ */}

      {loading && (
        <section className="panel ai-loading-panel">
          <div className="ai-loading-icon">
            <Sparkles size={24} />
          </div>

          <span className="section-kicker">
            AI PROCESSING
          </span>

          <h2>
            Generating personalized interpretation...
          </h2>

          <p>
            Connecting your reading context with the
            intelligence profile.
          </p>

          <div className="ai-loading-bar">
            <span />
          </div>
        </section>
      )}

      {/* ============================================================
          ERROR
      ============================================================ */}

      {error && (
        <section className="panel error-panel">
          <strong>{error}</strong>

          <div className="button-row">
            <button
              className="button primary"
              onClick={() => navigate("/palm-analysis")}
            >
              Start Palm Analysis
            </button>

            <button
              className="button secondary"
              onClick={() => navigate("/tarot-reading")}
            >
              Start Tarot Reading
            </button>
          </div>
        </section>
      )}

      {data && (
        <>
          {/* ========================================================
              SIX CORE INSIGHTS
          ======================================================== */}

          <section className="ai-section">

            <div className="section-heading-row">
              <div>
                <span className="section-kicker">
                  CORE INSIGHTS
                </span>

                <h2>
                  Your reading across key life areas
                </h2>
              </div>

              <div className="ai-status-badge">
                <Sparkles size={14} />
                Intelligence Active
              </div>
            </div>

            <div className="insight-grid ai-core-grid">
              {fields.map(([title, key], index) => (
                <div
                  className="insight-card ai-insight-card"
                  key={key}
                  style={{
                    animationDelay: `${index * 80}ms`,
                  }}
                >
                  <div className="ai-card-icon">
                    <Sparkles size={17} />
                  </div>

                  <span className="section-kicker">
                    0{index + 1}
                  </span>

                  <h3>{title}</h3>

                  <p>{data[key]}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ========================================================
              KEY THEMES
          ======================================================== */}

          {data.key_themes?.length > 0 && (
            <section className="panel ai-themes-panel">

              <div className="section-heading-row">
                <div>
                  <span className="section-kicker">
                    KEY THEMES
                  </span>

                  <h2>
                    Patterns appearing across your reading
                  </h2>
                </div>

                <div className="ai-section-icon">
                  <Target size={19} />
                </div>
              </div>

              <div className="theme-chip-grid">
                {data.key_themes.map((theme, index) => (
                  <div
                    className="theme-chip"
                    key={`${theme}-${index}`}
                  >
                    <CheckCircle2 size={15} />
                    <span>{theme}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ========================================================
              DOMINANT PATTERNS
          ======================================================== */}

          {data.dominant_patterns?.length > 0 && (
            <section className="ai-section">

              <div className="section-heading-row">
                <div>
                  <span className="section-kicker">
                    DOMINANT PATTERNS
                  </span>

                  <h2>
                    Recurring patterns identified
                  </h2>
                </div>

                <div className="ai-section-icon">
                  <Brain size={19} />
                </div>
              </div>

              <div className="pattern-grid">
                {data.dominant_patterns.map(
                  (pattern, index) => (
                    <div
                      className="pattern-card"
                      key={`${pattern.title}-${index}`}
                      style={{
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                      <div className="pattern-number">
                        0{index + 1}
                      </div>

                      <div>
                        <h3>{pattern.title}</h3>

                        <p>
                          {pattern.description}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>
          )}

          {/* ========================================================
              SYNTHESIS
          ======================================================== */}

          {data.synthesis && (
            <section className="panel synthesis-panel">

              <div className="synthesis-icon">
                <Lightbulb size={22} />
              </div>

              <div>
                <span className="section-kicker">
                  CROSS-DOMAIN SYNTHESIS
                </span>

                <h2>
                  What the combined patterns suggest
                </h2>

                <p>
                  {data.synthesis}
                </p>
              </div>
            </section>
          )}

          {/* ========================================================
              AREAS TO REFLECT
          ======================================================== */}

          {data.areas_to_reflect?.length > 0 && (
            <section className="panel reflection-panel">

              <div className="section-heading-row">
                <div>
                  <span className="section-kicker">
                    AREAS TO REFLECT
                  </span>

                  <h2>
                    Questions for deeper self-reflection
                  </h2>
                </div>
              </div>

              <div className="reflection-list">
                {data.areas_to_reflect.map(
                  (question, index) => (
                    <div
                      className="reflection-item"
                      key={`${question}-${index}`}
                    >
                      <span>
                        {index + 1}
                      </span>

                      <p>{question}</p>
                    </div>
                  )
                )}
              </div>
            </section>
          )}

          {/* ========================================================
              NEXT
          ======================================================== */}

          <div className="button-row ai-next-row">
            <button
              className="button primary"
              onClick={goToNextPage}
            >
              Next: Personality Intelligence
              <ArrowRight size={17} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}