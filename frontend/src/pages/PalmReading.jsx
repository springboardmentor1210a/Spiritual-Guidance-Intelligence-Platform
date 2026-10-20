import { useEffect, useRef, useState } from "react";

import {

  ArrowRight,

  Camera,

  Eye,

  Sparkles,

  Upload,

  X

} from "lucide-react";

import api from "../api/client";

import { PageHeading } from "./FeatureShared";

import ReadingFeedback from "./ReadingFeedback";

const PALM_FEATURES = [

  {

    key: "heart",

    name: "Heart Line",

    area: "Upper palm",

    description:

      "Traditionally associated with emotional expression and relationships.",

    prompt:

      "Reflect on how you communicate feelings and maintain meaningful connections."

  },

  {

    key: "head",

    name: "Head Line",

    area: "Middle palm",

    description:

      "Traditionally associated with thinking style and decision-making.",

    prompt:

      "Reflect on how you approach choices, learning and problem-solving."

  },

  {

    key: "life",

    name: "Life Line",

    area: "Curves around the thumb",

    description:

      "Traditionally associated with vitality and major life changes; it does not measure lifespan.",

    prompt:

      "Reflect on routines, energy, support and the changes you have navigated."

  },

  {

    key: "fate",

    name: "Fate Line",

    area: "Vertical centre of palm",

    description:

      "Traditionally associated with direction, work and personal goals.",

    prompt:

      "Reflect on the goals and responsibilities shaping your current direction."

  },

  {

    key: "sun",

    name: "Sun Line",

    area: "Below the ring finger",

    description:

      "Traditionally associated with creativity, recognition and fulfilment.",

    prompt:

      "Reflect on creative interests and the activities that give you a sense of fulfilment."

  }

];

function clamp01(value) {

  const n = Number(value);

  return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0;

}

function confidencePercent(value) {

  const n = Number(value);

  if (!Number.isFinite(n)) return 0;

  return Math.round(Math.max(0, Math.min(1, n)) * 100);

}

function titleCase(value) {

  return String(value || "Not available")

    .replace(/\_/g, " ")

    .replace(/\b\w/g, (c) => c.toUpperCase());

}

function normalizedPoints(feature) {

  const source = Array.isArray(feature?.normalized_points)

    ? feature.normalized_points

    : Array.isArray(feature?.points)

      ? feature.points

      : [];

  return source

    .filter((p) => Array.isArray(p) && p.length >= 2)

    .map((p) => [clamp01(p[0]), clamp01(p[1])])

    .filter((p, index, arr) => index === 0 || Math.abs(p[0] - arr[index - 1][0]) + Math.abs(p[1] - arr[index - 1][1]) > 0.006);

}

const PALM_INTERPRETATION_KEYS = [

  ["heart", "Heart Line", "heart_reflection", "heart"],

  ["head", "Head Line", "head_reflection", "head"],

  ["life", "Life Line", "life_reflection", "life"],

  ["fate", "Fate Line", "fate_reflection", "fate"],

  ["sun", "Sun Line", "sun_reflection", "sun"]

];

function compactInsight(value, fallback, max = 330) {

  const text = String(value || fallback || "").replace(/\s+/g, " ").trim();

  if (!text) return "No additional reflection was returned for this feature.";

  if (text.length <= max) return text;

  const cut = text.slice(0, max);

  const last = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "), cut.lastIndexOf(", "));

  return (last > 150 ? cut.slice(0, last + 1) : cut).trim();

}

function featureReflection(feature, key, ai) {

  const direct = ai?.[`${key}\_reflection`];

  const nested = feature?.reflection;

  return compactInsight(direct || nested, feature?.observation || feature?.description, 360);

}

function PalmAIText({ result, features }) {

  if (!result) {

    return <div className="palm-pro-empty">Run the AI analysis to generate balanced insights for each detected palm feature.</div>;

  }

  const ai = result?.palm_insights || {};

  const featureMap = Object.fromEntries((features || []).map((item) => [item.key, item]));

  const cards = PALM_INTERPRETATION_KEYS.map(([key, label]) => ({

    key,

    label,

    feature: featureMap[key] || {},

    text: featureReflection(featureMap[key] || {}, key, ai)

  }));

  return (

    <>

      <div className="palm-pro-interpret-grid">

        {cards.map((card) => (

          <article className="palm-pro-interpret-card" key={card.key}>

            <div className="palm-pro-interpret-title">

              <span className="palm-pro-interpret-dot" style={{ background: card.feature.color || "#8d5d40" }} />

              <h3>{card.label}</h3>

              <span>{confidencePercent(card.feature.confidence)}%</span>

            </div>

            <p>{card.text}</p>

            <div className="palm-pro-interpret-note">

              {compactInsight(card.feature.traditional_meaning, card.feature.description, 180)}

            </div>

          </article>

        ))}

        <article className="palm-pro-interpret-card palm-pro-overall-card">

          <div className="palm-pro-interpret-title"><span className="palm-pro-interpret-dot" /> <h3>Overall reflection</h3></div>

          <p>{compactInsight(ai.overall_reflection || ai.overall_observation, "Your overall reflection will appear here after the visual analysis.", 420)}</p>

          <div className="palm-pro-interpret-note">Reflective guidance based on the visible hand features and structure.</div>

        </article>

      </div>

      {(ai.personality_reflection || ai.career_reflection || ai.relationship_reflection) && (

        <div className="palm-pro-context-grid">

          {[

            ["Personality", ai.personality_reflection],

            ["Career & work", ai.career_reflection],

            ["Relationship & emotional", ai.relationship_reflection]

          ].map(([label, value]) => (

            <article className="palm-pro-context-card" key={label}>

              <h3>{label}</h3>

              <p>{compactInsight(value, "No additional reflection returned.", 360)}</p>

            </article>

          ))}

        </div>

      )}

    </>

  );

}

export function PalmReading() {

  const [file, setFile] = useState(null);

  const [preview, setPreview] = useState("");

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState("");

  const [result, setResult] = useState(null);

  const [cameraOn, setCameraOn] = useState(false);

  const [cameraError, setCameraError] = useState("");

  const [imageRatio, setImageRatio] = useState("3 / 4");

  const videoRef = useRef(null);

  const streamRef = useRef(null);

  const canvasRef = useRef(null);

  useEffect(() => {

    if (cameraOn && videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current;

  }, [cameraOn]);

  useEffect(() => () => {

    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());

    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);

  }, [preview]);

  async function openCamera() {

    setCameraError("");

    try {

      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera unavailable");

      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });

      setCameraOn(true);

    } catch {

      setCameraError("Camera access is unavailable. Allow camera permission or upload an image instead.");

    }

  }

  function stopCamera() {

    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());

    streamRef.current = null;

    setCameraOn(false);

  }

  function setImage(next) {

    if (cameraOn) stopCamera();

    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);

    setFile(next);

    setPreview(next ? URL.createObjectURL(next) : "");

    setResult(null);

    setError("");

    setImageRatio("3 / 4");

  }

  function capture() {

    const video = videoRef.current;

    const canvas = canvasRef.current;

    if (!video || !canvas || !video.videoWidth) return;

    canvas.width = video.videoWidth;

    canvas.height = video.videoHeight;

    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob((blob) => {

      if (blob) setImage(new File([blob], "palm-camera-capture.jpg", { type: "image/jpeg" }));

    }, "image/jpeg", 0.92);

    stopCamera();

  }

  async function submit(event) {

    event.preventDefault();

    setError("");

    if (!file) return setError("Choose or capture a palm image first.");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return setError("Please use a JPG, PNG or WEBP image.");

    if (file.size > 8 * 1024 * 1024) return setError("Image must be smaller than 8 MB.");

    const data = new FormData();

    data.append("image", file);

    setBusy(true);

    setResult(null);

    try {

      const response = await api.post("/api/readings/palm", data, { headers: { "Content-Type": "multipart/form-data" } });

      setResult(response.data);

    } catch (err) {

      setError(err.response?.data?.detail || "Could not generate the AI palm interpretation. Check that the backend is running.");

    } finally {

      setBusy(false);

    }

  }

  const features = Array.isArray(result?.palm_insights?.features)

    ? result.palm_insights.features

    : (Array.isArray(result?.detected_lines) ? result.detected_lines : []);

  const structure = result?.palm_insights?.palm_structure || {};

  const fingers = result?.palm_insights?.finger_structure || {};

  const fingerEntries = [["thumb", "Thumb"], ["index", "Index finger"], ["middle", "Middle finger"], ["ring", "Ring finger"], ["little", "Little finger"]];

  return (

    <div className="page-container feature-page palm-pro-page">

      <style>{PALM_PRO_CSS}</style>

      <PageHeading eyebrow="PALM IMAGE STUDIO" title="Palm reading" subtitle="Upload or capture your palm and receive an AI-assisted visual analysis with traditional reflective interpretation." />

      <div className="palm-pro-grid">

        <section className="palm-pro-card">

          <div className="feature-panel-icon"><HandIcon /></div>

          <h2>Choose how to add your palm</h2>

          <p className="palm-pro-muted">Use a clear, well-lit image with your palm open and fingers comfortably separated.</p>

          <div className="palm-pro-actions">

            <button type="button" className="palm-pro-choice" onClick={cameraOn ? stopCamera : openCamera} disabled={busy}><Camera size={18} />{cameraOn ? "Close live camera" : "Use live camera"}</button>

            <label className="palm-pro-choice"><Upload size={18} />Upload an image<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => setImage(event.target.files?.[0] || null)} /></label>

          </div>

          {cameraError && <div className="palm-pro-alert">{cameraError}</div>}

          {cameraOn && <div className="camera-stage"><video ref={videoRef} autoPlay playsInline muted /><button type="button" className="palm-pro-primary" onClick={capture}><Camera size={17} />Capture palm</button></div>}

          <canvas ref={canvasRef} hidden />

          {preview ? (

            <>

              <div className="palm-pro-preview-head"><strong>Your palm image</strong><button type="button" className="text-button" onClick={() => setImage(null)} disabled={busy}><X size={15} />Remove</button></div>

              <div className="palm-pro-image-shell">

                <div className="palm-pro-image-canvas" style={{ aspectRatio: imageRatio }}>

                  <img src={preview} alt="Uploaded or captured palm" onLoad={(event) => { const w = event.currentTarget.naturalWidth; const h = event.currentTarget.naturalHeight; if (w && h) setImageRatio(`${w} / ${h}`); }} />

                  <div className="palm-pro-stamp"><Eye size={13} />Original image</div>

                </div>

              </div>

            </>

          ) : <div className="palm-pro-empty">Your palm preview will appear here · JPG, PNG or WEBP · Maximum 8 MB</div>}

          {error && <div className="palm-pro-alert">{error}</div>}

          <button type="button" className="palm-pro-primary" onClick={submit} disabled={busy || !file}><Sparkles size={17} />{busy ? "Generating AI palm analysis..." : "Analyse palm with AI"}<ArrowRight size={17} /></button>

          {busy && <div className="model-status"><Sparkles size={18} /><span><strong>AI visual analysis in progress</strong><br />The image is being analysed for palm features, palm structure and finger structure.</span></div>}

        </section>

        <aside className="palm-pro-card palm-pro-detected">

          <div className="palm-pro-title-row"><div><p className="palm-pro-eyebrow">AI VISUAL ANALYSIS</p><h2>Detected palm features</h2></div><span className="palm-pro-count">{features.length} detected</span></div>

          {features.length ? features.map((feature, index) => { const pct = confidencePercent(feature.confidence); return (

            <article className="palm-pro-feature" key={feature.key || index}>

              <div className="palm-pro-feature-head"><span className="palm-pro-dot" style={{ background: feature.color || "#956342" }} /><strong>{feature.name || "Palm feature"}</strong><span className="palm-pro-percent">{pct}%</span></div>

              <div className="palm-pro-status">{titleCase(feature.status || "not clear")}</div>

              <p>{feature.observation || feature.description || "No visual observation returned."}</p>

              {feature.traditional_meaning && <p>{feature.traditional_meaning}</p>}

              <div className="palm-pro-bar"><span style={{ width: `${pct}%` }} /></div>

            </article>

          ); }) : <div className="palm-pro-empty">Analyse a palm image to populate the five AI-detected feature cards.</div>}

        </aside>

      </div>

      <div className="palm-pro-structure-grid palm-pro-section">

        <section className="palm-pro-structure-card">

          <div className="palm-pro-structure-head"><div><h2>Palm structure</h2><p className="palm-pro-sub">Overall hand characteristics from visual analysis</p></div>{structure.confidence !== undefined && <div className="palm-pro-confidence"><div className="palm-pro-confidence-row"><span>Visual confidence</span><span>{confidencePercent(structure.confidence)}%</span></div><div className="palm-pro-mini-bar"><span style={{ width: `${confidencePercent(structure.confidence)}%` }} /></div></div>}</div>

          {structure.shape || structure.length_width_ratio || structure.symmetry || structure.texture ? <><div className="palm-pro-palm-details"><div className="palm-pro-detail"><span>Shape</span><strong>{titleCase(structure.shape)}</strong></div><div className="palm-pro-detail"><span>Length / width</span><strong>{structure.length_width_ratio || "Not available"}</strong></div><div className="palm-pro-detail"><span>Symmetry</span><strong>{structure.symmetry || "Not available"}</strong></div><div className="palm-pro-detail"><span>Texture</span><strong>{structure.texture || "Not available"}</strong></div></div><div className="palm-pro-observation">{structure.observation || "No additional structure observation returned."}</div></> : <div className="palm-pro-empty">Palm structure will be analysed after a successful AI visual analysis.</div>}

        </section>

        <section className="palm-pro-structure-card">

          <div className="palm-pro-structure-head"><div><h2>Finger structure</h2><p className="palm-pro-sub">Relative proportions and visible form of each finger</p></div>{fingers.confidence !== undefined && <div className="palm-pro-confidence"><div className="palm-pro-confidence-row"><span>Visual confidence</span><span>{confidencePercent(fingers.confidence)}%</span></div><div className="palm-pro-mini-bar"><span style={{ width: `${confidencePercent(fingers.confidence)}%` }} /></div></div>}</div>

          {fingerEntries.some(([key]) => fingers[key]) ? <><div className="palm-pro-finger-table"><div className="palm-pro-finger-row header"><div>Finger</div><div>Length</div><div>Shape</div><div>Spacing</div><div>Straightness</div></div>{fingerEntries.map(([key, label]) => { const finger = fingers[key] || {}; return <div className="palm-pro-finger-row" key={key}><div className="palm-pro-finger-name">{label}</div><div>{finger.relative_length || "Not available"}</div><div>{finger.shape || "Not available"}</div><div>{finger.spacing || "Not available"}</div><div>{finger.straightness || "Not available"}</div></div>; })}</div><div className="palm-pro-observation">{fingers.overall_observation || "Finger structure was visually analysed from the submitted image."}</div></> : <div className="palm-pro-empty">Finger structure will be analysed after a successful AI visual analysis.</div>}

        </section>

      </div>

      <section className="palm-pro-ai palm-pro-section">

        <div className="palm-pro-ai-head"><div><p className="palm-pro-eyebrow">PERSONALIZED REFLECTION</p><h2>AI palm interpretation</h2><p className="palm-pro-ai-sub">Balanced insights for every detected palm feature.</p></div>{result && <span className="palm-pro-count">AI analysis saved</span>}</div>

        <PalmAIText result={result} features={features} />

      </section>

      {result?.id && <ReadingFeedback readingId={result.id} />}

    </div>

  );

}

function HandIcon() {

  return (

    <svg

      width="24"

      height="24"

      viewBox="0 0 24 24"

      fill="none"

      stroke="currentColor"

      strokeWidth="1.8"

      strokeLinecap="round"

      strokeLinejoin="round"

    >

      <path d="M8 11V5a1.5 1.5 0 0 1 3 0v5-7a1.5 1.5 0 0 1 3 0v7-5a1.5 1.5 0 0 1 3 0v7-3a1.5 1.5 0 0 1 3 0v7c0 4-2.5 6-6 6h-2c-2 0-3.5-1-4.5-2.5L4 15a1.7 1.7 0 0 1 2.5-2.2L8 14" />

    </svg>

  );

}

/* -------------------------------------------------------

   TAROT DESIGN AND ANIMATION

\\\\------------------------------------------------------- */

const PALM_PRO_CSS = `

.palm-pro-page{font-family:'DM Sans',sans-serif;max-width:1240px;margin:0 auto;padding-bottom:60px}.palm-pro-page button,.palm-pro-page input,.palm-pro-page textarea,.palm-pro-page select{font-family:'DM Sans',sans-serif}.palm-pro-page .feature-heading h1{font-family:Georgia,'Times New Roman',serif;font-weight:500;letter-spacing:-.025em}.palm-pro-page h2,.palm-pro-page h3{font-family:Georgia,'Times New Roman',serif;font-weight:500}.palm-pro-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(380px,.85fr);gap:22px;align-items:start}.palm-pro-card,.palm-pro-section{background:#fffaf2;border:1px solid #dec7aa;border-radius:22px;box-shadow:0 14px 38px rgba(83,53,31,.07)}.palm-pro-card{padding:24px}.palm-pro-muted,.palm-pro-sub,.palm-pro-ai-sub{color:#866b56}.palm-pro-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0}.palm-pro-choice{min-height:52px;border:1px solid #d9bfa0;border-radius:12px;background:#fbf0df;display:flex;align-items:center;justify-content:center;gap:9px;font-weight:700;color:#65452f;cursor:pointer}.palm-pro-choice input{display:none}.palm-pro-preview-head{display:flex;justify-content:space-between;align-items:center;margin:18px 0 10px}.palm-pro-image-shell{padding:12px;background:#eadbc6;border:1px solid #dbc1a2;border-radius:15px}.palm-pro-image-canvas{position:relative;width:100%;max-height:680px;overflow:hidden;border-radius:11px;background:#e4d5c0}.palm-pro-image-canvas img{width:100%;height:100%;display:block;object-fit:contain}.palm-pro-overlay{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}.palm-pro-overlay text{font-family:Arial,sans-serif;font-weight:700;paint-order:stroke;stroke:#fff8ed;stroke-width:.006}.palm-pro-stamp{position:absolute;left:12px;bottom:12px;background:#65452f;color:#fff8ef;border-radius:999px;padding:7px 11px;font-size:12px;display:flex;align-items:center;gap:6px}.palm-pro-note{font-size:12px;color:#9a765a;margin:10px 4px}.palm-pro-primary{width:100%;border:0;border-radius:12px;background:#7d5439;color:#fff8ef;min-height:52px;font-size:16px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer}.palm-pro-primary:disabled{opacity:.55;cursor:not-allowed}.palm-pro-alert{margin:12px 0;padding:11px 13px;border-radius:10px;background:#fff0ee;color:#8d3d35;border:1px solid #efc4bd}.palm-pro-empty{padding:24px;border:1px dashed #d8bfa1;border-radius:14px;color:#9a7b62;text-align:center}.palm-pro-title-row,.palm-pro-structure-head,.palm-pro-ai-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.palm-pro-title-row h2,.palm-pro-structure-head h2,.palm-pro-ai-head h2{margin:2px 0 4px}.palm-pro-eyebrow{font-size:11px;letter-spacing:.14em;color:#a16d49;font-weight:800;margin:0 0 5px}.palm-pro-count{border:1px solid #d8b895;border-radius:999px;padding:8px 12px;color:#744e34;font-size:12px;white-space:nowrap}.palm-pro-feature{background:#fffdf8;border:1px solid #e1cdb4;border-radius:16px;padding:16px;margin-top:12px}.palm-pro-feature-head{display:flex;align-items:center;gap:9px}.palm-pro-feature-head strong{font-family:Georgia,serif;font-size:19px;color:#3e291c}.palm-pro-percent{margin-left:auto;font-weight:800;color:#744e34}.palm-pro-dot,.palm-pro-interpret-dot{width:12px;height:12px;border-radius:50%;display:inline-block;flex:none}.palm-pro-status{font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:#a16d49;font-weight:800;margin:8px 0}.palm-pro-feature p{font-size:13px;line-height:1.65;color:#765b46;margin:8px 0}.palm-pro-bar,.palm-pro-mini-bar{height:7px;background:#eadbc7;border-radius:999px;overflow:hidden;margin-top:10px}.palm-pro-bar span,.palm-pro-mini-bar span{display:block;height:100%;background:#956342;border-radius:inherit}.palm-pro-section{margin-top:22px;padding:24px}.palm-pro-structure-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px}.palm-pro-sub{font-size:13px;margin:0}.palm-pro-confidence{min-width:155px}.palm-pro-confidence-row{display:flex;justify-content:space-between;font-size:11px;color:#886a53}.palm-pro-palm-details{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}.palm-pro-detail{padding:13px;border:1px solid #e2ceb6;border-radius:12px;background:#fffdf8}.palm-pro-detail span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#a17a5e}.palm-pro-detail strong{display:block;margin-top:4px;color:#493223}.palm-pro-observation{margin-top:13px;padding:13px 15px;background:#f9eddb;border-radius:12px;color:#765b46;line-height:1.6;font-size:13px}.palm-pro-finger-table{margin-top:18px;border:1px solid #e2ceb6;border-radius:13px;overflow:hidden}.palm-pro-finger-row{display:grid;grid-template-columns:1.1fr 1fr 1fr 1fr 1fr;border-top:1px solid #ead9c3;font-size:11px;color:#765b46}.palm-pro-finger-row:first-child{border-top:0}.palm-pro-finger-row>div{padding:10px;border-right:1px solid #ead9c3}.palm-pro-finger-row>div:last-child{border-right:0}.palm-pro-finger-row.header{font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#a17a5e;background:#f8eddc}.palm-pro-finger-name{font-weight:800;color:#493223}.palm-pro-ai-head{margin-bottom:18px}.palm-pro-interpret-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.palm-pro-interpret-card,.palm-pro-context-card{border:1px solid #e1cdb4;border-radius:15px;background:#fffdf8;padding:17px}.palm-pro-interpret-title{display:flex;align-items:center;gap:8px}.palm-pro-interpret-title h3{font-family:Georgia,serif;font-size:17px;color:#402a1d;margin:0}.palm-pro-interpret-title>span:last-child{margin-left:auto;font-size:11px;font-weight:800;color:#8a5c3e}.palm-pro-interpret-card p,.palm-pro-context-card p{font-size:13px;line-height:1.65;color:#705541;margin:12px 0}.palm-pro-interpret-note{padding:10px 11px;border-radius:10px;background:#f9eddb;color:#76563e;font-size:11px;line-height:1.5}.palm-pro-context-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:12px}.palm-pro-context-card h3{font-family:Georgia,serif;color:#402a1d;margin:0;font-size:16px}.palm-pro-overall-card{grid-column:span 3}.palm-pro-page .feature-heading{margin-bottom:24px}.palm-pro-page .feature-heading h1{margin-bottom:7px}@media(max-width:1000px){.palm-pro-grid,.palm-pro-structure-grid{grid-template-columns:1fr}.palm-pro-interpret-grid{grid-template-columns:repeat(2,1fr)}.palm-pro-overall-card{grid-column:span 2}}@media(max-width:650px){.palm-pro-actions,.palm-pro-palm-details,.palm-pro-interpret-grid,.palm-pro-context-grid{grid-template-columns:1fr}.palm-pro-overall-card{grid-column:auto}.palm-pro-finger-table{overflow-x:auto}.palm-pro-finger-row{min-width:720px}.palm-pro-title-row,.palm-pro-structure-head,.palm-pro-ai-head{flex-direction:column}}

`;

