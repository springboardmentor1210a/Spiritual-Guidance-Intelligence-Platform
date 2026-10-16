import {
  Activity,
  Bell,
  BookOpen,
  Brain,
  CheckCircle2,
  Database,
  Eye,
  Fingerprint,
  FileText,
  Globe2,
  History,
  LockKeyhole,
  Moon,
  Monitor,
  Palette,
  ShieldCheck,
  Sparkles,
  Sun,
  TrendingUp,
  UserRound,
  Users,
  CalendarDays,
} from "lucide-react";

import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";


const STORAGE_KEYS = {
  notifications: "arcana_notification_preferences",
  reading: "arcana_reading_preferences",
};


function readStoredObject(key, fallback) {
  try {
    const stored = localStorage.getItem(key);

    if (!stored) {
      return fallback;
    }

    return JSON.parse(stored);
  } catch {
    return fallback;
  }
}


export default function Settings() {

  const { user } = useAuth();

  const {
    theme,
    setTheme,
    resolvedTheme,
  } = useTheme();


  const role = user?.role;


  const roleLabel =
    role === "tarot_reader"
      ? "Tarot Reader"
      : role === "spiritual_consultant"
        ? "Spiritual Consultant"
        : role === "administrator"
          ? "Administrator"
          : "User";


  const [notifications, setNotifications] =
    useState(
      () =>
        readStoredObject(
          STORAGE_KEYS.notifications,
          {
            readingUpdates: true,
            recommendations: true,
            platformAlerts: true,
          }
        )
    );


  const [readingPreferences, setReadingPreferences] =
    useState(
      () =>
        readStoredObject(
          STORAGE_KEYS.reading,
          {
            personalizedInsights: true,
            detailedInterpretation: true,
            trendInsights: true,
          }
        )
    );


  useEffect(() => {

    localStorage.setItem(
      STORAGE_KEYS.notifications,
      JSON.stringify(notifications)
    );

  }, [notifications]);


  useEffect(() => {

    localStorage.setItem(
      STORAGE_KEYS.reading,
      JSON.stringify(readingPreferences)
    );

  }, [readingPreferences]);


  function toggleNotification(key) {

    setNotifications((current) => ({
      ...current,
      [key]: !current[key],
    }));

  }


  function toggleReadingPreference(key) {

    setReadingPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));

  }


  return (
    <div className="page-container">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="dashboard-hero settings-hero">

        <div>

          <div className="eyebrow">
            <Palette size={15} />
            SETTINGS & PREFERENCES
          </div>

          <h1>
            Settings
            <span className="muted-dot">.</span>
          </h1>

          <p>
            Configure your Arcana experience, workspace preferences,
            notifications and account settings.
          </p>

        </div>

        <div className="role-pill">
          <ShieldCheck size={15} />
          {roleLabel}
        </div>

      </section>


      {/* =====================================================
          QUICK OVERVIEW
      ====================================================== */}

      <section className="settings-overview-grid">

        <OverviewCard
          icon={UserRound}
          label="Account"
          value={user?.email || "Not available"}
          note={roleLabel}
        />

        <OverviewCard
          icon={Palette}
          label="Appearance"
          value={
            resolvedTheme === "dark"
              ? "Dark mode"
              : "Light mode"
          }
          note={`Preference: ${theme}`}
        />

        <OverviewCard
          icon={ShieldCheck}
          label="Access level"
          value={roleLabel}
          note="Role-based access enabled"
        />

        <OverviewCard
          icon={Activity}
          label="Platform status"
          value="Operational"
          note="Core services available"
        />

      </section>


      {/* =====================================================
          APPEARANCE
      ====================================================== */}

      <section className="panel settings-panel">

        <SettingsHeading
          icon={Palette}
          kicker="APPEARANCE"
          title="Interface appearance"
          description="Choose how Arcana should look across your entire workspace."
        />


        <div className="theme-options">

          <ThemeOption
            value="dark"
            currentTheme={theme}
            onSelect={setTheme}
            icon={Moon}
            title="Dark"
            description="Premium dark Arcana interface"
          />

          <ThemeOption
            value="light"
            currentTheme={theme}
            onSelect={setTheme}
            icon={Sun}
            title="Light"
            description="Bright and clean interface"
          />

          <ThemeOption
            value="system"
            currentTheme={theme}
            onSelect={setTheme}
            icon={Monitor}
            title="System"
            description="Follow your device preference"
          />

        </div>


        <div className="theme-current-status">

          <span>
            Current appearance
          </span>

          <strong>
            {resolvedTheme === "dark"
              ? "Dark mode"
              : "Light mode"}
          </strong>

        </div>

      </section>


      {/* =====================================================
          ACCOUNT
      ====================================================== */}

      <section className="panel settings-panel">

        <SettingsHeading
          icon={UserRound}
          kicker="ACCOUNT"
          title="Account overview"
          description="Review the identity and access information associated with your account."
        />


        <div className="settings-info-grid">

          <SettingsInfo
            label="Email"
            value={user?.email || "Not available"}
          />

          <SettingsInfo
            label="Platform role"
            value={roleLabel}
          />

          <SettingsInfo
            label="Authentication"
            value="Authenticated"
          />

          <SettingsInfo
            label="Access model"
            value="Role-based access"
          />

          <SettingsInfo
            label="Workspace"
            value="Arcana Intelligence"
          />

          <SettingsInfo
            label="Account state"
            value="Active"
          />

        </div>

      </section>


      {/* =====================================================
          ROLE WORKSPACE
      ====================================================== */}

      <section className="panel settings-panel">

        <SettingsHeading
          icon={ShieldCheck}
          kicker="YOUR WORKSPACE"
          title={`${roleLabel} workspace`}
          description="Features and capabilities available to your authenticated role."
        />


        <div className="settings-capability-grid">

          {getRoleCapabilities(role).map((item) => (

            <CapabilityCard
              key={item.title}
              icon={item.icon}
              title={item.title}
              description={item.description}
              status={item.status}
            />

          ))}

        </div>

      </section>


      {/* =====================================================
          READING PREFERENCES
      ====================================================== */}

      <section className="panel settings-panel">

        <SettingsHeading
          icon={Sparkles}
          kicker="INTELLIGENCE"
          title="Reading & interpretation preferences"
          description="Control the level of intelligence and personalization used across your workspace."
        />


        <div className="settings-toggle-list">

          <PreferenceToggle
            icon={Brain}
            title="Personalized insights"
            description="Use profile information and reading context when generating insights."
            enabled={readingPreferences.personalizedInsights}
            onToggle={() =>
              toggleReadingPreference(
                "personalizedInsights"
              )
            }
          />


          <PreferenceToggle
            icon={BookOpen}
            title="Detailed interpretation"
            description="Show richer explanations for Tarot and spiritual reading results."
            enabled={readingPreferences.detailedInterpretation}
            onToggle={() =>
              toggleReadingPreference(
                "detailedInterpretation"
              )
            }
          />


          <PreferenceToggle
            icon={TrendingUp}
            title="Life trend insights"
            description="Include trend-oriented information in supported intelligence views."
            enabled={readingPreferences.trendInsights}
            onToggle={() =>
              toggleReadingPreference(
                "trendInsights"
              )
            }
          />

        </div>

      </section>


      {/* =====================================================
          NOTIFICATIONS
      ====================================================== */}

      <section className="panel settings-panel">

        <SettingsHeading
          icon={Bell}
          kicker="NOTIFICATIONS"
          title="Notification preferences"
          description="Choose which platform notifications you want to receive."
        />


        <div className="settings-toggle-list">

          <PreferenceToggle
            icon={History}
            title="Reading updates"
            description="Receive updates related to reading activity and saved sessions."
            enabled={notifications.readingUpdates}
            onToggle={() =>
              toggleNotification(
                "readingUpdates"
              )
            }
          />


          <PreferenceToggle
            icon={Sparkles}
            title="Recommendations"
            description="Allow personalized recommendations to appear in your workspace."
            enabled={notifications.recommendations}
            onToggle={() =>
              toggleNotification(
                "recommendations"
              )
            }
          />


          <PreferenceToggle
            icon={Activity}
            title="Platform alerts"
            description="Receive important status and platform-related notifications."
            enabled={notifications.platformAlerts}
            onToggle={() =>
              toggleNotification(
                "platformAlerts"
              )
            }
          />

        </div>

      </section>


      {/* =====================================================
          ROLE-SPECIFIC PREFERENCES
      ====================================================== */}

      <section className="panel settings-panel">

        <SettingsHeading
          icon={Users}
          kicker="ROLE CONFIGURATION"
          title={`${roleLabel} preferences`}
          description="Role-specific configuration areas that can be connected to backend services later."
        />


        <RolePreferenceSection role={role} />

      </section>


      {/* =====================================================
          PRIVACY & SECURITY
      ====================================================== */}

      <section className="panel settings-panel">

        <SettingsHeading
          icon={LockKeyhole}
          kicker="SECURITY"
          title="Privacy & security"
          description="Review the security model protecting your Arcana workspace."
        />


        <div className="settings-security-list">

          <SecurityItem
            icon={ShieldCheck}
            title="Authenticated session"
            text="Your workspace is accessible only after successful platform authentication."
          />

          <SecurityItem
            icon={Users}
            title="Role-based access"
            text="Platform features are presented according to your authenticated role."
          />

          <SecurityItem
            icon={Eye}
            title="Personalized experience"
            text="Your reading preferences are used locally to control the interface experience."
          />

          <SecurityItem
            icon={LockKeyhole}
            title="Local preference storage"
            text="Theme and preference selections are stored locally on this device."
          />

        </div>

      </section>


      {/* =====================================================
          ADMINISTRATOR SETTINGS
      ====================================================== */}

      {role === "administrator" && (

        <section className="panel settings-panel admin-settings-panel">

          <SettingsHeading
            icon={Database}
            kicker="ADMINISTRATOR"
            title="Platform administration"
            description="Administrative areas available for platform monitoring and management."
          />


          <div className="admin-settings-grid">

            <AdminSettingCard
              icon={Users}
              title="User management"
              text="Manage platform users, roles and account access."
            />

            <AdminSettingCard
              icon={Activity}
              title="System monitoring"
              text="Monitor platform services, operational status and system activity."
            />

            <AdminSettingCard
              icon={BookOpen}
              title="Tarot management"
              text="Review Tarot-related platform resources and configuration areas."
            />

            <AdminSettingCard
              icon={Fingerprint}
              title="Palmistry management"
              text="Review palmistry processing and analysis areas."
            />

            <AdminSettingCard
              icon={FileText}
              title="Reports management"
              text="Review platform reporting and generated report workflows."
            />

            <AdminSettingCard
              icon={Globe2}
              title="Platform configuration"
              text="Central administrative configuration can be connected here."
            />

          </div>

        </section>

      )}


      {/* =====================================================
          PLATFORM INFORMATION
      ====================================================== */}

      <section className="panel settings-panel">

        <SettingsHeading
          icon={Globe2}
          kicker="PLATFORM"
          title="Arcana Intelligence"
          description="Platform information and current configuration."
        />


        <div className="settings-platform-list">

          <PlatformRow
            label="Platform"
            value="Palmistry & Tarot Intelligence Platform"
          />

          <PlatformRow
            label="Interface"
            value="Arcana Intelligence"
          />

          <PlatformRow
            label="Theme engine"
            value="Dark / Light / System"
          />

          <PlatformRow
            label="Authentication"
            value="Role-based"
          />

          <PlatformRow
            label="Current role"
            value={roleLabel}
          />

          <PlatformRow
            label="Frontend"
            value="React"
          />

          <PlatformRow
            label="Backend"
            value="FastAPI"
          />

        </div>

      </section>


      <p className="disclaimer">
        Theme and preference selections are stored locally on this device.
        Role-specific administrative controls can be connected to backend services as the platform evolves.
      </p>

    </div>
  );
}


/* =========================================================
   SETTINGS HEADING
========================================================= */

function SettingsHeading({
  icon: Icon,
  kicker,
  title,
  description,
}) {

  return (
    <div className="settings-section-heading">

      <div className="settings-section-icon">
        <Icon size={20} />
      </div>

      <div>

        <span className="section-kicker">
          {kicker}
        </span>

        <h2>
          {title}
        </h2>

        <p>
          {description}
        </p>

      </div>

    </div>
  );
}


/* =========================================================
   OVERVIEW CARD
========================================================= */

function OverviewCard({
  icon: Icon,
  label,
  value,
  note,
}) {

  return (
    <div className="settings-overview-card">

      <div className="settings-overview-icon">
        <Icon size={18} />
      </div>

      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {note}
        </small>

      </div>

    </div>
  );
}


/* =========================================================
   THEME OPTION
========================================================= */

function ThemeOption({
  value,
  currentTheme,
  onSelect,
  icon: Icon,
  title,
  description,
}) {

  const selected =
    currentTheme === value;


  return (
    <button
      type="button"
      className={
        selected
          ? "theme-option selected"
          : "theme-option"
      }
      onClick={() => onSelect(value)}
    >

      <div className="theme-option-icon">
        <Icon size={20} />
      </div>

      <div className="theme-option-content">

        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>

      </div>

      <div
        className={
          selected
            ? "theme-radio active"
            : "theme-radio"
        }
      >

        {selected && <span />}

      </div>

    </button>
  );
}


/* =========================================================
   ACCOUNT INFORMATION
========================================================= */

function SettingsInfo({
  label,
  value,
}) {

  return (
    <div className="settings-info-card">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}


/* =========================================================
   CAPABILITY CARD
========================================================= */

function CapabilityCard({
  icon: Icon,
  title,
  description,
  status,
}) {

  return (
    <div className="settings-capability-card">

      <div className="settings-capability-icon">
        <Icon size={18} />
      </div>

      <div>

        <strong>
          {title}
        </strong>

        <p>
          {description}
        </p>

        <span className="settings-capability-status">
          <CheckCircle2 size={13} />
          {status}
        </span>

      </div>

    </div>
  );
}


/* =========================================================
   ROLE CAPABILITIES
========================================================= */

function getRoleCapabilities(role) {

  if (role === "tarot_reader") {

    return [
      {
        icon: BookOpen,
        title: "Tarot readings",
        description: "Create and work with Tarot reading sessions.",
        status: "Available",
      },
      {
        icon: History,
        title: "Reading history",
        description: "Review available saved reading activity.",
        status: "Available",
      },
      {
        icon: Sparkles,
        title: "AI interpretation",
        description: "Use supported AI interpretation features.",
        status: "Available",
      },
      {
        icon: FileText,
        title: "Reading reports",
        description: "Access supported reading report workflows.",
        status: "Available",
      },
      {
        icon: Brain,
        title: "Personality intelligence",
        description: "Explore personality insights from reading context.",
        status: "Available",
      },
      {
        icon: TrendingUp,
        title: "Life trends",
        description: "Explore supported trend intelligence.",
        status: "Available",
      },
    ];

  }


  if (role === "spiritual_consultant") {

    return [
      {
        icon: Users,
        title: "Consultation workspace",
        description: "Access the consultant-oriented workspace.",
        status: "Available",
      },
      {
        icon: Fingerprint,
        title: "Palm analysis",
        description: "Work with supported palm analysis functionality.",
        status: "Available",
      },
      {
        icon: BookOpen,
        title: "Tarot readings",
        description: "Use Tarot reading functionality for supported workflows.",
        status: "Available",
      },
      {
        icon: Sparkles,
        title: "AI interpretation",
        description: "Access supported interpretation capabilities.",
        status: "Available",
      },
      {
        icon: FileText,
        title: "Reports",
        description: "Access available reading and report workflows.",
        status: "Available",
      },
      {
        icon: CalendarDays,
        title: "Consultant scheduling",
        description: "Scheduling infrastructure can be connected later.",
        status: "Future configuration",
      },
    ];

  }


  if (role === "administrator") {

    return [
      {
        icon: Users,
        title: "User management",
        description: "Administrative user and role management area.",
        status: "Available",
      },
      {
        icon: Activity,
        title: "Platform monitoring",
        description: "Monitor operational platform activity.",
        status: "Available",
      },
      {
        icon: BookOpen,
        title: "Tarot management",
        description: "Administrative Tarot resource area.",
        status: "Available",
      },
      {
        icon: Fingerprint,
        title: "Palmistry management",
        description: "Administrative palmistry resource area.",
        status: "Available",
      },
      {
        icon: FileText,
        title: "Report management",
        description: "Review administrative reporting workflows.",
        status: "Available",
      },
      {
        icon: Database,
        title: "System administration",
        description: "Central platform administration area.",
        status: "Available",
      },
    ];

  }


  return [
    {
      icon: Fingerprint,
      title: "Palm analysis",
      description: "Analyze supported palm reading inputs.",
      status: "Available",
    },
    {
      icon: BookOpen,
      title: "Tarot readings",
      description: "Create supported Tarot reading sessions.",
      status: "Available",
    },
    {
      icon: Sparkles,
      title: "AI interpretation",
      description: "Explore personalized interpretation features.",
      status: "Available",
    },
    {
      icon: History,
      title: "Reading history",
      description: "Review available reading activity.",
      status: "Available",
    },
    {
      icon: Brain,
      title: "Personality intelligence",
      description: "Explore supported personality insights.",
      status: "Available",
    },
    {
      icon: TrendingUp,
      title: "Life trends",
      description: "Explore supported trend intelligence.",
      status: "Available",
    },
  ];
}


/* =========================================================
   ROLE PREFERENCES
========================================================= */

function RolePreferenceSection({
  role,
}) {

  let items;


  if (role === "tarot_reader") {

    items = [
      [
        BookOpen,
        "Tarot reading workflow",
        "Configure future reading workflow preferences.",
      ],
      [
        Users,
        "Reader workspace",
        "Reader-specific workspace configuration.",
      ],
      [
        FileText,
        "Reading reports",
        "Future preferences for report generation and presentation.",
      ],
    ];

  } else if (role === "spiritual_consultant") {

    items = [
      [
        Users,
        "Consultation workflow",
        "Configure future consultation workflow preferences.",
      ],
      [
        Fingerprint,
        "Spiritual domains",
        "Future configuration for supported spiritual analysis areas.",
      ],
      [
        CalendarDays,
        "Schedule preferences",
        "Future availability and consultation scheduling configuration.",
      ],
    ];

  } else if (role === "administrator") {

    items = [
      [
        Users,
        "User administration",
        "Future preferences for administrative user management.",
      ],
      [
        Activity,
        "Monitoring",
        "Future platform monitoring and alert configuration.",
      ],
      [
        Database,
        "System configuration",
        "Future platform-level configuration controls.",
      ],
    ];

  } else {

    items = [
      [
        Sparkles,
        "Personalized experience",
        "Future personalization preferences.",
      ],
      [
        BookOpen,
        "Reading preferences",
        "Future Tarot and palmistry reading preferences.",
      ],
      [
        Brain,
        "Intelligence preferences",
        "Future AI interpretation preferences.",
      ],
    ];

  }


  return (
    <div className="settings-role-list">

      {items.map(
        ([Icon, title, description]) => (

          <div
            className="settings-role-item"
            key={title}
          >

            <div className="settings-role-icon">
              <Icon size={17} />
            </div>

            <div>

              <strong>
                {title}
              </strong>

              <p>
                {description}
              </p>

            </div>

            <span>
              Future configuration
            </span>

          </div>

        )
      )}

    </div>
  );
}


/* =========================================================
   TOGGLE
========================================================= */

function PreferenceToggle({
  icon: Icon,
  title,
  description,
  enabled,
  onToggle,
}) {

  return (
    <div className="settings-toggle-item">

      <div className="settings-toggle-icon">
        <Icon size={18} />
      </div>

      <div className="settings-toggle-content">

        <strong>
          {title}
        </strong>

        <p>
          {description}
        </p>

      </div>

      <button
        type="button"
        className={
          enabled
            ? "settings-switch active"
            : "settings-switch"
        }
        onClick={onToggle}
        aria-pressed={enabled}
        aria-label={`Toggle ${title}`}
      >

        <span />

      </button>

    </div>
  );
}


/* =========================================================
   SECURITY
========================================================= */

function SecurityItem({
  icon: Icon,
  title,
  text,
}) {

  return (
    <div className="settings-security-item">

      <div className="settings-security-icon">
        <Icon size={18} />
      </div>

      <div>

        <strong>
          {title}
        </strong>

        <p>
          {text}
        </p>

      </div>

    </div>
  );
}


/* =========================================================
   ADMIN SETTING
========================================================= */

function AdminSettingCard({
  icon: Icon,
  title,
  text,
}) {

  return (
    <div className="admin-setting-card">

      <div className="admin-setting-icon">
        <Icon size={18} />
      </div>

      <div>

        <strong>
          {title}
        </strong>

        <p>
          {text}
        </p>

      </div>

    </div>
  );
}


/* =========================================================
   PLATFORM ROW
========================================================= */

function PlatformRow({
  label,
  value,
}) {

  return (
    <div className="settings-platform-row">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}


