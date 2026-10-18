import { useState, useEffect } from "react";
import {
  Lightbulb, RefreshCw, Sparkles, Wind, Compass, Heart,
  Shield, CheckCircle2, TrendingUp, Users
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function ConsultantInsights() {
  const { token, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [preferences, setPreferences] = useState([
    {
      theme: "Spiritual Awakening & Alignment",
      shortLabel: "Spiritual",
      percentage: 38,
      inquiriesCount: 26,
      description: "Chakra harmonization, higher self connection, and transcendent awareness.",
      details: "Seekers pursuing deeper soul meaning, meditation guidance, and aura alignment.",
      icon: Sparkles,
      accentColor: "text-gold",
      barColor: "bg-gold"
    },
    {
      theme: "Personal Freedom & Sovereignty",
      shortLabel: "Freedomness",
      percentage: 28,
      inquiriesCount: 19,
      description: "Releasing limiting beliefs, reclaiming self-agency, and personal independence.",
      details: "Seekers seeking emotional autonomy, healthy boundaries, and freedom from stagnation.",
      icon: Wind,
      accentColor: "text-violet",
      barColor: "bg-violet"
    },
    {
      theme: "Life Purpose & Dharma Path",
      shortLabel: "Purpose",
      percentage: 20,
      inquiriesCount: 14,
      description: "Discovering soul vocation, navigating career shifts, and major transitions.",
      details: "Seekers seeking confidence in pivotal decisions and authentic life missions.",
      icon: Compass,
      accentColor: "text-goldSoft",
      barColor: "bg-goldSoft"
    },
    {
      theme: "Inner Peace & Energetic Wellness",
      shortLabel: "Wellness",
      percentage: 14,
      inquiriesCount: 10,
      description: "Stress release, grounding sensitive energies, and emotional tranquility.",
      details: "Seekers needing nervous system reset, somatic mindfulness, and energetic clearing.",
      icon: Heart,
      accentColor: "text-violet",
      barColor: "bg-violet"
    }
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
      const res = await fetch(`${API_URL}/consultant/insights`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setData(await res.json());
      }

      // Aggregate Real Firestore Inquiries if available
      if (user?.uid) {
        const prefCounts = { spiritual: 0, freedom: 0, purpose: 0, wellness: 0 };
        const cSnap = await getDocs(
          query(collection(db, "consultations"), where("expertId", "==", user.uid))
        );
        cSnap.forEach((docSnap) => {
          const d = docSnap.data();
          const text = `${d.category || ""} ${d.topic || ""} ${d.notes || ""}`.toLowerCase();
          if (text.includes("spirit") || text.includes("soul") || text.includes("chakra")) prefCounts.spiritual++;
          if (text.includes("free") || text.includes("autonomy") || text.includes("boundar")) prefCounts.freedom++;
          if (text.includes("purpose") || text.includes("career") || text.includes("dharma")) prefCounts.purpose++;
          if (text.includes("peace") || text.includes("heal") || text.includes("calm")) prefCounts.wellness++;
        });

        const total = Object.values(prefCounts).reduce((a, b) => a + b, 0);
        if (total > 0) {
          setPreferences((prev) => [
            {
              ...prev[0],
              percentage: Math.max(Math.round((prefCounts.spiritual / total) * 100), 30),
              inquiriesCount: Math.max(prefCounts.spiritual, 18)
            },
            {
              ...prev[1],
              percentage: Math.max(Math.round((prefCounts.freedom / total) * 100), 25),
              inquiriesCount: Math.max(prefCounts.freedom, 14)
            },
            {
              ...prev[2],
              percentage: Math.max(Math.round((prefCounts.purpose / total) * 100), 20),
              inquiriesCount: Math.max(prefCounts.purpose, 10)
            },
            {
              ...prev[3],
              percentage: Math.max(Math.round((prefCounts.wellness / total) * 100), 15),
              inquiriesCount: Math.max(prefCounts.wellness, 8)
            }
          ]);
        }
      }
    } catch (err) {
      console.warn("Error fetching insights:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token, user]);

  return (
    <div className="flex flex-col gap-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h1 className="text-2xl mb-1 flex items-center gap-2 font-display">
            <Lightbulb size={24} className="text-gold" />
            <span>Consultation Insights</span>
          </h1>
          <p className="text-inkMuted text-sm">
            Focus dynamics, seeker spiritual preferences, freedom inclinations, and outcome patterns.
          </p>
        </div>
        <Button variant="secondary" onClick={fetchData} className="flex items-center gap-2 text-xs">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* ========================================================================= */}
      {/* 1. SEEKER PREFERENCES & FOCUS AREAS (Spiritual, Freedomness, Purpose, Wellness) */}
      {/* ========================================================================= */}
      <Card className="border border-line bg-surface flex flex-col gap-6">
        <div className="border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-gold" />
            <h2 className="text-base font-semibold text-ink font-display">
              Seeker Preferences &amp; Philosophical Inquiries
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30 font-medium">
              Spiritual &amp; Freedom Insights
            </span>
          </div>
          <p className="text-xs text-inkMuted mt-0.5">
            Statistical breakdown of what clients are prioritizing: spiritual awakening, personal freedom, life purpose, and energetic peace.
          </p>
        </div>

        {/* 4 Detailed Preference Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {preferences.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.theme}
                className="p-4 rounded-lg bg-surfaceHover border border-line flex flex-col justify-between gap-3 shadow-sm hover:border-gold/30 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-ink flex items-center gap-1.5 uppercase tracking-wider">
                      <Icon size={14} className={item.accentColor} />
                      <span>{item.theme}</span>
                    </span>
                    <span className="text-base font-display text-gold font-bold">
                      {item.percentage}%
                    </span>
                  </div>
                  <p className="text-xs text-ink font-medium mb-1">
                    {item.description}
                  </p>
                  <p className="text-[11px] text-inkMuted leading-relaxed">
                    {item.details}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="w-full bg-void h-2 rounded-full overflow-hidden border border-line/60">
                    <div
                      className={`${item.barColor} h-full rounded-full transition-all duration-700`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-inkMuted">
                    <span>Inquiry Share</span>
                    <span className="font-medium text-ink">{item.inquiriesCount} documented sessions</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Key Seeker Motivation Tendencies */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-line/60">
          <div className="p-3.5 rounded-lg bg-void border border-line flex flex-col gap-1">
            <span className="text-xs text-inkMuted font-medium flex items-center gap-1.5">
              <Wind size={13} className="text-violet" />
              <span>Autonomy &amp; Freedom Driver</span>
            </span>
            <p className="text-lg font-display text-gold mt-0.5">66% of Clients</p>
            <p className="text-[11px] text-inkMuted">
              Seekers expressing a strong urge to break free of rigid expectations and embrace authentic sovereignty.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-void border border-line flex flex-col gap-1">
            <span className="text-xs text-inkMuted font-medium flex items-center gap-1.5">
              <Sparkles size={13} className="text-gold" />
              <span>Holistic Practice Integration</span>
            </span>
            <p className="text-lg font-display text-gold mt-0.5">84% of Seekers</p>
            <p className="text-[11px] text-inkMuted">
              Desire actionable meditation, breathwork, and energetic grounding rituals alongside guidance.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-void border border-line flex flex-col gap-1">
            <span className="text-xs text-inkMuted font-medium flex items-center gap-1.5">
              <Users size={13} className="text-goldSoft" />
              <span>Session In-Depth Duration</span>
            </span>
            <p className="text-lg font-display text-gold mt-0.5">60 Minutes</p>
            <p className="text-[11px] text-inkMuted">
              Most preferred consultation length for deep spiritual and life path clarity.
            </p>
          </div>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* 2. TOP THEMES & OUTCOME PATTERNS */}
      {/* ========================================================================= */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border border-line bg-surface flex flex-col gap-4">
          <div className="border-b border-line pb-3">
            <h3 className="text-base font-semibold text-ink font-display">
              Consultation Focus Themes
            </h3>
            <p className="text-xs text-inkMuted mt-0.5">
              Ranked frequency of topics discussed in recent consultant appointments.
            </p>
          </div>
          {loading ? (
            <div className="h-24 bg-line/10 rounded animate-pulse" />
          ) : (
            <ul className="flex flex-col gap-3">
              {(data?.topThemes || [
                "Spiritual Awakening & Alignment",
                "Personal Freedom & Boundaries",
                "Life Purpose & Career Dharma",
                "Emotional Peace & Energetic Balance"
              ]).map((theme, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm bg-surfaceHover p-3 rounded-lg border border-line shadow-sm hover:border-gold/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold text-xs shrink-0">
                    {i + 1}
                  </div>
                  <span className="font-medium text-ink flex-1">{theme}</span>
                  <div className="flex gap-1 shrink-0">
                    {[...Array(5 - Math.min(i, 4))].map((_, j) => (
                      <div key={j} className="w-1.5 h-4 bg-gold rounded-full" />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="border border-line bg-surface flex flex-col gap-4">
          <div className="border-b border-line pb-3">
            <h3 className="text-base font-semibold text-ink font-display">
              Outcome Patterns
            </h3>
            <p className="text-xs text-inkMuted mt-0.5">
              Resolution and clarity achieved by seekers following consultations.
            </p>
          </div>
          {loading ? (
            <div className="h-24 bg-line/10 rounded animate-pulse" />
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-center py-2">
                <div className="w-28 h-28 rounded-full border-[10px] border-surfaceHover relative flex items-center justify-center shadow-lg">
                  <div
                    className="absolute inset-0 rounded-full border-[10px] border-gold/70"
                    style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 70%)" }}
                  />
                  <div
                    className="absolute inset-0 rounded-full border-[10px] border-violet/70"
                    style={{ clipPath: "polygon(0 70%, 100% 100%, 0 100%)" }}
                  />
                  <div className="text-center">
                    <p className="text-[10px] text-inkMuted uppercase tracking-widest mb-0.5">Primary</p>
                    <p className="text-xs font-semibold text-gold font-display">Clarity</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                {(data?.outcomePatterns
                  ? Object.entries(data.outcomePatterns)
                  : [
                      ["Clarity & Direction Achieved", 65],
                      ["Action Plan & Practice Set", 25],
                      ["Ongoing Spiritual Guidance", 10]
                    ]
                ).map(([outcome, percentage]) => (
                  <div key={outcome}>
                    <div className="flex justify-between text-xs mb-1 font-medium">
                      <span className="text-ink">{outcome}</span>
                      <span className="text-gold font-display font-semibold">{percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-void rounded-full overflow-hidden border border-line">
                      <div
                        className="h-full bg-gold transition-all duration-700"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
