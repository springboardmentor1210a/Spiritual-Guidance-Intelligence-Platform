import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  FileImage,
  Fingerprint,
  RotateCcw,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  setActiveReadingSession,
} from "../services/activeReading";
import { analyzePalm } from "../api/palm";
import { createReadingReport } from "../api/tarot";
import { apiRequest } from "../api/client";


const stages = [
  "Uploading image",
  "Validating palm image",
  "Extracting structured features",
  "Building interpretation",
];


export default function PalmAnalysis() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [stage, setStage] = useState(-1);
  const [analyzing, setAnalyzing] = useState(false);

  const [result, setResult] = useState(null);
  const [interpretation, setInterpretation] = useState(null);

  const [error, setError] = useState("");

  const [saving, setSaving] = useState(false);

  const inputRef = useRef(null);


  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);


  function chooseFile(next) {
    if (!next) return;

    if (
      !["image/jpeg", "image/png"].includes(
        next.type
      )
    ) {
      setError(
        "Please choose a JPG, JPEG or PNG image."
      );
      return;
    }

    if (next.size > 10 * 1024 * 1024) {
      setError(
        "Please choose an image smaller than 10 MB."
      );
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(next);
    setPreview(
      URL.createObjectURL(next)
    );

    setStage(-1);
    setResult(null);
    setInterpretation(null);
    setError("");
  }


  function reset() {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(null);
    setPreview("");
    setStage(-1);
    setResult(null);
    setInterpretation(null);
    setError("");
    setAnalyzing(false);
    setSaving(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }


  async function analyze() {
  if (!file || analyzing) {
    return;
  }

  try {
    setAnalyzing(true);
    setResult(null);
    setInterpretation(null);
    setError("");

    setStage(0);

    const data = await analyzePalm(file);

    if (data?.reading_session_id) {
      setActiveReadingSession(
      data.reading_session_id
      );
    }

    if (data?.reading_session_id) {
      localStorage.setItem(
      "latest_palm_reading_session_id",
       String(data.reading_session_id)
      );
    }

    setStage(1);

    await new Promise((resolve) =>
      setTimeout(resolve, 300)
    );

    setStage(2);

    await new Promise((resolve) =>
      setTimeout(resolve, 300)
    );

    /*
     * AI INTERPRETATION
     *
     * Palm analysis produces structured palm features.
     * The backend LLM converts those features into
     * personalized interpretation.
     */
    if (data?.reading_session_id) {
      const aiInterpretation = await apiRequest(
        `/api/v1/ai-interpretations/reading-session/${data.reading_session_id}`,
        {
          method: "POST",
        }
      );

      setInterpretation(aiInterpretation);
    }

    setStage(3);

    setResult(data);

  } catch (err) {
    setError(
      err.message ||
        "Unable to analyze palm image."
    );
  } finally {
    setAnalyzing(false);
  }
}

  async function saveReport() {
    if (
      !result?.reading_session_id ||
      saving
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const report =
        await createReadingReport(
          result.reading_session_id
        );

      navigate(
        `/reports/${report.id}`
      );

    } catch (err) {
      setError(
        err.message ||
          "Unable to generate palm report."
      );
    } finally {
      setSaving(false);
    }
  }


  return (
    <div className="page-container">

      <div className="page-title">

        <div className="page-title-icon">
          <Fingerprint />
        </div>

        <div>
          <span className="section-kicker">
            PALM INTELLIGENCE
          </span>

          <h1>
            Palm Analysis
          </h1>

          <p>
            Upload a clear palm image to explore
            a structured reading.
          </p>
        </div>

      </div>


      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {!result ? (

        <div className="analysis-layout">

          <section className="panel upload-panel">

            <div
              className={`drop-zone ${
                preview ? "has-file" : ""
              }`}
              onDragOver={(e) =>
                e.preventDefault()
              }
              onDrop={(e) => {
                e.preventDefault();

                chooseFile(
                  e.dataTransfer.files?.[0]
                );
              }}
              onClick={() =>
                inputRef.current?.click()
              }
            >

              <input
                ref={inputRef}
                type="file"
                hidden
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={(e) =>
                  chooseFile(
                    e.target.files?.[0]
                  )
                }
              />

              {preview ? (

                <img
                  src={preview}
                  className="palm-preview"
                  alt="Selected palm"
                />

              ) : (

                <>
                  <div className="upload-icon">
                    <Upload size={25} />
                  </div>

                  <h2>
                    Drop your palm image here
                  </h2>

                  <p>
                    or click to browse · JPG,
                    JPEG or PNG · up to 10 MB
                  </p>
                </>

              )}

            </div>


            {file && (

              <div className="file-row">

                <FileImage size={18} />

                <div>
                  <strong>
                    {file.name}
                  </strong>

                  <span>
                    {(
                      file.size /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </span>
                </div>

                <button
                  className="icon-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    reset();
                  }}
                >
                  <X size={17} />
                </button>

              </div>

            )}


            <div className="button-row">

              <button
                className="button secondary"
                onClick={reset}
                disabled={
                  !file || analyzing
                }
              >
                <RotateCcw size={17} />
                Reset
              </button>


              <button
                className="button primary"
                onClick={analyze}
                disabled={
                  !file || analyzing
                }
              >
                {analyzing
                  ? "Analyzing…"
                  : "Analyze Palm"}

                <Sparkles size={17} />
              </button>

            </div>

          </section>


          <section className="panel process-panel">

            <span className="section-kicker">
              ANALYSIS PIPELINE
            </span>

            <h2>
              Reading process
            </h2>


            <div className="process-list">

              {stages.map((item, index) => (

                <div
                  className={`process-step ${
                    stage >= index
                      ? "active"
                      : ""
                  }`}
                  key={item}
                >

                  <div className="process-dot">

                    {stage > index ? (
                      <CheckCircle2 size={15} />
                    ) : (
                      index + 1
                    )}

                  </div>

                  <span>
                    {item}
                  </span>

                </div>

              ))}

            </div>

          </section>

        </div>

      ) : (

        <PalmResults
          result={result}
          interpretation={interpretation}
          preview={preview}
          reset={reset}
          saveReport={saveReport}
          saving={saving}
        />

      )}

    </div>
  );
}


/* =========================================================
   PALM RESULTS
   ========================================================= */

function PalmResults({
  result,
  interpretation,
  preview,
  reset,
  saveReport,
  saving,
}) {

  const analysis =
    result.analysis;


  return (

    <div className="results-page">

      <div className="result-success">

        <CheckCircle2 size={19} />

        <span>
          Analysis complete · structured
          AI interpretation generated
        </span>

        <button
          className="button ghost small"
          onClick={reset}
          disabled={saving}
        >
          Analyze another
        </button>

      </div>


      {/* =================================================
          ACTUAL UPLOADED IMAGE
      ================================================= */}

      <section className="panel">

        <span className="section-kicker">
          UPLOADED PALM
        </span>

        <h2>
          Palm image
        </h2>

        {preview && (
          <img
            src={preview}
            className="palm-result-image"
            alt="Uploaded palm"
          />
        )}

      </section>


      {/* =================================================
          PALM SHAPE + FINGERS
      ================================================= */}

      <div className="metrics-grid">

        <Metric
          title="Palm shape"
          value={
            analysis.palmShape.value
          }
          score={
            analysis.palmShape.score
          }
          note={
            analysis.palmShape.note
          }
        />

        <Metric
          title="Finger structure"
          value={
            analysis.fingers.value
          }
          score={
            analysis.fingers.score
          }
          note={
            analysis.fingers.note
          }
        />

      </div>


      {/* =================================================
          PALM LINES
      ================================================= */}

      <section className="panel">

        <div className="panel-heading">

          <div>

            <span className="section-kicker">
              PALM LINES
            </span>

            <h2>
              Feature interpretation
            </h2>

          </div>

        </div>


        <div className="line-list">

          {analysis.lines.map(
            (line) => (

              <div
                className="line-item"
                key={line.name}
              >

                <div className="line-name">

                  <strong>
                    {line.name}
                  </strong>

                  <span>
                    {line.status}
                  </span>

                </div>


                <div className="score-bar">

                  <i
                    style={{
                      width: `${line.score}%`,
                    }}
                  />

                </div>


                <b>
                  {line.score}%
                </b>


                <p>
                  {line.note}
                </p>

              </div>

            )
          )}

        </div>

      </section>

      {interpretation && (
  <section className="panel">
    <span className="section-kicker">
      AI INTERPRETATION
    </span>

    <h2>
      Personalized Reading Overview
    </h2>

    <p>
      {interpretation.overview}
    </p>
  </section>
)}
      {/* =================================================
          INSIGHTS
      ================================================= */}

      <section className="insight-grid">

      {interpretation && (
    <>
      <div className="insight-card">
        <Sparkles size={17} />
        <h3>Personality</h3>
        <p>{interpretation.personality}</p>
      </div>

      <div className="insight-card">
        <Sparkles size={17} />
        <h3>Relationships</h3>
        <p>{interpretation.relationships}</p>
      </div>

      <div className="insight-card">
        <Sparkles size={17} />
        <h3>Career</h3>
        <p>{interpretation.career}</p>
      </div>

      <div className="insight-card">
        <Sparkles size={17} />
        <h3>Finance</h3>
        <p>{interpretation.finance}</p>
      </div>

      <div className="insight-card">
        <Sparkles size={17} />
        <h3>Health & Wellness</h3>
        <p>{interpretation.health_wellness}</p>
      </div>

      <div className="insight-card">
        <Sparkles size={17} />
        <h3>Personal Growth</h3>
        <p>{interpretation.personal_growth}</p>
      </div>

      <div className="insight-card">
        <Sparkles size={17} />
        <h3>Life Opportunities</h3>
        <p>{interpretation.life_opportunities}</p>
      </div>
    </>
  )}

</section>


      {/* =================================================
          GUIDANCE
      ================================================= */}

      <section className="panel guidance">

        <span className="section-kicker">
          PERSONAL GUIDANCE
        </span>

        <h2>
          Three reflections to carry forward
        </h2>

        <ol>

          <li>
            Choose one priority and give it
            consistent attention.
          </li>

          <li>
            Use direct communication when
            expectations are unclear.
          </li>

          <li>
            Turn reflective insights into a
            practical next step within the week.
          </li>

        </ol>

      </section>


      {/* =================================================
          SAVE REPORT
      ================================================= */}

      <section className="panel">

        <div className="panel-heading">

          <div>

            <span className="section-kicker">
              REPORT
            </span>

            <h2>
              Save your palm reading
            </h2>

            <p>
              Generate a persistent reading
              report containing this analysis
              and your actual uploaded palm image.
            </p>

          </div>


          <button
            className="button primary"
            onClick={saveReport}
            disabled={saving}
          >
            {saving
              ? "Generating Report…"
              : "Generate Report"}

            <FileImage size={17} />
          </button>

        </div>

      </section>


      <p className="disclaimer">

        Palmistry interpretations are traditional
        symbolic readings. They are not scientific
        measurements or guaranteed predictions.

      </p>

    </div>
  );
}


/* =========================================================
   METRIC
   ========================================================= */

function Metric({
  title,
  value,
  score,
  note,
}) {

  return (

    <div className="metric-card">

      <div className="metric-head">

        <span className="section-kicker">
          {title}
        </span>

        <strong>
          {score}%
        </strong>

      </div>


      <h2>
        {value}
      </h2>


      <div className="score-bar">

        <i
          style={{
            width: `${score}%`,
          }}
        />

      </div>


      <p>
        {note}
      </p>

    </div>

  );
}