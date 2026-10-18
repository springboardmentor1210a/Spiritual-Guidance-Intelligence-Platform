import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UploadCloud, ImageUp } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import PalmAnalysisImage from "../components/feature/PalmAnalysisImage";
import * as api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function PalmReading() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [stage, setStage] = useState("idle"); // idle | preview | analyzing | done
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const assignFile = (nextFile) => {
    if (!nextFile) return;
    if (image) URL.revokeObjectURL(image);
    setFile(nextFile);
    setImage(URL.createObjectURL(nextFile));
    setAnalysis(null);
    setError(null);
    setStage("preview");
  };

  const handleFileChange = (e) => assignFile(e.target.files?.[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    assignFile(e.dataTransfer.files?.[0]);
  };

  const handleAnalyze = async () => {
    if (!file || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    setStage("analyzing");
    const formData = new FormData();
    formData.append("image", file);
    try {
      const result = await api.uploadPalmImage(formData, user?.uid);
      setAnalysis(result);
      setStage("done");
    } catch (err) {
      console.error(err);
      setError(err.message || "Palm analysis failed. Please try another image.");
      setStage("preview");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetReading = () => {
    if (image) URL.revokeObjectURL(image);
    setFile(null);
    setImage(null);
    setAnalysis(null);
    setError(null);
    setStage("idle");
    setIsSubmitting(false);
  };

  const features = (analysis?.lines?.length
    ? analysis.lines.map((l) => ({
        name: l.name,
        confidence: l.confidence,
        detected: l.detected,
      }))
    : analysis?.features) || [];
  const interpretation = analysis?.interpretation || [];
  const interpretationBlocks = Array.isArray(interpretation) ? interpretation : [interpretation];

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl mb-1">Palm Analysis</h1>
        <p className="text-inkMuted text-sm">
          Upload a clear image of your palm to begin your analysis.
        </p>
      </div>

      {stage === "idle" && (
        <>
          <Card
            className="flex flex-col items-center justify-center text-center py-16 border-dashed"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <UploadCloud className="text-gold mb-4" size={40} />
            <h3 className="text-lg mb-1">Upload Palm Image</h3>
            <p className="text-sm text-inkMuted mb-4">
              Drag and drop, or choose a file. JPG, JPEG, PNG supported.
            </p>
            <label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button variant="primary" as="span" className="cursor-pointer">
                <ImageUp size={16} />
                Choose Image
              </Button>
            </label>
          </Card>

          <Card>
            <h3 className="text-sm mb-3 text-inkMuted uppercase tracking-wide">
              Tips for best results
            </h3>
            <ul className="text-sm text-inkMuted flex flex-col gap-1.5 list-disc list-inside">
              <li>Use good lighting</li>
              <li>Keep the palm clearly visible</li>
              <li>Avoid excessive blur</li>
              <li>Keep fingers visible</li>
              <li>Place the palm flat</li>
            </ul>
          </Card>
        </>
      )}

      {stage === "preview" && (
        <Card className="flex flex-col items-center gap-4 py-10">
          <img src={image} alt="Uploaded palm" className="max-h-64 rounded-card border border-line" />
          {error && <p className="text-sm text-red-400 text-center px-4">{error}</p>}
          <div className="flex gap-3">
            <label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button variant="secondary" as="span" className="cursor-pointer">
                Replace Image
              </Button>
            </label>
            <Button variant="primary" onClick={handleAnalyze} disabled={isSubmitting}>
              {isSubmitting ? "Analyzing Palm…" : "Analyze Palm"}
            </Button>
          </div>
        </Card>
      )}

      {(stage === "analyzing" || stage === "done") && (
        <Card className="flex flex-col items-center gap-6 py-10">
          <h3 className="text-lg">
            {stage === "analyzing" ? "Analyzing your palm…" : "Analysis Complete"}
          </h3>
          <PalmAnalysisImage
            imageSrc={image}
            mode={stage === "analyzing" ? "analyzing" : "static"}
            containerId="palm-analysis-capture"
            lines={analysis?.lines || []}
          />
          {stage === "analyzing" && (
            <p className="text-sm text-inkMuted">
              Extracting Heart, Head, Life, and Fate lines. This can take a moment.
            </p>
          )}
        </Card>
      )}

      {stage === "done" && (
        <>
          <div>
            <h3 className="text-lg mb-4">Detected Features</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((f) => (
                <Card key={f.name}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm">{f.name}</h4>
                    <span className="text-xs text-gold">{f.detected === false ? "Not detected" : `${f.confidence}%`}</span>
                  </div>
                  <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
                    <div className="h-full bg-gold" style={{ width: `${f.detected === false ? 0 : f.confidence}%` }} />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Card>
            <h3 className="text-lg mb-3">AI Interpretation</h3>
            <div className="flex flex-col gap-3">
              {interpretationBlocks.map((p) => (
                <p key={p.slice(0, 40)} className="text-sm text-inkMuted leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </Card>

          <div className="flex flex-wrap gap-4">
            <Button
              variant="primary"
              disabled={isSubmitting}
              onClick={() => navigate("/palm-results", { state: { image, analysis } })}
            >
              View Full Insights
            </Button>
            <Link to="/palm-reading" onClick={resetReading}>
              <Button variant="ghost">Start New Reading</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
