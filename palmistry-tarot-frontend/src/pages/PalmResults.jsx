import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ScoreCard from "../components/ui/ScoreCard";
import PalmAnalysisImage from "../components/feature/PalmAnalysisImage";
import { exportPalmReportPDF, exportDataAsExcel } from "../services/exportReport";
import { useGuidanceRequests } from "../context/GuidanceRequestsContext";
import { useAuth } from "../context/AuthContext";


function attributeRows(attrs = {}) {
  return [
    attrs.length != null ? `Length ${attrs.length}` : null,
    attrs.curvature != null ? `Curvature ${attrs.curvature}%` : null,
    attrs.depth != null ? `Depth ${attrs.depth}` : null,
    attrs.orientation ? `Orientation ${attrs.orientation}` : null,
  ].filter(Boolean);
}

export default function PalmResults() {
  const { user } = useAuth();
  const location = useLocation();
  const image = location.state?.image;
  const analysis = location.state?.analysis;
  const loading = location.state?.loading;

  const [showExpertForm, setShowExpertForm] = useState(false);
  const [expertQuestion, setExpertQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addRequest } = useGuidanceRequests();

  const lines = analysis?.lines || [];
  const features = analysis?.features || [];
  const interpretation = analysis?.interpretation || [];
  const interpretationBlocks = Array.isArray(interpretation) ? interpretation : interpretation ? [interpretation] : [];
  const personalityInsights = analysis?.personalityInsights || { strengths: [], growthAreas: [] };
  const lifeAreas = analysis?.lifeAreas || [];
  const recommendations = analysis?.recommendations || [];
  const guidanceScore = analysis?.guidanceScore || 0;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-2xl mb-1">Your Palm Reading Results</h1>
          <p className="text-inkMuted text-sm">Processing your palm image and generating interpretation…</p>
        </div>
        {image && (
          <Card className="flex justify-center py-8">
            <PalmAnalysisImage imageSrc={image} mode="analyzing" containerId="palm-analysis-capture" />
          </Card>
        )}
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-2xl mb-1">Your Palm Reading Results</h1>
          <p className="text-inkMuted text-sm">
            No analysis is available yet. Upload a palm image to extract lines and generate an interpretation.
          </p>
        </div>
        <Link to="/palm-reading">
          <Button variant="primary">Start Palm Reading</Button>
        </Link>
      </div>
    );
  }

  return (
    <div id="palm-results" className="max-w-4xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl mb-1">Your Palm Reading Results</h1>
        <p className="text-inkMuted text-sm">
          Reflective insights generated from your palm analysis.
        </p>
      </div>

      {image && (
        <Card className="flex justify-center py-8">
          <PalmAnalysisImage
            imageSrc={image}
            mode="static"
            containerId="palm-analysis-capture"
            lines={lines}
          />
        </Card>
      )}

      {lines.length > 0 && (
        <div>
          <h3 className="text-lg mb-4">Extracted Palm Lines</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {lines.map((line) => (
              <Card key={line.id || line.name}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm flex items-center">
                    {line.color && (
                      <span 
                        className="w-2.5 h-2.5 rounded-full inline-block mr-2 shadow-sm" 
                        style={{ backgroundColor: line.color }} 
                        title={`${line.name} Color`}
                      />
                    )}
                    {line.name}
                  </h4>
                  <span className="text-xs font-semibold" style={{ color: line.color || "#C9A15C" }}>
                    {line.detected === false ? "Not detected" : `${line.confidence}%`}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-line rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full transition-all duration-500" 
                    style={{ 
                      width: `${line.detected === false ? 0 : line.confidence}%`, 
                      backgroundColor: line.color || "#C9A15C" 
                    }} 
                  />
                </div>
                <p className="text-xs text-inkMuted mb-2">{line.meaning}</p>
                {attributeRows(line.attributes).length > 0 && (
                  <p className="text-xs text-gold/80">{attributeRows(line.attributes).join(" · ")}</p>
                )}
                {line.coordinates?.length > 0 && (
                  <p className="text-[10px] text-inkMuted mt-2">
                    {line.coordinates.length} coordinate points extracted
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {features.length > 0 && (
        <div>
          <h3 className="text-lg mb-4">Detected Hand Traits</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((f) => (
              <Card key={f.name}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm">{f.name}</h4>
                  <span className="text-xs text-gold">{f.confidence}%</span>
                </div>
                <div className="w-full h-1.5 bg-line rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-gold" style={{ width: `${f.confidence}%` }} />
                </div>
                <p className="text-xs text-inkMuted">{f.description}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {interpretationBlocks.length > 0 && (
        <Card>
          <h3 className="text-lg mb-3">AI Interpretation</h3>
          <div className="flex flex-col gap-3">
            {interpretationBlocks.map((p) => (
              <p key={p.slice(0, 48)} className="text-sm text-inkMuted leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </Card>
      )}

      {(personalityInsights.strengths?.length > 0 || personalityInsights.growthAreas?.length > 0) && (
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <h3 className="text-lg mb-4">Personality Insights</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gold uppercase tracking-wide mb-2">Strengths</p>
                <ul className="text-sm text-inkMuted flex flex-col gap-1 list-disc list-inside">
                  {personalityInsights.strengths.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs text-violet uppercase tracking-wide mb-2">Growth Areas</p>
                <ul className="text-sm text-inkMuted flex flex-col gap-1 list-disc list-inside">
                  {personalityInsights.growthAreas.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          <Card className="flex items-center justify-center">
            <ScoreCard score={guidanceScore} label="Guidance Score" />
          </Card>
        </div>
      )}

      {lifeAreas.length > 0 && (
        <div>
          <h3 className="text-lg mb-4">Life Areas</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {lifeAreas.map((area) => (
              <Card key={area.label}>
                <p className="text-xs text-gold uppercase tracking-wide mb-2">{area.label}</p>
                <p className="text-sm text-inkMuted">{area.value}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

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
            <p className="text-sm text-inkMuted">Want a human perspective on this reading? Send it to our Palm Experts.</p>
            <Button variant="secondary" onClick={() => setShowExpertForm(true)} disabled={isSubmitting}>
              Send to Palm Expert
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
                expertType: "Palm Expert",
                category: "Palm Reading",
                description: expertQuestion,
                attachedReading: {
                  type: "palm",
                  image: image,
                  analysis: analysis
                }
              });
              alert("Sent to Palm Expert!");
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
              placeholder="e.g. Can you look closer at my life line?"
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

      <div className="flex flex-wrap gap-4">
        <Button variant="primary" onClick={() => alert("Reading is already saved automatically.")}>Save Reading</Button>
        <Button
          variant="secondary"
          onClick={async () => {
            try {
              await exportPalmReportPDF({
                imageElementId: "palm-analysis-capture",
                palmLines: lines,
                extraFeatures: features,
                interpretation: interpretationBlocks.join("\n\n"),
                guidanceScore,
                personalityInsights,
                lifeAreas,
                recommendations,
              });
            } catch (err) {
              console.error("PDF export failed:", err);
              alert("Something went wrong generating the report. Please check the console and try again.");
            }
          }}
        >
          Download Report
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            exportDataAsExcel(
              [
                { Feature: "Guidance Score", Value: guidanceScore },
                ...lines.map((l) => ({
                  Feature: l.name,
                  Value: `${l.confidence}%`,
                  Length: l.attributes?.length,
                  Curvature: l.attributes?.curvature,
                  Depth: l.attributes?.depth,
                })),
                ...features.map((f) => ({ Feature: f.name, Value: `${f.confidence}%` })),
                { Feature: "Interpretation", Value: interpretationBlocks.join(" ") },
              ],
              "palm-analysis-report.xlsx"
            )
          }
        >
          Export Excel
        </Button>
        <Link to="/palm-reading">
          <Button variant="ghost">Start New Reading</Button>
        </Link>
      </div>
    </div>
  );
}
