import { useState, useEffect } from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import api from "./api";

import Login from "./components/Login";
import PalmUploader from "./components/PalmUploader";
import Profile from "./components/Profile";
import TarotReader from "./components/TarotReader";
import Navbar from "./components/Navbar";
import TarotDeckWorkspace from "./components/TarotDeckWorkspace";

import {
  UserDashboard,
  TarotReaderDashboard,
  PalmAnalystDashboard,
  SpiritualConsultantDashboard,
  ConsultantConsultationsWorkspace,
  AdminDashboard,
  TarotWorkspace,
  PalmAnalystWorkspace,
  GuidanceDashboard,
} from "./pages/Dashboards";

/*
 * ============================================================
 * LUNARA APPLICATION
 * ============================================================
 *
 * Theme:
 * Ancient mystical scroll / parchment
 *
 * Interaction:
 * Futuristic animations, smooth transitions and magical effects
 *
 * Existing functionality:
 * - JWT authentication
 * - Token validation
 * - Login state
 * - Logout
 * - Role based dashboards
 * - Profile
 * - Profile editing and account lifecycle
 * - Palm reader
 * - Tarot reader
 * - Protected application experience
 *
 * ============================================================
 */



/*
 * ============================================================
 * ROLE NORMALIZATION
 * ============================================================
 *
 * Backend role values have appeared in several forms during the
 * application's evolution, for example:
 *
 *   tarot
 *   tarot reader
 *   Tarot Reader
 *   tarot_reader
 *
 * The UI must treat all of these as the same professional role.
 */
const normalizeRole = (role) => {
  return String(role ?? '')
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ');
};

const getRoleKey = (role) => {
  const normalized = normalizeRole(role);

  if (normalized === 'tarot' || normalized === 'tarot reader' || normalized === 'tarotreader') {
    return 'tarot';
  }

  if (normalized === 'palm' || normalized === 'palm analyst' || normalized === 'palmanalyst') {
    return 'palm';
  }

  if (normalized === 'consultant' || normalized === 'spiritual consultant' || normalized === 'spiritualconsultant') {
    return 'consultant';
  }

  if (normalized === 'admin' || normalized === 'administrator') {
    return 'admin';
  }

  return 'user';
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
   * ==========================================================
   * CHECK AUTHENTICATION ON APPLICATION LOAD
   * ==========================================================
   *
   * The existing backend authentication behaviour is preserved.
   * If a token exists, the backend is asked to validate it and
   * return the current user's information.
   */

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          /*
           * Validate token and fetch user email / role
           * from the backend.
           */
          const response = await api.get("/api/auth/me");

          setUser(response.data);
        } catch (error) {
          console.error(
            "Token expired or invalid:",
            error
          );

          localStorage.removeItem("token");
          setUser(null);
        }
      }

      setLoading(false);
    };

    fetchUser();
  }, []);

  /*
   * ==========================================================
   * LOGOUT
   * ==========================================================
   */

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  /*
   * ==========================================================
   * PROFILE STATE SYNCHRONIZATION
   * ==========================================================
   *
   * Profile.jsx can update identity information such as nickname,
   * name, gender, date of birth, and profile picture. The application
   * shell owns the authenticated user state, so successful profile
   * changes must flow back here immediately instead of requiring a
   * page refresh.
   */

  const handleProfileUpdated = (updatedUser) => {
    if (!updatedUser) {
      return;
    }

    setUser((currentUser) => ({
      ...(currentUser || {}),
      ...updatedUser,
    }));
  };

  if (!loading && user && ['pending', 'rejected', 'suspended'].includes(user.account_status)) {
    const stateCopy = {
      pending: ['Application under review', 'Your professional workspace will open after an administrator reviews your application. We will also send an in-app notification when there is an update.'],
      rejected: ['Application not approved', user.approval_note || 'Please contact platform support if you need clarification.'],
      suspended: ['Account temporarily suspended', user.approval_note || 'Please contact platform support for help.'],
    }[user.account_status];
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, color: '#29160b', fontFamily: 'Georgia, serif', background: 'linear-gradient(135deg,#6b3518,#dca94e,#542711)' }}><section style={{ width: 'min(620px,100%)', padding: '42px', textAlign: 'center', border: '2px solid #6b3518', borderRadius: 14, background: 'linear-gradient(145deg,rgba(244,232,193,.98),rgba(232,213,181,.96))', boxShadow: '0 20px 50px rgba(58,28,13,.4)' }}><div style={{ fontSize: '2.6rem', color: '#8b571d' }}>✦</div><p style={{ letterSpacing: '.16em', fontWeight: 700, color: '#76563b' }}>LUNARA • PROFESSIONAL REVIEW</p><h1 style={{ fontSize: '2rem' }}>{stateCopy[0]}</h1><p style={{ lineHeight: 1.7 }}>{stateCopy[1]}</p><button type="button" onClick={handleLogout} style={{ marginTop: 16, padding: '11px 22px', border: '1px solid #6b3518', borderRadius: 6, background: '#6b3518', color: '#fff1c4', font: 'inherit', cursor: 'pointer' }}>Sign out</button></section></div>;
  }

  /*
   * ==========================================================
   * ANCIENT SCROLL GLOBAL THEME
   * ==========================================================
   *
   * The colours are based on the parchment reference:
   *
   * - Golden ochre
   * - Aged paper
   * - Burnt brown
   * - Walnut
   * - Antique gold
   * - Very subtle mystical purple
   */

  const globalThemeStyle = {
    minHeight: "100vh",

    width: "100%",

    position: "relative",

    display: "flex",

    flexDirection: "column",

    alignItems: "center",

    color: "#29160b",

    fontFamily:
      'Georgia, "Times New Roman", serif',

    backgroundImage: `
      radial-gradient(
        ellipse at 50% 0%,
        rgba(246, 211, 126, 0.65) 0%,
        rgba(224, 173, 82, 0.45) 28%,
        transparent 55%
      ),
      radial-gradient(
        circle at 15% 80%,
        rgba(74, 40, 88, 0.10),
        transparent 25%
      ),
      linear-gradient(
        135deg,
        #6b3518 0%,
        #9c5d20 20%,
        #c98a32 45%,
        #dca94e 58%,
        #a86622 80%,
        #542711 100%
      )
    `,

    overflowX: "hidden",
  };

  /*
   * ==========================================================
   * LOADING SCREEN
   * ==========================================================
   */

  if (loading) {
    return (
      <div
        style={{
          ...globalThemeStyle,

          minHeight: "100vh",

          justifyContent: "center",

          textAlign: "center",

          position: "relative",

          overflow: "hidden",
        }}
      >
        {/* Decorative animated circle */}
        <div
          style={{
            position: "absolute",

            width: "280px",

            height: "280px",

            borderRadius: "50%",

            border:
              "1px solid rgba(229, 189, 91, 0.35)",

            animation:
              "lunaraLoadingOrbit 8s linear infinite",

            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",

            zIndex: 2,

            padding: "35px 45px",

            border:
              "2px solid rgba(107, 53, 24, 0.8)",

            borderRadius: "14px",

            background:
              "linear-gradient(145deg, rgba(232,201,130,.94), rgba(201,138,50,.92))",

            boxShadow:
              "0 20px 50px rgba(58,28,13,.4), 0 0 30px rgba(229,189,91,.25)",
          }}
        >
          <div
            style={{
              fontSize: "3rem",

              color: "#6b3518",

              marginBottom: "15px",

              animation:
                "lunaraLoadingPulse 2s ease-in-out infinite",
            }}
          >
            ✦
          </div>

          <div
            style={{
              fontSize: "1.35rem",

              fontWeight: 700,

              letterSpacing: "0.08em",

              color: "#3a1c0d",
            }}
          >
            Loading fate...
          </div>

          <div
            style={{
              width: "160px",

              height: "1px",

              margin: "18px auto 0",

              background:
                "linear-gradient(90deg, transparent, #9a6b20, transparent)",
            }}
          />
        </div>

        <style>
          {`
            @keyframes lunaraLoadingOrbit {
              from {
                transform: rotate(0deg) scale(1);
              }

              50% {
                transform: rotate(180deg) scale(1.08);
              }

              to {
                transform: rotate(360deg) scale(1);
              }
            }

            @keyframes lunaraLoadingPulse {
              0%, 100% {
                opacity: .55;
                transform: scale(1);
              }

              50% {
                opacity: 1;
                transform: scale(1.18);
              }
            }
          `}
        </style>
      </div>
    );
  }

  /*
   * ==========================================================
   * LOGIN EXPERIENCE
   * ==========================================================
   *
   * Login remains outside the authenticated application.
   * Existing Login functionality is untouched.
   */

  if (!user) {
    return (
      <div style={globalThemeStyle}>
        {/* Ancient parchment atmosphere */}
        <div
          style={{
            position: "fixed",

            inset: 0,

            pointerEvents: "none",

            opacity: 0.18,

            backgroundImage:
              "radial-gradient(circle, rgba(58,28,13,.45) 0 1px, transparent 1.5px)",

            backgroundSize: "43px 47px",

            mixBlendMode: "multiply",
          }}
        />

        <div
          style={{
            position: "relative",

            zIndex: 2,

            width: "100%",

            minHeight: "100vh",

            display: "flex",

            justifyContent: "center",

            alignItems: "center",
          }}
        >
          <Login
            onLoginSuccess={(userData) =>
              setUser(userData)
            }
          />
        </div>
      </div>
    );
  }

  /*
   * ==========================================================
   * ROLE BASED DASHBOARD
   * ==========================================================
   *
   * Existing role mapping is preserved exactly.
   */

  const renderDashboard = () => {
    switch (getRoleKey(user.role)) {
      case "tarot":
        return <TarotReaderDashboard />;

      case "palm":
        return <PalmAnalystDashboard />;

      case "consultant":
        return <SpiritualConsultantDashboard />;

      case "admin":
        return <AdminDashboard />;

      case "user":
      default:
        return <UserDashboard />;
    }
  };

  /*
   * ==========================================================
   * ROLE-SAFE READING ROUTES
   * ==========================================================
   *
   * A critical distinction exists between a SEEKER and a TAROT
   * READER:
   *
   * SEEKER
   *   -> performs a tarot reading
   *   -> selects cards
   *   -> requests AI interpretation
   *
   * TAROT READER
   *   -> does NOT perform the seeker's tarot reading
   *   -> receives readings generated by seekers / the platform
   *   -> reviews the interpretation
   *   -> supplies professional feedback and corrections
   *
   * Therefore /tarot-reader must never expose the card-picking
   * interface to a Tarot Reader. Their professional destination
   * is the Tarot Reader Dashboard / Review Workspace.
   */

  /*
   * ==========================================================
   * SPIRITUAL CONSULTANT CONSULTATIONS ROUTE
   * ==========================================================
   * The consultant's dashboard and consultation workflow are
   * separate destinations. This route is available only to the
   * Spiritual Consultant role; other roles return to /dashboard.
   */
  const renderConsultationsRoute = () => {
    const roleKey = getRoleKey(user.role);

    if (roleKey === "consultant") {
      return <ConsultantConsultationsWorkspace />;
    }

    return <Navigate to="/dashboard" replace />;
  };

  const renderTarotRoute = () => {
    if (getRoleKey(user.role) === 'tarot') {
      return <Navigate to="/dashboard" replace />;
    }

    return <TarotReader />;
  };

  /*
   * Palm Analyst follows the same professional separation: the
   * seeker uses the palm-reading tool, while the Palm Analyst
   * works from the professional review dashboard.
   */
  const renderPalmRoute = () => {
    if (getRoleKey(user.role) === 'palm') {
      return <Navigate to="/dashboard" replace />;
    }

    return <PalmUploader />;
  };

  /*
   * ==========================================================
   * TAROT READER PROFESSIONAL WORKSPACE
   * ==========================================================
   *
   * The Tarot Reader Dashboard and Tarot Review Workspace are now
   * intentionally separate destinations.
   *
   * /dashboard
   *   -> TarotReaderDashboard
   *   -> overview, metrics, role information and entry point
   *
   * /tarot-workspace
   *   -> TarotWorkspace
   *   -> complete professional review queue
   *   -> seeker reading selection
   *   -> AI interpretation review
   *   -> rating / suggestions / corrections
   *   -> feedback submission
   *
   * This separation prevents the dashboard from becoming one large
   * page containing both overview information and the complete
   * review workflow.
   *
   * A Tarot Reader is allowed to enter this route.
   * Every other role is redirected to its own dashboard. This is
   * deliberately handled here rather than relying only on the
   * navigation menu, because users can manually type a URL.
   */
  /*
   * ==========================================================
   * PROFESSIONAL TAROT DECK ROUTE
   * ==========================================================
   *
   * /tarot-deck is the manual full-deck environment for the Tarot Reader.
   * It is deliberately separate from /tarot-reader, which remains the
   * seeker-facing tarot reading tool, and from /tarot-workspace, which is
   * the human-in-the-loop review chamber.
   *
   * The route is role protected here so typing the URL manually cannot make
   * a seeker enter the professional deck surface. The UserDashboard and its
   * route remain untouched.
   */
  const renderTarotDeckRoute = () => {
    const roleKey = getRoleKey(user.role);

    if (roleKey === "tarot") {
      return <TarotDeckWorkspace />;
    }

    return <Navigate to="/dashboard" replace />;
  };

  const renderTarotWorkspaceRoute = () => {
    const roleKey = getRoleKey(user.role);

    if (roleKey === "tarot") {
      return <TarotWorkspace />;
    }

    return <Navigate to="/dashboard" replace />;
  };

  /*
   * ==========================================================
   * PALM ANALYST PROFESSIONAL WORKSPACE
   * ==========================================================
   *
   * Palm Analysts are professional reviewers of AI-generated palm
   * analyses. They must never enter the seeker-facing PalmUploader.
   *
   * /palm-workspace
   *   -> PalmAnalystWorkspace
   *   -> pending AI palm analyses
   *   -> original palm evidence
   *   -> AI-detected features and interpretation
   *   -> human accuracy rating
   *   -> corrections and professional feedback
   *
   * The route is protected here as well as in the navigation so a
   * Palm Analyst can safely open the workspace directly by URL.
   */
  const renderPalmWorkspaceRoute = () => {
    const roleKey = getRoleKey(user.role);

    if (roleKey === "palm") {
      return <PalmAnalystWorkspace />;
    }

    return <Navigate to="/dashboard" replace />;
  };

  /*
   * ==========================================================
   * PROFESSIONAL ROUTE SAFETY NOTES
   * ==========================================================
   *
   * The application has two broad categories of authenticated
   * experiences:
   *
   * 1. Seeker experiences
   *    - Palm Reader
   *    - Tarot Reader
   *
   * 2. Professional experiences
   *    - Tarot Reader Dashboard
   *    - Tarot Review Workspace
   *    - Palm Analyst Dashboard
   *    - Spiritual Consultant Dashboard
   *    - Administrator Dashboard
   *
   * Route protection is intentionally kept close to the route
   * renderer so the UI and URL behaviour stay synchronized.
   *
   * Important:
   * - Hiding a navigation item is not security.
   * - Redirecting an unauthorized role is a UX safeguard.
   * - Backend authorization must still protect sensitive API
   *   endpoints independently.
   *
   * This file therefore preserves the existing JWT validation and
   * adds explicit frontend route separation without replacing the
   * backend authentication model.
   */

  /*
   * ==========================================================
   * TAROT WORKSPACE NAVIGATION CONTRACT
   * ==========================================================
   *
   * Navbar.jsx may expose the professional Tarot Workspace as:
   *
   *     /tarot-workspace
   *
   * This App.jsx route is the corresponding destination.
   *
   * Keeping the path in one place avoids a common situation where
   * a navigation button exists but React Router sends the user to
   * the wildcard dashboard route.
   *
   * The wildcard route remains useful for genuinely unknown URLs,
   * but known application destinations are declared explicitly
   * before it.
   */

  /*
   * ==========================================================
   * ROLE DASHBOARD NAVIGATION CONTRACT
   * ==========================================================
   *
   * The dashboard route is intentionally dynamic:
   *
   *     User                 -> UserDashboard
   *     Tarot Reader         -> TarotReaderDashboard
   *     Palm Analyst         -> PalmAnalystDashboard
   *     Spiritual Consultant -> SpiritualConsultantDashboard
   *     Administrator       -> AdminDashboard
   *
   * This means the application does not render the seeker dashboard
   * merely because the browser visited /dashboard.
   *
   * getRoleKey() normalizes backend variations before this switch.
   * That keeps role routing resilient to values such as "tarot",
   * "Tarot Reader", "tarot_reader", and similar forms.
   */

  /*
   * ==========================================================
   * AUTHENTICATED APPLICATION
   * ==========================================================
   */

  return (
    <Router>
      <div style={globalThemeStyle}>

        {/* ==================================================
            AUTHENTICATED NAVIGATION
            ================================================== */}

        <Navbar
          user={user}
        />

        {/* ==================================================
            DECORATIVE PAPER GRAIN
            ================================================== */}

        <div
          aria-hidden="true"
          style={{
            position: "fixed",

            inset: 0,

            zIndex: 0,

            pointerEvents: "none",

            opacity: 0.13,

            backgroundImage: `
              radial-gradient(
                circle at 20% 30%,
                rgba(41,22,11,.45) 0 1px,
                transparent 1.5px
              ),
              radial-gradient(
                circle at 70% 70%,
                rgba(255,224,137,.45) 0 1px,
                transparent 2px
              )
            `,

            backgroundSize:
              "37px 43px, 59px 67px",

            mixBlendMode: "multiply",
          }}
        />

        {/* ==================================================
            DECORATIVE GOLD AMBIENT LIGHT
            ================================================== */}

        <div
          aria-hidden="true"
          style={{
            position: "fixed",

            width: "420px",

            height: "420px",

            left: "-180px",

            top: "25%",

            borderRadius: "50%",

            background:
              "radial-gradient(circle, rgba(240,198,106,.20), transparent 68%)",

            filter: "blur(8px)",

            pointerEvents: "none",

            zIndex: 0,

            animation:
              "lunaraAmbientFloat 9s ease-in-out infinite",
          }}
        />

        <div
          aria-hidden="true"
          style={{
            position: "fixed",

            width: "360px",

            height: "360px",

            right: "-140px",

            bottom: "10%",

            borderRadius: "50%",

            background:
              "radial-gradient(circle, rgba(74,40,88,.10), transparent 68%)",

            filter: "blur(10px)",

            pointerEvents: "none",

            zIndex: 0,

            animation:
              "lunaraAmbientFloatReverse 11s ease-in-out infinite",
          }}
        />

        {/* ==================================================
            MAIN APPLICATION CONTENT
            ================================================== */}

        <main
          style={{
            position: "relative",

            zIndex: 2,

            width: "100%",

            maxWidth: "1280px",

            minHeight: "100vh",

            padding:
              "100px 24px 35px",

            boxSizing: "border-box",

            margin: "0 auto",
          }}
        >
          <Routes>

            {/* Root */}
            <Route
              path="/"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={renderDashboard()}
            />


            {/* Spiritual Consultant's dedicated consultations page */}
            <Route
              path="/consultations"
              element={renderConsultationsRoute()}
            />

            {/* Profile */}
            <Route
              path="/profile"
              element={
                <Profile
                  user={user}
                  onUserUpdated={handleProfileUpdated}
                  onLogout={handleLogout}
                />
              }
            />

            {/* ==================================================
                Tarot Reader Professional Workspace
                ==================================================
                This is intentionally separate from /dashboard.
                The dashboard provides the overview; this route
                provides the complete review workflow.
            */}
            <Route
              path="/tarot-deck"
              element={renderTarotDeckRoute()}
            />

            <Route
              path="/tarot-workspace"
              element={renderTarotWorkspaceRoute()}
            />

            {/* Palm Reading is a seeker tool. Palm Analysts are
                redirected to their professional review dashboard. */}
            <Route
              path="/palm-reader"
              element={renderPalmRoute()}
            />

            {/* Tarot Reading is a seeker tool. Tarot Reader professionals are
                redirected to their review dashboard by renderTarotRoute(). */}
            <Route
              path="/tarot-reader"
              element={renderTarotRoute()}
            />

            {/* ==================================================
                Palm Analyst Professional Workspace
                ==================================================
                Palm Analysts review AI-generated palm analyses here.
                This route is deliberately separate from /palm-reader,
                which remains the seeker-facing PalmUploader route.
            */}
            <Route
              path="/palm-workspace"
              element={renderPalmWorkspaceRoute()}
            />

            {/* ==================================================
                Seeker Spiritual Guidance
                ==================================================
                Guidance is a dedicated destination, just like Palm
                Reading and Tarot. It is intentionally not rendered
                inside the UserDashboard.
            */}
            <Route
              path="/guidance"
              element={
                getRoleKey(user.role) === "user"
                  ? <GuidanceDashboard />
                  : <Navigate to="/dashboard" replace />
              }
            />

            {/* Unknown routes */}
            <Route
              path="*"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

          </Routes>
        </main>

        {/* ==================================================
            FOOTER ORNAMENT
            ================================================== */}

        <div
          aria-hidden="true"
          style={{
            position: "relative",

            zIndex: 2,

            width: "100%",

            padding:
              "0 20px 24px",

            boxSizing: "border-box",

            textAlign: "center",

            color:
              "rgba(58,28,13,.65)",

            fontSize: "0.75rem",

            letterSpacing: "0.2em",
          }}
        >
          ✦ · ✧ · ✦
        </div>

        {/* ==================================================
            APPLICATION ANIMATIONS
            ================================================== */}

        <style>
          {`
            @keyframes lunaraAmbientFloat {
              0%, 100% {
                transform: translate(0, 0);
              }

              50% {
                transform: translate(30px, -25px);
              }
            }

            @keyframes lunaraAmbientFloatReverse {
              0%, 100% {
                transform: translate(0, 0);
              }

              50% {
                transform: translate(-25px, 25px);
              }
            }

            @media (max-width: 700px) {
              main {
                padding-left: 14px !important;
                padding-right: 14px !important;
              }
            }

            @media (prefers-reduced-motion: reduce) {
              *,
              *::before,
              *::after {
                animation-duration: .001ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: .001ms !important;
              }
            }
          `}
        </style>

      </div>
    </Router>
  );
}

export default App;

/*
 * ================================================================
 * FINAL ROUTING CONTRACT
 * ================================================================
 *
 * The following route relationships are intentionally preserved:
 *
 *   /                    -> /dashboard
 *   /dashboard           -> role-specific dashboard
 *   /profile             -> Profile
 *   /palm-reader         -> seeker palm-reading experience
 *   /tarot-reader        -> seeker tarot-reading experience
 *   /tarot-workspace     -> Tarot Reader professional review workspace
 *   /palm-workspace      -> Palm Analyst professional review workspace
 *   unknown              -> /dashboard
 *
 * Tarot-specific separation:
 *
 *   Seeker
 *      /tarot-reader
 *          |
 *          +--> selects cards
 *          +--> submits reading
 *          +--> receives AI interpretation
 *
 *   Tarot Reader
 *      /dashboard
 *          |
 *          +--> sees professional dashboard overview
 *          |
 *          +--> /tarot-workspace
 *                  |
 *                  +--> reviews seeker readings
 *                  +--> evaluates AI interpretation
 *                  +--> rates quality
 *                  +--> adds suggestions
 *                  +--> adds corrections
 *                  +--> submits professional feedback
 *
 * This contract is intentionally documented inside the file so a
 * future UI redesign does not accidentally merge the two workflows
 * again.
 */

/*
 * ================================================================
 * AUTHENTICATION CONTRACT
 * ================================================================
 *
 * Authentication continues to be controlled by the existing token:
 *
 *   localStorage.getItem("token")
 *
 * When a token exists:
 *
 *   1. /api/auth/me is requested.
 *   2. The returned user object becomes application state.
 *   3. The user's role determines the dashboard.
 *
 * When the token is invalid:
 *
 *   1. The token is removed.
 *   2. The user is cleared.
 *   3. The login experience is displayed.
 *
 * Logout performs the same local cleanup intentionally.
 *
 * No existing authentication endpoint, token name, or login callback
 * has been changed by the Tarot workspace routing update.
 */

/*
 * ================================================================
 * MAINTENANCE CHECKLIST
 * ================================================================
 *
 * If a new professional workspace is added later:
 *
 *   1. Export its component from Dashboards.jsx.
 *   2. Import it here.
 *   3. Create a dedicated renderer with role validation.
 *   4. Add an explicit Route before the wildcard route.
 *   5. Add the matching navigation destination in Navbar.jsx.
 *   6. Keep the professional workflow separate from its dashboard
 *      overview whenever the workflow is large or stateful.
 *
 * If a new role is added:
 *
 *   1. Add its normalized aliases in getRoleKey().
 *   2. Add its dashboard in renderDashboard().
 *   3. Add route guards for any role-specific workspaces.
 *
 * This keeps role behaviour centralized instead of scattering role
 * checks throughout unrelated components.
 */

/*
 * ================================================================
 * ROLE SEPARATION CONTRACT
 * ================================================================
 *
 * Professional roles never perform seeker readings through the
 * seeker interfaces:
 *
 *   Tarot Reader      -> Tarot review workflow
 *   Palm Analyst      -> Palm professional workflow
 *                       -> reviews AI-generated palm predictions
 *                       -> rates accuracy and submits corrections
 *   Consultant        -> Consultant dashboard/workflow
 *   Administrator    -> Administration dashboard
 *
 * Seeker tools remain:
 *
 *   /palm-reader
 *   /tarot-reader
 *
 * The frontend route guards improve navigation safety, while the
 * backend remains responsible for authoritative authorization.
 */

/*
 * ================================================================
 * UPDATED APP.JSX RESPONSIBILITY SUMMARY
 * ================================================================
 *
 * This file is responsible for:
 *
 *   - application bootstrap
 *   - authentication state
 *   - JWT validation
 *   - logout state
 *   - role normalization
 *   - role dashboard selection
 *   - protected route destinations
 *   - seeker/professional route separation
 *   - global ancient parchment visual shell
 *   - application-level ambient effects
 *
 * Component-specific functionality remains in its original file:
 *
 *   Login.jsx
 *   Navbar.jsx
 *   Profile.jsx
 *   PalmUploader.jsx
 *   TarotReader.jsx
 *   Dashboards.jsx
 *
 * The purpose of this separation is to keep App.jsx as the routing
 * and application-shell layer rather than moving business logic
 * into the router.
 */

/* End of Lunara App routing contract. */



/*
 * ======================================================================
 * PROFESSIONAL TAROT DECK ROUTING CONTRACT
 * ======================================================================
 *
 * This routing addition intentionally introduces one new professional
 * destination without changing the existing seeker dashboard flow.
 *
 * ROUTE MAP
 * ------------------------------------------------------------
 * /dashboard
 *   -> role-specific dashboard
 *   -> Tarot Reader receives TarotReaderDashboard
 *
 * /tarot-deck
 *   -> Tarot Reader only
 *   -> TarotDeckWorkspace
 *   -> complete visible tarot deck
 *   -> exact manual card selection
 *   -> animated card-back-to-face reveal
 *   -> backend-provided card meaning
 *
 * /tarot-reader
 *   -> seeker-facing tarot reading experience
 *   -> remains protected from Tarot Reader role access
 *
 * /tarot-workspace
 *   -> Tarot Reader professional review queue
 *   -> remains separate from the live deck
 *
 * USER DASHBOARD SAFETY
 * ------------------------------------------------------------
 * No UserDashboard component is imported for the new deck route. The
 * existing dashboard switch still maps the user/seeker role to UserDashboard
 * exactly as before. The new route is unreachable for that role because it
 * redirects to /dashboard.
 *
 * AUTHENTICATION SAFETY
 * ------------------------------------------------------------
 * App.jsx continues to rely on the existing authenticated user and role
 * normalization. This frontend redirect is a UX boundary; backend APIs
 * should continue to enforce authorization independently.
 *
 * NAVIGATION SAFETY
 * ------------------------------------------------------------
 * The Tarot Reader dashboard button points to /tarot-deck. Navbar can keep
 * its separate /tarot-workspace entry because the two professional surfaces
 * have different purposes.
 *
 * ======================================================================
 */


/*
 * ======================================================================
 * PROFILE / AUTH STATE CONTRACT
 * ======================================================================
 *
 * The authenticated user object is intentionally owned by App.jsx.
 * Profile.jsx receives the current user as input and reports successful
 * edits through onUserUpdated(). This keeps the Navbar and every
 * role-aware destination synchronized with the latest profile data.
 *
 * Profile lifecycle:
 *
 *   App
 *    |
 *    +--> Profile
 *          |
 *          +--> GET /api/auth/me
 *          +--> PUT /api/auth/profile
 *          +--> DELETE /api/auth/account
 *          |
 *          +--> onUserUpdated(updatedUser)
 *          +--> onLogout()
 *
 * The delete-account operation is deliberately different from logout.
 * Logout only clears the local authentication token. Account deletion
 * is handled by the backend and must complete the database deletion
 * before the frontend clears its authenticated application state.
 *
 * The profile picture is part of the profile state returned by the
 * authentication API. Keeping it in App state means the updated avatar
 * can be displayed by Navbar immediately after a successful profile
 * save without a browser reload.
 *
 * ======================================================================
 */


/*
 * ================================================================
 * SPIRITUAL CONSULTANT PAGE SEPARATION
 * ================================================================
 *
 * /dashboard
 *   -> SpiritualConsultantDashboard with view="dashboard"
 *   -> consultant overview and practice metrics
 *
 * /consultations
 *   -> SpiritualConsultantDashboard with view="consultations"
 *   -> consultation queue, session workspace, notes, chat and history
 *
 * The /consultations route is role-protected in the route renderer.
 * The Navbar destination and App route now agree on the same path.
 * Other roles are redirected to their own dashboard, and the existing
 * seeker, Tarot Reader, Palm Analyst and administrator route behaviour
 * remains unchanged.
 * ================================================================
 */
