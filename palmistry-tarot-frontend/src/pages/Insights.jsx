import { Line, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Activity,
  Brain,
  Heart,
  Compass,
  Sun,
  Sparkles,
  Route,
  Target,
  AlertTriangle,
  Eye,
  Sprout,
} from "lucide-react";
import Card from "../components/ui/Card";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend
);

function trendConfig(labels, data, color, { fill = false } = {}) {
  const neutral = "#A9A3B8";
  return {
    data: {
      labels,
      datasets: [
        {
          data,
          borderColor: neutral,
          backgroundColor: fill ? `${neutral}33` : "transparent",
          tension: 0.35,
          pointRadius: 3,
          pointBackgroundColor: neutral,
          fill,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#7A7091", font: { size: 10 } } },
        y: { min: 0, max: 100, grid: { color: "#2A2040" }, ticks: { color: "#7A7091", font: { size: 10 } } },
      },
    },
  };
}

function multiTrendConfig(labels, series) {
  return {
    data: {
      labels,
      datasets: series.map((s) => ({
        label: s.label,
        data: s.data,
        borderColor: s.color,
        backgroundColor: `${s.color}22`,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: s.color,
        fill: false,
      })),
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          labels: { color: "#B8B0CC", boxWidth: 10, font: { size: 10 } },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#7A7091", font: { size: 10 } } },
        y: { min: 0, max: 100, grid: { color: "#2A2040" }, ticks: { color: "#7A7091", font: { size: 10 } } },
      },
    },
  };
}

function radarConfig(values) {
  const neutral = "#A9A3B8";
  return {
    data: {
      labels: ["Life Path", "Opportunity", "Challenge", "Trends", "Growth"],
      datasets: [
        {
          data: values,
          borderColor: neutral,
          backgroundColor: `${neutral}33`,
          pointBackgroundColor: neutral,
          pointBorderColor: "#F3EFE7",
          borderWidth: 2,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { display: false, stepSize: 25 },
          grid: { color: "#2A2040" },
          angleLines: { color: "#2A2040" },
          pointLabels: { color: "#B8B0CC", font: { size: 11 } },
        },
      },
    },
  };
}

const LINE_ICONS = [
  { match: "life", Icon: Activity, tint: "#C2554A" },
  { match: "head", Icon: Brain, tint: "#4E7DAE" },
  { match: "heart", Icon: Heart, tint: "#B5528F" },
  { match: "fate", Icon: Compass, tint: "#4C9A6A" },
  { match: "sun", Icon: Sun, tint: "#B8873E" },
];

function palmLineVisual(line) {
  const id = (line.id || line.name || "").toLowerCase();
  return LINE_ICONS.find((entry) => id.includes(entry.match)) || { Icon: Sparkles, tint: "#C9A15C" };
}

function palmTakeaway(line) {
  const id = (line.id || line.name || "").toLowerCase();
  const conf = line.confidence ?? 0;
  const curv = line.attributes?.curvature ?? 0;
  const len = line.attributes?.length ?? 0;

  if (id.includes("heart"))
    return curv >= 12 ? "Emotionally expressive, wears feelings openly." : "Emotionally steady, guarded with trust.";
  if (id.includes("head"))
    return curv < 10 ? "Analytical thinker, prefers structure." : "Creative thinker, works best with freedom.";
  if (id.includes("life"))
    return len >= 55 ? "High endurance, built for the long haul." : "Focused energy, works best in sprints.";
  if (id.includes("fate"))
    return conf >= 75 ? "Clear sense of purpose and direction." : "Path still forming — open to change.";
  return `Detected at ${conf}% confidence.`;
}

function stripCardName(text, cardName) {
  if (!text) return "";
  let out = String(text);
  if (cardName) {
    const escaped = cardName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(escaped, "gi"), "");
  }
  out = out.replace(/^\s*[^:]+:\s*/, "");
  out = out.replace(/\((upright|reversed)\)\.?\s*/gi, "");
  return out.replace(/\s{2,}/g, " ").replace(/^[:.\-\s]+/, "").trim();
}

function tarotNarrative(pos) {
  const card = pos.card || {};
  const meaning = card.reversed && card.meaningReversed ? card.meaningReversed : card.meaning || "";
  const cleanedInterpretation = stripCardName(pos.interpretation, card.name);
  const theme = meaning || cleanedInterpretation;
  const label = (pos.label || "").toLowerCase();

  if (!theme) {
    if (label.includes("challenge")) return "This position points to a pressure that is asking for a more honest strategy.";
    if (label.includes("outcome")) return "This position sketches the direction this course tends to resolve toward.";
    return "This position highlights a theme currently shaping your path.";
  }

  if (label.includes("path") || label.includes("present") || label.includes("current") || label.includes("focus")) {
    return `On your current path: ${theme}`;
  }
  if (label.includes("challenge") || label.includes("obstacle") || label.includes("tension")) {
    return `The challenge in view: ${theme}`;
  }
  if (label.includes("outcome") || label.includes("future") || label.includes("direction")) {
    return `Toward outcome: ${theme}`;
  }
  return theme;
}

function scoreLabel(score) {
  if (!score) return null;
  if (score >= 75) return "Strong";
  if (score >= 55) return "Moderate";
  return "Developing";
}

function last(arr) {
  return arr.length ? arr[arr.length - 1] : 0;
}

export default function Insights() {
  const { user } = useAuth();
  const [readings, setReadings] = useState([]);

  // Real-Time Snapshot Listeners: users/{uid}/palm_readings and users/{uid}/tarot_readings
  useEffect(() => {
    if (!user?.uid) {
      setReadings([]);
      return;
    }

    const palmRef = collection(db, "users", user.uid, "palm_readings");
    const tarotRef = collection(db, "users", user.uid, "tarot_readings");

    let palmDocs = [];
    let tarotDocs = [];

    const syncReadings = () => {
      const merged = [...palmDocs, ...tarotDocs];
      setReadings(merged);
    };

    const unsubPalm = onSnapshot(
      palmRef,
      (snapshot) => {
        palmDocs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: doc.data().type || "palm",
        }));
        syncReadings();
      },
      (err) => {
        console.error("Real-time palm_readings listener error:", err);
      }
    );

    const unsubTarot = onSnapshot(
      tarotRef,
      (snapshot) => {
        tarotDocs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: doc.data().type || "tarot",
        }));
        syncReadings();
      },
      (err) => {
        console.error("Real-time tarot_readings listener error:", err);
      }
    );

    return () => {
      unsubPalm();
      unsubTarot();
    };
  }, [user]);

  // Chronological order (oldest -> newest) for time series line charts & trend monitoring
  const chronologicalReadings = useMemo(() => {
    return [...readings].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  }, [readings]);

  // Reverse chronological (newest -> oldest) for latest readings & current snapshot
  const newestFirstReadings = useMemo(() => {
    return [...readings].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [readings]);

  // Dynamic Latest Readings: automatically recalculates on new reading document
  const latestPalm = useMemo(() => {
    return newestFirstReadings.find((r) => r.type === "palm") || null;
  }, [newestFirstReadings]);

  const latestTarot = useMemo(() => {
    return newestFirstReadings.find((r) => r.type === "tarot") || null;
  }, [newestFirstReadings]);

  const palmLines = latestPalm?.data?.lines || [];
  const strengths = latestPalm?.data?.personalityInsights?.strengths || [];
  const growthAreas = latestPalm?.data?.personalityInsights?.growthAreas || [];

  const tarotCards = latestTarot?.data?.positions || [];
  const tarotScores = latestTarot?.data?.scores || {};

  // Time-Series Trend Labels
  const trendLabels = useMemo(() => {
    return chronologicalReadings.map((r) =>
      new Date(r.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    );
  }, [chronologicalReadings]);

  // Dynamic Weighted Spiritual Guidance Scoring Engine dimensions:
  const careerTrend = useMemo(() => {
    return chronologicalReadings.map((r) => r.data?.scores?.challenge ?? r.data?.guidanceScore ?? 0);
  }, [chronologicalReadings]);

  const growthTrend = useMemo(() => {
    return chronologicalReadings.map((r) => r.data?.scores?.clarity ?? r.data?.guidanceScore ?? 0);
  }, [chronologicalReadings]);

  const relTrend = useMemo(() => {
    return chronologicalReadings.map((r) => r.data?.scores?.opportunity ?? r.data?.guidanceScore ?? 0);
  }, [chronologicalReadings]);

  const lifePathTrend = useMemo(() => {
    return chronologicalReadings.map((r) => {
      const lines = r.data?.lines || [];
      if (lines.length) {
        return Math.round(lines.reduce((sum, line) => sum + (line.confidence || 0), 0) / lines.length);
      }
      return r.data?.guidanceScore ?? r.data?.scores?.guidance ?? 0;
    });
  }, [chronologicalReadings]);

  const opportunityTrend = useMemo(() => {
    return chronologicalReadings.map((r) => r.data?.scores?.opportunity ?? r.data?.guidanceScore ?? 0);
  }, [chronologicalReadings]);

  const challengeTrend = useMemo(() => {
    return chronologicalReadings.map((r) => r.data?.scores?.challenge ?? r.data?.guidanceScore ?? 0);
  }, [chronologicalReadings]);

  const growthPotentialTrend = useMemo(() => {
    return chronologicalReadings.map((r) => {
      const clarity = r.data?.scores?.clarity;
      const opportunity = r.data?.scores?.opportunity;
      if (clarity != null && opportunity != null) return Math.round((clarity + opportunity) / 2);
      return clarity ?? opportunity ?? r.data?.guidanceScore ?? 0;
    });
  }, [chronologicalReadings]);

  const trendMonitoringValues = useMemo(() => {
    return careerTrend.map((_, i) => Math.round((careerTrend[i] + (growthTrend[i] || 0) + (relTrend[i] || 0)) / 3));
  }, [careerTrend, growthTrend, relTrend]);

  const hasReadings = readings.length > 0;
  const hasPalm = palmLines.length > 0;
  const hasTarot = tarotCards.length > 0;

  // Radar chart config (hooked directly to latest values of the 5 engine dimensions)
  const radar = useMemo(() => {
    return radarConfig([
      last(lifePathTrend),
      last(opportunityTrend),
      last(challengeTrend),
      last(trendMonitoringValues.length ? trendMonitoringValues : [0]),
      last(growthPotentialTrend),
    ]);
  }, [lifePathTrend, opportunityTrend, challengeTrend, trendMonitoringValues, growthPotentialTrend]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl mb-1">Insights</h1>
        <p className="text-inkMuted text-sm">A summary of patterns across your readings.</p>
      </div>

      {!hasReadings && (
        <Card className="py-10 text-center">
          <p className="text-inkMuted text-sm">Complete a reading to see your insights here.</p>
        </Card>
      )}

      {hasPalm && (
        <div>
          <h3 className="text-base font-semibold mb-4">Palm Lines — Latest Reading</h3>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {palmLines.map((line) => {
              const { Icon, tint } = palmLineVisual(line);
              return (
                <Card key={line.id || line.name} className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${tint}22`, color: tint }}
                      >
                        <Icon size={18} />
                      </div>
                      <p className="text-sm font-medium">{line.name}</p>
                    </div>
                    <span className="shrink-0 text-xs text-gold font-medium">{line.confidence}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${line.confidence}%`, background: tint }} />
                  </div>
                  <p className="text-xs text-inkMuted leading-relaxed">{palmTakeaway(line)}</p>
                </Card>
              );
            })}
          </div>

          {(strengths.length > 0 || growthAreas.length > 0) && (
            <Card className="mt-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {strengths.length > 0 && (
                  <div>
                    <p className="text-xs text-gold uppercase tracking-wide mb-2">Strengths</p>
                    <ul className="flex flex-col gap-1">
                      {strengths.map((s) => (
                        <li key={s} className="text-sm text-inkMuted flex gap-2 items-start">
                          <span className="mt-1.5 shrink-0 w-1 h-1 rounded-full bg-gold" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {growthAreas.length > 0 && (
                  <div>
                    <p className="text-xs text-violet uppercase tracking-wide mb-2">Growth Areas</p>
                    <ul className="flex flex-col gap-1">
                      {growthAreas.map((g) => (
                        <li key={g} className="text-sm text-inkMuted flex gap-2 items-start">
                          <span className="mt-1.5 shrink-0 w-1 h-1 rounded-full bg-violet" />
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {hasTarot && (
        <Card>
          <h3 className="text-base font-semibold mb-4">
            Tarot — {latestTarot.data?.spreadName || "Latest Reading"}
          </h3>
          <div className="flex flex-col gap-4">
            {tarotCards.map((pos, i) => (
              <div key={i} className="rounded-card border border-line bg-void/40 p-4">
                <p className="text-xs text-gold uppercase tracking-wide mb-1.5">{pos.label}</p>
                <p className="text-sm text-inkMuted leading-relaxed">{tarotNarrative(pos)}</p>
              </div>
            ))}
          </div>

          {Object.keys(tarotScores).length > 0 && (
            <div className="mt-6 pt-4 border-t border-line grid grid-cols-3 gap-4">
              {[
                { label: "Clarity", value: tarotScores.clarity },
                { label: "Challenge", value: tarotScores.challenge },
                { label: "Opportunity", value: tarotScores.opportunity },
              ]
                .filter((s) => s.value)
                .map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-xs text-inkMuted uppercase tracking-wide mb-1">{s.label}</p>
                    <p className="text-lg font-semibold text-gold">{s.value}</p>
                    <p className="text-xs text-inkMuted">{scoreLabel(s.value)}</p>
                  </div>
                ))}
            </div>
          )}
        </Card>
      )}

      {hasReadings && (
        <div>
          <div className="mb-4">
            <h3 className="text-base font-semibold">Life Trend Analysis</h3>
            <p className="text-xs text-inkMuted mt-1">
              Life Trend Analysis Engine — life path, opportunity, challenge, monitoring, and growth potential at a glance.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            {[
              { label: "Life path analysis", value: last(lifePathTrend), Icon: Route, color: "#C9A15C" },
              { label: "Opportunity identification", value: last(opportunityTrend), Icon: Target, color: "#4C9A6A" },
              { label: "Challenge forecasting", value: last(challengeTrend), Icon: AlertTriangle, color: "#C2554A" },
              { label: "Trend monitoring", value: last(careerTrend.map((_, i) => Math.round((careerTrend[i] + growthTrend[i] + relTrend[i]) / 3))), Icon: Eye, color: "#7C6FE0" },
              { label: "Growth potential", value: last(growthPotentialTrend), Icon: Sprout, color: "#4E7DAE" },
            ].map(({ label, value, Icon, color }) => (
              <Card key={label} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} style={{ color }} />
                  <p className="text-[11px] text-inkMuted uppercase tracking-wide leading-tight">{label}</p>
                </div>
                <p className="text-lg font-semibold text-gold">{value || "—"}{value ? "%" : ""}</p>
                <div className="w-full h-1.5 bg-line rounded-full overflow-hidden mt-2">
                  <div className="h-full rounded-full" style={{ width: `${value || 0}%`, background: color }} />
                </div>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card>
              <p className="text-sm mb-1">Current snapshot</p>
              <p className="text-xs text-inkMuted mb-3">How the five engine dimensions sit right now.</p>
              <Radar data={radar.data} options={radar.options} />
            </Card>
            <Card>
              <p className="text-sm mb-1">Trend monitoring</p>
              <p className="text-xs text-inkMuted mb-3">Career, growth, and relationship shifts over time.</p>
              <Line
                {...multiTrendConfig(trendLabels, [
                  { label: "Career Focus", data: careerTrend, color: "#A97D3E" },
                  { label: "Personal Growth", data: growthTrend, color: "#6C5CA8" },
                  { label: "Relationships", data: relTrend, color: "#C2554A" },
                ])}
              />
            </Card>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[
              { label: "Life path analysis", hint: "Vitality and direction across readings.", ...trendConfig(trendLabels, lifePathTrend, "#C9A15C") },
              { label: "Opportunity identification", hint: "Windows opening in your readings.", ...trendConfig(trendLabels, opportunityTrend, "#4C9A6A") },
              { label: "Challenge forecasting", hint: "Pressure points to watch next.", ...trendConfig(trendLabels, challengeTrend, "#C2554A") },
              { label: "Growth potential assessment", hint: "Capacity for expansion over time.", ...trendConfig(trendLabels, growthPotentialTrend, "#4E7DAE") },
              { label: "Career Focus", hint: "Work and purpose emphasis.", ...trendConfig(trendLabels, careerTrend, "#A97D3E") },
              { label: "Personal Growth", hint: "Inner development trajectory.", ...trendConfig(trendLabels, growthTrend, "#6C5CA8") },
              { label: "Relationships", hint: "Connection patterns over time.", ...trendConfig(trendLabels, relTrend, "#A97D3E") },
            ].map(({ label, hint, data: d, options: o }) => (
              <Card key={label}>
                <p className="text-sm mb-1">{label}</p>
                <p className="text-xs text-inkMuted mb-3">{hint}</p>
                <Line data={d} options={o} />
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
