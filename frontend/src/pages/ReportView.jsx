import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Download,
  Sparkles,
  Heart,
  Briefcase,
  Compass,
  Star,
  Moon,
  Sun,
  CircleDot,
  ShieldCheck,
} from "lucide-react";

import {
  getReport,
  downloadReportPdf,
} from "../api/reports";

export default function ReportView() {
  const { reportId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        setError("");

        const data = await getReport(reportId);
        setReport(data);
      } catch (err) {
        setError(
          err.message || "Unable to load report."
        );
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [reportId]);

  async function handleDownload() {
    try {
      setDownloading(true);
      setError("");

      await downloadReportPdf(reportId);
    } catch (err) {
      setError(
        err.message || "Unable to download PDF."
      );
    } finally {
      setDownloading(false);
    }
  }

  const parsedContent = useMemo(() => {
    if (!report?.content) {
      return null;
    }

    try {
      return JSON.parse(report.content);
    } catch {
      return null;
    }
  }, [report]);

  if (loading) {
    return (
      <div className="report-page">
        <div className="report-loading">
          <div className="report-loading-icon">
            <Sparkles size={24} />
          </div>

          <h2>Preparing your reading</h2>

          <p>
            Gathering your insights...
          </p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="report-page">
        <div className="report-error card">
          <CircleDot size={32} />

          <h1>Report unavailable</h1>

          <p>
            {error ||
              "This reading report could not be found."}
          </p>

          <button
            className="button"
            onClick={() => navigate("/reports")}
          >
            <ArrowLeft size={16} />
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  const isTarot =
    report.report_type?.toLowerCase().includes("tarot");

  const isPalm =
    report.report_type?.toLowerCase().includes("palm");

  const formattedDate = new Date(
    report.created_at
  ).toLocaleString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="report-page">

      {/* ------------------------------------------------ */}
      {/* TOP NAVIGATION */}
      {/* ------------------------------------------------ */}

      <div className="report-topbar">

        <button
          className="report-back-button"
          onClick={() => navigate("/reports")}
        >
          <ArrowLeft size={17} />
          Back to Reports
        </button>

        <button
          className="button report-download-button"
          onClick={handleDownload}
          disabled={downloading}
        >
          <Download size={17} />

          {downloading
            ? "Preparing PDF..."
            : "Download PDF"}
        </button>

      </div>

      {/* ------------------------------------------------ */}
      {/* HERO */}
      {/* ------------------------------------------------ */}

      <section className="report-hero">

        <div className="report-hero-glow" />

        <div className="report-hero-content">

          <div className="report-type-pill">
            <Sparkles size={14} />

            {isTarot
              ? "Tarot Intelligence Reading"
              : isPalm
              ? "Palmistry Intelligence Reading"
              : "Spiritual Intelligence Report"}
          </div>

          <h1>{report.title}</h1>

          <p className="report-hero-description">
            A personalized reading generated from your
            spiritual analysis and reading context.
          </p>

          <div className="report-meta-row">

            <span>
              <CalendarDays size={15} />

              {formattedDate}
            </span>

            <span>
              <ShieldCheck size={15} />

              Private Reading
            </span>

          </div>

        </div>

      </section>

      {/* ------------------------------------------------ */}
      {/* ERROR */}
      {/* ------------------------------------------------ */}

      {error && (
        <div className="error-message report-inline-error">
          {error}
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* TAROT */}
      {/* ------------------------------------------------ */}

      {isTarot && parsedContent?.cards ? (
        <TarotReport
          content={parsedContent}
        />
      ) : null}

      {/* ------------------------------------------------ */}
      {/* PALM */}
      {/* ------------------------------------------------ */}

      {isPalm ? (
        <PalmReport
          content={parsedContent}
          rawContent={report.content}
        />
      ) : null}

      {/* ------------------------------------------------ */}
      {/* GENERIC */}
      {/* ------------------------------------------------ */}

      {!isTarot && !isPalm && (
        <GenericReport
          content={parsedContent}
          rawContent={report.content}
        />
      )}

      {/* ------------------------------------------------ */}
      {/* FOOTER */}
      {/* ------------------------------------------------ */}

      <div className="report-disclaimer">

        <Sparkles size={16} />

        <p>
          This reading is provided for spiritual
          reflection and entertainment purposes. It
          should not be treated as medical, financial,
          legal, or professional advice.
        </p>

      </div>

    </div>
  );
}


/* ===================================================== */
/* TAROT REPORT                                          */
/* ===================================================== */

function TarotReport({ content }) {
  return (
    <div className="report-content">

      {/* Overview */}

      <section className="report-overview-grid">

        <div className="report-overview-card">

          <div className="overview-icon">
            <Compass size={20} />
          </div>

          <span>Spread</span>

          <strong>
            {formatLabel(content.spread)}
          </strong>

        </div>

        <div className="report-overview-card">

          <div className="overview-icon">
            <Heart size={20} />
          </div>

          <span>Reading Context</span>

          <strong>
            {formatLabel(content.context)}
          </strong>

        </div>

        <div className="report-overview-card">

          <div className="overview-icon">
            <Star size={20} />
          </div>

          <span>Cards Drawn</span>

          <strong>
            {content.cards?.length || 0}
          </strong>

        </div>

      </section>

      {/* Reading introduction */}

      <section className="report-section">

        <div className="report-section-heading">

          <div className="section-heading-icon">
            <Sparkles size={18} />
          </div>

          <div>
            <span>YOUR READING</span>

            <h2>Tarot Insights</h2>
          </div>

        </div>

        <p className="report-intro">
          Your cards have been interpreted according
          to their position, orientation, and selected
          reading context.
        </p>

      </section>

      {/* Cards */}

      <section className="tarot-cards-list">

        {content.cards.map((item, index) => {

          const card = item.card || {};

          const reversed =
            card.orientation?.toLowerCase() ===
            "reversed";

          return (
            <article
              className="tarot-report-card"
              key={`${item.position}-${index}`}
            >

              {/* Number */}

              <div className="tarot-card-number">
                {String(index + 1).padStart(2, "0")}
              </div>

              {/* Position */}

              <div className="tarot-card-position">

                <span>POSITION</span>

                <h3>
                  {item.position}
                </h3>

              </div>

              {/* Card */}

              <div className="tarot-card-main">

                <div className="tarot-symbol">
                  {reversed ? (
                    <Moon size={25} />
                  ) : (
                    <Sun size={25} />
                  )}
                </div>

                <div>

                  <h2>
                    {card.name ||
                      "Unknown Card"}
                  </h2>

                  <div className="tarot-card-tags">

                    {card.arcana && (
                      <span>
                        {card.arcana}
                      </span>
                    )}

                    {card.suit && (
                      <span>
                        {card.suit}
                      </span>
                    )}

                    {card.orientation && (
                      <span
                        className={
                          reversed
                            ? "reversed"
                            : "upright"
                        }
                      >
                        {formatLabel(
                          card.orientation
                        )}
                      </span>
                    )}

                  </div>

                </div>

              </div>

              {/* Meaning */}

              <div className="tarot-card-meaning">

                <div className="meaning-block">

                  <span>
                    CARD MEANING
                  </span>

                  <p>
                    {card.meaning ||
                      "No interpretation available."}
                  </p>

                </div>

                {card.context_meaning && (
                  <div className="meaning-block">

                    <span>
                      CONTEXT INTERPRETATION
                    </span>

                    <p>
                      {card.context_meaning}
                    </p>

                  </div>
                )}

                {Array.isArray(card.keywords) &&
                  card.keywords.length > 0 && (
                    <div className="keyword-row">

                      {card.keywords.map(
                        (keyword) => (
                          <span
                            key={keyword}
                          >
                            {keyword}
                          </span>
                        )
                      )}

                    </div>
                  )}

              </div>

            </article>
          );
        })}

      </section>

    </div>
  );
}


function PalmReport({
  content,
  rawContent,
}) {
  const data = content || {};
  const analysis = data.analysis || {};

  const palmShape = analysis.palmShape;
  const fingers = analysis.fingers;
  const lines = Array.isArray(analysis.lines)
    ? analysis.lines
    : [];

  return (
    <div className="report-content">

      {/* =================================================
          READING OVERVIEW
      ================================================= */}

      <section className="palm-hero-grid">

        <div className="palm-summary-card"
        style={{ gridColumn: "1 / -1" }}
        >

          <div className="report-section-heading">

            <div className="section-heading-icon">
              <Sparkles size={18} />
            </div>

            <div>
              <span>PALM ANALYSIS</span>
              <h2>Reading Overview</h2>
            </div>

          </div>

          <p>
            Your palm has been analyzed across the
            major characteristics defined for the
            reading workflow.
          </p>


          <div className="palm-feature-mini-grid">

            <FeatureMini
              icon={<Heart size={17} />}
              label="Life Line"
              value={getLineStatus(lines, "Life Line")}
            />

            <FeatureMini
              icon={<Compass size={17} />}
              label="Head Line"
              value={getLineStatus(lines, "Head Line")}
            />

            <FeatureMini
              icon={<Star size={17} />}
              label="Heart Line"
              value={getLineStatus(lines, "Heart Line")}
            />

            <FeatureMini
              icon={<Sun size={17} />}
              label="Fate Line"
              value={getLineStatus(lines, "Fate Line")}
            />

          </div>

        </div>

      </section>


      {/* =================================================
          PALM CHARACTERISTICS
      ================================================= */}

      <section className="report-section">

        <div className="report-section-heading">

          <div className="section-heading-icon">
            <CircleDot size={18} />
          </div>

          <div>
            <span>FEATURE ANALYSIS</span>
            <h2>Palm Characteristics</h2>
          </div>

        </div>


        <div className="palm-features-grid">

          {palmShape && (
            <PalmFeatureCard
              title="Palm Shape"
              value={palmShape.value}
              score={palmShape.score}
              note={palmShape.note}
            />
          )}

          {fingers && (
            <PalmFeatureCard
              title="Finger Structure"
              value={fingers.value}
              score={fingers.score}
              note={fingers.note}
            />
          )}

        </div>

      </section>


      {/* =================================================
          PALM LINES
      ================================================= */}

      {lines.length > 0 && (
        <section className="report-section">

          <div className="report-section-heading">

            <div className="section-heading-icon">
              <Sparkles size={18} />
            </div>

            <div>
              <span>LINE ANALYSIS</span>
              <h2>Palm Lines</h2>
            </div>

          </div>


          <div className="palm-lines-report-grid">

            {lines.map((line) => (

              <div
                className="palm-line-report-card"
                key={line.name}
              >

                <div className="palm-line-report-header">

                  <div>
                    <span>
                      {line.name}
                    </span>

                    <h3>
                      {line.status}
                    </h3>
                  </div>

                  <strong>
                    {line.score}%
                  </strong>

                </div>


                <div className="score-bar">

                  <i
                    style={{
                      width: `${line.score}%`,
                    }}
                  />

                </div>


                {line.note && (
                  <p>
                    {line.note}
                  </p>
                )}

              </div>

            ))}

          </div>

        </section>
      )}


      {/* =================================================
          INTERPRETATION
      ================================================= */}

      <section className="report-section interpretation-section">

        <div className="report-section-heading">

          <div className="section-heading-icon">
            <Sparkles size={18} />
          </div>

          <div>
            <span>INTERPRETATION</span>
            <h2>Your Palm Reading</h2>
          </div>

        </div>


        <div className="palm-interpretation">

          {data.interpretation ? (
            <p>
              {data.interpretation}
            </p>
          ) : (
            <PalmInterpretationFallback
              analysis={analysis}
              rawContent={rawContent}
            />
          )}

        </div>

      </section>

    </div>
  );
}


function PalmFeatureCard({
  title,
  value,
  score,
  note,
}) {
  return (
    <div className="palm-feature-card">

      <div className="palm-feature-card-header">

        <span>
          {title}
        </span>

        {score !== undefined && (
          <strong>
            {score}%
          </strong>
        )}

      </div>

      <h3>
        {value || "Not specified"}
      </h3>

      {score !== undefined && (
        <div className="score-bar">

          <i
            style={{
              width: `${score}%`,
            }}
          />

        </div>
      )}

      {note && (
        <p>
          {note}
        </p>
      )}

    </div>
  );
}


function getLineStatus(lines, name) {
  const line = lines.find(
    (item) =>
      item.name?.toLowerCase() ===
      name.toLowerCase()
  );

  return line?.status || "Analyzed";
}


function PalmInterpretationFallback({
  analysis,
  rawContent,
}) {
  const lines = Array.isArray(analysis.lines)
    ? analysis.lines
    : [];

  if (
    analysis.palmShape?.note ||
    analysis.fingers?.note ||
    lines.length > 0
  ) {
    return (
      <div className="palm-readable-interpretation">

        {analysis.palmShape?.note && (
          <p>
            <strong>Palm Shape:</strong>{" "}
            {analysis.palmShape.note}
          </p>
        )}

        {analysis.fingers?.note && (
          <p>
            <strong>Finger Structure:</strong>{" "}
            {analysis.fingers.note}
          </p>
        )}

        {lines.map((line) => (
          <p key={line.name}>
            <strong>
              {line.name}:
            </strong>{" "}
            {line.note}
          </p>
        ))}

      </div>
    );
  }

  return (
    <pre>
      {rawContent}
    </pre>
  );
}


/* ===================================================== */
/* GENERIC REPORT                                        */
/* ===================================================== */

function GenericReport({
  content,
  rawContent,
}) {
  return (
    <div className="report-content">

      <section className="report-section">

        <div className="report-section-heading">

          <div className="section-heading-icon">
            <Sparkles size={18} />
          </div>

          <div>
            <span>READING</span>
            <h2>Analysis</h2>
          </div>

        </div>

        <div className="generic-report-body">

          {content ? (
            <pre>
              {JSON.stringify(
                content,
                null,
                2
              )}
            </pre>
          ) : (
            <p>{rawContent}</p>
          )}

        </div>

      </section>

    </div>
  );
}


/* ===================================================== */
/* SMALL FEATURE CARD                                    */
/* ===================================================== */

function FeatureMini({
  icon,
  label,
  value,
}) {
  return (
    <div className="palm-feature-mini">

      <div className="mini-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>

        {value && (
          <small>
            {value}
          </small>
        )}

      </div>

    </div>
  );
}


/* ===================================================== */
/* HELPERS                                               */
/* ===================================================== */

function formatLabel(value) {
  if (!value) {
    return "Not specified";
  }

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}