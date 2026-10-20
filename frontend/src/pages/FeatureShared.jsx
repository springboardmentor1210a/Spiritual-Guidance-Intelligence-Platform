import { useEffect, useState } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import api from "../api/client";

export function PageHeading({
  eyebrow = "YOUR PERSONAL SPACE",
  title,
  subtitle
}) {
  return (
    <div className="feature-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}

export function ResultCard({ result }) {
  if (!result) return null;

  return (
    <section className="result-card">
      <div className="result-title">
        <CheckCircle2 size={20} />
        <h2>AI insights generated</h2>
      </div>
      <p className="muted">{result.title}</p>
      <div className="result-text">{result.result_text}</div>
      <p className="tiny-note">
        Saved on {result.created_at ? new Date(result.created_at).toLocaleString() : "this session"} ·
        For reflection and entertainment only. This is not a factual prediction or professional advice.
      </p>
    </section>
  );
}

export function InsightPage({
  title,
  subtitle,
  endpoint,
  eyebrow,
  render
}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let active = true;

    setBusy(true);
    setError("");

    api
      .get(endpoint)
      .then((response) => {
        if (active) setData(response.data);
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.detail ||
              "Unable to load this section."
          );
        }
      })
      .finally(() => {
        if (active) setBusy(false);
      });

    return () => {
      active = false;
    };
  }, [endpoint]);

  return (
    <div className="page-container feature-page">
      <PageHeading
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
      />

      {busy ? (
        <div className="feature-panel">
          Loading your personal space...
        </div>
      ) : error ? (
        <div className="alert">{error}</div>
      ) : (
        render(data)
      )}
    </div>
  );
}

export function PalmHistoryItem({ item }) {
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    let active = true;
    let objectUrl = "";

    if (item.reading_type === "palm" && item.has_palm_image) {
      api
        .get(`/api/readings/${item.id}/palm-image`, {
          responseType: "blob"
        })
        .then((response) => {
          objectUrl = URL.createObjectURL(response.data);

          if (active) {
            setImageUrl(objectUrl);
          } else {
            URL.revokeObjectURL(objectUrl);
          }
        })
        .catch(() => {
          if (active) {
            setImageError("Saved image could not be loaded.");
          }
        });
    }

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [item.id, item.reading_type, item.has_palm_image]);

  return (
    <article className="history-item">
      <strong>{item.title}</strong>

      <span>
        {item.reading_type} ·{" "}
        {new Date(item.created_at).toLocaleString()}
      </span>

      <p>{item.input_summary}</p>

      {item.reading_type === "palm" && (
        <>
          {imageUrl && (
            <div className="palm-preview-wrap">
              <div className="preview-heading">
                <strong>Saved palm image</strong>
              </div>

              <div className="palm-image-stage">
                <img
                  src={imageUrl}
                  alt="Palm image saved with this reading"
                />
              </div>
            </div>
          )}

          {imageError && (
            <p className="tiny-note">{imageError}</p>
          )}

          {Array.isArray(item.palm_insights) && (
            <div className="palm-feature-list">
              {item.palm_insights.map((feature) => (
                <article
                  className="palm-feature-card"
                  key={feature.key}
                >
                  <strong>{feature.name}</strong>
                  <p>{feature.area}</p>
                  <p>{feature.description}</p>
                  <p className="muted">
                    Reflection: {feature.prompt}
                  </p>
                  <span className="tiny-note">
                    {feature.status === "not_detected"
                      ? "Not yet detected — model required"
                      : feature.status}
                  </span>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      <div className="result-card">
        <div className="result-title">
          <Sparkles size={18} />
          <h3>Saved AI interpretation</h3>
        </div>

        <div className="result-text">
          {item.result_text}
        </div>
      </div>
    </article>
  );
}
