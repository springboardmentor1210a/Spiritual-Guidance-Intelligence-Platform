import { useEffect, useState } from "react";

function labelPoint(line) {
  const coords = line.coordinates;
  if (coords?.length) {
    return coords[Math.min(coords.length - 1, Math.floor(coords.length * 0.72))];
  }
  return { x: 50, y: 20 };
}

export default function PalmAnalysisImage({
  imageSrc,
  mode = "static",
  onComplete,
  containerId,
  lines = [],
}) {
  const scanning = mode === "analyzing";
  const [phase, setPhase] = useState(scanning ? "scanning" : "done");
  const [imageRatio, setImageRatio] = useState("3 / 4");

  useEffect(() => {
    if (!imageSrc) return;

    if (scanning) {
      setPhase("scanning");
      return;
    }

    setPhase("done");
    onComplete?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc, scanning]);

  if (!imageSrc) return null;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div
        id={containerId}
        className="relative w-full max-w-sm rounded-card overflow-hidden border border-line bg-void mx-auto"
        style={{ aspectRatio: imageRatio }}
      >
        <img
          src={imageSrc}
          alt="Uploaded palm"
          className="absolute inset-0 w-full h-full object-fill"
          onLoad={(event) => setImageRatio(`${event.currentTarget.naturalWidth} / ${event.currentTarget.naturalHeight}`)}
        />

        {lines.length > 0 && phase === "done" && (
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            {lines.filter((line) => line.detected !== false && line.path).map((line) => {
              const pt = labelPoint(line);
              return (
                <g key={line.id || line.name}>
                  {line.path && (
                    <path
                      d={line.path}
                      fill="none"
                      stroke={line.color || "#C9A15C"}
                      strokeWidth="1.1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="palm-line-path"
                      pathLength="1"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {phase === "scanning" && (
          <>
            <div className="scan-line" />
            <div className="scan-corner border-t-2 border-l-2" style={{ top: "6%", left: "6%" }} />
            <div className="scan-corner border-t-2 border-r-2" style={{ top: "6%", right: "6%" }} />
            <div className="scan-corner border-b-2 border-l-2" style={{ bottom: "6%", left: "6%" }} />
            <div className="scan-corner border-b-2 border-r-2" style={{ bottom: "6%", right: "6%" }} />
            <div className="absolute inset-x-0 bottom-3 text-center text-xs text-gold tracking-wide">
              Analyzing palm image…
            </div>
          </>
        )}

        {phase === "done" && (
          <div className="absolute top-3 left-3 text-[10px] px-2 py-1 rounded bg-void/80 border border-gold/40 text-gold">
            Analysis Complete
          </div>
        )}
      </div>
    </div>
  );
}
