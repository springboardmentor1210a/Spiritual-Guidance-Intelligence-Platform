import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-line last:border-0">
      <div>
        <p className="text-sm">{label}</p>
        {description && <p className="text-xs text-inkMuted mt-0.5">{description}</p>}
      </div>
      <button
        onClick={onChange}
        className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${
          checked ? "bg-gold" : "bg-line"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-surface transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState({
    daily: true,
    reminders: true,
    updates: false,
  });
  const [privacy, setPrivacy] = useState({ shareHistory: false });

  // Fetch Settings from Firebase
  useEffect(() => {
    if (!user) return;
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().settings) {
          const s = docSnap.data().settings;
          if (s.theme) setTheme(s.theme);
          if (s.notifications) setNotifications(s.notifications);
          if (s.privacy) setPrivacy(s.privacy);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [user]);

  // Save Settings to Firebase
  const saveSettings = async (newSettings) => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        settings: newSettings,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleNotif = (key) => {
    const newNotifs = { ...notifications, [key]: !notifications[key] };
    setNotifications(newNotifs);
    saveSettings({ theme, notifications: newNotifs, privacy });
  };

  const togglePrivacy = () => {
    const newPrivacy = { shareHistory: !privacy.shareHistory };
    setPrivacy(newPrivacy);
    saveSettings({ theme, notifications, privacy: newPrivacy });
  };
  
  const changeTheme = (t) => {
    setTheme(t);
    saveSettings({ theme: t, notifications, privacy });
  };

  if (loading) {
    return <div className="text-inkMuted text-sm">Loading settings...</div>;
  }

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl mb-1">Settings</h1>
          <p className="text-inkMuted text-sm">Manage your preferences and account.</p>
        </div>
        {saving && <span className="text-xs text-gold animate-pulse">Saving changes...</span>}
      </div>

      <Card>
        <h3 className="text-sm text-inkMuted uppercase tracking-wide mb-3">Theme</h3>
        <div className="flex gap-3">
          {["light", "dark"].map((t) => (
            <button
              key={t}
              onClick={() => changeTheme(t)}
              className={`px-4 py-2 rounded-card text-sm capitalize border transition-colors ${
                theme === t
                  ? "bg-gold/10 text-gold border-gold/40"
                  : "text-inkMuted border-line"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {theme === "dark" && (
          <p className="text-xs text-inkMuted mt-2">
            Dark mode isn't wired up yet — this is a placeholder for now.
          </p>
        )}
      </Card>

      <Card>
        <h3 className="text-sm text-inkMuted uppercase tracking-wide mb-2">
          Notification Preferences
        </h3>
        <ToggleRow
          label="Daily guidance notifications"
          checked={notifications.daily}
          onChange={() => toggleNotif("daily")}
        />
        <ToggleRow
          label="Reading reminders"
          checked={notifications.reminders}
          onChange={() => toggleNotif("reminders")}
        />
        <ToggleRow
          label="Platform updates"
          description="News and announcements about new features."
          checked={notifications.updates}
          onChange={() => toggleNotif("updates")}
        />
      </Card>

      <Card>
        <h3 className="text-sm text-inkMuted uppercase tracking-wide mb-2">Privacy</h3>
        <ToggleRow
          label="Share reading history with consultants"
          description="Allows a spiritual consultant to view your reading history if you request guidance."
          checked={privacy.shareHistory}
          onChange={togglePrivacy}
        />
      </Card>

      <Card>
        <h3 className="text-sm text-inkMuted uppercase tracking-wide mb-2">Account</h3>
        <div className="flex gap-3">
          <Button variant="secondary">Change Password</Button>
          <Button variant="ghost" className="text-red-500 hover:text-red-400">
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );
}
