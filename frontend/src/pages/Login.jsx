import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const roles = [
  ["user", "User", "Personal readings and self-reflection"],
  ["tarot_reader", "Tarot Reader", "Reader workspace access"],
  ["spiritual_consultant", "Spiritual Consultant", "Consultation workflows"],
  ["administrator", "Administrator", "Administrative workspace"],
];

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [role, setRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(form.email, form.password, role);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue your reading journey.">
      <form onSubmit={submit} className="auth-form">
        <label>Email address</label>
        <div className="input-wrap"><Mail size={17} /><input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></div>

        <label>Password</label>
        <div className="input-wrap"><LockKeyhole size={17} /><input required type={showPassword ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Your password" /><button type="button" className="input-action" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>

        <label>Access role</label>
        <div className="role-grid compact">
          {roles.map(([value, title, text]) => (
            <button type="button" key={value} className={`role-option ${role === value ? "selected" : ""}`} onClick={() => setRole(value)}>
              <strong>{title}</strong><span>{text}</span>
            </button>
          ))}
        </div>

        {error && <div className="error-box">{error}</div>}

        <button className="button primary full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
        <p className="auth-foot">New here? <Link to="/register">Create an account</Link></p>
      </form>
    </AuthLayout>
  );
}

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="auth-decoration">
        <div className="auth-symbol"><Sparkles size={31} /></div>
        <h2>Arcana Intelligence</h2>
        <p>Structured readings. Personal context. Meaningful reflection.</p>
      </div>
      <div className="auth-panel">
        <Link to="/" className="mini-brand"><span>✦</span> Arcana</Link>
        <div className="auth-heading"><h1>{title}</h1><p>{subtitle}</p></div>
        {children}
      </div>
    </div>
  );
}