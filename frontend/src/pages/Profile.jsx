import { useEffect, useState } from "react";
import { Save, UserRound } from "lucide-react";
import { createProfile, getProfile, updateProfile } from "../api/profile";

const LOCAL_KEY = "profile_preferences";

export default function Profile() {
  const [profile, setProfile] = useState({ name: "", age_group: "", profile_image: "" });
  const [extras, setExtras] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{"interests":[],"goal":"","readingType":"Tarot","spread":"Three Card","language":"English"}'); } catch { return {}; }
  });
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getProfile()
      .then(data => { setProfile(data); setExists(true); })
      .catch(err => { if (!err.message.includes("Profile not found")) setMessage(err.message); })
      .finally(() => setLoading(false));
  }, []);

  function toggleInterest(item) {
    const current = extras.interests || [];
    setExtras({ ...extras, interests: current.includes(item) ? current.filter(x => x !== item) : [...current, item] });
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true); setMessage("");
    try {
      const data = exists ? await updateProfile(profile) : await createProfile(profile);
      setProfile(data); setExists(true);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(extras));
      setMessage("Profile saved successfully.");
    } catch (err) {
      setMessage(err.message || "Unable to save profile.");
    } finally { setSaving(false); }
  }

  if (loading) return <div className="loading-screen">Loading profile…</div>;

  return (
    <div className="page-container narrow">
      <div className="page-title"><div className="page-title-icon"><UserRound /></div><div><span className="section-kicker">ACCOUNT</span><h1>Your profile</h1><p>Keep your personal reading context organized.</p></div></div>
      <form className="panel form-panel" onSubmit={save}>
        <h2>Basic information</h2>
        <div className="form-grid">
          <Field label="Name" value={profile.name || ""} onChange={v => setProfile({ ...profile, name: v })} placeholder="Your name" />
          <div><label>Age group</label><select value={profile.age_group || ""} onChange={e => setProfile({ ...profile, age_group: e.target.value })}><option value="">Select</option><option>Under 18</option><option>18–24</option><option>25–34</option><option>35–44</option><option>45–54</option><option>55+</option></select></div>
        </div>

        <h2>Spiritual interests</h2>
        <div className="chip-grid">{["Tarot","Palmistry","Meditation","Astrology","Self-reflection","Personal growth"].map(x => <button type="button" className={`chip ${extras.interests?.includes(x) ? "active" : ""}`} key={x} onClick={() => toggleInterest(x)}>{x}</button>)}</div>

        <h2>Reading preferences</h2>
        <div className="form-grid">
          <div><label>Reading type</label><select value={extras.readingType} onChange={e => setExtras({ ...extras, readingType: e.target.value })}><option>Tarot</option><option>Palm</option><option>Both</option></select></div>
          <div><label>Preferred spread</label><select value={extras.spread} onChange={e => setExtras({ ...extras, spread: e.target.value })}><option>Single Card</option><option>Three Card</option><option>Relationship</option><option>Career</option><option>Celtic Cross</option><option>Life Path</option></select></div>
        </div>

        <h2>Spiritual goal</h2>
        <textarea rows="4" value={extras.goal || ""} onChange={e => setExtras({ ...extras, goal: e.target.value })} placeholder="What would you like your readings to help you reflect on?" />

        <div className="info-box"></div>
        {message && <div className={message.includes("success") ? "success-box" : "error-box"}>{message}</div>}
        <button className="button primary" disabled={saving}><Save size={17} /> {saving ? "Saving…" : "Save profile"}</button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return <div><label>{label}</label><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} /></div>;
}