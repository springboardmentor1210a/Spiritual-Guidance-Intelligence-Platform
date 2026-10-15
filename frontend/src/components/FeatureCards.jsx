import { useState } from "react";

import { useNavigate } from "react-router-dom";

/*
 * ============================================================
 * LUNARA FEATURE CARDS
 * ============================================================
 *
 * Visual direction:
 *
 * Ancient:
 * - Golden parchment
 * - Burnt edges
 * - Dark ink
 * - Antique gold
 * - Manuscript-inspired decoration
 *
 * Futuristic:
 * - Interactive hover lighting
 * - Animated borders
 * - Floating symbols
 * - Gold sweep animations
 * - Dynamic card elevation
 * - Smooth button interactions
 *
 * Existing functionality:
 * - Palmistry -> /palm-reader
 * - Tarot -> /tarot-reader
 * - Spiritual Guidance -> /guidance
 *
 * The Spiritual Guidance card opens the seeker guidance area
 * on the dashboard. Consultant availability remains controlled
 * by the verified consultant records exposed by the application.
 *
 * ============================================================
 */

const FeatureCards = () => {
  const navigate = useNavigate();

  /*
   * ==========================================================
   * INTERACTION STATE
   * ==========================================================
   */

  const [hoveredCard, setHoveredCard] =
    useState(null);

  /*
   * ==========================================================
   * CARD CONTAINER
   * ==========================================================
   */

  const cardContainerStyle = {
    width: "100%",

    display: "flex",

    justifyContent: "center",

    alignItems: "stretch",

    flexWrap: "wrap",

    gap: "2.5rem",

    padding: "2.5rem 1.5rem",

    boxSizing: "border-box",

    position: "relative",

    overflow: "hidden",
  };

  /*
   * ==========================================================
   * DECORATIVE BACKGROUND
   * ==========================================================
   */

  const decorativeGlowStyle = {
    position: "absolute",

    width: "420px",

    height: "420px",

    borderRadius: "50%",

    background:
      "radial-gradient(circle, rgba(240,198,106,.22), transparent 68%)",

    filter: "blur(8px)",

    pointerEvents: "none",

    animation:
      "featureAmbientGlow 8s ease-in-out infinite",
  };

  /*
   * ==========================================================
   * CARD BASE STYLE
   * ==========================================================
   */

  const getCardStyle = (cardName) => {
    const isHovered =
      hoveredCard === cardName;

    return {
      position: "relative",

      flex: "1 1 320px",

      minWidth: "300px",

      maxWidth: "420px",

      minHeight: "480px",

      padding: "2.6rem 2.2rem",

      boxSizing: "border-box",

      display: "flex",

      flexDirection: "column",

      alignItems: "center",

      textAlign: "center",

      overflow: "hidden",

      color: "#29160b",

      fontFamily:
        'Georgia, "Times New Roman", serif',

      /*
       * Main parchment colour.
       */
      background: `
        radial-gradient(
          circle at 25% 18%,
          rgba(255,225,143,.48),
          transparent 30%
        ),
        radial-gradient(
          circle at 80% 85%,
          rgba(107,53,24,.16),
          transparent 30%
        ),
        linear-gradient(
          145deg,
          #e3b25c 0%,
          #d19a3d 42%,
          #bd7927 100%
        )
      `,

      /*
       * Ancient manuscript border.
       */
      border:
        "3px solid #6b3518",

      borderRadius: "12px",

      /*
       * Layered parchment shadow.
       */
      boxShadow: isHovered
        ? `
          0 22px 45px rgba(58,28,13,.45),
          0 0 28px rgba(229,189,91,.32),
          inset 0 0 35px rgba(107,53,24,.18),
          inset 0 1px 0 rgba(255,235,166,.8)
        `
        : `
          8px 10px 24px rgba(58,28,13,.38),
          inset 0 0 40px rgba(92,58,33,.22),
          inset 0 1px 0 rgba(255,235,166,.65)
        `,

      transform: isHovered
        ? "translateY(-10px) scale(1.015)"
        : "translateY(0) scale(1)",

      transition:
        "transform 380ms cubic-bezier(.2,.8,.2,1), box-shadow 380ms ease",

      zIndex: isHovered ? 3 : 1,
    };
  };

  /*
   * ==========================================================
   * INNER MANUSCRIPT BORDER
   * ==========================================================
   */

  const innerBorderStyle = {
    position: "absolute",

    inset: "9px",

    border:
      "1px solid rgba(107,53,24,.45)",

    borderRadius: "7px",

    pointerEvents: "none",
  };

  /*
   * ==========================================================
   * TOP ORNAMENT
   * ==========================================================
   */

  const ornamentStyle = {
    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    gap: "10px",

    width: "100%",

    marginBottom: "18px",

    color: "#6b3518",

    fontSize: "0.9rem",

    letterSpacing: "0.28em",

    opacity: 0.8,
  };

  /*
   * ==========================================================
   * ICON CONTAINER
   * ==========================================================
   */

  const getIconStyle = (cardName) => {
    const isHovered =
      hoveredCard === cardName;

    return {
      position: "relative",

      width: "88px",

      height: "88px",

      display: "flex",

      alignItems: "center",

      justifyContent: "center",

      marginBottom: "1.2rem",

      border:
        "2px solid #9a6b20",

      borderRadius: "50%",

      color: "#f0c66a",

      background:
        "linear-gradient(145deg, #4a2412, #6b3518)",

      fontSize: "3.4rem",

      boxShadow: isHovered
        ? `
          0 0 0 6px rgba(200,155,60,.12),
          0 0 30px rgba(229,189,91,.48),
          0 10px 25px rgba(58,28,13,.35)
        `
        : `
          0 0 18px rgba(229,189,91,.22),
          0 8px 18px rgba(58,28,13,.28)
        `,

      transform: isHovered
        ? "rotate(-5deg) scale(1.1)"
        : "rotate(0deg) scale(1)",

      transition:
        "transform 450ms cubic-bezier(.2,.8,.2,1), box-shadow 450ms ease",

      zIndex: 2,
    };
  };

  /*
   * ==========================================================
   * CARD TITLE
   * ==========================================================
   */

  const titleStyle = {
    margin:
      "0 0 0.4rem 0",

    color: "#3a1c0d",

    fontSize: "2.15rem",

    lineHeight: 1.15,

    fontWeight: 700,

    letterSpacing: "0.01em",

    textShadow:
      "0 1px 0 rgba(255,224,137,.65)",
  };

  /*
   * ==========================================================
   * CARD SUBTITLE
   * ==========================================================
   */

  const subtitleStyle = {
    margin:
      "0 0 1.4rem 0",

    color: "#5c3017",

    fontSize: "1.15rem",

    fontStyle: "italic",

    fontWeight: 400,

    letterSpacing: "0.04em",
  };

  /*
   * ==========================================================
   * CARD DESCRIPTION
   * ==========================================================
   */

  const descriptionStyle = {
    flexGrow: 1,

    margin: 0,

    color: "rgba(41,22,11,.88)",

    fontSize: "1.04rem",

    lineHeight: 1.75,

    maxWidth: "360px",
  };

  /*
   * ==========================================================
   * BUTTON
   * ==========================================================
   */

  const getButtonStyle = (cardName) => {
    const isHovered =
      hoveredCard === cardName;

    return {
      position: "relative",

      display: "inline-flex",

      alignItems: "center",

      justifyContent: "center",

      gap: "9px",

      marginTop: "2rem",

      minWidth: "190px",

      padding: "13px 25px",

      overflow: "hidden",

      color: "#f7df9b",

      background:
        "linear-gradient(135deg, #4a2412, #6b3518)",

      border:
        "2px solid #9a6b20",

      borderRadius: "7px",

      fontSize: "0.95rem",

      fontWeight: 700,

      fontFamily:
        'Georgia, "Times New Roman", serif',

      cursor: "pointer",

      textTransform: "uppercase",

      letterSpacing: "0.08em",

      boxShadow: isHovered
        ? `
          0 9px 22px rgba(58,28,13,.42),
          0 0 18px rgba(229,189,91,.3)
        `
        : "4px 5px 0 rgba(44,26,15,.5)",

      transform: isHovered
        ? "translateY(-3px)"
        : "translateY(0)",

      transition:
        "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
    };
  };

  /*
   * ==========================================================
   * HANDLE CARD ENTER
   * ==========================================================
   */

  const handleCardEnter = (cardName) => {
    setHoveredCard(cardName);
  };

  /*
   * ==========================================================
   * HANDLE CARD LEAVE
   * ==========================================================
   */

  const handleCardLeave = () => {
    setHoveredCard(null);
  };

  /*
   * ==========================================================
   * OPEN SPIRITUAL GUIDANCE
   * ==========================================================
   *
   * The feature card is intentionally seeker-facing. It does
   * not manufacture consultant profiles or create a second
   * booking system. The dashboard owns the guidance experience.
   * ==========================================================
   */

  const guidanceRoute = "/guidance";

  const guidanceNavigationState = {
    service: "spiritual-guidance",
    source: "feature-card"
  };

  const openSpiritualGuidance = () => {
    setHoveredCard(null);

    navigate(guidanceRoute, {
      state: guidanceNavigationState
    });

    window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }, 0);
  };

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <section
      aria-label="Lunara spiritual features"
      style={cardContainerStyle}
    >
      {/* =====================================================
          AMBIENT LIGHT
          ===================================================== */}

      <div
        aria-hidden="true"
        style={{
          ...decorativeGlowStyle,

          top: "-160px",

          left: "-170px",
        }}
      />

      <div
        aria-hidden="true"
        style={{
          ...decorativeGlowStyle,

          right: "-170px",

          bottom: "-180px",

          animationDelay: "2s",
        }}
      />

      {/* =====================================================
          PALMISTRY CARD
          ===================================================== */}

      <div
        className="lunara-feature-card"
        style={getCardStyle("palm")}
        onMouseEnter={() =>
          handleCardEnter("palm")
        }
        onMouseLeave={handleCardLeave}
      >
        {/* Inner manuscript border */}

        <div
          aria-hidden="true"
          style={innerBorderStyle}
        />

        {/* Animated gold sweep */}

        <div
          aria-hidden="true"
          style={{
            position: "absolute",

            top: "-80%",

            left: "-40%",

            width: "30%",

            height: "220%",

            background:
              "linear-gradient(90deg, transparent, rgba(255,235,166,.3), transparent)",

            transform: "rotate(25deg)",

            pointerEvents: "none",

            animation:
              "featureGoldSweep 7s ease-in-out infinite",
          }}
        />

        {/* Top manuscript ornament */}

        <div style={ornamentStyle}>
          <span>✦</span>

          <span>·</span>

          <span>✧</span>

          <span>·</span>

          <span>✦</span>
        </div>

        {/* Palm icon */}

        <div
          style={getIconStyle("palm")}
          aria-hidden="true"
        >
          ✋
        </div>

        {/* Title */}

        <h3 style={titleStyle}>
          Palmistry
        </h3>

        {/* Subtitle */}

        <h4 style={subtitleStyle}>
          Read Your Hand
        </h4>

        {/* Decorative divider */}

        <div
          style={{
            width: "80%",

            height: "1px",

            margin:
              "0 auto 1.4rem",

            background:
              "linear-gradient(90deg, transparent, #9a6b20, transparent)",
          }}
        />

        {/* Description */}

        <p style={descriptionStyle}>
          Analyze your palm's Life Line, Heart
          Line, and Mounts. Discover hidden truths
          and map out your life's journey using
          ancient techniques.
        </p>

        {/* Secondary manuscript decoration */}

        <div
          style={{
            marginTop: "1.3rem",

            color: "#6b3518",

            fontSize: "0.8rem",

            letterSpacing: "0.22em",

            opacity: 0.75,
          }}
        >
          ✧ THE LINES OF DESTINY ✧
        </div>

        {/* Action button */}

        <button
          type="button"
          onClick={() =>
            navigate("/palm-reader")
          }
          style={getButtonStyle("palm")}
          onMouseEnter={() =>
            handleCardEnter("palm")
          }
        >
          <span>✋</span>

          <span>
            Read My Palm
          </span>

          <span
            style={{
              fontSize: "1.05rem",

              color: "#e5bd5b",
            }}
          >
            →
          </span>

          {/* Button light */}

          <span
            aria-hidden="true"
            style={{
              position: "absolute",

              top: 0,

              bottom: 0,

              left: "-80%",

              width: "55%",

              transform:
                "skewX(-20deg)",

              background:
                "linear-gradient(90deg, transparent, rgba(255,235,166,.3), transparent)",

              animation:
                "featureButtonSweep 4.5s ease-in-out infinite",
            }}
          />
        </button>
      </div>

      {/* =====================================================
          TAROT CARD
          ===================================================== */}

      <div
        className="lunara-feature-card"
        style={getCardStyle("tarot")}
        onMouseEnter={() =>
          handleCardEnter("tarot")
        }
        onMouseLeave={handleCardLeave}
      >
        {/* Inner manuscript border */}

        <div
          aria-hidden="true"
          style={innerBorderStyle}
        />

        {/* Animated gold sweep */}

        <div
          aria-hidden="true"
          style={{
            position: "absolute",

            top: "-80%",

            left: "-40%",

            width: "30%",

            height: "220%",

            background:
              "linear-gradient(90deg, transparent, rgba(255,235,166,.3), transparent)",

            transform: "rotate(25deg)",

            pointerEvents: "none",

            animation:
              "featureGoldSweep 7s ease-in-out 2s infinite",
          }}
        />

        {/* Top manuscript ornament */}

        <div style={ornamentStyle}>
          <span>✦</span>

          <span>·</span>

          <span>◇</span>

          <span>·</span>

          <span>✦</span>
        </div>

        {/* Tarot icon */}

        <div
          style={getIconStyle("tarot")}
          aria-hidden="true"
        >
          🃏
        </div>

        {/* Title */}

        <h3 style={titleStyle}>
          Tarot Readings
        </h3>

        {/* Subtitle */}

        <h4 style={subtitleStyle}>
          Consult the Cards
        </h4>

        {/* Decorative divider */}

        <div
          style={{
            width: "80%",

            height: "1px",

            margin:
              "0 auto 1.4rem",

            background:
              "linear-gradient(90deg, transparent, #9a6b20, transparent)",
          }}
        />

        {/* Description */}

        <p style={descriptionStyle}>
          Draw from the Major and Minor Arcana.
          Consult the cards in times of confusion
          to uncover answers and open new paths
          in your destiny.
        </p>

        {/* Secondary manuscript decoration */}

        <div
          style={{
            marginTop: "1.3rem",

            color: "#6b3518",

            fontSize: "0.8rem",

            letterSpacing: "0.22em",

            opacity: 0.75,
          }}
        >
          ✧ THE WISDOM OF THE ARCANA ✧
        </div>

        {/* Action button */}

        <button
          type="button"
          onClick={() =>
            navigate("/tarot-reader")
          }
          style={getButtonStyle("tarot")}
          onMouseEnter={() =>
            handleCardEnter("tarot")
          }
        >
          <span>◇</span>

          <span>
            Draw the Cards
          </span>

          <span
            style={{
              fontSize: "1.05rem",

              color: "#e5bd5b",
            }}
          >
            →
          </span>

          {/* Button light */}

          <span
            aria-hidden="true"
            style={{
              position: "absolute",

              top: 0,

              bottom: 0,

              left: "-80%",

              width: "55%",

              transform:
                "skewX(-20deg)",

              background:
                "linear-gradient(90deg, transparent, rgba(255,235,166,.3), transparent)",

              animation:
                "featureButtonSweep 4.5s ease-in-out 2s infinite",
            }}
          />
        </button>
      </div>

      {/* =====================================================
          SPIRITUAL GUIDANCE CARD
          ===================================================== */}

      <div
        style={getCardStyle("guidance")}
        onMouseEnter={() =>
          handleCardEnter("guidance")
        }
        onMouseLeave={handleCardLeave}
        className="lunara-feature-card"
      >
        {/* Inner manuscript border */}

        <div
          aria-hidden="true"
          style={innerBorderStyle}
        />

        {/* Animated gold sweep */}

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "-80%",
            left: "-40%",
            width: "30%",
            height: "220%",
            background:
              "linear-gradient(90deg, transparent, rgba(255,235,166,.3), transparent)",
            transform: "rotate(25deg)",
            pointerEvents: "none",
            animation:
              "featureGoldSweep 7s ease-in-out 4s infinite",
          }}
        />

        {/* Top manuscript ornament */}

        <div style={ornamentStyle}>
          <span>✦</span>
          <span>·</span>
          <span>☼</span>
          <span>·</span>
          <span>✦</span>
        </div>

        {/* Spiritual guidance icon */}

        <div
          style={getIconStyle("guidance")}
          aria-hidden="true"
        >
          ☼
        </div>

        {/* Title */}

        <h3 style={titleStyle}>
          Spiritual Guidance
        </h3>

        {/* Subtitle */}

        <h4 style={subtitleStyle}>
          Guide My Journey
        </h4>

        {/* Decorative divider */}

        <div
          style={{
            width: "80%",
            height: "1px",
            margin:
              "0 auto 1.4rem",
            background:
              "linear-gradient(90deg, transparent, #9a6b20, transparent)",
          }}
        />

        {/* Description */}

        <p style={descriptionStyle}>
          Connect with a verified spiritual consultant
          for thoughtful one-to-one guidance. Explore
          available practitioners, choose a suitable
          session, and request an online consultation.
        </p>

        {/* Secondary manuscript decoration */}

        <div
          style={{
            marginTop: "1.3rem",
            color: "#6b3518",
            fontSize: "0.8rem",
            letterSpacing: "0.22em",
            opacity: 0.75,
          }}
        >
          ✧ THE PATH OF GUIDANCE ✧
        </div>

        {/* Action button */}

        <button
          type="button"
          onClick={openSpiritualGuidance}
          style={getButtonStyle("guidance")}
          onMouseEnter={() =>
            handleCardEnter("guidance")
          }
          aria-label="Open Spiritual Guidance"
        >
          <span>☼</span>

          <span>
            Guide My Journey
          </span>

          <span
            style={{
              fontSize: "1.05rem",
              color: "#e5bd5b",
            }}
          >
            →
          </span>

          {/* Button light */}

          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "-80%",
              width: "55%",
              transform:
                "skewX(-20deg)",
              background:
                "linear-gradient(90deg, transparent, rgba(255,235,166,.3), transparent)",
              animation:
                "featureButtonSweep 4.5s ease-in-out 4s infinite",
            }}
          />
        </button>
      </div>

      {/* =====================================================
          FUTURISTIC ANIMATION SYSTEM
          ===================================================== */}

      <style>
        {`
          @keyframes featureAmbientGlow {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
              opacity: .55;
            }

            50% {
              transform: translate3d(25px, -18px, 0) scale(1.08);
              opacity: .9;
            }
          }

          @keyframes featureGoldSweep {
            0%, 60% {
              left: -45%;
              opacity: 0;
            }

            68% {
              opacity: .7;
            }

            90%, 100% {
              left: 145%;
              opacity: 0;
            }
          }

          @keyframes featureButtonSweep {
            0%, 55% {
              left: -80%;
              opacity: 0;
            }

            65% {
              opacity: .8;
            }

            90%, 100% {
              left: 150%;
              opacity: 0;
            }
          }

          @media (max-width: 700px) {
            .lunara-feature-card {
              min-width: 280px !important;
              width: 100% !important;
              max-width: 500px !important;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .lunara-feature-card,
            .lunara-feature-card *,
            section[aria-label="Lunara spiritual features"] * {
              animation: none !important;
              transition: none !important;
            }
          }
        `}
      </style>
    </section>
  );
};

export default FeatureCards;