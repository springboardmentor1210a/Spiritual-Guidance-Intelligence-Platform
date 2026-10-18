import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ScoreCard from "../components/ui/ScoreCard";
import { exportTarotReportPDF, exportDataAsExcel } from "../services/exportReport";
import * as api from "../services/api";
import { useGuidanceRequests } from "../context/GuidanceRequestsContext";
import { useAuth } from "../context/AuthContext";


export default function TarotResults() {
  const { user } = useAuth();
  const location = useLocation();
  const spread = location.state?.spread;
  const cards = location.state?.cards ?? [];
  const passedReading = location.state?.reading;

  const [reading, setReading] = useState(passedReading || null);
  const [status, setStatus] = useState(passedReading ? "ready" : (cards.length ? "loading" : "empty"));
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showExpertForm, setShowExpertForm] = useState(false);
  const [expertQuestion, setExpertQuestion] = useState("");
  const { addRequest } = useGuidanceRequests();
  const hasExecutedRef = useRef(!!passedReading);

  const cardKey = cards.map((c) => `${c.id}:${c.reversed ? 1 : 0}`).join("|");
  const spreadKey = spread?.id || spread?.name || "";

  useEffect(() => {
    // If reading was already passed from TarotReading click trigger or already generated, never call again
    if (passedReading || hasExecutedRef.current) {
      return;
    }

    if (!cards.length) {
      setStatus("empty");
      return;
    }

    hasExecutedRef.current = true;
    let cancelled = false;
    setStatus("loading");
    setError(null);

    const selectedCards = cards.map((c) => ({
      id: c.id,
      name: c.name,
      reversed: !!c.reversed,
      position: c.position,
      meaning: c.meaning,
      meaningReversed: c.meaningReversed,
    }));

    api
      .generateTarotSpread({
        cards: selectedCards,
        spreadType: spreadKey || "three",
        uid: user?.uid,
      })
      .then((result) => {
        if (cancelled) return;
        setReading(result);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Could not generate the reading.");
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
    // Intentionally keyed by drawn ids + spread, not the cards array identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardKey, spreadKey]);

  const positions = reading?.positions || [];
  const synthesis = Array.isArray(reading?.synthesis)
    ? reading.synthesis
    : reading?.synthesis
      ? [reading.synthesis]
      : [];
  const categories = reading?.categories || [];
  const recommendations = reading?.recommendations || [];
  const scores = reading?.scores || {};
  const guidanceScore = reading?.guidanceScore || scores.guidance || 0;

  if (status === "empty") {
    return (
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-2xl mb-1">Your Tarot Reading Results</h1>
          <p className="text-inkMuted text-sm">
            No cards have been drawn yet. Start a reading to generate an interpretation.
          </p>
        </div>
        <Link to="/tarot-reading">
          <Button variant="primary">Start Tarot Reading</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl mb-1">Your Tarot Reading Results</h1>
        <p className="text-inkMuted text-sm">
          {spread?.name || reading?.spreadName || "Reflective insights from your reading."}
        </p>
      </div>

      {status === "loading" && (
        <Card className="py-10 text-center">
          <Sparkles className="text-gold mx-auto mb-3 animate-pulse" size={28} />
          <p className="text-sm text-inkMuted">
            Generating AI interpretation for your {spread?.name || "spread"}…
          </p>
        </Card>
      )}

      {status === "error" && (
        <Card>
          <p className="text-sm text-red-400">{error}</p>
        </Card>
      )}

      {cards.length > 0 && (
        <div>
          <h3 className="text-lg mb-4">Drawn Cards</h3>
          <div className="flex flex-wrap gap-4">
            {cards.map((card, i) => {
              const label = card.position || positions[i]?.label || `Card ${i + 1}`;
              return (
                <Card key={`${card.id}-${i}`} className="w-40 flex flex-col items-center text-center gap-2">
                  <div className="w-24 h-36 rounded-card overflow-hidden border border-line">
                    {card.image ? (
                      <img
                        src={card.image}
                        alt={card.name}
                        className={`w-full h-full object-cover ${card.reversed ? "rotate-180" : ""}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="text-gold" size={22} />
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-inkMuted uppercase tracking-wide">{label}</span>
                  <span className="text-sm">{card.name}</span>
                  {card.reversed && <span className="text-xs text-violet">Reversed</span>}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {status === "ready" && (
        <>
          {positions.length > 0 && (
            <div>
              <h3 className="text-lg mb-4">Position Interpretations</h3>
              <div className="flex flex-col gap-4">
                {positions.map((pos) => (
                  <Card key={`${pos.label}-${pos.index}`}>
                    <p className="text-xs text-gold uppercase tracking-wide mb-1">{pos.label}</p>
                    <h4 className="text-sm mb-2">
                      {pos.card?.name || cards[pos.index]?.name}
                      {pos.card?.reversed || cards[pos.index]?.reversed ? " · Reversed" : ""}
                    </h4>
                    <p className="text-sm text-inkMuted leading-relaxed">{pos.interpretation}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {synthesis.length > 0 && (
            <Card>
              <h3 className="text-lg mb-3">Overall Reading Synthesis</h3>
              <div className="flex flex-col gap-3">
                {synthesis.map((p) => (
                  <p key={p.slice(0, 48)} className="text-sm text-inkMuted leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </Card>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <h3 className="text-lg mb-4">Guidance Scores</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {[
                  { label: "Clarity", value: scores.clarity },
                  { label: "Challenge", value: scores.challenge },
                  { label: "Opportunity", value: scores.opportunity },
                ]
                  .filter((s) => s.value != null && s.value !== 0)
                  .map((s) => (
                    <div key={s.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gold uppercase tracking-wide">{s.label}</span>
                        <span>{s.value}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
                        <div className="h-full bg-gold" style={{ width: `${s.value}%` }} />
                      </div>
                    </div>
                  ))}
              </div>
              {categories.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {categories.map((c) => (
                    <div key={c.label}>
                      <p className="text-xs text-gold uppercase tracking-wide mb-1">{c.label}</p>
                      <p className="text-sm text-inkMuted">{c.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="flex items-center justify-center">
              <ScoreCard score={guidanceScore} label="Guidance Score" />
            </Card>
          </div>

          {recommendations.length > 0 && (
            <Card>
              <h3 className="text-lg mb-3">Recommendations</h3>
              <ul className="text-sm text-inkMuted flex flex-col gap-2 list-disc list-inside">
                {recommendations.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </Card>
          )}
          
          <Card>
            <h3 className="text-lg mb-3">Ask an Expert</h3>
            {!showExpertForm ? (
              <div className="flex flex-col gap-2 items-start">
                <p className="text-sm text-inkMuted">Want a deeper human perspective? Send this reading to our Tarot Experts.</p>
                <Button variant="secondary" onClick={() => setShowExpertForm(true)} disabled={isSubmitting}>
                  Send to Tarot Expert
                </Button>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (isSubmitting) return;
                setIsSubmitting(true);
                try {
                  await addRequest({
                    userName: user?.name || "User",
                    expertType: "Tarot Reader",
                    category: "Tarot Reading",
                    description: expertQuestion,
                    attachedReading: {
                      type: "tarot",
                      cards: cards,
                      spread: spread,
                      reading: reading
                    }
                  });
                  alert("Sent to Tarot Expert!");
                  setShowExpertForm(false);
                  setExpertQuestion("");
                } catch (err) {
                  console.error("Failed to send request:", err);
                  alert("Failed to send request. Please try again.");
                } finally {
                  setIsSubmitting(false);
                }
              }} className="flex flex-col gap-3">
                <label className="text-sm text-inkMuted">What would you like to ask the expert?</label>
                <textarea
                  className="w-full bg-void border border-line rounded p-2 text-sm outline-none focus:border-gold transition-colors resize-none"
                  rows={3}
                  required
                  value={expertQuestion}
                  onChange={(e) => setExpertQuestion(e.target.value)}
                  placeholder="e.g. How does the reversed tower apply to my career?"
                  disabled={isSubmitting}
                />
                <div className="flex gap-3">
                  <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? "Sending…" : "Send"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowExpertForm(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </>
      )}

      <div className="flex flex-wrap gap-4">
        <Button variant="primary" onClick={() => alert("Reading is already saved automatically.")}>Save Reading</Button>
        <Button
          variant="secondary"
          onClick={() =>
            exportTarotReportPDF({
              spreadName: spread?.name || reading?.spreadName,
              cards,
              interpretation: synthesis.join("\n\n"),
              categories,
              recommendations,
              guidanceScore,
            })
          }
        >
          Download Report
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            exportDataAsExcel(
              [
                { Field: "Guidance Score", Value: guidanceScore },
                { Field: "Clarity", Value: scores.clarity },
                { Field: "Challenge", Value: scores.challenge },
                { Field: "Opportunity", Value: scores.opportunity },
                ...cards.map((c, i) => ({
                  Field: c.position || `Card ${i + 1}`,
                  Value: `${c.name}${c.reversed ? " (Reversed)" : ""}`,
                })),
                { Field: "Interpretation", Value: synthesis.join(" ") },
              ],
              "tarot-reading-report.xlsx"
            )
          }
        >
          Export Excel
        </Button>
        <Link to="/tarot-reading">
          <Button variant="ghost">New Reading</Button>
        </Link>
      </div>
    </div>
  );
}
