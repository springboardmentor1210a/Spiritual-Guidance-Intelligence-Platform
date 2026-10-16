import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  Lightbulb,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { apiRequest } from "../api/client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  LabelList,
} from "recharts";

function formatLabel(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function getDirectionIcon(direction) {
  const value = String(direction || "").toLowerCase();

  if (
    value.includes("declining") ||
    value.includes("challenge") ||
    value.includes("low") ||
    value.includes("attention") ||
    value.includes("decreasing")
  ) {
    return TrendingDown;
  }

  return TrendingUp;
}

function getSignalLevel(score) {
  const numericScore = Number(score || 0);

  if (numericScore >= 85) return "Strong";
  if (numericScore >= 70) return "Developing";
  return "Emerging";
}

function getSignalDescription(trend) {
  if (!trend) return "";

  if (trend.path) {
    return `${trend.direction || "Current trend"}. The current pattern follows ${trend.path}.`;
  }

  return (
    trend.direction ||
    "Current trend signal is being monitored."
  );
}

function getPastScore(trend) {
  if (!trend) return null;

  const value =
    trend.past_score ??
    trend.previous_score ??
    trend.pastScore ??
    null;

  return value === null ? null : Number(value);
}

function getPresentScore(trend) {
  if (!trend) return null;

  const value =
    trend.present_score ??
    trend.current_score ??
    trend.presentScore ??
    trend.score ??
    null;

  return value === null ? null : Number(value);
}

function getChange(trend) {
  if (!trend) return null;

  const explicitChange =
    trend.change ??
    trend.score_change ??
    trend.change_score ??
    null;

  if (explicitChange !== null) {
    return Number(explicitChange);
  }

  const past = getPastScore(trend);
  const present = getPresentScore(trend);

  if (past === null || present === null) {
    return null;
  }

  return present - past;
}

function getChangeLabel(change) {
  if (change === null || Number.isNaN(change)) {
    return "No comparison available";
  }

  if (change > 0) {
    return `+${change} from previous signal`;
  }

  if (change < 0) {
    return `${change} from previous signal`;
  }

  return "No change from previous signal";
}

function getChangeClass(change) {
  if (change === null || Number.isNaN(change)) {
    return "neutral";
  }

  if (change > 0) return "positive";
  if (change < 0) return "negative";

  return "neutral";
}

function getChartData(trend) {
  if (!trend) return [];

  const raw =
    trend.chart_data ??
    trend.chartData ??
    trend.progression ??
    [];

  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item, index) => {
      if (
        typeof item === "number" &&
        Number.isFinite(item)
      ) {
        return {
          label: `P${index + 1}`,
          value: item,
        };
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      const value =
        item.value ??
        item.score ??
        item.present_score ??
        item.y;

      if (
        value === undefined ||
        value === null ||
        Number.isNaN(Number(value))
      ) {
        return null;
      }

      return {
        label:
          item.label ??
          item.period ??
          item.name ??
          `P${index + 1}`,
        value: Number(value),
      };
    })
    .filter(Boolean);
}

function TrendProgressChart({ trend }) {
  const chartData = getChartData(trend);

  const past = getPastScore(trend);
  const present = getPresentScore(trend);

  /*
   * If the backend provides chart_data, use it.
   * Otherwise use the available past/present values.
   */
  const points =
    chartData.length >= 2
      ? chartData
      : past !== null && present !== null
        ? [
            {
              label: "Past",
              value: past,
            },
            {
              label: "Present",
              value: present,
            },
          ]
        : [];

  if (points.length < 2) {
    return (
      <div className="life-chart-empty">
        <Sparkles size={17} />

        <span>
          Trend progression data will appear when
          historical signals are available.
        </span>
      </div>
    );
  }

  const width = 760;
  const height = 240;
  const paddingX = 36;
  const paddingY = 30;

  const values = points.map((point) =>
    Number(point.value)
  );

  const minValue = Math.min(...values, 0);
  const maxValue = Math.max(...values, 100);
  const range = Math.max(maxValue - minValue, 1);

  const getX = (index) => {
    if (points.length === 1) return width / 2;

    return (
      paddingX +
      (index / (points.length - 1)) *
        (width - paddingX * 2)
    );
  };

  const getY = (value) => {
    return (
      height -
      paddingY -
      ((value - minValue) / range) *
        (height - paddingY * 2)
    );
  };

  const linePoints = points
    .map(
      (point, index) =>
        `${getX(index)},${getY(
          Number(point.value)
        )}`
    )
    .join(" ");

  return (
    <div className="life-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Trend progression chart"
      >
        <line
          x1={paddingX}
          y1={height - paddingY}
          x2={width - paddingX}
          y2={height - paddingY}
          className="chart-axis"
        />

        <line
          x1={paddingX}
          y1={paddingY}
          x2={paddingX}
          y2={height - paddingY}
          className="chart-axis"
        />

        <polyline
          points={linePoints}
          fill="none"
          className="chart-line"
        />

        {points.map((point, index) => (
          <g key={`${point.label}-${index}`}>
            <circle
              cx={getX(index)}
              cy={getY(Number(point.value))}
              r="5"
              className="chart-point"
            />

            <text
              x={getX(index)}
              y={height - 8}
              textAnchor="middle"
              className="chart-label"
            >
              {point.label}
            </text>

            <text
              x={getX(index)}
              y={
                getY(Number(point.value)) - 12
              }
              textAnchor="middle"
              className="chart-value"
            >
              {point.value}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function PastPresentComparison({ trend }) {
  const past = getPastScore(trend);
  const present = getPresentScore(trend);
  const change = getChange(trend);

  if (past === null || present === null) {
    return (
      <div className="life-comparison-empty">
        <Sparkles size={17} />

        <span>
          Historical comparison will appear when
          previous trend data is available.
        </span>
      </div>
    );
  }

  return (
    <div className="life-comparison">
      <div className="comparison-column">
        <span className="section-kicker">
          PAST
        </span>

        <strong>{past}%</strong>

        <div className="comparison-bar">
          <i
            style={{
              width: `${Math.min(
                Math.max(past, 0),
                100
              )}%`,
            }}
          />
        </div>
      </div>

      <div className="comparison-arrow">
        <ArrowRight size={19} />

        <span
          className={`change-pill ${getChangeClass(
            change
          )}`}
        >
          {change !== null && change > 0
            ? "+"
            : ""}
          {change ?? "—"}
        </span>
      </div>

      <div className="comparison-column">
        <span className="section-kicker">
          PRESENT
        </span>

        <strong>{present}%</strong>

        <div className="comparison-bar">
          <i
            style={{
              width: `${Math.min(
                Math.max(present, 0),
                100
              )}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function LifeTrends() {
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

    loadLifeTrends();
  }, [readingSessionId]);

  async function loadLifeTrends() {
    try {
      setLoading(true);
      setError("");

      const result = await apiRequest(
        `/api/v1/milestone3/life-trends/${readingSessionId}`
      );

      setData(result);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load life trend analysis."
      );
    } finally {
      setLoading(false);
    }
  }

  const trendEntries = useMemo(() => {
    if (!data?.trends) return [];

    return Object.entries(data.trends);
  }, [data]);

  const strongestTrend = useMemo(() => {
    if (!trendEntries.length) return null;

    return [...trendEntries].sort(
      (a, b) =>
        Number(b[1].score || 0) -
        Number(a[1].score || 0)
    )[0];
  }, [trendEntries]);

  const averageScore = useMemo(() => {
    if (!trendEntries.length) return 0;

    return Math.round(
      trendEntries.reduce(
        (total, [, item]) =>
          total + Number(item.score || 0),
        0
      ) / trendEntries.length
    );
  }, [trendEntries]);

  const currentStrengths = useMemo(() => {
    return [...trendEntries]
      .filter(
        ([, trend]) =>
          Number(trend.score || 0) >= 85
      )
      .sort(
        (a, b) =>
          Number(b[1].score || 0) -
          Number(a[1].score || 0)
      );
  }, [trendEntries]);

  const attentionAreas = useMemo(() => {
    return [...trendEntries]
      .filter(
        ([, trend]) =>
          Number(trend.score || 0) < 85
      )
      .sort(
        (a, b) =>
          Number(a[1].score || 0) -
          Number(b[1].score || 0)
      );
  }, [trendEntries]);

  /*
   * Optional Milestone 3 fields.
   *
   * These are read only when the backend provides them.
   */
  const growthPotential =
    data?.growth_potential ??
    data?.growthPotential ??
    null;

  const challengeSignals =
    data?.challenge_signals ??
    data?.challengeSignals ??
    [];

  const lifePath =
    data?.life_path ??
    data?.lifePath ??
    null;

  const monitoringSummary =
    data?.monitoring_summary ??
    data?.monitoringSummary ??
    null;

  const overallChange =
    data?.change ??
    data?.overall_change ??
    data?.overallChange ??
    null;

  function goNext() {
    if (!readingSessionId) return;

    navigate(
      `/milestone3-dashboard?reading_session_id=${readingSessionId}`
    );
  }

  function goBack() {
    if (!readingSessionId) return;

    navigate(
      `/recommendations?reading_session_id=${readingSessionId}`
    );
  }

  return (
    <div className="page-container life-trends-page">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="page-title life-trends-header">
        <div className="page-title-icon ai-icon-glow life-title-icon">
          <TrendingUp />
        </div>

        <div>
          <span className="section-kicker">
            LIFE TREND ANALYSIS
          </span>

          <h1>Life Trends</h1>

          <p>
            Explore current patterns, directions,
            opportunities and growth areas from your
            intelligence profile.
          </p>
        </div>
      </div>

      {/* =====================================================
          LOADING
          ===================================================== */}

      {loading && (
        <section className="panel life-loading-panel">
          <div className="life-loading-icon">
            <Sparkles size={22} />
          </div>

          <div>
            <span className="section-kicker">
              ANALYZING PATTERNS
            </span>

            <h2>
              Preparing your life trend analysis...
            </h2>

            <p>
              Connecting your current intelligence
              signals and identifying the strongest
              directions.
            </p>
          </div>
        </section>
      )}

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && !loading && (
        <section className="panel error-panel">
          <strong>{error}</strong>

          <div className="button-row">
            <button
              className="button secondary"
              onClick={goBack}
            >
              <ArrowLeft size={17} />
              Back: Recommendations
            </button>

            <button
              className="button primary"
              onClick={() =>
                navigate("/palm-analysis")
              }
            >
              Start New Reading
            </button>
          </div>
        </section>
      )}

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      {data && !loading && (
        <>
          {/* =================================================
              CURRENT PHASE
              ================================================= */}

          <section className="panel life-phase-panel life-reveal">
            <div className="life-phase-icon">
              <Compass size={23} />
            </div>

            <div className="life-phase-content">
              <span className="section-kicker">
                CURRENT PHASE
              </span>

              <h2>{data.current_phase}</h2>

              <p>{data.summary}</p>

              <div className="phase-meta">
                <span>
                  <Sparkles size={14} />
                  {trendEntries.length} active trend
                  {trendEntries.length === 1
                    ? ""
                    : "s"}
                </span>

                <span>
                  <TrendingUp size={14} />
                  {averageScore}% overall signal
                </span>

                {overallChange !== null && (
                  <span
                    className={
                      Number(overallChange) >= 0
                        ? "trend-change-positive"
                        : "trend-change-negative"
                    }
                  >
                    {Number(overallChange) > 0
                      ? "+"
                      : ""}
                    {overallChange} overall change
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* =================================================
              SNAPSHOT
              ================================================= */}

          <section className="life-summary-grid">
            <div
              className="snapshot-card life-reveal"
              style={{
                "--life-delay": "80ms",
              }}
            >
              <div className="snapshot-icon">
                <TrendingUp size={18} />
              </div>

              <span className="section-kicker">
                STRONGEST TREND
              </span>

              <h3>
                {strongestTrend
                  ? formatLabel(strongestTrend[0])
                  : "—"}
              </h3>

              <strong>
                {strongestTrend
                  ? `${strongestTrend[1].score}%`
                  : "—"}
              </strong>

              {strongestTrend && (
                <p>
                  {strongestTrend[1].direction}
                </p>
              )}
            </div>

            <div
              className="snapshot-card life-reveal"
              style={{
                "--life-delay": "160ms",
              }}
            >
              <div className="snapshot-icon">
                <Sparkles size={18} />
              </div>

              <span className="section-kicker">
                OVERALL SIGNAL
              </span>

              <h3>Current Pattern</h3>

              <strong>{averageScore}%</strong>

              <p>
                {getSignalLevel(averageScore)} pattern
                activity
              </p>
            </div>

            <div
              className="snapshot-card life-reveal"
              style={{
                "--life-delay": "240ms",
              }}
            >
              <div className="snapshot-icon">
                <Compass size={18} />
              </div>

              <span className="section-kicker">
                ACTIVE SIGNALS
              </span>

              <h3>
                {trendEntries.length} Trend Areas
              </h3>

              <strong>
                {currentStrengths.length}
              </strong>

              <p>
                strong current signal
                {currentStrengths.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>
          </section>

          {/* =================================================
              TREND OVERVIEW
              ================================================= */}

          <section className="panel life-trends-panel">
            <div className="section-heading-row">
              <div>
                <span className="section-kicker">
                  TREND OVERVIEW
                </span>

                <h2 className="section-heading">
                  Direction of current patterns
                </h2>

                <p className="section-description">
                  Each signal represents a current area
                  of movement within your intelligence
                  profile.
                </p>
              </div>

              <div className="trend-live-badge">
                <span />
                Active analysis
              </div>
            </div>

            <div
              className="life-trend-grid"
              style={{
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
              }}
            >
              {trendEntries.map(
                ([key, trend], index) => {
                  const DirectionIcon =
                    getDirectionIcon(
                      trend.direction
                    );

                  const change = getChange(trend);

                  return (
                    <article
                      className="insight-card life-trend-card life-reveal"
                      key={key}
                      style={{
                        "--trend-delay": `${
                          index * 100
                        }ms`,
                      }}
                    >
                      <div className="trend-card-top">
                        <div className="trend-label">
                          <span className="trend-mini-icon">
                            <Sparkles size={14} />
                          </span>

                          <span className="section-kicker">
                            {formatLabel(key)}
                          </span>
                        </div>

                        <div className="trend-direction-icon">
                          <DirectionIcon size={17} />
                        </div>
                      </div>

                      <h3>
                        {trend.direction}
                      </h3>

                      <div className="trend-level">
                        <span>
                          {getSignalLevel(
                            Number(trend.score)
                          )} signal
                        </span>

                        <strong>
                          {trend.score}%
                        </strong>
                      </div>

                      <div className="score-bar trend-score-bar">
                        <i
                          style={{
                            "--trend-width": `${trend.score}%`,
                          }}
                        />
                      </div>

                      {change !== null && (
                        <div
                          className={`trend-change ${getChangeClass(
                            change
                          )}`}
                        >
                          <DirectionIcon size={14} />

                          <span>
                            {getChangeLabel(
                              change
                            )}
                          </span>
                        </div>
                      )}

                      <p className="trend-path">
                        {trend.path}
                      </p>

                      <div className="trend-indicator">
                        <DirectionIcon size={14} />

                        <span>
                          {getSignalDescription(
                            trend
                          )}
                        </span>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          </section>

          {/* =================================================
              TREND SCORE CHART
              ================================================= */}

          <section className="panel life-analysis-panel life-reveal">
            <div className="section-heading-row">
              <div>
                <span className="section-kicker">
                  TREND SCORE CHART
                </span>

                <h2 className="section-heading">
                  Current intelligence signals
                </h2>

                <p className="section-description">
                  Visual comparison of the current signal strength
                  across each tracked life area.
                </p>
              </div>
            </div>

            <div
              style={{
                width: "100%",
                height: "360px",
                marginTop: "24px",
              }}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={trendEntries.map(
                    ([key, trend]) => ({
                      name: formatLabel(key),
                      score: Number(
                        trend.score || 0
                      ),
                    })
                  )}
                  margin={{
                    top: 30,
                    right: 20,
                    left: 0,
                    bottom: 10,
                  }}
                  barCategoryGap="24%"
                >
                  <defs>
                    <linearGradient
                      id="trendBarGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#c4b5fd"
                      />

                      <stop
                        offset="100%"
                        stopColor="#7c3aed"
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="rgba(255,255,255,0.07)"
                    strokeDasharray="4 6"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "rgba(255,255,255,0.58)",
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                    dy={10}
                  />

                  <YAxis
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "rgba(255,255,255,0.42)",
                      fontSize: 11,
                    }}
                    width={36}
                  />

                  <ReferenceLine
                    y={85}
                    stroke="rgba(245,158,11,0.55)"
                    strokeDasharray="5 5"
                    label={{
                      value: "Strong",
                      position: "insideTopRight",
                      fill: "rgba(245,158,11,0.8)",
                      fontSize: 11,
                    }}
                  />

                  <Tooltip
                    cursor={{
                      fill: "rgba(167,139,250,0.06)",
                    }}
                    formatter={(value) => [
                      `${value}%`,
                      "Signal strength",
                    ]}
                    contentStyle={{
                      background:
                        "rgba(15,15,25,0.96)",
                      border:
                        "1px solid rgba(167,139,250,0.25)",
                      borderRadius: "12px",
                      boxShadow:
                        "0 12px 35px rgba(0,0,0,0.35)",
                    }}
                    labelStyle={{
                      color: "#ffffff",
                      fontWeight: 600,
                      marginBottom: "6px",
                    }}
                    itemStyle={{
                      color: "#c4b5fd",
                    }}
                  />

                  <Bar
                    dataKey="score"
                    name="Signal strength"
                    fill="url(#trendBarGradient)"
                    radius={[10, 10, 4, 4]}
                    barSize={64}
                    animationDuration={900}
                    animationEasing="ease-out"
                  >
                    <LabelList
                      dataKey="score"
                      position="top"
                      formatter={(value) =>
                        `${value}%`
                      }
                      fill="rgba(255,255,255,0.88)"
                      fontSize={12}
                      fontWeight={700}
                      offset={8}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* =================================================
              TREND PROGRESSION
              ================================================= */}

          <section className="panel life-analysis-panel life-reveal">
            <div className="section-heading-row">
              <div>
                <span className="section-kicker">
                  TREND PROGRESSION
                </span>

                <h2 className="section-heading">
                  Signal movement over time
                </h2>

                <p className="section-description">
                  A visual view of how each tracked area
                  is progressing.
                </p>
              </div>
            </div>

            <div className="life-progression-grid">
              {trendEntries.map(
                ([key, trend]) => (
                  <div
                    className="life-progression-card"
                    key={key}
                  >
                    <div className="progression-heading">
                      <div>
                        <span className="section-kicker">
                          {formatLabel(key)}
                        </span>

                        <h3>
                          {trend.direction}
                        </h3>
                      </div>

                      <strong>
                        {trend.score}%
                      </strong>
                    </div>

                    <TrendProgressChart
                      trend={trend}
                    />
                  </div>
                )
              )}
            </div>
          </section>

          {/* =================================================
              GROWTH POTENTIAL
              ================================================= */}

          {growthPotential && (
            <section className="panel life-growth-potential-panel life-reveal">
              <div className="growth-potential-icon">
                <TrendingUp size={21} />
              </div>

              <div className="growth-potential-content">
                <span className="section-kicker">
                  GROWTH POTENTIAL
                </span>

                <h2>
                  {typeof growthPotential ===
                  "object"
                    ? growthPotential.title ||
                      growthPotential.label ||
                      "Growth Potential"
                    : "Growth Potential"}
                </h2>

                {typeof growthPotential ===
                  "object" &&
                  growthPotential.score !==
                    undefined && (
                    <div className="growth-potential-score">
                      <strong>
                        {
                          growthPotential.score
                        }
                        %
                      </strong>

                      <div className="score-bar">
                        <i
                          style={{
                            width: `${growthPotential.score}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                <p>
                  {typeof growthPotential ===
                  "object"
                    ? growthPotential.summary ||
                      growthPotential.description ||
                      growthPotential.label ||
                      ""
                    : String(growthPotential)}
                </p>
              </div>
            </section>
          )}

          {/* =================================================
              CHALLENGE SIGNALS
              ================================================= */}

          {Array.isArray(challengeSignals) &&
            challengeSignals.length > 0 && (
              <section className="panel life-challenges-panel life-reveal">
                <div className="section-heading-row">
                  <div>
                    <span className="section-kicker">
                      CHALLENGE SIGNALS
                    </span>

                    <h2 className="section-heading">
                      Areas to monitor
                    </h2>

                    <p className="section-description">
                      These signals identify themes
                      that may benefit from additional
                      awareness or deliberate effort.
                    </p>
                  </div>
                </div>

                <div className="challenge-list">
                  {challengeSignals.map(
                    (challenge, index) => {
                      const text =
                        typeof challenge ===
                        "object"
                          ? challenge.title ||
                            challenge.label ||
                            challenge.description ||
                            challenge.signal ||
                            "Challenge signal"
                          : String(
                              challenge
                            );

                      const description =
                        typeof challenge ===
                        "object"
                          ? challenge.description ||
                            challenge.detail ||
                            null
                          : null;

                      return (
                        <div
                          className="challenge-item"
                          key={`${text}-${index}`}
                        >
                          <div className="challenge-icon">
                            <Compass size={16} />
                          </div>

                          <div>
                            <strong>{text}</strong>

                            {description && (
                              <p>
                                {description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </section>
            )}

          {/* =================================================
              LIFE PATH
              ================================================= */}

          {lifePath && (
            <section className="panel life-path-panel life-reveal">
              <div className="life-section-icon">
                <Compass size={20} />
              </div>

              <div className="life-path-content">
                <span className="section-kicker">
                  LIFE PATH
                </span>

                <h2>
                  {typeof lifePath ===
                  "object"
                    ? lifePath.title ||
                      lifePath.name ||
                      "Current Life Path"
                    : String(lifePath)}
                </h2>

                {typeof lifePath ===
                  "object" &&
                  lifePath.steps &&
                  Array.isArray(
                    lifePath.steps
                  ) && (
                    <div className="life-path-steps">
                      {lifePath.steps.map(
                        (step, index) => (
                          <div
                            className="life-path-step"
                            key={`${step}-${index}`}
                          >
                            <span>
                              {index + 1}
                            </span>

                            <strong>
                              {typeof step ===
                              "object"
                                ? step.label ||
                                  step.title ||
                                  step.name
                                : step}
                            </strong>

                            {index <
                              lifePath.steps
                                .length -
                                1 && (
                              <ArrowRight
                                size={15}
                              />
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}

                {typeof lifePath ===
                  "object" && (
                  <p>
                    {lifePath.summary ||
                      lifePath.description ||
                      ""}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* =================================================
              MONITORING SUMMARY
              ================================================= */}

          {monitoringSummary && (
            <section className="panel life-monitoring-panel life-reveal">
              <div className="monitoring-icon">
                <Sparkles size={20} />
              </div>

              <div>
                <span className="section-kicker">
                  MONITORING SUMMARY
                </span>

                <h2>
                  Current intelligence overview
                </h2>

                <p>
                  {typeof monitoringSummary ===
                  "object"
                    ? monitoringSummary.summary ||
                      monitoringSummary.description ||
                      monitoringSummary.text ||
                      ""
                    : String(
                        monitoringSummary
                      )}
                </p>
              </div>
            </section>
          )}

          {/* =================================================
              CURRENT STRENGTHS + ATTENTION
              ================================================= */}

          <section className="life-insight-columns">
            <div className="panel life-detail-panel life-reveal">
              <div className="life-detail-heading">
                <div className="life-detail-icon strength">
                  <CheckCircle2 size={18} />
                </div>

                <div>
                  <span className="section-kicker">
                    CURRENT STRENGTHS
                  </span>

                  <h2>
                    Where momentum is strongest
                  </h2>
                </div>
              </div>

              {currentStrengths.length > 0 ? (
                <div className="life-detail-list">
                  {currentStrengths.map(
                    ([key, trend]) => (
                      <div
                        className="life-detail-item"
                        key={key}
                      >
                        <div>
                          <strong>
                            {formatLabel(key)}
                          </strong>

                          <p>
                            {trend.direction}
                          </p>
                        </div>

                        <span>
                          {trend.score}%
                        </span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p>
                  No trend currently crosses the
                  strongest-signal threshold.
                </p>
              )}
            </div>

            <div className="panel life-detail-panel life-reveal">
              <div className="life-detail-heading">
                <div className="life-detail-icon attention">
                  <Compass size={18} />
                </div>

                <div>
                  <span className="section-kicker">
                    AREAS REQUIRING ATTENTION
                  </span>

                  <h2>
                    Where additional focus may help
                  </h2>
                </div>
              </div>

              {attentionAreas.length > 0 ? (
                <div className="life-detail-list">
                  {attentionAreas.map(
                    ([key, trend]) => (
                      <div
                        className="life-detail-item"
                        key={key}
                      >
                        <div>
                          <strong>
                            {formatLabel(key)}
                          </strong>

                          <p>
                            {trend.path}
                          </p>
                        </div>

                        <span>
                          {trend.score}%
                        </span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p>
                  Current signals are consistently
                  strong across the tracked areas.
                </p>
              )}
            </div>
          </section>

          {/* =================================================
              GROWTH DIRECTION
              ================================================= */}

          <section className="panel life-growth-panel life-reveal">
            <div className="growth-orb">
              <TrendingUp size={21} />
            </div>

            <div className="growth-content">
              <span className="section-kicker">
                GROWTH DIRECTION
              </span>

              <h2>
                Move with the strongest signals while
                strengthening the quieter ones.
              </h2>

              <p>
                Use your strongest trend areas as a
                foundation for action, while lower
                signals can highlight areas where
                consistency, reflection or deliberate
                effort may be useful.
              </p>

              <div className="growth-path">
                {strongestTrend && (
                  <>
                    <span>
                      {formatLabel(
                        strongestTrend[0]
                      )}
                    </span>

                    <ArrowRight size={15} />

                    <span>
                      {strongestTrend[1].direction}
                    </span>

                    <ArrowRight size={15} />

                    <span>
                      Focused growth
                    </span>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* =================================================
              NAVIGATION
              ================================================= */}

          <div className="button-row life-navigation">
            <button
              className="button secondary"
              onClick={goBack}
            >
              <ArrowLeft size={17} />
              Back: Recommendations
            </button>

            <button
              className="button primary"
              onClick={goNext}
            >
              Next: Personalized Dashboard
              <ArrowRight size={17} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}