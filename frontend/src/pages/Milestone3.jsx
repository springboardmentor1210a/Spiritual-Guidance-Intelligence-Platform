import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  CheckCircle2,
  Compass,
  Heart,
  Lightbulb,
  MessageCircle,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
} from "lucide-react";
import api from "../api/client";

const styles = `
.m3-page {
  width: min(1180px, calc(100% - 40px));
  max-width: 1180px;
  margin: 0 auto;
  padding: 34px 0 70px;
  color: #493426;
}

.m3-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 28px;
  align-items: end;
  padding: 4px 0 26px;
  border-bottom: 1px solid #e6d7c4;
  margin-bottom: 22px;
}

.m3-hero-copy {
  max-width: 760px;
}

.m3-hero-copy > p:not(.m3-eyebrow) {
  margin: 13px 0 0;
  color: #765b45;
  font-size: 13px;
  line-height: 1.75;
}

.m3-hero-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.m3-engine-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 12px;
  border: 1px solid #decab0;
  border-radius: 999px;
  background: #f4e8d8;
  color: #6d4d34;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}

.m3-refresh {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid #cdb395;
  border-radius: 9px;
  padding: 9px 13px;
  background: #fffaf2;
  color: #62442e;
  font-size: 11px;
  font-weight: 750;
  cursor: pointer;
}

.m3-refresh:hover { background: #f2e4d2; }
.m3-refresh:disabled { opacity: .55; cursor: wait; }

.m3-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.m3-stat {
  position: relative;
  overflow: hidden;
  min-height: 116px;
  padding: 17px;
  border: 1px solid #e5d6c3;
  border-radius: 15px;
  background: #fffaf2;
  box-shadow: 0 8px 24px rgba(74, 45, 25, .035);
}

.m3-stat::after {
  content: "";
  position: absolute;
  width: 80px;
  height: 80px;
  right: -30px;
  bottom: -40px;
  border-radius: 50%;
  background: #f4e7d5;
}

.m3-stat-icon {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 33px;
  height: 33px;
  margin-bottom: 13px;
  border-radius: 9px;
  background: #f0e2cf;
  color: #765234;
}

.m3-stat span {
  position: relative;
  z-index: 1;
  display: block;
  color: #8b715a;
  font-size: 10px;
  font-weight: 700;
}

.m3-stat strong {
  position: relative;
  z-index: 1;
  display: block;
  margin-top: 3px;
  color: #4d3020;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 27px;
}

.m3-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(310px, .75fr);
  gap: 18px;
}

.m3-panel {
  min-width: 0;
  padding: 21px;
  border: 1px solid #e5d6c3;
  border-radius: 17px;
  background: #fffaf2;
  box-shadow: 0 9px 26px rgba(74, 45, 25, .035);
}

.m3-wide {
  grid-column: 1 / -1;
}

.m3-section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 15px;
}

.m3-section-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.m3-section-icon {
  display: grid;
  place-items: center;
  width: 35px;
  height: 35px;
  flex: 0 0 auto;
  border-radius: 10px;
  background: #f0e2cf;
  color: #765234;
}

.m3-panel h2 {
  margin: 0;
  color: #513524;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 20px;
  line-height: 1.2;
}

.m3-panel-subtitle {
  margin: 5px 0 0;
  color: #927a63;
  font-size: 10px;
  line-height: 1.55;
}

.m3-reflection {
  padding: 19px;
  border: 1px solid #e2ceb4;
  border-radius: 14px;
  background: linear-gradient(135deg, #f5eadc, #fffaf2);
}

.m3-reflection-label {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 10px;
  color: #795639;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.m3-reflection p {
  margin: 0;
  color: #664a35;
  font-size: 13px;
  line-height: 1.8;
}

.m3-note {
  margin-top: 11px;
  padding: 11px 13px;
  border-radius: 10px;
  background: #f6ecdf;
  color: #896f57;
  font-size: 9px;
  line-height: 1.65;
}

.m3-theme-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 11px;
}

.m3-theme-card {
  padding: 13px;
  border: 1px solid #eadccb;
  border-radius: 12px;
  background: #fcf6ec;
}

.m3-theme-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.m3-theme-name {
  color: #60432d;
  font-size: 11px;
  font-weight: 800;
  text-transform: capitalize;
}

.m3-theme-score {
  color: #9a7653;
  font-size: 9px;
  font-weight: 800;
}

.m3-theme-bar {
  height: 6px;
  margin-top: 9px;
  overflow: hidden;
  border-radius: 99px;
  background: #eadfce;
}

.m3-theme-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #8c6240, #c5a17a);
}

.m3-theme-card p {
  margin: 8px 0 0;
  color: #846b54;
  font-size: 9px;
  line-height: 1.55;
}

.m3-list {
  display: grid;
  gap: 0;
}

.m3-list-item {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr);
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #eee2d2;
}

.m3-list-item:last-child { border-bottom: 0; }

.m3-list-number {
  display: grid;
  place-items: center;
  width: 27px;
  height: 27px;
  border-radius: 8px;
  background: #f0e2cf;
  color: #765234;
  font-size: 10px;
  font-weight: 800;
}

.m3-list-item p {
  margin: 2px 0 0;
  color: #765d47;
  font-size: 11px;
  line-height: 1.7;
}

.m3-insight-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.m3-insight-card {
  padding: 14px;
  border: 1px solid #eadccb;
  border-radius: 12px;
  background: #fcf6ec;
}

.m3-insight-card strong {
  display: block;
  color: #63452e;
  font-size: 11px;
  margin-bottom: 6px;
}

.m3-insight-card p {
  margin: 0;
  color: #80664e;
  font-size: 10px;
  line-height: 1.65;
}

.m3-activity {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 14px;
  border: 1px solid #eadccb;
  border-radius: 12px;
  background: #fcf6ec;
}

.m3-activity-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  border-radius: 12px;
  background: #f0e2cf;
  color: #765234;
}

.m3-activity strong {
  display: block;
  color: #63452e;
  font-size: 13px;
  margin-bottom: 4px;
}

.m3-activity p {
  margin: 0;
  color: #80664e;
  font-size: 10px;
  line-height: 1.6;
}

.m3-trend-list {
  display: grid;
  gap: 14px;
}

.m3-trend-row {
  display: grid;
  grid-template-columns: 80px minmax(0, 1fr) 100px;
  gap: 12px;
  align-items: center;
}

.m3-trend-label {
  color: #755942;
  font-size: 10px;
  font-weight: 750;
}

.m3-trend-track {
  height: 9px;
  overflow: hidden;
  border-radius: 99px;
  background: #eee2d2;
}

.m3-trend-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #876043, #c4a078);
  transition: width .45s ease;
}

.m3-trend-count {
  color: #92775c;
  font-size: 9px;
  text-align: right;
}

.m3-engine {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

.m3-engine-mark {
  display: grid;
  place-items: center;
  width: 39px;
  height: 39px;
  border-radius: 11px;
  background: #edf0e6;
  color: #667050;
}

.m3-engine strong {
  display: block;
  color: #60432d;
  font-size: 12px;
  margin-bottom: 4px;
}

.m3-engine p {
  margin: 0;
  color: #816851;
  font-size: 10px;
  line-height: 1.65;
}

.m3-empty {
  margin: 0;
  padding: 12px 0;
  color: #927b64;
  font-size: 11px;
  line-height: 1.7;
}

.m3-error {
  padding: 13px 15px;
  margin-bottom: 18px;
  border: 1px solid #e6c9bd;
  border-radius: 11px;
  background: #fbede7;
  color: #8c4f3e;
  font-size: 11px;
}

.m3-loading {
  padding: 42px 20px;
  border: 1px solid #e5d6c3;
  border-radius: 16px;
  background: #fffaf2;
  color: #856b52;
  text-align: center;
}

.m3-loading svg {
  animation: m3-spin 1.2s linear infinite;
}

@keyframes m3-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 900px) {
  .m3-layout { grid-template-columns: 1fr; }
  .m3-stats { grid-template-columns: repeat(2, 1fr); }
  .m3-hero { grid-template-columns: 1fr; }
  .m3-hero-side { align-items: flex-start; }
}

@media (max-width: 600px) {
  .m3-page { width: min(100% - 24px, 1180px); padding-top: 22px; }
  .m3-stats,
  .m3-theme-grid,
  .m3-insight-grid { grid-template-columns: 1fr; }
  .m3-trend-row { grid-template-columns: 68px minmax(0, 1fr) 75px; }
  .m3-panel { padding: 16px; }
}
`;

function Stat({ icon: Icon, label, value }) {
  return (
    <article className="m3-stat">
      <div className="m3-stat-icon"><Icon size={17} /></div>
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
    </article>
  );
}

function asText(item) {
  if (typeof item === "string") return item;
  return item?.action || item?.text || item?.description || item?.interpretation || "";
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function themeName(theme) {
  return String(theme?.theme || theme?.name || "reflection").replace(/_/g, " ");
}

function themeScore(theme) {
  return Number(theme?.score ?? theme?.count ?? 0);
}

export default function Milestone3() {
  const [dashboard, setDashboard] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setError("");
    setRefreshing(true);

    try {
      const [dashboardResponse, trendResponse] = await Promise.all([
        api.get("/api/intelligence/dashboard"),
        api.get("/api/intelligence/life-trends"),
      ]);

      setDashboard(dashboardResponse.data);
      setTrends(trendResponse.data);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Unable to load the intelligence dashboard. Check your backend and login session."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const themes = safeArray(trends?.recurring_themes);
  const recommendations = safeArray(dashboard?.recommendations);
  const nextActions = safeArray(dashboard?.next_actions);
  const personality = safeArray(dashboard?.personality_insights);
  const monthly = safeArray(trends?.monthly_activity);

  const maxTheme = Math.max(1, ...themes.map(themeScore));
  const maxMonth = Math.max(1, ...monthly.map((item) => Number(item?.total || 0)));

  const strongestTheme = useMemo(
    () =>
      [...themes].sort((a, b) => themeScore(b) - themeScore(a))[0],
    [themes]
  );

  const currentReflection =
    dashboard?.personalized_interpretation?.interpretation ||
    dashboard?.personalized_interpretation?.text ||
    "Save more Palm and Tarot readings to build a richer personalized reflection.";

  if (loading) {
    return (
      <div className="page-container">
        <style>{styles}</style>
        <div className="m3-loading">
          <Sparkles size={26} />
          <p>Preparing your intelligence dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <style>{styles}</style>

      <main className="m3-page">
        <header className="m3-hero">
          <div className="m3-hero-copy">
            <h1>Your Intelligence Dashboard</h1>
            <p>
              Welcome {dashboard?.name || dashboard?.user_name || "back"}. Your
              saved Palm and Tarot activity is brought together into one
              explainable reflection workspace.
            </p>
          </div>

          <div className="m3-hero-side">
            <div className="m3-engine-status">
              <Brain size={14} />
              {dashboard?.engine_status === "rule_based_intelligence"
                ? "Intelligence engine active · Explainable"
                : "Intelligence engine active"}
            </div>

            <button
              type="button"
              className="m3-refresh"
              onClick={loadDashboard}
              disabled={refreshing}
            >
              <RefreshCw size={14} />
              {refreshing ? "Refreshing..." : "Refresh dashboard"}
            </button>
          </div>
        </header>

        {error && <div className="m3-error">{error}</div>}

        <section className="m3-stats">
          <Stat
            icon={BookOpen}
            label="Total readings"
            value={dashboard?.total_readings}
          />
          <Stat
            icon={Sparkles}
            label="Tarot readings"
            value={dashboard?.tarot_readings}
          />
          <Stat
            icon={Heart}
            label="Palm readings"
            value={dashboard?.palm_readings}
          />
          <Stat
            icon={CheckCircle2}
            label="Profile completed"
            value={dashboard?.profile_completed ? "Yes" : "No"}
          />
        </section>

        <div className="m3-layout">
          <section className="m3-panel m3-wide">
            <div className="m3-section-head">
              <div>
                <div className="m3-section-title">
                  <span className="m3-section-icon"><MessageCircle size={17} /></span>
                  <h2>Personalized intelligence reflection</h2>
                </div>
                <p className="m3-panel-subtitle">
                  A contextual reflection generated from your profile and saved
                  reading activity.
                </p>
              </div>
            </div>

            <div className="m3-reflection">
              <div className="m3-reflection-label">
                <Brain size={14} />
                Your current reflection
              </div>
              <p>{currentReflection}</p>
            </div>

            <div className="m3-note">
              This reflection identifies patterns in your saved activity. It is
              intended for personal reflection and does not provide scientific
              predictions, medical diagnoses or psychological assessments.
            </div>
          </section>

          <section className="m3-panel">
            <div className="m3-section-head">
              <div>
                <div className="m3-section-title">
                  <span className="m3-section-icon"><Target size={17} /></span>
                  <h2>Reading snapshot</h2>
                </div>
                <p className="m3-panel-subtitle">The strongest signal in your current activity.</p>
              </div>
            </div>

            {strongestTheme ? (
              <div className="m3-reflection">
                <div className="m3-label">Dominant theme</div>
                <h2>{themeName(strongestTheme)}</h2>
                <p style={{ marginTop: 9 }}>
                  {strongestTheme.description ||
                    "This theme appears most strongly in the available reading text."}
                </p>
              </div>
            ) : (
              <p className="m3-empty">Themes will appear as reading activity grows.</p>
            )}
          </section>

          <section className="m3-panel">
            <div className="m3-section-head">
              <div>
                <div className="m3-section-title">
                  <span className="m3-section-icon"><Activity size={17} /></span>
                  <h2>Activity signal</h2>
                </div>
                <p className="m3-panel-subtitle">How much activity is currently available for reflection.</p>
              </div>
            </div>

            {dashboard?.activity_signal ? (
              <div className="m3-activity">
                <div className="m3-activity-icon"><BarChart3 size={20} /></div>
                <div>
                  <strong>{dashboard.activity_signal.label}</strong>
                  <p>{dashboard.activity_signal.description}</p>
                </div>
              </div>
            ) : (
              <p className="m3-empty">Activity information is not available yet.</p>
            )}
          </section>

          <section className="m3-panel m3-wide">
            <div className="m3-section-head">
              <div>
                <div className="m3-section-title">
                  <span className="m3-section-icon"><Compass size={17} /></span>
                  <h2>Recurring reflection themes</h2>
                </div>
                <p className="m3-panel-subtitle">
                  Themes identified from the text of your saved profile and reading records.
                </p>
              </div>
            </div>

            {themes.length ? (
              <div className="m3-theme-grid">
                {themes.slice(0, 6).map((theme, index) => {
                  const score = themeScore(theme);
                  return (
                    <article className="m3-theme-card" key={`${themeName(theme)}-${index}`}>
                      <div className="m3-theme-top">
                        <span className="m3-theme-name">{themeName(theme)}</span>
                        <span className="m3-theme-score">{score} match(es)</span>
                      </div>
                      <div className="m3-theme-bar">
                        <div
                          className="m3-theme-fill"
                          style={{ width: `${Math.max(6, (score / maxTheme) * 100)}%` }}
                        />
                      </div>
                      {theme.description && <p>{theme.description}</p>}
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="m3-empty">Themes will appear after more reading content is available.</p>
            )}

            <div className="m3-note">
              Theme scores describe recurring keywords and topics in available
              text. They are not personality classifications.
            </div>
          </section>

          <section className="m3-panel">
            <div className="m3-section-head">
              <div>
                <div className="m3-section-title">
                  <span className="m3-section-icon"><UserRound size={17} /></span>
                  <h2>Personality intelligence</h2>
                </div>
                <p className="m3-panel-subtitle">Reflective observations from profile and reading activity.</p>
              </div>
            </div>

            {personality.length ? (
              <div className="m3-insight-grid">
                {personality.slice(0, 4).map((item, index) => (
                  <article className="m3-insight-card" key={index}>
                    <strong>{item?.title || "Reflection"}</strong>
                    <p>{asText(item) || "No additional reflection is available."}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="m3-empty">
                Add profile information and save readings to generate personal reflections.
              </p>
            )}
          </section>

          <section className="m3-panel">
            <div className="m3-section-head">
              <div>
                <div className="m3-section-title">
                  <span className="m3-section-icon"><Lightbulb size={17} /></span>
                  <h2>Smart recommendations</h2>
                </div>
                <p className="m3-panel-subtitle">
                  Practical suggestions based on interests, goals and reading history.
                </p>
              </div>
            </div>

            {recommendations.length ? (
              <div className="m3-list">
                {recommendations.slice(0, 5).map((item, index) => (
                  <div className="m3-list-item" key={index}>
                    <span className="m3-list-number">{index + 1}</span>
                    <p>{asText(item)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="m3-empty">
                Recommendations will appear as your profile and reading history grow.
              </p>
            )}
          </section>

          <section className="m3-panel">
            <div className="m3-section-head">
              <div>
                <div className="m3-section-title">
                  <span className="m3-section-icon"><ArrowRight size={17} /></span>
                  <h2>Your next actions</h2>
                </div>
                <p className="m3-panel-subtitle">Small practical steps based on your strongest themes.</p>
              </div>
            </div>

            {nextActions.length ? (
              <div className="m3-list">
                {nextActions.slice(0, 4).map((action, index) => (
                  <div className="m3-list-item" key={action?.id || index}>
                    <span className="m3-list-number">{index + 1}</span>
                    <p>{action?.action || asText(action)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="m3-empty">Your next actions will appear as more themes are identified.</p>
            )}
          </section>

          <section className="m3-panel">
            <div className="m3-section-head">
              <div>
                <div className="m3-section-title">
                  <span className="m3-section-icon"><TrendingUp size={17} /></span>
                  <h2>Life trend analysis</h2>
                </div>
                <p className="m3-panel-subtitle">Monthly reading activity across the last six calendar months.</p>
              </div>
            </div>

            {monthly.length ? (
              <div className="m3-trend-list">
                {monthly.map((month, index) => (
                  <div className="m3-trend-row" key={`${month?.year}-${month?.month}-${index}`}>
                    <span className="m3-trend-label">{month?.label || month?.month}</span>
                    <div className="m3-trend-track">
                      <div
                        className="m3-trend-fill"
                        style={{ width: `${Math.max(3, (Number(month?.total || 0) / maxMonth) * 100)}%` }}
                      />
                    </div>
                    <span className="m3-trend-count">
                      {month?.total || 0} · P {month?.palm || 0} · T {month?.tarot || 0}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="m3-empty">No monthly activity is available yet.</p>
            )}

            <div className="m3-note">
              These charts represent saved reading activity, not predictions about future events.
            </div>
          </section>

          <section className="m3-panel m3-wide">
            <div className="m3-section-head">
              <div>
                <div className="m3-section-title">
                  <span className="m3-section-icon"><CheckCircle2 size={17} /></span>
                  <h2>Intelligence engine</h2>
                </div>
                <p className="m3-panel-subtitle">Current implementation status.</p>
              </div>
            </div>

            <div className="m3-engine">
              <div className="m3-engine-mark"><Brain size={19} /></div>
              <div>
                <strong>
                  {dashboard?.engine_status === "rule_based_intelligence"
                    ? "Explainable personalized intelligence layer"
                    : "Personalized intelligence layer"}
                </strong>
                <p>
                  {dashboard?.engine_note ||
                    "The intelligence engine combines saved activity and profile context for reflective insights."}
                </p>
              </div>
            </div>

            <div className="m3-note">
              Intelligence engine is designed for reflection and personalization.
              It does not claim scientific prediction, medical diagnosis or psychological assessment.
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
