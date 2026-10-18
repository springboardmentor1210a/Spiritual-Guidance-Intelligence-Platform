import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";
import { loadReadings } from "../utils/readingsStorage";
import { ROLES } from "../config/roles";
import {
  User, Star, Sparkles, Check,
  Award, Clock, ShieldCheck, RefreshCw, AlertCircle, UserCog
} from "lucide-react";

const INTEREST_OPTIONS = ["Career", "Relationships", "Personal Growth", "Wellness"];

const SPECIALTY_OPTIONS = [
  "Tarot Reader",
  "Spiritual Consultant",
  "Vedic Astrologer",
  "Palmistry & Intuitive Guide",
  "Chakra & Energy Healer"
];


export default function Profile() {
  const { user, role } = useAuth();

  // Role Guard: Administrator redirection
  const isAdmin =
    role === "Administrator" ||
    role === "admin" ||
    user?.role === "Administrator" ||
    user?.role === "admin";

  if (isAdmin) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  // Role Guard: Check if consultant / expert
  const isExpert =
    role === ROLES.TAROT_READER ||
    role === ROLES.SPIRITUAL_CONSULTANT ||
    user?.role === ROLES.TAROT_READER ||
    user?.role === ROLES.SPIRITUAL_CONSULTANT ||
    (user?.role || "").toLowerCase().includes("consultant") ||
    (user?.role || "").toLowerCase().includes("reader") ||
    Boolean(user?.specialty);

  // Render appropriate view based on role
  if (isExpert) {
    return <ExpertProfileView user={user} role={role} />;
  }

  return <UserProfileView user={user} />;
}

// ============================================================================
// EXPERT PROFILE MANAGEMENT VIEW (FOR CONSULTANTS & READERS ONLY)
// ============================================================================
function ExpertProfileView({ user, role }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Unified expert profile state bound to users/{auth.currentUser.uid}
  const [form, setForm] = useState({
    displayName: "",
    specialty: "Tarot Reader",
    experienceYears: 5,
    bio: "",
    rating: 5.0
  });

  // Real-time live synchronization using onSnapshot
  useEffect(() => {
    const uid = auth.currentUser?.uid || user?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, "users", uid);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm({
            displayName: data.displayName || data.name || user?.displayName || "",
            specialty: data.specialty || data.role || (role === ROLES.TAROT_READER ? "Tarot Reader" : "Spiritual Consultant"),
            experienceYears: data.experienceYears !== undefined
              ? Number(data.experienceYears)
              : (parseInt(data.experience, 10) || 5),
            bio: data.bio || "",
            rating: data.rating !== undefined ? Number(data.rating) : 5.0
          });
        } else {
          setForm({
            displayName: user?.displayName || user?.name || "",
            specialty: role === ROLES.TAROT_READER ? "Tarot Reader" : "Spiritual Consultant",
            experienceYears: 5,
            bio: "",
            rating: 5.0
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error("Live profile onSnapshot error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, role]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    const uid = auth.currentUser?.uid || user?.uid;
    if (!uid) {
      alert("Authentication error: Please log in again.");
      return;
    }

    if (!form.displayName.trim()) {
      alert("Please provide an Expert Display Name.");
      return;
    }
    if (!form.specialty.trim()) {
      alert("Please specify your primary specialty.");
      return;
    }

    setSaving(true);
    setSaveSuccess(false);

    try {
      const expYears = Number(form.experienceYears) || 0;
      const payload = {
        displayName: form.displayName.trim(),
        name: form.displayName.trim(), // backwards compatibility
        specialty: form.specialty.trim(),
        experienceYears: expYears,
        experience: `${expYears} years`, // backwards compatibility
        bio: form.bio.trim(),
        updatedAt: new Date().toISOString()
      };

      // 1. Direct write to authenticated consultant's path: users/{auth.currentUser.uid}
      await setDoc(doc(db, "users", uid), payload, { merge: true });

      // 2. Mirror into consultants/{auth.currentUser.uid} for full ecosystem sync
      try {
        await setDoc(doc(db, "consultants", uid), {
          ...payload,
          rating: form.rating || 5.0,
          active: true
        }, { merge: true });
      } catch (mirrorErr) {
        console.warn("Could not mirror to consultants collection:", mirrorErr);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (error) {
      console.error("Error saving expert profile:", error);
      alert("Failed to update profile: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-inkMuted text-sm py-8">
        <RefreshCw size={16} className="animate-spin text-gold" />
        <span>Loading consultant profile data...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl mb-0.5 flex items-center gap-2 font-display">
              <UserCog className="text-gold" size={24} />
              <span>Consultant Profile Management</span>
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-gold/40 text-gold bg-gold/10 font-medium">
              Live Sync Active
            </span>
          </div>
          <p className="text-inkMuted text-sm">
            Manage your credentials, bio, and client-facing presentation. Changes sync live across the user dashboard.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-inkMuted bg-void px-3 py-1.5 rounded-card border border-line flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Path: <code className="text-gold font-mono text-[11px]">users/{auth.currentUser?.uid?.slice(0, 8)}...</code></span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccess && (
        <div className="p-3.5 rounded-card bg-green-500/10 border border-green-500/40 text-green-400 text-sm flex items-center gap-2.5 animate-fadeIn">
          <Check size={18} className="shrink-0 text-green-400" />
          <div className="flex-1">
            <strong className="font-semibold">Profile Updated Successfully!</strong>
            <p className="text-xs text-inkMuted mt-0.5">
              Your updated name, bio, and specialty are now live in real-time across user guidance and booking selection cards.
            </p>
          </div>
        </div>
      )}

      {/* Profile Editor Card */}
      <Card className="flex flex-col gap-5 border border-line shadow-sm">
            <div className="border-b border-line pb-3">
              <h2 className="text-base font-semibold text-ink flex items-center gap-2">
                <Sparkles size={16} className="text-gold" />
                <span>Expert Profile Information</span>
              </h2>
              <p className="text-xs text-inkMuted mt-0.5">
                This schema aligns directly with user dashboard booking cards and real-time filters.
              </p>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              {/* Expert Display Name */}
              <div>
                <label className="text-xs text-inkMuted uppercase tracking-wider block mb-1.5 font-semibold">
                  Expert Display Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.displayName}
                  onChange={(e) => setForm(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="e.g. Acharya Sharma"
                  className="w-full bg-void border border-line rounded-card px-3 py-2 text-sm text-ink outline-none focus:border-gold transition-colors"
                />
                <span className="text-[11px] text-inkMuted mt-1 block">
                  The primary public name displayed to users booking sessions and requesting guidance.
                </span>
              </div>

              {/* Specialty & Experience Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Specialty Dropdown */}
                <div>
                  <label className="text-xs text-inkMuted uppercase tracking-wider block mb-1.5 font-semibold">
                    Specialty Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.specialty}
                    onChange={(e) => setForm(prev => ({ ...prev, specialty: e.target.value }))}
                    className="w-full bg-void border border-line rounded-card px-3 py-2 text-sm text-ink outline-none focus:border-gold transition-colors"
                  >
                    {SPECIALTY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                    {!SPECIALTY_OPTIONS.includes(form.specialty) && form.specialty && (
                      <option value={form.specialty}>{form.specialty}</option>
                    )}
                  </select>
                  <span className="text-[11px] text-inkMuted mt-1 block">
                    Clients filter by this category.
                  </span>
                </div>

                {/* Years of Experience */}
                <div>
                  <label className="text-xs text-inkMuted uppercase tracking-wider block mb-1.5 font-semibold">
                    Experience (Years)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={form.experienceYears}
                      onChange={(e) => setForm(prev => ({ ...prev, experienceYears: e.target.value }))}
                      className="w-full bg-void border border-line rounded-card px-3 py-2 text-sm text-ink outline-none focus:border-gold transition-colors"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-inkMuted pointer-events-none">
                      years
                    </span>
                  </div>
                  <span className="text-[11px] text-inkMuted mt-1 block">
                    Rendered as "{form.experienceYears || 0} years" on cards.
                  </span>
                </div>
              </div>

              {/* Professional Biography */}
              <div>
                <label className="text-xs text-inkMuted uppercase tracking-wider block mb-1.5 font-semibold">
                  Professional Biography & Approach <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.bio}
                  onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Describe your intuitive background, methodologies (Celtic Cross, Vedic Chakra, Astrological Charts), and how you guide seekers..."
                  className="w-full bg-void border border-line rounded-card px-3 py-2 text-sm text-ink outline-none focus:border-gold transition-colors resize-none leading-relaxed"
                />
                <div className="flex justify-between items-center text-[11px] text-inkMuted mt-1">
                  <span>Displayed as client quotation on preview cards.</span>
                  <span>{form.bio.length} characters</span>
                </div>
              </div>



              {/* Read-Only Rating Metric */}
              <div>
                <label className="text-xs text-inkMuted uppercase tracking-wider block mb-1.5 font-semibold flex items-center justify-between">
                  <span>Aggregate Client Rating (Read-Only)</span>
                  <span className="text-[10px] text-inkMuted flex items-center gap-1 font-normal">
                    <ShieldCheck size={12} className="text-gold" /> Verified Client Metric
                  </span>
                </label>
                <div className="flex items-center justify-between p-3 rounded-card bg-void border border-line">
                  <div className="flex items-center gap-2">
                    <span className="text-gold font-bold text-base flex items-center gap-1">
                      <Star size={16} className="fill-gold text-gold" />
                      {Number(form.rating || 5.0).toFixed(1)} / 5.0
                    </span>
                    <span className="text-xs text-inkMuted">• Based on completed consultation feedback</span>
                  </div>
                  <span className="text-[11px] text-inkMuted font-mono bg-void/80 px-2 py-0.5 rounded border border-line">
                    System Managed
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-line/60 flex items-center gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving}
                  className="flex-1 py-2 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Saving to Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      <span>Save & Synchronize Profile</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
      </Card>
    </div>
  );
}

// ============================================================================
// STANDARD USER PROFILE VIEW (FOR CLIENT USERS)
// ============================================================================
function UserProfileView({ user }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [readings, setReadings] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    ageGroup: "25-34",
    readingPreference: "Both",
    interests: [],
    spiritualGoals: ""
  });

  useEffect(() => {
    let cancelled = false;
    if (!user?.uid) {
      setReadings([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const uid = auth.currentUser?.uid || user.uid;
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (cancelled) return;
        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm({
            name: data.displayName || data.name || user.displayName || "",
            email: data.email || user.email || "",
            ageGroup: data.ageGroup || "25-34",
            readingPreference: data.readingPreference || "Both",
            interests: data.interests || [],
            spiritualGoals: data.spiritualGoals || ""
          });
        } else {
          setForm(prev => ({
            ...prev,
            name: user.displayName || "",
            email: user.email || ""
          }));
        }

        const readingsData = await loadReadings(null, uid);
        if (!cancelled) {
          setReadings(readingsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggleInterest = (interest) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const saveProfile = async () => {
    const uid = auth.currentUser?.uid || user?.uid;
    if (!uid) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "users", uid), {
        ...form,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-inkMuted text-sm">Loading profile...</div>;
  }

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <div>
        <h1 className="text-2xl mb-1">Profile Management</h1>
        <p className="text-inkMuted text-sm">
          Manage your personal details, reading history, and spiritual goals.
        </p>
      </div>

      <Card className="flex flex-col gap-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-inkMuted block mb-1">Name</label>
            <input
              disabled={!editing}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-void border border-line rounded-card px-3 py-2 text-sm outline-none focus:border-gold disabled:opacity-70 transition-colors"
            />
          </div>
          <div>
            <label className="text-sm text-inkMuted block mb-1">Email</label>
            <input
              disabled
              value={form.email}
              className="w-full bg-void border border-line rounded-card px-3 py-2 text-sm outline-none opacity-50 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-sm text-inkMuted block mb-1">Age Group</label>
            <select
              disabled={!editing}
              value={form.ageGroup}
              onChange={(e) => setForm({ ...form, ageGroup: e.target.value })}
              className="w-full bg-void border border-line rounded-card px-3 py-2 text-sm outline-none focus:border-gold disabled:opacity-70 transition-colors"
            >
              {["Under 18", "18-24", "25-34", "35-44", "45+"].map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-inkMuted block mb-1">Reading Preference</label>
            <select
              disabled={!editing}
              value={form.readingPreference}
              onChange={(e) => setForm({ ...form, readingPreference: e.target.value })}
              className="w-full bg-void border border-line rounded-card px-3 py-2 text-sm outline-none focus:border-gold disabled:opacity-70 transition-colors"
            >
              {["Palm", "Tarot", "Both"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm text-inkMuted block mb-2">Spiritual Interests</label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest}
                disabled={!editing}
                onClick={() => toggleInterest(interest)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors disabled:cursor-default ${
                  form.interests.includes(interest)
                    ? "bg-gold/10 text-gold border-gold/40"
                    : "text-inkMuted border-line"
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-inkMuted block mb-1">Goal Management (Spiritual Goals)</label>
          <textarea
            disabled={!editing}
            value={form.spiritualGoals}
            onChange={(e) => setForm({ ...form, spiritualGoals: e.target.value })}
            rows={3}
            className="w-full bg-void border border-line rounded-card px-3 py-2 text-sm outline-none focus:border-gold disabled:opacity-70 transition-colors resize-none"
            placeholder="What are you hoping to achieve through readings?"
          />
        </div>

        <div className="flex gap-3">
          {editing ? (
            <Button variant="primary" onClick={saveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setEditing(true)}>
              Customize Profile
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
