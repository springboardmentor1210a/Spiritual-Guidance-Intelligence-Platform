import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const GOOGLE_LOGIN_URL =
  import.meta.env.VITE_GOOGLE_LOGIN_URL ||
  `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/api/auth/google/login`;

function GoogleMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      className="social-provider-icon"
    >
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 38.04 46.98 31.93 46.98 24.55Z" />
      <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.6.28-3.14.77-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.45-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
    </svg>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(() => (
    searchParams.get("google_error")
      ? "Google sign-in could not be completed. Please try again."
      : ""
  ));
  const [busy, setBusy] = useState(false);

  // Remove the OAuth error flag after displaying it, without navigating during render.
  useEffect(() => {
    if (!searchParams.has("google_error")) return;
    const next = new URLSearchParams(searchParams);
    next.delete("google_error");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const user = await login(email.trim(), password);
      if (user?.role === "admin") navigate("/admin", { replace: true });
      else if (user?.role === "tarot_reader") navigate("/tarot-reader", { replace: true });
      else if (user?.role === "consultant") navigate("/consultant", { replace: true });
      else navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        typeof err?.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Unable to sign in. Check your details and ensure the API is running."
      );
    } finally {
      setBusy(false);
    }
  }

  function startGoogleLogin() {
    setError("");
    window.location.assign(GOOGLE_LOGIN_URL);
  }

  return (
    <section className="auth-layout">
      <div className="auth-art">
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <Sparkles size={34} />
        <p className="eyebrow">YOUR PERSONAL INSIGHT SPACE</p>
        <h1>Discover the stories written in symbols.</h1>
        <p>Bring curiosity, reflection and intention to your personal journey.</p>
        <div className="mini-stars">✦　✧　✦　✧　✦</div>
      </div>

      <form className="form-card" onSubmit={submit}>
        <p className="eyebrow">WELCOME BACK</p>
        <h2>Sign in</h2>
        <p className="muted">Continue to your personal dashboard.</p>

        {error && <div className="alert" role="alert">{error}</div>}

        <label>
          Email address
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </label>

        <button className="primary-button" disabled={busy} type="submit">
          {busy ? "Signing in..." : "Sign in"}
        </button>

        <div className="auth-divider" aria-hidden="true">
          <span /><span>OR</span><span />
        </div>

        <div className="social-login-options">
          <button
            type="button"
            className="social-login-button"
            onClick={startGoogleLogin}
          >
            <GoogleMark />
            <span>Continue with Google</span>
          </button>
        </div>

        <p className="form-bottom">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>

      <style>{`
        .social-login-options{display:grid;gap:10px;margin:4px 0 0}
        .social-login-button{display:flex;align-items:center;justify-content:center;gap:11px;width:100%;min-height:46px;padding:10px 16px;border:1px solid #e3d4c2;border-radius:9px;background:#fffdf9;color:#493226;font:inherit;font-size:13px;font-weight:650;cursor:pointer;transition:background .18s ease,border-color .18s ease,transform .18s ease}
        .social-login-button:hover{background:#f8f0e5;border-color:#b9916c;transform:translateY(-1px)}
        .social-login-button:focus-visible{outline:3px solid #c9a37d;outline-offset:2px}
        .social-provider-icon{width:19px;height:19px;flex:0 0 19px}
        .auth-divider{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:12px;margin:18px 0;color:#9a8069;font-size:10px;font-weight:800;letter-spacing:.14em}
        .auth-divider span:first-child,.auth-divider span:last-child{height:1px;background:#e7d9c7}
        @media(prefers-reduced-motion:reduce){.social-login-button{transition:none}.social-login-button:hover{transform:none}}
      `}</style>
    </section>
  );
}
