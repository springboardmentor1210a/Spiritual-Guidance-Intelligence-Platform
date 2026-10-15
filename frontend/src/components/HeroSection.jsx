const HeroSection = () => {
  const stars = Array.from({ length: 18 });

  return (
    <section
      className="lunara-hero"
      style={{
        position: "relative",
        minHeight: "78vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "110px 20px 70px",
        background:
          "radial-gradient(circle at 50% 40%, rgba(244, 204, 119, 0.55), transparent 38%), linear-gradient(135deg, #693316 0%, #9c5d20 25%, #d09a3d 50%, #a96721 76%, #542711 100%)",
        color: "#29160b",
        fontFamily: 'Georgia, "Times New Roman", serif',
      }}
    >
      {/* =====================================================
          ANCIENT PAPER LIGHT
          ===================================================== */}

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, rgba(255, 225, 143, 0.25), transparent 62%)",
          animation: "heroPaperGlow 6s ease-in-out infinite",
        }}
      />

      {/* =====================================================
          PAPER GRAIN
          ===================================================== */}

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.18,
          pointerEvents: "none",
          backgroundImage:
            "radial-gradient(circle, rgba(58,28,13,.55) 0 1px, transparent 1.5px)",
          backgroundSize: "43px 47px",
          mixBlendMode: "multiply",
        }}
      />

      {/* =====================================================
          ANIMATED MYSTICAL PARTICLES
          ===================================================== */}

      {stars.map((_, index) => (
        <span
          key={index}
          style={{
            position: "absolute",
            left: `${5 + ((index * 17) % 90)}%`,
            top: `${8 + ((index * 29) % 82)}%`,
            width: index % 3 === 0 ? "5px" : "3px",
            height: index % 3 === 0 ? "5px" : "3px",
            borderRadius: "50%",
            background:
              index % 4 === 0
                ? "#5a315f"
                : "#f0c66a",
            boxShadow:
              index % 4 === 0
                ? "0 0 12px rgba(74,40,88,.55)"
                : "0 0 12px rgba(240,198,106,.7)",
            opacity: 0.55,
            animation: `heroParticle ${
              3 + (index % 4)
            }s ease-in-out ${index * 0.12}s infinite`,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* =====================================================
          DECORATIVE ORNAMENT
          ===================================================== */}

      <div
        style={{
          position: "absolute",
          width: "520px",
          height: "520px",
          border: "1px solid rgba(239,198,106,.35)",
          borderRadius: "50%",
          animation: "heroOrbit 24s linear infinite",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "380px",
          height: "380px",
          border: "1px solid rgba(74,40,88,.24)",
          borderRadius: "50%",
          transform: "rotate(35deg)",
          animation: "heroOrbitReverse 18s linear infinite",
          pointerEvents: "none",
        }}
      />

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <div
        style={{
          position: "relative",
          zIndex: 5,
          width: "min(950px, 100%)",
          textAlign: "center",
        }}
      >
        {/* TOP LABEL */}

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
            padding: "8px 18px",
            border: "1px solid rgba(107,53,24,.7)",
            borderRadius: "999px",
            background: "rgba(232,201,130,.5)",
            color: "#4a2412",
            fontSize: "0.76rem",
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            boxShadow:
              "0 6px 18px rgba(58,28,13,.18)",
            animation: "heroFadeUp .8s ease both",
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#e5bd5b",
              boxShadow:
                "0 0 12px rgba(229,189,91,.8)",
              animation:
                "heroDotPulse 2s ease-in-out infinite",
            }}
          />

          Ancient wisdom • Modern insight
        </div>

        {/* MAIN TITLE */}

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(4rem, 11vw, 8rem)",
            lineHeight: 0.95,
            fontWeight: 700,
            letterSpacing: "0.07em",
            color: "#3a1c0d",
            textShadow:
              "0 3px 0 rgba(240,198,106,.7), 0 8px 30px rgba(58,28,13,.28)",
            animation:
              "heroTitleReveal 1.1s cubic-bezier(.2,.8,.2,1) both",
          }}
        >
          ✧ Lunara ✧
        </h1>

        {/* DECORATIVE LINE */}

        <div
          style={{
            width: "min(500px, 80%)",
            height: "1px",
            margin: "26px auto",
            background:
              "linear-gradient(90deg, transparent, #6b3518, #e5bd5b, #6b3518, transparent)",
            boxShadow:
              "0 0 14px rgba(229,189,91,.35)",
            animation:
              "heroLineReveal 1.2s ease .3s both",
          }}
        />

        {/* SUBTITLE */}

        <div
          style={{
            display: "inline-block",
            padding: "13px 24px",
            borderTop: "2px solid #6b3518",
            borderBottom: "2px solid #6b3518",
            color: "#4a2412",
            fontSize: "clamp(1rem, 2.5vw, 1.65rem)",
            fontWeight: 700,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            textShadow:
              "0 1px rgba(240,198,106,.7)",
            animation:
              "heroSubtitleReveal 1s ease .45s both",
          }}
        >
          Unlock Your Destiny
        </div>

        {/* SUPPORTING TEXT */}

        <p
          style={{
            maxWidth: "650px",
            margin: "28px auto 0",
            color: "rgba(58,28,13,.86)",
            fontSize: "1.05rem",
            lineHeight: 1.8,
            animation:
              "heroFadeUp 1s ease .65s both",
          }}
        >
          Enter an ancient world of palmistry, tarot and mystical
          guidance — reimagined with intelligent modern experiences.
        </p>

        {/* FEATURE PILLS */}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "12px",
            marginTop: "30px",
            animation:
              "heroFadeUp 1s ease .85s both",
          }}
        >
          {[
            ["✋", "Palm Reading"],
            ["◇", "Tarot"],
            ["☾", "Guidance"],
          ].map(([symbol, label]) => (
            <div
              key={label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "9px 15px",
                border: "1px solid rgba(107,53,24,.7)",
                borderRadius: "999px",
                background:
                  "rgba(232,201,130,.42)",
                color: "#4a2412",
                fontSize: "0.86rem",
                fontWeight: 700,
                boxShadow:
                  "0 5px 15px rgba(58,28,13,.15)",
                transition:
                  "transform .25s ease, box-shadow .25s ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.transform =
                  "translateY(-4px)";
                event.currentTarget.style.boxShadow =
                  "0 10px 22px rgba(58,28,13,.28), 0 0 16px rgba(229,189,91,.25)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform =
                  "translateY(0)";
                event.currentTarget.style.boxShadow =
                  "0 5px 15px rgba(58,28,13,.15)";
              }}
            >
              <span
                style={{
                  color: "#4a2858",
                  fontSize: "1.1rem",
                }}
              >
                {symbol}
              </span>

              {label}
            </div>
          ))}
        </div>

        {/* BOTTOM ORNAMENT */}

        <div
          style={{
            marginTop: "45px",
            color: "#6b3518",
            fontSize: "1.3rem",
            letterSpacing: "0.7em",
            opacity: 0.8,
            animation:
              "heroFadeUp 1s ease 1s both",
          }}
        >
          ✦ · ✧ · ✦
        </div>
      </div>

      {/* =====================================================
          ANIMATIONS
          ===================================================== */}

      <style>
        {`
          @keyframes heroPaperGlow {
            0%, 100% {
              opacity: .65;
              transform: scale(1);
            }

            50% {
              opacity: 1;
              transform: scale(1.05);
            }
          }

          @keyframes heroOrbit {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @keyframes heroOrbitReverse {
            from {
              transform: rotate(360deg);
            }

            to {
              transform: rotate(0deg);
            }
          }

          @keyframes heroParticle {
            0%, 100% {
              transform: translate3d(0, 0, 0);
              opacity: .3;
            }

            50% {
              transform: translate3d(0, -18px, 0);
              opacity: .9;
            }
          }

          @keyframes heroDotPulse {
            0%, 100% {
              transform: scale(1);
              opacity: .65;
            }

            50% {
              transform: scale(1.35);
              opacity: 1;
            }
          }

          @keyframes heroFadeUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes heroTitleReveal {
            from {
              opacity: 0;
              transform: translateY(30px) scale(.94);
              filter: blur(5px);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
              filter: blur(0);
            }
          }

          @keyframes heroSubtitleReveal {
            from {
              opacity: 0;
              letter-spacing: .45em;
            }

            to {
              opacity: 1;
              letter-spacing: .25em;
            }
          }

          @keyframes heroLineReveal {
            from {
              transform: scaleX(0);
              opacity: 0;
            }

            to {
              transform: scaleX(1);
              opacity: 1;
            }
          }

          @media (max-width: 600px) {
            .lunara-hero {
              min-height: 75vh !important;
              padding-top: 100px !important;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .lunara-hero *,
            .lunara-hero {
              animation: none !important;
            }
          }
        `}
      </style>
    </section>
  );
};

export default HeroSection;