import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserRound,
  Sparkles,
  Compass,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  {
    value: "user",
    label: "User",
    description: "Personal readings, history, insights and guidance.",
    icon: UserRound
  },
  {
    value: "tarot_reader",
    label: "Tarot Reader",
    description: "Tarot sessions, reading analytics and report management.",
    icon: Sparkles
  },
  {
    value: "consultant",
    label: "Spiritual Consultant",
    description: "User trends, consultation insights and guidance.",
    icon: Compass
  },
  {
    value: "admin",
    label: "Administrator",
    description: "User management, platform analytics and system reports.",
    icon: ShieldCheck
  }
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirm: "",
    role: "user"
  });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function change(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (form.fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (!ROLES.some((item) => item.value === form.role)) {
      setError("Please select a valid account role.");
      return;
    }

    setBusy(true);

    try {
      await register(
        form.fullName,
        form.email,
        form.password,
        form.role
      );

      if (form.role === "admin") {
        navigate("/admin");
      } else if (form.role === "tarot_reader") {
        navigate("/tarot-reader");
      } else if (form.role === "consultant") {
        navigate("/consultant");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Could not create your account."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="register-wrap">
      <form
        className="form-card register-card"
        onSubmit={submit}
      >
        <p className="eyebrow">BEGIN YOUR JOURNEY</p>

        <h2>Create your account</h2>

        <p className="muted">
          Choose the role that matches how you want to use the platform.
        </p>

        {error && (
          <div className="alert" role="alert">
            {error}
          </div>
        )}

        <label>
          Full name
          <input
            name="fullName"
            value={form.fullName}
            onChange={change}
            placeholder="Your name"
            minLength="2"
            autoComplete="name"
            required
          />
        </label>

        <label>
          Email address
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={change}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={change}
            minLength="8"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
          />
        </label>

        <label>
          Confirm password
          <input
            name="confirm"
            type="password"
            value={form.confirm}
            onChange={change}
            placeholder="Repeat your password"
            autoComplete="new-password"
            required
          />
        </label>

        <div className="role-section">
          <div className="role-heading">
            <div>
              <strong>Choose account role</strong>
              <span>
                Select the role you want for this account.
              </span>
            </div>
          </div>

          <div className="role-grid">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const selected = form.role === role.value;

              return (
                <label
                  key={role.value}
                  className={`role-option ${
                    selected ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={selected}
                    onChange={change}
                  />

                  <span className="role-icon">
                    <Icon size={19} />
                  </span>

                  <span className="role-copy">
                    <strong>{role.label}</strong>
                    <small>{role.description}</small>
                  </span>

                  {selected && (
                    <CheckCircle2
                      className="role-check"
                      size={18}
                    />
                  )}
                </label>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          className="primary-button"
          disabled={busy}
        >
          {busy ? "Creating account..." : "Create account"}
        </button>

        <p className="form-bottom">
          Already registered?{" "}
          <Link to="/login">Sign in</Link>
        </p>

        <p className="tiny-note">
          Your selected role determines the workspace and dashboard
          available after sign in.
        </p>
      </form>

      <style>{`
        .role-section {
          margin: 20px 0 22px;
        }

        .role-heading {
          margin-bottom: 11px;
        }

        .role-heading strong {
          display: block;
          color: #4b2b1b;
          font-size: 15px;
          margin-bottom: 4px;
        }

        .role-heading span {
          display: block;
          color: #8b6d5b;
          font-size: 12px;
          line-height: 1.5;
        }

        .role-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .role-option {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 13px 12px;
          border: 1px solid #dfcdbb;
          border-radius: 12px;
          background: #fffaf3;
          cursor: pointer;
          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .role-option:hover {
          border-color: #a87552;
          transform: translateY(-1px);
        }

        .role-option.selected {
          border-color: #825638;
          background: #f7ecdf;
          box-shadow: 0 5px 18px rgba(99, 62, 39, 0.1);
        }

        .role-option input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .role-icon {
          width: 34px;
          height: 34px;
          min-width: 34px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #ead9c7;
          color: #714a32;
        }

        .role-option.selected .role-icon {
          background: #825638;
          color: white;
        }

        .role-copy {
          min-width: 0;
          padding-right: 14px;
        }

        .role-copy strong {
          display: block;
          color: #4d2e1e;
          font-size: 13px;
          margin-bottom: 3px;
          line-height: 1.25;
        }

        .role-copy small {
          display: block;
          color: #8a6d5b;
          font-size: 10.5px;
          line-height: 1.4;
        }

        .role-check {
          position: absolute;
          right: 9px;
          top: 9px;
          color: #825638;
        }

        @media (max-width: 620px) {
          .role-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}