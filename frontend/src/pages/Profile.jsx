import { useCallback, useEffect, useMemo, useState } from "react";
import {
  UserRound, Save, RefreshCw, ShieldCheck, Sparkles, BookOpen,
  Clock3, BriefcaseBusiness, HeartHandshake, Languages,
} from "lucide-react";
import api from "../api/client";

const EMPTY_FORM = {
  full_name: "",
  age_group: "",
  interests: "",
  spiritual_goals: "",
  reading_preferences: "",
  bio: "",
  department: "",
  administrative_responsibilities: "",
  reporting_preferences: "",
  experience_years: "",
  specialties: "",
  supported_spreads: "",
  professional_biography: "",
  reading_approach: "",
  languages: "",
  session_duration: "",
  availability: "",
  consultation_preferences: "",
};

const ROLE_COPY = {
  user: {
    title: "My profile",
    subtitle: "Personalize your space, reading preferences, and spiritual goals.",
    eyebrow: "YOUR DETAILS",
    sectionTitle: "Personal information",
    sectionDescription: "Tell us a little about yourself. Share only what you are comfortable providing.",
    fields: [
      { name: "age_group", label: "Age group", type: "select", options: ["Prefer not to say", "Under 18", "18–24", "25–34", "35–44", "45–54", "55+"] },
      { name: "interests", label: "Interests", placeholder: "e.g. self-reflection, symbolism, meditation", type: "textarea" },
      { name: "spiritual_goals", label: "Spiritual goals", placeholder: "What would you like to explore or understand?", type: "textarea" },
      { name: "reading_preferences", label: "Reading preferences", placeholder: "Topics or reading styles you prefer", type: "textarea" },
      { name: "bio", label: "About me (optional)", placeholder: "A short introduction", type: "textarea" },
    ],
  },
  admin: {
    title: "Administrator profile",
    subtitle: "Maintain your professional identity and operational responsibilities.",
    eyebrow: "ADMINISTRATOR DETAILS",
    sectionTitle: "Administrator information",
    sectionDescription: "These details help clarify your responsibilities and the reports you need.",
    fields: [
      { name: "full_name", label: "Full name", placeholder: "Enter your full name", type: "input", required: true },
      { name: "department", label: "Department or area of responsibility", placeholder: "e.g. Platform Operations, User Support, Governance", type: "input" },
      { name: "administrative_responsibilities", label: "Administrative responsibilities", placeholder: "Describe account administration, user management, moderation, or operational duties", type: "textarea" },
      { name: "reporting_preferences", label: "Reporting preferences", placeholder: "Which user, reading, platform, or operational reports do you need?", type: "textarea" },
    ],
  },
  tarot_reader: {
    title: "Tarot Reader profile",
    subtitle: "Present your professional Tarot practice, expertise, and session availability.",
    eyebrow: "READER DETAILS",
    sectionTitle: "Professional reader information",
    sectionDescription: "Help clients understand your experience, reading style, and the sessions you offer.",
    fields: [
      { name: "full_name", label: "Full name", placeholder: "Enter your professional name", type: "input", required: true },
      { name: "experience_years", label: "Tarot experience (years)", placeholder: "e.g. 5", type: "number", min: 0, max: 80 },
      { name: "specialties", label: "Tarot specialties", placeholder: "e.g. relationships, career, personal growth, life direction", type: "textarea" },
      { name: "supported_spreads", label: "Supported Tarot spreads", placeholder: "e.g. Single Card, Three Card, Relationship, Career, Celtic Cross, Life Path", type: "textarea" },
      { name: "professional_biography", label: "Professional biography", placeholder: "Describe your background and experience as a Tarot reader", type: "textarea" },
      { name: "reading_approach", label: "Reading approach", placeholder: "Explain how you interpret cards and guide reflection", type: "textarea" },
      { name: "languages", label: "Languages", placeholder: "e.g. English, Kannada, Hindi", type: "input" },
      { name: "session_duration", label: "Session duration", placeholder: "e.g. 30 or 45 minutes", type: "input" },
      { name: "availability", label: "Availability", placeholder: "e.g. weekdays 6–9 PM, weekends by appointment", type: "textarea" },
      { name: "consultation_preferences", label: "Consultation preferences", placeholder: "e.g. online sessions, preferred topics, preparation requirements", type: "textarea" },
    ],
  },
  consultant: {
    title: "Spiritual Consultant profile",
    subtitle: "Present your guidance expertise, professional approach, and consultation availability.",
    eyebrow: "CONSULTANT DETAILS",
    sectionTitle: "Professional consultation information",
    sectionDescription: "Help clients understand your experience, specialties, and how you support practical reflection.",
    fields: [
      { name: "full_name", label: "Full name", placeholder: "Enter your professional name", type: "input", required: true },
      { name: "experience_years", label: "Relevant experience (years)", placeholder: "e.g. 4", type: "number", min: 0, max: 80 },
      { name: "specialties", label: "Guidance specialties", placeholder: "e.g. career, relationships, personal growth, life direction", type: "textarea" },
      { name: "professional_biography", label: "Professional biography", placeholder: "Describe your relevant background and experience", type: "textarea" },
      { name: "reading_approach", label: "Consultation approach", placeholder: "Explain how you help clients reflect, identify options, and set practical goals", type: "textarea" },
      { name: "languages", label: "Languages", placeholder: "e.g. English, Kannada, Hindi", type: "input" },
      { name: "session_duration", label: "Session duration", placeholder: "e.g. 30 or 60 minutes", type: "input" },
      { name: "availability", label: "Availability", placeholder: "e.g. weekdays 6–9 PM, weekends by appointment", type: "textarea" },
      { name: "consultation_preferences", label: "Consultation preferences", placeholder: "e.g. online sessions, preferred topics, preparation requirements", type: "textarea" },
    ],
  },
};

function roleKey(role) {
  const value = String(role || "user").toLowerCase().replace(/[\s-]+/g, "_");
  if (value.includes("admin")) return "admin";
  if (value.includes("tarot")) return "tarot_reader";
  if (value.includes("consultant")) return "consultant";
  return "user";
}

function displayRole(role) {
  return ({
    admin: "Administrator",
    tarot_reader: "Tarot Reader",
    consultant: "Spiritual Consultant",
    user: "User",
  })[roleKey(role)];
}

function IconForRole({ role, size = 20 }) {
  if (role === "admin") return <ShieldCheck size={size} />;
  if (role === "tarot_reader") return <Sparkles size={size} />;
  if (role === "consultant") return <HeartHandshake size={size} />;
  return <BookOpen size={size} />;
}

export default function Profile() {
  const [account, setAccount] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const role = useMemo(() => roleKey(account?.role), [account?.role]);
  const copy = ROLE_COPY[role] || ROLE_COPY.user;

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/profiles/me");
      const data = response?.data || {};
      setAccount(data.user || null);
      setForm({ ...EMPTY_FORM, ...(data.profile || {}), ...(data.professional_data || {}), full_name: data.profile?.full_name || data.professional_data?.full_name || data.user?.full_name || "" });
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not load your profile. Please sign in again and retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const changeField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setNotice("");
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      // Keep the entered values if the API response omits profile fields.
      const submittedForm = { ...form };
      const response = await api.put("/api/profiles/me", submittedForm);
      const data = response?.data || {};
      const updatedAccount = data.user || account;
      const returnedProfile = {
        ...EMPTY_FORM,
        ...submittedForm,
        ...(data.profile || {}),
        ...(data.professional_data || {}),
      };

      // Some API responses return full_name only inside `user`, not `profile`.
      returnedProfile.full_name =
        data.profile?.full_name ||
        data.professional_data?.full_name ||
        updatedAccount?.full_name ||
        submittedForm.full_name ||
        "";

      setAccount(updatedAccount);
      setForm(returnedProfile);
      setNotice("Your profile has been saved successfully.");
    } catch (err) {
      setError(err?.response?.data?.detail || "Your profile could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="role-profile-page">
        <ProfileStyles />
        <div className="role-profile-loading"><RefreshCw size={20} className="role-profile-spin" /> Loading your profile…</div>
      </main>
    );
  }

  return (
    <main className="role-profile-page">
      <ProfileStyles />
      <div className="role-profile-wrap">
        <header className="role-profile-heading">
          <div>
            <span className="role-profile-eyebrow">{copy.eyebrow}</span>
            <h1>{copy.title}</h1>
            <p>{copy.subtitle}</p>
          </div>
          <div className="role-profile-heading-icon"><UserRound size={30} /></div>
        </header>

        {error && <div className="role-profile-alert role-profile-alert-error" role="alert">{error}</div>}
        {notice && <div className="role-profile-alert role-profile-alert-success" role="status">{notice}</div>}

        <div className="role-profile-layout">
          <aside className="role-profile-summary">
            <div className="role-profile-avatar"><UserRound size={34} /></div>
            <h2>{form.full_name || account?.full_name || "Your account"}</h2>
            <p className="role-profile-email">{account?.email || ""}</p>
            <span className="role-profile-role"><ShieldCheck size={14} /> {displayRole(account?.role)}</span>
            <div className="role-profile-divider" />
            <div className="role-profile-account-status">
              <span>Account status</span>
              <strong className={account?.is_active === false ? "is-inactive" : "is-active"}>
                <span /> {account?.is_active === false ? "Inactive" : "Active"}
              </strong>
            </div>
            <p className="role-profile-summary-note">
              {role === "user"
                ? "Your preferences help personalize your reading experience."
                : "Keep your professional details accurate so clients and platform administrators can understand your role."}
            </p>
          </aside>

          <form className="role-profile-form" onSubmit={saveProfile}>
            <section className="role-profile-section">
              <div className="role-profile-section-heading">
                <div className="role-profile-section-icon"><IconForRole role={role} /></div>
                <div>
                  <h2>{copy.sectionTitle}</h2>
                  <p>{copy.sectionDescription}</p>
                </div>
              </div>

              <div className="role-profile-fields">
                {copy.fields.map((field) => (
                  <label className={`role-profile-field ${field.type === "textarea" ? "role-profile-field-wide" : ""}`} key={field.name}>
                    <span>{field.label}</span>
                    {field.type === "select" ? (
                      <select
                        value={form[field.name] || "Prefer not to say"}
                        onChange={(e) => changeField(field.name, e.target.value)}
                      >
                        {field.options.map((option) => <option value={option} key={option}>{option}</option>)}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        value={form[field.name] || ""}
                        onChange={(e) => changeField(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        rows={field.name.includes("biography") || field.name === "bio" ? 4 : 3}
                        maxLength={4000}
                        required={Boolean(field.required)}
                      />
                    ) : (
                      <input
                        type={field.type === "number" ? "number" : "text"}
                        value={form[field.name] ?? ""}
                        onChange={(e) => changeField(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        min={field.min}
                        max={field.max}
                        maxLength={field.type === "number" ? undefined : 500}
                        required={Boolean(field.required)}
                      />
                    )}
                  </label>
                ))}
              </div>
            </section>

            <div className="role-profile-form-footer">
              <p><Clock3 size={15} /> Your profile information is saved to your account.</p>
              <button type="submit" disabled={saving}>
                {saving ? <RefreshCw size={17} className="role-profile-spin" /> : <Save size={17} />}
                {saving ? "Saving…" : "Save profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

function ProfileStyles() {
  return (
    <style>{`
      .role-profile-page{min-height:100vh;background:#f5eddd;color:#563b2b;padding:42px 24px 72px;font-family:inherit}
      .role-profile-wrap{max-width:1160px;margin:0 auto}
      .role-profile-heading{display:flex;align-items:center;justify-content:space-between;gap:24px;margin:0 0 32px}
      .role-profile-eyebrow{font-size:11px;letter-spacing:2.2px;font-weight:800;color:#a46e49}
      .role-profile-heading h1{font-family:Georgia,'Times New Roman',serif;font-size:38px;line-height:1.15;margin:10px 0;color:#422c20;font-weight:600}
      .role-profile-heading p{margin:0;color:#8a6c57;font-size:15px}
      .role-profile-heading-icon,.role-profile-avatar{display:grid;place-items:center;border-radius:50%;background:#ead9c1;color:#79543a;flex-shrink:0}
      .role-profile-heading-icon{width:58px;height:58px}
      .role-profile-layout{display:grid;grid-template-columns:270px minmax(0,1fr);gap:24px;align-items:start}
      .role-profile-summary,.role-profile-form{border:1px solid #ead4bb;border-radius:18px;background:#fffaf2;box-shadow:0 14px 34px rgba(91,60,37,.055);min-width:0}
      .role-profile-summary{padding:28px 24px;text-align:center;position:sticky;top:24px}
      .role-profile-avatar{width:76px;height:76px;margin:0 auto 16px}
      .role-profile-summary h2{font-family:Georgia,'Times New Roman',serif;font-size:22px;margin:0 0 7px;overflow-wrap:anywhere}
      .role-profile-email{font-size:13px;color:#8d7894;overflow-wrap:anywhere;margin:0 0 16px}
      .role-profile-role{display:inline-flex;align-items:center;gap:6px;background:#eddfca;border-radius:30px;padding:8px 12px;font-size:12px;font-weight:750}
      .role-profile-divider{height:1px;background:#eee2d2;margin:24px 0}
      .role-profile-account-status{display:grid;gap:8px;font-size:13px;color:#8b7766}
      .role-profile-account-status strong{display:flex;align-items:center;justify-content:center;gap:7px;color:#426a40;font-size:13px}
      .role-profile-account-status strong>span{width:7px;height:7px;border-radius:50%;background:#66834a}
      .role-profile-account-status .is-inactive{color:#a33d2d}
      .role-profile-account-status .is-inactive>span{background:#b54b3b}
      .role-profile-summary-note{font-size:12px;line-height:1.65;color:#947b66;margin:22px 0 0}
      .role-profile-form{padding:30px}
      .role-profile-section-heading{display:flex;align-items:flex-start;gap:13px;margin-bottom:24px}
      .role-profile-section-icon{width:42px;height:42px;border-radius:12px;background:#f0e0ca;color:#79543a;display:grid;place-items:center;flex-shrink:0}
      .role-profile-section-heading h2{font-family:Georgia,'Times New Roman',serif;font-size:27px;margin:0 0 7px;font-weight:600}
      .role-profile-section-heading p{font-size:13px;color:#8c725e;margin:0;line-height:1.6}
      .role-profile-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}
      .role-profile-field{display:grid;gap:9px;font-size:13px;font-weight:750;color:#68462f;min-width:0}
      .role-profile-field-wide{grid-column:1/-1}
      .role-profile-field input,.role-profile-field select,.role-profile-field textarea{box-sizing:border-box;width:100%;border:1px solid #e4cdb4;background:#fffdfa;border-radius:11px;padding:13px 14px;color:#4d3628;font:500 14px/1.5 inherit;outline:none;transition:border-color .15s,box-shadow .15s}
      .role-profile-field input,.role-profile-field textarea{font-family:inherit}
      .role-profile-field select{font-family:inherit}
      .role-profile-field textarea{resize:vertical;min-height:86px}
      .role-profile-field input:focus,.role-profile-field select:focus,.role-profile-field textarea:focus{border-color:#a97853;box-shadow:0 0 0 3px rgba(169,120,83,.13)}
      .role-profile-field input::placeholder,.role-profile-field textarea::placeholder{color:#9b8b7e;font-weight:400}
      .role-profile-form-footer{display:flex;align-items:center;justify-content:space-between;gap:18px;border-top:1px solid #eee0cf;margin-top:28px;padding-top:22px}
      .role-profile-form-footer p{display:flex;align-items:center;gap:7px;font-size:12px;color:#927761;margin:0}
      .role-profile-form-footer button{border:0;border-radius:11px;background:#65432f;color:white;padding:13px 19px;display:inline-flex;align-items:center;justify-content:center;gap:9px;font:750 14px inherit;cursor:pointer;min-width:150px}
      .role-profile-form-footer button:hover{background:#79553b}
      .role-profile-form-footer button:disabled{opacity:.65;cursor:wait}
      .role-profile-alert{padding:13px 16px;border-radius:11px;margin-bottom:18px;font-size:14px}
      .role-profile-alert-error{background:#fff0ed;color:#a33e2e;border:1px solid #efc2b9}
      .role-profile-alert-success{background:#eef6e9;color:#3f6d3b;border:1px solid #d3e4c8}
      .role-profile-loading{display:flex;align-items:center;justify-content:center;gap:12px;min-height:50vh;color:#79543a}
      .role-profile-spin{animation:roleProfileSpin 1s linear infinite}
      @keyframes roleProfileSpin{to{transform:rotate(360deg)}}
      @media(max-width:760px){.role-profile-page{padding:28px 14px 48px}.role-profile-layout{grid-template-columns:1fr}.role-profile-summary{position:static}.role-profile-form{padding:22px 17px}.role-profile-heading h1{font-size:32px}.role-profile-fields{grid-template-columns:1fr}.role-profile-field-wide{grid-column:auto}.role-profile-form-footer{align-items:stretch;flex-direction:column}.role-profile-form-footer button{width:100%}.role-profile-section-heading h2{font-size:24px}}
    `}</style>
  );
}
