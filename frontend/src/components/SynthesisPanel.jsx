import { useState } from "react";

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : window.location.origin
);
const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("access_token") ||
  localStorage.getItem("authToken");
// -----------------------------------------------------------

const CATEGORY_LABELS = {
  personality: "Personality",
  relationships: "Relationships",
  career: "Career",
  finance: "Finance",
  health_wellness: "Health & Wellness",
  personal_growth: "Personal Growth",
  opportunities: "Opportunities",
};

const TIMEFRAME_LABELS = {
  next_30_days: "Next 30 days",
  next_3_months: "Next 3 months",
  next_6_months: "Next 6 months",
};

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>
      {children}
    </div>
  );
}

function Chip({ children, tone = "gold" }) {
  const tones = {
    gold: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
    purple: "border-purple-400/40 bg-purple-500/10 text-purple-300",
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs ${tones[tone]}`}>
      {children}
    </span>
  );
}

export default function SynthesisPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/guidance/synthesis`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Server returned ${res.status}: ${body.slice(0, 200)}`);
      }
      setData(await res.json());
    } catch (e) {
      setError(e.message || "Could not generate synthesis.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-2xl font-bold text-transparent">
          Cosmic Convergence
        </h2>
        <p className="max-w-xl text-sm text-slate-300">
          Combine your recent Tarot, Palmistry and Astrology readings into one
          personalized reflection.
        </p>
        <button
          onClick={generate}
          disabled={loading}
          className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Consulting the stars..." : data ? "Regenerate Synthesis" : "Generate AI Synthesis"}
        </button>
        {error && (
          <p className="max-w-xl rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
      </div>

      {data && (
        <div className="space-y-5">
          {data.summary && (
            <Card title="The Oracle's Message">
              <p className="leading-relaxed text-slate-200">{data.summary}</p>
            </Card>
          )}

          {/* PERSONALITY */}
          {data.personality && (
            <Card title="Personality Intelligence">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-300">
                    Strengths
                  </h4>
                  <ul className="space-y-1.5 text-slate-200">
                    {data.personality.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-emerald-400">✦</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-300">
                    Growth Areas
                  </h4>
                  <ul className="space-y-1.5 text-slate-200">
                    {data.personality.weaknesses.map((w, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-amber-400">✦</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {data.personality.behavioral_insights?.length > 0 && (
                <div className="mt-5">
                  <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-sky-300">
                    Behavioral Insights
                  </h4>
                  <ul className="list-disc space-y-1 pl-5 text-slate-200">
                    {data.personality.behavioral_insights.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}

              {data.personality.development_tips?.length > 0 && (
                <div className="mt-5">
                  <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-purple-300">
                    Personal Development Tips
                  </h4>
                  <ul className="list-disc space-y-1 pl-5 text-slate-200">
                    {data.personality.development_tips.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}

          {/* RECOMMENDATIONS */}
          {data.recommendations?.length > 0 && (
            <Card title="Recommendations">
              <div className="grid gap-4 md:grid-cols-2">
                {data.recommendations.map((r, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Chip>{CATEGORY_LABELS[r.category] || r.category}</Chip>
                      {r.linked_goal && <Chip tone="purple">Goal: {r.linked_goal}</Chip>}
                    </div>
                    <h4 className="font-semibold text-white">{r.title}</h4>
                    <p className="mt-1 text-sm text-slate-300">{r.action}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* CHALLENGES */}
          {data.challenges?.length > 0 && (
            <Card title="Themes to Watch">
              <div className="space-y-4">
                {data.challenges.map((c, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-semibold text-white">{c.theme}</h4>
                      <Chip tone="purple">{TIMEFRAME_LABELS[c.timeframe] || c.timeframe}</Chip>
                    </div>
                    <p className="text-sm text-slate-300">{c.description}</p>
                    <p className="mt-2 text-sm text-slate-200">
                      <span className="font-semibold text-emerald-300">How to navigate: </span>
                      {c.how_to_navigate}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <p className="text-center text-xs text-slate-400">
            Readings are for self-reflection and entertainment, not predictions or professional advice.
          </p>
        </div>
      )}
    </section>
  );
}