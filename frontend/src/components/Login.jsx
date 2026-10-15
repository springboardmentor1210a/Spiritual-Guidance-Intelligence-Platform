import { useState } from "react";

import api from "../api";

/*
 * ============================================================
 * LUNARA LOGIN / REGISTRATION
 * ============================================================
 *
 * Theme:
 * Ancient mystical parchment
 *
 * Interaction:
 * Futuristic animation and responsive feedback
 *
 * Preserved functionality:
 * - FastAPI registration
 * - FastAPI OAuth2 login
 * - JWT token storage
 * - Login success callback
 * - Registration role selection
 * - FastAPI 422 error handling
 * - Loading state
 * - Login / registration switching
 *
 * ============================================================
 */

export default function Login({ onLoginSuccess }) {
  /*
   * ==========================================================
   * FORM STATE
   * ==========================================================
   */

  const [email, setEmail] = useState("");

  const [firstName, setFirstName] = useState("");

  const [lastName, setLastName] = useState("");

  const [nickname, setNickname] = useState("");

  const [dateOfBirth, setDateOfBirth] = useState("");

  const [gender, setGender] = useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [calculatedAge, setCalculatedAge] =
    useState("");

  const [role, setRole] =
    useState("User");

  const [isRegistering, setIsRegistering] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  /*
   * ==========================================================
   * PROFILE AGE CALCULATION
   * ==========================================================
   *
   * Age is derived from the date of birth and is never stored
   * as a separate database field.
   */

  const calculateAge = (birthDate) => {
    if (!birthDate) {
      return "";
    }

    const today = new Date();
    const birth = new Date(`${birthDate}T00:00:00`);

    if (Number.isNaN(birth.getTime()) || birth > today) {
      return "";
    }

    let age = today.getFullYear() - birth.getFullYear();

    const monthDifference =
      today.getMonth() - birth.getMonth();

    if (
      monthDifference < 0 ||
      (
        monthDifference === 0 &&
        today.getDate() < birth.getDate()
      )
    ) {
      age -= 1;
    }

    return age >= 0 ? age : "";
  };

  const handleDateOfBirthChange = (e) => {
    const value = e.target.value;

    setDateOfBirth(value);
    setCalculatedAge(calculateAge(value));
  };

  /*
   * ==========================================================
   * AUTHENTICATION HANDLER
   * ==========================================================
   *
   * IMPORTANT:
   * The original login flow remains OAuth2 compatible.
   * Registration now sends the complete Lunara profile.
   */

  const handleAuth = async (e) => {
    e.preventDefault();

    setError(null);

    setLoading(true);

    try {
      let response;

      /*
       * ======================================================
       * REGISTRATION
       * ======================================================
       *
       * FastAPI registration endpoint expects JSON.
       */

      if (isRegistering) {
        if (
          !firstName.trim() ||
          !lastName.trim() ||
          !nickname.trim() ||
          !dateOfBirth
        ) {
          setError(
            "Please complete your name, nickname, and date of birth."
          );
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }

        if (!calculatedAge) {
          setError("Please enter a valid date of birth.");
          setLoading(false);
          return;
        }

        response = await api.post(
          "/api/auth/register",
          {
            username: email,
            email: email,
            password: password,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            nickname: nickname.trim(),
            date_of_birth: dateOfBirth,
            gender: gender || null,
            role: role,
          }
        );

        if (response.data?.user?.account_status === 'pending') {
          setError('Your professional application has been received. An administrator will review it and notify you. You can sign in after approval.');
          setLoading(false);
          setIsRegistering(false);
          setPassword('');
          setConfirmPassword('');
          return;
        }
      }

      /*
       * ======================================================
       * LOGIN
       * ======================================================
       *
       * FastAPI OAuth2 login endpoint expects
       * application/x-www-form-urlencoded data.
       */

      else {
        const formData =
          new URLSearchParams();

        formData.append(
          "username",
          email
        );

        formData.append(
          "password",
          password
        );

        response = await api.post(
          "/api/auth/login",
          formData
        );
      }

      /*
       * ======================================================
       * SAVE TOKEN
       * ======================================================
       */

      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
      }

      /*
       * ======================================================
       * UPDATE APP AUTH STATE
       * ======================================================
       */

      onLoginSuccess(
        response.data.user
      );
    }

    /*
     * ========================================================
     * ERROR HANDLING
     * ========================================================
     */

    catch (err) {
      if (
        err.response?.data?.detail
      ) {
        const detail =
          err.response.data.detail;

        /*
         * FastAPI validation error.
         */

        if (Array.isArray(detail)) {
          setError(
            `Invalid ${
              detail[0].loc[1] ||
              "input"
            }: ${detail[0].msg}`
          );
        }

        /*
         * Standard FastAPI error.
         */

        else {
          setError(detail);
        }
      }

      /*
       * Generic fallback.
       */

      else {
        setError(
          `${
            isRegistering
              ? "Registration"
              : "Login"
          } failed. Please try again.`
        );
      }
    }

    /*
     * ========================================================
     * FINALLY
     * ========================================================
     */

    finally {
      setLoading(false);
    }
  };

  /*
   * ==========================================================
   * SWITCH LOGIN / REGISTER
   * ==========================================================
   */

  const toggleAuthMode = () => {
    setIsRegistering(
      (current) => !current
    );

    setError(null);

    setFirstName("");
    setLastName("");
    setNickname("");
    setDateOfBirth("");
    setGender("");
    setCalculatedAge("");
    setConfirmPassword("");
  };

  /*
   * ==========================================================
   * MAIN CONTAINER
   * ==========================================================
   */

  return (
    <div
      className="lunara-login-wrapper"
      style={{
        width: "100%",

        minHeight: "100vh",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        padding: "100px 20px 50px",

        boxSizing: "border-box",

        position: "relative",

        overflow: "hidden",

        fontFamily:
          'Georgia, "Times New Roman", serif',
      }}
    >
      {/* =====================================================
          AMBIENT GOLD LIGHT
          ===================================================== */}

      <div
        aria-hidden="true"
        style={{
          position: "absolute",

          width: "520px",

          height: "520px",

          top: "-250px",

          left: "50%",

          transform: "translateX(-50%)",

          borderRadius: "50%",

          background:
            "radial-gradient(circle, rgba(240,198,106,.28), transparent 68%)",

          filter: "blur(5px)",

          pointerEvents: "none",

          animation:
            "loginAmbientGlow 7s ease-in-out infinite",
        }}
      />

      {/* =====================================================
          SECOND AMBIENT LIGHT
          ===================================================== */}

      <div
        aria-hidden="true"
        style={{
          position: "absolute",

          width: "360px",

          height: "360px",

          bottom: "-160px",

          left: "-120px",

          borderRadius: "50%",

          background:
            "radial-gradient(circle, rgba(74,40,88,.12), transparent 70%)",

          pointerEvents: "none",

          animation:
            "loginAmbientFloat 9s ease-in-out infinite",
        }}
      />

      {/* =====================================================
          ANCIENT PARTICLES
          ===================================================== */}

      {Array.from({
        length: 16,
      }).map((_, index) => (
        <span
          key={index}
          aria-hidden="true"
          style={{
            position: "absolute",

            left: `${
              4 + ((index * 19) % 92)
            }%`,

            top: `${
              5 + ((index * 31) % 90)
            }%`,

            width:
              index % 3 === 0
                ? "5px"
                : "3px",

            height:
              index % 3 === 0
                ? "5px"
                : "3px",

            borderRadius: "50%",

            background:
              index % 4 === 0
                ? "#69426f"
                : "#e5bd5b",

            boxShadow:
              index % 4 === 0
                ? "0 0 12px rgba(74,40,88,.45)"
                : "0 0 12px rgba(229,189,91,.65)",

            opacity: 0.45,

            pointerEvents: "none",

            animation:
              `loginParticle ${
                3 + (index % 4)
              }s ease-in-out ${
                index * 0.15
              }s infinite`,
          }}
        />
      ))}

      {/* =====================================================
          MAIN AUTH CARD
          ===================================================== */}

      <div
        className="lunara-login-card"
        style={{
          width: "min(430px, 100%)",

          position: "relative",

          zIndex: 5,

          padding: "2.7rem 2.4rem",

          boxSizing: "border-box",

          border:
            "3px solid #6b3518",

          borderRadius: "14px",

          /*
           * Parchment surface.
           */

          background: `
            radial-gradient(
              circle at 25% 15%,
              rgba(255,225,143,.5),
              transparent 28%
            ),
            radial-gradient(
              circle at 80% 90%,
              rgba(107,53,24,.13),
              transparent 30%
            ),
            linear-gradient(
              145deg,
              #e5b65f 0%,
              #d19a3d 48%,
              #bd7927 100%
            )
          `,

          color: "#29160b",

          boxShadow: `
            0 25px 60px rgba(58,28,13,.48),
            inset 0 0 45px rgba(92,58,33,.18),
            inset 0 1px 0 rgba(255,235,166,.75)
          `,

          overflow: "hidden",

          animation:
            "loginCardReveal .8s cubic-bezier(.2,.8,.2,1) both",
        }}
      >
        {/* ===================================================
            INNER MANUSCRIPT BORDER
            =================================================== */}

        <div
          aria-hidden="true"
          style={{
            position: "absolute",

            inset: "9px",

            border:
              "1px solid rgba(107,53,24,.45)",

            borderRadius: "8px",

            pointerEvents: "none",
          }}
        />

        {/* ===================================================
            GOLD LIGHT SWEEP
            =================================================== */}

        <div
          aria-hidden="true"
          style={{
            position: "absolute",

            top: "-80%",

            left: "-50%",

            width: "35%",

            height: "220%",

            background:
              "linear-gradient(90deg, transparent, rgba(255,235,166,.3), transparent)",

            transform:
              "rotate(25deg)",

            pointerEvents: "none",

            animation:
              "loginGoldSweep 7s ease-in-out infinite",
          }}
        />

        {/* ===================================================
            TOP ORNAMENT
            =================================================== */}

        <div
          style={{
            position: "relative",

            zIndex: 2,

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            gap: "10px",

            marginBottom: "18px",

            color: "#6b3518",

            fontSize: "0.85rem",

            letterSpacing: "0.3em",

            opacity: 0.82,
          }}
        >
          <span>✦</span>

          <span>·</span>

          <span>✧</span>

          <span>·</span>

          <span>✦</span>
        </div>

        {/* ===================================================
            LUNARA SYMBOL
            =================================================== */}

        <div
          style={{
            position: "relative",

            zIndex: 2,

            width: "76px",

            height: "76px",

            margin:
              "0 auto 18px",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            border:
              "2px solid #9a6b20",

            borderRadius: "50%",

            color: "#e5bd5b",

            background:
              "linear-gradient(145deg, #4a2412, #6b3518)",

            fontSize: "2.3rem",

            boxShadow:
              "0 0 22px rgba(229,189,91,.28), 0 10px 22px rgba(58,28,13,.28)",

            animation:
              "loginSymbolPulse 4s ease-in-out infinite",
          }}
        >
          ✧
        </div>

        {/* ===================================================
            HEADING
            =================================================== */}

        <h2
          style={{
            position: "relative",

            zIndex: 2,

            margin:
              "0 0 8px 0",

            color: "#3a1c0d",

            textAlign: "center",

            fontSize:
              "clamp(2rem, 7vw, 2.65rem)",

            lineHeight: 1.1,

            fontWeight: 700,

            letterSpacing: "0.04em",

            textShadow:
              "0 2px 0 rgba(255,224,137,.55)",
          }}
        >
          {isRegistering
            ? "Join Lunara"
            : "Enter Lunara"}
        </h2>

        {/* ===================================================
            SUBTITLE
            =================================================== */}

        <p
          style={{
            position: "relative",

            zIndex: 2,

            margin:
              "0 auto 25px",

            maxWidth: "330px",

            color:
              "rgba(58,28,13,.76)",

            textAlign: "center",

            fontSize: "0.92rem",

            lineHeight: 1.6,

            fontStyle: "italic",
          }}
        >
          {isRegistering
            ? "Begin your journey into the ancient arts."
            : "Return to the path written in the stars."}
        </p>

        {/* ===================================================
            DECORATIVE DIVIDER
            =================================================== */}

        <div
          style={{
            position: "relative",

            zIndex: 2,

            width: "82%",

            height: "1px",

            margin:
              "0 auto 25px",

            background:
              "linear-gradient(90deg, transparent, #9a6b20, transparent)",
          }}
        />

        {/* ===================================================
            FORM
            =================================================== */}

        <form
          onSubmit={handleAuth}
          style={{
            position: "relative",

            zIndex: 2,

            display: "flex",

            flexDirection: "column",

            gap: "15px",
          }}
        >
          {/* =================================================
              ERROR MESSAGE
              ================================================= */}

          {error && (
            <div
              role="alert"
              style={{
                padding: "11px 13px",

                border:
                  "1px solid #7b241c",

                borderRadius: "7px",

                color: "#6e1d16",

                background:
                  "rgba(255,218,177,.42)",

                fontSize: "0.86rem",

                fontWeight: 700,

                lineHeight: 1.5,

                textAlign: "center",

                boxShadow:
                  "inset 0 0 12px rgba(107,53,24,.08)",

                animation:
                  "loginErrorReveal .3s ease both",
              }}
            >
              {error}
            </div>
          )}

          {/* =================================================
              PROFILE IDENTITY FIELDS
              ================================================= */}

          {isRegistering && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "12px",
                  animation:
                    "loginFieldReveal .35s ease both",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    color: "#4a2412",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  <span>First Name</span>

                  <input
                    type="text"
                    placeholder="Your first name"
                    value={firstName}
                    onChange={(e) =>
                      setFirstName(e.target.value)
                    }
                    required
                    autoComplete="given-name"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "13px 12px",
                      border:
                        "2px solid rgba(107,53,24,.65)",
                      borderRadius: "7px",
                      color: "#29160b",
                      background:
                        "rgba(245,213,137,.72)",
                      outline: "none",
                      fontSize: "0.95rem",
                      fontFamily: "Arial, sans-serif",
                    }}
                  />
                </label>

                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    color: "#4a2412",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  <span>Last Name</span>

                  <input
                    type="text"
                    placeholder="Your last name"
                    value={lastName}
                    onChange={(e) =>
                      setLastName(e.target.value)
                    }
                    required
                    autoComplete="family-name"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "13px 12px",
                      border:
                        "2px solid rgba(107,53,24,.65)",
                      borderRadius: "7px",
                      color: "#29160b",
                      background:
                        "rgba(245,213,137,.72)",
                      outline: "none",
                      fontSize: "0.95rem",
                      fontFamily: "Arial, sans-serif",
                    }}
                  />
                </label>
              </div>

              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  color: "#4a2412",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  animation:
                    "loginFieldReveal .4s ease both",
                }}
              >
                <span>Nickname</span>

                <input
                  type="text"
                  placeholder="What should we call you?"
                  value={nickname}
                  onChange={(e) =>
                    setNickname(e.target.value)
                  }
                  required
                  autoComplete="nickname"
                  maxLength={80}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "13px 14px",
                    border:
                      "2px solid rgba(107,53,24,.65)",
                    borderRadius: "7px",
                    color: "#29160b",
                    background:
                      "rgba(245,213,137,.72)",
                    outline: "none",
                    fontSize: "1rem",
                    fontFamily: "Arial, sans-serif",
                    boxShadow:
                      "inset 0 2px 8px rgba(58,28,13,.10)",
                  }}
                />

                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                    textTransform: "none",
                    opacity: 0.72,
                  }}
                >
                  This is the name Lunara will use to greet you.
                </span>
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "12px",
                  animation:
                    "loginFieldReveal .45s ease both",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    color: "#4a2412",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  <span>Date of Birth</span>

                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={handleDateOfBirthChange}
                    required
                    autoComplete="bday"
                    max={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "13px 10px",
                      border:
                        "2px solid rgba(107,53,24,.65)",
                      borderRadius: "7px",
                      color: "#29160b",
                      background:
                        "rgba(245,213,137,.72)",
                      outline: "none",
                      fontSize: "0.9rem",
                      fontFamily: "Arial, sans-serif",
                    }}
                  />
                </label>

                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    color: "#4a2412",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  <span>Age</span>

                  <input
                    type="text"
                    value={
                      calculatedAge
                        ? `${calculatedAge} years`
                        : "Calculated automatically"
                    }
                    readOnly
                    aria-label="Calculated age"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "13px 10px",
                      border:
                        "2px solid rgba(107,53,24,.4)",
                      borderRadius: "7px",
                      color: "#4a2412",
                      background:
                        "rgba(229,189,91,.35)",
                      outline: "none",
                      fontSize: "0.9rem",
                      fontFamily: "Arial, sans-serif",
                      fontWeight: 700,
                    }}
                  />
                </label>
              </div>

              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  color: "#4a2412",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  animation:
                    "loginFieldReveal .5s ease both",
                }}
              >
                <span>Gender</span>

                <select
                  value={gender}
                  onChange={(e) =>
                    setGender(e.target.value)
                  }
                  autoComplete="sex"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "13px 14px",
                    border:
                      "2px solid rgba(107,53,24,.65)",
                    borderRadius: "7px",
                    color: "#29160b",
                    background: "#e8c982",
                    fontSize: "1rem",
                    fontFamily: "Arial, sans-serif",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </>
          )}

          {/* =================================================
              EMAIL
              ================================================= */}

          <label
            style={{
              display: "flex",

              flexDirection: "column",

              gap: "6px",

              color: "#4a2412",

              fontSize: "0.78rem",

              fontWeight: 700,

              letterSpacing: "0.08em",

              textTransform: "uppercase",
            }}
          >
            <span>
              Email Address
            </span>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              required
              autoComplete="email"
              style={{
                width: "100%",

                boxSizing: "border-box",

                padding:
                  "13px 14px",

                border:
                  "2px solid rgba(107,53,24,.65)",

                borderRadius: "7px",

                color: "#29160b",

                background:
                  "rgba(245,213,137,.72)",

                outline: "none",

                fontSize: "1rem",

                fontFamily:
                  "Arial, sans-serif",

                boxShadow:
                  "inset 0 2px 8px rgba(58,28,13,.10)",

                transition:
                  "border-color .22s ease, box-shadow .22s ease, transform .22s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor =
                  "#9a6b20";

                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(200,155,60,.16), 0 0 18px rgba(229,189,91,.2)";

                e.currentTarget.style.transform =
                  "translateY(-1px)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor =
                  "rgba(107,53,24,.65)";

                e.currentTarget.style.boxShadow =
                  "inset 0 2px 8px rgba(58,28,13,.10)";

                e.currentTarget.style.transform =
                  "translateY(0)";
              }}
            />
          </label>

          {/* =================================================
              PASSWORD
              ================================================= */}

          <label
            style={{
              display: "flex",

              flexDirection: "column",

              gap: "6px",

              color: "#4a2412",

              fontSize: "0.78rem",

              fontWeight: 700,

              letterSpacing: "0.08em",

              textTransform: "uppercase",
            }}
          >
            <span>
              Password
            </span>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              required
              autoComplete={
                isRegistering
                  ? "new-password"
                  : "current-password"
              }
              style={{
                width: "100%",

                boxSizing: "border-box",

                padding:
                  "13px 14px",

                border:
                  "2px solid rgba(107,53,24,.65)",

                borderRadius: "7px",

                color: "#29160b",

                background:
                  "rgba(245,213,137,.72)",

                outline: "none",

                fontSize: "1rem",

                fontFamily:
                  "Arial, sans-serif",

                boxShadow:
                  "inset 0 2px 8px rgba(58,28,13,.10)",

                transition:
                  "border-color .22s ease, box-shadow .22s ease, transform .22s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor =
                  "#9a6b20";

                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(200,155,60,.16), 0 0 18px rgba(229,189,91,.2)";

                e.currentTarget.style.transform =
                  "translateY(-1px)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor =
                  "rgba(107,53,24,.65)";

                e.currentTarget.style.boxShadow =
                  "inset 0 2px 8px rgba(58,28,13,.10)";

                e.currentTarget.style.transform =
                  "translateY(0)";
              }}
            />
          </label>

          {/* =================================================
              CONFIRM PASSWORD
              ================================================= */}

          {isRegistering && (
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                color: "#4a2412",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                animation:
                  "loginFieldReveal .3s ease both",
              }}
            >
              <span>Confirm Password</span>

              <input
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
                autoComplete="new-password"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px 14px",
                  border:
                    "2px solid rgba(107,53,24,.65)",
                  borderRadius: "7px",
                  color: "#29160b",
                  background:
                    "rgba(245,213,137,.72)",
                  outline: "none",
                  fontSize: "1rem",
                  fontFamily: "Arial, sans-serif",
                  boxShadow:
                    "inset 0 2px 8px rgba(58,28,13,.10)",
                }}
              />
            </label>
          )}

          {/* =================================================
              ROLE SELECTION
              ================================================= */}

          {isRegistering && (
            <label
              style={{
                display: "flex",

                flexDirection: "column",

                gap: "6px",

                color: "#4a2412",

                fontSize: "0.78rem",

                fontWeight: 700,

                letterSpacing: "0.08em",

                textTransform: "uppercase",

                animation:
                  "loginFieldReveal .35s ease both",
              }}
            >
              <span>
                Choose Your Path
              </span>

              <select
                value={role}
                onChange={(e) =>
                  setRole(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",

                  boxSizing: "border-box",

                  padding:
                    "13px 14px",

                  border:
                    "2px solid rgba(107,53,24,.65)",

                  borderRadius: "7px",

                  color: "#29160b",

                  background:
                    "#e8c982",

                  fontSize: "1rem",

                  fontFamily:
                    "Arial, sans-serif",

                  cursor: "pointer",

                  outline: "none",

                  boxShadow:
                    "inset 0 2px 8px rgba(58,28,13,.10)",

                  transition:
                    "border-color .22s ease, box-shadow .22s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor =
                    "#9a6b20";

                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(200,155,60,.16)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(107,53,24,.65)";

                  e.currentTarget.style.boxShadow =
                    "inset 0 2px 8px rgba(58,28,13,.10)";
                }}
              >
                <option value="User">
                  Seeker (Standard User)
                </option>

                <option value="Tarot Reader">
                  Tarot Reader
                </option>

                <option value="Spiritual Consultant">
                  Spiritual Consultant
                </option>

                <option value="Palm Analyst">
                  Palm Analyst
                </option>

              </select>
              <span style={{ color: '#76563b', fontSize: '0.75rem', fontWeight: 400, letterSpacing: 0, textTransform: 'none' }}>Professional roles require administrator approval before their workspaces become available.</span>
            </label>
          )}

          {/* =================================================
              SUBMIT BUTTON
              ================================================= */}

          <button
            type="submit"
            disabled={loading}
            style={{
              position: "relative",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              gap: "9px",

              overflow: "hidden",

              marginTop: "9px",

              padding:
                "13px 18px",

              minHeight: "50px",

              color: "#f7df9b",

              background:
                "linear-gradient(135deg, #4a2412, #6b3518)",

              border:
                "2px solid #9a6b20",

              borderRadius: "7px",

              cursor: loading
                ? "wait"
                : "pointer",

              fontFamily:
                'Georgia, "Times New Roman", serif',

              fontWeight: 700,

              fontSize: "1rem",

              letterSpacing: "0.1em",

              textTransform: "uppercase",

              opacity: loading
                ? 0.72
                : 1,

              boxShadow:
                "0 7px 18px rgba(58,28,13,.32)",

              transition:
                "transform .22s ease, box-shadow .22s ease, border-color .22s ease",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform =
                  "translateY(-3px)";

                e.currentTarget.style.boxShadow =
                  "0 12px 27px rgba(58,28,13,.42), 0 0 18px rgba(229,189,91,.25)";

                e.currentTarget.style.borderColor =
                  "#e5bd5b";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "translateY(0)";

              e.currentTarget.style.boxShadow =
                "0 7px 18px rgba(58,28,13,.32)";

              e.currentTarget.style.borderColor =
                "#9a6b20";
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: "15px",

                    height: "15px",

                    border:
                      "2px solid rgba(247,223,155,.35)",

                    borderTopColor:
                      "#f7df9b",

                    borderRadius: "50%",

                    animation:
                      "loginSpinner .8s linear infinite",
                  }}
                />

                Channeling...
              </>
            ) : (
              <>
                <span>
                  {isRegistering
                    ? "✦"
                    : "◇"}
                </span>

                {isRegistering
                  ? "Sign Up"
                  : "Unlock Fate"}

                <span
                  style={{
                    color: "#e5bd5b",
                  }}
                >
                  →
                </span>
              </>
            )}

            {/* Button light sweep */}

            {!loading && (
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",

                  top: 0,

                  bottom: 0,

                  left: "-70%",

                  width: "45%",

                  transform:
                    "skewX(-20deg)",

                  background:
                    "linear-gradient(90deg, transparent, rgba(255,235,166,.3), transparent)",

                  animation:
                    "loginButtonSweep 4s ease-in-out infinite",
                }}
              />
            )}
          </button>
        </form>

        {/* ===================================================
            MODE SWITCH
            =================================================== */}

        <p
          style={{
            position: "relative",

            zIndex: 2,

            margin:
              "24px 0 0",

            textAlign: "center",

            color:
              "rgba(58,28,13,.78)",

            fontSize: "0.98rem",

            lineHeight: 1.6,
          }}
        >
          {isRegistering
            ? "Already bound by fate? "
            : "Seeking your destiny? "}

          <span
            role="button"
            tabIndex={0}
            onClick={toggleAuthMode}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" ||
                e.key === " "
              ) {
                toggleAuthMode();
              }
            }}
            style={{
              color: "#4a2858",

              cursor: "pointer",

              textDecoration:
                "underline",

              textUnderlineOffset: "3px",

              fontWeight: 700,

              transition:
                "color .2s ease, text-shadow .2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color =
                "#6b3518";

              e.currentTarget.style.textShadow =
                "0 0 10px rgba(229,189,91,.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color =
                "#4a2858";

              e.currentTarget.style.textShadow =
                "none";
            }}
          >
            {isRegistering
              ? "Sign In"
              : "Sign Up"}
          </span>
        </p>

        {/* ===================================================
            BOTTOM ORNAMENT
            =================================================== */}

        <div
          style={{
            position: "relative",

            zIndex: 2,

            marginTop: "23px",

            color: "#6b3518",

            textAlign: "center",

            fontSize: "0.72rem",

            letterSpacing: "0.3em",

            opacity: 0.72,
          }}
        >
          ✦ · ✧ · ✦
        </div>
      </div>

      {/* =====================================================
          ANIMATION SYSTEM
          ===================================================== */}

      <style>
        {`
          @keyframes loginCardReveal {
            from {
              opacity: 0;
              transform: translateY(28px) scale(.96);
              filter: blur(5px);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
              filter: blur(0);
            }
          }

          @keyframes loginAmbientGlow {
            0%, 100% {
              transform: translateX(-50%) scale(1);
              opacity: .65;
            }

            50% {
              transform: translateX(-50%) scale(1.12);
              opacity: 1;
            }
          }

          @keyframes loginAmbientFloat {
            0%, 100% {
              transform: translate(0, 0);
            }

            50% {
              transform: translate(35px, -25px);
            }
          }

          @keyframes loginParticle {
            0%, 100% {
              transform: translateY(0);
              opacity: .25;
            }

            50% {
              transform: translateY(-18px);
              opacity: .85;
            }
          }

          @keyframes loginSymbolPulse {
            0%, 100% {
              transform: scale(1);
              box-shadow:
                0 0 18px rgba(229,189,91,.22),
                0 10px 22px rgba(58,28,13,.28);
            }

            50% {
              transform: scale(1.06);
              box-shadow:
                0 0 30px rgba(229,189,91,.42),
                0 12px 25px rgba(58,28,13,.32);
            }
          }

          @keyframes loginGoldSweep {
            0%, 60% {
              left: -55%;
              opacity: 0;
            }

            68% {
              opacity: .75;
            }

            92%, 100% {
              left: 150%;
              opacity: 0;
            }
          }

          @keyframes loginButtonSweep {
            0%, 55% {
              left: -70%;
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

          @keyframes loginSpinner {
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes loginErrorReveal {
            from {
              opacity: 0;
              transform: translateY(-5px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes loginFieldReveal {
            from {
              opacity: 0;
              transform: translateY(-7px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (max-width: 520px) {
            .lunara-login-card form > div[style*="grid-template-columns"] {
              grid-template-columns: 1fr !important;
            }

              padding:
                90px 14px 35px !important;
            }

            .lunara-login-card {
              padding:
                2.2rem 1.35rem !important;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .lunara-login-wrapper *,
            .lunara-login-wrapper {
              animation: none !important;
              transition: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}
